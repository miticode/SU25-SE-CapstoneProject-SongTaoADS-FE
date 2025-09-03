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
      // Process the result to match frontend expectations
      const processedData = {
        id: result.id,
        name: result.name,
        unit: result.unit,
        materialPrice: result.materialPrice,
        unitPrice: result.unitPrice,
        isMultiplier: result.isMultiplier,
        isAvailable: result.isAvailable,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        // Extract attribute info from the attributes object
        attributeId: result.attributes?.id || attributeId,
        attributeName: result.attributes?.name,
        attributeDescription: result.attributes?.description,
        attributeOrderCode: result.attributes?.orderCode
      };
      return { success: true, data: processedData };
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
        // Xử lý attribute info - có thể từ attributes object hoặc attributesId
        attributeId: item.attributes?.id || item.attributesId?.id || attributeId,
        attributeName: item.attributes?.name || item.attributesId?.name,
        attributeDescription: item.attributes?.description || item.attributesId?.description,
        attributeOrderCode: item.attributes?.orderCode || item.attributesId?.orderCode
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
      // Process the result to match frontend expectations
      const processedData = {
        id: result.id,
        name: result.name,
        unit: result.unit,
        materialPrice: result.materialPrice,
        unitPrice: result.unitPrice,
        isMultiplier: result.isMultiplier,
        isAvailable: result.isAvailable,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        // Extract attribute info from the attributes object
        attributeId: result.attributes?.id,
        attributeName: result.attributes?.name,
        attributeDescription: result.attributes?.description,
        attributeOrderCode: result.attributes?.orderCode
      };
      return { success: true, data: processedData };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update attribute value'
    };
  }
};
// Toggle trạng thái giá trị thuộc tính (ẩn/hiện)
export const toggleAttributeValueStatusApi = async (attributeValueId, attributeValueData) => {
  try {
    const response = await attributeValueService.put(`/api/attribute-values/${attributeValueId}`, {
      name: attributeValueData.name,
      unit: attributeValueData.unit,
      materialPrice: attributeValueData.materialPrice,
      unitPrice: attributeValueData.unitPrice,
      isAvailable: !attributeValueData.isAvailable, // Toggle trạng thái
      isMultiplier: attributeValueData.isMultiplier
    });
    const { success, result, message } = response.data;
    if (success) {
      // Process the result to match frontend expectations
      const processedData = {
        id: result.id,
        name: result.name,
        unit: result.unit,
        materialPrice: result.materialPrice,
        unitPrice: result.unitPrice,
        isMultiplier: result.isMultiplier,
        isAvailable: result.isAvailable,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        // Extract attribute info from the attributes object
        attributeId: result.attributes?.id,
        attributeName: result.attributes?.name,
        attributeDescription: result.attributes?.description,
        attributeOrderCode: result.attributes?.orderCode
      };
      return { success: true, data: processedData };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to toggle attribute value status'
    };
  }
};

// Lấy chi tiết một attribute value theo ID
export const getAttributeValueByIdApi = async (attributeValueId) => {
  try {
    const response = await attributeValueService.get(`/api/attribute-values/${attributeValueId}`);
    const { success, result, message } = response.data;
    if (success && result) {
      const processedData = {
        id: result.id,
        name: result.name,
        unit: result.unit,
        materialPrice: result.materialPrice,
        unitPrice: result.unitPrice,
        isMultiplier: result.isMultiplier,
        isAvailable: result.isAvailable,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        attributeId: result.attributes?.id,
        attributeName: result.attributes?.name,
        attributeDescription: result.attributes?.description,
        attributeOrderCode: result.attributes?.orderCode,
      };
      return { success: true, data: processedData };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch attribute value detail'
    };
  }
};
export default attributeValueService;
