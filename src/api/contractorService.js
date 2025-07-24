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

export const getAllContractors = async () => {
  try {
    const response = await contractorService.get('/api/contractors');
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
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

export const createContractor = async (data) => {
  try {
    const response = await contractorService.post('/api/contractors', data);
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
