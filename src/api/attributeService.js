import axios from 'axios';

// Cập nhật URL API thực tế của bạn
const API_URL = 'http://localhost:8080';

// Tạo instance axios với interceptors
const attributeService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Interceptor để xử lý lỗi
attributeService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm lấy attributes theo product type ID
export const getAttributesByProductTypeIdApi = async (productTypeId) => {
  try {
    const response = await attributeService.get(`/api/product-types/${productTypeId}/attributes`);
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success, data: result || [] };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch attributes for product type'
    };
  }
};
export const getAttributeValuesByAttributeIdApi = async (attributeId) => {
  try {
    const response = await attributeService.get(`/api/attributes/${attributeId}/attribute-values`);
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success, data: result || [] };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch attribute values'
    };
  }
};
export default attributeService;