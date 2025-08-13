import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaBell,
  FaBars,
  FaChevronDown,
  FaSearch,
  FaUserCircle,
  FaCircle,
  FaEye,
  FaTimes,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import logoSongTao from "../assets/logo-songtao.svg";
import { getImageFromS3 } from "../api/s3Service";
import { io } from "socket.io-client";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hideAnnouncement, setHideAnnouncement] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [alertNotifications, setAlertNotifications] = useState([]);

  
  // Socket.IO ref
  const socketRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const notifications = useSelector(selectNotifications);
  const roleNotifications = useSelector(selectRoleNotifications);
  const notificationLoading = useSelector(selectNotificationLoading);
  const roleNotificationLoading = useSelector(selectRoleNotificationLoading);
  const unreadCount = useSelector(selectTotalUnreadCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      setHideAnnouncement(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleLogout = async () => {
    try {
      // Clear chatbot history from localStorage
      localStorage.removeItem("ai_chatbot_messages");
      
      // Disconnect socket before logout
      if (socketRef.current) {
        console.log('Disconnecting socket before logout');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      await dispatch(logout()).unwrap();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setNotificationMenuOpen(false); // Close notification menu when opening user menu
  };

  const toggleNotificationMenu = () => {
    console.log('Toggling notification menu. Current state:', notificationMenuOpen);
    console.log('All notifications count:', allNotifications.length);
    
    setNotificationMenuOpen(!notificationMenuOpen);
    setUserMenuOpen(false); // Close user menu when opening notification menu
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Đánh dấu thông báo đã đọc nếu chưa đọc
      if (!notification.isRead && notification.notificationId) {
        console.log('Marking notification as read:', notification.notificationId);
        await dispatch(markNotificationRead(notification.notificationId));
      }
      
      // Đóng dropdown
      setNotificationMenuOpen(false);
      
      // Navigate based on notification type or content
      if (notification.roleTarget?.orderCode || notification.userTarget?.orderCode) {
        navigate("/order-history");
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Vẫn đóng dropdown và navigate ngay cả khi có lỗi
      setNotificationMenuOpen(false);
      if (notification.roleTarget?.orderCode || notification.userTarget?.orderCode) {
        navigate("/order-history");
      }
    }
  };

  // Combine and sort notifications by date
  const allNotifications = [
    ...notifications.map(n => ({ ...n, source: 'user' })),
    ...roleNotifications.map(n => ({ ...n, source: 'role' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const isAnyNotificationLoading = notificationLoading || roleNotificationLoading;

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  useEffect(() => {
    const closeMenus = () => {
      setUserMenuOpen(false);
      setNotificationMenuOpen(false);
    };

    if (userMenuOpen || notificationMenuOpen) {
      document.addEventListener("click", closeMenus);
    }

    return () => {
      document.removeEventListener("click", closeMenus);
    };
  }, [userMenuOpen, notificationMenuOpen]);

  // Effect để fetch avatar từ S3 khi user thay đổi
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user?.avatar && isAuthenticated) {
        setAvatarLoading(true);
        try {
          const result = await getImageFromS3(user.avatar);
          if (result.success) {
            setAvatarUrl(result.imageUrl);
          } else {
            console.error("Failed to fetch avatar:", result.message);
            setAvatarUrl(null);
          }
        } catch (error) {
          console.error("Error fetching avatar:", error);
          setAvatarUrl(null);
        } finally {
          setAvatarLoading(false);
        }
      } else {
        setAvatarUrl(null);
      }
    };

    fetchUserAvatar();

    // Cleanup function để revoke URL khi component unmount hoặc user thay đổi
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [user?.avatar, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Component Avatar để hiển thị avatar hoặc fallback
  const UserAvatar = ({ size = 20, className = "" }) => {
    if (avatarLoading) {
      return (
        <div className={`rounded-full bg-gray-300 animate-pulse ${className}`} style={{ width: size, height: size }}>
        </div>
      );
    }

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt="User Avatar"
          className={`rounded-full object-cover ${className}`}
          style={{ width: size, height: size }}
          onError={() => {
            console.error("Failed to load avatar image");
            setAvatarUrl(null);
          }}
        />
      );
    }

    return <FaUserCircle size={size} className={`text-[#2B2F4A] ${className}`} />;
  };

  // Alert Notification Item Component
  const AlertNotificationItem = ({ alert, onClose }) => (
    <div className={`
      relative bg-white rounded-xl shadow-2xl border-l-4 
      ${alert.type === 'role' ? 'border-l-blue-500' : 'border-l-green-500'}
      p-4 mb-3 mx-3 sm:mx-0
      w-[calc(100vw-24px)] sm:w-96 max-w-sm
      transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl
      backdrop-blur-sm bg-white/95
      animate-slideInRight
    `}>
      {/* Background gradient overlay */}
      <div className={`
        absolute inset-0 rounded-xl opacity-5 pointer-events-none
        ${alert.type === 'role' 
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
          : 'bg-gradient-to-br from-green-500 to-emerald-600'
        }
      `}></div>
      
      <div className="relative flex items-start space-x-3">
        {/* Icon with animated background */}
        <div className={`
          flex-shrink-0 p-2 rounded-full
          ${alert.type === 'role' 
            ? 'bg-blue-50 ring-2 ring-blue-100' 
            : 'bg-green-50 ring-2 ring-green-100'
          }
          transition-all duration-300 hover:scale-110
        `}>
          {alert.type === 'role' ? (
            <FaInfoCircle className="text-blue-600 animate-pulse" size={18} />
          ) : (
            <FaCheckCircle className="text-green-600 animate-bounce" size={18} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Header with title and close button */}
          <div className="flex items-center justify-between mb-2">
            <h4 className={`
              text-sm sm:text-base font-bold tracking-tight
              ${alert.type === 'role' ? 'text-blue-900' : 'text-green-900'}
              flex items-center space-x-2
            `}>
              <span>{alert.title}</span>
              {alert.type === 'role' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Vai trò
                </span>
              )}
            </h4>
            <button
              onClick={() => onClose(alert.id)}
              className={`
                p-1.5 rounded-full transition-all duration-200 
                hover:bg-gray-100 hover:scale-110 active:scale-95
                text-gray-400 hover:text-gray-600
                focus:outline-none focus:ring-2 focus:ring-gray-300
              `}
            >
              <FaTimes size={12} />
            </button>
          </div>
          
          {/* Message */}
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 font-medium">
            {alert.message}
          </p>
          
          {/* Order code badge */}
          {alert.orderCode && (
            <div className="flex items-center mb-3">
              <div className={`
                inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold
                ${alert.type === 'role'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
                }
                transition-all duration-200 hover:scale-105
              `}>
                <ShoppingCartIcon sx={{ fontSize: 14 }} className="mr-1.5" />
                <span>Đơn hàng: {alert.orderCode}</span>
              </div>
            </div>
          )}
          
          {/* Timestamp */}
          <div className="text-xs text-gray-500 mt-2 font-mono">
            <span>{new Date(alert.timestamp).toLocaleTimeString('vi-VN')}</span>
          </div>
        </div>
      </div>
      
      {/* Subtle bottom border animation */}
      <div className={`
        absolute bottom-0 left-0 h-0.5 rounded-b-xl
        ${alert.type === 'role'
          ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'
          : 'bg-gradient-to-r from-transparent via-green-500 to-transparent'
        }
        animate-pulse w-full
      `}></div>
    </div>
  );

  return (
    <>
      {/* Alert Notifications Container - All slide from right */}
      {alertNotifications.length > 0 && (
        <div className={`
          fixed z-[60] pointer-events-none
          top-4 right-4
          w-full sm:w-auto
          flex flex-col justify-start
          space-y-2 sm:space-y-3
          overflow-hidden
        `}>
          <div className="pointer-events-auto">
            {alertNotifications.map((alert, index) => (
              <div
                key={alert.id}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <AlertNotificationItem
                  alert={alert}
                  onClose={closeAlertNotification}
                />
              </div>
            ))}
          </div>
          
          {/* Mobile backdrop blur overlay (optional) */}
          <div className="sm:hidden fixed inset-0 bg-black/5 backdrop-blur-[1px] pointer-events-none -z-10"></div>
        </div>
      )}

      <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        isScrolled
          ? "shadow-xl bg-white/95 backdrop-blur-lg border-b border-gray-100"
          : "bg-gradient-to-r from-[#f8f9fa] via-[#ffffff] to-[#f1f5f9]"
      }`}
    >
      <div
        className={`text-sm px-4 py-3 flex items-center justify-center bg-[#040C20] text-white transition-all duration-500 overflow-hidden relative ${
          hideAnnouncement ? "max-h-0 py-0 opacity-0" : "max-h-20 opacity-100"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <FaBell className="mr-3 text-yellow-300 animate-bounce" />
        <span className="font-semibold tracking-wide relative z-10">
          Khám phá sức mạnh của AI trong quảng cáo – Tạo thiết kế chuyên nghiệp
          ngay hôm nay!
        </span>
      </div>

      <div
        className={`px-6 py-4 flex items-center justify-between transition-all duration-500 ${
          isScrolled ? "bg-white/95 backdrop-blur-lg" : "bg-transparent"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={logoSongTao}
              alt="Song Tạo ADS Logo"
              className="w-8 h-8 transform hover:rotate-12 transition-all duration-300 hover:scale-110"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <span className="font-black text-transparent text-2xl bg-clip-text bg-gradient-to-r from-[#2B2F4A] via-[#3B4164] to-[#2B2F4A] hover:from-[#3B4164] hover:to-[#2B2F4A] transition-all duration-300">
              Song Tạo ADS
            </span>
            <div className="text-xs text-gray-500 font-medium">
              AI Billboard Generator
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <button
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars size={20} className="text-[#2B2F4A]" />
          </button>
        </div>

        <nav className="hidden md:flex space-x-1 items-center">
          <a
            href="/"
            className="px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-[#2B2F4A]/10 hover:to-[#3B4164]/10 text-gray-700 font-semibold transition-all duration-300 hover:scale-105 relative group"
          >
            <span className="relative z-10">Trang chủ</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </a>
          <div className="relative group">
            <button className="px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-[#2B2F4A]/10 hover:to-[#3B4164]/10 text-gray-700 font-semibold flex items-center space-x-2 transition-all duration-300 hover:scale-105 relative">
              <span className="relative z-10">Giải pháp</span>
              <FaChevronDown
                size={12}
                className="text-gray-500 group-hover:rotate-180 transition-transform duration-300 relative z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>
            <div className="absolute left-0 mt-2 w-56 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-2 group-hover:translate-y-0 border border-gray-100">
              <div className="py-2">
                <a
                  href="#"
                  className="block px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#2B2F4A]/10 hover:to-[#3B4164]/10 transition-all duration-200 hover:text-[#2B2F4A] font-medium rounded-lg mx-2"
                >
                  🤖 Quảng cáo AI
                </a>
                <a
                  href="#"
                  className="block px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#2B2F4A]/10 hover:to-[#3B4164]/10 transition-all duration-200 hover:text-[#2B2F4A] font-medium rounded-lg mx-2"
                >
                  📊 Phân tích dữ liệu
                </a>
                <a
                  href="#"
                  className="block px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#2B2F4A]/10 hover:to-[#3B4164]/10 transition-all duration-200 hover:text-[#2B2F4A] font-medium rounded-lg mx-2"
                >
                  ⚡ Tối ưu hóa quảng cáo
                </a>
              </div>
            </div>
          </div>
          <a
            href="/service"
            className="px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-[#2B2F4A]/10 hover:to-[#3B4164]/10 text-gray-700 font-semibold transition-all duration-300 hover:scale-105 relative group"
          >
            <span className="relative z-10">Dịch vụ</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </a>
          <a
            href="/aboutus"
            className="px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-[#2B2F4A]/10 hover:to-[#3B4164]/10 text-gray-700 font-semibold transition-all duration-300 hover:scale-105 relative group"
          >
            <span className="relative z-10">Giới thiệu</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </a>
          <a
            href="/blog"
            className="px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-[#2B2F4A]/10 hover:to-[#3B4164]/10 text-gray-700 font-semibold transition-all duration-300 hover:scale-105 relative group"
          >
            <span className="relative z-10">Blog</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </a>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <div className="relative group">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2B2F4A]/20 focus:border-[#2B2F4A] text-sm w-40 transition-all duration-300 focus:w-56 bg-white/80 backdrop-blur-sm hover:bg-white group-hover:shadow-lg"
            />
            <FaSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#2B2F4A] transition-colors duration-300"
              size={16}
            />
          </div>
          {isAuthenticated && (
            <>
              <button
                onClick={() => navigate("/order-history")}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Lịch sử đơn hàng"
              >
                <ShoppingCartIcon />
              </button>
              
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNotificationMenu();
                  }}
                  className="relative p-3 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group transform hover:scale-110"
                  title="Thông báo"
                >
                  <FaBell 
                    size={18} 
                    className={`text-gray-600 group-hover:text-blue-600 transition-all duration-300 ${
                      unreadCount > 0 ? 'animate-pulse text-blue-600' : ''
                    }`} 
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-bounce">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {/* Subtle glow effect when there are unread notifications */}
                  {unreadCount > 0 && (
                    <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-pulse"></div>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl ring-1 ring-gray-200 z-50 flex flex-col max-h-96 border border-gray-100 animate-fadeIn backdrop-blur-sm bg-white/95">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0 rounded-t-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FaBell className="text-blue-600" size={16} />
                          <h3 className="text-sm font-bold text-gray-900">Thông báo</h3>
                        </div>
                        <div className="flex items-center space-x-3">
                          {unreadCount > 0 && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium text-red-600">{unreadCount} chưa đọc</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto notification-scroll" style={{ minHeight: '0', maxHeight: '300px' }}>
                      {isAnyNotificationLoading ? (
                        <div className="p-4 space-y-3">
                          {/* Skeleton Loading Animation */}
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-3 h-3 bg-gray-300 rounded-full mt-1"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                                    <div className="h-2 bg-gray-300 rounded w-12"></div>
                                  </div>
                                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : allNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                          <div className="relative">
                            <FaBell size={32} className="text-gray-300 mb-3" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <FaTimes size={6} className="text-white" />
                            </div>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-600 mb-1">Không có thông báo mới</h4>
                          <p className="text-xs text-gray-500 text-center leading-relaxed">
                            Thông báo mới sẽ xuất hiện ở đây khi có cập nhật
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {allNotifications.map((notification, index) => {
                            return (
                              <div
                                key={notification.notificationId}
                                className={`group px-4 py-4 cursor-pointer transition-colors duration-200 ${
                                  !notification.isRead 
                                    ? 'bg-gradient-to-r from-blue-50/50 to-blue-50/30 border-l-4 border-l-blue-500 hover:from-blue-50/70 hover:to-blue-50/50' 
                                    : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                  animationDelay: `${index * 0.05}s`
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 mt-1">
                                    {!notification.isRead ? (
                                      <div className="relative">
                                        <FaCircle size={8} className="text-blue-500 animate-pulse" />
                                        <div className="absolute inset-0 w-6 h-6 bg-blue-500/10 rounded-full animate-ping opacity-25"></div>
                                      </div>
                                    ) : (
                                      <FaEye size={8} className="text-gray-400 mt-1" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                                          <FaBell size={10} className="mr-1" />
                                          Hệ thống
                                        </span>
                                        {!notification.isRead && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                            Mới
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                        {formatTimeAgo(notification.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-900 font-medium leading-relaxed group-hover:text-gray-800 transition-colors" style={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                    }}>
                                      {notification.message}
                                    </p>
                                    {(notification.roleTarget?.orderCode || notification.userTarget?.orderCode) && (
                                      <div className="flex items-center mt-2 text-xs">
                                        <ShoppingCartIcon sx={{ fontSize: 12 }} className="text-green-600 mr-1" />
                                        <span className="text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                          Đơn hàng: {notification.roleTarget?.orderCode || notification.userTarget?.orderCode}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* View All Button - ALWAYS SHOW */}
                    <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex-shrink-0 rounded-b-xl">
                      <button
                        onClick={() => {
                          console.log('Navigating to notifications page...');
                          navigate('/notifications');
                          setNotificationMenuOpen(false);
                        }}
                        className="w-full text-center font-semibold py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
                      >
                        <FaBell size={14} className="group-hover:animate-bounce" />
                        <span>
                          {allNotifications.length > 0 
                            ? `Xem tất cả (${allNotifications.length})`
                            : 'Xem trang thông báo'
                          }
                        </span>
                        {allNotifications.length > 0 && (
                          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{allNotifications.length}</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUserMenu();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <UserAvatar size={20} />
                <span className="font-medium text-gray-700">
                  {user?.fullName || user?.email || "Tài khoản"}
                </span>
                <FaChevronDown size={12} className="text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      to="/payment-history"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Lịch sử thanh toán
                    </Link>
                    <Link
                      to="/my-ticket"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Hỗ trợ
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="px-4 py-2 border border-[#2B2F4A] text-[#2B2F4A] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/auth/signup"
                className="px-4 py-2 bg-custom-secondary text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 bg-white space-y-3 text-gray-700 text-sm font-medium border-t border-gray-100 animate-fadeIn">
          <a href="/" className="block py-2 hover:text-[#2B2F4A]">
            Trang chủ
          </a>
          <div className="py-2">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer hover:text-[#2B2F4A]">
                Giải pháp
                <FaChevronDown
                  size={12}
                  className="text-gray-500 group-open:rotate-180 transition-transform"
                />
              </summary>
              <div className="mt-2 ml-4 space-y-2">
                <a
                  href="#"
                  className="block py-1 text-gray-600 hover:text-[#2B2F4A]"
                >
                  Quảng cáo AI
                </a>
                <a
                  href="#"
                  className="block py-1 text-gray-600 hover:text-[#2B2F4A]"
                >
                  Phân tích dữ liệu
                </a>
                <a
                  href="#"
                  className="block py-1 text-gray-600 hover:text-[#2B2F4A]"
                >
                  Tối ưu hóa quảng cáo
                </a>
              </div>
            </details>
          </div>
          <a href="/service" className="block py-2 hover:text-[#2B2F4A]">
            Dịch vụ
          </a>
          <a href="/aboutus" className="block py-2 hover:text-[#2B2F4A]">
            Về chúng tôi
          </a>
          <a href="/blog" className="block py-2 hover:text-[#2B2F4A]">
            Blog
          </a>

          <div className="pt-3 mt-3">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-8 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B2F4A] focus:border-transparent text-sm"
              />
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={14}
              />
            </div>

            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md mb-2">
                  <UserAvatar size={18} />
                  <span className="font-medium text-gray-700 text-sm">
                    {user?.fullName || user?.email || "Tài khoản"}
                  </span>
                </div>
                
                {/* Mobile Notifications */}
                <div className="mb-3">
                  <button
                    onClick={() => {
                      dispatch(fetchNotifications({ page: 1, size: 15 }));
                      dispatch(fetchRoleNotifications({ page: 1, size: 15 }));
                      navigate('/notifications');
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full px-4 py-2 border border-[#2B2F4A] text-[#2B2F4A] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <FaBell size={16} />
                      <span>Thông báo</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                
                <Link
                  to="/profile"
                  className="block w-full px-4 py-2 border border-[#2B2F4A] text-[#2B2F4A] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors mb-2 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  to="/order-history"
                  className="block w-full px-4 py-2 border border-[#2B2F4A] text-[#2B2F4A] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors mb-2 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Lịch sử đơn hàng
                </Link>
                <Link
                  to="/payment-history"
                  className="block w-full px-4 py-2 border border-[#2B2F4A] text-[#2B2F4A] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors mb-2 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Lịch sử thanh toán
                </Link>
                <Link
                  to="/dashboard"
                  className="block w-full px-4 py-2 border border-[#2B2F4A] text-[#2B2F4A] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors mb-2 text-center"
                >
                  Bảng điều khiển
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors text-center"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="block w-full px-4 py-2 border border-[#2B2F4A] text-[#2B2F4A] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors mb-2 text-center"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth/signup"
                  className="block w-full px-4 py-2 bg-custom-secondary text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity text-center"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
}
