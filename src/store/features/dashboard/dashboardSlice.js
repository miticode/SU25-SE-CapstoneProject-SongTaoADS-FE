import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStaffDashboardApi, fetchAdminDashboardApi, fetchStaffOrdersStatsApi } from '../../../api/dashboardService';

// Initial state
const initialState = {
  staffDashboard: {
    totalOrder: 0,
    totalProducingOrder: 0,
    totalProductionCompletedOrder: 0,
    totalDeliveringOrder: 0,
    totalInstalledOrder: 0,
    totalProductType: 0,
    totalProductTypeActive: 0,
    totalProductTypeUsingAI: 0,
    totalAttribute: 0,
    totalAttributeActive: 0,
    totalAttributeValue: 0,
    totalAttributeValueActive: 0,
    totalCostType: 0,
    totalCostTypeActive: 0,
    totalDesignTemplate: 0,
    totalDesignTemplateActive: 0,
    totalBackground: 0,
    totalBackgroundActive: 0,
    totalModelChatBot: 0,
    totalTopic: 0,
    totalQuestion: 0,
    totalContractor: 0,
    totalContractorActive: 0,
    totalContactorInternal: 0,
    totalContractorExternal: 0,
    totalRevenue: 0,
    totalPayOSPayment: 0,
    totalCastPayment: 0
  },
  adminDashboard: {
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    completedOrders: 0,
    activeContracts: 0
  },
  ordersStats: {
    total: 0,
    producing: 0,
    productionCompleted: 0,
    delivering: 0,
    installed: 0,
    orderCompleted: 0,
    cancelled: 0
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  ordersStatsStatus: 'idle', // separate status for orders stats
  error: null,
  ordersStatsError: null,
  lastUpdated: null,
  ordersStatsLastUpdated: null
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

// Async thunk for fetching staff orders statistics
export const fetchStaffOrdersStats = createAsyncThunk(
  'dashboard/fetchStaffOrdersStats',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await fetchStaffOrdersStatsApi(startDate, endDate);

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch staff orders statistics');
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
    // Reset orders stats status
    resetOrdersStatsStatus: (state) => {
      state.ordersStatsStatus = 'idle';
      state.ordersStatsError = null;
    },
    // Clear dashboard data
    clearDashboardData: (state) => {
      state.staffDashboard = {
        totalOrder: 0,
        totalProducingOrder: 0,
        totalProductionCompletedOrder: 0,
        totalDeliveringOrder: 0,
        totalInstalledOrder: 0,
        totalProductType: 0,
        totalProductTypeActive: 0,
        totalProductTypeUsingAI: 0,
        totalAttribute: 0,
        totalAttributeActive: 0,
        totalAttributeValue: 0,
        totalAttributeValueActive: 0,
        totalCostType: 0,
        totalCostTypeActive: 0,
        totalDesignTemplate: 0,
        totalDesignTemplateActive: 0,
        totalBackground: 0,
        totalBackgroundActive: 0,
        totalModelChatBot: 0,
        totalTopic: 0,
        totalQuestion: 0,
        totalContractor: 0,
        totalContractorActive: 0,
        totalContactorInternal: 0,
        totalContractorExternal: 0,
        totalRevenue: 0,
        totalPayOSPayment: 0,
        totalCastPayment: 0
      };
      state.adminDashboard = {
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        completedOrders: 0,
        activeContracts: 0
      };
      state.ordersStats = {
        total: 0,
        producing: 0,
        productionCompleted: 0,
        delivering: 0,
        installed: 0,
        orderCompleted: 0,
        cancelled: 0
      };
      state.lastUpdated = null;
      state.ordersStatsLastUpdated = null;
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
      })
      // Fetch staff orders stats
      .addCase(fetchStaffOrdersStats.pending, (state) => {
        state.ordersStatsStatus = 'loading';
        state.ordersStatsError = null;
      })
      .addCase(fetchStaffOrdersStats.fulfilled, (state, action) => {
        state.ordersStatsStatus = 'succeeded';
        state.ordersStats = action.payload;
        state.ordersStatsLastUpdated = new Date().toISOString();
        state.ordersStatsError = null;
      })
      .addCase(fetchStaffOrdersStats.rejected, (state, action) => {
        state.ordersStatsStatus = 'failed';
        state.ordersStatsError = action.payload;
      });
  }
});

// Export actions
export const {
  resetDashboardStatus,
  resetOrdersStatsStatus,
  clearDashboardData
} = dashboardSlice.actions;

