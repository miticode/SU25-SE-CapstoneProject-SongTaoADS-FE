import axios from 'axios';

// Lấy token
const getToken = () => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

// API để lấy hình ảnh từ S3
export const getImageFromS3 = async (key) => {
  try {
    const token = getToken();
    const API_URL = 'https://songtaoads.online';
    
    // Log để debug
    console.log('Fetching image from S3:');
    console.log('Image key:', key);
    
    const response = await axios.get(
      `${API_URL}/api/s3/image`,
      {
        params: { key },
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob', // Important: to handle binary image data
      }
    );
    
    // Convert blob to URL for display
    const imageUrl = URL.createObjectURL(response.data);
    return { success: true, imageUrl, blob: response.data };
  } catch (error) {
    console.error('S3 Image API Error:', error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch image from S3'
    };
  }
};