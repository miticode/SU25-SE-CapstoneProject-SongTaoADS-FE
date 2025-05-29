import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import productTypeReducer from './features/productType/productTypeSlice';
import customerReducer from './features/customer/customerSlice';
import attributeReducer from './features/attribute/attributeSlice';
import orderReducer from './features/order/orderSlice';
import designTemplateReducer from './features/designTemplate/designTemplateSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    productType: productTypeReducer,
    customers: customerReducer,
    attribute: attributeReducer,
    order: orderReducer,
      designTemplate: designTemplateReducer,
    // Thêm các reducer khác tại đây
  }
});

export default store;

