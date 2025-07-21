import axios from 'axios';

// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL 

const priceService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

priceService.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  priceService.interceptors.response.use(
    (response) => response,
    (error) => {
      return Promise.reject(error);
    }
  );

// Lấy lịch sử báo giá theo request
export const getPriceProposals = async (customDesignRequestId) => {
  try {
    const response = await priceService.get(`/api/custom-design-requests/${customDesignRequestId}/price-proposals`);
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Không lấy được lịch sử báo giá" };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || "Lỗi khi lấy lịch sử báo giá" };
  }
};

// Sale báo giá thiết kế
export const createPriceProposal = async (customDesignRequestId, data) => {
  try {
    const response = await priceService.post(`/api/custom-design-requests/${customDesignRequestId}/price-proposals`, data);
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Không thể báo giá" };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || "Lỗi khi báo giá" };
  }
};

// Sale cập nhật lại giá đã báo nếu cần
export const updatePriceProposalPricing = async (priceProposalId, data) => {
  try {
    const response = await priceService.patch(`/api/price-proposals/${priceProposalId}/pricing`, data);
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Không thể cập nhật giá" };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || "Lỗi khi cập nhật giá" };
  }
};

// Khách hàng từ chối thiết kế và offer 1 giá khác
export const offerPriceProposal = async (priceProposalId, data) => {
  try {
    const response = await priceService.patch(`/api/price-proposals/${priceProposalId}/offer`, data);
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Không thể offer giá mới" };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || "Lỗi khi offer giá mới" };
  }
};

// Khách hàng chấp nhận báo giá
export const approvePriceProposal = async (priceProposalId) => {
  try {
    const response = await priceService.patch(`/api/price-proposals/${priceProposalId}/approve`);
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Không thể duyệt báo giá" };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || "Lỗi khi duyệt báo giá" };
  }
};
