import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchStaffDashboardApi, 
  fetchAdminDashboardApi, 
  fetchSaleDashboardApi, 
  fetchStaffOrdersStatsApi,
  fetchSaleOrdersStatsApi,
  fetchCustomDesignRequestsStatsApi
} from '../../../api/dashboardService';

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
  saleDashboard: {
    totalOrders: 0,
    totalOrderCompleted: 0,
    totalOrderInProgress: 0,
    totalOrderCancelled: 0,
    totalAiDesignOrder: 0,
    totalCustomDesignOrder: 0,
    totalCustomDesignRequest: 0,
    totalCustomDesignRequestCompleted: 0,
    totalCustomDesignRequestInProgress: 0,
    totalCustomDesignRequestCancelled: 0,
    totalRevenue: 0,
    totalPayOSPayment: 0,
    totalCastPayment: 0,
    totalDesignPaid: 0,
    totalOrderPaid: 0,
    totalContractSigned: 0,
    totalFeedback: 0,
    totalFeedbackResponse: 0,
    totalTicket: 0,
    totalTicketInProgress: 0,
    totalTicketClosed: 0,
    totalTicketDelivered: 0
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
  saleOrdersStats: {
    total: 0,
    pendingDesign: 0,
    needDepositDesign: 0,
    depositedDesign: 0,
    needFullyPaidDesign: 0,
    waitingFinalDesign: 0,
    designCompleted: 0,
    pendingContract: 0,
    contractSent: 0,
    contractSigned: 0,
    contractDiscuss: 0,
    contractResigned: 0,
    contractConfirmed: 0,
    deposited: 0,
    inProgress: 0,
    cancelled: 0
  },
  customDesignRequestsStats: {
    total: 0,
    pending: 0,
    pricingNotified: 0,
    rejectedPricing: 0,
    approvedPricing: 0,
    deposited: 0,
    assignedDesigner: 0,
    processing: 0,
    designerRejected: 0,
    demoSubmitted: 0,
    revisionRequested: 0,
    waitingFullPayment: 0,
    fullyPaid: 0,
    completed: 0,
    cancelled: 0
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  ordersStatsStatus: 'idle', // separate status for orders stats
  saleOrdersStatsStatus: 'idle', // separate status for sale orders stats
  customDesignRequestsStatsStatus: 'idle', // separate status for custom design requests stats
  error: null,
  ordersStatsError: null,
  saleOrdersStatsError: null,
  customDesignRequestsStatsError: null,
  lastUpdated: null,
  ordersStatsLastUpdated: null,
  saleOrdersStatsLastUpdated: null,
  customDesignRequestsStatsLastUpdated: null
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

// Async thunk for fetching sale dashboard data
export const fetchSaleDashboard = createAsyncThunk(
  'dashboard/fetchSaleDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchSaleDashboardApi();

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch sale dashboard');
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

// Async thunk for fetching sale orders statistics
export const fetchSaleOrdersStats = createAsyncThunk(
  'dashboard/fetchSaleOrdersStats',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await fetchSaleOrdersStatsApi(startDate, endDate);

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch sale orders statistics');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for fetching custom design requests statistics
export const fetchCustomDesignRequestsStats = createAsyncThunk(
  'dashboard/fetchCustomDesignRequestsStats',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await fetchCustomDesignRequestsStatsApi(startDate, endDate);

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch custom design requests statistics');
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
    // Reset sale orders stats status
    resetSaleOrdersStatsStatus: (state) => {
      state.saleOrdersStatsStatus = 'idle';
      state.saleOrdersStatsError = null;
    },
    // Reset custom design requests stats status
    resetCustomDesignRequestsStatsStatus: (state) => {
      state.customDesignRequestsStatsStatus = 'idle';
      state.customDesignRequestsStatsError = null;
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
      state.saleDashboard = {
        totalOrders: 0,
        totalOrderCompleted: 0,
        totalOrderInProgress: 0,
        totalOrderCancelled: 0,
        totalAiDesignOrder: 0,
        totalCustomDesignOrder: 0,
        totalCustomDesignRequest: 0,
        totalCustomDesignRequestCompleted: 0,
        totalCustomDesignRequestInProgress: 0,
        totalCustomDesignRequestCancelled: 0,
        totalRevenue: 0,
        totalPayOSPayment: 0,
        totalCastPayment: 0,
        totalDesignPaid: 0,
        totalOrderPaid: 0,
        totalContractSigned: 0,
        totalFeedback: 0,
        totalFeedbackResponse: 0,
        totalTicket: 0,
        totalTicketInProgress: 0,
        totalTicketClosed: 0,
        totalTicketDelivered: 0
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
      state.saleOrdersStats = {
        total: 0,
        pendingDesign: 0,
        needDepositDesign: 0,
        depositedDesign: 0,
        needFullyPaidDesign: 0,
        waitingFinalDesign: 0,
        designCompleted: 0,
        pendingContract: 0,
        contractSent: 0,
        contractSigned: 0,
        contractDiscuss: 0,
        contractResigned: 0,
        contractConfirmed: 0,
        deposited: 0,
        inProgress: 0,
        cancelled: 0
      };
      state.customDesignRequestsStats = {
        total: 0,
        pending: 0,
        pricingNotified: 0,
        rejectedPricing: 0,
        approvedPricing: 0,
        deposited: 0,
        assignedDesigner: 0,
        processing: 0,
        designerRejected: 0,
        demoSubmitted: 0,
        revisionRequested: 0,
        waitingFullPayment: 0,
        fullyPaid: 0,
        completed: 0,
        cancelled: 0
      };
      state.lastUpdated = null;
      state.ordersStatsLastUpdated = null;
      state.saleOrdersStatsLastUpdated = null;
      state.customDesignRequestsStatsLastUpdated = null;
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
      // Fetch sale dashboard
      .addCase(fetchSaleDashboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSaleDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.saleDashboard = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchSaleDashboard.rejected, (state, action) => {
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
      })
      // Fetch sale orders stats
      .addCase(fetchSaleOrdersStats.pending, (state) => {
        state.saleOrdersStatsStatus = 'loading';
        state.saleOrdersStatsError = null;
      })
      .addCase(fetchSaleOrdersStats.fulfilled, (state, action) => {
        state.saleOrdersStatsStatus = 'succeeded';
        state.saleOrdersStats = action.payload;
        state.saleOrdersStatsLastUpdated = new Date().toISOString();
        state.saleOrdersStatsError = null;
      })
      .addCase(fetchSaleOrdersStats.rejected, (state, action) => {
        state.saleOrdersStatsStatus = 'failed';
        state.saleOrdersStatsError = action.payload;
      })
      // Fetch custom design requests stats
      .addCase(fetchCustomDesignRequestsStats.pending, (state) => {
        state.customDesignRequestsStatsStatus = 'loading';
        state.customDesignRequestsStatsError = null;
      })
      .addCase(fetchCustomDesignRequestsStats.fulfilled, (state, action) => {
        state.customDesignRequestsStatsStatus = 'succeeded';
        state.customDesignRequestsStats = action.payload;
        state.customDesignRequestsStatsLastUpdated = new Date().toISOString();
        state.customDesignRequestsStatsError = null;
      })
      .addCase(fetchCustomDesignRequestsStats.rejected, (state, action) => {
        state.customDesignRequestsStatsStatus = 'failed';
        state.customDesignRequestsStatsError = action.payload;
      });
  }
});

// Export actions
export const {
  resetDashboardStatus,
  resetOrdersStatsStatus,
  resetSaleOrdersStatsStatus,
  resetCustomDesignRequestsStatsStatus,
  clearDashboardData
} = dashboardSlice.actions;

// Export selectors
export const selectStaffDashboard = (state) => state.dashboard.staffDashboard;
export const selectAdminDashboard = (state) => state.dashboard.adminDashboard;
export const selectSaleDashboard = (state) => state.dashboard.saleDashboard;
export const selectOrdersStats = (state) => state.dashboard.ordersStats;
export const selectSaleOrdersStats = (state) => state.dashboard.saleOrdersStats;
export const selectCustomDesignRequestsStats = (state) => state.dashboard.customDesignRequestsStats;
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectOrdersStatsStatus = (state) => state.dashboard.ordersStatsStatus;
export const selectSaleOrdersStatsStatus = (state) => state.dashboard.saleOrdersStatsStatus;
export const selectCustomDesignRequestsStatsStatus = (state) => state.dashboard.customDesignRequestsStatsStatus;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectOrdersStatsError = (state) => state.dashboard.ordersStatsError;
export const selectSaleOrdersStatsError = (state) => state.dashboard.saleOrdersStatsError;
export const selectCustomDesignRequestsStatsError = (state) => state.dashboard.customDesignRequestsStatsError;
export const selectDashboardLastUpdated = (state) => state.dashboard.lastUpdated;
export const selectOrdersStatsLastUpdated = (state) => state.dashboard.ordersStatsLastUpdated;
export const selectSaleOrdersStatsLastUpdated = (state) => state.dashboard.saleOrdersStatsLastUpdated;
export const selectCustomDesignRequestsStatsLastUpdated = (state) => state.dashboard.customDesignRequestsStatsLastUpdated;

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

// Selectors for sale dashboard metrics
export const selectSaleTotalOrders = (state) => state.dashboard.saleDashboard.totalOrders;
export const selectSaleTotalOrderCompleted = (state) => state.dashboard.saleDashboard.totalOrderCompleted;
export const selectSaleTotalOrderInProgress = (state) => state.dashboard.saleDashboard.totalOrderInProgress;
export const selectSaleTotalOrderCancelled = (state) => state.dashboard.saleDashboard.totalOrderCancelled;
export const selectSaleTotalAiDesignOrder = (state) => state.dashboard.saleDashboard.totalAiDesignOrder;
export const selectSaleTotalCustomDesignOrder = (state) => state.dashboard.saleDashboard.totalCustomDesignOrder;
export const selectSaleTotalCustomDesignRequest = (state) => state.dashboard.saleDashboard.totalCustomDesignRequest;
export const selectSaleTotalCustomDesignRequestCompleted = (state) => state.dashboard.saleDashboard.totalCustomDesignRequestCompleted;
export const selectSaleTotalCustomDesignRequestInProgress = (state) => state.dashboard.saleDashboard.totalCustomDesignRequestInProgress;
export const selectSaleTotalCustomDesignRequestCancelled = (state) => state.dashboard.saleDashboard.totalCustomDesignRequestCancelled;
export const selectSaleTotalRevenue = (state) => state.dashboard.saleDashboard.totalRevenue;
export const selectSaleTotalPayOSPayment = (state) => state.dashboard.saleDashboard.totalPayOSPayment;
export const selectSaleTotalCastPayment = (state) => state.dashboard.saleDashboard.totalCastPayment;
export const selectSaleTotalDesignPaid = (state) => state.dashboard.saleDashboard.totalDesignPaid;
export const selectSaleTotalOrderPaid = (state) => state.dashboard.saleDashboard.totalOrderPaid;
export const selectSaleTotalContractSigned = (state) => state.dashboard.saleDashboard.totalContractSigned;
export const selectSaleTotalFeedback = (state) => state.dashboard.saleDashboard.totalFeedback;
export const selectSaleTotalFeedbackResponse = (state) => state.dashboard.saleDashboard.totalFeedbackResponse;
export const selectSaleTotalTicket = (state) => state.dashboard.saleDashboard.totalTicket;
export const selectSaleTotalTicketInProgress = (state) => state.dashboard.saleDashboard.totalTicketInProgress;
export const selectSaleTotalTicketClosed = (state) => state.dashboard.saleDashboard.totalTicketClosed;
export const selectSaleTotalTicketDelivered = (state) => state.dashboard.saleDashboard.totalTicketDelivered;

// Selectors for sale orders statistics
export const selectSaleOrdersStatsTotal = (state) => state.dashboard.saleOrdersStats.total;
export const selectSaleOrdersStatsPendingDesign = (state) => state.dashboard.saleOrdersStats.pendingDesign;
export const selectSaleOrdersStatsNeedDepositDesign = (state) => state.dashboard.saleOrdersStats.needDepositDesign;
export const selectSaleOrdersStatsDepositedDesign = (state) => state.dashboard.saleOrdersStats.depositedDesign;
export const selectSaleOrdersStatsNeedFullyPaidDesign = (state) => state.dashboard.saleOrdersStats.needFullyPaidDesign;
export const selectSaleOrdersStatsWaitingFinalDesign = (state) => state.dashboard.saleOrdersStats.waitingFinalDesign;
export const selectSaleOrdersStatsDesignCompleted = (state) => state.dashboard.saleOrdersStats.designCompleted;
export const selectSaleOrdersStatsPendingContract = (state) => state.dashboard.saleOrdersStats.pendingContract;
export const selectSaleOrdersStatsContractSent = (state) => state.dashboard.saleOrdersStats.contractSent;
export const selectSaleOrdersStatsContractSigned = (state) => state.dashboard.saleOrdersStats.contractSigned;
export const selectSaleOrdersStatsContractDiscuss = (state) => state.dashboard.saleOrdersStats.contractDiscuss;
export const selectSaleOrdersStatsContractResigned = (state) => state.dashboard.saleOrdersStats.contractResigned;
export const selectSaleOrdersStatsContractConfirmed = (state) => state.dashboard.saleOrdersStats.contractConfirmed;
export const selectSaleOrdersStatsDeposited = (state) => state.dashboard.saleOrdersStats.deposited;
export const selectSaleOrdersStatsInProgress = (state) => state.dashboard.saleOrdersStats.inProgress;
export const selectSaleOrdersStatsCancelled = (state) => state.dashboard.saleOrdersStats.cancelled;

// Selectors for custom design requests statistics
export const selectCustomDesignRequestsStatsTotal = (state) => state.dashboard.customDesignRequestsStats.total;
export const selectCustomDesignRequestsStatsPending = (state) => state.dashboard.customDesignRequestsStats.pending;
export const selectCustomDesignRequestsStatsPricingNotified = (state) => state.dashboard.customDesignRequestsStats.pricingNotified;
export const selectCustomDesignRequestsStatsRejectedPricing = (state) => state.dashboard.customDesignRequestsStats.rejectedPricing;
export const selectCustomDesignRequestsStatsApprovedPricing = (state) => state.dashboard.customDesignRequestsStats.approvedPricing;
export const selectCustomDesignRequestsStatsDeposited = (state) => state.dashboard.customDesignRequestsStats.deposited;
export const selectCustomDesignRequestsStatsAssignedDesigner = (state) => state.dashboard.customDesignRequestsStats.assignedDesigner;
export const selectCustomDesignRequestsStatsProcessing = (state) => state.dashboard.customDesignRequestsStats.processing;
export const selectCustomDesignRequestsStatsDesignerRejected = (state) => state.dashboard.customDesignRequestsStats.designerRejected;
export const selectCustomDesignRequestsStatsDemoSubmitted = (state) => state.dashboard.customDesignRequestsStats.demoSubmitted;
export const selectCustomDesignRequestsStatsRevisionRequested = (state) => state.dashboard.customDesignRequestsStats.revisionRequested;
export const selectCustomDesignRequestsStatsWaitingFullPayment = (state) => state.dashboard.customDesignRequestsStats.waitingFullPayment;
export const selectCustomDesignRequestsStatsFullyPaid = (state) => state.dashboard.customDesignRequestsStats.fullyPaid;
export const selectCustomDesignRequestsStatsCompleted = (state) => state.dashboard.customDesignRequestsStats.completed;
export const selectCustomDesignRequestsStatsCancelled = (state) => state.dashboard.customDesignRequestsStats.cancelled;

export default dashboardSlice.reducer;
