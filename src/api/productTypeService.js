import axios from 'axios';

// Cập nhật URL API thực tế của bạn
const API_URL = 'https://songtaoads.online';

// Tạo instance axios với interceptors
const productTypeService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Interceptor để xử lý lỗi
productTypeService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm lấy tất cả product types
export const getProductTypesApi = async () => {
  try {
    const response = await productTypeService.get('/api/product-types');
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success, data: result || [] };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch product types'
    };
  }
};

// Hàm lấy chi tiết một product type
export const getProductTypeByIdApi = async (id) => {
  try {
    const response = await productTypeService.get(`/api/product-types/${id}`);
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success, data: result || {} };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch product type details'
    };
  }
};

// Hàm lấy product type sizes theo product type ID
export const getProductTypeSizesByProductTypeIdApi = async (productTypeId) => {
  try {
    const response = await productTypeService.get(`/api/product-types/${productTypeId}/product-type-sizes`);
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success, data: result || [] };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch product type sizes'
    };
  }
};

// Thêm mới product type
export const addProductTypeApi = async (data) => {
  try {
    const response = await productTypeService.post('/api/product-types', data);
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add product type',
    };
  }
};

// Sửa thông tin product type
export const updateProductTypeApi = async (id, data) => {
  try {
    const response = await productTypeService.put(`/api/product-types/${id}/information`, data);
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update product type',
    };
  }
};

// Xóa product type
export const deleteProductTypeApi = async (id) => {
  try {
    const response = await productTypeService.delete(`/api/product-types/${id}`);
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete product type',
    };
  }
};

export default productTypeService;