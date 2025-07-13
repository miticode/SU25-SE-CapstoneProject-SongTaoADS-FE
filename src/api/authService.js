import axios from "axios";
import { data } from "react-router-dom";

// Sử dụng URL backend trực tiếp
const API_URL = "https://songtaoads.online";

// Biến lưu trữ trạng thái đăng nhập và thông tin user
let authState = {
  isAuthenticated: false,
  user: null,
};

// Tạo instance axios với interceptors
const authService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cho phép gửi và nhận cookies từ API
});

// Thêm interceptor request để tự động gắn token
authService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor đơn giản để xử lý lỗi
authService.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Always log authentication errors first
    if (
      error.response?.status === 401 ||
      error.response?.data?.message === "Authentication required"
    ) {
      console.error("Authentication error:", error);
    }

    const originalRequest = error.config;

    // Try to refresh token if it's a 401 error
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      // Check if the request URL is not the refresh token endpoint itself
      !originalRequest.url?.includes("refresh-token")
    ) {
      originalRequest._retry = true;

      // Handle concurrent refresh requests
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });

          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return authService(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshing = true;

      try {
        console.log("Token expired, attempting refresh...");
        const refreshResult = await refreshTokenApi();

        if (refreshResult.success) {
          const newToken = refreshResult.accessToken;

          // Update auth header for future requests
          authService.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newToken}`;

          // Update the original request
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          // Process queued requests
          processQueue(null, newToken);

          // Reset flag
          isRefreshing = false;

          console.log("Request retried with new token");
          return authService(originalRequest);
        } else {
          console.error("Token refresh failed:", refreshResult.error);
          processQueue(new Error("Refresh failed"), null);

          // Only redirect if we truly can't refresh
          if (!window.location.pathname.includes("/auth/login")) {
            console.log("Redirecting to login due to auth failure");
            window.location.href = "/auth/login?error=session_expired";
          }

          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error("Error during refresh:", refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clean up
        localStorage.removeItem("accessToken");
        updateAuthState(false, null);

        // Redirect only if not already on login page
        if (!window.location.pathname.includes("/auth/login")) {
          window.location.href = "/auth/login?error=session_expired";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Hàm helper để login - đơn giản hóa
export const loginApi = async (credentials) => {
  try {
    const response = await authService.post("/api/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });

    const { success, result, message } = response.data;

    if (success) {
      // Lưu access token vào localStorage
      if (result.accessToken) {
        console.log("Saving access token to localStorage");
        localStorage.setItem("accessToken", result.accessToken);
      } else {
        console.warn("No access token in response");
      }

      // Cập nhật trạng thái đăng nhập
      authState.isAuthenticated = true;
      authState.user = result || { email: credentials.email };

      return { success, data: result || {} };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || "Login failed",
    };
  }
};

// Hàm helper để register - giữ nguyên
export const registerApi = async (userData) => {
  try {
    const response = await authService.post("/api/auth/register", {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      phone: userData.phone,
    });

    const { success, message } = response.data;
    return { success, message };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Registration failed",
    };
  }
};

// Hàm helper để logout - đơn giản hóa
export const logoutApi = async () => {
  try {
    console.log("Attempting logout");
    // Không cần lấy token và gắn header thủ công nữa
    const response = await authService.post(
      "/api/auth/logout",
      {}
    );

    console.log("Logout response:", response.data);

    // Sau khi API trả về thành công, mới xóa token
    localStorage.removeItem("accessToken");
    console.log("Access token removed from localStorage");

    // Reset trạng thái đăng nhập
    authState.isAuthenticated = false;
    authState.user = null;

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);

    // Nếu lỗi là do token hết hạn hoặc không hợp lệ (401), vẫn xóa token
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      authState.isAuthenticated = false;
      authState.user = null;
      console.log("Token invalid/expired, removed from localStorage");
    }

    return {
      success: false,
      error: error.response?.data?.message || "Logout failed",
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
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      try {
        // Không cần gắn header thủ công nữa
        const response = await authService.get("/api/users/profile");

        if (response.data.success) {
          // Token is valid, update auth state
          updateAuthState(true, response.data.result);
          return {
            isAuthenticated: true,
            user: response.data.result,
            accessToken: accessToken,  // Trả về token hiện tại
          };
        }
      } catch (error) {
        // Token validation failed, try to refresh
        if (error.response?.status === 401) {
          console.log("Token expired, trying to refresh during checkAuthStatus");
          const refreshResult = await refreshTokenApi();
          if (refreshResult.success) {
            console.log("Token refreshed successfully during checkAuthStatus");
            return {
              isAuthenticated: true,
              user: refreshResult.user || authState.user,
              accessToken: refreshResult.accessToken,  // Trả về token mới
            };
          }
        }
        throw error;  // Đảm bảo lỗi được truyền lên để xử lý ở cấp cao hơn
      }
    }

    // Thử refresh token nếu không có access token
    const refreshResult = await refreshTokenApi();
    if (refreshResult.success) {
      return {
        isAuthenticated: true,
        user: refreshResult.user,
        accessToken: refreshResult.accessToken,
      };
    }

    // Nếu đến đây, xác thực thất bại
    return { isAuthenticated: false, user: null, accessToken: null };
  } catch (error) {
    console.error("Auth check error:", error);
    return { isAuthenticated: false, user: null, accessToken: null };
  }
};

// Lấy profile người dùng hiện tại
export const getProfileApi = async () => {
  try {
    // Không cần lấy/gắn token thủ công nữa
    const response = await authService.get("/api/users/profile");

    const { success, result, message } = response.data;

    console.log('Profile API response:', response.data); // Debug log
    console.log('User roles:', result?.roles); // Debug log

    if (success) {
      return { success: true, data: result }; // Đảm bảo trả về result
    }
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Get profile failed",
    };
  }
};
// Hàm gọi refresh token
export const refreshTokenApi = async () => {
  try {
    console.log(`[${new Date().toLocaleTimeString()}] Attempting to refresh access token`);

    const response = await authService.post(
      "/api/auth/refresh-token",
      {},
      { withCredentials: true }
    );

    const { success, result } = response.data;

    if (success && result?.accessToken) {
      console.log(`[${new Date().toLocaleTimeString()}] Token refresh successful`);
      localStorage.setItem("accessToken", result.accessToken);

      if (result.user) {
        updateAuthState(true, result.user);
      }

      return {
        success: true,
        accessToken: result.accessToken,
        user: result.user,
      };
    }

    console.warn(`[${new Date().toLocaleTimeString()}] Refresh token response missing access token`);
    return { success: false, error: "No access token in response" };
  } catch (error) {
    console.error(
      `[${new Date().toLocaleTimeString()}] Refresh token error:`,
      error.response?.status,
      error.response?.data || error.message
    );
    // Không xóa token ở đây, để cơ chế xử lý lỗi cấp cao hơn quyết định
    return {
      success: false,
      error: error.response?.data?.message || "Failed to refresh token",
    };
  }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (!prom || typeof prom !== "object") return;

    if (error && typeof prom.reject === "function") {
      prom.reject(error);
    } else if (typeof prom.resolve === "function") {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Cập nhật avatar user
export const updateUserAvatarApi = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await authService.patch(
      `/api/users/${userId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || "Update avatar failed" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Update avatar failed",
    };
  }
};

// Cập nhật họ tên và số điện thoại
export const updateUserProfileApi = async (userId, fullName, phone) => {
  try {
    const response = await authService.patch(`/api/users/${userId}/profile`, {
      fullName,
      phone,
    });
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || "Update profile failed" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Update profile failed",
    };
  }
};

// Đổi mật khẩu
export const updateUserPasswordApi = async (
  userId,
  oldPassword,
  newPassword
) => {
  try {
    const response = await authService.patch(`/api/users/${userId}/password`, {
      oldPassword,
      newPassword,
    });
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || "Update password failed" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Update password failed",
    };
  }
};

// Hàm gửi email xác thực
export const resendVerificationApi = async (userData) => {
  try {
    const response = await authService.post("/api/verifications/resend", {
      email: userData.email
    });

    const { success, message, result } = response.data;
    return { success, message, result };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Gửi email xác thực thất bại",
    };
  }
};

// Hàm gửi email đặt lại mật khẩu
export const forgotPasswordApi = async (email) => {
  try {
    const response = await authService.post("/api/password-reset/resend", { email });
    const { success, message, result } = response.data;
    return { success, message, result };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Gửi email đặt lại mật khẩu thất bại",
    };
  }
};

export default authService;
