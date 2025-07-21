import axios from 'axios';


// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL 

// Create axios instance with interceptors
const attributeValueService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Allow sending and receiving cookies from API
});

const getToken = () => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

// Request interceptor to add token
attributeValueService.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const token = getToken();
    
    if (token) {
      // Add token to header for all requests
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
attributeValueService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Function to create a new attribute value
export const createAttributeValueApi = async (attributeId, attributeValueData) => {
  try {
    const response = await attributeValueService.post(`/api/attributes/${attributeId}/attribute-values`, attributeValueData);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create attribute value'
    };
  }
};

export const getAttributeValuesByAttributeIdApi = async (attributeId, page = 1, size = 50) => {
  try {
    const response = await attributeValueService.get(
      `/api/attributes/${attributeId}/attribute-values`, 
      {
        params: { page, size }
      }
    );
    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;
    if (success && Array.isArray(result)) {
      // Xử lý dữ liệu để phù hợp với frontend
      const processedData = result.map(item => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        materialPrice: item.materialPrice,
        unitPrice: item.unitPrice,
        isMultiplier: item.isMultiplier,
        isAvailable: item.isAvailable,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        // Xử lý attributesId - lấy id của attribute
        attributeId: item.attributesId?.id || attributeId
      }));
      return { 
        success: true, 
        data: processedData,
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
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch attribute values'
    };
  }
};
export const updateAttributeValueApi = async (attributeValueId, attributeValueData) => {
  try {
    const response = await attributeValueService.put(`/api/attribute-values/${attributeValueId}`, attributeValueData);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update attribute value'
    };
  }
};
export const deleteAttributeValueApi = async (attributeValueId) => {
  try {
    const response = await attributeValueService.delete(`/api/attribute-values/${attributeValueId}`);
    const { success, message } = response.data;
    if (success) {
      return { success: true, message };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete attribute value'
    };
  }
};
export default attributeValueService;
