import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  assignDesignerToRequestApi,
  fetchCustomDesignRequestsApi
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