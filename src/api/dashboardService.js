import axios from 'axios';

// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL

// Create axios instance with interceptors
const dashboardService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Allow sending and receiving cookies from API
});

// Response interceptor to handle errors
dashboardService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor to add authorization token
dashboardService.interceptors.request.use(
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

// API to fetch staff dashboard data
export const fetchStaffDashboardApi = async () => {
  try {
    const response = await dashboardService.get('/api/dashboard/staff');

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching staff dashboard:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch staff dashboard'
    };
  }
};

// API to fetch admin dashboard data
export const fetchAdminDashboardApi = async () => {
  try {
    const response = await dashboardService.get('/api/dashboard/admin');

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch admin dashboard'
    };
  }
};

// API to fetch sale dashboard data
export const fetchSaleDashboardApi = async () => {
  try {
    const response = await dashboardService.get('/api/dashboard/sale');

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching sale dashboard:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch sale dashboard'
    };
  }
};

// API to fetch staff orders statistics by date range
export const fetchStaffOrdersStatsApi = async (startDate, endDate) => {
  try {
    const requestBody = {
      start: startDate,
      end: endDate
    };

    const response = await dashboardService.post('/api/dashboard/orders/staff', requestBody);

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching staff orders stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch staff orders statistics'
    };
  }
};

// API to fetch sale orders statistics by date range
export const fetchSaleOrdersStatsApi = async (startDate, endDate) => {
  try {
    const requestBody = {
      start: startDate,
      end: endDate
    };

    const response = await dashboardService.post('/api/dashboard/orders/sale', requestBody);

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching sale orders stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch sale orders statistics'
    };
  }
};

// API to fetch custom design requests statistics by date range
export const fetchCustomDesignRequestsStatsApi = async (startDate, endDate) => {
  try {
    const requestBody = {
      start: startDate,
      end: endDate
    };

    const response = await dashboardService.post('/api/dashboard/custom-design-requests', requestBody);

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching custom design requests stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch custom design requests statistics'
    };
  }
};

// API to fetch payments statistics by date range
export const fetchPaymentsStatsApi = async (startDate, endDate) => {
  try {
    const requestBody = {
      start: startDate,
      end: endDate
    };

    console.log('Payments API call:', {
      url: '/api/dashboard/payments',
      requestBody,
      startDate,
      endDate
    });

    const response = await dashboardService.post('/api/dashboard/payments', requestBody);

    const { success, result, message } = response.data;

    if (success) {
      console.log('Payments API success:', result);
      return { success: true, data: result };
    }

    console.log('Payments API failed:', message);
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching payments stats:', error);
    console.error('Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch payments statistics'
    };
  }
};

export default dashboardService;
