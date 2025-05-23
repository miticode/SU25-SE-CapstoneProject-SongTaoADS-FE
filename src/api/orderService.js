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

// Thêm interceptor request để gắn accessToken vào header Authorization
orderService.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi
orderService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm tạo đơn hàng mới theo customerChoiceId
export const createOrderApi = async (customerChoiceId, orderData) => {
  try {
    // Lấy userId từ accessToken trong localStorage nếu chưa có trong orderData
    let userId = orderData.userId;
    if (!userId) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        // Giả sử accessToken là JWT, giải mã để lấy userId
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        userId = payload.userId || payload.id || payload.sub;
      }
    }
    console.log("Gọi API tạo order với:", { customerChoiceId, orderData });
    const response = await orderService.post(`/api/customer-choices/${customerChoiceId}/orders`, {
      totalAmount: orderData.totalAmount,
      depositAmount: orderData.depositAmount,
      remainingAmount: orderData.remainingAmount,
      note: orderData.note,
      isCustomDesign: orderData.isCustomDesign,
      histories: orderData.histories || [],
      userId: userId,
      aiDesignId: orderData.aiDesignId
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API tạo order:", { success, result });
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
export const updateOrderStatusApi = async (orderId, data) => {
  try {
    const response = await orderService.put(`/api/orders/${orderId}`, data);
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