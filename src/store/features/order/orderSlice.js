import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAiOrderApi,
  createOrderApi,
  createNewOrderApi,
  addOrderDetailApi,
  getOrdersApi,
  updateOrderStatusApi,
  getOrderByIdApi,
  getOrdersByUserIdApi,
  getOrderDetailsApi,
  createOrderFromDesignRequestApi,
  contractResignOrderApi,
  contractSignedOrderApi,
  updateOrderAddressApi,
  updateOrderEstimatedDeliveryDateApi,
  updateOrderToProducingApi,
  updateOrderToProductionCompletedApi,
  updateOrderToDeliveringApi,
  updateOrderToInstalledApi,
  deleteOrderApi,
  cancelOrderApi,
} from "../../../api/orderService";

// Định nghĩa mapping trạng thái đơn hàng thiết kế AI
export const ORDER_STATUS_MAP = {
  PENDING_DESIGN: { label: "Chờ thiết kế", color: "warning" },
  NEED_DEPOSIT_DESIGN: { label: "Cần đặt cọc thiết kế", color: "warning" },
  DEPOSITED_DESIGN: { label: "Đã đặt cọc thiết kế", color: "info" },
  NEED_FULLY_PAID_DESIGN: { label: "Cần thanh toán đủ thiết kế", color: "warning" },
  WAITING_FINAL_DESIGN: { label: "Chờ thiết kế cuối", color: "info" },
  DESIGN_COMPLETED: { label: "Hoàn thành thiết kế", color: "success" },
  PENDING_CONTRACT: { label: "Chờ hợp đồng", color: "warning" },
  CONTRACT_SENT: { label: "Đã gửi hợp đồng", color: "info" },
  CONTRACT_SIGNED: { label: "Đã ký hợp đồng", color: "primary" },
  CONTRACT_DISCUSS: { label: "Đàm phán hợp đồng", color: "secondary" },
  CONTRACT_RESIGNED: { label: "Từ chối hợp đồng", color: "error" },
  CONTRACT_CONFIRMED: { label: "Xác nhận hợp đồng", color: "success" },
  DEPOSITED: { label: "Đã đặt cọc", color: "info" },
  IN_PROGRESS: { label: "Đang thực hiện", color: "primary" },
  PRODUCING: { label: "Đang sản xuất", color: "primary" },
  PRODUCTION_COMPLETED: { label: "Hoàn thành sản xuất", color: "success" },
  DELIVERING: { label: "Đang giao hàng", color: "info" },
  INSTALLED: { label: "Đã lắp đặt", color: "success" },
  ORDER_COMPLETED: { label: "Hoàn tất đơn hàng", color: "success" },
  CANCELLED: { label: "Đã hủy", color: "error" }
};

// Định nghĩa mapping loại đơn hàng
export const ORDER_TYPE_MAP = {
  AI_DESIGN: { label: "Thiết kế AI", color: "primary" },
  CUSTOM_DESIGN_WITH_CONSTRUCTION: { label: "Thiết kế tùy chỉnh có thi công", color: "success" },
  CUSTOM_DESIGN_WITHOUT_CONSTRUCTION: { label: "Thiết kế tùy chỉnh không thi công", color: "info" }
};

