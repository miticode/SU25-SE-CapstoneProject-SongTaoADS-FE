import axios from 'axios';

// Cập nhật URL API thực tế của bạn
const API_URL = 'http://localhost:8080';

// Tạo instance axios với interceptors
const customerService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Interceptor để xử lý lỗi
customerService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm tạo customer mới
export const createCustomerApi = async (customerData) => {
  try {
    const response = await customerService.post('/api/customer-details', {
      logoUrl: customerData.logoUrl,
      companyName: customerData.companyName,
      tagLine: customerData.tagLine,
      contactInfo: customerData.contactInfo,
      userId: customerData.userId
    });
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success: true, data: result };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create customer'
    };
  }
};
export const linkCustomerToProductTypeApi = async (customerId, productTypeId) => {
  try {
    const response = await customerService.post(`/api/customers/${customerId}/product-types/${productTypeId}`);
    
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to link customer to product type'
    };
  }
};
// API to link attribute value to customer choice
export const linkAttributeValueToCustomerChoiceApi = async (customerChoiceId, attributeValueId) => {
  try {
    const response = await customerService.post(`/api/customer-choices/${customerChoiceId}/attribute-values/${attributeValueId}`);
    
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to link attribute value to customer choice'
    };
  }
};
// API to link size to customer choice
export const linkSizeToCustomerChoiceApi = async (customerChoiceId, sizeId, sizeValue) => {
  try {
     console.log(`API call with customerChoiceId: ${customerChoiceId}, sizeId: ${sizeId}, sizeValue: ${sizeValue} (type: ${typeof sizeValue})`);
     const numericSizeValue = parseFloat(sizeValue);
    const response = await customerService.post(`/api/customer-choices/${customerChoiceId}/sizes/${sizeId}`, {
      sizeValue: numericSizeValue
    });
   console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to link size to customer choice'
    };
  }
  
};
export const getCustomerChoiceDetailApi = async (customerChoiceDetailId) => {
  try {
    // Log the ID to verify it's a string
    console.log("Fetching customer choice detail with ID:", customerChoiceDetailId);
    
    // Make sure customerChoiceDetailId is a string
    if (typeof customerChoiceDetailId !== 'string') {
      console.error("Invalid customerChoiceDetailId type:", typeof customerChoiceDetailId);
      return {
        success: false,
        error: 'Invalid customer choice detail ID'
      };
    }
    
    const response = await customerService.get(`/api/customer-choice-details/${customerChoiceDetailId}`);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching customer choice detail:", error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch customer choice detail'
    };
  }
};
export default customerService;