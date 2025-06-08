import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendChatMessageApi } from '../../../api/chatService';

const initialState = {
  messages: [
    {
      from: 'bot',
      text: 'Xin chào quý khách! Song Tạo có thể giúp gì cho bạn?',
    },
  ],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async (prompt, { rejectWithValue }) => {
    const response = await sendChatMessageApi(prompt);
    if (!response.success) return rejectWithValue(response.error || 'Failed to send chat message');
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
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { addUserMessage, resetChat, loadMessagesFromStorage } = chatSlice.actions;
export const selectChatMessages = (state) => state.chat.messages;
export const selectChatStatus = (state) => state.chat.status;
export const selectChatError = (state) => state.chat.error;
export default chatSlice.reducer;
