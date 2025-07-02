import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendChatMessageApi, uploadFileFineTuneApi, fineTuneModelApi, cancelFineTuneJobApi, deleteFineTuneFileApi, getFineTuneJobsApi, getFineTuneFilesApi, getFineTuneFileDetailApi, selectModelForChatApi, uploadFileExcelApi, getFineTuneJobDetailApi, testChatApi, getOpenAiModelsApi, getFineTunedModelsApi } from '../../../api/chatService';

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
  fineTuneJobs: [],
  fineTuneJobsStatus: 'idle',
  fineTuneFiles: [],
  fineTuneFilesStatus: 'idle',
  fineTuneFileDetail: null,
  fineTuneFileDetailStatus: 'idle',
  openAiModels: [],
  openAiModelsStatus: 'idle',
  fineTunedModels: [],
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

// Lấy danh sách job fine-tune
export const fetchFineTuneJobs = createAsyncThunk(
  'chat/fetchFineTuneJobs',
  async (_, { rejectWithValue }) => {
    const response = await getFineTuneJobsApi();
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Lấy danh sách file
export const fetchFineTuneFiles = createAsyncThunk(
  'chat/fetchFineTuneFiles',
  async (_, { rejectWithValue }) => {
    const response = await getFineTuneFilesApi();
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Lấy chi tiết file
export const fetchFineTuneFileDetail = createAsyncThunk(
  'chat/fetchFineTuneFileDetail',
  async (fileId, { rejectWithValue }) => {
    const response = await getFineTuneFileDetailApi(fileId);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Chọn model để chat từ list job
export const selectModelForChat = createAsyncThunk(
  'chat/selectModelForChat',
  async (fineTuningJobId, { rejectWithValue }) => {
    const response = await selectModelForChatApi(fineTuningJobId);
    if (!response.success) return rejectWithValue(response.error || 'Lỗi khi chọn model');
    return response.result;
  }
);

// Upload file excel để convert thành file jsonl
export const uploadFileExcel = createAsyncThunk(
  'chat/uploadFileExcel',
  async ({ file, fileName }, { rejectWithValue }) => {
    const response = await uploadFileExcelApi(file, fileName);
    if (!response.success) return rejectWithValue(response.error || 'Lỗi khi upload file excel');
    return response.result;
  }
);

// Lấy chi tiết job đã fine-tune
export const fetchFineTuneJobDetail = createAsyncThunk(
  'chat/fetchFineTuneJobDetail',
  async (fineTuneJobId, { rejectWithValue }) => {
    const response = await getFineTuneJobDetailApi(fineTuneJobId);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Test chat với model dành cho staff
export const testChat = createAsyncThunk(
  'chat/testChat',
  async (data, { rejectWithValue }) => {
    const response = await testChatApi(data);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Lấy danh sách tất cả các model OpenAI
export const fetchOpenAiModels = createAsyncThunk(
  'chat/fetchOpenAiModels',
  async (_, { rejectWithValue }) => {
    const response = await getOpenAiModelsApi();
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Lấy danh sách tất cả các model đã fine-tune
export const fetchFineTunedModels = createAsyncThunk(
  'chat/fetchFineTunedModels',
  async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
    const response = await getFineTunedModelsApi(page, size);
    if (!response.success) return rejectWithValue(response.error);
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
      })
      // Lấy danh sách job fine-tune
      .addCase(fetchFineTuneJobs.pending, (state) => {
        state.fineTuneJobsStatus = 'loading';
      })
      .addCase(fetchFineTuneJobs.fulfilled, (state, action) => {
        state.fineTuneJobsStatus = 'succeeded';
        state.fineTuneJobs = action.payload;
      })
      .addCase(fetchFineTuneJobs.rejected, (state, action) => {
        state.fineTuneJobsStatus = 'failed';
        state.error = action.payload;
      })
      // Lấy danh sách file
      .addCase(fetchFineTuneFiles.pending, (state) => {
        state.fineTuneFilesStatus = 'loading';
      })
      .addCase(fetchFineTuneFiles.fulfilled, (state, action) => {
        state.fineTuneFilesStatus = 'succeeded';
        state.fineTuneFiles = action.payload;
      })
      .addCase(fetchFineTuneFiles.rejected, (state, action) => {
        state.fineTuneFilesStatus = 'failed';
        state.error = action.payload;
      })
      // Lấy chi tiết file
      .addCase(fetchFineTuneFileDetail.pending, (state) => {
        state.fineTuneFileDetailStatus = 'loading';
      })
      .addCase(fetchFineTuneFileDetail.fulfilled, (state, action) => {
        state.fineTuneFileDetailStatus = 'succeeded';
        state.fineTuneFileDetail = action.payload;
      })
      .addCase(fetchFineTuneFileDetail.rejected, (state, action) => {
        state.fineTuneFileDetailStatus = 'failed';
        state.error = action.payload;
      })
      // Chọn model để chat từ list job
      .addCase(selectModelForChat.pending, (state) => {
        state.fineTuneStatus = 'loading';
      })
      .addCase(selectModelForChat.fulfilled, (state, action) => {
        state.fineTuneStatus = 'succeeded';
        state.fineTuningJobId = action.payload.id;
        state.error = null;
      })
      .addCase(selectModelForChat.rejected, (state, action) => {
        state.fineTuneStatus = 'failed';
        state.error = action.payload;
      })
      // Upload file excel để convert thành file jsonl
      .addCase(uploadFileExcel.pending, (state) => {
        state.fineTuneStatus = 'loading';
      })
      .addCase(uploadFileExcel.fulfilled, (state, action) => {
        state.fineTuneStatus = 'succeeded';
        state.uploadedFile = action.payload;
        state.error = null;
      })
      .addCase(uploadFileExcel.rejected, (state, action) => {
        state.fineTuneStatus = 'failed';
        state.error = action.payload;
      })
      // Lấy chi tiết job đã fine-tune
      .addCase(fetchFineTuneJobDetail.pending, (state) => {
        state.fineTuneFileDetailStatus = 'loading';
      })
      .addCase(fetchFineTuneJobDetail.fulfilled, (state, action) => {
        state.fineTuneFileDetailStatus = 'succeeded';
        state.fineTuneFileDetail = action.payload;
      })
      .addCase(fetchFineTuneJobDetail.rejected, (state, action) => {
        state.fineTuneFileDetailStatus = 'failed';
        state.error = action.payload;
      })
      // Lấy danh sách tất cả các model OpenAI
      .addCase(fetchOpenAiModels.pending, (state) => {
        state.openAiModelsStatus = 'loading';
      })
      .addCase(fetchOpenAiModels.fulfilled, (state, action) => {
        state.openAiModelsStatus = 'succeeded';
        // Lấy đúng danh sách model từ payload.data
        if (
          action.payload &&
          Array.isArray(action.payload.data)
        ) {
          state.openAiModels = action.payload.data;
        } else {
          state.openAiModels = [];
        }
      })
      .addCase(fetchOpenAiModels.rejected, (state, action) => {
        state.openAiModelsStatus = 'failed';
        state.error = action.payload;
      })
      // Lấy danh sách tất cả các model đã fine-tune
      .addCase(fetchFineTunedModels.fulfilled, (state, action) => {
        // Lưu đúng mảng model đã fine-tune từ result
        state.fineTunedModels = Array.isArray(action.payload) ? action.payload : Array.isArray(action.payload.result) ? action.payload.result : [];
      })
      .addCase(fetchFineTunedModels.rejected, (state, action) => {
        state.fineTunedModelsStatus = 'failed';
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
export const selectFineTuneJobs = (state) => state.chat.fineTuneJobs;
export const selectFineTuneJobsStatus = (state) => state.chat.fineTuneJobsStatus;
export const selectFineTuneFiles = (state) => state.chat.fineTuneFiles;
export const selectFineTuneFilesStatus = (state) => state.chat.fineTuneFilesStatus;
export const selectFineTuneFileDetail = (state) => state.chat.fineTuneFileDetail;
export const selectFineTuneFileDetailStatus = (state) => state.chat.fineTuneFileDetailStatus;
export const selectOpenAiModels = (state) => state.chat.openAiModels;
export const selectOpenAiModelsStatus = (state) => state.chat.openAiModelsStatus;
export const selectFineTunedModels = (state) => state.chat.fineTunedModels;
export const selectSucceededFineTuneJobs = (state) =>
  (state.chat.fineTuneJobs || []).filter(job => job.status === 'succeeded');

export default chatSlice.reducer;
