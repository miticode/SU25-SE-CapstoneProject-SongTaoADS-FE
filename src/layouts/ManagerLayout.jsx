import React, { useState, useRef, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/adminLayout.css";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
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
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Fade,
  Paper,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Button,
  Popover,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Assignment as TasksIcon,
  Group as TeamIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon,
  Straighten as StraightenIcon,
  Tune as TuneIcon,
  BuildCircle as BuildCircleIcon,
  ManageAccounts as ManageAccountsIcon,
  List as ListIcon,
  Assignment as AssignmentIcon,
  SupportAgent as SupportAgentIcon,
  Image as ImageIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/features/auth/authSlice";
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
} from "../store/features/notification/notificationSlice";
import { io } from "socket.io-client";
import ProductTypeManager from "../pages/manager/ProductTypeManager";
import ProductSizeManager from "../pages/manager/ProductSizeManager";
import ManagerFineTuneAI from "../pages/manager/ManagerFineTuneAI";
import SizeManager from "../pages/manager/SizeManager";
import ProductAttributeManagement from "../pages/manager/ProductAttributeManager";
import AttributeValueManager from "../pages/manager/AttributeValueManager";
import OrderManager from "../pages/manager/OrderManager";
import DesignTemplateManager from "../pages/manager/DesignTemplateManager";
import BackgroundManager from "../pages/manager/BackgroundManager";
import CostTypeManager from "../pages/manager/CostTypeManager";
import ContractorManagement from "../pages/manager/ContractorManagement";
import SupportManager from "../pages/manager/SupportManager";
// ChatBotTopicManager đã được tích hợp vào ManagerFineTuneAI.jsx
const drawerWidth = 240;

// Define all sidebar menu items for Manager with enhanced styling
const menuItems = [
  {
    id: "dashboard",
    text: "Dashboard",
    icon: <DashboardIcon />,
    color: "#2e7d32",
    description: "Tổng quan hệ thống",
  },
  {
    id: "order-management",
    text: "Quản lý sản xuất",
    icon: <PrecisionManufacturingIcon />,
    color: "#ff6f00",
    description: "Quản lý quá trình sản xuất",
  },
  {
    id: "product",
    text: "Quản lí biển hiệu",
    icon: <ListIcon />,
    color: "#1976d2",
    description: "Quản lý sản phẩm biển hiệu",
    subItems: [
      {
        id: "product-type",
        text: "Loại biển hiệu",
        icon: <CategoryIcon />,
        color: "#1976d2",
      },
      {
        id: "product-size",
        text: "Kích thước biển hiệu",
        icon: <StraightenIcon />,
        color: "#1976d2",
      },
      {
        id: "product-type-attribute",
        text: "Thuộc tính biển hiệu",
        icon: <TuneIcon />,
        color: "#1976d2",
      },
      {
        id: "attribute-value",
        text: "Giá trị thuộc tính",
        icon: <AssignmentIcon />,
        color: "#1976d2",
      },
    ],
  },
  {
    id: "size-management",
    text: "Quản lý kích thước",
    icon: <StraightenIcon />,
    color: "#ff5722",
    description: "Quản lý kích thước sản phẩm",
  },
  {
    id: "cost-type-management",
    text: "Quản lý loại chi phí",
    icon: <ManageAccountsIcon />,
    color: "#795548",
    description: "Quản lý các loại chi phí",
  },
  {
    id: "design-template",
    text: "Quản lý Thiết Kế Mẫu",
    icon: <ImageIcon />,
    color: "#9c27b0",
    description: "Quản lý template thiết kế",
  },
  {
    id: "background-management",
    text: "Quản lý Nền Mẫu",
    icon: <ImageIcon />,
    color: "#e91e63",
    description: "Quản lý background mẫu",
  },
  {
    id: "contractor-management",
    text: "Quản lí đơn vị thi công",
    icon: <BuildCircleIcon />,
    color: "#00bcd4",
    description: "Quản lý các đơn vị thi công",
  },
  {
    id: "fine-tune-ai",
    text: "Tinh chỉnh AI",
    icon: <BuildCircleIcon />,
    color: "#607d8b",
    description: "Tinh chỉnh và quản lý AI chatbot",
  },
  {
    id: "support-ticket",
    text: "Hỗ trợ",
    icon: <SupportAgentIcon />,
    color: "#ff9800",
    description: "Hỗ trợ khách hàng",
  },
  {
    id: "support-system",
    text: "Hỗ trợ (Hệ thống)",
    icon: <SupportAgentIcon />,
    color: "#e91e63",
    description: "Quản lý yêu cầu thiết kế cần hỗ trợ",
  },


];

