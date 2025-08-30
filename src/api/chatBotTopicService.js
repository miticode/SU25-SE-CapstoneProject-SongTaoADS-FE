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

// Thêm topic vào model chat bot
export const addTopicToModelChat = async (modelChatBotId, topicId) => {
    try {
        const response = await apiClient.post(`/api/model-chat/${modelChatBotId}/topics/${topicId}/chat-bot-topic`);
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Xem chat bot topic bằng model chat id
export const getChatBotTopicsByModelChat = async (modelChatBotId) => {
    try {
        const response = await apiClient.get(`/api/model-chat/${modelChatBotId}/chat-bot-topic`);
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Thêm topic từ model trước đó
export const addTopicFromModel = async (modelChatBotId, topicData) => {
    try {
        const response = await apiClient.post(`/api/model-chat/${modelChatBotId}/chat-bot-topic`, topicData);
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Xem chat bot topic bằng topic id
export const getChatBotTopicsByTopic = async (topicId) => {
    try {
        const response = await apiClient.get(`/api/topic/${topicId}/chat-bot-topic`);
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Xem tất cả chat bot topic
export const getAllChatBotTopics = async () => {
    try {
        const response = await apiClient.get('/api/chat-bot-topic');
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Xem chat bot topic bằng chat-bot-topic-id
export const getChatBotTopicById = async (id) => {
    try {
        const response = await apiClient.get(`/api/chat-bot-topic/${id}`);
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Xóa chat bot topic
export const deleteChatBotTopic = async (id) => {
    try {
        const response = await apiClient.delete(`/api/chat-bot-topic/${id}`);
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Copy topics từ model khác - API theo spec backend
export const copyTopicsFromModel = async (targetModelId, sourceModelId) => {
    try {
        const response = await apiClient.post(`/api/model-chat/${targetModelId}/chat-bot-topic`, {
            sourceModelId: sourceModelId
        });
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

// Copy tất cả topics từ model trước đó (không cần sourceModelId - backend tự tìm)
export const copyTopicsFromPreviousModel = async (targetModelId) => {
    try {
        const response = await apiClient.post(`/api/model-chat/${targetModelId}/chat-bot-topic`);
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};
