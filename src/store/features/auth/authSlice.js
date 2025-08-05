import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginApi,
  registerApi,
  logoutApi,
  resendVerificationApi,
  getProfileApi,
  forgotPasswordApi, // Thêm import hàm mới
  outboundAuthenticationApi, // Thêm import hàm outbound authentication
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
  outboundAuthStatus: "idle", // Thêm trạng thái outbound authentication
  outboundAuthError: null, // Thêm lỗi outbound authentication
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
    console.log("Sending verification email in thunk:", userData);
    const response = await resendVerificationApi(userData);
    console.log("Verification email thunk response:", response);

    if (!response.success) {
      console.log("Verification email failed:", response.error);
      return rejectWithValue(response.error || "Gửi email xác thực thất bại");
    }

    console.log("Verification email successful");
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
      // Bước 1: Đăng nhập
      const loginResponse = await loginApi(credentials);

      if (!loginResponse.success) {
        return rejectWithValue(loginResponse.error || "Đăng nhập thất bại");
      }

      // Lưu token ngay lập tức
      if (loginResponse.data.accessToken) {
        localStorage.setItem("accessToken", loginResponse.data.accessToken);
      }

      // Bước 2: Lấy thông tin profile
      const profileResponse = await getProfileApi();

      if (!profileResponse.success) {
        return rejectWithValue("Không thể lấy thông tin người dùng");
      }

      console.log("Profile in loginAndFetchProfile:", profileResponse.data); // Debug log

      // Trả về dữ liệu hoàn chỉnh
      return {
        user: profileResponse.data, // Đảm bảo user data đúng cấu trúc
        accessToken: loginResponse.data.accessToken,
      };
    } catch (error) {
      console.error("Login and fetch profile error:", error);
      return rejectWithValue(error.message || "Có lỗi xảy ra khi đăng nhập");
    }
  }
);

// Thunk để khởi tạo auth state và fetch profile
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        return rejectWithValue("No token found");
      }

      // Kiểm tra xem đã có user data chưa
      const currentState = getState();
      if (currentState.auth.isAuthenticated && currentState.auth.user) {
        return {
          user: currentState.auth.user,
          accessToken: token,
        };
      }

      // Lấy thông tin profile
      const profileResponse = await getProfileApi();

      if (!profileResponse.success) {
        localStorage.removeItem("accessToken");
        return rejectWithValue("Invalid token");
      }

      // SỬA: Đổi từ result thành data
      return {
        user: profileResponse.data, // SỬA: Đổi từ profileResponse.result thành profileResponse.data
        accessToken: token,
      };
    } catch (error) {
      console.error("Initialize auth error:", error);
      localStorage.removeItem("accessToken");
      return rejectWithValue(error.message || "Auth initialization failed");
    }
  }
);

// Thunk gửi email đặt lại mật khẩu
export const forgotPassword = createAsyncThunk(
  "/api/password-reset/resend",
  async (email, { rejectWithValue }) => {
    const response = await forgotPasswordApi(email);
    if (!response.success) {
      return rejectWithValue(
        response.error || "Gửi email đặt lại mật khẩu thất bại"
      );
    }
    return response;
  }
);

// Thunk xác thực OAuth từ dịch vụ bên ngoài
export const outboundAuthentication = createAsyncThunk(
  "/api/auth/outbound/authentication",
  async (code, { rejectWithValue }) => {
    const response = await outboundAuthenticationApi(code);
    if (!response.success) {
      return rejectWithValue(
        response.error || "Outbound authentication failed"
      );
    }
    return response;
  }
);

