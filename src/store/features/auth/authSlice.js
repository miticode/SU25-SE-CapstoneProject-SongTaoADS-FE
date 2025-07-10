import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginApi,
  registerApi,
  logoutApi,
  updateAuthState,
  resendVerificationApi,
  getProfileApi,
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

      console.log('Profile in loginAndFetchProfile:', profileResponse.data); // Debug log

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
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
// Selectors
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
