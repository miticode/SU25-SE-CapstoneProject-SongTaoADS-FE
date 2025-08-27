import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

// Lấy token từ localStorage
const getAuthToken = () => {
    return localStorage.getItem('accessToken');
};

// Tạo instance axios với config mặc định
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Lấy tất cả topics
export const getAllTopics = async () => {
    try {
        const response = await apiClient.get('/api/topics');
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Lấy topic theo ID
export const getTopicById = async (id) => {
    const response = await apiClient.get(`/api/topics/${id}`);
    return response.data;
};

// Tạo topic mới
export const createTopic = async (topicData) => {
    const response = await apiClient.post('/api/topics', topicData);
    return response.data;
};

// Cập nhật topic
export const updateTopic = async (id, topicData) => {
    const response = await apiClient.put(`/api/topics/${id}`, topicData);
    return response.data;
};

// Xóa topic
export const deleteTopic = async (id) => {
    const response = await apiClient.delete(`/api/topics/${id}`);
    return response.data;
};

// Kiểm tra topic có đang được sử dụng trong model chat không
export const checkTopicUsage = async (topicId) => {
    const response = await apiClient.get(`/api/topic/${topicId}/chat-bot-topic`);
    return response.data;
};
