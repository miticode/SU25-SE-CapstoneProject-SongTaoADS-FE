import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllChatBotTopics,
    getChatBotTopicById,
    getChatBotTopicsByModelChat,
    getChatBotTopicsByTopic,
    addTopicToModelChat,
    addTopicFromModel,
    deleteChatBotTopic,
} from '../../../api/chatBotTopicService';

const initialState = {
    chatBotTopics: [],
    chatBotTopicsByModel: {},
    chatBotTopicsByTopic: {},
    currentChatBotTopic: null,
    loading: false,
    error: null,
    createLoading: false,
    deleteLoading: false,
    success: null,
};

// Lấy tất cả chat bot topics
export const fetchAllChatBotTopics = createAsyncThunk(
    'chatBotTopic/fetchAllChatBotTopics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllChatBotTopics();
            return response.result || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách chat bot topics');
        }
    }
);

// Lấy chat bot topic theo ID
export const fetchChatBotTopicById = createAsyncThunk(
    'chatBotTopic/fetchChatBotTopicById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await getChatBotTopicById(id);
            return response.result || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin chat bot topic');
        }
    }
);

// Lấy chat bot topics theo model chat
export const fetchChatBotTopicsByModelChat = createAsyncThunk(
    'chatBotTopic/fetchChatBotTopicsByModelChat',
    async (modelChatBotId, { rejectWithValue }) => {
        try {
            const response = await getChatBotTopicsByModelChat(modelChatBotId);
            return { modelChatBotId, data: response.result || response };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy chat bot topics theo model chat');
        }
    }
);

// Lấy chat bot topics theo topic
export const fetchChatBotTopicsByTopic = createAsyncThunk(
    'chatBotTopic/fetchChatBotTopicsByTopic',
    async (topicId, { rejectWithValue }) => {
        try {
            const response = await getChatBotTopicsByTopic(topicId);
            return { topicId, data: response.result || response };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy chat bot topics theo topic');
        }
    }
);

// Thêm topic vào model chat bot
export const addTopicToModelChatBot = createAsyncThunk(
    'chatBotTopic/addTopicToModelChatBot',
    async ({ modelChatBotId, topicId }, { rejectWithValue }) => {
        try {
            const response = await addTopicToModelChat(modelChatBotId, topicId);
            return response.result || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi thêm topic vào model chat bot');
        }
    }
);

// Thêm topic từ model trước đó
export const addTopicFromExistingModel = createAsyncThunk(
    'chatBotTopic/addTopicFromExistingModel',
    async ({ modelChatBotId, topicData }, { rejectWithValue }) => {
        try {
            const response = await addTopicFromModel(modelChatBotId, topicData);
            return response.result || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi thêm topic từ model trước đó');
        }
    }
);

