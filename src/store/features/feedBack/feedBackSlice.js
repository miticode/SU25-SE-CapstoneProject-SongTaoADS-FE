import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createFeedbackApi,
  getFeedbacksByOrderIdApi,
  uploadFeedbackImageApi,
} from "../../../api/feedBackService";

// Định nghĩa mapping trạng thái feedback
export const FEEDBACK_STATUS_MAP = {
  PENDING: { label: "Chờ xử lý", color: "warning" },
  APPROVED: { label: "Đã duyệt", color: "success" },
  REJECTED: { label: "Đã từ chối", color: "error" },
  RESPONDED: { label: "Đã phản hồi", color: "info" },
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
const initialState = {
  feedbacks: [],
  feedbacksByOrder: {},
  loading: false,
  error: null,
  currentFeedback: null,
  currentFeedbackStatus: "idle",
  currentFeedbackError: null,
  uploadingImage: false,
  uploadImageError: null,
  fetchingFeedbacks: false,
  fetchFeedbacksError: null,
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
    },
    setCurrentFeedback: (state, action) => {
      state.currentFeedback = action.payload;
    },
    resetFeedbacks: (state) => {
      state.feedbacks = [];
      state.feedbacksByOrder = {};
      state.error = null;
    },
    clearOrderFeedbacks: (state, action) => {
      const orderId = action.payload;
      if (state.feedbacksByOrder[orderId]) {
        delete state.feedbacksByOrder[orderId];
      }
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
      });
  },
});

export const {
  clearError,
  setCurrentFeedback,
  resetFeedbacks,
  clearOrderFeedbacks,
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
