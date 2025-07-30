import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createProgressLogApi,
  getProgressLogsByOrderIdApi,
  getProgressLogImagesApi,
} from "../../../api/progressLogService";

// Định nghĩa mapping trạng thái progress log
export const PROGRESS_LOG_STATUS_MAP = {
  PENDING_DESIGN: { label: "Chờ thiết kế", color: "warning" },
  NEED_DEPOSIT_DESIGN: { label: "Cần đặt cọc thiết kế", color: "warning" },
  DEPOSITED_DESIGN: { label: "Đã đặt cọc thiết kế", color: "info" },
  NEED_FULLY_PAID_DESIGN: { label: "Cần thanh toán đầy đủ thiết kế", color: "warning" },
  WAITING_FINAL_DESIGN: { label: "Chờ thiết kế cuối cùng", color: "info" },
  DESIGN_COMPLETED: { label: "Hoàn thành thiết kế", color: "success" },
  PENDING_CONTRACT: { label: "Chờ hợp đồng", color: "warning" },
  CONTRACT_SENT: { label: "Đã gửi hợp đồng", color: "info" },
  CONTRACT_SIGNED: { label: "Đã ký hợp đồng", color: "primary" },
  CONTRACT_DISCUSS: { label: "Đàm phán hợp đồng", color: "secondary" },
  CONTRACT_RESIGNED: { label: "Từ chối hợp đồng", color: "error" },
  CONTRACT_CONFIRMED: { label: "Xác nhận hợp đồng", color: "success" },
  DEPOSITED: { label: "Đã đặt cọc", color: "info" },
  IN_PROGRESS: { label: "Đang thực hiện", color: "primary" },
  PRODUCING: { label: "Đang sản xuất", color: "primary" },
  PRODUCTION_COMPLETED: { label: "Hoàn thành sản xuất", color: "success" },
  DELIVERING: { label: "Đang giao hàng", color: "info" },
  INSTALLED: { label: "Đã lắp đặt", color: "success" },
  ORDER_COMPLETED: { label: "Hoàn tất đơn hàng", color: "success" },
};

// Async thunks
export const createProgressLog = createAsyncThunk(
  "progressLog/createProgressLog",
  async ({ orderId, progressLogData }, { rejectWithValue }) => {
    try {
      const response = await createProgressLogApi(orderId, progressLogData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      return rejectWithValue(
        error.message || "Không thể tạo progress log"
      );
    }
  }
);

export const fetchProgressLogsByOrderId = createAsyncThunk(
  "progressLog/fetchProgressLogsByOrderId",
  async ({ orderId, page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await getProgressLogsByOrderIdApi(orderId, page, size);
      if (response.success) {
        return {
          data: response.data,
          pagination: response.pagination
        };
      }
      return rejectWithValue(response.error);
    } catch (error) {
      return rejectWithValue(
        error.message || "Không thể lấy danh sách progress logs"
      );
    }
  }
);

export const fetchProgressLogImages = createAsyncThunk(
  "progressLog/fetchProgressLogImages",
  async (progressLogId, { rejectWithValue }) => {
    try {
      const response = await getProgressLogImagesApi(progressLogId);
      if (response.success) {
        return {
          progressLogId,
          images: response.data
        };
      }
      return rejectWithValue(response.error);
    } catch (error) {
      return rejectWithValue(
        error.message || "Không thể lấy danh sách ảnh progress log"
      );
    }
  }
);

const initialState = {
  progressLogs: [],
  loading: false,
  error: null,
  createStatus: "idle",
  createError: null,
  progressLogImages: {}, // { progressLogId: images[] }
  imagesLoading: false,
  imagesError: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  },
};

const progressLogSlice = createSlice({
  name: "progressLog",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.imagesError = null;
    },
    resetCreateStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create progress log
      .addCase(createProgressLog.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createProgressLog.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.progressLogs.unshift(action.payload); // Thêm vào đầu danh sách
      })
      .addCase(createProgressLog.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      })
      
      // Fetch progress logs by order ID
      .addCase(fetchProgressLogsByOrderId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgressLogsByOrderId.fulfilled, (state, action) => {
        state.loading = false;
        state.progressLogs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProgressLogsByOrderId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch progress log images
      .addCase(fetchProgressLogImages.pending, (state) => {
        state.imagesLoading = true;
        state.imagesError = null;
      })
      .addCase(fetchProgressLogImages.fulfilled, (state, action) => {
        state.imagesLoading = false;
        const { progressLogId, images } = action.payload;
        state.progressLogImages[progressLogId] = images;
      })
      .addCase(fetchProgressLogImages.rejected, (state, action) => {
        state.imagesLoading = false;
        state.imagesError = action.payload;
      });
  },
});

export const {
  clearError,
  resetCreateStatus,
} = progressLogSlice.actions;

export default progressLogSlice.reducer;

// Selectors
export const selectProgressLogs = (state) => state.progressLog.progressLogs;
export const selectProgressLogLoading = (state) => state.progressLog.loading;
export const selectProgressLogError = (state) => state.progressLog.error;
export const selectCreateStatus = (state) => state.progressLog.createStatus;
export const selectCreateError = (state) => state.progressLog.createError;
export const selectProgressLogPagination = (state) => state.progressLog.pagination;
export const selectProgressLogImages = (state) => state.progressLog.progressLogImages;
export const selectImagesLoading = (state) => state.progressLog.imagesLoading;
export const selectImagesError = (state) => state.progressLog.imagesError;

// Helper selector để lấy images của một progress log cụ thể
export const selectImagesByProgressLogId = (progressLogId) => (state) => 
  state.progressLog.progressLogImages[progressLogId] || [];