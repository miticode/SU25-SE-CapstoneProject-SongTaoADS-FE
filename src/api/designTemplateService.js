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
    const token = localStorage.getItem('token');
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

export default designTemplateService;