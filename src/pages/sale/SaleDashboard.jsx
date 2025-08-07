import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchOrders,
  fetchOrderById,
  selectCurrentOrder,
  selectCurrentOrderStatus,
  ORDER_STATUS_MAP,
} from "../../store/features/order/orderSlice";
import { logout } from "../../store/features/auth/authSlice";
import {
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
  CircularProgress,
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
  People as PeopleIcon,
  SupportAgent as SupportAgentIcon,
} from "@mui/icons-material";
import CustomerRequests from "./CustomerRequests";
import DesignerChat from "./DesignerChat";
import DashboardContent from "./DashboardContent";
import FeedbackList from "../../components/Feedback/FeedbackList";
import FeedbackDetailDialog from "../../components/Feedback/FeedbackDetailDialog";
import FeedBack from "./FeedBack";
import TicketManager from "./TicketManager";

const drawerWidth = 240;

const SaleDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders } = useSelector((state) => state.order);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [openDialog, setOpenDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("PENDING_CONTRACT");
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);

  const selectedOrder = useSelector(selectCurrentOrder);
  const currentOrderStatus = useSelector(selectCurrentOrderStatus);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleAvatarClick = (event) => {
    setAvatarAnchorEl(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAvatarAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Clear chatbot history from localStorage
      localStorage.removeItem("ai_chatbot_messages");
      await dispatch(logout()).unwrap();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    // Lấy đơn hàng với trạng thái mặc định "PENDING_CONTRACT" khi load trang
    dispatch(fetchOrders("PENDING_CONTRACT"));
  }, [dispatch]);

  // Hàm gọi API lấy chi tiết đơn hàng
  const handleViewDetail = (orderId) => {
    if (!orderId) return;
    dispatch(fetchOrderById(orderId));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatusApi(orderId, { status: newStatus });
      if (res.success) {
        // Refresh orders list with current filter
        if (statusFilter) {
          dispatch(fetchOrders(statusFilter));
        } else {
          dispatch(fetchOrders());
        }
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
    { 
      id: "dashboard", 
      label: "Đơn hàng thiết kế AI", 
      icon: <DashboardIcon />,
      color: "#1976d2",
      description: "Quản lý đơn hàng thiết kế AI"
    },
    {
      id: "customers",
      label: "Đơn hàng thiết kế thủ công",
      icon: <CustomerIcon />,
      color: "#2196f3",
      description: "Quản lý đơn hàng thiết kế thủ công"
    },
    { 
      id: "designer", 
      label: "Quản lí thiết kế", 
      icon: <PaletteIcon />,
      color: "#4caf50",
      description: "Chat với designer"
    },
    { 
      id: "feedback", 
      label: "Feedback", 
      icon: <MoneyIcon />,
      color: "#9c27b0",
      description: "Quản lý phản hồi khách hàng"
    },
    { 
      id: "ticket", 
      label: "Hỗ trợ", 
      icon: <SupportAgentIcon />,
      color: "#f44336",
      description: "Hỗ trợ khách hàng"
    },
  ];

  // Khi filter trạng thái
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    if (status) {
      dispatch(fetchOrders(status));
    } else {
      dispatch(fetchOrders());
    }
  };

  // Hàm refresh danh sách orders
  const handleRefreshOrders = () => {
    if (statusFilter) {
      dispatch(fetchOrders(statusFilter));
    } else {
      dispatch(fetchOrders());
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "customers":
        return <CustomerRequests />;
      case "designer":
        return <DesignerChat />;
      case "feedback":
        return <FeedBack />;
      case "ticket":
        return <TicketManager />;
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
            onRefreshOrders={handleRefreshOrders}
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
          background: "linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #42a5f5 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            p: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "white",
              textAlign: "center",
            }}
          >
            SongTao ADS
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ py: 2, px: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "#4a5568",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            px: 2,
            mb: 2,
          }}
        >
          Sale Panel
        </Typography>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                sx={{
                  borderRadius: "12px",
                  minHeight: 48,
                  backgroundColor:
                    selectedMenu === item.id
                      ? "rgba(25, 118, 210, 0.15)"
                      : "transparent",
                  border:
                    selectedMenu === item.id
                      ? "2px solid rgba(25, 118, 210, 0.3)"
                      : "2px solid transparent",
                  "&:hover": {
                    backgroundColor:
                      selectedMenu === item.id
                        ? "rgba(25, 118, 210, 0.2)"
                        : "rgba(25, 118, 210, 0.08)",
                    transform: "translateX(4px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: selectedMenu === item.id ? "4px" : "0px",
                    backgroundColor: item.color,
                    transition: "width 0.3s ease",
                  },
                }}
                selected={selectedMenu === item.id}
                onClick={() => setSelectedMenu(item.id)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: selectedMenu === item.id ? item.color : "#64748b",
                    "& svg": {
                      fontSize: "1.3rem",
                      filter:
                        selectedMenu === item.id
                          ? "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                          : "none",
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: selectedMenu === item.id ? 700 : 500,
                    color: selectedMenu === item.id ? "#1e293b" : "#475569",
                    fontSize: "0.95rem",
                  }}
                />
                {selectedMenu === item.id && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}`,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </div>
  );

  const handleRejectOrder = async (orderId) => {
    if (!orderId) return;
    try {
      const res = await updateOrderStatusApi(orderId, "CANCELLED");
      if (res.success) {
        // Refresh orders list with current filter
        if (statusFilter) {
          dispatch(fetchOrders(statusFilter));
        } else {
          dispatch(fetchOrders());
        }
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
        // Refresh orders list with current filter
        if (statusFilter) {
          dispatch(fetchOrders(statusFilter));
        } else {
          dispatch(fetchOrders());
        }
        setShowDeliveryPicker(false);
        setOpenDialog(false);
      } else {
        alert(res.error || "Cập nhật ngày giao dự kiến thất bại!");
      }
    } catch {
      alert("Cập nhật ngày giao dự kiến thất bại!");
    } finally {
      setDeliveryLoading(false);
    }
  };

  // Chỉ sử dụng các status mới
  const ORDER_STATUSES = [
    "PENDING_CONTRACT",
    "CONTRACT_SENT",
    "CONTRACT_SIGNED",
    "CONTRACT_DISCUSS",
    "CONTRACT_CONFIRMED",
    "DEPOSITED",
    "IN_PROGRESS",
    "PRODUCING",
    "PRODUCTION_COMPLETED",
    "DELIVERING",
    "INSTALLED",
    "COMPLETED",
    "CANCELLED",
  ];

  return (
    <Box sx={{ display: "flex", bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Sidebar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background:
            "linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #42a5f5 100%)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(4px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        <Toolbar sx={{ minHeight: "70px !important" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: "none" },
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mr: 2,
              }}
            >
              SongTao ADS
            </Typography>
            <Chip
              label="Sale Panel"
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
          </Box>
          <IconButton 
            color="inherit" 
            onClick={handleMenu}
            sx={{
              mr: 2,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <Badge 
              badgeContent={2} 
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#ff4444",
                  color: "white",
                  animation: "pulse 2s infinite",
                },
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              mt: "50px",
              "& .MuiPaper-root": {
                borderRadius: "16px",
                minWidth: 200,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                color: "white",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              },
            }}
          >
            <MenuItem onClick={handleClose} sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
              transition: "all 0.3s ease",
            }}>
              Bạn có 2 thông báo mới
            </MenuItem>
          </Menu>
          <IconButton 
            onClick={handleAvatarClick} 
            sx={{ 
              ml: 1,
              p: 0.5,
              "&:hover": {
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <Avatar 
              sx={{ 
                width: 45,
                height: 45,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                border: "3px solid rgba(255, 255, 255, 0.3)",
                fontSize: "1.2rem",
                fontWeight: 600,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              S
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={avatarAnchorEl}
            open={Boolean(avatarAnchorEl)}
            onClose={handleAvatarClose}
            onClick={handleAvatarClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            sx={{
              mt: "50px",
              "& .MuiPaper-root": {
                borderRadius: "16px",
                minWidth: 200,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                color: "white",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              },
            }}
          >
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: "#ffcccb",
                "&:hover": {
                  backgroundColor: "rgba(255, 0, 0, 0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: "#ffcccb" }} />
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
              background: "linear-gradient(180deg, #f8fafc 0%, #e3f2fd 100%)",
              borderRight: "none",
              boxShadow: "4px 0 15px rgba(0, 0, 0, 0.08)",
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
          background:
            "linear-gradient(135deg, #f8fafc 0%, #e3f2fd 50%, #f1f8fe 100%)",
          minHeight: "100vh",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(25, 118, 210, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(66, 165, 245, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(144, 202, 249, 0.1) 0%, transparent 50%)
            `,
            pointerEvents: "none",
          },
        }}
      >
        <Toolbar sx={{ minHeight: "70px !important" }} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          {renderContent()}
        </Box>
      </Box>

      {/* Order Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {currentOrderStatus === "loading" ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <CircularProgress />
          </Box>
        ) : selectedOrder ? (
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
                          ORDER_STATUS_MAP[selectedOrder.status]?.label ||
                          selectedOrder.status
                        }
                        color={
                          ORDER_STATUS_MAP[selectedOrder.status]?.color ||
                          "default"
                        }
                        size="small"
                        sx={{ fontWeight: 600, fontSize: 15 }}
                      />
                    </Box>
                    <Typography>
                      <b>Ngày tạo:</b>{" "}
                      {selectedOrder.users?.createdAt
                        ? new Date(selectedOrder.users.createdAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : selectedOrder.users?.updatedAt
                        ? new Date(selectedOrder.users.updatedAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", gap: 2, mt: 1 }}>
              {selectedOrder.status === "PENDING_CONTRACT" &&
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
                        handleUpdateStatus(
                          selectedOrder.id,
                          "CONTRACT_CONFIRMED"
                        )
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
        ) : null}
      </Dialog>
    </Box>
  );
};

export default SaleDashboard;
