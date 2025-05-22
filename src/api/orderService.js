import axios from 'axios';

// Cập nhật URL API thực tế của bạn
const API_URL = 'http://localhost:8080';

// Tạo instance axios với interceptors
const orderService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Interceptor để xử lý lỗi
orderService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm tạo đơn hàng mới
export const createOrderApi = async (orderData) => {
  try {
    const response = await orderService.post('/api/orders', {
      totalAmount: orderData.totalAmount,
      depositAmount: orderData.depositAmount,
      remainingAmount: orderData.remainingAmount,
      note: orderData.note,
      isCustomDesign: orderData.isCustomDesign,
      histories: orderData.histories || [],
      userId: orderData.userId,
      aiDesignId: orderData.aiDesignId
    });

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create order'
    };
  }
};

// Hàm lấy danh sách đơn hàng
export const getOrdersApi = async () => {
  try {
    const response = await orderService.get('/api/orders');

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch orders'
    };
  }
};

// Hàm cập nhật trạng thái đơn hàng
export const updateOrderStatusApi = async (orderId, status) => {
  try {
    const response = await orderService.put(`/api/orders/${orderId}`, { status });
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update order status'
    };
  }
};

// Hàm lấy chi tiết đơn hàng theo ID
export const getOrderByIdApi = async (orderId) => {
  try {
    const response = await orderService.get(`/api/orders/${orderId}`);

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Định dạng phản hồi không hợp lệ' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể lấy thông tin chi tiết đơn hàng'
    };
  }
};

// Lấy danh sách đơn hàng theo userId
export const getOrdersByUserIdApi = async (userId) => {
  try {
    const response = await orderService.get(`/api/users/${userId}/orders`);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch orders'
    };
  }
};

export default orderService;