// Thunk để thực hiện outbound authentication và fetch profile
export const outboundAuthenticationAndFetchProfile = createAsyncThunk(
  "auth/outboundAuthenticationAndFetchProfile",
  async (code, { rejectWithValue }) => {
    try {
      // Bước 1: Thực hiện outbound authentication
      const authResponse = await outboundAuthenticationApi(code);

      if (!authResponse.success) {
        return rejectWithValue(
          authResponse.error || "Outbound authentication failed"
        );
      }

      // Lưu token ngay lập tức
      if (authResponse.data.accessToken) {
        localStorage.setItem("accessToken", authResponse.data.accessToken);
      }

      // Bước 2: Lấy thông tin profile
      const profileResponse = await getProfileApi();

      if (!profileResponse.success) {
        return rejectWithValue("Không thể lấy thông tin người dùng");
      }

      console.log(
        "Profile in outboundAuthenticationAndFetchProfile:",
        profileResponse.data
      );

      // Trả về dữ liệu hoàn chỉnh
      return {
        user: profileResponse.data,
        accessToken: authResponse.data.accessToken,
        authResponse: authResponse,
      };
    } catch (error) {
      console.error("Outbound authentication and fetch profile error:", error);
      return rejectWithValue(error.message || "Có lỗi xảy ra khi đăng nhập");
    }
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
    resetOutboundAuthStatus: (state) => {
      state.outboundAuthStatus = "idle";
      state.outboundAuthError = null;
    },
    syncAuthState: (state, action) => {
      const { isAuthenticated, user, accessToken } = action.payload;
      state.isAuthenticated = isAuthenticated;
      state.user = user;
      state.accessToken = accessToken;
      state.tokenTimestamp = Date.now();
      if (isAuthenticated) {
        state.status = "succeeded";
      }
    },
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
    // Thêm action để reset lỗi init
    clearAuthError: (state) => {
      state.error = null;
    },
    // Action để cập nhật user profile trực tiếp
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.tokenTimestamp = Date.now();
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.tokenTimestamp = null;
        state.error = action.payload;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "idle";
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.tokenTimestamp = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.status = "idle";
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.tokenTimestamp = null;
      })

      // Send verification email
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

      // Outbound authentication cases
      .addCase(outboundAuthentication.pending, (state) => {
        state.outboundAuthStatus = "loading";
        state.outboundAuthError = null;
        state.status = "loading";
      })
      .addCase(outboundAuthentication.fulfilled, (state, action) => {
        state.outboundAuthStatus = "succeeded";
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.accessToken = action.payload.data.accessToken;
        state.tokenTimestamp = Date.now();
        state.outboundAuthError = null;
        state.error = null;
        // User data sẽ được fetch riêng sau khi authentication thành công
      })
      .addCase(outboundAuthentication.rejected, (state, action) => {
        state.outboundAuthStatus = "failed";
        state.status = "failed";
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.tokenTimestamp = null;
        state.outboundAuthError = action.payload;
        state.error = action.payload;
      })

      // Outbound authentication and fetch profile
      .addCase(outboundAuthenticationAndFetchProfile.pending, (state) => {
        state.outboundAuthStatus = "loading";
        state.status = "loading";
        state.outboundAuthError = null;
        state.error = null;
      })
      .addCase(
        outboundAuthenticationAndFetchProfile.fulfilled,
        (state, action) => {
          state.outboundAuthStatus = "succeeded";
          state.status = "succeeded";
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.tokenTimestamp = Date.now();
          state.outboundAuthError = null;
          state.error = null;
        }
      )
      .addCase(
        outboundAuthenticationAndFetchProfile.rejected,
        (state, action) => {
          state.outboundAuthStatus = "failed";
          state.status = "failed";
          state.isAuthenticated = false;
          state.user = null;
          state.accessToken = null;
          state.tokenTimestamp = null;
          state.outboundAuthError = action.payload;
          state.error = action.payload;
          localStorage.removeItem("accessToken");
        }
      )

      // Fetch profile
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
      })

      // Login and fetch profile
      .addCase(loginAndFetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginAndFetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.tokenTimestamp = Date.now();
        state.error = null;
      })
      .addCase(loginAndFetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.tokenTimestamp = null;
        state.error = action.payload;
        localStorage.removeItem("accessToken");
      })

      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        // Không set loading nếu đã có user data
        if (!state.user) {
          state.status = "loading";
        }
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.tokenTimestamp = Date.now();
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.status = "failed";
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.tokenTimestamp = null;
        state.error = action.payload;
      });
  },
});

export const {
  resetAuthStatus,
  resetVerificationStatus,
  syncAuthState,
  setRefreshing,
  resetForgotPasswordStatus,
  resetOutboundAuthStatus,
  clearAuthError,
  updateUserProfile,
} = authSlice.actions;

export default authSlice.reducer;
// Selectors
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

// Selector cho forgot password
export const selectForgotPasswordStatus = (state) =>
  state.auth.forgotPasswordStatus;
export const selectForgotPasswordError = (state) =>
  state.auth.forgotPasswordError;
export const selectForgotPasswordMessage = (state) =>
  state.auth.forgotPasswordMessage;

// Selector cho outbound authentication
export const selectOutboundAuthStatus = (state) =>
  state.auth.outboundAuthStatus;
export const selectOutboundAuthError = (state) => state.auth.outboundAuthError;
