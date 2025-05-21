import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../../store/features/order/orderSlice";
import { getOrderByIdApi } from "../../api/orderService";
import { logoutApi } from "../../api/authService";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as OrderIcon,
  People as CustomerIcon,
  Assessment as ReportIcon,
  Notifications as NotificationsIcon,
  CheckCircle as ConfirmIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  MonetizationOn as MoneyIcon,
  PendingActions as PendingIcon,
  LocalShipping as ShippingIcon,
  Logout,
} from "@mui/icons-material";

const drawerWidth = 240;

const SaleDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state) => state.order);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleAvatarClick = (event) => {
    setAvatarAnchorEl(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAvatarAnchorEl(null);
  };

  //   const handleLogout = async () => {
  //     try {
  //       await logoutApi();
  //       localStorage.removeItem("accessToken");
  //       dispatch(
  //         syncAuthState({
  //           isAuthenticated: false,
  //           user: null,
  //           accessToken: null,
  //         })
  //       );
  //       navigate("/auth/login");
  //     } catch (error) {
  //       console.error("Logout failed:", error);
  //     }
  //   };

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

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
    if (order.user?.fullName) return order.user.fullName;
    return "Ẩn danh";
  };

  // Hàm gọi API lấy chi tiết đơn hàng
  const handleViewDetail = async (orderId) => {
    if (!orderId) {
      console.error("OrderId không được để trống");
      return;
    }

    setDetailOpen(true);
    setDetailLoading(true);
    setSelectedOrder(null);

    try {
      const res = await getOrderByIdApi(orderId.toString());

      if (res.success && res.data) {
        setSelectedOrder(res.data);
      } else {
        console.error("Failed to fetch order detail:", res.error);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Quick stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered orders
  const filteredOrders = orders.filter(
    (order) =>
      (statusFilter ? order.status === statusFilter : true) &&
      (search
        ? getCustomerName(order).toLowerCase().includes(search.toLowerCase()) ||
          String(order.orderId).includes(search)
        : true)
  );

  // Hàm tạo mã đơn hàng đơn giản
  const generateOrderCode = (order, index) => {
    const date = new Date(order.deliveryDate || order.orderDate);
    const year = date.getFullYear().toString().slice(-2);
    // Tạo số thứ tự 4 chữ số (001, 002, ...)
    const orderNumber = (index + 1).toString().padStart(4, "0");
    return `DH${year}${orderNumber}`;
  };

  const drawer = (
    <div>
      <Toolbar
        sx={{
          p: 0,
          minHeight: "64px !important",
        }}
      >
        <Box
          component="img"
          src="https://quangcaotayninh.com.vn/wp-content/uploads/2020/08/logo-quang-cao-tay-ninh-3.png"
          alt="Logo"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            p: 1,
          }}
        />
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding></ListItem>
        <ListItem disablePadding>
          <ListItemButton selected>
            <ListItemIcon>
              <OrderIcon />
            </ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <CustomerIcon />
            </ListItemIcon>
            <ListItemText primary="Customers" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <ReportIcon />
            </ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Sidebar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "#fff",
          color: "#222",
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Nhân Viên Sale
          </Typography>
          <IconButton color="inherit" onClick={handleMenu}>
            <Badge badgeContent={2} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Bạn có 2 thông báo mới</MenuItem>
          </Menu>
          <IconButton onClick={handleAvatarClick} sx={{ ml: 2 }}>
            <Avatar sx={{ bgcolor: "#1976d2" }}>S</Avatar>
          </IconButton>
          <Menu
            anchorEl={avatarAnchorEl}
            open={Boolean(avatarAnchorEl)}
            onClose={handleAvatarClose}
            onClick={handleAvatarClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Đăng xuất</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {/* Quick Stats */}
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
              background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
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
                  <Typography variant="h4">{totalOrders}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              minWidth: 240,
              background: "linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)",
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
                  <Typography variant="h4">{pendingOrders}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              minWidth: 240,
              background: "linear-gradient(45deg, #4caf50 30%, #81c784 90%)",
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
                  <Typography variant="h4">{confirmedOrders}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              minWidth: 240,
              background: "linear-gradient(45deg, #e91e63 30%, #f48fb1 90%)",
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
                    {totalRevenue.toLocaleString("vi-VN")}₫
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
                <MenuItem value="pending">Chờ xác nhận</MenuItem>
                <MenuItem value="confirmed">Đã xác nhận</MenuItem>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order, idx) => (
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
                            order.status === "pending" ||
                            order.status === "PENDING"
                              ? "Chờ xác nhận"
                              : order.status === "confirmed" ||
                                order.status === "CONFIRMED"
                              ? "Đã xác nhận"
                              : order.status
                          }
                          color={
                            order.status === "pending" ||
                            order.status === "PENDING"
                              ? "warning"
                              : "success"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleViewDetail(order.orderId)}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Dialog xem chi tiết đơn hàng */}
        <Dialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" component="div">
              Chi tiết đơn hàng
            </Typography>
          </DialogTitle>
          <DialogContent>
            {detailLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : selectedOrder ? (
              <Box sx={{ p: { xs: 0, sm: 1 } }}>
                <Grid container spacing={2}>
                  {/* Thông tin đơn hàng & khách hàng */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={2}
                      sx={{ p: 2, borderRadius: 2, height: "100%" }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="black"
                        gutterBottom
                      >
                        Thông tin đơn hàng
                      </Typography>
                      <Box mb={1}>
                        <Typography fontSize={13} color="text.secondary">
                          Mã đơn hàng
                        </Typography>
                        <Typography fontWeight={600} fontSize={18} mb={1}>
                          {generateOrderCode(
                            selectedOrder,
                            filteredOrders.findIndex(
                              (o) => o.orderId === selectedOrder.orderId
                            )
                          )}
                        </Typography>
                        <Typography fontSize={13} color="text.secondary">
                          Ngày đặt hàng
                        </Typography>
                        <Typography fontWeight={500} fontSize={16}>
                          {formatDate(
                            selectedOrder.orderDate ||
                              selectedOrder.deliveryDate
                          )}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={2}
                      sx={{ p: 2, borderRadius: 2, height: "100%" }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="black"
                        gutterBottom
                      >
                        Thông tin khách hàng
                      </Typography>
                      <Box
                        component="ul"
                        sx={{ listStyle: "none", p: 0, m: 0 }}
                      >
                        <Box
                          component="li"
                          display="flex"
                          alignItems="center"
                          mb={1.5}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "primary.main",
                              mr: 1,
                            }}
                          >
                            {selectedOrder.user?.fullName?.[0] || "U"}
                          </Avatar>
                          <Box>
                            <Typography fontSize={13} color="text.secondary">
                              Họ và tên
                            </Typography>
                            <Typography fontWeight={500} fontSize={16}>
                              {selectedOrder.user?.fullName || "Ẩn danh"}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          component="li"
                          display="flex"
                          alignItems="center"
                          mb={1.5}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "info.main",
                              mr: 1,
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="white"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                          </Avatar>
                          <Box>
                            <Typography fontSize={13} color="text.secondary">
                              Email
                            </Typography>
                            <Typography fontWeight={500} fontSize={16}>
                              {selectedOrder.user?.email || "-"}
                            </Typography>
                          </Box>
                        </Box>
                        <Box component="li" display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "success.main",
                              mr: 1,
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="white"
                              viewBox="0 0 24 24"
                            >
                              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" />
                            </svg>
                          </Avatar>
                          <Box>
                            <Typography fontSize={13} color="text.secondary">
                              Số điện thoại
                            </Typography>
                            <Typography fontWeight={500} fontSize={16}>
                              {selectedOrder.user?.phone || "-"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Thông tin thanh toán */}
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="black"
                        gutterBottom
                      >
                        Thông tin thanh toán
                      </Typography>
                      <Box
                        component="ul"
                        sx={{ listStyle: "none", p: 0, m: 0 }}
                      >
                        <Box
                          component="li"
                          display="flex"
                          alignItems="center"
                          mb={1.5}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "primary.main",
                              mr: 1,
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="white"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17c-4.97 0-9-3.03-9-7 0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2 0 3.97-4.03 7-9 7zm0-12c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4z" />
                            </svg>
                          </Avatar>
                          <Box>
                            <Typography fontSize={13} color="text.secondary">
                              Tổng tiền
                            </Typography>
                            <Typography
                              fontWeight={600}
                              fontSize={18}
                              color="primary.main"
                            >
                              {selectedOrder.totalAmount?.toLocaleString(
                                "vi-VN"
                              ) || 0}
                              ₫
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          component="li"
                          display="flex"
                          alignItems="center"
                          mb={1.5}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "success.main",
                              mr: 1,
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="white"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </Avatar>
                          <Box>
                            <Typography fontSize={13} color="text.secondary">
                              Tiền cọc (30%)
                            </Typography>
                            <Typography
                              fontWeight={600}
                              fontSize={18}
                              color="success.main"
                            >
                              {selectedOrder.depositAmount?.toLocaleString(
                                "vi-VN"
                              ) || 0}
                              ₫
                            </Typography>
                          </Box>
                        </Box>
                        <Box component="li" display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "warning.main",
                              mr: 1,
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="white"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-2.83.48-5.48-1.51-5.96-4.34-.08-.48.36-.93.85-.93.42 0 .77.33.85.74.36 1.81 2.06 3.09 3.93 2.73 1.81-.36 3.09-2.06 2.73-3.93-.36-1.81-2.06-3.09-3.93-2.73-.48.08-.93-.36-.93-.85 0-.42.33-.77.74-.85 2.83-.48 5.48 1.51 5.96 4.34.08.48-.36.93-.85.93-.42 0-.77-.33-.85-.74z" />
                            </svg>
                          </Avatar>
                          <Box>
                            <Typography fontSize={13} color="text.secondary">
                              Tiền còn lại
                            </Typography>
                            <Typography
                              fontWeight={600}
                              fontSize={18}
                              color="warning.main"
                            >
                              {selectedOrder.remainingAmount?.toLocaleString(
                                "vi-VN"
                              ) || 0}
                              ₫
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Thông tin bổ sung */}
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="black"
                        gutterBottom
                      >
                        Thông tin bổ sung
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid
                          item
                          xs={12}
                          sm={3}
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Typography
                            fontSize={13}
                            color="text.secondary"
                            mb={0.5}
                          >
                            Trạng thái đơn hàng
                          </Typography>
                          <Chip
                            label={
                              selectedOrder.status === "pending" ||
                              selectedOrder.status === "PENDING"
                                ? "Chờ xác nhận"
                                : selectedOrder.status === "confirmed" ||
                                  selectedOrder.status === "CONFIRMED"
                                ? "Đã xác nhận"
                                : selectedOrder.status
                            }
                            color={
                              selectedOrder.status === "pending" ||
                              selectedOrder.status === "PENDING"
                                ? "warning"
                                : "success"
                            }
                            sx={{ fontWeight: 600, fontSize: 15 }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" p={3}>
                <Typography color="error">
                  Không tìm thấy thông tin đơn hàng
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDetailOpen(false)}
              variant="contained"
              color="primary"
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default SaleDashboard;
