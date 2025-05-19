import axios from 'axios';

// Cập nhật URL API thực tế của bạn
const API_URL = 'http://localhost:8080';

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
    // Nếu token hết hạn (401), chuyển người dùng về trang login
    if (error.response?.status === 401) {
      authState.isAuthenticated = false;
      authState.user = null;
    }
    return Promise.reject(error);
  }
);

// Hàm helper để login - đơn giản hóa
export const loginApi = async (credentials) => {
  try {
    const response = await authService.post('/api/v1/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    
    const { success, result, message } = response.data;
    
    if (success) {
      // Cập nhật trạng thái đăng nhập
      authState.isAuthenticated = true;
      authState.user = result || { email: credentials.email };
      
      return { success, data: result || {} };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed'
    };
  }
};

// Hàm helper để register - giữ nguyên
export const registerApi = async (userData) => {
  try {
    const response = await authService.post('/api/v1/auth/register', {
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
    const response = await authService.post('/api/v1/auth/logout');
    
    // Reset trạng thái đăng nhập
    authState.isAuthenticated = false;
    authState.user = null;
    
    return { success: true };
  } catch (error) {
    // Vẫn reset trạng thái đăng nhập dù có lỗi
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
    // API này có thể là API hiện có mà yêu cầu xác thực để truy cập
    // Cookies sẽ tự động được gửi đi nhờ withCredentials: true
    const response = await authService.post('/api/v1/auth/refresh-token');
    
    const { success, result } = response.data;
    
    if (success) {
      // Cập nhật trạng thái đăng nhập
      authState.isAuthenticated = true;
      
      // Nếu API trả về thông tin user
      if (result && (result.user || result.email)) {
        authState.user = result.user || { email: result.email };
      }
      
      return { 
        isAuthenticated: true, 
        user: authState.user 
      };
    } else {
      authState.isAuthenticated = false;
      authState.user = null;
      return { isAuthenticated: false, user: null };
    }
  } catch (error) {
    console.log("Auth check failed:", error);
    
    // Nếu API trả về lỗi (có thể là 401), đánh dấu là chưa đăng nhập
    authState.isAuthenticated = false;
    authState.user = null;
    return { isAuthenticated: false, user: null };
  }
};

export default authService;