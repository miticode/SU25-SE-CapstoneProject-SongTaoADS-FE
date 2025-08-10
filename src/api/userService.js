import axios from 'axios';


// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL 

// Tạo instance axios với interceptors
const userService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Thêm interceptor để tự động thêm token vào header
userService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptors để xử lý response và refresh token khi cần
// Sử dụng lại logic từ authService
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Import refreshTokenApi từ authService để tái sử dụng
import { refreshTokenApi } from './authService';

userService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return userService(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      
      isRefreshing = true;
      
      try {
        const refreshResult = await refreshTokenApi();
        
        if (refreshResult.success) {
          const newToken = refreshResult.accessToken;
          
          userService.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          
          processQueue(null, newToken);
          isRefreshing = false;
          
          return userService(originalRequest);
        } else {
          processQueue(new Error(refreshResult.error || 'Refresh failed'), null);
          isRefreshing = false;
          
          window.location.href = '/auth/login?error=session_expired';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login?error=session_expired';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Hàm API lấy danh sách tất cả người dùng
export const getAllUsersApi = async (page = 1, size = 10, searchQuery = '') => {
  try {
    const response = await userService.get('/api/users', {
      params: {
        page,
        size,
        search: searchQuery
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
    
    return { success: false, error: message || 'Failed to fetch users' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch users'
    };
  }
};

// Hàm API lấy thông tin chi tiết của một người dùng
export const getUserDetailApi = async (userId) => {
  try {
    const response = await userService.get(`/api/users/${userId}`);
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success: true, data: result };
    }
    
    return { success: false, error: message || 'Failed to fetch user details' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user details'
    };
  }
};

// Hàm API tạo người dùng mới
// Request body: { fullName, email, phone, password, avatar, isActive, roleName }
// Response: { success, timestamp, message, result: { id, fullName, email, password, phone, avatar, address, isActive, isBanned, createdAt, updatedAt, roles: { id, name, description, orderCode } } }
export const createUserApi = async (userData) => {
  try {
    const response = await userService.post('/api/users', userData);
    
    const { success, result, message, timestamp } = response.data;
    
    if (success) {
      return { 
        success: true, 
        data: result,
        message,
        timestamp
      };
    }
    
    return { success: false, error: message || 'Failed to create user' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create user'
    };
  }
};

// Hàm API cập nhật thông tin người dùng
export const updateUserApi = async (userId, userData) => {
  try {
    const response = await userService.put(`/api/users/${userId}`, userData);
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success: true, data: result };
    }
    
    return { success: false, error: message || 'Failed to update user' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update user'
    };
  }
};

// Hàm API kích hoạt/vô hiệu hóa người dùng
export const toggleUserStatusApi = async (userId, isActive) => {
  try {
    const response = await userService.patch(`/api/users/${userId}/status`, { isActive });
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success: true, data: result };
    }
    
    return { success: false, error: message || 'Failed to update user status' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update user status'
    };
  }
};

// Hàm API thay đổi mật khẩu người dùng
export const changeUserPasswordApi = async (userId, password) => {
  try {
    const response = await userService.patch(`/api/users/${userId}/new-password`, { password });
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success: true, data: result };
    }
    
    return { success: false, error: message || 'Failed to change user password' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to change user password'
    };
  }
};

// Hàm API ban/unban người dùng
export const banUserApi = async (userId, isBanned) => {
  try {
    const response = await userService.patch(`/api/users/${userId}/ban-decision`, null, {
      params: {
        isBanned
      }
    });
    
    const { success, result, message, timestamp } = response.data;
    
    if (success) {
      return { 
        success: true, 
        data: result,
        message,
        timestamp
      };
    }
    
    return { success: false, error: message || 'Failed to update user ban status' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update user ban status'
    };
  }
};

export const getUsersByRoleApi = async (roleName, page = 1, size = 10) => {
  try {
    const response = await userService.get('/api/users/role', {
      params: {
        roleName,
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
    
    return { success: false, error: message || `Failed to fetch users with role ${roleName}` };
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return {
      success: false,
      error: error.response?.data?.message || `Failed to fetch users with role ${roleName}`
    };
  }
};

export default userService;
