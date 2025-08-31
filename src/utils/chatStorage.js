// Utility functions để quản lý chat messages trong localStorage

const CHAT_MESSAGES_KEY = "ai_chatbot_messages";

/**
 * Lưu chat messages vào localStorage
 * @param {Array} messages - Mảng messages cần lưu
 * @param {boolean} isAuthenticated - Trạng thái đăng nhập
 */
export const saveChatMessages = (messages, isAuthenticated = false) => {
    try {
        // Chỉ lưu khi đã đăng nhập
        if (isAuthenticated && messages) {
            localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
            console.log("Chat messages saved to localStorage");
        }
    } catch (error) {
        console.error("Error saving chat messages:", error);
    }
};

/**
 * Lấy chat messages từ localStorage
 * @returns {Array} Mảng messages hoặc mảng rỗng
 */
export const getChatMessages = () => {
    try {
        const messages = localStorage.getItem(CHAT_MESSAGES_KEY);
        if (messages) {
            return JSON.parse(messages);
        }
        return [];
    } catch (error) {
        console.error("Error getting chat messages:", error);
        return [];
    }
};

/**
 * Xóa chat messages khỏi localStorage
 */
export const clearChatMessages = () => {
    try {
        // Xóa key chính
        localStorage.removeItem(CHAT_MESSAGES_KEY);

        // Xóa tất cả các key có pattern ai_chatbot_messages_* (để đảm bảo xóa sạch)
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('ai_chatbot_messages_')) {
                keysToRemove.push(key);
            }
        }

        // Xóa tất cả các key tìm được
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`Removed chat messages key: ${key}`);
        });

        console.log("All chat messages cleared from localStorage");
    } catch (error) {
        console.error("Error clearing chat messages:", error);
    }
};

/**
 * Kiểm tra xem có chat messages trong localStorage không
 * @returns {boolean}
 */
export const hasChatMessages = () => {
    try {
        // Kiểm tra key chính trước
        if (localStorage.getItem(CHAT_MESSAGES_KEY)) {
            return true;
        }

        // Kiểm tra các key có pattern ai_chatbot_messages_*
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('ai_chatbot_messages_')) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error("Error checking chat messages:", error);
        return false;
    }
};

/**
 * Xóa chat messages khi logout hoặc đăng nhập mới
 * Được gọi từ auth service
 */
export const clearChatMessagesOnAuthChange = () => {
    clearChatMessages();
};

/**
 * Debug function để xem tất cả các key liên quan đến chat messages
 * @returns {Array} Danh sách các key tìm được
 */
export const debugChatMessageKeys = () => {
    const chatKeys = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key === CHAT_MESSAGES_KEY || key.startsWith('ai_chatbot_messages_'))) {
                chatKeys.push(key);
            }
        }
        console.log('Chat message keys found:', chatKeys);
        return chatKeys;
    } catch (error) {
        console.error("Error debugging chat message keys:", error);
        return [];
    }
};

/**
 * Xóa tất cả chat messages khi khởi động ứng dụng
 * Được gọi từ App.jsx hoặc main.jsx để đảm bảo không có dữ liệu cũ
 */
export const clearAllChatMessagesOnAppStart = () => {
    try {
        console.log('Clearing all chat messages on app start...');
        clearChatMessages();
        console.log('All chat messages cleared successfully');
    } catch (error) {
        console.error("Error clearing chat messages on app start:", error);
    }
};
