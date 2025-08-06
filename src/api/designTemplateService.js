import axios from 'axios';


// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL 

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
    // Tạo FormData để gửi multipart/form-data
    const formData = new FormData();
    
    // Thêm các trường dữ liệu vào FormData
    if (templateData.name) formData.append('name', templateData.name);
    if (templateData.description) formData.append('description', templateData.description);
    if (templateData.negativePrompt) formData.append('negativePrompt', templateData.negativePrompt);
    if (templateData.width) formData.append('width', templateData.width);
    if (templateData.height) formData.append('height', templateData.height);
    if (templateData.isAvailable !== undefined) formData.append('isAvailable', templateData.isAvailable);
    
    // Thêm file hình ảnh nếu có
    if (templateData.designTemplateImage) {
      formData.append('designTemplateImage', templateData.designTemplateImage);
    }
    
    const response = await designTemplateService.post(
      `/api/product-types/${productTypeId}/design-templates`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
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
    const { success, message } = response.data;
    if (success) {
      // API delete chỉ trả về success message, không có result object
      return { success: true, data: { id: designTemplateId } };
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

// Lấy gợi ý thiết kế mẫu cho customer choice
export const fetchDesignTemplateSuggestionsByCustomerChoiceIdApi = async (customerChoiceId, page = 1, size = 10) => {
  try {
    const response = await designTemplateService.get(`/api/customer-choices/${customerChoiceId}/design-template-suggestion`, {
      params: {
        page,
        size
      }
    });
    
    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;
    
    if (success) {
      return { 
        success: true, 
        data: result,
        pagination: {
          currentPage,
          totalPages,
          pageSize,
          totalElements
        }
      };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching design template suggestions:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch design template suggestions'
    };
  }
};

export default designTemplateService;
