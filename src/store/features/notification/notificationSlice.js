import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotificationsApi,
  getRoleNotificationsApi,
  markNotificationAsRead,
  sendNotificationToUser,
  sendNotificationToRole,
  sendNewOrderNotification,
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

export const sendNotificationToUserThunk = createAsyncThunk(
  "notification/sendNotificationToUser",
  async ({ userId, message }, { rejectWithValue }) => {
    try {
      const response = await sendNotificationToUser(userId, message);
      
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send notification to user");
    }
  }
);

export const sendNotificationToRoleThunk = createAsyncThunk(
  "notification/sendNotificationToRole",
  async ({ role, message }, { rejectWithValue }) => {
    try {
      const response = await sendNotificationToRole(role, message);
      
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send notification to role");
    }
  }
);

// Gửi thông báo đơn hàng mới theo orderCode
export const sendNewOrderNotificationThunk = createAsyncThunk(
  "notification/sendNewOrderNotification",
  async (orderCode, { rejectWithValue }) => {
    try {
      const response = await sendNewOrderNotification(orderCode);
      if (response.success) {
        return response.data; // { result, timestamp, message }
      }
      return rejectWithValue(response.error);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send new order notification");
    }
  }
);

const initialState = {
  notifications: [], // User notifications
  roleNotifications: [], // Role-based notifications
  loading: false,
  roleLoading: false, // Loading state for role notifications
  markingAsRead: false, // Loading state for marking notification as read
  sendingNotification: false, // Loading state for sending notification
  sendingRoleNotification: false, // Loading state for sending notification to role
  error: null,
  roleError: null, // Error state for role notifications
  markReadError: null, // Error state for marking notification as read
  sendNotificationError: null, // Error state for sending notification
  sendRoleNotificationError: null, // Error state for sending notification to role
  lastUpdated: null, // Timestamp của lần cập nhật cuối
  lastMessage: null, // Message từ API response
  sendNotificationMessage: null, // Message from send notification API
  sendRoleNotificationMessage: null, // Message from send role notification API
  sendNewOrderNotificationMessage: null, // Message from new order notification API
  sendingNewOrderNotification: false,
  sendNewOrderNotificationError: null,
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
      state.sendNotificationError = null;
      state.sendRoleNotificationError = null;
    },
    clearLastMessage: (state) => {
      state.lastMessage = null;
    },
    clearSendNotificationMessage: (state) => {
      state.sendNotificationMessage = null;
    },
    clearSendRoleNotificationMessage: (state) => {
      state.sendRoleNotificationMessage = null;
    },
    clearSendNewOrderNotificationMessage: (state) => {
      state.sendNewOrderNotificationMessage = null;
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
      })

      // Send notification to user
      .addCase(sendNotificationToUserThunk.pending, (state) => {
        state.sendingNotification = true;
        state.sendNotificationError = null;
        state.sendNotificationMessage = null;
      })
      .addCase(sendNotificationToUserThunk.fulfilled, (state, action) => {
        state.sendingNotification = false;
        state.sendNotificationMessage = action.payload.message;
        state.lastUpdated = action.payload.timestamp;
      })
      .addCase(sendNotificationToUserThunk.rejected, (state, action) => {
        state.sendingNotification = false;
        state.sendNotificationError = action.payload;
      })

      // Send notification to role
      .addCase(sendNotificationToRoleThunk.pending, (state) => {
        state.sendingRoleNotification = true;
        state.sendRoleNotificationError = null;
        state.sendRoleNotificationMessage = null;
      })
      .addCase(sendNotificationToRoleThunk.fulfilled, (state, action) => {
        state.sendingRoleNotification = false;
        state.sendRoleNotificationMessage = action.payload.message;
        state.lastUpdated = action.payload.timestamp;
      })
      .addCase(sendNotificationToRoleThunk.rejected, (state, action) => {
        state.sendingRoleNotification = false;
        state.sendRoleNotificationError = action.payload;
      })
      // Send new order notification
      .addCase(sendNewOrderNotificationThunk.pending, (state) => {
        state.sendingNewOrderNotification = true;
        state.sendNewOrderNotificationError = null;
        state.sendNewOrderNotificationMessage = null;
      })
      .addCase(sendNewOrderNotificationThunk.fulfilled, (state, action) => {
        state.sendingNewOrderNotification = false;
        state.sendNewOrderNotificationMessage = action.payload.message;
        state.lastUpdated = action.payload.timestamp;
        // Nếu server trả về một notification object trong result, có thể thêm vào danh sách
        if (action.payload.result && action.payload.result.notificationId) {
          state.notifications.unshift(action.payload.result);
          if (!action.payload.result.isRead) {
            state.unreadCount += 1;
          }
        }
      })
      .addCase(sendNewOrderNotificationThunk.rejected, (state, action) => {
        state.sendingNewOrderNotification = false;
        state.sendNewOrderNotificationError = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearLastMessage,
  clearSendNotificationMessage,
  clearSendRoleNotificationMessage,
  clearSendNewOrderNotificationMessage,
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
export const selectSendingNotification = (state) => state.notification.sendingNotification;
export const selectSendingRoleNotification = (state) => state.notification.sendingRoleNotification;
export const selectNotificationError = (state) => state.notification.error;
export const selectRoleNotificationError = (state) => state.notification.roleError;
export const selectMarkReadError = (state) => state.notification.markReadError;
export const selectSendNotificationError = (state) => state.notification.sendNotificationError;
export const selectSendRoleNotificationError = (state) => state.notification.sendRoleNotificationError;
export const selectNotificationPagination = (state) => state.notification.pagination;
export const selectRoleNotificationPagination = (state) => state.notification.rolePagination;
export const selectUnreadCount = (state) => state.notification.unreadCount;
export const selectRoleUnreadCount = (state) => state.notification.roleUnreadCount;
export const selectTotalUnreadCount = (state) => 
  state.notification.unreadCount + state.notification.roleUnreadCount;
export const selectLastUpdated = (state) => state.notification.lastUpdated;
export const selectLastMessage = (state) => state.notification.lastMessage;
export const selectSendNotificationMessage = (state) => state.notification.sendNotificationMessage;
export const selectSendRoleNotificationMessage = (state) => state.notification.sendRoleNotificationMessage;
export const selectSendingNewOrderNotification = (state) => state.notification.sendingNewOrderNotification;
export const selectSendNewOrderNotificationMessage = (state) => state.notification.sendNewOrderNotificationMessage;
export const selectSendNewOrderNotificationError = (state) => state.notification.sendNewOrderNotificationError;

// Selector để lấy thông báo chưa đọc
export const selectUnreadNotifications = (state) => 
  state.notification.notifications.filter(notification => !notification.isRead);

// Selector để lấy thông báo đã đọc
export const selectReadNotifications = (state) => 
  state.notification.notifications.filter(notification => notification.isRead);

// Selector để lấy thông báo theo loại
export const selectNotificationsByType = (state, type) =>
  state.notification.notifications.filter(notification => notification.type === type);