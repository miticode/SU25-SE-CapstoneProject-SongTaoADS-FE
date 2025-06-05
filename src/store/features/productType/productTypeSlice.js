import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProductTypesApi,
  getProductTypeByIdApi,
  getProductTypeSizesByProductTypeIdApi,
} from "../../../api/productTypeService";

// Initial state
const initialState = {
  productTypes: [],
  currentProductType: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  productTypeSizes: [],
  sizesError: null,
  sizesStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
};

// Async thunks
export const fetchProductTypes = createAsyncThunk(
  "productType/fetchProductTypes",
  async (_, { rejectWithValue }) => {
    const response = await getProductTypesApi();

    if (!response.success) {
      return rejectWithValue(response.error || "Failed to fetch product types");
    }

    return response.data;
  }
);

export const fetchProductTypeById = createAsyncThunk(
  "productType/fetchProductTypeById",
  async (id, { rejectWithValue }) => {
    const response = await getProductTypeByIdApi(id);

    if (!response.success) {
      return rejectWithValue(response.error || "Failed to fetch product type");
    }

    return response.data;
  }
);

export const fetchProductTypeSizesByProductTypeId = createAsyncThunk(
  "productType/fetchProductTypeSizesByProductTypeId",
  async (productTypeId, { rejectWithValue }) => {
    const response = await getProductTypeSizesByProductTypeIdApi(productTypeId);

    if (!response.success) {
      return rejectWithValue(
        response.error || "Failed to fetch product type sizes"
      );
    }

    return response.data;
  }
);
const productTypeSlice = createSlice({
  name: "productType",
  initialState,
  reducers: {
    resetProductTypeStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    clearCurrentProductType: (state) => {
      state.currentProductType = null;
    },
    resetProductTypeSizesStatus: (state) => {
      state.sizesStatus = "idle";
      state.sizesError = null;
    },
    clearProductTypeSizes: (state) => {
      state.productTypeSizes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all product types cases
      .addCase(fetchProductTypes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.productTypes = action.payload;
        state.error = null;
      })
      .addCase(fetchProductTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch product type by id cases
      .addCase(fetchProductTypeById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductTypeById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentProductType = action.payload;
        state.error = null;
      })
      .addCase(fetchProductTypeById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchProductTypeSizesByProductTypeId.pending, (state) => {
        state.sizesStatus = "loading";
      })
      .addCase(
        fetchProductTypeSizesByProductTypeId.fulfilled,
        (state, action) => {
          state.sizesStatus = "succeeded";
          state.productTypeSizes = action.payload;
          state.sizesError = null;
        }
      )
      .addCase(
        fetchProductTypeSizesByProductTypeId.rejected,
        (state, action) => {
          state.sizesStatus = "failed";
          state.sizesError = action.payload;
        }
      );
  },
});

export const { 
  resetProductTypeStatus, 
  clearCurrentProductType,
  resetProductTypeSizesStatus,
  clearProductTypeSizes
} = productTypeSlice.actions;

// Selectors
export const selectAllProductTypes = (state) => state.productType.productTypes;
export const selectCurrentProductType = (state) =>
  state.productType.currentProductType;
export const selectProductTypeStatus = (state) => state.productType.status;
export const selectProductTypeError = (state) => state.productType.error;
export const selectProductTypeSizes = (state) =>
  state.productType.productTypeSizes;
export const selectProductTypeSizesStatus = (state) =>
  state.productType.sizesStatus;
export const selectProductTypeSizesError = (state) =>
  state.productType.sizesError;

export default productTypeSlice.reducer;
