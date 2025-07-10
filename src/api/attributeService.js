import axios from 'axios';


// Sử dụng URL backend trực tiếp
const API_URL = "https://songtaoads.online";

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
// Xóa attribute
export const deleteAttributeApi = async (attributeId) => {
  try {
    const response = await attributeService.delete(`/api/attributes/${attributeId}`);
    const { success, message } = response.data;
    if (success) {
      return { success };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete attribute'
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
