import axios from 'axios';


// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL 
// Get token function
const getToken = () => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

// Create axios instance with interceptors
const backgroundService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Allow sending and receiving cookies from API
});

// Request interceptor to add authorization token
backgroundService.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
backgroundService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Background API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API to fetch background suggestions by customer choice ID
export const fetchBackgroundSuggestionsByCustomerChoiceIdApi = async (customerChoiceId) => {
  try {
    console.log(`Fetching background suggestions for customer choice ID: ${customerChoiceId}`);
    
    const response = await backgroundService.get(`/api/customer-choices/${customerChoiceId}/suggestion`);
    
    console.log('Background API Response:', response.data);
    
    const { success, result, message } = response.data;
    
    if (success && Array.isArray(result)) {
      // Process data to ensure consistency
      const processedData = result.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        backgroundUrl: item.backgroundUrl,
        isAvailable: item.isAvailable,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        attributeValues: item.attributeValues
      }));
      
      console.log('Processed background suggestions:', processedData);
      return { success: true, data: processedData };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching background suggestions:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch background suggestions'
    };
  }
};

// EDITED DESIGN
export const createEditedDesignWithBackground = async (customerDetailId, backgroundId, formData) => {
  try {
    console.log(`Creating edited design for customer: ${customerDetailId}, background: ${backgroundId}`);
    
    const response = await backgroundService.post(
      `/api/customer-details/${customerDetailId}/backgrounds/${backgroundId}/edited-designs`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('Create edited design API Response:', response.data);
    
    const { success, result, message } = response.data;
    
    if (success && result) {
      console.log('Edited design created successfully:', result);
      return { success: true, data: result };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error creating edited design:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create edited design'
    };
  }
};

// Lấy thông tin edited design theo ID
export const fetchEditedDesignByIdApi = async (editedDesignId) => {
  try {
    console.log(`Fetching edited design with ID: ${editedDesignId}`);
    
    const response = await backgroundService.get(`/api/edited-designs/${editedDesignId}`);
    
    console.log('Fetch edited design API Response:', response.data);
    
    const { success, result, message } = response.data;
    
    if (success && result) {
      // Process data to ensure consistency
      const processedData = {
        id: result.id,
        editedImage: result.editedImage,
        customerNote: result.customerNote,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        customerDetail: result.customerDetail ? {
          id: result.customerDetail.id,
          logoUrl: result.customerDetail.logoUrl,
          companyName: result.customerDetail.companyName,
          address: result.customerDetail.address,
          contactInfo: result.customerDetail.contactInfo,
          users: result.customerDetail.users ? {
            id: result.customerDetail.users.id,
            fullName: result.customerDetail.users.fullName,
            email: result.customerDetail.users.email,
            phone: result.customerDetail.users.phone,
            avatar: result.customerDetail.users.avatar,
            address: result.customerDetail.users.address,
            isActive: result.customerDetail.users.isActive,
            createdAt: result.customerDetail.users.createdAt,
            updatedAt: result.customerDetail.users.updatedAt,
            roles: result.customerDetail.users.roles
          } : null
        } : null,
        designTemplates: result.designTemplates ? {
          id: result.designTemplates.id,
          name: result.designTemplates.name,
          description: result.designTemplates.description
        } : null,
        backgrounds: result.backgrounds ? {
          id: result.backgrounds.id,
          name: result.backgrounds.name,
          description: result.backgrounds.description
        } : null
      };
      
      console.log('Processed edited design data:', processedData);
      return { success: true, data: processedData };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching edited design:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch edited design'
    };
  }
};

// Lấy background theo giá trị thuộc tính (có phân trang)
export const fetchBackgroundsByAttributeValueIdApi = async (attributeValueId, page = 1, size = 10) => {
  try {
    const response = await backgroundService.get(`/api/attribute-values/${attributeValueId}/backgrounds`, {
      params: { page, size }
    });
    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;
    if (success) {
      return { success: true, data: result, pagination: { currentPage, totalPages, pageSize, totalElements } };
    }
    return { success: false, error: message || 'Lỗi lấy background theo giá trị thuộc tính' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi lấy background theo giá trị thuộc tính'
    };
  }
};

// Tạo background theo giá trị thuộc tính
export const createBackgroundByAttributeValueIdApi = async (attributeValueId, { name, description, backgroundImage }) => {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (backgroundImage) formData.append('backgroundImage', backgroundImage);
    const response = await backgroundService.post(`/api/attribute-values/${attributeValueId}/backgrounds`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Lỗi tạo background' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi tạo background'
    };
  }
};

// Cập nhật thông tin background
export const updateBackgroundInfoApi = async (backgroundId, { name, description, isAvailable }) => {
  try {
    const response = await backgroundService.patch(`/api/backgrounds/${backgroundId}/information`, { name, description, isAvailable });
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Lỗi cập nhật thông tin background' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi cập nhật thông tin background'
    };
  }
};

// Cập nhật hình ảnh background
export const updateBackgroundImageApi = async (backgroundId, file) => {
  try {
    const formData = new FormData();
    formData.append('backgroundImage', file);
    const response = await backgroundService.patch(`/api/backgrounds/${backgroundId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Lỗi cập nhật hình ảnh background' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi cập nhật hình ảnh background'
    };
  }
};

// Lấy tất cả background
export const fetchAllBackgroundsApi = async () => {
  try {
    const response = await backgroundService.get(`/api/backgrounds`);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Lỗi lấy tất cả background' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi lấy tất cả background'
    };
  }
};

// Xóa background
export const deleteBackgroundByIdApi = async (backgroundId) => {
  try {
    const response = await backgroundService.delete(`/api/backgrounds/${backgroundId}`);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Lỗi xóa background' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Lỗi xóa background'
    };
  }
};

export default backgroundService;
