import axios from 'axios';

// Cập nhật URL API thực tế của bạn
const API_URL = 'http://localhost:8080';

// Tạo instance axios với interceptors
const customerService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Interceptor để xử lý lỗi
customerService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm tạo customer mới
export const createCustomerApi = async (customerData) => {
  try {
    const response = await customerService.post('/api/customer-details/create', {
      logoUrl: customerData.logoUrl,
      companyName: customerData.companyName,
      tagLine: customerData.tagLine,
      contactInfo: customerData.contactInfo,
      userId: customerData.userId
    });
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success: true, data: result };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create customer'
    };
  }
};

export default customerService;