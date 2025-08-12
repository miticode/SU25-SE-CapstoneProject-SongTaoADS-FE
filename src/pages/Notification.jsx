import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  FaBell, 
  FaCircle, 
  FaFilter, 
  FaSync,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import {
  fetchNotifications,
  fetchRoleNotifications,
  selectNotifications,
  selectRoleNotifications,
  selectNotificationLoading,
  selectRoleNotificationLoading,
  selectNotificationError,
  selectRoleNotificationError,
  NOTIFICATION_TYPE_MAP,
} from "../store/features/notification/notificationSlice";
import { markNotificationAsRead } from "../api/notificationService";

const NotificationPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const roleNotifications = useSelector(selectRoleNotifications);
  const loading = useSelector(selectNotificationLoading);
  const roleLoading = useSelector(selectRoleNotificationLoading);
  const error = useSelector(selectNotificationError);
  const roleError = useSelector(selectRoleNotificationError);

  const [currentPage, setCurrentPage] = useState(1);
  const [filterRead, setFilterRead] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [notificationsPerPage] = useState(10);

  // Combine and sort all notifications by date
  const allNotifications = [
    ...notifications.map(n => ({ ...n, source: 'user' })),
    ...roleNotifications.map(n => ({ ...n, source: 'role' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Filter notifications based on read status
  const filteredNotifications = filterRead 
    ? allNotifications.filter(n => n.isRead)
    : allNotifications.filter(n => !n.isRead);

  // Calculate pagination for combined notifications
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const endIndex = startIndex + notificationsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  const isAnyLoading = loading || roleLoading;
  const anyError = error || roleError;

  // Fetch both user and role notifications when component mounts or filters change
  useEffect(() => {
    dispatch(fetchNotifications({ 
      isRead: filterRead, 
      page: 1, 
      size: 50 // Fetch more to have enough data for client-side pagination
    }));
    dispatch(fetchRoleNotifications({ 
      isRead: filterRead, 
      page: 1, 
      size: 50
    }));
  }, [dispatch, filterRead]);

  const handleRefresh = () => {
    dispatch(fetchNotifications({ 
      isRead: filterRead, 
      page: 1, 
      size: 50
    }));
    dispatch(fetchRoleNotifications({ 
      isRead: filterRead, 
      page: 1, 
      size: 50
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (isRead) => {
    setFilterRead(isRead);
    setCurrentPage(1);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Đánh dấu thông báo đã đọc nếu chưa đọc (gọi trực tiếp API để không cập nhật UI)
      if (!notification.isRead && notification.notificationId) {
        console.log('Marking notification as read:', notification.notificationId);
        await markNotificationAsRead(notification.notificationId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded-md text-sm font-medium transition-colors ${
            i === currentPage
              ? 'bg-[#2B2F4A] text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center mt-8 space-x-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trước
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau
        </button>
      </div>
    );
  };

  if (isAnyLoading && allNotifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B2F4A] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="relative">
                <FaBell size={32} className="text-[#2B2F4A] mr-3" />
                {filteredNotifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                    {filteredNotifications.filter(n => !n.isRead).length > 99 ? '99+' : filteredNotifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Thông báo của tôi
                </h1>
                <p className="text-gray-600 mt-1">
                  {filterRead ? "Thông báo đã đọc" : "Thông báo chưa đọc"} 
                  <span className="ml-2 text-sm">({filteredNotifications.length} thông báo)</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isAnyLoading}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
                title="Làm mới"
              >
                <FaSync className={`text-gray-600 ${isAnyLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <FaFilter className="mr-2 text-gray-600" size={14} />
                  <span className="text-sm font-medium text-gray-700">Bộ lọc</span>
                </button>
                
                {showFilter && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          handleFilterChange(false);
                          setShowFilter(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          !filterRead ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <FaCircle size={6} className="text-blue-500 inline mr-2" />
                        Chưa đọc ({allNotifications.filter(n => !n.isRead).length})
                      </button>
                      <button
                        onClick={() => {
                          handleFilterChange(true);
                          setShowFilter(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          filterRead ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <FaEye size={12} className="text-gray-500 inline mr-2" />
                        Đã đọc
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {anyError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FaTimes className="text-red-400 mr-3" />
              <span className="text-red-800">{anyError}</span>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {paginatedNotifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <FaBell size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {filterRead ? "Không có thông báo đã đọc" : "Không có thông báo mới"}
              </h3>
              <p className="text-gray-500">
                {filterRead 
                  ? "Tất cả thông báo của bạn vẫn chưa được đọc."
                  : "Hiện tại bạn không có thông báo mới nào."
                }
              </p>
            </div>
          ) : (
            paginatedNotifications.map((notification) => {
              return (
                <div
                  key={notification.notificationId}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 cursor-pointer ${
                    !notification.isRead 
                      ? 'border-l-blue-500 bg-blue-50' 
                      : 'border-l-gray-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          {!notification.isRead && (
                            <FaCircle size={6} className="text-blue-500 mr-2" />
                          )}
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            Thông báo từ hệ thống
                          </span>
                        
                          <span className="ml-auto text-sm text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-gray-900 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* Target Info */}
                        <div className="space-y-1 text-sm text-gray-600">
                         
                          {notification.userTarget && (
                            <p>
                             
                              {notification.userTarget.orderCode && (
                                <span className="ml-2">
                                  | <span className="font-medium">Mã đơn:</span> {notification.userTarget.orderCode}
                                </span>
                              )}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
};

export default NotificationPage;