// Xóa chat bot topic
export const deleteChatBotTopicById = createAsyncThunk(
    'chatBotTopic/deleteChatBotTopicById',
    async (id, { rejectWithValue }) => {
        try {
            await deleteChatBotTopic(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa chat bot topic');
        }
    }
);

const chatBotTopicSlice = createSlice({
    name: 'chatBotTopic',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        clearCurrentChatBotTopic: (state) => {
            state.currentChatBotTopic = null;
        },
        setCurrentChatBotTopic: (state, action) => {
            state.currentChatBotTopic = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchAllChatBotTopics
            .addCase(fetchAllChatBotTopics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllChatBotTopics.fulfilled, (state, action) => {
                state.loading = false;
                state.chatBotTopics = action.payload;
            })
            .addCase(fetchAllChatBotTopics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetchChatBotTopicById
            .addCase(fetchChatBotTopicById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChatBotTopicById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentChatBotTopic = action.payload;
            })
            .addCase(fetchChatBotTopicById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetchChatBotTopicsByModelChat
            .addCase(fetchChatBotTopicsByModelChat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChatBotTopicsByModelChat.fulfilled, (state, action) => {
                state.loading = false;
                state.chatBotTopicsByModel[action.payload.modelChatBotId] = action.payload.data;
            })
            .addCase(fetchChatBotTopicsByModelChat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetchChatBotTopicsByTopic
            .addCase(fetchChatBotTopicsByTopic.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChatBotTopicsByTopic.fulfilled, (state, action) => {
                state.loading = false;
                state.chatBotTopicsByTopic[action.payload.topicId] = action.payload.data;
            })
            .addCase(fetchChatBotTopicsByTopic.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // addTopicToModelChatBot
            .addCase(addTopicToModelChatBot.pending, (state) => {
                state.createLoading = true;
                state.error = null;
            })
            .addCase(addTopicToModelChatBot.fulfilled, (state, action) => {
                state.createLoading = false;
                state.success = 'Thêm topic vào model chat bot thành công';
                // Cập nhật danh sách
                if (!state.chatBotTopics.find(item => item.id === action.payload.id)) {
                    state.chatBotTopics.push(action.payload);
                }
            })
            .addCase(addTopicToModelChatBot.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload;
            })

            // addTopicFromExistingModel
            .addCase(addTopicFromExistingModel.pending, (state) => {
                state.createLoading = true;
                state.error = null;
            })
            .addCase(addTopicFromExistingModel.fulfilled, (state, action) => {
                state.createLoading = false;
                state.success = 'Thêm topic từ model trước đó thành công';
                // Cập nhật danh sách
                if (!state.chatBotTopics.find(item => item.id === action.payload.id)) {
                    state.chatBotTopics.push(action.payload);
                }
                // Cập nhật chatBotTopicsByModel nếu có modelChatBotId
                if (action.payload.modelChatBotId && state.chatBotTopicsByModel[action.payload.modelChatBotId]) {
                    if (!state.chatBotTopicsByModel[action.payload.modelChatBotId].find(item => item.id === action.payload.id)) {
                        state.chatBotTopicsByModel[action.payload.modelChatBotId].push(action.payload);
                    }
                }
            })
            .addCase(addTopicFromExistingModel.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload;
            })

            // deleteChatBotTopicById
            .addCase(deleteChatBotTopicById.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
            })
            .addCase(deleteChatBotTopicById.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.success = 'Xóa chat bot topic thành công';
                // Xóa khỏi danh sách
                state.chatBotTopics = state.chatBotTopics.filter(item => item.id !== action.payload);
                // Xóa khỏi các danh sách khác
                Object.keys(state.chatBotTopicsByModel).forEach(key => {
                    state.chatBotTopicsByModel[key] = state.chatBotTopicsByModel[key].filter(item => item.id !== action.payload);
                });
                Object.keys(state.chatBotTopicsByTopic).forEach(key => {
                    state.chatBotTopicsByTopic[key] = state.chatBotTopicsByTopic[key].filter(item => item.id !== action.payload);
                });
            })
            .addCase(deleteChatBotTopicById.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearSuccess,
    clearCurrentChatBotTopic,
    setCurrentChatBotTopic,
} = chatBotTopicSlice.actions;

// Selectors
export const selectAllChatBotTopics = (state) => state.chatBotTopic.chatBotTopics;
export const selectChatBotTopicsByModel = (state) => state.chatBotTopic.chatBotTopicsByModel;
export const selectChatBotTopicsByTopic = (state) => state.chatBotTopic.chatBotTopicsByTopic;
export const selectCurrentChatBotTopic = (state) => state.chatBotTopic.currentChatBotTopic;
export const selectChatBotTopicLoading = (state) => state.chatBotTopic.loading;
export const selectChatBotTopicCreateLoading = (state) => state.chatBotTopic.createLoading;
export const selectChatBotTopicDeleteLoading = (state) => state.chatBotTopic.deleteLoading;
export const selectChatBotTopicError = (state) => state.chatBotTopic.error;
export const selectChatBotTopicSuccess = (state) => state.chatBotTopic.success;

export default chatBotTopicSlice.reducer;
