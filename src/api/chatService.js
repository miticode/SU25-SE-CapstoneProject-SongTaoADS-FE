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
// upload file để finetunefinetune
export const uploadFileFineTuneApi = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await chatService.post('/api/chat-bot/upload-file-finetune', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success, result };
    }
    
    return { success: false, error: message || 'Lỗi khi upload file' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể upload file'
    };
  }
};
// training model
export const fineTuneModelApi = async (model, trainingFile) => {
  try {
    const response = await chatService.post('/api/chat-bot/finetune-model', {
      model,
      training_file: trainingFile
    });
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success, result };
    }
    
    return { success: false, error: message || 'Lỗi khi fine-tune model' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể fine-tune model'
    };
  }
}; 
// hủy training model
export const cancelFineTuneJobApi = async (fineTuningJobId) => {
  try {
    const response = await chatService.post(`/api/chat-bot/fine-tuning-jobs/${fineTuningJobId}/cancel`);
    const { success, result, message } = response.data;
    if (success) {
      return { success, result };
    }
    return { success: false, error: message || 'Lỗi khi huỷ training' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể huỷ training'
    };
  }
}; 
// xóa file 
export const deleteFineTuneFileApi = async (fileId) => {
  try {
    const response = await chatService.delete(`/api/chat-bot/files/${fileId}`);
    const { success, result, message } = response.data;
    if (success) {
      return { success, result };
    }
    return { success: false, error: message || 'Lỗi khi xóa file' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể xóa file'
    };
  }
}; 
// Lấy danh sách job fine-tune
export const getFineTuneJobsApi = async () => {
  try {
    const response = await chatService.get('/api/chat-bot/fine-tune-jobs');
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || 'Lỗi khi lấy danh sách job' };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Không thể lấy danh sách job' };
  }
};

// Lấy danh sách file
export const getFineTuneFilesApi = async () => {
  try {
    const response = await chatService.get('/api/chat-bot/files');
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || 'Lỗi khi lấy danh sách file' };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Không thể lấy danh sách file' };
  }
};

// Lấy chi tiết file
export const getFineTuneFileDetailApi = async (fileId) => {
  try {
    const response = await chatService.get(`/api/chat-bot/files/${fileId}`);
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || 'Lỗi khi lấy chi tiết file' };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Không thể lấy chi tiết file' };
  }
}; 
