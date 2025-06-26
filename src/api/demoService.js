import axios from 'axios';

const API_URL = 'https://songtaoads.online';
const demoService = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const getToken = () => localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
demoService.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

demoService.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Lấy lịch sử demo theo request
export const getDemoDesignsApi = async (customDesignRequestId) => {
  try {
    const res = await demoService.get(`/api/custom-design-requests/${customDesignRequestId}/demo-designs`);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch demo designs' };
  }
};

//  Designer gửi bản demo cho khách hàng
export const createDemoDesignApi = async (customDesignRequestId, data) => {
  try {
    const res = await demoService.post(`/api/custom-design-requests/${customDesignRequestId}/demo-designs`, data);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to create demo design' };
  }
};

// Khách hàng từ chối bản demo
export const rejectDemoDesignApi = async (customDesignId) => {
  try {
    const res = await demoService.patch(`/api/demo-designs/${customDesignId}/reject`);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to reject demo design' };
  }
};

// Designer cập nhật lại hình ảnh demo
export const updateDemoDesignImageApi = async (customDesignId, data) => {
  try {
    const res = await demoService.patch(`/api/demo-designs/${customDesignId}/image`, data);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to update demo image' };
  }
};

// Khách hàng gửi hình ảnh feedback
export const updateDemoDesignFeedbackImagesApi = async (customDesignId, data) => {
  try {
    const res = await demoService.patch(`/api/demo-designs/${customDesignId}/feedback-images`, data);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to update feedback images' };
  }
};

// Designer cập nhật lại miêu tả cho bản thiết kế
export const updateDemoDesignDescriptionApi = async (customDesignId, data) => {
  try {
    const res = await demoService.patch(`/api/demo-designs/${customDesignId}/designer-description`, data);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to update designer description' };
  }
};

// Khách hàng chấp nhận bản demo
export const approveDemoDesignApi = async (customDesignId) => {
  try {
    const res = await demoService.patch(`/api/demo-designs/${customDesignId}/approve`);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to approve demo design' };
  }
};

// Xóa cứng bản demo
export const deleteDemoDesignApi = async (demoDesignId) => {
  try {
    const res = await demoService.delete(`/api/demo-designs/${demoDesignId}`);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to delete demo design' };
  }
};

export default demoService;
