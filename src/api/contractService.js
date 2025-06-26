import axios from 'axios';

// Cập nhật URL API thực tế của bạn
const API_URL = 'https://songtaoads.online';

// Tạo instance axios với interceptors
const contractService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Thêm interceptor request để gắn accessToken vào header Authorization
contractService.interceptors.request.use(
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
contractService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Tải lên hợp đồng cho đơn hàng
export const uploadOrderContractApi = async (orderId, formData) => {
  try {
    // Sử dụng FormData với Content-Type tự động được set là multipart/form-data
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    };

    console.log("Gọi API tải lên hợp đồng với:", { orderId });
    const response = await contractService.post(`/api/orders/${orderId}/contract`, formData, config);

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API tải hợp đồng:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error uploading contract:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload contract'
    };
  }
};

export const getOrderContractApi = async (orderId) => {
  try {
    console.log("Gọi API lấy thông tin hợp đồng với orderId:", orderId);
    const response = await contractService.get(`/api/orders/${orderId}/contract`);

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API lấy hợp đồng:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error getting contract:", error.response?.data || error);
    
    // Nếu lỗi 404 có nghĩa là chưa có hợp đồng
    if (error.response?.status === 404) {
      return { success: false, error: 'Chưa có hợp đồng cho đơn hàng này', notFound: true };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get contract'
    };
  }
};

export default contractService;