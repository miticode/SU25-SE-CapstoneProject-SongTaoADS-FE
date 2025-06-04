import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../store/features/order/orderSlice";
import { ALL_ORDER_STATUSES } from "../../store/features/order/orderSlice";
import {
  getOrderByIdApi,
  updateOrderStatusApi,
  saleConfirmOrderApi,
} from "../../api/orderService";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

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
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Chip,
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
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Message as MessageIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import CustomerRequests from "./CustomerRequests";
import DesignerChat from "./DesignerChat";
import DashboardContent from "./DashboardContent";

const drawerWidth = 240;

const SaleDashboard = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);

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
    // Lấy tất cả đơn hàng với mọi trạng thái khi load trang
    dispatch(fetchOrders(ALL_ORDER_STATUSES));
  }, [dispatch]);

  // Hàm gọi API lấy chi tiết đơn hàng
  const handleViewDetail = async (orderId) => {
    if (!orderId) {
      console.error("OrderId không được để trống");
      return;
    }

    try {
      const res = await getOrderByIdApi(orderId.toString());
      if (res.success && res.data) {
        setSelectedOrder(res.data);
        setOpenDialog(true);
      } else {
        console.error("Failed to fetch order detail:", res.error);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatusApi(orderId, { status: newStatus });
      if (res.success) {
        // Refresh orders list
        dispatch(fetchOrders());
        // Close dialog
        handleCloseDialog();
      } else {
        console.error("Failed to update order status:", res.error);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Quick stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const menuItems = [
    { id: "dashboard", label: "Đơn hàng", icon: <DashboardIcon /> },
    { id: "customers", label: "Yêu cầu khách hàng", icon: <CustomerIcon /> },
    { id: "designer", label: "Quản lí thiết kế", icon: <PaletteIcon /> },
  ];

  // Khi filter trạng thái
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    if (status) {
      dispatch(fetchOrders(status));
    } else {
      dispatch(fetchOrders(ALL_ORDER_STATUSES));
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "customers":
        return <CustomerRequests />;
      case "designer":
        return <DesignerChat />;
      default:
        return (
          <DashboardContent
            stats={{
              totalOrders,
              pendingOrders,
              confirmedOrders,
              totalRevenue,
            }}
            orders={orders}
            onViewDetail={handleViewDetail}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
          />
        );
    }
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
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={selectedMenu === item.id}
              onClick={() => setSelectedMenu(item.id)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const handleRejectOrder = async (orderId) => {
    if (!orderId) return;
    try {
      const res = await updateOrderStatusApi(orderId, "CANCELLED");
      if (res.success) {
        dispatch(fetchOrders(ALL_ORDER_STATUSES));
        handleCloseDialog();
      } else {
        alert(res.error || "Cập nhật trạng thái thất bại!");
      }
    } catch {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const handleConfirmDeliveryDate = async () => {
    if (!selectedOrder?.id || !deliveryDate) return;
    setDeliveryLoading(true);
    try {
      const res = await saleConfirmOrderApi(selectedOrder.id, { deliveryDate });
      if (res.success) {
        dispatch(fetchOrders());
        setShowDeliveryPicker(false);
        setOpenDialog(false);
      } else {
        alert(res.error || "Cập nhật ngày giao dự kiến thất bại!");
      }
    } catch (err) {
      alert("Cập nhật ngày giao dự kiến thất bại!");
    } finally {
      setDeliveryLoading(false);
    }
  };

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
        {renderContent()}
      </Box>

      {/* Order Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Typography variant="h6" component="div">
                Chi tiết đơn hàng
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Thông tin khách hàng
                  </Typography>
                  <Box
                    sx={{
                      pl: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {/* <Avatar
                      src={selectedOrder.users?.avatar?.url}
                      alt={selectedOrder.users?.fullName}
                      sx={{
                        width: 64,
                        height: 64,
                        mr: 2,
                        bgcolor: "grey.200",
                        fontSize: 32,
                      }}
                    /> */}
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 0.5 }}
                      >
                        {selectedOrder.users?.fullName || "N/A"}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                        Email:{" "}
                        <span style={{ color: "#222" }}>
                          {selectedOrder.users?.email || "N/A"}
                        </span>
                      </Typography>
                      <Typography color="text.secondary">
                        Số điện thoại:{" "}
                        <span style={{ color: "#222" }}>
                          {selectedOrder.users?.phone || "N/A"}
                        </span>
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
                    borderLeft: { md: "1px solid #eee" },
                    pl: { md: 4, xs: 2 },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Thông tin đơn hàng
                  </Typography>
                  <Box sx={{ pl: 0 }}>
                    <Typography sx={{ mb: 0.5 }}>
                      <b>Tổng tiền:</b>{" "}
                      <span style={{ color: "#1976d2" }}>
                        {selectedOrder.totalAmount?.toLocaleString()} VNĐ
                      </span>
                    </Typography>
                    <Typography sx={{ mb: 0.5 }}>
                      <b>Đặt cọc:</b>{" "}
                      {selectedOrder.depositAmount?.toLocaleString() || 0} VNĐ
                    </Typography>
                    <Typography sx={{ mb: 0.5 }}>
                      <b>Còn lại:</b>{" "}
                      {selectedOrder.remainingAmount?.toLocaleString() || 0} VNĐ
                    </Typography>
                    {selectedOrder.deliveryDate && (
                      <Typography sx={{ mb: 0.5 }} color="primary.main">
                        <b>Ngày giao dự kiến:</b>{" "}
                        {new Date(
                          selectedOrder.deliveryDate
                        ).toLocaleDateString("vi-VN")}
                      </Typography>
                    )}
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <Typography sx={{ mr: 1 }}>
                        <b>Trạng thái:</b>
                      </Typography>
                      <Chip
                        label={
                          selectedOrder.status === "PENDING"
                            ? "Chờ xác nhận"
                            : selectedOrder.status === "APPROVED"
                            ? "Đã xác nhận"
                            : selectedOrder.status === "REJECTED"
                            ? "Đã từ chối"
                            : selectedOrder.status === "CANCELLED"
                            ? "Đã hủy"
                            : selectedOrder.status
                        }
                        color={
                          selectedOrder.status === "PENDING"
                            ? "warning"
                            : selectedOrder.status === "APPROVED"
                            ? "success"
                            : selectedOrder.status === "REJECTED" ||
                              selectedOrder.status === "CANCELLED"
                            ? "error"
                            : "default"
                        }
                        size="small"
                        sx={{ fontWeight: 600, fontSize: 15 }}
                      />
                    </Box>
                    <Typography>
                      <b>Ngày tạo:</b>{" "}
                      {selectedOrder.orderDate
                        ? new Date(selectedOrder.orderDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", gap: 2, mt: 1 }}>
              {selectedOrder.status === "PENDING" &&
                selectedOrder.isCustomDesign && (
                  <>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRejectOrder(selectedOrder.id)}
                      startIcon={<CancelIcon />}
                    >
                      TỪ CHỐI
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, "APPROVED")
                      }
                      startIcon={<CheckCircleIcon />}
                    >
                      Xác nhận
                    </Button>
                  </>
                )}
              {selectedOrder.status === "DEPOSITED" && (
                <>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => setShowDeliveryPicker(true)}
                  >
                    Báo ngày giao dự kiến
                  </Button>
                  <Dialog
                    open={showDeliveryPicker}
                    onClose={() => setShowDeliveryPicker(false)}
                  >
                    <DialogTitle>Báo ngày giao dự kiến</DialogTitle>
                    <DialogContent>
                      <DatePicker
                        label="Ngày giao dự kiến"
                        value={deliveryDate}
                        onChange={setDeliveryDate}
                        disablePast
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setShowDeliveryPicker(false)}>
                        Hủy
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmDeliveryDate}
                        disabled={!deliveryDate || deliveryLoading}
                      >
                        Xác nhận
                      </Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
              <Button onClick={handleCloseDialog}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SaleDashboard;
