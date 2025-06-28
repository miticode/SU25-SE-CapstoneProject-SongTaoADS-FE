import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  handleWebhook,
  confirmWebhookUrl,
  payOrderRemaining,
  payOrderDeposit,
  payCustomDesignRemaining,
  payCustomDesignDeposit
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
    const response = await payOrderRemaining(orderId);
    if (response.success) return response;
    return rejectWithValue(response.error);
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
      return rejectWithValue(error.message || 'Failed to process deposit payment');
    }
  }
);

// 5. Thanh toán hết thiết kế custom
export const payCustomDesignRemainingThunk = createAsyncThunk(
  'payment/payCustomDesignRemaining',
  async (customDesignRequestId, { rejectWithValue }) => {
    const response = await payCustomDesignRemaining(customDesignRequestId);
    if (response.success) return response;
    return rejectWithValue(response.error);
  }
);

// 6. Đặt cọc yêu cầu thiết kế custom
export const payCustomDesignDepositThunk = createAsyncThunk(
  'payment/payCustomDesignDeposit',
  async (customDesignRequestId, { rejectWithValue }) => {
    const response = await payCustomDesignDeposit(customDesignRequestId);
    if (response.success) return response;
    return rejectWithValue(response.error);
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
  customDesignRemainingResult: null,
  customDesignDepositResult: null,
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
      state.customDesignRemainingResult = null;
      state.customDesignDepositResult = null;
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
      // Pay Custom Design Remaining
      .addCase(payCustomDesignRemainingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(payCustomDesignRemainingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.customDesignRemainingResult = action.payload;
      })
      .addCase(payCustomDesignRemainingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Pay Custom Design Deposit
      .addCase(payCustomDesignDepositThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(payCustomDesignDepositThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.customDesignDepositResult = action.payload;
      })
      .addCase(payCustomDesignDepositThunk.rejected, (state, action) => {
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
export const selectCustomDesignRemainingResult = (state) => state.payment.customDesignRemainingResult;
export const selectCustomDesignDepositResult = (state) => state.payment.customDesignDepositResult;

export default paymentSlice.reducer; 