import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import productTypeReducer from './features/productType/productTypeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    productType: productTypeReducer,
    // Thêm các reducer khác tại đây
  }
});

export default store;

