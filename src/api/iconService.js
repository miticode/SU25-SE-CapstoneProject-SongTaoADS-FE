import axios from 'axios';
import { getPresignedUrl } from './s3Service';


// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL

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
export const fetchIconsApi = async (page = 1, size = 10) => {
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

// API để tạo icon mới
export const createIconApi = async (formData) => {
  try {
    console.log('Creating new icon with formData:', formData);

    const response = await iconService.post('/api/icons', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Create icon API Response:', response.data);

    const { success, result, message } = response.data;

    if (success && result) {
      // Tạo presigned URL cho icon mới
      let presignedUrl = null;
      if (result.imageUrl) {
        try {
          const presignedResult = await getPresignedUrl(result.imageUrl, 60);
          if (presignedResult.success) {
            presignedUrl = presignedResult.url;
          }
        } catch (error) {
          console.error('Error creating presigned URL for new icon:', error);
        }
      }

      return {
        success: true,
        data: {
          ...result,
          presignedUrl,
          fullImageUrl: presignedUrl || `${API_URL}/${result.imageUrl}`
        }
      };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error creating icon:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create icon'
    };
  }
};

// API để cập nhật thông tin icon
export const updateIconInfoApi = async (iconId, updateData) => {
  try {
    console.log(`Updating icon ${iconId} with data:`, updateData);

    const response = await iconService.patch(`/api/icons/${iconId}/information`, updateData);

    console.log('Update icon info API Response:', response.data);

    const { success, result, message } = response.data;

    if (success && result) {
      // Tạo presigned URL cho icon đã cập nhật
      let presignedUrl = null;
      if (result.imageUrl) {
        try {
          const presignedResult = await getPresignedUrl(result.imageUrl, 60);
          if (presignedResult.success) {
            presignedUrl = presignedResult.url;
          }
        } catch (error) {
          console.error('Error creating presigned URL for updated icon:', error);
        }
      }

      return {
        success: true,
        data: {
          ...result,
          presignedUrl,
          fullImageUrl: presignedUrl || `${API_URL}/${result.imageUrl}`
        }
      };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error updating icon info:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update icon info'
    };
  }
};

// API để cập nhật hình ảnh icon
export const updateIconImageApi = async (iconId, formData) => {
  try {
    console.log(`Updating icon image for ${iconId}`);

    const response = await iconService.patch(`/api/icons/${iconId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Update icon image API Response:', response.data);

    const { success, result, message } = response.data;

    if (success && result) {
      // Tạo presigned URL cho icon đã cập nhật
      let presignedUrl = null;
      if (result.imageUrl) {
        try {
          const presignedResult = await getPresignedUrl(result.imageUrl, 60);
          if (presignedResult.success) {
            presignedUrl = presignedResult.url;
          }
        } catch (error) {
          console.error('Error creating presigned URL for updated icon image:', error);
        }
      }

      return {
        success: true,
        data: {
          ...result,
          presignedUrl,
          fullImageUrl: presignedUrl || `${API_URL}/${result.imageUrl}`
        }
      };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error updating icon image:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update icon image'
    };
  }
};

// API để xóa icon
export const deleteIconApi = async (fileDataId) => {
  try {
    console.log(`Deleting icon with fileDataId: ${fileDataId}`);

    const response = await iconService.delete(`/api/file-data/${fileDataId}`);

    console.log('Delete icon API Response:', response.data);

    const { success, message } = response.data;

    if (success) {
      return { success: true, message };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error('Error deleting icon:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete icon'
    };
  }
};

export default iconService;
