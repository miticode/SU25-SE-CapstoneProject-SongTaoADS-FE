import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import productTypeReducer from "./features/productType/productTypeSlice";
import customerReducer from "./features/customer/customerSlice";
import attributeReducer from "./features/attribute/attributeSlice";
import orderReducer from "./features/order/orderSlice";
import designTemplateReducer from "./features/designTemplate/designTemplateSlice";
import userReducer from "./features/user/userSlice";
import aiReducer from "./features/ai/aiSlice";
import sizeReducer from "./features/size/sizeSlice";
import s3Reducer from "./features/s3/s3Slice";
import chatReducer from "./features/chat/chatSlice";
import attributeValueReducer from "./features/attribute/attributeValueSlice";
import customDesignReducer from "./features/customeDesign/customerDesignSlice";
import priceReducer from "./features/price/priceSlice";

import contractReducer from "./features/contract/contractSlice";

import paymentReducer from "./features/payment/paymentSlice";
import demoReducer from "./features/demo/demoSlice";
import impressionReducer from "./features/impression/impressionSlice";
import backgroundReducer from "./features/background/backgroundSlice";
import ticketReducer from "./features/ticket/ticketSlice";
import iconReducer from './features/icon/iconSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    productType: productTypeReducer,
    customers: customerReducer,
    attribute: attributeReducer,
    order: orderReducer,
    designTemplate: designTemplateReducer,
    users: userReducer,
    ai: aiReducer,
    size: sizeReducer,

    s3: s3Reducer,
    attributeValue: attributeValueReducer,
    chat: chatReducer,
    customDesign: customDesignReducer,
    price: priceReducer,
    contract: contractReducer,
    payment: paymentReducer,
    demo: demoReducer,
    impression: impressionReducer,
    background: backgroundReducer,
    ticket: ticketReducer,
   icon: iconReducer,
  },
});

export default store;
