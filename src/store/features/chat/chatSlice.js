import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendChatMessageApi, uploadFileFineTuneApi, fineTuneModelApi, cancelFineTuneJobApi, deleteFineTuneFileApi, getFineTuneJobsApi, getFineTuneFilesApi, getFineTuneFileDetailApi, getFineTuneJobDetailApi, getFrequentQuestionsApi, getTraditionalPricingApi, getModernPricingApi, selectModelForModelChatApi, uploadFileExcelModelChatApi, getFineTunedModelsModelChatApi, testChatApi, requestTraditionalPricingApi, getOpenAiModelsApi, getFineTuneFileContentApi, trackOrderApi } from '../../../api/chatService';
import { getChatBotTopicsByModelChat, addTopicToModelChat } from '../../../api/chatBotTopicService';

const initialState = {
  messages: [
    {
      from: 'bot',
      text: 'Xin chào quý khách! Song Tạo có thể giúp gì cho bạn?',
      thread: 'basic',
    },
  ],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  fineTuneStatus: 'idle',
  uploadedFile: null,
  trainingStatus: 'idle',
  fineTuningJobId: null,
  currentJobStatus: null, // Trạng thái thực tế của job từ backend
  fineTuneJobs: [],
  fineTuneJobsStatus: 'idle',
  fineTuneFiles: [],
  fineTuneFilesStatus: 'idle',
  fineTuneFileDetail: null,
  fineTuneFileDetailStatus: 'idle',
  openAiModels: [],
  openAiModelsStatus: 'idle',
  fineTunedModels: [],
  frequentQuestions: [],
  frequentQuestionsStatus: 'idle',
  traditionalPricingResult: null,
  traditionalPricingStatus: 'idle',
  modernPricingResult: null,
  modernPricingStatus: 'idle',
  modelChatSelectedModel: null,
  modelChatSelectedModelStatus: 'idle',
  modelChatUploadedFile: null,
  modelChatUploadedFileStatus: 'idle',
  modelChatFineTunedModels: [],
  modelChatFineTunedModelsStatus: 'idle',
  fineTuneFileContent: null,
  fineTuneFileContentStatus: 'idle',
  trackingOrderStatus: 'idle',
  trackingOrderResult: null,
  lastTrackedOrderCode: null,
  currentThread: 'basic',
  // Model management states
  managementFineTunedModels: [],
  managementFineTunedModelsStatus: 'idle',
  managementFineTunedModelsPagination: null,
  selectedModelChatBotTopics: [],
  selectedModelChatBotTopicsStatus: 'idle',
  selectedModelForTopics: null,
};

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async (prompt, { rejectWithValue }) => {
    const response = await sendChatMessageApi(prompt);
    if (!response.success) return rejectWithValue(response.error || 'Failed to send chat message');
    return response.result;
  }
);
// Theo dõi đơn hàng (tracking order)
export const trackOrder = createAsyncThunk(
  'chat/trackOrder',
  async (prompt, { rejectWithValue }) => {
    const response = await trackOrderApi(prompt);
    if (!response.success) return rejectWithValue(response.error || 'Lỗi khi theo dõi đơn hàng');
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
    try {
      const response = await cancelFineTuneJobApi(fineTuningJobId);
      if (!response.success) return rejectWithValue(response.error || 'Lỗi khi huỷ training');
      return response.result;
    } catch (error) {
      console.error('Error in cancelFineTuneJob thunk:', error);
      throw error;
    }
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

// Lấy chi tiết job đã fine-tune
export const fetchFineTuneJobDetail = createAsyncThunk(
  'chat/fetchFineTuneJobDetail',
  async (fineTuneJobId, { rejectWithValue }) => {
    const response = await getFineTuneJobDetailApi(fineTuneJobId);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Lấy nội dung file
export const fetchFineTuneFileContent = createAsyncThunk(
  'chat/fetchFineTuneFileContent',
  async (fileId, { rejectWithValue }) => {
    const response = await getFineTuneFileContentApi(fileId);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Lấy top 10 câu hỏi được hỏi nhiều nhất
export const fetchFrequentQuestions = createAsyncThunk(
  'chat/fetchFrequentQuestions',
  async (_, { rejectWithValue }) => {
    const response = await getFrequentQuestionsApi();
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Báo giá bảng quảng cáo truyền thống bằng chatbot
export const getTraditionalPricing = createAsyncThunk(
  'chat/getTraditionalPricing',
  async (data, { rejectWithValue }) => {
    const response = await getTraditionalPricingApi(data);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Báo giá bảng quảng cáo hiện đại bằng chatbot
export const getModernPricing = createAsyncThunk(
  'chat/getModernPricing',
  async (data, { rejectWithValue }) => {
    const response = await getModernPricingApi(data);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Chọn model để chat từ list model (model-chat)
export const selectModelForModelChat = createAsyncThunk(
  'chat/selectModelForModelChat',
  async (modelChatId, { rejectWithValue }) => {
    const response = await selectModelForModelChatApi(modelChatId);
    if (!response.success) return rejectWithValue(response.error || 'Lỗi khi chọn model');
    return response.result;
  }
);

// Upload file excel để convert thành file jsonl (model-chat)
export const uploadFileExcelModelChat = createAsyncThunk(
  'chat/uploadFileExcelModelChat',
  async ({ file, fileName }, { rejectWithValue }) => {
    const response = await uploadFileExcelModelChatApi(file, fileName);
    if (!response.success) return rejectWithValue(response.error || 'Lỗi khi upload file excel');
    return response.result;
  }
);

// Lấy danh sách tất cả các model đã fine-tune (model-chat, có phân trang)
export const fetchFineTunedModelsModelChat = createAsyncThunk(
  'chat/fetchFineTunedModelsModelChat',
  async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
    const response = await getFineTunedModelsModelChatApi(page, size);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

export const testChat = createAsyncThunk(
  'chat/testChat',
  async (data, { rejectWithValue }) => {
    const response = await testChatApi(data);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Fetch fine-tuned models for management (tab 5)
export const fetchManagementFineTunedModels = createAsyncThunk(
  'chat/fetchManagementFineTunedModels',
  async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
    const response = await getFineTunedModelsModelChatApi(page, size);
    if (!response.success) return rejectWithValue(response.error);
    return response;
  }
);

// Fetch chat bot topics by model chat bot id
export const fetchChatBotTopicsByModelId = createAsyncThunk(
  'chat/fetchChatBotTopicsByModelId',
  async (modelChatBotId, { rejectWithValue }) => {
    const response = await getChatBotTopicsByModelChat(modelChatBotId);
    if (!response.success) return rejectWithValue(response.message || 'Failed to fetch chat bot topics');
    return { modelChatBotId, topics: response.result };
  }
);

// Add topic to model chat bot
export const assignTopicToModelChat = createAsyncThunk(
  'chat/assignTopicToModelChat',
  async ({ modelChatBotId, topicId }, { rejectWithValue }) => {
    try {
      const response = await addTopicToModelChat(modelChatBotId, topicId);
      if (!response.success) return rejectWithValue(response.message || 'Failed to assign topic to model');
      return { modelChatBotId, topicId, result: response.result };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to assign topic to model');
    }
  }
);

export const requestTraditionalPricing = createAsyncThunk(
  'chat/requestTraditionalPricing',
  async (data, { rejectWithValue }) => {
    const response = await requestTraditionalPricingApi(data);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

export const fetchOpenAiModels = createAsyncThunk(
  'chat/fetchOpenAiModels',
  async (_, { rejectWithValue }) => {
    const response = await getOpenAiModelsApi();
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

// Kiểm tra trạng thái của job fine-tune đang chạy
export const checkFineTuneJobStatus = createAsyncThunk(
  'chat/checkFineTuneJobStatus',
  async (fineTuningJobId, { rejectWithValue }) => {
    const response = await getFineTuneJobDetailApi(fineTuningJobId);
    if (!response.success) return rejectWithValue(response.error);
    return response.result;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      const payload = action.payload;
      const isString = typeof payload === 'string';
      const text = isString ? payload : payload?.text;
      const thread = isString ? state.currentThread || 'basic' : (payload?.thread || state.currentThread || 'basic');
      if (text) {
        state.messages.push({ from: 'user', text, thread });
      }
    },
    addBotMessage: (state, action) => {
      const payload = action.payload;
      const isString = typeof payload === 'string';
      const text = isString ? payload : payload?.text;
      const thread = isString ? state.currentThread || 'basic' : (payload?.thread || state.currentThread || 'basic');
      if (text) {
        state.messages.push({ from: 'bot', text, thread });
      }
    },
    setCurrentThread: (state, action) => {
      state.currentThread = action.payload === 'advanced' ? 'advanced' : 'basic';
    },
    setLastTrackedOrderCode: (state, action) => {
      state.lastTrackedOrderCode = action.payload || null;
    },
    resetChat: (state) => {
      state.messages = [
        {
          from: 'bot',
          text: 'Xin chào quý khách! Song Tạo có thể giúp gì cho bạn?',
          thread: 'basic',
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
      state.modelChatUploadedFile = null; // Also clear Excel file state
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
        state.messages.push({ from: 'bot', text: action.payload, thread: state.currentThread || 'basic' });
        state.error = null;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.messages.push({ from: 'bot', text: 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.', thread: state.currentThread || 'basic' });
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
        state.currentJobStatus = action.payload.status || 'pending';
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
        state.currentJobStatus = 'cancelled';
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
        state.modelChatUploadedFile = null; // Also clear Excel file state
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
      // Lấy nội dung file
      .addCase(fetchFineTuneFileContent.pending, (state) => {
        state.fineTuneFileContentStatus = 'loading';
      })
      .addCase(fetchFineTuneFileContent.fulfilled, (state, action) => {
        state.fineTuneFileContentStatus = 'succeeded';
        state.fineTuneFileContent = action.payload;
      })
      .addCase(fetchFineTuneFileContent.rejected, (state, action) => {
        state.fineTuneFileContentStatus = 'failed';
        state.error = action.payload;
      })
      // Lấy top 10 câu hỏi được hỏi nhiều nhất
      .addCase(fetchFrequentQuestions.pending, (state) => {
        state.frequentQuestionsStatus = 'loading';
      })
      .addCase(fetchFrequentQuestions.fulfilled, (state, action) => {
        state.frequentQuestionsStatus = 'succeeded';
        state.frequentQuestions = action.payload;
      })
      .addCase(fetchFrequentQuestions.rejected, (state, action) => {
        state.frequentQuestionsStatus = 'failed';
        state.error = action.payload;
      })
      // Báo giá bảng quảng cáo truyền thống bằng chatbot
      .addCase(getTraditionalPricing.pending, (state) => {
        state.traditionalPricingStatus = 'loading';
      })
      .addCase(getTraditionalPricing.fulfilled, (state, action) => {
        state.traditionalPricingStatus = 'succeeded';
        state.traditionalPricingResult = action.payload;
      })
      .addCase(getTraditionalPricing.rejected, (state, action) => {
        state.traditionalPricingStatus = 'failed';
        state.error = action.payload;
      })
      // Báo giá bảng quảng cáo hiện đại bằng chatbot
      .addCase(getModernPricing.pending, (state) => {
        state.modernPricingStatus = 'loading';
      })
      .addCase(getModernPricing.fulfilled, (state, action) => {
        state.modernPricingStatus = 'succeeded';
        state.modernPricingResult = action.payload;
      })
      .addCase(getModernPricing.rejected, (state, action) => {
        state.modernPricingStatus = 'failed';
        state.error = action.payload;
      })
      // Chọn model để chat từ list model (model-chat)
      .addCase(selectModelForModelChat.pending, (state) => {
        state.modelChatSelectedModelStatus = 'loading';
      })
      .addCase(selectModelForModelChat.fulfilled, (state, action) => {
        state.modelChatSelectedModelStatus = 'succeeded';
        state.modelChatSelectedModel = action.payload;
      })
      .addCase(selectModelForModelChat.rejected, (state, action) => {
        state.modelChatSelectedModelStatus = 'failed';
        state.error = action.payload;
      })
      // Upload file excel để convert thành file jsonl (model-chat)
      .addCase(uploadFileExcelModelChat.pending, (state) => {
        state.modelChatUploadedFileStatus = 'loading';
      })
      .addCase(uploadFileExcelModelChat.fulfilled, (state, action) => {
        state.modelChatUploadedFileStatus = 'succeeded';
        state.modelChatUploadedFile = action.payload;
        state.uploadedFile = action.payload; // Also set uploadedFile for consistent UI
      })
      .addCase(uploadFileExcelModelChat.rejected, (state, action) => {
        state.modelChatUploadedFileStatus = 'failed';
        state.error = action.payload;
      })
      // Lấy danh sách tất cả các model đã fine-tune (model-chat)
      .addCase(fetchFineTunedModelsModelChat.pending, (state) => {
        state.modelChatFineTunedModelsStatus = 'loading';
      })
      .addCase(fetchFineTunedModelsModelChat.fulfilled, (state, action) => {
        state.modelChatFineTunedModelsStatus = 'succeeded';
        state.modelChatFineTunedModels = Array.isArray(action.payload) ? action.payload : Array.isArray(action.payload.result) ? action.payload.result : [];
      })
      .addCase(fetchFineTunedModelsModelChat.rejected, (state, action) => {
        state.modelChatFineTunedModelsStatus = 'failed';
        state.error = action.payload;
      })
      // Test chat reducers
      .addCase(testChat.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(testChat.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages.push({ from: 'bot', text: action.payload, thread: state.currentThread || 'basic' });
        state.error = null;
      })
      .addCase(testChat.rejected, (state, action) => {
        state.status = 'failed';
        state.messages.push({ from: 'bot', text: 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.', thread: state.currentThread || 'basic' });
        state.error = action.payload;
      })
      // Request traditional pricing reducers
      .addCase(requestTraditionalPricing.pending, (state) => {
        state.traditionalPricingStatus = 'loading';
      })
      .addCase(requestTraditionalPricing.fulfilled, (state, action) => {
        state.traditionalPricingStatus = 'succeeded';
        state.traditionalPricingResult = action.payload;
      })
      .addCase(requestTraditionalPricing.rejected, (state, action) => {
        state.traditionalPricingStatus = 'failed';
        state.error = action.payload;
      })
      // Lấy danh sách model OpenAI
      .addCase(fetchOpenAiModels.pending, (state) => {
        state.openAiModelsStatus = 'loading';
      })
      .addCase(fetchOpenAiModels.fulfilled, (state, action) => {
        state.openAiModelsStatus = 'succeeded';
        state.openAiModels = action.payload;
      })
      .addCase(fetchOpenAiModels.rejected, (state, action) => {
        state.openAiModelsStatus = 'failed';
        state.error = action.payload;
      })
      // Theo dõi đơn hàng
      .addCase(trackOrder.pending, (state) => {
        state.trackingOrderStatus = 'loading';
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.trackingOrderStatus = 'succeeded';
        state.trackingOrderResult = action.payload;
        // Đẩy phản hồi vào luồng chat như bot nhắn lại
        state.messages.push({ from: 'bot', text: action.payload, thread: state.currentThread || 'basic' });
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.trackingOrderStatus = 'failed';
        state.error = action.payload;
        state.messages.push({ from: 'bot', text: 'Xin lỗi, không thể lấy thông tin đơn hàng lúc này.', thread: state.currentThread || 'basic' });
      })
      // Kiểm tra trạng thái của job fine-tune đang chạy
      .addCase(checkFineTuneJobStatus.pending, (state) => {
        // Không thay đổi currentJobStatus khi đang kiểm tra
      })
      .addCase(checkFineTuneJobStatus.fulfilled, (state, action) => {
        const jobStatus = action.payload.status;
        state.currentJobStatus = jobStatus;

        // Cập nhật trainingStatus dựa trên trạng thái thực tế của job
        if (jobStatus === 'succeeded') {
          state.trainingStatus = 'succeeded';
        } else if (jobStatus === 'failed') {
          state.trainingStatus = 'failed';
        } else if (jobStatus === 'cancelled') {
          state.trainingStatus = 'cancelled';
        } else if (jobStatus === 'pending' || jobStatus === 'running' || jobStatus === 'fine_tuning' || jobStatus === 'training') {
          state.trainingStatus = 'loading';
        }
      })
      .addCase(checkFineTuneJobStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Management fine-tuned models reducers
      .addCase(fetchManagementFineTunedModels.pending, (state) => {
        state.managementFineTunedModelsStatus = 'loading';
      })
      .addCase(fetchManagementFineTunedModels.fulfilled, (state, action) => {
        state.managementFineTunedModelsStatus = 'succeeded';
        state.managementFineTunedModels = action.payload.result || [];
        state.managementFineTunedModelsPagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          pageSize: action.payload.pageSize,
          totalElements: action.payload.totalElements
        };
      })
      .addCase(fetchManagementFineTunedModels.rejected, (state, action) => {
        state.managementFineTunedModelsStatus = 'failed';
        state.error = action.payload;
      })
      // Chat bot topics by model id reducers
      .addCase(fetchChatBotTopicsByModelId.pending, (state) => {
        state.selectedModelChatBotTopicsStatus = 'loading';
      })
      .addCase(fetchChatBotTopicsByModelId.fulfilled, (state, action) => {
        state.selectedModelChatBotTopicsStatus = 'succeeded';
        state.selectedModelChatBotTopics = action.payload.topics || [];
        state.selectedModelForTopics = action.payload.modelChatBotId;
      })
      .addCase(fetchChatBotTopicsByModelId.rejected, (state, action) => {
        state.selectedModelChatBotTopicsStatus = 'failed';
        state.error = action.payload;
      })
      // Assign topic to model chat bot reducers
      .addCase(assignTopicToModelChat.pending, (state) => {
        state.selectedModelChatBotTopicsStatus = 'loading';
      })
      .addCase(assignTopicToModelChat.fulfilled, (state, action) => {
        state.selectedModelChatBotTopicsStatus = 'succeeded';
        // Optionally refresh the topics for the model after assignment
      })
      .addCase(assignTopicToModelChat.rejected, (state, action) => {
        state.selectedModelChatBotTopicsStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  addUserMessage,
  addBotMessage,
  setCurrentThread,
  setLastTrackedOrderCode,
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
export const selectFrequentQuestions = (state) => state.chat.frequentQuestions;
export const selectFrequentQuestionsStatus = (state) => state.chat.frequentQuestionsStatus;
export const selectTraditionalPricingResult = (state) => state.chat.traditionalPricingResult;
export const selectTraditionalPricingStatus = (state) => state.chat.traditionalPricingStatus;
export const selectModernPricingResult = (state) => state.chat.modernPricingResult;
export const selectModernPricingStatus = (state) => state.chat.modernPricingStatus;
export const selectModelChatSelectedModel = (state) => state.chat.modelChatSelectedModel;
export const selectModelChatSelectedModelStatus = (state) => state.chat.modelChatSelectedModelStatus;
export const selectModelChatUploadedFile = (state) => state.chat.modelChatUploadedFile;
export const selectModelChatUploadedFileStatus = (state) => state.chat.modelChatUploadedFileStatus;
export const selectModelChatFineTunedModels = (state) => state.chat.modelChatFineTunedModels;
export const selectModelChatFineTunedModelsStatus = (state) => state.chat.modelChatFineTunedModelsStatus;
export const selectFineTuneFileContent = (state) => state.chat.fineTuneFileContent;
export const selectFineTuneFileContentStatus = (state) => state.chat.fineTuneFileContentStatus;
export const selectCurrentJobStatus = (state) => state.chat.currentJobStatus;
export const selectTrackingOrderStatus = (state) => state.chat.trackingOrderStatus;
export const selectTrackingOrderResult = (state) => state.chat.trackingOrderResult;
export const selectLastTrackedOrderCode = (state) => state.chat.lastTrackedOrderCode;
// Management selectors
export const selectManagementFineTunedModels = (state) => state.chat.managementFineTunedModels;
export const selectManagementFineTunedModelsStatus = (state) => state.chat.managementFineTunedModelsStatus;
export const selectManagementFineTunedModelsPagination = (state) => state.chat.managementFineTunedModelsPagination;
export const selectSelectedModelChatBotTopics = (state) => state.chat.selectedModelChatBotTopics;
export const selectSelectedModelChatBotTopicsStatus = (state) => state.chat.selectedModelChatBotTopicsStatus;
export const selectSelectedModelForTopics = (state) => state.chat.selectedModelForTopics;

export default chatSlice.reducer;
