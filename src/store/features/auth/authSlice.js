import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, registerApi, logoutApi, updateAuthState } from '../../../api/authService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null
};

// Async thunks
export const login = createAsyncThunk(
  '/api/v1/auth/login',
  async (credentials, { rejectWithValue }) => {
    const response = await loginApi(credentials);
    
    if (!response.success) {
      return rejectWithValue(response.error || 'Login failed');
    }
    
    return response.data;
  }
);

export const register = createAsyncThunk(
  '/api/v1/auth/register',
  async (userData, { rejectWithValue }) => {
    const response = await registerApi(userData);
    
    if (!response.success) {
      return rejectWithValue(response.error || 'Registration failed');
    }
    
    // Tự động đăng nhập sau khi đăng ký
    return { registered: true };
  }
);

export const logout = createAsyncThunk(
  '/api/v1/auth/logout',
  async (_, { rejectWithValue }) => {
    const response = await logoutApi();
    
    if (!response.success) {
      return rejectWithValue(response.error || 'Logout failed');
    }
    
    return null;
  }
);

// Đơn giản hóa slice - chỉ còn các hàm cần thiết
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    syncAuthState: (state, action) => {
      const { isAuthenticated, user } = action.payload || {};
      if (isAuthenticated !== undefined) state.isAuthenticated = isAuthenticated;
      if (user) state.user = user;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        // Cập nhật trạng thái trong authService
        updateAuthState(true, action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Register cases
     .addCase(register.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(register.fulfilled, (state, action) => {
      state.status = 'succeeded';
      // Không cần cập nhật user và isAuthenticated vì không tự động đăng nhập
      state.error = null;
      // Có thể thêm một flag để biết đã đăng ký thành công
      state.registrationSuccess = true;
    })
    .addCase(register.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
      state.registrationSuccess = false;
    })
      
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
      })
  }
});

export const { resetAuthStatus, syncAuthState } = authSlice.actions;

export default authSlice.reducer;