import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchStaffDashboardApi,
  fetchAdminDashboardApi,
  fetchSaleDashboardApi,
  fetchDesignerDashboardApi,
  fetchStaffOrdersStatsApi,
  fetchSaleOrdersStatsApi,
  fetchCustomDesignRequestsStatsApi,
  fetchPaymentsStatsApi
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
    totalUsers: 0,
    totalBannedUsers: 0,
    totalCustomer: 0,
    totalSale: 0,
    totalStaff: 0,
    totalDesigner: 0,
    totalAdmin: 0,
    totalPaymentTransactionCreated: 0,
    totalPaymentSuccess: 0,
    totalPaymentFailure: 0,
    totalPaymentCancelled: 0,
    totalPaymentSuccessAmount: 0,
    totalPaymentFailureAmount: 0,
    totalPaymentCancelledAmount: 0,
    totalPayOSSuccessAmount: 0,
    totalPayOSFailureAmount: 0,
    totalPayOSCancelledAmount: 0,
    totalCastAmount: 0,
    totalImage: 0,
    totalNotification: 0,
    totalChatBotUsed: 0
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
  designerDashboard: {
    totalCustomDesignRequestAssigned: 0,
    totalDemoSubmitted: 0,
    totalDemoApproved: 0,
    totalDemoRejected: 0,
    totalFinalDesignSubmitted: 0
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
  paymentsStats: {
    revenue: 0,
    payOSRevenue: 0,
    castRevenue: 0,
    designRevenue: 0,
    constructionRevenue: 0
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  ordersStatsStatus: 'idle', // separate status for orders stats
  saleOrdersStatsStatus: 'idle', // separate status for sale orders stats
  customDesignRequestsStatsStatus: 'idle', // separate status for custom design requests stats
  paymentsStatsStatus: 'idle', // separate status for payments stats
  error: null,
  ordersStatsError: null,
  saleOrdersStatsError: null,
  customDesignRequestsStatsError: null,
  paymentsStatsError: null,
  lastUpdated: null,
  ordersStatsLastUpdated: null,
  saleOrdersStatsLastUpdated: null,
  customDesignRequestsStatsLastUpdated: null,
  paymentsStatsLastUpdated: null
};

// Async thunk for fetching staff dashboard data (updated to pass date range)
export const fetchStaffDashboard = createAsyncThunk(
  'dashboard/fetchStaffDashboard',
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const response = await fetchStaffDashboardApi(startDate, endDate);

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
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const response = await fetchSaleDashboardApi(startDate, endDate);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch sale dashboard');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for fetching designer dashboard data
export const fetchDesignerDashboard = createAsyncThunk(
  'dashboard/fetchDesignerDashboard',
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const response = await fetchDesignerDashboardApi(startDate, endDate);

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch designer dashboard');
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

// Async thunk for fetching payments statistics
export const fetchPaymentsStats = createAsyncThunk(
  'dashboard/fetchPaymentsStats',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await fetchPaymentsStatsApi(startDate, endDate);

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch payments statistics');
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
    // Reset payments stats status
    resetPaymentsStatsStatus: (state) => {
      state.paymentsStatsStatus = 'idle';
      state.paymentsStatsError = null;
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
        totalUsers: 0,
        totalBannedUsers: 0,
        totalCustomer: 0,
        totalSale: 0,
        totalStaff: 0,
        totalDesigner: 0,
        totalAdmin: 0,
        totalPaymentTransactionCreated: 0,
        totalPaymentSuccess: 0,
        totalPaymentFailure: 0,
        totalPaymentCancelled: 0,
        totalPaymentSuccessAmount: 0,
        totalPaymentFailureAmount: 0,
        totalPaymentCancelledAmount: 0,
        totalPayOSSuccessAmount: 0,
        totalPayOSFailureAmount: 0,
        totalPayOSCancelledAmount: 0,
        totalCastAmount: 0,
        totalImage: 0,
        totalNotification: 0,
        totalChatBotUsed: 0
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
      state.designerDashboard = {
        totalCustomDesignRequestAssigned: 0,
        totalDemoSubmitted: 0,
        totalDemoApproved: 0,
        totalDemoRejected: 0,
        totalFinalDesignSubmitted: 0
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
      state.paymentsStats = {
        revenue: 0,
        payOSRevenue: 0,
        castRevenue: 0,
        designRevenue: 0,
        constructionRevenue: 0
      };
      state.lastUpdated = null;
      state.ordersStatsLastUpdated = null;
      state.saleOrdersStatsLastUpdated = null;
      state.customDesignRequestsStatsLastUpdated = null;
      state.paymentsStatsLastUpdated = null;
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
        // Merge to preserve missing legacy keys (set to previous or 0)
        state.staffDashboard = { ...state.staffDashboard, ...action.payload };
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
        state.saleDashboard = { ...state.saleDashboard, ...action.payload };
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchSaleDashboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch designer dashboard
      .addCase(fetchDesignerDashboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDesignerDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.designerDashboard = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDesignerDashboard.rejected, (state, action) => {
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
      })
      // Fetch payments stats
      .addCase(fetchPaymentsStats.pending, (state) => {
        state.paymentsStatsStatus = 'loading';
        state.paymentsStatsError = null;
      })
      .addCase(fetchPaymentsStats.fulfilled, (state, action) => {
        state.paymentsStatsStatus = 'succeeded';
        state.paymentsStats = action.payload;
        state.paymentsStatsLastUpdated = new Date().toISOString();
        state.paymentsStatsError = null;
      })
      .addCase(fetchPaymentsStats.rejected, (state, action) => {
        state.paymentsStatsStatus = 'failed';
        state.paymentsStatsError = action.payload;
      });
  }
});

// Export actions
export const {
  resetDashboardStatus,
  resetOrdersStatsStatus,
  resetSaleOrdersStatsStatus,
  resetCustomDesignRequestsStatsStatus,
  resetPaymentsStatsStatus,
  clearDashboardData
} = dashboardSlice.actions;

// Export selectors
export const selectStaffDashboard = (state) => state.dashboard.staffDashboard;
export const selectAdminDashboard = (state) => state.dashboard.adminDashboard;
export const selectSaleDashboard = (state) => state.dashboard.saleDashboard;
export const selectDesignerDashboard = (state) => state.dashboard.designerDashboard;
export const selectOrdersStats = (state) => state.dashboard.ordersStats;
export const selectSaleOrdersStats = (state) => state.dashboard.saleOrdersStats;
export const selectCustomDesignRequestsStats = (state) => state.dashboard.customDesignRequestsStats;
export const selectPaymentsStats = (state) => state.dashboard.paymentsStats;
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectOrdersStatsStatus = (state) => state.dashboard.ordersStatsStatus;
export const selectSaleOrdersStatsStatus = (state) => state.dashboard.saleOrdersStatsStatus;
export const selectCustomDesignRequestsStatsStatus = (state) => state.dashboard.customDesignRequestsStatsStatus;
export const selectPaymentsStatsStatus = (state) => state.dashboard.paymentsStatsStatus;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectOrdersStatsError = (state) => state.dashboard.ordersStatsError;
export const selectSaleOrdersStatsError = (state) => state.dashboard.saleOrdersStatsError;
export const selectCustomDesignRequestsStatsError = (state) => state.dashboard.customDesignRequestsStatsError;
export const selectPaymentsStatsError = (state) => state.dashboard.paymentsStatsError;
export const selectDashboardLastUpdated = (state) => state.dashboard.lastUpdated;
export const selectOrdersStatsLastUpdated = (state) => state.dashboard.ordersStatsLastUpdated;
export const selectSaleOrdersStatsLastUpdated = (state) => state.dashboard.saleOrdersStatsLastUpdated;
export const selectCustomDesignRequestsStatsLastUpdated = (state) => state.dashboard.customDesignRequestsStatsLastUpdated;
export const selectPaymentsStatsLastUpdated = (state) => state.dashboard.paymentsStatsLastUpdated;

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
export const selectAdminTotalUsers = (state) => state.dashboard.adminDashboard.totalUsers;
export const selectAdminTotalBannedUsers = (state) => state.dashboard.adminDashboard.totalBannedUsers;
export const selectAdminTotalCustomer = (state) => state.dashboard.adminDashboard.totalCustomer;
export const selectAdminTotalSale = (state) => state.dashboard.adminDashboard.totalSale;
export const selectAdminTotalStaff = (state) => state.dashboard.adminDashboard.totalStaff;
export const selectAdminTotalDesigner = (state) => state.dashboard.adminDashboard.totalDesigner;
export const selectAdminTotalAdmin = (state) => state.dashboard.adminDashboard.totalAdmin;
export const selectAdminTotalPaymentTransactionCreated = (state) => state.dashboard.adminDashboard.totalPaymentTransactionCreated;
export const selectAdminTotalPaymentSuccess = (state) => state.dashboard.adminDashboard.totalPaymentSuccess;
export const selectAdminTotalPaymentFailure = (state) => state.dashboard.adminDashboard.totalPaymentFailure;
export const selectAdminTotalPaymentCancelled = (state) => state.dashboard.adminDashboard.totalPaymentCancelled;
export const selectAdminTotalPaymentSuccessAmount = (state) => state.dashboard.adminDashboard.totalPaymentSuccessAmount;
export const selectAdminTotalPaymentFailureAmount = (state) => state.dashboard.adminDashboard.totalPaymentFailureAmount;
export const selectAdminTotalPaymentCancelledAmount = (state) => state.dashboard.adminDashboard.totalPaymentCancelledAmount;
export const selectAdminTotalPayOSSuccessAmount = (state) => state.dashboard.adminDashboard.totalPayOSSuccessAmount;
export const selectAdminTotalPayOSFailureAmount = (state) => state.dashboard.adminDashboard.totalPayOSFailureAmount;
export const selectAdminTotalPayOSCancelledAmount = (state) => state.dashboard.adminDashboard.totalPayOSCancelledAmount;
export const selectAdminTotalCastAmount = (state) => state.dashboard.adminDashboard.totalCastAmount;
export const selectAdminTotalImage = (state) => state.dashboard.adminDashboard.totalImage;
export const selectAdminTotalNotification = (state) => state.dashboard.adminDashboard.totalNotification;
export const selectAdminTotalChatBotUsed = (state) => state.dashboard.adminDashboard.totalChatBotUsed;

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

// Selectors for payments statistics
export const selectPaymentsStatsRevenue = (state) => state.dashboard.paymentsStats.revenue;
export const selectPaymentsStatsPayOSRevenue = (state) => state.dashboard.paymentsStats.payOSRevenue;
export const selectPaymentsStatsCastRevenue = (state) => state.dashboard.paymentsStats.castRevenue;
export const selectPaymentsStatsDesignRevenue = (state) => state.dashboard.paymentsStats.designRevenue;
export const selectPaymentsStatsConstructionRevenue = (state) => state.dashboard.paymentsStats.constructionRevenue;

// Selectors for designer dashboard metrics
export const selectDesignerTotalCustomDesignRequestAssigned = (state) => state.dashboard.designerDashboard.totalCustomDesignRequestAssigned;
export const selectDesignerTotalDemoSubmitted = (state) => state.dashboard.designerDashboard.totalDemoSubmitted;
export const selectDesignerTotalDemoApproved = (state) => state.dashboard.designerDashboard.totalDemoApproved;
export const selectDesignerTotalDemoRejected = (state) => state.dashboard.designerDashboard.totalDemoRejected;
export const selectDesignerTotalFinalDesignSubmitted = (state) => state.dashboard.designerDashboard.totalFinalDesignSubmitted;

export default dashboardSlice.reducer;
