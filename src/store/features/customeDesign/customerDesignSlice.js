import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  assignDesignerToRequestApi,
  fetchCustomDesignRequestsApi,
  updateRequestStatusApi,
  rejectCustomDesignRequestApi,
  approveCustomDesignRequestApi,
  fetchCustomDesignRequestsByCustomerDetailApi
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
  }
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

// Create the slice
const customerDesignSlice = createSlice({
  name: "customDesign",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = "idle";
      state.error = null;
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
      });
  }
});

// Export actions
export const { resetStatus } = customerDesignSlice.actions;

// Selectors
export const selectPendingDesignRequests = (state) => state.customDesign.designRequests;
export const selectStatus = (state) => state.customDesign.status;
export const selectError = (state) => state.customDesign.error;
export const selectPagination = (state) => state.customDesign.pagination;

export default customerDesignSlice.reducer;