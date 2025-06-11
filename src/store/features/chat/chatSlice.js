import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendChatMessageApi, uploadFileFineTuneApi, fineTuneModelApi, cancelFineTuneJobApi, deleteFineTuneFileApi } from '../../../api/chatService';

const initialState = {
  messages: [
    {
      from: 'bot',
      text: 'Xin chào quý khách! Song Tạo có thể giúp gì cho bạn?',
    },
  ],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  fineTuneStatus: 'idle',
  uploadedFile: null,
  trainingStatus: 'idle',
  fineTuningJobId: null,
};

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async (prompt, { rejectWithValue }) => {
    const response = await sendChatMessageApi(prompt);
    if (!response.success) return rejectWithValue(response.error || 'Failed to send chat message');
    return response.result;
  }
);

export const uploadFileFineTune = createAsyncThunk(
  'chat/uploadFileFineTune',
  async (file, { rejectWithValue }) => {
    const response = await uploadFileFineTuneApi(file);
    if (!response.success) return rejectWithValue(response.error || 'Lỗi khi upload file');
    return response.result;
  }
);

export const fineTuneModel = createAsyncThunk(
  'chat/fineTuneModel',
  async ({ model, trainingFile }, { rejectWithValue }) => {
    const response = await fineTuneModelApi(model, trainingFile);
    if (!response.success) return rejectWithValue(response.error || 'Lỗi khi fine-tune model');
    return response.result;
  }
);

export const cancelFineTuneJob = createAsyncThunk(
  'chat/cancelFineTuneJob',
  async (fineTuningJobId, { rejectWithValue }) => {
    const response = await cancelFineTuneJobApi(fineTuningJobId);
    if (!response.success) return rejectWithValue(response.error || 'Lỗi khi huỷ training');
    return response.result;
  }
);

export const deleteFineTuneFile = createAsyncThunk(
  'chat/deleteFineTuneFile',
  async (fileId, { rejectWithValue }) => {
    const response = await deleteFineTuneFileApi(fileId);
    if (!response.success) return rejectWithValue(response.error || 'Lỗi khi xóa file');
    return response.result;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ from: 'user', text: action.payload });
    },
    resetChat: (state) => {
      state.messages = [
        {
          from: 'bot',
          text: 'Xin chào quý khách! Song Tạo có thể giúp gì cho bạn?',
        },
      ];
      state.status = 'idle';
      state.error = null;
    },
    loadMessagesFromStorage: (state, action) => {
      state.messages = action.payload;
    },
    resetFineTuneStatus: (state) => {
      state.fineTuneStatus = 'idle';
      state.trainingStatus = 'idle';
      state.uploadedFile = null;
      state.fineTuningJobId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Chat message reducers
      .addCase(sendChatMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages.push({ from: 'bot', text: action.payload });
        state.error = null;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.messages.push({ from: 'bot', text: 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.' });
        state.error = action.payload;
      })
      // Upload file reducers
      .addCase(uploadFileFineTune.pending, (state) => {
        state.fineTuneStatus = 'loading';
      })
      .addCase(uploadFileFineTune.fulfilled, (state, action) => {
        state.fineTuneStatus = 'succeeded';
        state.uploadedFile = action.payload;
        state.error = null;
      })
      .addCase(uploadFileFineTune.rejected, (state, action) => {
        state.fineTuneStatus = 'failed';
        state.error = action.payload;
      })
      // Fine-tune model reducers
      .addCase(fineTuneModel.pending, (state) => {
        state.trainingStatus = 'loading';
      })
      .addCase(fineTuneModel.fulfilled, (state, action) => {
        state.trainingStatus = 'loading';
        state.fineTuningJobId = action.payload.id;
        state.error = null;
      })
      .addCase(fineTuneModel.rejected, (state, action) => {
        state.trainingStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(cancelFineTuneJob.pending, (state) => {
        state.trainingStatus = 'loading';
      })
      .addCase(cancelFineTuneJob.fulfilled, (state) => {
        state.trainingStatus = 'cancelled';
        state.fineTuningJobId = null;
      })
      .addCase(cancelFineTuneJob.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteFineTuneFile.pending, (state) => {
        state.fineTuneStatus = 'loading';
      })
      .addCase(deleteFineTuneFile.fulfilled, (state) => {
        state.fineTuneStatus = 'idle';
        state.uploadedFile = null;
      })
      .addCase(deleteFineTuneFile.rejected, (state, action) => {
        state.fineTuneStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  addUserMessage, 
  resetChat, 
  loadMessagesFromStorage,
  resetFineTuneStatus 
} = chatSlice.actions;

export const selectChatMessages = (state) => state.chat.messages;
export const selectChatStatus = (state) => state.chat.status;
export const selectChatError = (state) => state.chat.error;
export const selectFineTuneStatus = (state) => state.chat.fineTuneStatus;
export const selectTrainingStatus = (state) => state.chat.trainingStatus;
export const selectUploadedFile = (state) => state.chat.uploadedFile;
export const selectFineTuningJobId = (state) => state.chat.fineTuningJobId;

export default chatSlice.reducer;
