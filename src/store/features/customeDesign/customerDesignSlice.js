import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  assignDesignerToRequestApi,
  fetchCustomDesignRequestsApi,
  updateRequestStatusApi,
  rejectCustomDesignRequestApi,
  approveCustomDesignRequestApi,
  fetchCustomDesignRequestsByCustomerDetailApi,
  createCustomDesignRequestApi,
  sendFinalDesignImageApi,
  fetchDesignRequestsByDesignerApi,
  uploadFinalDesignSubImagesApi,
  getFinalDesignSubImagesApi
} from "../../../api/customeDesignService";

// Initial state
const initialState = {
  designRequests: [],
  status: "idle", // 'idle', 'loading', 'succeeded', 'failed'
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0
  },
  currentDesignRequest: null,
  finalDesignSubImages: []
};

// Thêm hoặc cập nhật mapping trạng thái cho đơn thiết kế thủ công
export const CUSTOM_DESIGN_STATUS_MAP = {
  PENDING: { label: "Chờ xác nhận", color: "warning" },
  PRICING_NOTIFIED: { label: "Đã báo giá", color: "info" },
  NEGOTIATING: { label: "Đang thương lượng", color: "info" },
  APPROVED_PRICING: { label: "Đã duyệt giá", color: "success" },
  DEPOSITED: { label: "Đã đặt cọc", color: "info" },
  ASSIGNED_DESIGNER: { label: "Đã giao designer", color: "primary" },
  PROCESSING: { label: "Đang thiết kế", color: "primary" },
  DESIGNER_REJECTED: { label: "Designer từ chối", color: "error" },
  DEMO_SUBMITTED: { label: "Đã nộp demo", color: "info" },
  REVISION_REQUESTED: { label: "Yêu cầu chỉnh sửa", color: "warning" },
  WAITING_FULL_PAYMENT: { label: "Chờ thanh toán đủ", color: "warning" },
  FULLY_PAID: { label: "Đã thanh toán đủ", color: "success" },
  COMPLETED: { label: "Hoàn tất", color: "success" },
  CANCELLED: { label: "Đã hủy", color: "error" },
  REJECTED_PRICING: { label: "Từ chối báo giá", color: "error" },
};

// Async thunk for fetching custom design requests with PENDING status
export const fetchPendingDesignRequests = createAsyncThunk(
  "customDesign/fetchPendingRequests",
  async ({ page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await fetchCustomDesignRequestsApi("PENDING", page, size);

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to fetch pending design requests");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while fetching requests");
    }
  }
);
export const assignDesignerToRequest = createAsyncThunk(
  "customDesign/assignDesigner",
  async ({ customDesignRequestId, designerId }, { rejectWithValue }) => {
    try {
      const response = await assignDesignerToRequestApi(customDesignRequestId, designerId);

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to assign designer to request");
      }

      return response.result;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while assigning designer");
    }
  }
);
export const updateRequestStatus = createAsyncThunk(
  "customDesign/updateStatus",
  async ({ customDesignRequestId, status }, { rejectWithValue }) => {
    try {
      const response = await updateRequestStatusApi(customDesignRequestId, status);

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to update request status");
      }

      return response.result;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while updating request status");
    }
  }
);
export const rejectCustomDesignRequest = createAsyncThunk(
  "customDesign/rejectRequest",
  async ({ customDesignRequestId }, { rejectWithValue }) => {
    try {
      const response = await rejectCustomDesignRequestApi(customDesignRequestId);
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to reject request");
      }
      return response.result;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while rejecting request");
    }
  }
);

export const approveCustomDesignRequest = createAsyncThunk(
  "customDesign/approveRequest",
  async ({ customDesignRequestId }, { rejectWithValue }) => {
    try {
      const response = await approveCustomDesignRequestApi(customDesignRequestId);
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to approve request");
      }
      return response.result;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while approving request");
    }
  }
);

export const fetchCustomDesignRequestsByCustomerDetail = createAsyncThunk(
  "customDesign/fetchByCustomerDetail",
  async ({ customerDetailId, page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await fetchCustomDesignRequestsByCustomerDetailApi(customerDetailId, page, size);
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to fetch custom design requests by customer detail");
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while fetching requests by customer detail");
    }
  }
);

export const fetchAllDesignRequests = createAsyncThunk(
  "customDesign/fetchAllDesignRequests",
  async ({ status = 'PENDING', page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await fetchCustomDesignRequestsApi(status, page, size);
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to fetch design requests");
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while fetching requests");
    }
  }
);



// 1. Tạo yêu cầu thiết kế tùy chỉnh
// POST /api/customer-details/{customerDetailId}/customer-choices/{customerChoiceId}
export const createCustomDesignRequest = createAsyncThunk(
  "customDesign/createCustomDesignRequest",
  async ({ customerDetailId, customerChoiceId, data }, { rejectWithValue }) => {
    try {
      const response = await createCustomDesignRequestApi(customerDetailId, customerChoiceId, data);
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to create custom design request");
      }
      return response.result;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while creating custom design request");
    }
  }
);

