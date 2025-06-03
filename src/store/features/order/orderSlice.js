import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createAiOrderApi, createOrderApi, getOrdersApi, updateOrderStatusApi } from '../../../api/orderService';

// Định nghĩa tất cả các trạng thái hợp lệ
export const ALL_ORDER_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "DEPOSITED",
  "COMPLETED",
  "PROCESSING"
];

// Async thunks
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async ({ customerChoiceId, orderData }, { rejectWithValue }) => {
    const response = await createOrderApi(customerChoiceId, orderData);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
export const createAiOrder = createAsyncThunk(
  'order/createAiOrder',
  async ({ aiDesignId, customerChoiceId, orderData }, { rejectWithValue }) => {
    const response = await createAiOrderApi(aiDesignId, customerChoiceId, orderData);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (orderStatus, { rejectWithValue }) => {
    // orderStatus có thể là undefined, string hoặc mảng
    let allOrders = [];
    if (!orderStatus) {
      // Nếu không truyền gì, lấy tất cả trạng thái
      orderStatus = ALL_ORDER_STATUSES;
    }
    if (Array.isArray(orderStatus)) {
      // Nếu là mảng, gọi API cho từng trạng thái và gộp kết quả
      for (const status of orderStatus) {
        const response = await getOrdersApi(status);
        if (response.success) {
          allOrders = allOrders.concat(response.data);
        }
      }
      return allOrders;
    } else {
      // Nếu là string
      const response = await getOrdersApi(orderStatus);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    const response = await updateOrderStatusApi(orderId, status);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);

const initialState = {
  orders: [],
  loading: false,
  error: null,
  currentOrder: null
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
        .addCase(createAiOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAiOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createAiOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
