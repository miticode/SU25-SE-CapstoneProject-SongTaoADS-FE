import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  handleWebhook,
  confirmWebhookUrl,
  payOrderRemaining,
  payOrderDeposit,
  payDesignRemaining,
  payDesignDeposit,
  getUserPayments,
  getOrderPayments,
  castPaid
} from '../../../api/paymentService';

// ================== PAYMENT THUNKS ==================

// 1. Xử lý webhook từ PayOS
export const handleWebhookThunk = createAsyncThunk(
  'payment/handleWebhook',
  async (payload, { rejectWithValue }) => {
    const response = await handleWebhook(payload);
    if (response.success) return response;
    return rejectWithValue(response.error);
  }
);

// 2. Xác nhận URL webhook với PayOS
export const confirmWebhookUrlThunk = createAsyncThunk(
  'payment/confirmWebhookUrl',
  async (payload, { rejectWithValue }) => {
    const response = await confirmWebhookUrl(payload);
    if (response.success) return response;
    return rejectWithValue(response.error);
  }
);

// 3. Thanh toán hết đơn hàng (order)
export const payOrderRemainingThunk = createAsyncThunk(
  'payment/payOrderRemaining',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await payOrderRemaining(orderId);
      console.log("PayOrderRemaining response:", response); // Debug log

      if (response.success) {
        return response;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      console.error("PayOrderRemainingThunk error:", error);
      return rejectWithValue(error.message || 'Không thể xử lý thanh toán số tiền còn lại');
    }
  }
);

// 4. Đặt cọc theo đơn hàng (order)
export const payOrderDepositThunk = createAsyncThunk(
  'payment/payOrderDeposit',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await payOrderDeposit(orderId);
      console.log("PayOrderDeposit response:", response); // Debug log

      if (response.success) {
        return response;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      console.error("PayOrderDepositThunk error:", error);
      return rejectWithValue(error.message || 'Không thể xử lý đặt cọc đơn hàng');
    }
  }
);

// 5. Thanh toán hết thiết kế
export const payDesignRemainingThunk = createAsyncThunk(
  'payment/payDesignRemaining',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await payDesignRemaining(orderId);
      console.log("PayDesignRemaining response:", response); // Debug log

      if (response.success) {
        return response;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      console.error("PayDesignRemainingThunk error:", error);
      return rejectWithValue(error.message || 'Không thể xử lý thanh toán hết thiết kế');
    }
  }
);

// 6. Đặt cọc theo thiết kế
export const payDesignDepositThunk = createAsyncThunk(
  'payment/payDesignDeposit',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await payDesignDeposit(orderId);
      console.log("PayDesignDeposit response:", response); // Debug log

      if (response.success) {
        return response;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      console.error("PayDesignDepositThunk error:", error);
      return rejectWithValue(error.message || 'Không thể xử lý đặt cọc thiết kế');
    }
  }
);

