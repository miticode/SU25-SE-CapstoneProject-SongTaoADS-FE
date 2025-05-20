import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import productTypeReducer from './features/productType/productTypeSlice';
import customerReducer from './features/customer/customerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    productType: productTypeReducer,
    customers: customerReducer,
    // Thêm các reducer khác tại đây
  }
});

export default store;

