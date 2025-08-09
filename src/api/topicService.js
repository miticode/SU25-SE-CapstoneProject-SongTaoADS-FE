import axios from 'axios';

const API_BASE_URL = 'https://songtaoads.online/api';

// Lấy token từ localStorage
const getAuthToken = () => {
    return localStorage.getItem('accessToken');
};

// Tạo instance axios với config mặc định
const apiClient = axios.create({
    baseURL: API_BASE_URL,
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
        const response = await apiClient.get('/topics');
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Lấy topic theo ID
export const getTopicById = async (id) => {
    try {
        const response = await apiClient.get(`/topics/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Tạo topic mới
export const createTopic = async (topicData) => {
    try {
        const response = await apiClient.post('/topics', topicData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật topic
export const updateTopic = async (id, topicData) => {
    try {
        const response = await apiClient.put(`/topics/${id}`, topicData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Xóa topic
export const deleteTopic = async (id) => {
    try {
        const response = await apiClient.delete(`/topics/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
