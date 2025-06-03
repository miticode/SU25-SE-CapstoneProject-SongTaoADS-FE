import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createAIDesignApi } from '../../../api/aiService';

// Tạo AI Design Thunk
export const createAIDesign = createAsyncThunk(
  'ai/createAIDesign',
  async ({ customerDetailId, designTemplateId, customerNote, aiImage }, { rejectWithValue }) => {
    try {
      const response = await createAIDesignApi(
        customerDetailId,
        designTemplateId,
        customerNote,
        aiImage
      );
      
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to create AI design');
      }
      
      return response.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  currentAIDesign: null,
  status: 'idle',
  error: null,
};

// Slice
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    resetAIStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAIDesign.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAIDesign.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentAIDesign = action.payload;
      })
      .addCase(createAIDesign.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetAIStatus } = aiSlice.actions;

// Selectors
export const selectCurrentAIDesign = (state) => state.ai.currentAIDesign;
export const selectAIStatus = (state) => state.ai.status;
export const selectAIError = (state) => state.ai.error;

export default aiSlice.reducer;