// 2. Designer gửi bản thiết kế chính thức
// PATCH /api/custom-design-requests/{customDesignRequestId}/final-design-image
export const sendFinalDesignImage = createAsyncThunk(
  "customDesign/sendFinalDesignImage",
  async ({ customDesignRequestId, file }, { rejectWithValue }) => {
    try {
      const response = await sendFinalDesignImageApi(customDesignRequestId, file);
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to send final design image");
      }
      return response.result;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while sending final design image");
    }
  }
);

// 3. Designer xem các yêu cầu được giao
// GET /api/users/{designerId}/custom-design-requests
export const fetchDesignRequestsByDesigner = createAsyncThunk(
  "customDesign/fetchDesignRequestsByDesigner",
  async ({ designerId, page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await fetchDesignRequestsByDesignerApi(designerId, page, size);
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to fetch design requests by designer");
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while fetching design requests by designer");
    }
  }
);

// Upload nhiều hình ảnh phụ cho bản thiết kế chính thức
export const uploadFinalDesignSubImages = createAsyncThunk(
  'customDesign/uploadFinalDesignSubImages',
  async ({ customDesignRequestId, files }, { rejectWithValue }) => {
    const res = await uploadFinalDesignSubImagesApi(customDesignRequestId, files);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);
// Lấy danh sách hình ảnh phụ của bản thiết kế chính thức
export const getFinalDesignSubImages = createAsyncThunk(
  'customDesign/getFinalDesignSubImages',
  async (customDesignRequestId, { rejectWithValue }) => {
    const res = await getFinalDesignSubImagesApi(customDesignRequestId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// Create the slice
const customerDesignSlice = createSlice({
  name: "customDesign",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    setCurrentDesignRequest: (state, action) => {
      state.currentDesignRequest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchPendingDesignRequests
      .addCase(fetchPendingDesignRequests.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPendingDesignRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.designRequests = action.payload.result;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements
        };
        state.error = null;
      })
      .addCase(fetchPendingDesignRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(assignDesignerToRequest.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(assignDesignerToRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update the assigned request in the list
        state.designRequests = state.designRequests.map(request =>
          request.id === action.payload.id ? action.payload : request
        );
        state.error = null;
      })
      .addCase(assignDesignerToRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateRequestStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update the request with new status in the list
        state.designRequests = state.designRequests.map(request =>
          request.id === action.payload.id ? action.payload : request
        );
        // If the updated status is not PENDING, you might want to remove it from the list
        // if filtering by PENDING in the UI. Uncomment the following if needed:
        // if (action.payload.status !== 'PENDING') {
        //   state.designRequests = state.designRequests.filter(request => 
        //     request.id !== action.payload.id
        //   );
        // }
        state.error = null;
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(rejectCustomDesignRequest.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(rejectCustomDesignRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.designRequests = state.designRequests.map(request =>
          request.id === action.payload.id ? action.payload : request
        );
        state.error = null;
      })
      .addCase(rejectCustomDesignRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(approveCustomDesignRequest.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(approveCustomDesignRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.designRequests = state.designRequests.map(request =>
          request.id === action.payload.id ? action.payload : request
        );
        state.error = null;
      })
      .addCase(approveCustomDesignRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCustomDesignRequestsByCustomerDetail.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomDesignRequestsByCustomerDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.designRequests = action.payload.result;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements
        };
        state.error = null;
      })
      .addCase(fetchCustomDesignRequestsByCustomerDetail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchAllDesignRequests.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllDesignRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.designRequests = action.payload.result;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements
        };
        state.error = null;
      })
      .addCase(fetchAllDesignRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(uploadFinalDesignSubImages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadFinalDesignSubImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Có thể lưu subImages vào state nếu cần
      })
      .addCase(uploadFinalDesignSubImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(getFinalDesignSubImages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getFinalDesignSubImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.finalDesignSubImages = action.payload;
      })
      .addCase(getFinalDesignSubImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

// Export actions
export const { resetStatus, setCurrentDesignRequest } = customerDesignSlice.actions;

// Selectors
export const selectPendingDesignRequests = (state) => state.customDesign.designRequests;
export const selectStatus = (state) => state.customDesign.status;
export const selectError = (state) => state.customDesign.error;
export const selectPagination = (state) => state.customDesign.pagination;
export const selectCurrentDesignRequest = (state) => state.customDesign.currentDesignRequest;
export const selectAllDesignRequests = (state) => state.customDesign.designRequests;
export const selectFinalDesignSubImages = (state) => state.customDesign.finalDesignSubImages;

export default customerDesignSlice.reducer;