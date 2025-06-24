import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createAiOrderApi, createOrderApi, getOrdersApi, updateOrderStatusApi, getOrderByIdApi, getOrdersByUserIdApi } from '../../../api/orderService';



// Định nghĩa mapping trạng thái đơn hàng thiết kế AI
export const ORDER_STATUS_MAP = {
  PENDING_CONTRACT: { label: "Chờ hợp đồng", color: "warning" },
  CONTRACT_SENT: { label: "Đã gửi hợp đồng", color: "info" },
  CONTRACT_SIGNED: { label: "Đã ký hợp đồng", color: "primary" },
  CONTRACT_DISCUSS: { label: "Đàm phán hợp đồng", color: "secondary" },
  CONTRACT_CONFIRMED: { label: "Xác nhận hợp đồng", color: "success" },
  DEPOSITED: { label: "Đã đặt cọc", color: "info" },
  IN_PROGRESS: { label: "Đang thực hiện", color: "primary" },
  PRODUCING: { label: "Đang sản xuất", color: "primary" },
  PRODUCTION_COMPLETED: { label: "Hoàn thành sản xuất", color: "success" },
  DELIVERING: { label: "Đang giao hàng", color: "info" },
  INSTALLED: { label: "Đã lắp đặt", color: "success" },
  COMPLETED: { label: "Hoàn tất", color: "success" },
  CANCELLED: { label: "Đã hủy", color: "error" },
};

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
      orderStatus = ORDER_STATUS_MAP;
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

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    const response = await getOrderByIdApi(orderId);
    if (response.success) return response.data;
    return rejectWithValue(response.error);
  }
);

export const fetchOrdersByUserId = createAsyncThunk(
  'order/fetchOrdersByUserId',
  async (userId, { rejectWithValue }) => {
    const response = await getOrdersByUserIdApi(userId);
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
  currentOrder: null,
  currentOrderStatus: 'idle',
  currentOrderError: null
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
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.currentOrderStatus = 'loading';
        state.currentOrderError = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrderStatus = 'succeeded';
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.currentOrderStatus = 'failed';
        state.currentOrderError = action.payload;
      })
      .addCase(fetchOrdersByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;

export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectCurrentOrderStatus = (state) => state.order.currentOrderStatus;
export const selectCurrentOrderError = (state) => state.order.currentOrderError;
