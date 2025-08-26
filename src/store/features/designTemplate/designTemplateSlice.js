import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchDesignTemplatesByProductTypeIdApi,
  createDesignTemplateApi,
  updateDesignTemplateInfoApi,
  updateDesignTemplateImageApi,
  fetchAllDesignTemplatesApi,
  fetchDesignTemplateByIdApi,
  deleteDesignTemplateByIdApi,
  fetchDesignTemplateSuggestionsByCustomerChoiceIdApi
} from '../../../api/designTemplateService';

// Initial state
const initialState = {
  designTemplates: [],
  suggestedTemplates: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  suggestionsStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  suggestionsError: null,
  selectedTemplate: null,
  suggestionsPagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0
  }
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

// Async thunk for creating a new design template
export const createDesignTemplate = createAsyncThunk(
  'designTemplate/create',
  async ({ productTypeId, templateData }, { rejectWithValue }) => {
    try {
      const response = await createDesignTemplateApi(productTypeId, templateData);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create design template');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for updating design template information
export const updateDesignTemplateInfo = createAsyncThunk(
  'designTemplate/updateInfo',
  async ({ designTemplateId, updateData }, { rejectWithValue }) => {
    try {
      const response = await updateDesignTemplateInfoApi(designTemplateId, updateData);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update design template info');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for updating design template image
export const updateDesignTemplateImage = createAsyncThunk(
  'designTemplate/updateImage',
  async ({ designTemplateId, file }, { rejectWithValue }) => {
    try {
      const response = await updateDesignTemplateImageApi(designTemplateId, file);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update design template image');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for fetching all design templates
export const fetchAllDesignTemplates = createAsyncThunk(
  'designTemplate/fetchAll',
  async ({ page = 1, size = 10, aspectRatio } = {}, { rejectWithValue }) => {
    try {
      const response = await fetchAllDesignTemplatesApi(page, size, aspectRatio);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch all design templates');
      }
      return {
        templates: response.data,
        pagination: response.pagination
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for fetching a design template by ID
export const fetchDesignTemplateById = createAsyncThunk(
  'designTemplate/fetchById',
  async (designTemplateId, { rejectWithValue }) => {
    try {
      const response = await fetchDesignTemplateByIdApi(designTemplateId);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch design template by ID');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for deleting a design template by ID
export const deleteDesignTemplateById = createAsyncThunk(
  'designTemplate/deleteById',
  async (designTemplateId, { rejectWithValue }) => {
    try {
      const response = await deleteDesignTemplateByIdApi(designTemplateId);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete design template');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Async thunk for fetching design template suggestions by customer choice ID
export const fetchDesignTemplateSuggestionsByCustomerChoiceId = createAsyncThunk(
  'designTemplate/fetchSuggestionsByCustomerChoiceId',
  async ({ customerChoiceId, page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await fetchDesignTemplateSuggestionsByCustomerChoiceIdApi(customerChoiceId, page, size);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch design template suggestions');
      }
      return {
        templates: response.data,
        pagination: response.pagination
      };
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
    // Reset suggestions status
    resetSuggestionsStatus: (state) => {
      state.suggestionsStatus = 'idle';
      state.suggestionsError = null;
    },
    // Set a selected template for preview or editing
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
    },
    // Clear selected template
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },
    // Clear suggested templates
    clearSuggestedTemplates: (state) => {
      state.suggestedTemplates = [];
      state.suggestionsPagination = {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalElements: 0
      };
    },
    // Optimistic delete - xóa template ngay lập tức khỏi state
    removeDesignTemplateOptimistically: (state, action) => {
      state.designTemplates = state.designTemplates.filter(t => t.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch design templates by product type ID
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
      })
      // Fetch all design templates
      .addCase(fetchAllDesignTemplates.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllDesignTemplates.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Thay thế hoàn toàn dữ liệu mỗi khi load trang mới
        state.designTemplates = action.payload.templates;
        state.suggestionsPagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAllDesignTemplates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create design template
      .addCase(createDesignTemplate.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createDesignTemplate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.designTemplates.push(action.payload);
        state.error = null;
      })
      .addCase(createDesignTemplate.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update design template info
      .addCase(updateDesignTemplateInfo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateDesignTemplateInfo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the template in the array
        const idx = state.designTemplates.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.designTemplates[idx] = action.payload;
        state.error = null;
      })
      .addCase(updateDesignTemplateInfo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update design template image
      .addCase(updateDesignTemplateImage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateDesignTemplateImage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the template in the array
        const idx = state.designTemplates.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.designTemplates[idx] = action.payload;
        state.error = null;
      })
      .addCase(updateDesignTemplateImage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch design template by ID
      .addCase(fetchDesignTemplateById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDesignTemplateById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedTemplate = action.payload;
        state.error = null;
      })
      .addCase(fetchDesignTemplateById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete design template by ID
      .addCase(deleteDesignTemplateById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteDesignTemplateById.fulfilled, (state) => {
        state.status = 'succeeded';
        // Không cần xử lý thêm vì đã dùng optimistic update
        // Template đã được xóa khỏi state trước đó
        state.error = null;
      })
      .addCase(deleteDesignTemplateById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch design template suggestions by customer choice ID
      .addCase(fetchDesignTemplateSuggestionsByCustomerChoiceId.pending, (state) => {
        state.suggestionsStatus = 'loading';
      })
      .addCase(fetchDesignTemplateSuggestionsByCustomerChoiceId.fulfilled, (state, action) => {
        state.suggestionsStatus = 'succeeded';
        state.suggestedTemplates = action.payload.templates;
        state.suggestionsPagination = action.payload.pagination;
        state.suggestionsError = null;
      })
      .addCase(fetchDesignTemplateSuggestionsByCustomerChoiceId.rejected, (state, action) => {
        state.suggestionsStatus = 'failed';
        state.suggestionsError = action.payload;
      });
  }
});

// Export actions
export const {
  resetDesignTemplateStatus,
  resetSuggestionsStatus,
  setSelectedTemplate,
  clearSelectedTemplate,
  clearSuggestedTemplates,
  removeDesignTemplateOptimistically
} = designTemplateSlice.actions;

// Export selectors
export const selectAllDesignTemplates = (state) => state.designTemplate.designTemplates;
export const selectSuggestedTemplates = (state) => state.designTemplate.suggestedTemplates;
export const selectDesignTemplateStatus = (state) => state.designTemplate.status;
export const selectSuggestionsStatus = (state) => state.designTemplate.suggestionsStatus;
export const selectDesignTemplateError = (state) => state.designTemplate.error;
export const selectSuggestionsError = (state) => state.designTemplate.suggestionsError;
export const selectSelectedTemplate = (state) => state.designTemplate.selectedTemplate;
export const selectSuggestionsPagination = (state) => state.designTemplate.suggestionsPagination;

// Selector for a design template by ID
export const selectDesignTemplateById = (state, id) =>
  state.designTemplate.designTemplates.find(t => t.id === id);

export default designTemplateSlice.reducer;