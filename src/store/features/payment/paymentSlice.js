import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  handleWebhook,
  confirmWebhookUrl,
  payOrderRemaining,
  payOrderDeposit,
  payDesignRemaining,
  payDesignDeposit
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

export default paymentSlice.reducer; 