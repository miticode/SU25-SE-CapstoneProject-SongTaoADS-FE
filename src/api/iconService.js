import axios from 'axios';
import { getPresignedUrl } from './s3Service';


// Sử dụng URL backend trực tiếp
const API_URL = "https://songtaoads.online";

// Get token function
const getToken = () => {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
};

// Create axios instance with interceptors
const iconService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Allow sending and receiving cookies from API
});

// Request interceptor to add authorization token
iconService.interceptors.request.use(
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
iconService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Icon API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API to fetch all icons with pagination
export const fetchIconsApi = async (page = 1, size = 20) => {
  try {
    console.log(`Fetching icons - Page: ${page}, Size: ${size}`);
    
    const response = await iconService.get('/api/icons', {
      params: {
        page,
        size
      }
    });
    
    console.log('Icons API Response:', response.data);
    
    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;
    
    if (success && Array.isArray(result)) {
      // Process data và tạo presigned URL cho từng icon
      const processedData = await Promise.all(result.map(async (item) => {
        let presignedUrl = null;
        
        // Tạo presigned URL cho imageUrl nếu có
        if (item.imageUrl) {
          try {
            console.log(`Creating presigned URL for icon: ${item.id}, imageUrl: ${item.imageUrl}`);
            
            // Sử dụng imageUrl làm key cho getPresignedUrl
            const presignedResult = await getPresignedUrl(item.imageUrl, 60); // 60 phút
            
            if (presignedResult.success) {
              presignedUrl = presignedResult.url;
              console.log(`✅ Presigned URL created for icon ${item.id}:`, presignedUrl);
            } else {
              console.error(`❌ Failed to create presigned URL for icon ${item.id}:`, presignedResult.message);
            }
          } catch (error) {
            console.error(`Error creating presigned URL for icon ${item.id}:`, error);
          }
        }
        
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl, // Giữ nguyên S3 key
          presignedUrl: presignedUrl, // URL để hiển thị
          contentType: item.contentType,
          fileType: item.fileType,
          fileSize: item.fileSize,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          // Deprecated: không cần fullImageUrl nữa
          fullImageUrl: presignedUrl || `${API_URL}/${item.imageUrl}` // Fallback
        };
      }));
      
      console.log('Processed icons with presigned URLs:', processedData);
      
      return { 
        success: true, 
        data: processedData,
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
    console.error('Error fetching icons:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch icons'
    };
  }
};



export default iconService;
