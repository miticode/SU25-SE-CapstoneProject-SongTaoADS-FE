import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
} from '../../../api/topicService';



const initialState = {
    topics: [],
    currentTopic: null,
    loading: false,
    error: null,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    success: null,
};


export const fetchAllTopics = createAsyncThunk(
    'topic/fetchAllTopics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllTopics();
            return response.result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách topics');
        }
    }
);

export const fetchTopicById = createAsyncThunk(
    'topic/fetchTopicById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await getTopicById(id);
            return response.result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin topic');
        }
    }
);

export const createNewTopic = createAsyncThunk(
    'topic/createNewTopic',
    async (topicData, { rejectWithValue }) => {
        try {
            const response = await createTopic(topicData);
            return response.result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo topic');
        }
    }
);

export const updateExistingTopic = createAsyncThunk(
    'topic/updateExistingTopic',
    async ({ id, topicData }, { rejectWithValue }) => {
        try {
            const response = await updateTopic(id, topicData);
            return response.result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật topic');
        }
    }
);

export const deleteExistingTopic = createAsyncThunk(
    'topic/deleteExistingTopic',
    async (id, { rejectWithValue }) => {
        try {
            await deleteTopic(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa topic');
        }
    }
);

const topicSlice = createSlice({
    name: 'topic',
    initialState,
    reducers: {

        clearError: (state) => {
            state.error = null;
        },

        clearSuccess: (state) => {
            state.success = null;
        },

        clearCurrentTopic: (state) => {
            state.currentTopic = null;
        },

        resetLoadingStates: (state) => {
            state.loading = false;
            state.createLoading = false;
            state.updateLoading = false;
            state.deleteLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllTopics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTopics.fulfilled, (state, action) => {
                state.loading = false;
                state.topics = action.payload;
                state.error = null;
            })
            .addCase(fetchAllTopics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch topic by ID
            .addCase(fetchTopicById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopicById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTopic = action.payload;
                state.error = null;
            })
            .addCase(fetchTopicById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create topic
            .addCase(createNewTopic.pending, (state) => {
                state.createLoading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(createNewTopic.fulfilled, (state, action) => {
                state.createLoading = false;
                state.topics.push(action.payload);
                state.success = 'Tạo topic thành công';
                state.error = null;
            })
            .addCase(createNewTopic.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload;
            })

            // Update topic
            .addCase(updateExistingTopic.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(updateExistingTopic.fulfilled, (state, action) => {
                state.updateLoading = false;
                const index = state.topics.findIndex(topic => topic.id === action.payload.id);
                if (index !== -1) {
                    state.topics[index] = action.payload;
                }
                if (state.currentTopic && state.currentTopic.id === action.payload.id) {
                    state.currentTopic = action.payload;
                }
                state.success = 'Cập nhật topic thành công';
                state.error = null;
            })
            .addCase(updateExistingTopic.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })

            // Delete topic
            .addCase(deleteExistingTopic.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(deleteExistingTopic.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.topics = state.topics.filter(topic => topic.id !== action.payload);
                if (state.currentTopic && state.currentTopic.id === action.payload) {
                    state.currentTopic = null;
                }
                state.success = 'Xóa topic thành công';
                state.error = null;
            })
            .addCase(deleteExistingTopic.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            });
    },
});

// Export actions
export const {
    clearError,
    clearSuccess,
    clearCurrentTopic,
    resetLoadingStates,
} = topicSlice.actions;

// Export selectors
export const selectAllTopics = (state) => state.topic.topics;
export const selectCurrentTopic = (state) => state.topic.currentTopic;
export const selectTopicLoading = (state) => state.topic.loading;
export const selectTopicError = (state) => state.topic.error;
export const selectTopicSuccess = (state) => state.topic.success;
export const selectCreateLoading = (state) => state.topic.createLoading;
export const selectUpdateLoading = (state) => state.topic.updateLoading;
export const selectDeleteLoading = (state) => state.topic.deleteLoading;

// Export reducer
export default topicSlice.reducer;
