import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import {
  ShoppingCart as OrderIcon,
  PendingActions as PendingIcon,
  LocalShipping as ShippingIcon,
  MonetizationOn as MoneyIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const DashboardContent = ({ stats, orders = [], onViewDetail }) => {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Hàm format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Hàm lấy tên khách hàng từ userId
  const getCustomerName = (order) => {
    if (order.users?.fullName) return order.users.fullName;
    return "Ẩn danh";
  };

  // Hàm tạo mã đơn hàng đơn giản
  const generateOrderCode = (order, index) => {
    const date = new Date(order.deliveryDate || order.orderDate);
    const year = date.getFullYear().toString().slice(-2);
    const orderNumber = (index + 1).toString().padStart(4, "0");
    return `DH${year}${orderNumber}`;
  };

  // Filtered orders
  const filteredOrders = orders.filter(
    (order) =>
      (statusFilter ? order.status === statusFilter : true) &&
      (search
        ? getCustomerName(order).toLowerCase().includes(search.toLowerCase()) ||
          String(order.orderId).includes(search)
        : true)
  );

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        mb={4}
        sx={{ flexWrap: "wrap" }}
      >
        <Card
          sx={{
            flex: 1,
            minWidth: 240,
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <OrderIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Tổng đơn hàng
                </Typography>
                <Typography variant="h4">{stats.totalOrders}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 240,
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <PendingIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Chờ xử lý
                </Typography>
                <Typography variant="h4">{stats.pendingOrders}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 240,
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <ShippingIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Đã xử lý
                </Typography>
                <Typography variant="h4">{stats.confirmedOrders}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 240,
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <MoneyIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Tổng doanh thu
                </Typography>
                <Typography variant="h4">
                  {stats.totalRevenue.toLocaleString("vi-VN")}₫
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Filter & Search */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Trạng thái"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="pending">Chờ xử lý</MenuItem>
              <MenuItem value="in_progress">Đang thực hiện</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
            </Select>
          </FormControl>
          <TextField
            placeholder="Tìm kiếm theo tên khách hoặc mã đơn"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 220 }}
          />
        </Stack>
      </Card>

      {/* Orders Table */}
      <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Tiền cọc (30%)</TableCell>
                <TableCell>Tiền còn lại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order, idx) => (
                <TableRow key={order.orderId || idx} hover>
                  <TableCell>{generateOrderCode(order, idx)}</TableCell>
                  <TableCell>{getCustomerName(order)}</TableCell>
                  <TableCell>
                    {formatDate(order.orderDate || order.deliveryDate)}
                  </TableCell>
                  <TableCell>
                    {order.totalAmount?.toLocaleString("vi-VN") || 0}₫
                  </TableCell>
                  <TableCell>
                    {order.depositAmount?.toLocaleString("vi-VN") || 0}₫
                  </TableCell>
                  <TableCell>
                    {order.remainingAmount?.toLocaleString("vi-VN") || 0}₫
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        order.status === "pending" || order.status === "PENDING"
                          ? "Chờ xử lý"
                          : order.status === "in_progress"
                          ? "Đang thực hiện"
                          : order.status === "completed"
                          ? "Hoàn thành"
                          : order.status === "rejected"
                          ? "Bị từ chối"
                          : order.status
                      }
                      color={
                        order.status === "pending" || order.status === "PENDING"
                          ? "warning"
                          : order.status === "in_progress"
                          ? "info"
                          : order.status === "completed"
                          ? "success"
                          : order.status === "rejected"
                          ? "error"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => onViewDetail(order.orderId || order.id)}
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default DashboardContent;
