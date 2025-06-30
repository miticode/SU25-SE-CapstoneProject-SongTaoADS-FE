import axios from 'axios';

// Cập nhật URL API thực tế của bạn
const API_URL = 'https://songtaoads.online';

// Tạo instance axios với interceptors
const feedbackService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Thêm interceptor request để gắn accessToken vào header Authorization
feedbackService.interceptors.request.use(
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
feedbackService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm tạo feedback cho đơn hàng
export const createFeedbackApi = async (orderId, feedbackData) => {
  try {
    console.log("Gọi API tạo feedback với:", { orderId, feedbackData });
    
    const response = await feedbackService.post(`/api/orders/${orderId}/feedbacks`, {
      rating: feedbackData.rating,
      comment: feedbackData.comment
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API tạo feedback:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error creating feedback:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create feedback'
    };
  }
};

export const uploadFeedbackImageApi = async (feedbackId, imageFile) => {
  try {
    console.log("Gọi API upload ảnh feedback với:", { feedbackId, imageFile });
    
    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append('feedbackImage', imageFile);

    const response = await feedbackService.patch(`/api/feedbacks/${feedbackId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API upload ảnh feedback:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error uploading feedback image:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload feedback image'
    };
  }
};
export const getFeedbacksByOrderIdApi = async (orderId) => {
  try {
    console.log("Gọi API lấy feedback của đơn hàng với orderId:", orderId);
    
    const response = await feedbackService.get(`/api/orders/${orderId}/feedbacks`);

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API lấy feedback:", { success, result });
      return { success: true, data: result || [] };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error fetching feedbacks:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch feedbacks'
    };
  }
};
export default feedbackService;