import axios from "axios";

// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL

// Tạo instance axios với interceptors
const paymentService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Thêm interceptor request để gắn accessToken vào header Authorization
paymentService.interceptors.request.use(
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
paymentService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const createPayOSDeposit = async (orderId, description = "Coc don hang") => {
  try {
    const response = await paymentService.post(`/api/payments/deposit`, {
      orderId,
      description,
    });
    return response.data; // { checkoutUrl: ... }
  } catch (error) {
    console.error("Lỗi chi tiết khi tạo thanh toán:", error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể tạo link thanh toán',
    };
  }
};

export const getPayOSCallback = async (orderId) => {
  try {
    const response = await paymentService.get(`/api/orders/${orderId}/callback?orderId=${orderId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể lấy callback',
    };
  }
};

// ====================================

// 1. Webhook: Xử lý webhook từ PayOS
export const handleWebhook = async (payload) => {
  // payload: object dữ liệu webhook từ PayOS
  try {
    const response = await paymentService.post('/api/webhook/handle-webhook', payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể xử lý webhook',
    };
  }
};

// 2. Xác nhận URL webhook với PayOS
export const confirmWebhookUrl = async (payload) => {
  // payload: { webhookUrl: string }
  try {
    const response = await paymentService.post('/api/webhook/confirm-webhook-url', payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể xác nhận webhook URL',
    };
  }
};

// 3. Thanh toán hết đơn hàng (order)
export const payOrderRemaining = async (orderId) => {
  try {
    const response = await paymentService.post(`/api/orders/${orderId}/remaining`);

    // Xử lý response theo cấu trúc API trả về
    const { success, result, message } = response.data;

    if (success && result) {
      // Trả về đúng cấu trúc để Redux thunk có thể xử lý
      return {
        success: true,
        checkoutUrl: result.checkoutUrl,
        data: result,
        message: message
      };
    }

    return {
      success: false,
      error: message || 'Không thể thanh toán số tiền còn lại',
    };
  } catch (error) {
    console.error("Error in payOrderRemaining:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể thanh toán số tiền còn lại',
    };
  }
};

// 4. Đặt cọc theo đơn hàng (order)
export const payOrderDeposit = async (orderId) => {
  try {
    const response = await paymentService.post(`/api/orders/${orderId}/deposit`);

    // Xử lý response theo cấu trúc API trả về
    const { success, result, message } = response.data;

    if (success && result) {
      // Trả về đúng cấu trúc để Redux thunk có thể xử lý
      return {
        success: true,
        checkoutUrl: result.checkoutUrl,
        data: result,
        message: message
      };
    }

    return {
      success: false,
      error: message || 'Không thể đặt cọc đơn hàng',
    };
  } catch (error) {
    console.error("Error in payOrderDeposit:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể đặt cọc đơn hàng',
    };
  }
};

// 5. Thanh toán hết thiết kế
export const payDesignRemaining = async (orderId) => {
  try {
    const response = await paymentService.post(`/api/orders/${orderId}/design-remaining`);

    // Xử lý response theo cấu trúc API trả về
    const { success, result, message } = response.data;

    if (success && result) {
      // Trả về đúng cấu trúc để Redux thunk có thể xử lý
      return {
        success: true,
        checkoutUrl: result.checkoutUrl,
        data: result,
        message: message
      };
    }

    return {
      success: false,
      error: message || 'Không thể thanh toán hết thiết kế',
    };
  } catch (error) {
    console.error("Error in payDesignRemaining:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể thanh toán hết thiết kế',
    };
  }
};

// 6. Đặt cọc theo thiết kế
export const payDesignDeposit = async (orderId) => {
  try {
    const response = await paymentService.post(`/api/orders/${orderId}/design-deposit`);

    // Xử lý response theo cấu trúc API trả về
    const { success, result, message } = response.data;

    if (success && result) {
      // Trả về đúng cấu trúc để Redux thunk có thể xử lý
      return {
        success: true,
        checkoutUrl: result.checkoutUrl,
        data: result,
        message: message
      };
    }

    return {
      success: false,
      error: message || 'Không thể đặt cọc thiết kế',
    };
  } catch (error) {
    console.error("Error in payDesignDeposit:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể đặt cọc thiết kế',
    };
  }
};
