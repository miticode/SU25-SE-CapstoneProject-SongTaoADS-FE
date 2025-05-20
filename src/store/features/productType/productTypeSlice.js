import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProductTypesApi, getProductTypeByIdApi } from '../../../api/productTypeService';

// Initial state
const initialState = {
  productTypes: [],
  currentProductType: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Async thunks
export const fetchProductTypes = createAsyncThunk(
  'productType/fetchProductTypes',
  async (_, { rejectWithValue }) => {
    const response = await getProductTypesApi();
    
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to fetch product types');
    }
    
    return response.data;
  }
);

export const fetchProductTypeById = createAsyncThunk(
  'productType/fetchProductTypeById',
  async (id, { rejectWithValue }) => {
    const response = await getProductTypeByIdApi(id);
    
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to fetch product type');
    }
    
    return response.data;
  }
);

const productTypeSlice = createSlice({
  name: 'productType',
  initialState,
  reducers: {
    resetProductTypeStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearCurrentProductType: (state) => {
      state.currentProductType = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all product types cases
      .addCase(fetchProductTypes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.productTypes = action.payload;
        state.error = null;
      })
      .addCase(fetchProductTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch product type by id cases
      .addCase(fetchProductTypeById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductTypeById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentProductType = action.payload;
        state.error = null;
      })
      .addCase(fetchProductTypeById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { resetProductTypeStatus, clearCurrentProductType } = productTypeSlice.actions;

// Selectors
export const selectAllProductTypes = (state) => state.productType.productTypes;
export const selectCurrentProductType = (state) => state.productType.currentProductType;
export const selectProductTypeStatus = (state) => state.productType.status;
export const selectProductTypeError = (state) => state.productType.error;

export default productTypeSlice.reducer;