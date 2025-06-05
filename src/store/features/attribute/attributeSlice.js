import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAttributesByProductTypeIdApi, getAttributeValuesByAttributeIdApi, getAttributeByIdApi, updateAttributeApi, deleteAttributeApi, createAttributeApi } from '../../../api/attributeService';

// Initial state
const initialState = {
  attributes: [],
  attributeValues: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  attributeValuesStatus: {},
  error: null
};

// Async thunk to fetch attributes by product type ID
export const fetchAttributesByProductTypeId = createAsyncThunk(
  'attribute/fetchAttributesByProductTypeId',
  async (productTypeId, { rejectWithValue }) => {
    const response = await getAttributesByProductTypeIdApi(productTypeId);
    
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to fetch attributes');
    }
    
    return response.data;
  }
);
export const fetchAttributeValuesByAttributeId = createAsyncThunk(
  'attribute/fetchAttributeValuesByAttributeId',
  async (attributeId, { rejectWithValue }) => {
    const response = await getAttributeValuesByAttributeIdApi(attributeId);
    
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to fetch attribute values');
    }
    
    return { attributeId, values: response.data };
  }
);
// Thunk tạo attribute mới
export const createAttribute = createAsyncThunk(
  'attribute/createAttribute',
  async ({ productTypeId, data }, { rejectWithValue }) => {
    const response = await createAttributeApi(productTypeId, data);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to create attribute');
    }
    return response.data;
  }
);
// Thunk cập nhật attribute
export const updateAttribute = createAsyncThunk(
  'attribute/updateAttribute',
  async ({ attributeId, data }, { rejectWithValue }) => {
    const response = await updateAttributeApi(attributeId, data);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to update attribute');
    }
    return response.data;
  }
);
// Thunk xóa attribute
export const deleteAttribute = createAsyncThunk(
  'attribute/deleteAttribute',
  async (attributeId, { rejectWithValue }) => {
    const response = await deleteAttributeApi(attributeId);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to delete attribute');
    }
    return attributeId;
  }
);
// Thunk lấy chi tiết attribute
export const fetchAttributeById = createAsyncThunk(
  'attribute/fetchAttributeById',
  async (attributeId, { rejectWithValue }) => {
    const response = await getAttributeByIdApi(attributeId);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to fetch attribute');
    }
    return response.data;
  }
);
const attributeSlice = createSlice({
  name: 'attribute',
  initialState,
  reducers: {
    resetAttributeStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearAttributes: (state) => {
      state.attributes = [];
      state.attributeValues = {};
      state.attributeValuesStatus = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributesByProductTypeId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAttributesByProductTypeId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.attributes = action.payload;
        state.error = null;
         action.payload.forEach(attr => {
          if (!state.attributeValuesStatus[attr.id]) {
            state.attributeValuesStatus[attr.id] = 'idle';
          }
        });
      })
      .addCase(fetchAttributesByProductTypeId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAttributeValuesByAttributeId.pending, (state, action) => {
        const attributeId = action.meta.arg;
        state.attributeValuesStatus[attributeId] = 'loading';
      })
      .addCase(fetchAttributeValuesByAttributeId.fulfilled, (state, action) => {
        const { attributeId, values } = action.payload;
        state.attributeValues[attributeId] = values;
        state.attributeValuesStatus[attributeId] = 'succeeded';
      })
      .addCase(fetchAttributeValuesByAttributeId.rejected, (state, action) => {
        const attributeId = action.meta.arg;
        state.attributeValuesStatus[attributeId] = 'failed';
      })
      // Thêm xử lý cho createAttribute
      .addCase(createAttribute.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createAttribute.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.attributes.push(action.payload);
        state.error = null;
      })
      .addCase(createAttribute.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Thêm xử lý cho updateAttribute
      .addCase(updateAttribute.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateAttribute.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const idx = state.attributes.findIndex(attr => attr.id === action.payload.id);
        if (idx !== -1) {
          state.attributes[idx] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAttribute.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Thêm xử lý cho deleteAttribute
      .addCase(deleteAttribute.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteAttribute.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.attributes = state.attributes.filter(attr => attr.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteAttribute.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Thêm xử lý cho fetchAttributeById (nếu cần lưu riêng attribute chi tiết)
      .addCase(fetchAttributeById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAttributeById.fulfilled, (state) => {
        state.status = 'succeeded';
        // Có thể lưu vào state.attributeDetail nếu muốn
        state.error = null;
      })
      .addCase(fetchAttributeById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { resetAttributeStatus, clearAttributes } = attributeSlice.actions;

// Selectors
export const selectAllAttributes = (state) => state.attribute.attributes;
export const selectAttributeStatus = (state) => state.attribute.status;
export const selectAttributeError = (state) => state.attribute.error;
export const selectAttributeValues = (state, attributeId) => 
  state.attribute.attributeValues[attributeId] || [];

export const selectAttributeValuesStatus = (state, attributeId) => 
  state.attribute.attributeValuesStatus[attributeId] || 'idle';
export default attributeSlice.reducer;