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
  Container,
  Avatar,
} from "@mui/material";
import {
  ShoppingCart as OrderIcon,
  PendingActions as PendingIcon,
  LocalShipping as ShippingIcon,
  MonetizationOn as MoneyIcon,
  Search as SearchIcon,
  Palette as DesignIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

const DashboardContent = ({ stats = {}, orders = [], onViewDetail }) => {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Default stats for designer
  const defaultStats = {
    totalOrders: stats?.totalOrders || 0,
    pendingOrders: stats?.pendingOrders || 0,
    confirmedOrders: stats?.confirmedOrders || 0,
    totalRevenue: stats?.totalRevenue || 0,
    totalDesigns: stats?.totalDesigns || 0,
    completedDesigns: stats?.completedDesigns || 0,
    pendingDesigns: stats?.pendingDesigns || 0,
  };

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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Card sx={{ 
        mb: 3, 
        background: "linear-gradient(135deg, #2e7d32 0%, #4caf50 50%, #66bb6a 100%)",
        color: "white",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        },
      }}>
        <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar sx={{ 
              bgcolor: "rgba(255, 255, 255, 0.2)", 
              width: 56, 
              height: 56,
              border: "2px solid rgba(255, 255, 255, 0.3)"
            }}>
              <DesignIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Dashboard Thiết Kế
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Tổng quan về công việc thiết kế và hiệu suất
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            overflow: "hidden", 
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
            color: "white",
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: "rgba(255, 255, 255, 0.2)", 
                  width: 48, 
                  height: 48 
                }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontSize: "0.9rem" }}>
                    Tổng yêu cầu
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {defaultStats.totalDesigns}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            overflow: "hidden", 
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            background: "linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%)",
            color: "white",
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: "rgba(255, 255, 255, 0.2)", 
                  width: 48, 
                  height: 48 
                }}>
                  <PendingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontSize: "0.9rem" }}>
                    Chờ xử lý
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {defaultStats.pendingDesigns}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            overflow: "hidden", 
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            background: "linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)",
            color: "white",
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: "rgba(255, 255, 255, 0.2)", 
                  width: 48, 
                  height: 48 
                }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontSize: "0.9rem" }}>
                    Hoàn thành
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {defaultStats.completedDesigns}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            overflow: "hidden", 
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            background: "linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)",
            color: "white",
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: "rgba(255, 255, 255, 0.2)", 
                  width: 48, 
                  height: 48 
                }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontSize: "0.9rem" }}>
                    Doanh thu
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {defaultStats.totalRevenue?.toLocaleString('vi-VN') || 0}₫
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders Table */}
      <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a" }}>
              Yêu cầu thiết kế gần đây
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Danh sách các yêu cầu thiết kế mới nhất
            </Typography>
          </Box>
          
          {filteredOrders.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <DesignIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Không có yêu cầu thiết kế nào
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Hiện tại không có yêu cầu thiết kế nào trong hệ thống
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "#030C20" }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                      Mã yêu cầu
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                      Khách hàng
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                      Trạng thái
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                      Ngày tạo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", textAlign: "center", color: "white" }}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.slice(0, 5).map((order, idx) => (
                    <TableRow 
                      key={order.id || idx} 
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.04)",
                          transform: "scale(1.001)",
                          transition: "all 0.2s ease",
                        },
                        "&:nth-of-type(odd)": {
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {generateOrderCode(order, idx)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {getCustomerName(order)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status || "PENDING"}
                          color={order.status === "COMPLETED" ? "success" : "warning"}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt || order.orderDate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onViewDetail && onViewDetail(order.id)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardContent;
