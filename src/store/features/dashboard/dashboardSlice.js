import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStaffDashboardApi, fetchAdminDashboardApi } from '../../../api/dashboardService';

// Initial state
const initialState = {
  staffDashboard: {
    productingOrders: 0,
    productionCompletedOrders: 0,
    inprogressTickets: 0,
    completedOrders: 0
  },
  adminDashboard: {
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    completedOrders: 0,
    activeContracts: 0
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

// Async thunk for fetching admin dashboard data
export const fetchAdminDashboard = createAsyncThunk(
  'dashboard/fetchAdminDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAdminDashboardApi();

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch admin dashboard');
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
      state.adminDashboard = {
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        completedOrders: 0,
        activeContracts: 0
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
      })
      // Fetch admin dashboard
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.adminDashboard = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
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
export const selectAdminDashboard = (state) => state.dashboard.adminDashboard;
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardLastUpdated = (state) => state.dashboard.lastUpdated;

// Selector for specific staff dashboard metrics
export const selectProductingOrders = (state) => state.dashboard.staffDashboard.productingOrders;
export const selectProductionCompletedOrders = (state) => state.dashboard.staffDashboard.productionCompletedOrders;
export const selectInprogressTickets = (state) => state.dashboard.staffDashboard.inprogressTickets;
export const selectCompletedOrders = (state) => state.dashboard.staffDashboard.completedOrders;

// Selector for specific admin dashboard metrics
export const selectTotalOrders = (state) => state.dashboard.adminDashboard.totalOrders;
export const selectTotalUsers = (state) => state.dashboard.adminDashboard.totalUsers;
export const selectTotalRevenue = (state) => state.dashboard.adminDashboard.totalRevenue;
export const selectAdminCompletedOrders = (state) => state.dashboard.adminDashboard.completedOrders;
export const selectActiveContracts = (state) => state.dashboard.adminDashboard.activeContracts;

export default dashboardSlice.reducer;
