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
export const updateCustomerDetailApi = async (customerDetailId, customerData) => {
  try {
    const response = await customerService.put(`/api/customer-details/${customerDetailId}`, {
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
      error: error.response?.data?.message || 'Failed to update customer detail'
    };
  }
};
export const getCustomerDetailByUserIdApi = async (userId) => {
  try {
    const response = await customerService.get(`/api/user/${userId}/customer-details`);

    return response.data;
  } catch (error) {
    // If 404, it means the customer detail doesn't exist yet, which is not an error
    if (error.response && error.response.status === 404) {
      return { success: true, result: null };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch customer detail'
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
export const deleteCustomerChoiceApi = async (customerChoiceId) => {
  try {
    const response = await customerService.delete(`/api/customer-choices/${customerChoiceId}`);
    
    return response.data;
  } catch (error) {
    console.error("Error deleting customer choice:", error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete customer choice'
    };
  }
};
export const updateCustomerChoiceDetailApi = async (customerChoiceDetailId, attributeValueId) => {
  try {
    const response = await customerService.put(
      `/api/customer-choices-details/${customerChoiceDetailId}/attribute-values/${attributeValueId}`
    );
    
    return response.data;
  } catch (error) {
    console.error("Error updating customer choice detail:", error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update customer choice detail'
    };
  }
};
export const updateCustomerChoiceSizeApi = async (customerChoiceSizeId, sizeValue) => {
  try {
    console.log(`Updating size with ID: ${customerChoiceSizeId}, new value: ${sizeValue}`);
    
    const numericSizeValue = parseFloat(sizeValue);
    const response = await customerService.put(`/api/customer-choices-sizes/${customerChoiceSizeId}`, {
      sizeValue: numericSizeValue
    });
    
    console.log("Update size API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating size:", error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update size value'
    };
  }
};
export const fetchCustomerChoiceDetailsApi = async (customerChoiceId) => {
  try {
    const response = await customerService.get(`/api/customer-choices/${customerChoiceId}/customer-choice-details`);
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success, result };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch customer choice details'
    };
  }
};
export const fetchCustomerChoiceApi = async (customerChoiceId) => {
  try {
    const response = await customerService.get(`/api/customer-choices/${customerChoiceId}`);
    
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch customer choice'
    };
  }
};
export default customerService;