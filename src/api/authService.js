import axios from 'axios';

// Cập nhật URL API thực tế của bạn
const API_URL = 'https://songtaoads.online';

// Biến lưu trữ trạng thái đăng nhập và thông tin user
let authState = {
  isAuthenticated: false,
  user: null
};

// Tạo instance axios với interceptors
const authService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Interceptor đơn giản để xử lý lỗi 
authService.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log the error instead of immediately redirecting
    if (
      error.response?.status === 401 ||
      error.response?.data?.message === 'Authentication required'
    ) {
      console.error('Authentication error:', error);
      // Don't redirect here - let the refresh token mechanism try first
    }
    return Promise.reject(error);
  }
);

// Hàm helper để login - đơn giản hóa
export const loginApi = async (credentials) => {
  try {
  
    const response = await authService.post('/api/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    
    const { success, result, message } = response.data;
   
    
    if (success) {
      // Lưu access token vào localStorage
      if (result.accessToken) {
        console.log('Saving access token to localStorage');
        localStorage.setItem('accessToken', result.accessToken);
      } else {
        console.warn('No access token in response');
      }
      
      // Cập nhật trạng thái đăng nhập
      authState.isAuthenticated = true;
      authState.user = result || { email: credentials.email };
      
      return { success, data: result || {} };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed'
    };
  }
};

// Hàm helper để register - giữ nguyên
export const registerApi = async (userData) => {
  try {
    const response = await authService.post('/api/auth/register', {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      phone: userData.phone
    });
    
    const { success, message } = response.data;
    return { success, message };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed'
    };
  }
};

// Hàm helper để logout - đơn giản hóa
export const logoutApi = async () => {
  try {
    console.log('Attempting logout');
    const response = await authService.post('/api/auth/logout');
    console.log('Logout response:', response.data);
    
    // Xóa access token khỏi localStorage
    localStorage.removeItem('accessToken');
    console.log('Access token removed from localStorage');
    
    // Reset trạng thái đăng nhập
    authState.isAuthenticated = false;
    authState.user = null;
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
    // Vẫn xóa token và reset trạng thái đăng nhập dù có lỗi
    localStorage.removeItem('accessToken');
    authState.isAuthenticated = false;
    authState.user = null;
    
    return {
      success: false,
      error: error.response?.data?.message || 'Logout failed'
    };
  }
};

// Đơn giản hóa checkAuthStatus - chỉ trả về trạng thái hiện tại


// Hàm cập nhật trạng thái đăng nhập
export const updateAuthState = (status, user = null) => {
  authState.isAuthenticated = status;
  if (user) {
    authState.user = user;
  }
};

// Hàm lấy trạng thái đăng nhập hiện tại
export const getAuthState = () => {
  return { ...authState };
};

export const checkAuthStatus = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    // If we have an access token, assume we're authenticated until proven otherwise
    if (accessToken) {
      try {
        // Try to validate the token with the server
        const response = await authService.get('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (response.data.success) {
          // Token is valid, update auth state
          authState.isAuthenticated = true;
          authState.user = response.data.result;
          return { 
            isAuthenticated: true, 
            user: authState.user 
          };
        }
      } catch (error) {
        // Token validation failed, try to refresh
        if (error.response?.status === 401) {
          try {
            const refreshResult = await refreshTokenApi();
            if (refreshResult.success) {
              return { 
                isAuthenticated: true, 
                user: authState.user,
                accessToken: refreshResult.accessToken
              };
            }
          } catch (refreshError) {
            console.error("Refresh failed during validation:", refreshError);
          }
        }
      }
    } else {
      // No access token, try a single refresh attempt
      try {
        const refreshResult = await refreshTokenApi();
        if (refreshResult.success) {
          return { 
            isAuthenticated: true, 
            user: authState.user,
            accessToken: refreshResult.accessToken
          };
        }
      } catch (refreshError) {
        console.error("Refresh failed when no token:", refreshError);
      }
    }
    
    // If we reach here, authentication failed
    return { isAuthenticated: false, user: null };
    
  } catch (error) {
    console.error("Auth check error:", error);
    return { isAuthenticated: false, user: null };
  }
};

// Lấy profile người dùng hiện tại
export const getProfileApi = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
   
    
    if (!accessToken) {
    
      return {
        success: false,
        error: 'No access token found. Please login.'
      };
    }

    const response = await authService.get('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const { success, result, message } = response.data;
    
    
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
   
    return {
      success: false,
      error: error.response?.data?.message || 'Get profile failed'
    };
  }
};

// Hàm gọi refresh token
export const refreshTokenApi = async () => {
  try {
    // First remove the expired access token
    localStorage.removeItem('accessToken');
    
    // Send refresh token via cookies
    const response = await authService.post('/api/auth/refresh-token', {}, {
      withCredentials: true // Ensures cookies are sent
    });
    
    const { success, result } = response.data;
    
    if (success && result?.accessToken) {
      // Store the new access token
      localStorage.setItem('accessToken', result.accessToken);
      return { success: true, accessToken: result.accessToken };
    }
    
    return { success: false, error: 'No access token in response' };
  } catch (error) {
    console.error("Refresh token error:", error.response?.data || error.message);
    // Clear token if refresh failed
    localStorage.removeItem('accessToken');
    return { 
      success: false, 
      error: error.response?.data?.message || "Failed to refresh token" 
    };
  }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Interceptor tự động refresh token khi hết hạn
// Interceptor tự động refresh token khi hết hạn
authService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only proceed for 401 errors that haven't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry infinitely
      originalRequest._retry = true;
      
      // Handle concurrent refresh requests
      if (isRefreshing) {
        try {
          // Wait for the ongoing refresh to complete
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          
          // Update header with new token
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return authService(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      
      // Start refreshing
      isRefreshing = true;
      
      try {
        console.log('Starting token refresh process...');
        
        // First remove expired token
        localStorage.removeItem('accessToken');
        
        // Attempt refresh
        const refreshResult = await refreshTokenApi();
        
        if (refreshResult.success) {
          console.log('Token refresh successful, new token obtained');
          const newToken = refreshResult.accessToken;
          
          // Update axios default headers
          authService.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          
          // Update the original request
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          
          // Resolve all queued requests
          processQueue(null, newToken);
          
          // Reset refreshing flag
          isRefreshing = false;
          
          // Retry the original request
          return authService(originalRequest);
        } else {
          console.error('Token refresh failed:', refreshResult.error);
          processQueue(new Error(refreshResult.error || 'Refresh failed'), null);
          isRefreshing = false;
          
          // Redirect to login
          window.location.href = '/auth/login?error=session_expired';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Error during token refresh:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clean up auth state
        localStorage.removeItem('accessToken');
        updateAuthState(false, null);
        
        // Redirect to login
        window.location.href = '/auth/login?error=session_expired';
        return Promise.reject(refreshError);
      }
    }
    
    // For non-401 errors or already retried requests
    return Promise.reject(error);
  }
);

export default authService;