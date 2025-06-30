import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createFeedbackApi,
  getAllFeedbacksApi,
  getFeedbacksByOrderIdApi,
  respondToFeedbackApi,
  uploadFeedbackImageApi,
} from "../../../api/feedBackService";

// Định nghĩa mapping trạng thái impression
export const IMPRESSION_STATUS_MAP = {
  PENDING: { label: "Chờ xử lý", color: "warning" },
  ANSWERED: { label: "Đã phản hồi", color: "info" },
};

// Async thunks
export const createImpression = createAsyncThunk(
  "impression/createImpression",
  async ({ orderId, impressionData }, { rejectWithValue }) => {
    const response = await createFeedbackApi(orderId, impressionData);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);

export const uploadImpressionImage = createAsyncThunk(
  "impression/uploadImpressionImage",
  async ({ impressionId, imageFile }, { rejectWithValue }) => {
    const response = await uploadFeedbackImageApi(impressionId, imageFile);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);

export const fetchImpressionsByOrderId = createAsyncThunk(
  "impression/fetchImpressionsByOrderId",
  async (orderId, { rejectWithValue }) => {
    const response = await getFeedbacksByOrderIdApi(orderId);
    if (response.success) {
      return { orderId, impressions: response.data };
    }
    return rejectWithValue(response.error);
  }
);

export const fetchAllImpressions = createAsyncThunk(
  "impression/fetchAllImpressions",
  async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
    const response = await getAllFeedbacksApi(page, size);
    if (response.success) {
      return {
        impressions: response.data,
        pagination: response.pagination,
      };
    }
    return rejectWithValue(response.error);
  }
);

export const respondToImpression = createAsyncThunk(
  "impression/respondToImpression",
  async ({ impressionId, responseText }, { rejectWithValue }) => {
    const response = await respondToFeedbackApi(impressionId, responseText);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);

const initialState = {
  impressions: [],
  impressionsByOrder: {},
  allImpressions: [], // Danh sách tất cả impression cho admin/sale
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  },
  loading: false,
  error: null,
  currentImpression: null,
  currentImpressionStatus: "idle",
  currentImpressionError: null,
  uploadingImage: false,
  uploadImageError: null,
  fetchingImpressions: false,
  fetchImpressionsError: null,
  fetchingAllImpressions: false, // Loading state cho fetch all
  fetchAllImpressionsError: null, // Error state cho fetch all
  respondingToImpression: false, // Loading state cho respond
  respondToImpressionError: null, // Error state cho respond
};

const impressionSlice = createSlice({
  name: "impression",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.currentImpressionError = null;
      state.uploadImageError = null;
      state.fetchImpressionsError = null;
      state.fetchAllImpressionsError = null;
      state.respondToImpressionError = null;
    },
    setCurrentImpression: (state, action) => {
      state.currentImpression = action.payload;
    },
    resetImpressions: (state) => {
      state.impressions = [];
      state.impressionsByOrder = {};
      state.allImpressions = [];
      state.error = null;
    },
    clearOrderImpressions: (state, action) => {
      const orderId = action.payload;
      if (state.impressionsByOrder[orderId]) {
        delete state.impressionsByOrder[orderId];
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
      // Create Impression
      .addCase(createImpression.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createImpression.fulfilled, (state, action) => {
        state.loading = false;
        state.impressions.push(action.payload);
        state.currentImpression = action.payload;
      })
      .addCase(createImpression.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadImpressionImage.pending, (state) => {
        state.uploadingImage = true;
        state.uploadImageError = null;
      })
      .addCase(uploadImpressionImage.fulfilled, (state, action) => {
        state.uploadingImage = false;

        // Cập nhật impression trong danh sách
        const index = state.impressions.findIndex(
          (impression) => impression.id === action.payload.id
        );
        if (index !== -1) {
          state.impressions[index] = action.payload;
        }

        // Cập nhật currentImpression nếu cần
        if (
          state.currentImpression &&
          state.currentImpression.id === action.payload.id
        ) {
          state.currentImpression = action.payload;
        }
      })
      .addCase(uploadImpressionImage.rejected, (state, action) => {
        state.uploadingImage = false;
        state.uploadImageError = action.payload;
      })
      .addCase(fetchImpressionsByOrderId.pending, (state) => {
        state.fetchingImpressions = true;
        state.fetchImpressionsError = null;
      })
      .addCase(fetchImpressionsByOrderId.fulfilled, (state, action) => {
        state.fetchingImpressions = false;
        const { orderId, impressions } = action.payload;
        state.impressionsByOrder[orderId] = impressions;
      })
      .addCase(fetchImpressionsByOrderId.rejected, (state, action) => {
        state.fetchingImpressions = false;
        state.fetchImpressionsError = action.payload;
      })
      .addCase(fetchAllImpressions.pending, (state) => {
        state.fetchingAllImpressions = true;
        state.fetchAllImpressionsError = null;
      })
      .addCase(fetchAllImpressions.fulfilled, (state, action) => {
        state.fetchingAllImpressions = false;
        const { impressions, pagination } = action.payload;

        // Nếu là trang đầu tiên, thay thế toàn bộ danh sách
        if (pagination.currentPage === 1) {
          state.allImpressions = impressions;
        } else {
          // Nếu là trang tiếp theo, thêm vào danh sách hiện tại (load more)
          state.allImpressions = [...state.allImpressions, ...impressions];
        }

        state.pagination = pagination;
      })
      .addCase(fetchAllImpressions.rejected, (state, action) => {
        state.fetchingAllImpressions = false;
        state.fetchAllImpressionsError = action.payload;
      })
      .addCase(respondToImpression.pending, (state) => {
        state.respondingToImpression = true;
        state.respondToImpressionError = null;
      })
      .addCase(respondToImpression.fulfilled, (state, action) => {
        state.respondingToImpression = false;
        const updatedImpression = action.payload;

        // Cập nhật impression trong allImpressions
        const allImpressionIndex = state.allImpressions.findIndex(
          (impression) => impression.id === updatedImpression.id
        );
        if (allImpressionIndex !== -1) {
          state.allImpressions[allImpressionIndex] = updatedImpression;
        }

        // Cập nhật impression trong impressionsByOrder nếu có
        if (
          updatedImpression.orderId &&
          state.impressionsByOrder[updatedImpression.orderId]
        ) {
          const orderImpressionIndex = state.impressionsByOrder[
            updatedImpression.orderId
          ].findIndex((impression) => impression.id === updatedImpression.id);
          if (orderImpressionIndex !== -1) {
            state.impressionsByOrder[updatedImpression.orderId][
              orderImpressionIndex
            ] = updatedImpression;
          }
        }

        // Cập nhật impression trong impressions
        const impressionIndex = state.impressions.findIndex(
          (impression) => impression.id === updatedImpression.id
        );
        if (impressionIndex !== -1) {
          state.impressions[impressionIndex] = updatedImpression;
        }

        // Cập nhật currentImpression nếu cần
        if (
          state.currentImpression &&
          state.currentImpression.id === updatedImpression.id
        ) {
          state.currentImpression = updatedImpression;
        }
      })
      .addCase(respondToImpression.rejected, (state, action) => {
        state.respondingToImpression = false;
        state.respondToImpressionError = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentImpression,
  resetImpressions,
  clearOrderImpressions,
  resetPagination,
} = impressionSlice.actions;

export default impressionSlice.reducer;

// Selectors
export const selectImpressions = (state) => state.impression.impressions;
export const selectImpressionLoading = (state) => state.impression.loading;
export const selectImpressionError = (state) => state.impression.error;
export const selectCurrentImpression = (state) => state.impression.currentImpression;
export const selectCurrentImpressionStatus = (state) =>
  state.impression.currentImpressionStatus;
export const selectCurrentImpressionError = (state) =>
  state.impression.currentImpressionError;
export const selectUploadingImage = (state) => state.impression.uploadingImage;
export const selectUploadImageError = (state) =>
  state.impression.uploadImageError;
export const selectFetchingImpressions = (state) =>
  state.impression.fetchingImpressions;
export const selectFetchImpressionsError = (state) =>
  state.impression.fetchImpressionsError;
export const selectImpressionsByOrder = (state) =>
  state.impression.impressionsByOrder;

// Selector để lấy impression của một đơn hàng cụ thể
export const selectImpressionsByOrderId = (orderId) => (state) =>
  state.impression.impressionsByOrder[orderId] || [];

// Selectors cho admin/sale
export const selectAllImpressions = (state) => state.impression.allImpressions;
export const selectImpressionPagination = (state) => state.impression.pagination;
export const selectFetchingAllImpressions = (state) =>
  state.impression.fetchingAllImpressions;
export const selectFetchAllImpressionsError = (state) =>
  state.impression.fetchAllImpressionsError;

// Selectors cho respond to impression
export const selectRespondingToImpression = (state) =>
  state.impression.respondingToImpression;
export const selectRespondToImpressionError = (state) =>
  state.impression.respondToImpressionError;
