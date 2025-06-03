import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import HistoryIcon from "@mui/icons-material/History";
import { getOrdersByUserIdApi } from "../api/orderService";
import { getProfileApi } from "../api/authService";

const statusMap = {
  APPROVED: { label: "Đã xác nhận", color: "success" },
  CONFIRMED: { label: "Đã xác nhận", color: "success" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  PENDING: { label: "Chờ xác nhận", color: "warning" },
  DEPOSITED: { label: "Đã đặt cọc", color: "info" },
  COMPLETED: { label: "Hoàn tất", color: "primary" },
  CANCELLED: { label: "Đã bị hủy", color: "error" },
};

const OrderHistory = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        let userId;

        if (!user?.id) {
          const profileRes = await getProfileApi();
          if (!profileRes.success || !profileRes.data?.id) {
            setError(
              "Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại."
            );
            setLoading(false);
            return;
          }
          userId = profileRes.data.id;
        } else {
          userId = user.id;
        }

        const ordersRes = await getOrdersByUserIdApi(userId);

        if (ordersRes.success) {
          setOrders(ordersRes.data);
        } else {
          setError(ordersRes.error || "Không thể lấy lịch sử đơn hàng.");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Có lỗi xảy ra khi tải lịch sử đơn hàng.");
      }
      setLoading(false);
    };
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated, user]);

  const handleDeposit = (order) => {
    navigate("/checkout", {
      state: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        depositAmount: order.depositAmount,
        remainingAmount: order.remainingAmount,
        orderDate: order.orderDate,
        status: order.status,
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h6" color="error">
          Vui lòng đăng nhập để xem lịch sử đơn hàng.
        </Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" py={4} px={2}>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <HistoryIcon color="primary" fontSize="large" />
        <Typography variant="h5" fontWeight={700}>
          Lịch sử đơn hàng
        </Typography>
      </Stack>
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : orders.length === 0 ? (
        <Typography>Không có đơn hàng nào.</Typography>
      ) : (
        <Stack spacing={2}>
          {orders.map((order) => (
            <Card key={order.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography fontWeight={600}>Mã đơn: {order.id}</Typography>
                    <Typography color="text.secondary" fontSize={14}>
                      Ngày đặt:{" "}
                      {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                    </Typography>
                    <Typography color="text.secondary" fontSize={14}>
                      Tổng tiền:{" "}
                      {order.totalAmount?.toLocaleString("vi-VN") || 0}₫
                    </Typography>
                    {order.status === "DEPOSITED" && (
                      <>
                        <Typography color="success.main" fontSize={14}>
                          Đã đặt cọc:{" "}
                          {order.depositAmount?.toLocaleString("vi-VN") || 0}₫
                        </Typography>
                        <Typography color="info.main" fontSize={14}>
                          Còn lại:{" "}
                          {order.remainingAmount?.toLocaleString("vi-VN") || 0}₫
                        </Typography>
                      </>
                    )}
                    {order.deliveryDate && (
                      <Typography color="primary.main" fontSize={14}>
                        Ngày giao dự kiến:{" "}
                        {new Date(order.deliveryDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={statusMap[order.status]?.label || order.status}
                      color={statusMap[order.status]?.color || "default"}
                    />
                    {["APPROVED", "CONFIRMED", "PENDING"].includes(
                      (order.status || "").toUpperCase()
                    ) && (
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={() => handleDeposit(order)}
                      >
                        ĐẶT CỌC
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default OrderHistory;
