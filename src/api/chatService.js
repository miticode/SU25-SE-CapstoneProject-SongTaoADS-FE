import axios from 'axios';
const API_URL = 'https://songtaoads.online';
const chatService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true 
});

chatService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const sendChatMessageApi = async (prompt) => {
  try {
    const response = await chatService.post('/api/chat', {
      prompt
    });
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success, result };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send chat message'
    };
  }
}; 
