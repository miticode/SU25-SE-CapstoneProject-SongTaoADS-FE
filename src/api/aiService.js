import axios from 'axios';

// Lấy token
const getToken = () => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

// API để tạo AI design
export const createAIDesignApi = async (customerDetailId, designTemplateId, customerNote, aiImage) => {
  try {
    const formData = new FormData();
    
    // Đảm bảo customerNote không bao giờ là null/undefined
    const safeNote = typeof customerNote === 'string' ? customerNote : "Thiết kế từ người dùng";
    console.log("Setting customerNote:", safeNote);
    
    // Thêm các trường vào FormData
    formData.append('customerNote', safeNote);
    
    // Thêm file ảnh
    if (aiImage) {
      formData.append('aiImage', aiImage);
    }
    
    const token = getToken();
    const API_URL = 'https://songtaoads.online';
    
    // Log formData để kiểm tra
    for (let pair of formData.entries()) {
      console.log(pair[0]+ ': ' + (pair[0] === 'aiImage' ? 'Image File' : pair[1]));
    }
    
    const response = await axios.post(
      `${API_URL}/api/customer-details/${customerDetailId}/design-templates/${designTemplateId}/ai-designs`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};