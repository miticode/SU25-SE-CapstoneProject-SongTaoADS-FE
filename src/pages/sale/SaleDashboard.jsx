import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import ErrorBoundary from "../../components/ErrorBoundary";
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
  fetchNotifications,
  fetchRoleNotifications,
  selectNotifications,
  selectRoleNotifications,
  selectNotificationLoading,
  selectRoleNotificationLoading,
  selectTotalUnreadCount,
  addNotificationRealtime,
  addRoleNotificationRealtime,
  markNotificationRead,
  NOTIFICATION_TYPE_MAP,
} from "../../store/features/notification/notificationSlice";
import {
  updateOrderStatusApi,
  saleConfirmOrderApi,
} from "../../api/orderService";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { io } from "socket.io-client";

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
  Popover,
  Alert,
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
  People as PeopleIcon,
  SupportAgent as SupportAgentIcon,
  Close as CloseIcon,
  Circle as CircleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import CustomerRequests from "./CustomerRequests";
import DashboardContent from "./DashboardContent";
import SalesDashboard from "./SalesDashboard";
import FeedbackList from "../../components/Feedback/FeedbackList";
import FeedbackDetailDialog from "../../components/Feedback/FeedbackDetailDialog";
import FeedBack from "./FeedBack";
import TicketManager from "./TicketManager";

const drawerWidth = 240;

const SaleDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, pagination } = useSelector((state) => state.order);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Notification selectors
  const notifications = useSelector(selectNotifications);
  const roleNotifications = useSelector(selectRoleNotifications);
  const notificationLoading = useSelector(selectNotificationLoading);
  const roleNotificationLoading = useSelector(selectRoleNotificationLoading);
  const unreadCount = useSelector(selectTotalUnreadCount);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);

  // Notification states
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [alertNotifications, setAlertNotifications] = useState([]);

  const [selectedMenu, setSelectedMenu] = useState("sales-dashboard");
  const [openDialog, setOpenDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);

  // Socket.IO ref
  const socketRef = useRef(null);

  const selectedOrder = useSelector(selectCurrentOrder);
  const currentOrderStatus = useSelector(selectCurrentOrderStatus);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleAvatarClick = (event) => {
    setAvatarAnchorEl(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAvatarAnchorEl(null);
  };

  // Notification handlers
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await dispatch(markNotificationRead(notification.notificationId));
    }
    handleNotificationMenuClose();

    // Navigate based on notification type or content
    if (
      notification.type === "ORDER_STATUS_UPDATE" &&
      notification.userTarget?.orderCode
    ) {
      setSelectedMenu("dashboard");
    }
  };

  // Alert notification functions
  const showAlertNotification = useCallback((notification) => {
    const alertData = {
      id: Date.now() + Math.random(),
      type: notification.roleTarget ? "role" : "user",
      title: notification.roleTarget
        ? "Thông báo vai trò"
        : "Thông báo cá nhân",
      message: notification.message,
      orderCode:
        notification.roleTarget?.orderCode ||
        notification.userTarget?.orderCode,
      timestamp: notification.createdAt || new Date().toISOString(),
    };

    setAlertNotifications((prev) => [...prev, alertData]);

    // Auto close after 5 seconds
    setTimeout(() => {
      setAlertNotifications((prev) =>
        prev.filter((alert) => alert.id !== alertData.id)
      );
    }, 5000);
  }, []);

  const closeAlertNotification = (alertId) => {
    setAlertNotifications((prev) =>
      prev.filter((alert) => alert.id !== alertId)
    );
  };

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ page: 1, size: 10 }));
      dispatch(fetchRoleNotifications({ page: 1, size: 10 }));
    }
  }, [dispatch, isAuthenticated]);

  // Socket.IO connection for real-time notifications
  useEffect(() => {
    if (!isAuthenticated) {
      // Cleanup socket if user is not authenticated
      if (socketRef.current) {
        console.log("Disconnecting socket - user not authenticated");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      console.log("Initializing socket connection...");
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const connectionUrl = `${
        import.meta.env.VITE_SOCKET_URL || "https://songtaoads.online"
      }?token=${token}`;

      socketRef.current = io(connectionUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      console.log("Connecting to socket:", connectionUrl);

      socketRef.current.on("connect", () => {
        console.log("Socket connected successfully");
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      // Listen for role-based notifications
      socketRef.current.on("role_notification", (data) => {
        console.log("Role notification received:", data);

        const newNotification = {
          notificationId: data.notificationId || Date.now(),
          type: data.type || "GENERAL",
          message: data.message,
          isRead: false,
          createdAt: data.timestamp || new Date().toISOString(),
          roleTarget: data.roleTarget || null,
          userTarget: null,
        };

        // Add to Redux store for ROLE notifications
        dispatch(addRoleNotificationRealtime(newNotification));

        // Show alert notification
        showAlertNotification(newNotification);

        // Show browser notification if supported
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Thông báo vai trò", {
            body: data.message,
            icon: "/favicon.ico",
          });
        }
      });

      // Listen for user-specific notifications
      socketRef.current.on("user_notification", (data) => {
        console.log("User notification received:", data);

        const newNotification = {
          notificationId: data.notificationId || Date.now(),
          type: data.type || "GENERAL",
          message: data.message,
          isRead: false,
          createdAt: data.timestamp || new Date().toISOString(),
          roleTarget: null,
          userTarget: data.userTarget || null,
        };

        // Add to Redux store
        dispatch(addNotificationRealtime(newNotification));

        // Show alert notification
        showAlertNotification(newNotification);

        // Show browser notification if supported
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Thông báo cá nhân", {
            body: data.message,
            icon: "/favicon.ico",
          });
        }
      });

      socketRef.current.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
      });
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, dispatch, showAlertNotification]);

  // Request notification permission when component mounts
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

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
    // Lấy tất cả đơn hàng AI khi load trang (không filter theo trạng thái)
    dispatch(
      fetchOrders({
        orderType: "AI_DESIGN",
        page: 1,
        size: pagination.pageSize || 10,
      })
    );
  }, [dispatch, pagination.pageSize]);

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
        // Refresh orders list with current filter for AI orders only
        if (statusFilter) {
          dispatch(
            fetchOrders({
              orderStatus: statusFilter,
              orderType: "AI_DESIGN",
              page: 1,
              size: 10,
            })
          );
        } else {
          dispatch(
            fetchOrders({
              orderType: "AI_DESIGN",
              page: 1,
              size: 10,
            })
          );
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
      id: "sales-dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
      color: "#e91e63",
      description: "Thống kê tổng quan bán hàng",
    },
    {
      id: "dashboard",
      label: "Đơn hàng thiết kế AI",
      icon: <DashboardIcon />,
      color: "#1976d2",
      description: "Quản lý đơn hàng thiết kế AI",
    },
    {
      id: "customers",
      label: "Đơn hàng thiết kế thủ công",
      icon: <CustomerIcon />,
      color: "#2196f3",
      description: "Quản lý đơn hàng thiết kế thủ công",
    },
    {
      id: "feedback",
      label: "Feedback",
      icon: <MoneyIcon />,
      color: "#9c27b0",
      description: "Quản lý phản hồi khách hàng",
    },
    {
      id: "ticket",
      label: "Hỗ trợ",
      icon: <SupportAgentIcon />,
      color: "#f44336",
      description: "Hỗ trợ khách hàng",
    },
  ];

  // Khi filter trạng thái
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    if (status) {
      dispatch(
        fetchOrders({
          orderStatus: status,
          orderType: "AI_DESIGN",
          page: 1,
          size: pagination.pageSize || 10,
        })
      );
    } else {
      dispatch(
        fetchOrders({
          orderType: "AI_DESIGN",
          page: 1,
          size: pagination.pageSize || 10,
        })
      );
    }
  };

  // Hàm refresh danh sách orders
  const handleRefreshOrders = () => {
    if (statusFilter) {
      dispatch(
        fetchOrders({
          orderStatus: statusFilter,
          orderType: "AI_DESIGN",
          page: pagination.currentPage || 1,
          size: pagination.pageSize || 10,
        })
      );
    } else {
      dispatch(
        fetchOrders({
          orderType: "AI_DESIGN",
          page: pagination.currentPage || 1,
          size: pagination.pageSize || 10,
        })
      );
    }
  };

  // Callback khi thay đổi trang
  const handlePageChange = (newPage) => {
    if (statusFilter) {
      dispatch(
        fetchOrders({
          orderStatus: statusFilter,
          orderType: "AI_DESIGN",
          page: newPage,
          size: pagination.pageSize || 10,
        })
      );
    } else {
      dispatch(
        fetchOrders({
          orderType: "AI_DESIGN",
          page: newPage,
          size: pagination.pageSize || 10,
        })
      );
    }
  };

  // Callback khi thay đổi số dòng mỗi trang
  const handleRowsPerPageChange = (newSize) => {
    if (statusFilter) {
      dispatch(
        fetchOrders({
          orderStatus: statusFilter,
          orderType: "AI_DESIGN",
          page: 1, // Reset về trang đầu khi thay đổi page size
          size: newSize,
        })
      );
    } else {
      dispatch(
        fetchOrders({
          orderType: "AI_DESIGN",
          page: 1,
          size: newSize,
        })
      );
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "sales-dashboard":
        return (
          <ErrorBoundary>
            <SalesDashboard />
          </ErrorBoundary>
        );
      case "customers":
        return (
          <ErrorBoundary>
            <CustomerRequests />
          </ErrorBoundary>
        );
      case "feedback":
        return (
          <ErrorBoundary>
            <FeedBack />
          </ErrorBoundary>
        );
      case "ticket":
        return (
          <ErrorBoundary>
            <TicketManager />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
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
              pagination={pagination}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </ErrorBoundary>
        );
    }
  };

  const drawer = (
    <div>
      <Toolbar
        sx={{
          p: 0,
          minHeight: "64px !important",
          background:
            "linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #42a5f5 100%)",
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
          AI Design Panel
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
        // Refresh AI orders list with current filter
        if (statusFilter) {
          dispatch(
            fetchOrders({
              orderStatus: statusFilter,
              orderType: "AI_DESIGN",
              page: 1,
              size: 10,
            })
          );
        } else {
          dispatch(
            fetchOrders({
              orderType: "AI_DESIGN",
              page: 1,
              size: 10,
            })
          );
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
        // Refresh AI orders list with current filter
        if (statusFilter) {
          dispatch(
            fetchOrders({
              orderStatus: statusFilter,
              orderType: "AI_DESIGN",
              page: 1,
              size: 10,
            })
          );
        } else {
          dispatch(
            fetchOrders({
              orderType: "AI_DESIGN",
              page: 1,
              size: 10,
            })
          );
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
              label="AI Design Panel"
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
            onClick={handleNotificationMenuOpen}
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
              badgeContent={unreadCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#ff4444",
                  color: "white",
                  animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
                },
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          {/* Notification Popover */}
          <Popover
            open={Boolean(notificationAnchorEl)}
            anchorEl={notificationAnchorEl}
            onClose={handleNotificationMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            sx={{
              mt: 1,
              "& .MuiPaper-root": {
                borderRadius: "16px",
                width: 380,
                maxHeight: 500,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1e293b", fontWeight: 600 }}
              >
                Thông báo
              </Typography>

              {notificationLoading || roleNotificationLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box sx={{ maxHeight: 350, overflowY: "auto" }}>
                  {[...notifications, ...roleNotifications]
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .slice(0, 10)
                    .map((notification, index) => (
                      <Box
                        key={`${notification.source}-${notification.notificationId}-${index}`}
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: "12px",
                          backgroundColor: notification.isRead
                            ? "#f8fafc"
                            : "#e0f2fe",
                          border: notification.isRead
                            ? "1px solid #e2e8f0"
                            : "1px solid #0891b2",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: notification.isRead
                              ? "#f1f5f9"
                              : "#b3e5fc",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                          <Box sx={{ mr: 2, mt: 0.5 }}>
                            {notification.roleTarget ? (
                              <InfoIcon
                                sx={{ color: "#0891b2", fontSize: 20 }}
                              />
                            ) : (
                              <CheckCircleIcon
                                sx={{ color: "#059669", fontSize: 20 }}
                              />
                            )}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#1e293b",
                                fontWeight: notification.isRead ? 400 : 600,
                                mb: 0.5,
                              }}
                            >
                              {notification.message}
                            </Typography>
                            {(notification.roleTarget?.orderCode ||
                              notification.userTarget?.orderCode) && (
                              <Chip
                                label={`Đơn hàng: ${
                                  notification.roleTarget?.orderCode ||
                                  notification.userTarget?.orderCode
                                }`}
                                size="small"
                                sx={{
                                  backgroundColor: "#e0f2fe",
                                  color: "#0891b2",
                                  fontSize: "0.75rem",
                                  mb: 1,
                                }}
                              />
                            )}
                            <Typography
                              variant="caption"
                              sx={{ color: "#64748b" }}
                            >
                              {new Date(notification.createdAt).toLocaleString(
                                "vi-VN"
                              )}
                            </Typography>
                          </Box>
                          {!notification.isRead && (
                            <CircleIcon
                              sx={{
                                color: "#0891b2",
                                fontSize: 8,
                                ml: 1,
                                mt: 1,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    ))}

                  {[...notifications, ...roleNotifications].length === 0 && (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Không có thông báo nào
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Popover>
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
        <Box sx={{ position: "relative", zIndex: 1 }}>{renderContent()}</Box>
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
                        ? new Date(
                            selectedOrder.users.createdAt
                          ).toLocaleDateString("vi-VN")
                        : selectedOrder.users?.updatedAt
                        ? new Date(
                            selectedOrder.users.updatedAt
                          ).toLocaleDateString("vi-VN")
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

      {/* Alert Notifications */}
      <Box
        sx={{
          position: "fixed",
          top: 80,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {alertNotifications.map((alert) => (
          <Alert
            key={alert.id}
            severity={alert.type === "role" ? "info" : "success"}
            onClose={() => closeAlertNotification(alert.id)}
            sx={{
              width: 350,
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border:
                alert.type === "role"
                  ? "1px solid rgba(33, 150, 243, 0.3)"
                  : "1px solid rgba(76, 175, 80, 0.3)",
              animation: "slideInRight 0.3s ease-out",
              "@keyframes slideInRight": {
                from: {
                  transform: "translateX(100%)",
                  opacity: 0,
                },
                to: {
                  transform: "translateX(0)",
                  opacity: 1,
                },
              },
            }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {alert.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {alert.message}
              </Typography>
              {alert.orderCode && (
                <Chip
                  label={`Đơn hàng: ${alert.orderCode}`}
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "inherit",
                    fontSize: "0.75rem",
                  }}
                />
              )}
            </Box>
          </Alert>
        ))}
      </Box>
    </Box>
  );
};

export default SaleDashboard;
