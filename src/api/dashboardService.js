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

export default dashboardService;