// Export selectors
export const selectStaffDashboard = (state) => state.dashboard.staffDashboard;
export const selectAdminDashboard = (state) => state.dashboard.adminDashboard;
export const selectOrdersStats = (state) => state.dashboard.ordersStats;
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectOrdersStatsStatus = (state) => state.dashboard.ordersStatsStatus;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectOrdersStatsError = (state) => state.dashboard.ordersStatsError;
export const selectDashboardLastUpdated = (state) => state.dashboard.lastUpdated;
export const selectOrdersStatsLastUpdated = (state) => state.dashboard.ordersStatsLastUpdated;

// Selector for specific staff dashboard metrics
export const selectTotalOrder = (state) => state.dashboard.staffDashboard.totalOrder;
export const selectTotalProducingOrder = (state) => state.dashboard.staffDashboard.totalProducingOrder;
export const selectTotalProductionCompletedOrder = (state) => state.dashboard.staffDashboard.totalProductionCompletedOrder;
export const selectTotalDeliveringOrder = (state) => state.dashboard.staffDashboard.totalDeliveringOrder;
export const selectTotalInstalledOrder = (state) => state.dashboard.staffDashboard.totalInstalledOrder;
export const selectTotalProductType = (state) => state.dashboard.staffDashboard.totalProductType;
export const selectTotalProductTypeActive = (state) => state.dashboard.staffDashboard.totalProductTypeActive;
export const selectTotalProductTypeUsingAI = (state) => state.dashboard.staffDashboard.totalProductTypeUsingAI;
export const selectTotalAttribute = (state) => state.dashboard.staffDashboard.totalAttribute;
export const selectTotalAttributeActive = (state) => state.dashboard.staffDashboard.totalAttributeActive;
export const selectTotalAttributeValue = (state) => state.dashboard.staffDashboard.totalAttributeValue;
export const selectTotalAttributeValueActive = (state) => state.dashboard.staffDashboard.totalAttributeValueActive;
export const selectTotalCostType = (state) => state.dashboard.staffDashboard.totalCostType;
export const selectTotalCostTypeActive = (state) => state.dashboard.staffDashboard.totalCostTypeActive;
export const selectTotalDesignTemplate = (state) => state.dashboard.staffDashboard.totalDesignTemplate;
export const selectTotalDesignTemplateActive = (state) => state.dashboard.staffDashboard.totalDesignTemplateActive;
export const selectTotalBackground = (state) => state.dashboard.staffDashboard.totalBackground;
export const selectTotalBackgroundActive = (state) => state.dashboard.staffDashboard.totalBackgroundActive;
export const selectTotalModelChatBot = (state) => state.dashboard.staffDashboard.totalModelChatBot;
export const selectTotalTopic = (state) => state.dashboard.staffDashboard.totalTopic;
export const selectTotalQuestion = (state) => state.dashboard.staffDashboard.totalQuestion;
export const selectTotalContractor = (state) => state.dashboard.staffDashboard.totalContractor;
export const selectTotalContractorActive = (state) => state.dashboard.staffDashboard.totalContractorActive;
export const selectTotalContactorInternal = (state) => state.dashboard.staffDashboard.totalContactorInternal;
export const selectTotalContractorExternal = (state) => state.dashboard.staffDashboard.totalContractorExternal;
export const selectStaffTotalRevenue = (state) => state.dashboard.staffDashboard.totalRevenue;
export const selectTotalPayOSPayment = (state) => state.dashboard.staffDashboard.totalPayOSPayment;
export const selectTotalCastPayment = (state) => state.dashboard.staffDashboard.totalCastPayment;

// Selectors for orders statistics
export const selectOrdersStatsTotal = (state) => state.dashboard.ordersStats.total;
export const selectOrdersStatsProducing = (state) => state.dashboard.ordersStats.producing;
export const selectOrdersStatsProductionCompleted = (state) => state.dashboard.ordersStats.productionCompleted;
export const selectOrdersStatsDelivering = (state) => state.dashboard.ordersStats.delivering;
export const selectOrdersStatsInstalled = (state) => state.dashboard.ordersStats.installed;
export const selectOrdersStatsCompleted = (state) => state.dashboard.ordersStats.orderCompleted;
export const selectOrdersStatsCancelled = (state) => state.dashboard.ordersStats.cancelled;

// Selector for specific admin dashboard metrics
export const selectTotalOrders = (state) => state.dashboard.adminDashboard.totalOrders;
export const selectTotalUsers = (state) => state.dashboard.adminDashboard.totalUsers;
export const selectTotalRevenue = (state) => state.dashboard.adminDashboard.totalRevenue;
export const selectAdminCompletedOrders = (state) => state.dashboard.adminDashboard.completedOrders;
export const selectActiveContracts = (state) => state.dashboard.adminDashboard.activeContracts;

export default dashboardSlice.reducer;
