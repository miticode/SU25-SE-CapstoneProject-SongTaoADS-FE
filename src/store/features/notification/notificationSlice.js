import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotificationsApi,
  getRoleNotificationsApi,
  markNotificationAsRead,
} from "../../../api/notificationService";

// Định nghĩa mapping loại thông báo
export const NOTIFICATION_TYPE_MAP = {
  ORDER_STATUS_CHANGED: { label: "Trạng thái đơn hàng thay đổi", color: "info" },
  ORDER_CREATED: { label: "Đơn hàng được tạo", color: "success" },
  ORDER_CANCELLED: { label: "Đơn hàng bị hủy", color: "error" },
  PAYMENT_RECEIVED: { label: "Thanh toán thành công", color: "success" },
  PAYMENT_FAILED: { label: "Thanh toán thất bại", color: "error" },
  CONTRACT_SIGNED: { label: "Hợp đồng được ký", color: "primary" },
  DESIGN_COMPLETED: { label: "Thiết kế hoàn thành", color: "success" },
  GENERAL: { label: "Thông báo chung", color: "default" },
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { isRead, page = 1, size = 10 } = params;
      const response = await getNotificationsApi(isRead, page, size);
      
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch notifications");
    }
  }
);

export const fetchRoleNotifications = createAsyncThunk(
  "notification/fetchRoleNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { isRead, page = 1, size = 10 } = params;
      const response = await getRoleNotificationsApi(isRead, page, size);
      
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch role notifications");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notification/markNotificationRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await markNotificationAsRead(notificationId);
      
      if (response.success) {
        return { notificationId, ...response.data };
      }
      return rejectWithValue(response.error);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to mark notification as read");
    }
  }
);

const initialState = {
  notifications: [], // User notifications
  roleNotifications: [], // Role-based notifications
  loading: false,
  roleLoading: false, // Loading state for role notifications
  markingAsRead: false, // Loading state for marking notification as read
  error: null,
  roleError: null, // Error state for role notifications
  markReadError: null, // Error state for marking notification as read
  lastUpdated: null, // Timestamp của lần cập nhật cuối
  lastMessage: null, // Message từ API response
  unreadCount: 0, // Số lượng thông báo user chưa đọc
  roleUnreadCount: 0, // Số lượng thông báo role chưa đọc
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  },
  rolePagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  },
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.roleError = null;
      state.markReadError = null;
    },
    clearLastMessage: (state) => {
      state.lastMessage = null;
    },
    updateUnreadCount: (state) => {
      state.unreadCount = state.notifications.filter(
        notification => !notification.isRead
      ).length;
      state.roleUnreadCount = state.roleNotifications.filter(
        notification => !notification.isRead
      ).length;
    },
    // Reducer để thêm thông báo real-time từ WebSocket
    addNotificationRealtime: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    // Reducer để thêm thông báo role real-time từ WebSocket
    addRoleNotificationRealtime: (state, action) => {
      state.roleNotifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.roleUnreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
        state.lastUpdated = action.payload.timestamp;
        state.unreadCount = action.payload.notifications.filter(
          notification => !notification.isRead
        ).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch role notifications
      .addCase(fetchRoleNotifications.pending, (state) => {
        state.roleLoading = true;
        state.roleError = null;
      })
      .addCase(fetchRoleNotifications.fulfilled, (state, action) => {
        state.roleLoading = false;
        state.roleNotifications = action.payload.notifications;
        state.rolePagination = action.payload.pagination;
        state.lastUpdated = action.payload.timestamp;
        state.roleUnreadCount = action.payload.notifications.filter(
          notification => !notification.isRead
        ).length;
      })
      .addCase(fetchRoleNotifications.rejected, (state, action) => {
        state.roleLoading = false;
        state.roleError = action.payload;
      })

      // Mark notification as read
      .addCase(markNotificationRead.pending, (state) => {
        state.markingAsRead = true;
        state.markReadError = null;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.markingAsRead = false;
        const { notificationId } = action.payload;
        
        // Update notification in user notifications
        const userNotificationIndex = state.notifications.findIndex(
          notification => notification.notificationId === notificationId
        );
        if (userNotificationIndex !== -1) {
          state.notifications[userNotificationIndex].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        // Update notification in role notifications
        const roleNotificationIndex = state.roleNotifications.findIndex(
          notification => notification.notificationId === notificationId
        );
        if (roleNotificationIndex !== -1) {
          state.roleNotifications[roleNotificationIndex].isRead = true;
          state.roleUnreadCount = Math.max(0, state.roleUnreadCount - 1);
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.markingAsRead = false;
        state.markReadError = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearLastMessage, 
  updateUnreadCount, 
  addNotificationRealtime,
  addRoleNotificationRealtime
} = notificationSlice.actions;

export default notificationSlice.reducer;

// Selectors
export const selectNotifications = (state) => state.notification.notifications;
export const selectRoleNotifications = (state) => state.notification.roleNotifications;
export const selectNotificationLoading = (state) => state.notification.loading;
export const selectRoleNotificationLoading = (state) => state.notification.roleLoading;
export const selectMarkingAsRead = (state) => state.notification.markingAsRead;
export const selectNotificationError = (state) => state.notification.error;
export const selectRoleNotificationError = (state) => state.notification.roleError;
export const selectMarkReadError = (state) => state.notification.markReadError;
export const selectNotificationPagination = (state) => state.notification.pagination;
export const selectRoleNotificationPagination = (state) => state.notification.rolePagination;
export const selectUnreadCount = (state) => state.notification.unreadCount;
export const selectRoleUnreadCount = (state) => state.notification.roleUnreadCount;
export const selectTotalUnreadCount = (state) => 
  state.notification.unreadCount + state.notification.roleUnreadCount;
export const selectLastUpdated = (state) => state.notification.lastUpdated;
export const selectLastMessage = (state) => state.notification.lastMessage;

// Selector để lấy thông báo chưa đọc
export const selectUnreadNotifications = (state) => 
  state.notification.notifications.filter(notification => !notification.isRead);

// Selector để lấy thông báo đã đọc
export const selectReadNotifications = (state) => 
  state.notification.notifications.filter(notification => notification.isRead);

// Selector để lấy thông báo theo loại
export const selectNotificationsByType = (state, type) =>
  state.notification.notifications.filter(notification => notification.type === type);