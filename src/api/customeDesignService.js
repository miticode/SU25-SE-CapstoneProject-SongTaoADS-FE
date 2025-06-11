import axios from 'axios';

// API base URL
const API_URL = 'https://songtaoads.online';

// Create axios instance with interceptors
const customDesignService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Get token helper function
const getToken = () => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

// Request interceptor to add token to all requests
customDesignService.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
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
customDesignService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      // Could handle logout or refresh token here
    }
    return Promise.reject(error);
  }
);

// Fetch custom design requests with filtering options
export const fetchCustomDesignRequestsApi = async (status = 'PENDING', page = 1, size = 10) => {
  try {
    const response = await customDesignService.get('/api/custom-design-requests', {
      params: { status, page, size }
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch custom design requests'
    };
  }
};
export const assignDesignerToRequestApi = async (customDesignRequestId, designerId) => {
  try {
    const response = await customDesignService.patch(
      `/api/custom-design-requests/${customDesignRequestId}/users/${designerId}`
    );
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to assign designer to request'
    };
  }
};
export const updateRequestStatusApi = async (customDesignRequestId, status) => {
  try {
    const response = await customDesignService.patch(
      `/api/custom-design-requests/${customDesignRequestId}/status`,
      null,
      {
        params: { status }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update request status'
    };
  }
};

export default customDesignService;