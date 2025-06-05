import axios from 'axios';

// API URL
const API_URL = 'https://songtaoads.online';

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
      console.log('Adding token to request:', config.url);
    } else {
      console.warn('No token found for request:', config.url);
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
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      // Can handle logout or token refresh here
    }
    return Promise.reject(error);
  }
);

// Function to create a new attribute value
export const createAttributeValueApi = async (attributeId, attributeValueData) => {
  try {
    console.log('Creating attribute value for attribute ID:', attributeId);
    console.log('Attribute value data:', attributeValueData);

    // Get token to ensure it's available
    const token = getToken();
    console.log('Token available:', !!token);

    const response = await attributeValueService.post(`/api/attributes/${attributeId}/attribute-values`, attributeValueData, {
      headers: {
        'Authorization': `Bearer ${token}` // Ensure token is in the header
      }
    });

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create attribute value'
    };
  }
};

export const getAttributeValuesByAttributeIdApi = async (attributeId, page = 1, size = 10) => {
  try {
    console.log(`Fetching attribute values for attribute ID: ${attributeId}, page: ${page}, size: ${size}`);

    // Get token to ensure it's available
    const token = getToken();
    console.log('Token available:', !!token);

    const response = await attributeValueService.get(
      `/api/attributes/${attributeId}/attribute-values`, 
      {
        params: { page, size },
        headers: {
          'Authorization': `Bearer ${token}` // Ensure token is in the header
        }
      }
    );

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
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch attribute values'
    };
  }
};
export const updateAttributeValueApi = async (attributeValueId, attributeValueData) => {
  try {
    console.log('Updating attribute value with ID:', attributeValueId);
    console.log('Attribute value update data:', attributeValueData);

    // Get token to ensure it's available
    const token = getToken();
    console.log('Token available:', !!token);

    const response = await attributeValueService.put(`/api/attribute-values/${attributeValueId}`, attributeValueData, {
      headers: {
        'Authorization': `Bearer ${token}` // Ensure token is in the header
      }
    });

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update attribute value'
    };
  }
};
export const deleteAttributeValueApi = async (attributeValueId) => {
  try {
    console.log('Deleting attribute value with ID:', attributeValueId);

    // Get token to ensure it's available
    const token = getToken();
    console.log('Token available:', !!token);

    const response = await attributeValueService.delete(`/api/attribute-values/${attributeValueId}`, {
      headers: {
        'Authorization': `Bearer ${token}` // Ensure token is in the header
      }
    });

    const { success, message } = response.data;

    if (success) {
      return { success: true, message };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete attribute value'
    };
  }
};
export default attributeValueService;