const ManagerLayout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Notification states
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [alertNotifications, setAlertNotifications] = useState([]);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Notification selectors
  const notifications = useSelector(selectNotifications);
  const roleNotifications = useSelector(selectRoleNotifications);
  const notificationLoading = useSelector(selectNotificationLoading);
  const roleNotificationLoading = useSelector(selectRoleNotificationLoading);
  const unreadCount = useSelector(selectTotalUnreadCount);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Socket.IO ref
  const socketRef = useRef(null);

  // Current active tab state - passed to outlet context
  const [activeTab, setActiveTab] = useState("dashboard");

  // Alert notification functions
  const showAlertNotification = useCallback((notification) => {
    const alertData = {
      id: Date.now() + Math.random(),
      type: notification.roleTarget ? 'role' : 'user',
      title: notification.roleTarget ? 'Thông báo vai trò' : 'Thông báo cá nhân',
      message: notification.message,
      orderCode: notification.roleTarget?.orderCode || notification.userTarget?.orderCode,
      timestamp: notification.createdAt || new Date().toISOString(),
    };

    setAlertNotifications(prev => [...prev, alertData]);

    // Auto close after 5 seconds
    setTimeout(() => {
      setAlertNotifications(prev => prev.filter(alert => alert.id !== alertData.id));
    }, 5000);
  }, []);

  const closeAlertNotification = (alertId) => {
    setAlertNotifications(prev => prev.filter(alert => alert.id !== alertId));
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
        console.log('Disconnecting socket - user not authenticated');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      console.log('Initializing socket connection...');
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const connectionUrl = `${import.meta.env.VITE_SOCKET_URL || 'https://songtaoads.online'}?token=${token}`;
      
      socketRef.current = io(connectionUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      console.log('Connecting to socket:', connectionUrl);

      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully');
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Listen for role-based notifications
      socketRef.current.on('role_notification', (data) => {
        console.log('Role notification received:', data);
        
        const newNotification = {
          notificationId: data.notificationId || Date.now(),
          type: data.type || 'GENERAL',
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
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Thông báo vai trò', {
            body: data.message,
            icon: '/favicon.ico'
          });
        }
      });

      // Listen for user-specific notifications
      socketRef.current.on('user_notification', (data) => {
        console.log('User notification received:', data);
        
        const newNotification = {
          notificationId: data.notificationId || Date.now(),
          type: data.type || 'GENERAL',
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
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Thông báo cá nhân', {
            body: data.message,
            icon: '/favicon.ico'
          });
        }
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
      });
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, dispatch, showAlertNotification]);

  // Request notification permission when component mounts
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Auto-close sidebar on mobile
  React.useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
    if (notification.type === 'ORDER_STATUS_UPDATE' && notification.userTarget?.orderCode) {
      setActiveTab('order-management');
    }
  };

  const handleLogout = async () => {
    try {
      // Clear chatbot history from localStorage
      localStorage.removeItem("ai_chatbot_messages");
      await dispatch(logout()).unwrap();
      handleMenuClose();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      handleMenuClose();
      navigate("/auth/login");
    }
  };

  // Handle menu item click - set active tab instead of navigating
  const handleMenuItemClick = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleMenuExpand = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background:
            "linear-gradient(135deg, #2e7d32 0%, #388e3c 50%, #4caf50 100%)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(4px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        <Toolbar sx={{ minHeight: "70px !important" }}>
          <IconButton
            color="inherit"
            onClick={isMobile ? handleDrawerToggle : undefined}
            edge="start"
            sx={{
              mr: 2,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease",
              cursor: isMobile ? "pointer" : "default",
              opacity: isMobile ? 1 : 0.5,
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
              label="Manager Panel"
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
          </Box>

          {/* Search Bar */}
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 300,
              mr: 2,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "25px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.25)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <IconButton sx={{ p: "10px", color: "white" }}>
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
                color: "white",
                "& input::placeholder": {
                  color: "rgba(255, 255, 255, 0.7)",
                  opacity: 1,
                },
              }}
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>

          <Tooltip title="Thông báo" arrow>
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
          </Tooltip>

          <Tooltip title="Tài khoản" arrow>
            <IconButton
              onClick={handleProfileMenuOpen}
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
                  background:
                    "linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)",
                  border: "3px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                }}
              >
                {user?.fullName?.charAt(0) || user?.name?.charAt(0) || "M"}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{
              mt: "50px",
              "& .MuiPaper-root": {
                borderRadius: "16px",
                minWidth: 200,
                background: "linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)",
                color: "white",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              },
            }}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 300 }}
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
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>

          {/* Notification Popover */}
          <Popover
            open={Boolean(notificationAnchorEl)}
            anchorEl={notificationAnchorEl}
            onClose={handleNotificationMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              mt: 1,
              "& .MuiPaper-root": {
                borderRadius: "16px",
                width: 380,
                maxHeight: 500,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#1e293b", fontWeight: 600 }}>
                Thông báo
              </Typography>
              
              {(notificationLoading || roleNotificationLoading) ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                  {[...notifications, ...roleNotifications]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10)
                    .map((notification, index) => (
                      <Box
                        key={`${notification.source}-${notification.notificationId}-${index}`}
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: "12px",
                          backgroundColor: notification.isRead ? "#f8fafc" : "#e0f2fe",
                          border: notification.isRead ? "1px solid #e2e8f0" : "1px solid #0891b2",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: notification.isRead ? "#f1f5f9" : "#b3e5fc",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Box sx={{ mr: 2, mt: 0.5 }}>
                            {notification.roleTarget ? (
                              <InfoIcon sx={{ color: "#0891b2", fontSize: 20 }} />
                            ) : (
                              <CheckCircleIcon sx={{ color: "#059669", fontSize: 20 }} />
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
                            {(notification.roleTarget?.orderCode || notification.userTarget?.orderCode) && (
                              <Chip
                                label={`Đơn hàng: ${notification.roleTarget?.orderCode || notification.userTarget?.orderCode}`}
                                size="small"
                                sx={{
                                  backgroundColor: "#e0f2fe",
                                  color: "#0891b2",
                                  fontSize: "0.75rem",
                                  mb: 1,
                                }}
                              />
                            )}
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              {new Date(notification.createdAt).toLocaleString('vi-VN')}
                            </Typography>
                          </Box>
                          {!notification.isRead && (
                            <CircleIcon sx={{ color: "#0891b2", fontSize: 8, ml: 1, mt: 1 }} />
                          )}
                        </Box>
                      </Box>
                    ))
                  }
                  
                  {[...notifications, ...roleNotifications].length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Không có thông báo nào
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Popover>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #f8fafc 0%, #e8f5e0 100%)",
            borderRight: "none",
            boxShadow: "4px 0 15px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <Toolbar sx={{ minHeight: "70px !important" }} />
        <Box
          sx={{
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            py: 2,
            px: 1,
          }}
        >
          {!isMobile && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              px={2}
              mb={2}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#4a5568",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Manager Panel
              </Typography>
            </Box>
          )}

          <List sx={{ px: 1 }}>
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <Tooltip title={item.description} placement="right" arrow>
                    <ListItemButton
                      sx={{
                        borderRadius: "12px",
                        minHeight: 48,
                        backgroundColor:
                          activeTab === item.id
                            ? "rgba(46, 125, 50, 0.15)"
                            : "transparent",
                        border:
                          activeTab === item.id
                            ? "2px solid rgba(46, 125, 50, 0.3)"
                            : "2px solid transparent",
                        "&:hover": {
                          backgroundColor:
                            activeTab === item.id
                              ? "rgba(46, 125, 50, 0.2)"
                              : "rgba(46, 125, 50, 0.08)",
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
                          width: activeTab === item.id ? "4px" : "0px",
                          backgroundColor: item.color,
                          transition: "width 0.3s ease",
                        },
                      }}
                      selected={activeTab === item.id}
                      onClick={() => {
                        if (item.subItems) {
                          handleMenuExpand(item.id);
                        } else {
                          handleMenuItemClick(item.id);
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: activeTab === item.id ? item.color : "#64748b",
                          "& svg": {
                            fontSize: "1.3rem",
                            filter:
                              activeTab === item.id
                                ? "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                                : "none",
                          },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: activeTab === item.id ? 700 : 500,
                          color: activeTab === item.id ? "#1e293b" : "#475569",
                          fontSize: "0.95rem",
                        }}
                      />
                      {item.subItems &&
                        (expandedMenu === item.id ? (
                          <ExpandLessIcon sx={{ color: item.color }} />
                        ) : (
                          <ExpandMoreIcon sx={{ color: "#64748b" }} />
                        ))}
                      {activeTab === item.id && !item.subItems && (
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
                  </Tooltip>
                </ListItem>
                {item.subItems && expandedMenu === item.id && (
                  <List component="div" disablePadding sx={{ ml: 2 }}>
                    {item.subItems.map((subItem) => (
                      <ListItem
                        key={subItem.id}
                        disablePadding
                        sx={{ mb: 0.5 }}
                      >
                        <ListItemButton
                          sx={{
                            pl: 2,
                            borderRadius: "8px",
                            minHeight: 40,
                            backgroundColor:
                              activeTab === subItem.id
                                ? "rgba(46, 125, 50, 0.1)"
                                : "transparent",
                            "&:hover": {
                              backgroundColor:
                                activeTab === subItem.id
                                  ? "rgba(46, 125, 50, 0.15)"
                                  : "rgba(46, 125, 50, 0.05)",
                              transform: "translateX(8px)",
                            },
                            transition: "all 0.3s ease",
                            position: "relative",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              left: 0,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "2px",
                              height: activeTab === subItem.id ? "20px" : "0px",
                              backgroundColor: subItem.color,
                              transition: "height 0.3s ease",
                            },
                          }}
                          selected={activeTab === subItem.id}
                          onClick={() => handleMenuItemClick(subItem.id)}
                        >
                          <ListItemText
                            primary={subItem.text}
                            primaryTypographyProps={{
                              fontWeight: activeTab === subItem.id ? 600 : 400,
                              color:
                                activeTab === subItem.id
                                  ? subItem.color
                                  : "#64748b",
                              fontSize: "0.85rem",
                            }}
                          />
                          {activeTab === subItem.id && (
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: subItem.color,
                              }}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </React.Fragment>
            ))}
          </List>

          <Divider sx={{ my: 3, mx: 2, backgroundColor: "#cbd5e1" }} />

          <Box sx={{ mt: "auto", px: 1 }}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)",
                color: "white",
                borderRadius: "16px",
                mb: 2,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Manager Panel
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, fontSize: "0.8rem" }}
                >
                  {user?.fullName || user?.name || "Manager User"}
                </Typography>
                <Box
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                ></Box>
              </CardContent>
            </Card>

            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "2px solid rgba(239, 68, 68, 0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    transform: "translateX(4px)",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LogoutIcon sx={{ color: "#ef4444" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    color: "#ef4444",
                    fontWeight: 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          background:
            "linear-gradient(135deg, #f8fafc 0%, #e8f5e0 50%, #f1f8e9 100%)",
          height: "calc(100vh - 64px)",
          overflow: "auto",
          position: "relative",
          marginLeft: !isMobile && open ? 0 : 0,
          width: !isMobile
            ? open
              ? `calc(100% - ${drawerWidth}px)`
              : "100%"
            : "100%",
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(46, 125, 50, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(129, 199, 132, 0.1) 0%, transparent 50%)
            `,
            pointerEvents: "none",
          },
        }}
      >
        <Toolbar sx={{ minHeight: "70px !important" }} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          {activeTab === "order-management" && <OrderManager />}
          {activeTab === "product-type" && (
            <ProductTypeManager setActiveTab={setActiveTab} />
          )}
          {activeTab === "product-size" && <ProductSizeManager />}
          {activeTab === "fine-tune-ai" && <ManagerFineTuneAI />}
          {activeTab === "size-management" && <SizeManager />}
          {activeTab === "product-type-attribute" && (
            <ProductAttributeManagement />
          )}
          {activeTab === "attribute-value" && <AttributeValueManager />}
          {activeTab === "design-template" && <DesignTemplateManager />}
          {activeTab === "background-management" && <BackgroundManager />}
          {activeTab === "cost-type-management" && <CostTypeManager />}
          {activeTab === "support-ticket" && (
            <Outlet context={{ activeTab, setActiveTab }} />
          )}
          {activeTab === "support-system" && <SupportManager />}
          {/* {activeTab === "chat-bot-topic" && <ChatBotTopicManager />} */}

          {activeTab === "contractor-management" && <ContractorManagement />}
          {activeTab !== "order-management" &&
            activeTab !== "product-type" &&
            activeTab !== "product-size" &&
            activeTab !== "fine-tune-ai" &&
            activeTab !== "size-management" &&
            activeTab !== "product-type-attribute" &&
            activeTab !== "attribute-value" &&
            activeTab !== "design-template" &&
            activeTab !== "background-management" &&
            activeTab !== "cost-type-management" &&
            activeTab !== "support-ticket" &&
            activeTab !== "support-system" &&

            activeTab !== "contractor-management" && (
              <Outlet context={{ activeTab, setActiveTab }} />
            )}
        </Box>
      </Box>

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
            severity={alert.type === 'role' ? 'info' : 'success'}
            onClose={() => closeAlertNotification(alert.id)}
            sx={{
              width: 350,
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: alert.type === 'role' 
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

export default ManagerLayout;
