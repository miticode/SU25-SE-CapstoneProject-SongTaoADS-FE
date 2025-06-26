import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAiOrderApi,
  createOrderApi,
  getOrdersApi,
  updateOrderStatusApi,
  getOrderByIdApi,
  getOrdersByUserIdApi,
  createOrderFromDesignRequestApi,
  contractResignOrderApi,
  contractSignedOrderApi,
} from "../../../api/orderService";

// Định nghĩa mapping trạng thái đơn hàng thiết kế AI
export const ORDER_STATUS_MAP = {
  PENDING_CONTRACT: { label: "Chờ hợp đồng", color: "warning" },
  CONTRACT_SENT: { label: "Đã gửi hợp đồng", color: "info" },
  CONTRACT_SIGNED: { label: "Đã ký hợp đồng", color: "primary" },
  CONTRACT_DISCUSS: { label: "Đàm phán hợp đồng", color: "secondary" },
  CONTRACT_RESIGNED: { label: "Yêu cầu ký lại hợp đồng", color: "warning" },
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
  "order/createOrder",
  async ({ customerChoiceId, orderData }, { rejectWithValue }) => {
    const response = await createOrderApi(customerChoiceId, orderData);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
export const createAiOrder = createAsyncThunk(
  "order/createAiOrder",
  async ({ aiDesignId, customerChoiceId, orderData }, { rejectWithValue }) => {
    const response = await createAiOrderApi(
      aiDesignId,
      customerChoiceId,
      orderData
    );
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (params, { rejectWithValue }) => {
    // Kiểm tra nếu params là object hoặc string
    let orderStatus, page, size;

    if (typeof params === "object" && params !== null) {
      // Nếu là object, trích xuất tham số
      orderStatus = params.orderStatus;
      page = params.page || 1;
      size = params.size || 10;
    } else {
      // Nếu là string, xem như orderStatus
      orderStatus = params;
      page = 1;
      size = 10;
    }

    // Nếu orderStatus là mảng, gọi api cho từng trạng thái
    if (Array.isArray(orderStatus)) {
      let allOrders = [];
      let pagination = null;

      for (const status of orderStatus) {
        const response = await getOrdersApi(status, page, size);
        if (response.success) {
          allOrders = allOrders.concat(response.data);
          // Lấy pagination của lần gọi cuối cùng
          pagination = response.pagination;
        }
      }

      return {
        orders: allOrders,
        pagination,
      };
    } else {
      // Nếu orderStatus là string
      const response = await getOrdersApi(orderStatus, page, size);
      if (response.success) {
        return {
          orders: response.data,
          pagination: response.pagination,
        };
      }
      return rejectWithValue(response.error);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    const response = await updateOrderStatusApi(orderId, status);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);

export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (orderId, { rejectWithValue }) => {
    const response = await getOrderByIdApi(orderId);
    if (response.success) return response.data;
    return rejectWithValue(response.error);
  }
);

export const fetchOrdersByUserId = createAsyncThunk(
  "order/fetchOrdersByUserId",
  async (userId, { rejectWithValue }) => {
    const response = await getOrdersByUserIdApi(userId);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
export const createOrderFromDesignRequest = createAsyncThunk(
  "order/createOrderFromDesignRequest",
  async (customDesignRequestId, { rejectWithValue }) => {
    const response = await createOrderFromDesignRequestApi(
      customDesignRequestId
    );
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
export const contractResignOrder = createAsyncThunk(
  "order/contractResignOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await contractResignOrderApi(orderId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Không thể ký lại hợp đồng");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể ký lại hợp đồng");
    }
  }
);
export const contractSignedOrder = createAsyncThunk(
  "order/contractSignedOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await contractSignedOrderApi(orderId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Không thể đánh dấu hợp đồng đã ký");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể đánh dấu hợp đồng đã ký");
    }
  }
);
const initialState = {
  orders: [],
  loading: false,
  error: null,
  currentOrder: null,
  currentOrderStatus: "idle",
  currentOrderError: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  },
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
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
        state.orders = action.payload.orders;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
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
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
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
        state.currentOrderStatus = "loading";
        state.currentOrderError = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrderStatus = "succeeded";
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.currentOrderStatus = "failed";
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
      })
      .addCase(createOrderFromDesignRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderFromDesignRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(createOrderFromDesignRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể tạo đơn hàng";
      })
      .addCase(contractResignOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(contractResignOrder.fulfilled, (state, action) => {
        state.loading = false;

        // Cập nhật order trong danh sách
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }

        // Cập nhật currentOrder nếu cần
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(contractResignOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(contractSignedOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(contractSignedOrder.fulfilled, (state, action) => {
        state.loading = false;

        // Cập nhật order trong danh sách
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }

        // Cập nhật currentOrder nếu cần
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(contractSignedOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;

export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectCurrentOrderStatus = (state) =>
  state.order.currentOrderStatus;
export const selectCurrentOrderError = (state) => state.order.currentOrderError;
export const selectOrders = (state) => state.order.orders;
export const selectOrderStatus = (state) =>
  state.order.loading ? "loading" : state.order.error ? "failed" : "succeeded";
export const selectOrderError = (state) => state.order.error;
export const selectOrderPagination = (state) => state.order.pagination;
