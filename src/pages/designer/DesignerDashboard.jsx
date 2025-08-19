import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
} from "../../store/features/notification/notificationSlice";
import {
  fetchDesignerDashboard,
  selectDesignerDashboard,
  selectDashboardStatus,
  selectDashboardError,
} from "../../store/features/dashboard/dashboardSlice";
import { io } from "socket.io-client";
import {
  Logout as LogoutIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import DesignRequests from "./DesignRequests";
import SaleChat from "./SaleChat";
import DashboardContent from "./DashboardContent";
import IconManager from "./IconManager";

const DesignerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Auth selectors
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Notification selectors
  const notifications = useSelector(selectNotifications);
  const roleNotifications = useSelector(selectRoleNotifications);
  const notificationLoading = useSelector(selectNotificationLoading);
  const roleNotificationLoading = useSelector(selectRoleNotificationLoading);
  const unreadCount = useSelector(selectTotalUnreadCount);
  
  // Dashboard selectors
  const designerDashboard = useSelector(selectDesignerDashboard);
  const dashboardStatus = useSelector(selectDashboardStatus);
  const dashboardError = useSelector(selectDashboardError);
  
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Notification states
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [alertNotifications, setAlertNotifications] = useState([]);

  // Socket.IO ref
  const socketRef = useRef(null);

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
    if (notification.type === 'DESIGN_REQUEST' && notification.userTarget?.orderCode) {
      setSelectedMenu('designs');
    }
  };

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

  // Fetch notifications and dashboard data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ page: 1, size: 10 }));
      dispatch(fetchRoleNotifications({ page: 1, size: 10 }));
      dispatch(fetchDesignerDashboard());
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

  const handleMenuItemClick = (menuId) => {
    setSelectedMenu(menuId);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return (
          <DashboardContent 
            stats={designerDashboard} 
            loading={dashboardStatus === 'loading'}
            error={dashboardError}
          />
        );
      case "designs":
        return <DesignRequests />;
      case "chat":
        return <SaleChat />;
      case "icons":
        return <IconManager />;
      default:
        return (
          <DashboardContent 
            stats={designerDashboard} 
            loading={dashboardStatus === 'loading'}
            error={dashboardError}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-3 md:px-6 md:py-4 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            SongTao ADS
          </h1>
          <div className="hidden sm:block">
            <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Designer Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          {/* Search Bar */}
          <div className="hidden lg:flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden w-64 xl:w-80">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="flex-1 px-3 py-2 bg-transparent text-white placeholder-white/70 focus:outline-none text-sm"
            />
            <button className="p-2 text-white hover:bg-white/10 transition-colors">
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Search Button */}
          <button className="lg:hidden p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all transform hover:scale-105">
            <SearchIcon className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleNotificationMenuOpen}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all transform hover:scale-105 relative"
            >
              <NotificationsIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User Avatar */}
          <button
            onClick={handleAvatarClick}
            className="p-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all transform hover:scale-105"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
              D
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-20 left-4 z-50">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div className="fixed left-0 top-0 h-full w-64 bg-white z-50 md:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { id: "dashboard", text: "Dashboard", color: "green", icon: "📊" },
                    { id: "designs", text: "Yêu cầu thiết kế", color: "blue", icon: "🎨" },
                    { id: "chat", text: "Chat với Sale", color: "orange", icon: "💬" },
                    { id: "icons", text: "Quản lý Icon", color: "purple", icon: "🎯" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleMenuItemClick(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3
                        ${
                          selectedMenu === item.id
                            ? `${item.color === 'green' ? 'bg-green-50 text-green-700 border-2 border-green-200' : 
                               item.color === 'blue' ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' :
                               item.color === 'orange' ? 'bg-orange-50 text-orange-700 border-2 border-orange-200' :
                               'bg-purple-50 text-purple-700 border-2 border-purple-200'} font-semibold`
                            : "text-gray-700 border-2 border-transparent hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sidebar */}
        <div className="hidden md:block w-60 lg:w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Menu</h2>
            <div className="space-y-2">
              {[
                { id: "dashboard", text: "Dashboard", color: "green", icon: "📊" },
                { id: "designs", text: "Yêu cầu thiết kế", color: "blue", icon: "🎨" },
                { id: "chat", text: "Chat với Sale", color: "orange", icon: "💬" },
                { id: "icons", text: "Quản lý Icon", color: "purple", icon: "🎯" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`
                    w-full text-left p-3 rounded-xl transition-all duration-300 transform hover:translate-x-1 flex items-center gap-3
                    ${
                      selectedMenu === item.id
                        ? `${item.color === 'green' ? 'bg-green-50 text-green-700 border-2 border-green-200' : 
                           item.color === 'blue' ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' :
                           item.color === 'orange' ? 'bg-orange-50 text-orange-700 border-2 border-orange-200' :
                           'bg-purple-50 text-purple-700 border-2 border-purple-200'} font-semibold`
                        : "text-gray-700 border-2 border-transparent hover:bg-gray-50"
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {renderContent()}
        </div>
      </div>

      {/* Notification Popover */}
      {notificationAnchorEl && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleNotificationMenuClose}></div>
          <div className="fixed z-50 top-16 right-4 w-80 sm:w-96 max-h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Thông báo</h3>
            </div>
            
            {(notificationLoading || roleNotificationLoading) ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {[...notifications, ...roleNotifications]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 10)
                  .map((notification, index) => (
                    <div
                      key={`${notification.source}-${notification.notificationId}-${index}`}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md
                        ${notification.isRead ? 'bg-white' : 'bg-blue-50 border-l-4 border-l-blue-500'}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {notification.roleTarget ? (
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                              <InfoIcon className="w-3 h-3 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircleIcon className="w-3 h-3 text-green-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-gray-800 ${notification.isRead ? 'font-normal' : 'font-medium'} mb-1`}>
                            {notification.message}
                          </p>
                          {(notification.roleTarget?.orderCode || notification.userTarget?.orderCode) && (
                            <div className="inline-block mb-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Đơn hàng: {notification.roleTarget?.orderCode || notification.userTarget?.orderCode}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))
                }
                
                {[...notifications, ...roleNotifications].length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Không có thông báo nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* User Menu */}
      {avatarAnchorEl && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleAvatarClose}></div>
          <div className="fixed z-50 top-16 right-4 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogoutIcon className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </>
      )}

      {/* Alert Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-xs sm:max-w-sm">
        {alertNotifications.map((alert) => (
          <div
            key={alert.id}
            className={`
              p-4 rounded-xl shadow-2xl border backdrop-blur-sm animate-slide-in-right
              ${alert.type === 'role' 
                ? 'bg-blue-50/95 border-blue-200 text-blue-800' 
                : 'bg-green-50/95 border-green-200 text-green-800'
              }
            `}
            style={{
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                <p className="text-sm mb-2 leading-relaxed">{alert.message}</p>
                {alert.orderCode && (
                  <div className="inline-block">
                    <span className="px-2 py-1 bg-white/60 rounded-full text-xs font-medium">
                      Đơn hàng: {alert.orderCode}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => closeAlertNotification(alert.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DesignerDashboard;
