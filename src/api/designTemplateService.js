import axios from 'axios';

// API base URL
const API_URL = 'https://songtaoads.online';

// Create axios instance with interceptors
const designTemplateService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Allow sending and receiving cookies from API
});

// Response interceptor to handle errors
designTemplateService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor to add authorization token
designTemplateService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API to fetch design templates by product type ID
export const fetchDesignTemplatesByProductTypeIdApi = async (productTypeId) => {
  try {
    const response = await designTemplateService.get(`/api/product-types/${productTypeId}/design-templates`);
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success: true, data: result };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching design templates:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch design templates'
    };
  }
};

// Tạo thiết kế mẫu mới cho loại sản phẩm
export const createDesignTemplateApi = async (productTypeId, templateData) => {
  try {
    const response = await designTemplateService.post(
      `/api/product-types/${productTypeId}/design-templates`,
      templateData
    );
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error creating design template:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create design template'
    };
  }
};

// Cập nhật thông tin thiết kế mẫu
export const updateDesignTemplateInfoApi = async (designTemplateId, updateData) => {
  try {
    const response = await designTemplateService.patch(
      `/api/design-templates/${designTemplateId}/information`,
      updateData
    );
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error updating design template info:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update design template info'
    };
  }
};

// Cập nhật hình ảnh thiết kế mẫu
export const updateDesignTemplateImageApi = async (designTemplateId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await designTemplateService.patch(
      `/api/design-templates/${designTemplateId}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error updating design template image:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update design template image'
    };
  }
};

// Lấy tất cả thiết kế mẫu
export const fetchAllDesignTemplatesApi = async () => {
  try {
    const response = await designTemplateService.get(`/api/design-templates`);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching all design templates:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch all design templates'
    };
  }
};

// Lấy thiết kế mẫu theo ID
export const fetchDesignTemplateByIdApi = async (designTemplateId) => {
  try {
    const response = await designTemplateService.get(`/api/design-templates/${designTemplateId}`);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching design template by ID:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch design template by ID'
    };
  }
};

// Xóa thiết kế mẫu theo ID
export const deleteDesignTemplateByIdApi = async (designTemplateId) => {
  try {
    const response = await designTemplateService.delete(`/api/design-templates/${designTemplateId}`);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error deleting design template:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete design template'
    };
  }
};

export default designTemplateService;