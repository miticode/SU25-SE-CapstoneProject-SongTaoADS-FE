import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const contractorService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

contractorService.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

contractorService.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Lấy tất cả đơn vị thi công với phân trang và filter
export const getAllContractors = async (params = {}) => {
  try {
    const { page = 1, size = 10, isInternal } = params;
    const queryParams = new URLSearchParams();

    if (page) queryParams.append('page', page);
    if (size) queryParams.append('size', size);
    // Chỉ thêm isInternal nếu có giá trị boolean
    if (isInternal !== undefined && isInternal !== null) {
      queryParams.append('isInternal', isInternal);
    }

    const response = await contractorService.get(`/api/contractors?${queryParams.toString()}`);
    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;

    if (success) {
      return {
        success: true,
        data: result,
        pagination: {
          currentPage,
          totalPages,
          pageSize,
          totalElements
        }
      };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching contractors:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch contractors',
    };
  }
};

// Lấy đơn vị thi công theo ID
export const getContractorById = async (contractorId) => {
  try {
    const response = await contractorService.get(`/api/contractors/${contractorId}`);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching contractor by ID:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch contractor',
    };
  }
};

// Tạo mới đơn vị thi công với hình ảnh
export const createContractor = async (data) => {
  try {
    const formData = new FormData();

    // Thêm các field text
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('isInternal', data.isInternal);
    formData.append('isAvailable', data.isAvailable);

    // Thêm file logo nếu có
    if (data.logoImage) {
      formData.append('logoImage', data.logoImage);
    }

    const response = await contractorService.post('/api/contractors', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error creating contractor:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create contractor',
    };
  }
};

// Cập nhật thông tin đơn vị thi công
export const updateContractor = async (contractorId, data) => {
  try {
    const response = await contractorService.put(`/api/contractors/${contractorId}`, data);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error updating contractor:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update contractor',
    };
  }
};

// Cập nhật hình ảnh đơn vị thi công
export const updateContractorLogo = async (contractorId, logoFile) => {
  try {
    const formData = new FormData();
    formData.append('file', logoFile);

    const response = await contractorService.patch(`/api/contractors/${contractorId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error updating contractor logo:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update contractor logo',
    };
  }
};

// Xóa đơn vị thi công (không dùng - theo API doc)
export const deleteContractor = async (contractorId) => {
  try {
    const response = await contractorService.delete(`/api/contractors/${contractorId}`);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error deleting contractor:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete contractor',
    };
  }
};

export default contractorService;
