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
    if (!accessToken) {
      return { isAuthenticated: false, user: null };
    }

    // Try to get user profile instead of refresh token
    // const profileResponse = await getProfileApi();
    // if (profileResponse.success) {
    //   authState.isAuthenticated = true;
    //   authState.user = profileResponse.data;
    //   return { 
    //     isAuthenticated: true, 
    //     user: profileResponse.data 
    //   };
    // }
    
    // If profile failed, try refresh token as fallback
    try {
      const response = await authService.post('/api/auth/refresh-token');
      console.log("Refresh token response:", response.data);
      const { success, result } = response.data;
      
      if (success) {
        authState.isAuthenticated = true;
        if (result && (result.user || result.email)) {
          authState.user = result.user || { email: result.email };
        }
         if (result && result.accessToken) {
          console.log("Updating access token from refresh response");
          localStorage.setItem('accessToken', result.accessToken);
        }
        return { 
          isAuthenticated: true, 
          user: authState.user 
        };
      }
    } catch (refreshError) {
      console.error("Refresh token failed:", refreshError);
    }
    
    // Only remove token if both methods fail
    localStorage.removeItem('accessToken');
    authState.isAuthenticated = false;
    authState.user = null;
    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.log("Auth check failed, but keeping current state:", error);
    // Don't automatically reset auth state on error
    return { 
      isAuthenticated: localStorage.getItem('accessToken') ? true : false, 
      user: authState.user 
    };
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
    const response = await authService.post('/api/auth/refresh-token');
    const { success, result } = response.data;
    if (success && result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      return { success: true, accessToken: result.accessToken };
    }
    return { success: false };
  } catch {
    return { success: false };
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
authService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Only attempt refresh if it's an auth error and we haven't tried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return authService(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResult = await refreshTokenApi();
        if (refreshResult.success) {
          // Update token in storage
          localStorage.setItem('accessToken', refreshResult.accessToken);
          // Update authorization header
          authService.defaults.headers.common['Authorization'] = 'Bearer ' + refreshResult.accessToken;
          // Update original request
          originalRequest.headers['Authorization'] = 'Bearer ' + refreshResult.accessToken;
          
          processQueue(null, refreshResult.accessToken);
          isRefreshing = false;
          return authService(originalRequest);
        } else {
          processQueue(new Error('Failed to refresh token'), null);
          isRefreshing = false;
          // Only redirect to login if refresh explicitly failed
          window.location.href = '/auth/login?error=session_expired';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default authService;