import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAttributesByProductTypeIdApi, getAttributeValuesByAttributeIdApi } from '../../../api/attributeService';

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