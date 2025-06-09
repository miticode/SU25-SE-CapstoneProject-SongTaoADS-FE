import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginApi,
  registerApi,
  logoutApi,
  updateAuthState,
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

// Đơn giản hóa slice - chỉ còn các hàm cần thiết
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthStatus: (state) => {
      state.status = "idle";
      state.error = null;
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
      });
  },
});

export const { resetAuthStatus, syncAuthState, setRefreshing } = authSlice.actions;

export default authSlice.reducer;
