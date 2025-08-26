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
// Lấy tất cả questions
export const getAllQuestions = async () => {
    try {
        const response = await apiClient.get('/api/questions');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy question theo ID
export const getQuestionById = async (questionId) => {
    try {
        const response = await apiClient.get(`/api/questions/${questionId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy tất cả questions theo topic
export const getQuestionsByTopic = async (topicId) => {
    try {
        const response = await apiClient.get(`/api/topic/${topicId}/question`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Tạo question mới theo topic
export const createQuestionByTopic = async (topicId, questionData) => {
    try {
        const response = await apiClient.post(`/api/topics/${topicId}/questions`, questionData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật question
export const updateQuestion = async (questionId, questionData) => {
    try {
        const response = await apiClient.put(`/api/questions/${questionId}`, questionData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Xóa question
export const deleteQuestion = async (questionId) => {
    try {
        const response = await apiClient.delete(`/api/questions/${questionId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