// Async thunks
export const createNewOrder = createAsyncThunk(
  "order/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    const response = await createNewOrderApi(orderData);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);

export const addOrderDetail = createAsyncThunk(
  "order/addOrderDetail",
  async ({ orderId, orderDetailData }, { rejectWithValue }) => {
    const response = await addOrderDetailApi(orderId, orderDetailData);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);

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
    try {
      // Kiểm tra nếu params là object hoặc string
      let orderStatus, page, size, orderType;

      if (typeof params === "object" && params !== null) {
        // Nếu là object, trích xuất tham số
        orderStatus = params.orderStatus;
        page = params.page || 1;
        size = params.size || 10;
        orderType = params.orderType || null;
      } else {
        // Nếu là string, xem như orderStatus
        orderStatus = params;
        page = 1;
        size = 10;
        orderType = null;
      }

      // Nếu orderStatus là mảng, gọi api cho từng trạng thái
      if (Array.isArray(orderStatus)) {
        let allOrders = [];
        let pagination = null;
        let lastTimestamp = null;
        let lastMessage = null;

        for (const status of orderStatus) {
          const response = await getOrdersApi(status, page, size, orderType);
          if (response.success) {
            allOrders = allOrders.concat(response.data || []);
            // Lấy pagination của lần gọi cuối cùng
            pagination = response.pagination;
            lastTimestamp = response.timestamp;
            lastMessage = response.message;
          }
        }

        return {
          orders: allOrders,
          pagination,
          timestamp: lastTimestamp,
          message: lastMessage,
        };
      } else {
        // Nếu orderStatus là string hoặc null
        const response = await getOrdersApi(orderStatus, page, size, orderType);

        if (response.success) {
          return {
            orders: response.data || [],
            pagination: response.pagination,
            timestamp: response.timestamp,
            message: response.message,
          };
        }
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || "Không thể tải danh sách đơn hàng");
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
  async (params, { rejectWithValue }) => {
    // Kiểm tra nếu params là object hoặc string (userId)
    let userId, page, size;

    if (typeof params === "object" && params !== null) {
      // Nếu là object, trích xuất tham số
      userId = params.userId;
      page = params.page || 1;
      size = params.size || 10;
    } else {
      // Nếu là string, xem như userId
      userId = params;
      page = 1;
      size = 10;
    }

    const response = await getOrdersByUserIdApi(userId, page, size);
    if (response.success) {
      return {
        orders: response.data,
        pagination: response.pagination,
      };
    }
    return rejectWithValue(response.error);
  }
);

export const fetchOrderDetails = createAsyncThunk(
  "order/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    const response = await getOrderDetailsApi(orderId);
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
export const updateOrderAddress = createAsyncThunk(
  "order/updateOrderAddress",
  async ({ orderId, addressData }, { rejectWithValue }) => {
    try {
      const response = await updateOrderAddressApi(orderId, addressData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Không thể cập nhật địa chỉ đơn hàng");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể cập nhật địa chỉ đơn hàng");
    }
  }
);
export const updateOrderEstimatedDeliveryDate = createAsyncThunk(
  "order/updateOrderEstimatedDeliveryDate",
  async ({ orderId, estimatedDeliveryDate, contractorId }, { rejectWithValue }) => {
    try {
      const response = await updateOrderEstimatedDeliveryDateApi(orderId, estimatedDeliveryDate, contractorId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Không thể cập nhật ngày giao hàng dự kiến");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể cập nhật ngày giao hàng dự kiến");
    }
  }
);
export const updateOrderToProducing = createAsyncThunk(
  "order/updateOrderToProducing",
  async ({ orderId, draftImageFile }, { rejectWithValue }) => {
    try {
      const response = await updateOrderToProducingApi(orderId, draftImageFile);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Không thể cập nhật trạng thái sản xuất");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể cập nhật trạng thái sản xuất");
    }
  }
);
export const updateOrderToProductionCompleted = createAsyncThunk(
  'orders/updateToProductionCompleted',
  async ({ orderId, productImageFile }, { rejectWithValue }) => {
    try {
      const response = await updateOrderToProductionCompletedApi(orderId, productImageFile);

      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update order to production completed');
    }
  }
);
export const updateOrderToDelivering = createAsyncThunk(
  'orders/updateToDelivering',
  async ({ orderId, deliveryImageFile }, { rejectWithValue }) => {
    try {
      const response = await updateOrderToDeliveringApi(orderId, deliveryImageFile);

      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update order to delivering');
    }
  }
);
export const updateOrderToInstalled = createAsyncThunk(
  'orders/updateToInstalled',
  async ({ orderId, installedImageFile }, { rejectWithValue }) => {
    try {
      const response = await updateOrderToInstalledApi(orderId, installedImageFile);

      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update order to installed');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'order/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await deleteOrderApi(orderId);

      if (response.success) {
        return { orderId, ...response.data, message: response.message, timestamp: response.timestamp };
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await cancelOrderApi(orderId);

      if (response.success) {
        return { orderId, ...response.data, message: response.message, timestamp: response.timestamp };
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel order');
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
  orderDetails: null,
  orderDetailsStatus: "idle",
  orderDetailsError: null,
  lastUpdated: null, // Timestamp của lần cập nhật cuối
  lastMessage: null, // Message từ API response
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
    clearOrderDetails: (state) => {
      state.orderDetails = null;
      state.orderDetailsStatus = "idle";
      state.orderDetailsError = null;
    },
    clearLastMessage: (state) => {
      state.lastMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create New Order (API /api/orders)
      .addCase(createNewOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Order Detail
      .addCase(addOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật current order với thông tin chi tiết mới
        if (state.currentOrder) {
          state.currentOrder = { ...state.currentOrder, orderDetail: action.payload };
        }
      })
      .addCase(addOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
        state.orders = action.payload.orders || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        // Lưu timestamp và message từ API response
        state.lastUpdated = action.payload.timestamp || new Date().toISOString();
        state.lastMessage = action.payload.message;
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
        state.lastUpdated = new Date().toISOString();
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
        state.orders = action.payload.orders || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.lastUpdated = action.payload.timestamp || new Date().toISOString();
        state.lastMessage = action.payload.message;
      })
      .addCase(fetchOrdersByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.orderDetailsStatus = "loading";
        state.orderDetailsError = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.orderDetailsStatus = "succeeded";
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.orderDetailsStatus = "failed";
        state.orderDetailsError = action.payload;
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
      })
      .addCase(updateOrderAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderAddress.fulfilled, (state, action) => {
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
      .addCase(updateOrderAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderEstimatedDeliveryDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderEstimatedDeliveryDate.fulfilled, (state, action) => {
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
      .addCase(updateOrderEstimatedDeliveryDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderToProducing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderToProducing.fulfilled, (state, action) => {
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
      .addCase(updateOrderToProducing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderToProductionCompleted.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateOrderToProductionCompleted.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;

        // Cập nhật order trong danh sách
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(updateOrderToProductionCompleted.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateOrderToDelivering.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderToDelivering.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Cập nhật order trong danh sách
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }

        // Cập nhật currentOrder nếu cần
        if (state.currentOrder && state.currentOrder.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updateOrderToDelivering.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderToInstalled.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderToInstalled.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Cập nhật order trong danh sách
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }

        // Cập nhật currentOrder nếu cần
        if (state.currentOrder && state.currentOrder.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updateOrderToInstalled.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Xóa order khỏi danh sách
        const orderId = action.payload.orderId;
        state.orders = state.orders.filter(order => order.id !== orderId);

        // Xóa currentOrder nếu đó là order đang được chọn
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder = null;
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Cập nhật order trong danh sách với trạng thái CANCELLED
        const orderId = action.payload.orderId;
        const index = state.orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], status: 'CANCELLED' };
        }

        // Cập nhật currentOrder nếu đó là order đang được chọn
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder = { ...state.currentOrder, status: 'CANCELLED' };
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentOrder, clearOrderDetails, clearLastMessage } = orderSlice.actions;
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
export const selectOrderDetails = (state) => state.order.orderDetails;
export const selectOrderDetailsStatus = (state) => state.order.orderDetailsStatus;
export const selectOrderDetailsError = (state) => state.order.orderDetailsError;
export const selectLastUpdated = (state) => state.order.lastUpdated;
export const selectLastMessage = (state) => state.order.lastMessage;

// Selector để filter orders theo orderType
export const selectOrdersByType = (state, orderTypes) => {
  if (!orderTypes || orderTypes.length === 0) {
    return state.order.orders;
  }

  return state.order.orders.filter(order =>
    orderTypes.includes(order.orderType)
  );
};
