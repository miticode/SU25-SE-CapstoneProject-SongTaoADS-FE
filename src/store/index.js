import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Thêm các reducer khác tại đây
  }
});

export default store;

