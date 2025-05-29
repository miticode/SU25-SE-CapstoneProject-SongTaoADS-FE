import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDesignTemplatesByProductTypeIdApi } from '../../../api/designTemplateService';

// Initial state
const initialState = {
  designTemplates: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedTemplate: null
};

// Async thunk for fetching design templates by product type ID
export const fetchDesignTemplatesByProductTypeId = createAsyncThunk(
  'designTemplate/fetchByProductTypeId',
  async (productTypeId, { rejectWithValue }) => {
    try {
      const response = await fetchDesignTemplatesByProductTypeIdApi(productTypeId);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch design templates');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Design Template slice
const designTemplateSlice = createSlice({
  name: 'designTemplate',
  initialState,
  reducers: {
    // Reset status when needed
    resetDesignTemplateStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    // Set a selected template for preview or editing
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
    },
    // Clear selected template
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch design templates cases
      .addCase(fetchDesignTemplatesByProductTypeId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDesignTemplatesByProductTypeId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.designTemplates = action.payload;
        state.error = null;
      })
      .addCase(fetchDesignTemplatesByProductTypeId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  resetDesignTemplateStatus,
  setSelectedTemplate,
  clearSelectedTemplate
} = designTemplateSlice.actions;

// Export selectors
export const selectAllDesignTemplates = (state) => state.designTemplate.designTemplates;
export const selectDesignTemplateStatus = (state) => state.designTemplate.status;
export const selectDesignTemplateError = (state) => state.designTemplate.error;
export const selectSelectedTemplate = (state) => state.designTemplate.selectedTemplate;

export default designTemplateSlice.reducer;