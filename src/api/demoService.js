import axios from 'axios';

// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL
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
export const rejectDemoDesignApi = async (customDesignId, data) => {
  try {
    const res = await demoService.patch(`/api/demo-designs/${customDesignId}/reject`, data);
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

// Upload nhiều hình ảnh phụ cho bản demo
export const uploadDemoSubImagesApi = async (customDesignId, files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await demoService.post(`/api/demo-designs/${customDesignId}/sub-images`, formData);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to upload demo sub images' };
  }
};

// Lấy danh sách hình ảnh phụ của bản demo
export const getDemoSubImagesApi = async (demoDesignId) => {
  try {
    const res = await demoService.get(`/api/demo-designs/${demoDesignId}/sub-images`);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch demo sub images' };
  }
};

// Lấy danh sách hình ảnh phụ của bản thiết kế chính thức
export const getCustomDesignRequestSubImagesApi = async (customDesignRequestId) => {
  try {
    const res = await demoService.get(`/api/custom-design-requests/${customDesignRequestId}/sub-images`);
    return res.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch custom design request sub images' };
  }
};

export default demoService;

// xem thông tin chi tiết kích thước, loại ảnh demo 

