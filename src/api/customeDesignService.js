import axios from 'axios';

// API base URL
const API_URL = 'https://songtaoads.online';

// Create axios instance with interceptors
const customDesignService = axios.create({
  baseURL: API_URL,
 
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
export const fetchCustomDesignRequestsApi = async (status, page = 1, size = 10) => {
  try {
    const params = { page, size };
    if (status) params.status = status;
    const response = await customDesignService.get('/api/custom-design-requests', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch custom design requests'
    };
  }
};
// chia task cho designer
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

// Designer tù chối task
export const rejectCustomDesignRequestApi = async (customDesignRequestId) => {
  try {
    const response = await customDesignService.patch(
      `/api/custom-design-requests/${customDesignRequestId}/reject`
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to reject custom design request'
    };
  }
};

// Designer đồng ý  task
export const approveCustomDesignRequestApi = async (customDesignRequestId) => {
  try {
    const response = await customDesignService.patch(
      `/api/custom-design-requests/${customDesignRequestId}/approve`
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to approve custom design request'
    };
  }
};

export const fetchCustomDesignRequestsByCustomerDetailApi = async (customerDetailId, page = 1, size = 10) => {
  try {
    const response = await customDesignService.get(
      `/api/customer-details/${customerDetailId}/custom-design-requests`,
      {
        params: { page, size }
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch custom design requests by customer detail'
    };
  }
};

// 1. Tạo yêu cầu thiết kế tùy chỉnh
// POST /api/customer-details/{customerDetailId}/customer-choices/{customerChoiceId}
export const createCustomDesignRequestApi = async (customerDetailId, customerChoiceId, data) => {
  try {
    const response = await customDesignService.post(
      `/api/customer-details/${customerDetailId}/customer-choices/${customerChoiceId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create custom design request'
    };
  }
};

// 2. Designer gửi bản thiết kế chính thức
// PATCH /api/custom-design-requests/{customDesignRequestId}/final-design-image
export const sendFinalDesignImageApi = async (customDesignRequestId, file) => {
  try {
    const formData = new FormData();
    formData.append('finalDesignImage', file);

    const response = await customDesignService.patch(
      `/api/custom-design-requests/${customDesignRequestId}/final-design-image`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send final design image'
    };
  }
};

// 3. Designer xem các yêu cầu được giao
// GET /api/users/{designerId}/custom-design-requests
export const fetchDesignRequestsByDesignerApi = async (designerId, page = 1, size = 10) => {
  try {
    const response = await customDesignService.get(
      `/api/users/${designerId}/custom-design-requests`,
      { params: { page, size } }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch design requests by designer'
    };
  }
};

export default customDesignService;