import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStaffDashboardApi } from '../../../api/dashboardService';

// Initial state
const initialState = {
  staffDashboard: {
    productingOrders: 0,
    productionCompletedOrders: 0,
    inprogressTickets: 0,
    completedOrders: 0
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastUpdated: null
};

// Async thunk for fetching staff dashboard data
export const fetchStaffDashboard = createAsyncThunk(
  'dashboard/fetchStaffDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchStaffDashboardApi();
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch staff dashboard');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Reset status when needed
    resetDashboardStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    // Clear dashboard data
    clearDashboardData: (state) => {
      state.staffDashboard = {
        productingOrders: 0,
        productionCompletedOrders: 0,
        inprogressTickets: 0,
        completedOrders: 0
      };
      state.lastUpdated = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch staff dashboard
      .addCase(fetchStaffDashboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStaffDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.staffDashboard = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchStaffDashboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  resetDashboardStatus,
  clearDashboardData
} = dashboardSlice.actions;

// Export selectors
export const selectStaffDashboard = (state) => state.dashboard.staffDashboard;
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardLastUpdated = (state) => state.dashboard.lastUpdated;

// Selector for specific dashboard metrics
export const selectProductingOrders = (state) => state.dashboard.staffDashboard.productingOrders;
export const selectProductionCompletedOrders = (state) => state.dashboard.staffDashboard.productionCompletedOrders;
export const selectInprogressTickets = (state) => state.dashboard.staffDashboard.inprogressTickets;
export const selectCompletedOrders = (state) => state.dashboard.staffDashboard.completedOrders;

export default dashboardSlice.reducer;
