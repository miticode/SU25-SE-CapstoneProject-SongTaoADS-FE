import axios from "axios";

const API_URL = "http://localhost:8080"; // Đổi nếu backend khác

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