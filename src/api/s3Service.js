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
export const getPresignedUrl = async (key, durationInMinutes = 30) => {
  try {
    const token = getToken();
    const API_URL = 'https://songtaoads.online';
    
    console.log('Getting presigned URL for key:', key);
    
    const response = await axios.get(
      `${API_URL}/api/s3/presigned-url`,
      {
        params: { 
          key,
          durationInMinutes 
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // Response trả về trực tiếp là URL string
    const presignedUrl = response.data;
    
    console.log('Presigned URL received:', presignedUrl);
    
    return { 
      success: true, 
      url: presignedUrl 
    };
  } catch (error) {
    console.error('Presigned URL API Error:', error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to get presigned URL'
    };
  }
};
export const openFileInNewTab = async (key, durationInMinutes = 30) => {
  const result = await getPresignedUrl(key, durationInMinutes);
  if (result.success) {
    window.open(result.url, '_blank');
    return result;
  }
  return result;
};
export const downloadFile = async (key, filename, durationInMinutes = 30) => {
  const result = await getPresignedUrl(key, durationInMinutes);
  if (result.success) {
    // Tạo link tải về
    const link = document.createElement('a');
    link.href = result.url;
    link.download = filename || key.split('/').pop(); // Lấy tên file từ key
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return result;
  }
  return result;
};