// 7. Lấy danh sách payments của user
export const getUserPaymentsThunk = createAsyncThunk(
  'payment/getUserPayments',
  async ({ userId, page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await getUserPayments(userId, page, size);
      console.log("GetUserPayments response:", response); // Debug log

      if (response.success) {
        return response;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      console.error("GetUserPaymentsThunk error:", error);
      return rejectWithValue(error.message || 'Không thể lấy danh sách thanh toán');
    }
  }
);

// 8. Lấy danh sách payments theo orderId
export const getOrderPaymentsThunk = createAsyncThunk(
  'payment/getOrderPayments',
  async ({ orderId, page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await getOrderPayments(orderId, page, size);
      console.log("GetOrderPayments response:", response); // Debug log

      if (response.success) {
        return response;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      console.error("GetOrderPaymentsThunk error:", error);
      return rejectWithValue(error.message || 'Không thể lấy danh sách thanh toán của đơn hàng');
    }
  }
);

// 9. Cast paid - Đánh dấu đã thanh toán
export const castPaidThunk = createAsyncThunk(
  'payment/castPaid',
  async ({ orderId, paymentType }, { rejectWithValue }) => {
    try {
      const response = await castPaid(orderId, paymentType);
      console.log("CastPaid response:", response); // Debug log

      if (response.success) {
        return response;
      }
      return rejectWithValue(response.error);
    } catch (error) {
      console.error("CastPaidThunk error:", error);
      return rejectWithValue(error.message || 'Không thể đánh dấu đã thanh toán');
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  success: null,
  webhookResult: null,
  confirmWebhookResult: null,
  orderRemainingResult: null,
  orderDepositResult: null,
  designRemainingResult: null,
  designDepositResult: null,
  castPaidResult: null,
  // User payments
  userPayments: [],
  userPaymentsPagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0
  },
  userPaymentsLoading: false,
  // Order payments
  orderPayments: [],
  orderPaymentsPagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0
  },
  orderPaymentsLoading: false,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
      state.webhookResult = null;
      state.confirmWebhookResult = null;
      state.orderRemainingResult = null;
      state.orderDepositResult = null;
      state.designRemainingResult = null;
      state.designDepositResult = null;
      state.castPaidResult = null;
      state.userPayments = [];
      state.userPaymentsPagination = {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalElements: 0
      };
      state.userPaymentsLoading = false;
      state.orderPayments = [];
      state.orderPaymentsPagination = {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalElements: 0
      };
      state.orderPaymentsLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Handle Webhook
    builder
      .addCase(handleWebhookThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(handleWebhookThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.webhookResult = action.payload;
      })
      .addCase(handleWebhookThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Confirm Webhook
      .addCase(confirmWebhookUrlThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(confirmWebhookUrlThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.confirmWebhookResult = action.payload;
      })
      .addCase(confirmWebhookUrlThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Pay Order Remaining
      .addCase(payOrderRemainingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(payOrderRemainingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orderRemainingResult = action.payload;
      })
      .addCase(payOrderRemainingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Pay Order Deposit
      .addCase(payOrderDepositThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(payOrderDepositThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orderDepositResult = action.payload;
      })
      .addCase(payOrderDepositThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Pay Design Remaining
      .addCase(payDesignRemainingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(payDesignRemainingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.designRemainingResult = action.payload;
      })
      .addCase(payDesignRemainingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Pay Design Deposit
      .addCase(payDesignDepositThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(payDesignDepositThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.designDepositResult = action.payload;
      })
      .addCase(payDesignDepositThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get User Payments
      .addCase(getUserPaymentsThunk.pending, (state) => {
        state.userPaymentsLoading = true;
        state.error = null;
      })
      .addCase(getUserPaymentsThunk.fulfilled, (state, action) => {
        state.userPaymentsLoading = false;
        state.userPayments = action.payload.data;
        state.userPaymentsPagination = action.payload.pagination;
      })
      .addCase(getUserPaymentsThunk.rejected, (state, action) => {
        state.userPaymentsLoading = false;
        state.error = action.payload;
        state.userPayments = [];
        state.userPaymentsPagination = {
          currentPage: 1,
          totalPages: 1,
          pageSize: 10,
          totalElements: 0
        };
      })
      // Get Order Payments
      .addCase(getOrderPaymentsThunk.pending, (state) => {
        state.orderPaymentsLoading = true;
        state.error = null;
      })
      .addCase(getOrderPaymentsThunk.fulfilled, (state, action) => {
        state.orderPaymentsLoading = false;
        state.orderPayments = action.payload.data;
        state.orderPaymentsPagination = action.payload.pagination;
      })
      .addCase(getOrderPaymentsThunk.rejected, (state, action) => {
        state.orderPaymentsLoading = false;
        state.error = action.payload;
        state.orderPayments = [];
        state.orderPaymentsPagination = {
          currentPage: 1,
          totalPages: 1,
          pageSize: 10,
          totalElements: 0
        };
      })
      // Cast Paid
      .addCase(castPaidThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(castPaidThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.castPaidResult = action.payload;
      })
      .addCase(castPaidThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearPaymentState } = paymentSlice.actions;

// Selectors
export const selectPaymentLoading = (state) => state.payment.loading;
export const selectPaymentError = (state) => state.payment.error;
export const selectPaymentSuccess = (state) => state.payment.success;
export const selectWebhookResult = (state) => state.payment.webhookResult;
export const selectConfirmWebhookResult = (state) => state.payment.confirmWebhookResult;
export const selectOrderRemainingResult = (state) => state.payment.orderRemainingResult;
export const selectOrderDepositResult = (state) => state.payment.orderDepositResult;
export const selectDesignRemainingResult = (state) => state.payment.designRemainingResult;
export const selectDesignDepositResult = (state) => state.payment.designDepositResult;
export const selectCastPaidResult = (state) => state.payment.castPaidResult;
export const selectUserPayments = (state) => state.payment.userPayments;
export const selectUserPaymentsPagination = (state) => state.payment.userPaymentsPagination;
export const selectUserPaymentsLoading = (state) => state.payment.userPaymentsLoading;
export const selectOrderPayments = (state) => state.payment.orderPayments;
export const selectOrderPaymentsPagination = (state) => state.payment.orderPaymentsPagination;
export const selectOrderPaymentsLoading = (state) => state.payment.orderPaymentsLoading;

export default paymentSlice.reducer; 