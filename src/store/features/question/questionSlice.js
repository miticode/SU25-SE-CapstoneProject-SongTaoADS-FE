import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllQuestions,
    getQuestionById,
    getQuestionsByTopic,
    createQuestionByTopic,
    updateQuestion,
    deleteQuestion,
} from '../../../api/questionService';

/**
 * Question Slice - Quản lý state cho question
 */

const initialState = {
    questions: [], // Danh sách tất cả questions
    questionsByTopic: [], // Danh sách questions theo topic
    currentQuestion: null, // Question hiện tại đang xem/editing
    loading: false, // Loading state chung
    error: null, // Error state chung
    createLoading: false, // Loading state cho create
    updateLoading: false, // Loading state cho update
    deleteLoading: false, // Loading state cho delete
    success: null, // Success message
};

// Lấy tất cả questions
export const fetchAllQuestions = createAsyncThunk(
    'question/fetchAllQuestions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllQuestions();
            return response.result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách questions');
        }
    }
);

// Lấy question theo ID
export const fetchQuestionById = createAsyncThunk(
    'question/fetchQuestionById',
    async (questionId, { rejectWithValue }) => {
        try {
            const response = await getQuestionById(questionId);
            return response.result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin question');
        }
    }
);

// Lấy questions theo topic
export const fetchQuestionsByTopic = createAsyncThunk(
    'question/fetchQuestionsByTopic',
    async (topicId, { rejectWithValue }) => {
        try {
            const response = await getQuestionsByTopic(topicId);
            return { topicId, questions: response.result };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy questions theo topic');
        }
    }
);

// Tạo question mới theo topic
export const createNewQuestionByTopic = createAsyncThunk(
    'question/createNewQuestionByTopic',
    async ({ topicId, questionData }, { rejectWithValue }) => {
        try {
            const response = await createQuestionByTopic(topicId, questionData);
            return response.result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo question');
        }
    }
);

// Cập nhật question
export const updateExistingQuestion = createAsyncThunk(
    'question/updateExistingQuestion',
    async ({ questionId, questionData }, { rejectWithValue }) => {
        try {
            const response = await updateQuestion(questionId, questionData);
            return response.result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật question');
        }
    }
);

// Xóa question
export const deleteExistingQuestion = createAsyncThunk(
    'question/deleteExistingQuestion',
    async (questionId, { rejectWithValue }) => {
        try {
            await deleteQuestion(questionId);
            return questionId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa question');
        }
    }
);

const questionSlice = createSlice({
    name: 'question',
    initialState,
    reducers: {
        // Xóa error state
        clearError: (state) => {
            state.error = null;
        },

        // Xóa success message
        clearSuccess: (state) => {
            state.success = null;
        },

        // Xóa current question
        clearCurrentQuestion: (state) => {
            state.currentQuestion = null;
        },

        // Reset loading states
        resetLoadingStates: (state) => {
            state.loading = false;
            state.createLoading = false;
            state.updateLoading = false;
            state.deleteLoading = false;
        },

        // Xóa questions theo topic
        clearQuestionsByTopic: (state) => {
            state.questionsByTopic = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all questions
            .addCase(fetchAllQuestions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllQuestions.fulfilled, (state, action) => {
                state.loading = false;
                state.questions = action.payload;
                state.error = null;
            })
            .addCase(fetchAllQuestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch question by ID
            .addCase(fetchQuestionById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuestionById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentQuestion = action.payload;
                state.error = null;
            })
            .addCase(fetchQuestionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch questions by topic
            .addCase(fetchQuestionsByTopic.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuestionsByTopic.fulfilled, (state, action) => {
                state.loading = false;
                state.questionsByTopic = action.payload.questions;
                state.error = null;
            })
            .addCase(fetchQuestionsByTopic.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create question
            .addCase(createNewQuestionByTopic.pending, (state) => {
                state.createLoading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(createNewQuestionByTopic.fulfilled, (state, action) => {
                state.createLoading = false;
                state.questions.push(action.payload);
                state.questionsByTopic.push(action.payload);
                state.success = 'Tạo question thành công';
                state.error = null;
            })
            .addCase(createNewQuestionByTopic.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload;
            })

            // Update question
            .addCase(updateExistingQuestion.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(updateExistingQuestion.fulfilled, (state, action) => {
                state.updateLoading = false;
                // Cập nhật trong questions
                const index = state.questions.findIndex(q => q.id === action.payload.id);
                if (index !== -1) {
                    state.questions[index] = action.payload;
                }
                // Cập nhật trong questionsByTopic
                const topicIndex = state.questionsByTopic.findIndex(q => q.id === action.payload.id);
                if (topicIndex !== -1) {
                    state.questionsByTopic[topicIndex] = action.payload;
                }
                // Cập nhật currentQuestion
                if (state.currentQuestion && state.currentQuestion.id === action.payload.id) {
                    state.currentQuestion = action.payload;
                }
                state.success = 'Cập nhật question thành công';
                state.error = null;
            })
            .addCase(updateExistingQuestion.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })

            // Delete question
            .addCase(deleteExistingQuestion.pending, (state) => {
                state.deleteLoading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(deleteExistingQuestion.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.questions = state.questions.filter(q => q.id !== action.payload);
                state.questionsByTopic = state.questionsByTopic.filter(q => q.id !== action.payload);
                if (state.currentQuestion && state.currentQuestion.id === action.payload) {
                    state.currentQuestion = null;
                }
                state.success = 'Xóa question thành công';
                state.error = null;
            })
            .addCase(deleteExistingQuestion.rejected, (state, action) => {
                state.deleteLoading = false;
                state.error = action.payload;
            });
    },
});

// Export actions
export const {
    clearError,
    clearSuccess,
    clearCurrentQuestion,
    resetLoadingStates,
    clearQuestionsByTopic,
} = questionSlice.actions;

// Export selectors
export const selectAllQuestions = (state) => state.question.questions;
export const selectQuestionsByTopic = (state) => state.question.questionsByTopic;
export const selectCurrentQuestion = (state) => state.question.currentQuestion;
export const selectQuestionLoading = (state) => state.question.loading;
export const selectQuestionError = (state) => state.question.error;
export const selectQuestionSuccess = (state) => state.question.success;
export const selectCreateLoading = (state) => state.question.createLoading;
export const selectUpdateLoading = (state) => state.question.updateLoading;
export const selectDeleteLoading = (state) => state.question.deleteLoading;

// Export reducer
export default questionSlice.reducer;
