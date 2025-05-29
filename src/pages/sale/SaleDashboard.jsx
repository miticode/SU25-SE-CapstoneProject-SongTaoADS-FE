import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../../store/features/order/orderSlice";
import { getOrderByIdApi, updateOrderStatusApi } from "../../api/orderService";

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
  const navigate = useNavigate();
  const { orders } = useSelector((state) => state.order);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

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
                Chi tiết đơn hàng #{selectedOrder.id}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Thông tin khách hàng
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography>
                      Tên: {selectedOrder.customer?.name || "N/A"}
                    </Typography>
                    <Typography>
                      Email: {selectedOrder.customer?.email || "N/A"}
                    </Typography>
                    <Typography>
                      Số điện thoại: {selectedOrder.customer?.phone || "N/A"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Thông tin đơn hàng
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography>
                      Tổng tiền: {selectedOrder.totalAmount?.toLocaleString()}{" "}
                      VNĐ
                    </Typography>
                    <Typography>
                      Đặt cọc: {selectedOrder.depositAmount?.toLocaleString()}{" "}
                      VNĐ
                    </Typography>
                    <Typography>
                      Còn lại: {selectedOrder.remainingAmount?.toLocaleString()}{" "}
                      VNĐ
                    </Typography>
                    <Typography>
                      Trạng thái:{" "}
                      <Chip
                        label={
                          selectedOrder.status === "PENDING"
                            ? "Chờ xác nhận"
                            : selectedOrder.status === "APPROVED"
                            ? "Đã xác nhận"
                            : selectedOrder.status === "REJECTED"
                            ? "Đã từ chối"
                            : selectedOrder.status
                        }
                        color={
                          selectedOrder.status === "PENDING"
                            ? "warning"
                            : selectedOrder.status === "APPROVED"
                            ? "success"
                            : selectedOrder.status === "REJECTED"
                            ? "error"
                            : "default"
                        }
                        size="small"
                      />
                    </Typography>
                    <Typography>
                      Ngày tạo:{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>

                {selectedOrder.note && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Ghi chú
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography>{selectedOrder.note}</Typography>
                    </Box>
                  </Grid>
                )}

                {selectedOrder.histories &&
                  selectedOrder.histories.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Lịch sử đơn hàng
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {selectedOrder.histories.map((history, index) => (
                          <Typography key={index} sx={{ mb: 1 }}>
                            {history}
                          </Typography>
                        ))}
                      </Box>
                    </Grid>
                  )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedOrder.status === "PENDING" && (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "REJECTED")
                    }
                    startIcon={<CancelIcon />}
                  >
                    Từ chối
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
              <Button onClick={handleCloseDialog}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SaleDashboard;
