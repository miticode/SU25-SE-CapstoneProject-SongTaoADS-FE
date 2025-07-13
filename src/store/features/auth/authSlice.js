import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginApi,
  registerApi,
  logoutApi,
  updateAuthState,
  resendVerificationApi,
  getProfileApi,
  forgotPasswordApi, // Thêm import hàm mới
} from "../../../api/authService";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  accessToken: localStorage.getItem("accessToken"), // Lấy token từ localStorage nếu có
  status: "idle",
  error: null,
  tokenTimestamp: localStorage.getItem("accessToken") ? Date.now() : null,
  isRefreshing: false,
  verificationStatus: "idle", // Thêm trạng thái xác thực
  verificationError: null, // Thêm lỗi xác thực
  forgotPasswordStatus: "idle",
  forgotPasswordError: null,
  forgotPasswordMessage: null,
};

// Async thunks
export const login = createAsyncThunk(
  "/api/auth/login",
  async (credentials, { rejectWithValue }) => {
    const response = await loginApi(credentials);

    if (!response.success) {
      return rejectWithValue(response.error || "Login failed");
    }

    // Lưu token vào localStorage
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }

    return response.data;
  }
);

export const register = createAsyncThunk(
  "/api/auth/register",
  async (userData, { rejectWithValue }) => {
    const response = await registerApi(userData);

    if (!response.success) {
      return rejectWithValue(response.error || "Registration failed");
    }

    return { registered: true };
  }
);

export const logout = createAsyncThunk(
  "/auth/logout",
  async (_, { rejectWithValue }) => {
    const response = await logoutApi();

    if (!response.success) {
      return rejectWithValue(response.error || "Logout failed");
    }

    // Xóa token khỏi localStorage
    localStorage.removeItem("accessToken");

    return null;
  }
);

// Thêm thunk cho việc gửi email xác thực
export const sendVerificationEmail = createAsyncThunk(
  "auth/sendVerificationEmail",
  async (userData, { rejectWithValue }) => {
    const response = await resendVerificationApi(userData);

    if (!response.success) {
      return rejectWithValue(response.error || "Gửi email xác thực thất bại");
    }

    return response;
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    const res = await getProfileApi();
    if (!res.success) {
      return rejectWithValue(res.error || "Không thể tải thông tin cá nhân");
    }
    return res.data;
  }
);

// Thunk để login và tự động fetch profile
export const loginAndFetchProfile = createAsyncThunk(
  "auth/loginAndFetchProfile",
  async (credentials, { rejectWithValue }) => {
    try {
      // Đăng nhập trước
      const loginResponse = await loginApi(credentials);
      if (!loginResponse.success) {
        return rejectWithValue(loginResponse.error || "Login failed");
      }

      // Sau khi đăng nhập thành công, fetch profile
      const profileResponse = await getProfileApi();
      if (profileResponse.success) {
        return {
          user: profileResponse.data,
          accessToken: loginResponse.data.accessToken,
        };
      } else {
        // Nếu không fetch được profile, vẫn trả về thông tin login
        return {
          user: loginResponse.data,
          accessToken: loginResponse.data.accessToken,
        };
      }
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Thunk để khởi tạo auth state và fetch profile
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        return { isAuthenticated: false, user: null, accessToken: null };
      }

      // Kiểm tra token và fetch profile
      const profileResponse = await getProfileApi();
      if (profileResponse.success) {
        return {
          isAuthenticated: true,
          user: profileResponse.data,
          accessToken: accessToken,
        };
      } else {
        // Token không hợp lệ
        localStorage.removeItem("accessToken");
        return { isAuthenticated: false, user: null, accessToken: null };
      }
    } catch {
      localStorage.removeItem("accessToken");
      return rejectWithValue("Không thể khởi tạo trạng thái đăng nhập");
    }
  }
);

// Thunk gửi email đặt lại mật khẩu
export const forgotPassword = createAsyncThunk(
  "/api/password-reset/resend",
  async (email, { rejectWithValue }) => {
    const response = await forgotPasswordApi(email);
    if (!response.success) {
      return rejectWithValue(response.error || "Gửi email đặt lại mật khẩu thất bại");
    }
    return response;
  }
);

// Đơn giản hóa slice - chỉ còn các hàm cần thiết
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    resetVerificationStatus: (state) => {
      state.verificationStatus = "idle";
      state.verificationError = null;
    },
    resetForgotPasswordStatus: (state) => {
      state.forgotPasswordStatus = "idle";
      state.forgotPasswordError = null;
      state.forgotPasswordMessage = null;
    },
    syncAuthState: (state, action) => {
      const { isAuthenticated, user, accessToken } = action.payload;
      state.isAuthenticated = isAuthenticated;

      if (user) state.user = user;

      if (accessToken) {
        state.accessToken = accessToken;
        state.tokenTimestamp = Date.now(); // Track when we got this token
        localStorage.setItem("accessToken", accessToken);
      }

      state.status = "idle";
      state.error = null;
      state.isRefreshing = false;
    },
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.error = null;
        // Cập nhật trạng thái trong authService
        updateAuthState(true, action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
        state.accessToken = null;
      })

      // Login and fetch profile cases
      .addCase(loginAndFetchProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginAndFetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.error = null;
        // Cập nhật trạng thái trong authService
        updateAuthState(true, action.payload.user);
      })
      .addCase(loginAndFetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
        state.accessToken = null;
      })

      // Initialize auth cases
      .addCase(initializeAuth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
        if (action.payload.user) {
          updateAuthState(action.payload.isAuthenticated, action.payload.user);
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
        state.accessToken = null;
      })

      // Register cases
      .addCase(register.pending, (state) => {
        state.status = "loading";
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
        state.registrationSuccess = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.registrationSuccess = false;
      })

      // Verification cases
      .addCase(sendVerificationEmail.pending, (state) => {
        state.verificationStatus = "loading";
        state.verificationError = null;
      })
      .addCase(sendVerificationEmail.fulfilled, (state) => {
        state.verificationStatus = "succeeded";
        state.verificationError = null;
      })
      .addCase(sendVerificationEmail.rejected, (state, action) => {
        state.verificationStatus = "failed";
        state.verificationError = action.payload;
      })

      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordStatus = "loading";
        state.forgotPasswordError = null;
        state.forgotPasswordMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotPasswordStatus = "succeeded";
        state.forgotPasswordMessage = action.payload.message;
        state.forgotPasswordError = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordStatus = "failed";
        state.forgotPasswordError = action.payload;
        state.forgotPasswordMessage = null;
      })

      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.status = "idle";
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // Still cleanup even if API fails
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.status = "idle";
        state.error = null;
      })

      // Fetch profile cases
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetAuthStatus, resetVerificationStatus, syncAuthState, setRefreshing, resetForgotPasswordStatus } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

// Selector cho forgot password
export const selectForgotPasswordStatus = (state) => state.auth.forgotPasswordStatus;
export const selectForgotPasswordError = (state) => state.auth.forgotPasswordError;
export const selectForgotPasswordMessage = (state) => state.auth.forgotPasswordMessage;


