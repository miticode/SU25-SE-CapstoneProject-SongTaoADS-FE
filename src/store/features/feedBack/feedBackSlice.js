import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createFeedbackApi,
  getAllFeedbacksApi,
  getFeedbacksByOrderIdApi,
  respondToFeedbackApi,
  uploadFeedbackImageApi,
} from "../../../api/feedBackService";

// Định nghĩa mapping trạng thái feedback
export const FEEDBACK_STATUS_MAP = {
  PENDING: { label: "Chờ xử lý", color: "warning" },

  ANSWERED: { label: "Đã phản hồi", color: "info" },
};

// Async thunks
export const createFeedback = createAsyncThunk(
  "feedback/createFeedback",
  async ({ orderId, feedbackData }, { rejectWithValue }) => {
    const response = await createFeedbackApi(orderId, feedbackData);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
export const uploadFeedbackImage = createAsyncThunk(
  "feedback/uploadFeedbackImage",
  async ({ feedbackId, imageFile }, { rejectWithValue }) => {
    const response = await uploadFeedbackImageApi(feedbackId, imageFile);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
export const fetchFeedbacksByOrderId = createAsyncThunk(
  "feedback/fetchFeedbacksByOrderId",
  async (orderId, { rejectWithValue }) => {
    const response = await getFeedbacksByOrderIdApi(orderId);
    if (response.success) {
      return { orderId, feedbacks: response.data };
    }
    return rejectWithValue(response.error);
  }
);
export const fetchAllFeedbacks = createAsyncThunk(
  "feedback/fetchAllFeedbacks",
  async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
    const response = await getAllFeedbacksApi(page, size);
    if (response.success) {
      return {
        feedbacks: response.data,
        pagination: response.pagination,
      };
    }
    return rejectWithValue(response.error);
  }
);
export const respondToFeedback = createAsyncThunk(
  "feedback/respondToFeedback",
  async ({ feedbackId, responseText }, { rejectWithValue }) => {
    const response = await respondToFeedbackApi(feedbackId, responseText);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
const initialState = {
  feedbacks: [],
  feedbacksByOrder: {},
  allFeedbacks: [], // Danh sách tất cả feedback cho admin/sale
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  },
  loading: false,
  error: null,
  currentFeedback: null,
  currentFeedbackStatus: "idle",
  currentFeedbackError: null,
  uploadingImage: false,
  uploadImageError: null,
  fetchingFeedbacks: false,
  fetchFeedbacksError: null,
  fetchingAllFeedbacks: false, // Loading state cho fetch all
  fetchAllFeedbacksError: null, // Error state cho fetch all
  respondingToFeedback: false, // Loading state cho respond
  respondToFeedbackError: null, // Error state cho respond
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.currentFeedbackError = null;
      state.uploadImageError = null;
      state.fetchFeedbacksError = null;
      state.fetchAllFeedbacksError = null;
      state.respondToFeedbackError = null;
    },
    setCurrentFeedback: (state, action) => {
      state.currentFeedback = action.payload;
    },
    resetFeedbacks: (state) => {
      state.feedbacks = [];
      state.feedbacksByOrder = {};
      state.allFeedbacks = [];
      state.error = null;
    },
    clearOrderFeedbacks: (state, action) => {
      const orderId = action.payload;
      if (state.feedbacksByOrder[orderId]) {
        delete state.feedbacksByOrder[orderId];
      }
    },
    resetPagination: (state) => {
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalElements: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Feedback
      .addCase(createFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks.push(action.payload);
        state.currentFeedback = action.payload;
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadFeedbackImage.pending, (state) => {
        state.uploadingImage = true;
        state.uploadImageError = null;
      })
      .addCase(uploadFeedbackImage.fulfilled, (state, action) => {
        state.uploadingImage = false;

        // Cập nhật feedback trong danh sách
        const index = state.feedbacks.findIndex(
          (feedback) => feedback.id === action.payload.id
        );
        if (index !== -1) {
          state.feedbacks[index] = action.payload;
        }

        // Cập nhật currentFeedback nếu cần
        if (
          state.currentFeedback &&
          state.currentFeedback.id === action.payload.id
        ) {
          state.currentFeedback = action.payload;
        }
      })
      .addCase(uploadFeedbackImage.rejected, (state, action) => {
        state.uploadingImage = false;
        state.uploadImageError = action.payload;
      })
      .addCase(fetchFeedbacksByOrderId.pending, (state) => {
        state.fetchingFeedbacks = true;
        state.fetchFeedbacksError = null;
      })
      .addCase(fetchFeedbacksByOrderId.fulfilled, (state, action) => {
        state.fetchingFeedbacks = false;
        const { orderId, feedbacks } = action.payload;
        state.feedbacksByOrder[orderId] = feedbacks;
      })
      .addCase(fetchFeedbacksByOrderId.rejected, (state, action) => {
        state.fetchingFeedbacks = false;
        state.fetchFeedbacksError = action.payload;
      })
      .addCase(fetchAllFeedbacks.pending, (state) => {
        state.fetchingAllFeedbacks = true;
        state.fetchAllFeedbacksError = null;
      })
      .addCase(fetchAllFeedbacks.fulfilled, (state, action) => {
        state.fetchingAllFeedbacks = false;
        const { feedbacks, pagination } = action.payload;

        // Nếu là trang đầu tiên, thay thế toàn bộ danh sách
        if (pagination.currentPage === 1) {
          state.allFeedbacks = feedbacks;
        } else {
          // Nếu là trang tiếp theo, thêm vào danh sách hiện tại (load more)
          state.allFeedbacks = [...state.allFeedbacks, ...feedbacks];
        }

        state.pagination = pagination;
      })
      .addCase(fetchAllFeedbacks.rejected, (state, action) => {
        state.fetchingAllFeedbacks = false;
        state.fetchAllFeedbacksError = action.payload;
      })
      .addCase(respondToFeedback.pending, (state) => {
        state.respondingToFeedback = true;
        state.respondToFeedbackError = null;
      })
      .addCase(respondToFeedback.fulfilled, (state, action) => {
        state.respondingToFeedback = false;
        const updatedFeedback = action.payload;

        // Cập nhật feedback trong allFeedbacks
        const allFeedbackIndex = state.allFeedbacks.findIndex(
          (feedback) => feedback.id === updatedFeedback.id
        );
        if (allFeedbackIndex !== -1) {
          state.allFeedbacks[allFeedbackIndex] = updatedFeedback;
        }

        // Cập nhật feedback trong feedbacksByOrder nếu có
        if (
          updatedFeedback.orderId &&
          state.feedbacksByOrder[updatedFeedback.orderId]
        ) {
          const orderFeedbackIndex = state.feedbacksByOrder[
            updatedFeedback.orderId
          ].findIndex((feedback) => feedback.id === updatedFeedback.id);
          if (orderFeedbackIndex !== -1) {
            state.feedbacksByOrder[updatedFeedback.orderId][
              orderFeedbackIndex
            ] = updatedFeedback;
          }
        }

        // Cập nhật feedback trong feedbacks
        const feedbackIndex = state.feedbacks.findIndex(
          (feedback) => feedback.id === updatedFeedback.id
        );
        if (feedbackIndex !== -1) {
          state.feedbacks[feedbackIndex] = updatedFeedback;
        }

        // Cập nhật currentFeedback nếu cần
        if (
          state.currentFeedback &&
          state.currentFeedback.id === updatedFeedback.id
        ) {
          state.currentFeedback = updatedFeedback;
        }
      })
      .addCase(respondToFeedback.rejected, (state, action) => {
        state.respondingToFeedback = false;
        state.respondToFeedbackError = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentFeedback,
  resetFeedbacks,
  clearOrderFeedbacks,
  resetPagination,
} = feedbackSlice.actions;
export default feedbackSlice.reducer;

export const selectFeedbacks = (state) => state.feedback.feedbacks;
export const selectFeedbackLoading = (state) => state.feedback.loading;
export const selectFeedbackError = (state) => state.feedback.error;
export const selectCurrentFeedback = (state) => state.feedback.currentFeedback;
export const selectCurrentFeedbackStatus = (state) =>
  state.feedback.currentFeedbackStatus;
export const selectCurrentFeedbackError = (state) =>
  state.feedback.currentFeedbackError;
export const selectUploadingImage = (state) => state.feedback.uploadingImage;
export const selectUploadImageError = (state) =>
  state.feedback.uploadImageError;
export const selectFetchingFeedbacks = (state) =>
  state.feedback.fetchingFeedbacks;
export const selectFetchFeedbacksError = (state) =>
  state.feedback.fetchFeedbacksError;
export const selectFeedbacksByOrder = (state) =>
  state.feedback.feedbacksByOrder;

// Selector để lấy feedback của một đơn hàng cụ thể
export const selectFeedbacksByOrderId = (orderId) => (state) =>
  state.feedback.feedbacksByOrder[orderId] || [];

// Selectors cho admin/sale
export const selectAllFeedbacks = (state) => state.feedback.allFeedbacks;
export const selectFeedbackPagination = (state) => state.feedback.pagination;
export const selectFetchingAllFeedbacks = (state) =>
  state.feedback.fetchingAllFeedbacks;
export const selectFetchAllFeedbacksError = (state) =>
  state.feedback.fetchAllFeedbacksError;

// Selectors cho respond to feedback
export const selectRespondingToFeedback = (state) =>
  state.feedback.respondingToFeedback;
export const selectRespondToFeedbackError = (state) =>
  state.feedback.respondToFeedbackError;
