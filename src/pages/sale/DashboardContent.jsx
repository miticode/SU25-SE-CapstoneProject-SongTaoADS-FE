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
import { ORDER_STATUS_MAP } from "../../store/features/order/orderSlice";

const DashboardContent = ({
  stats,
  orders = [],
  onViewDetail,
  statusFilter,
  onStatusFilterChange,
}) => {
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
  const filteredOrders = orders.filter((order) =>
    search
      ? getCustomerName(order).toLowerCase().includes(search.toLowerCase()) ||
        String(order.orderId).includes(search)
      : true
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
                  Chờ xác nhận
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
                  Đã xác nhận
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
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="PENDING_CONTRACT">Chờ hợp đồng</MenuItem>
              <MenuItem value="CONTRACT_SENT">Đã gửi hợp đồng</MenuItem>
              <MenuItem value="CONTRACT_SIGNED">Đã ký hợp đồng</MenuItem>
              <MenuItem value="CONTRACT_DISCUSS">Đàm phán hợp đồng</MenuItem>
              <MenuItem value="CONTRACT_CONFIRMED">Xác nhận hợp đồng</MenuItem>
              <MenuItem value="DEPOSITED">Đã đặt cọc</MenuItem>
              <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
              <MenuItem value="PRODUCING">Đang sản xuất</MenuItem>
              <MenuItem value="PRODUCTION_COMPLETED">
                Hoàn thành sản xuất
              </MenuItem>
              <MenuItem value="DELIVERING">Đang giao hàng</MenuItem>
              <MenuItem value="INSTALLED">Đã lắp đặt</MenuItem>
              <MenuItem value="COMPLETED">Hoàn tất</MenuItem>
              <MenuItem value="CANCELLED">Đã hủy</MenuItem>
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
                        ORDER_STATUS_MAP[order.status]?.label || order.status
                      }
                      color={ORDER_STATUS_MAP[order.status]?.color || "default"}
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
