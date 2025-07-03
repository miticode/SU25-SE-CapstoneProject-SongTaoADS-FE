import axios from 'axios';

// API base URL
const API_URL = 'https://songtaoads.online';

// Get token function
const getToken = () => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

// Create axios instance with interceptors
const backgroundService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Allow sending and receiving cookies from API
});

// Request interceptor to add authorization token
backgroundService.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
backgroundService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Background API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API to fetch background suggestions by customer choice ID
export const fetchBackgroundSuggestionsByCustomerChoiceIdApi = async (customerChoiceId) => {
  try {
    console.log(`Fetching background suggestions for customer choice ID: ${customerChoiceId}`);
    
    const response = await backgroundService.get(`/api/customer-choices/${customerChoiceId}/suggestion`);
    
    console.log('Background API Response:', response.data);
    
    const { success, result, message } = response.data;
    
    if (success && Array.isArray(result)) {
      // Process data to ensure consistency
      const processedData = result.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        backgroundUrl: item.backgroundUrl,
        isAvailable: item.isAvailable,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        attributeValues: item.attributeValues
      }));
      
      console.log('Processed background suggestions:', processedData);
      return { success: true, data: processedData };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error fetching background suggestions:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch background suggestions'
    };
  }
};

export default backgroundService;