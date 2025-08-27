import axios from 'axios';


// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL 

// Tạo instance axios với interceptors
const attributeService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

attributeService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

// Lấy chi tiết attribute theo ID
export const getAttributeByIdApi = async (attributeId) => {
  try {
    const response = await attributeService.get(`/api/attributes/${attributeId}`);
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch attribute'
    };
  }
};


// Sửa attribute
export const updateAttributeApi = async (attributeId, data) => {
  try {
    const response = await attributeService.put(`/api/attributes/${attributeId}`, data);
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update attribute'
    };
  }
};
// Toggle trạng thái thuộc tính (ẩn/hiện)
export const toggleAttributeStatusApi = async (attributeId, attributeData) => {
  try {
    const response = await attributeService.put(`/api/attributes/${attributeId}`, {
      name: attributeData.name,
      calculateFormula: attributeData.calculateFormula,
      isAvailable: !attributeData.isAvailable, // Toggle trạng thái
      isCore: attributeData.isCore
    });
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to toggle attribute status'
    };
  }
};
// Thêm attribute mới cho product type
export const createAttributeApi = async (productTypeId, data) => {
  try {
    const response = await attributeService.post(`/api/product-types/${productTypeId}/attributes`, data);
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create attribute'
    };
  }
};
export default attributeService;
