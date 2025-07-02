import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProductTypesApi,
  getProductTypeByIdApi,
  getProductTypeSizesByProductTypeIdApi,
  addSizeToProductTypeApi,
  deleteProductTypeSizeApi,
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
  pagination: {
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalElements: 0,
  },
};

// Async thunks
export const fetchProductTypes = createAsyncThunk(
  "productType/fetchProductTypes",
  async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
    const response = await getProductTypesApi(page, size);

    if (!response.success) {
      return rejectWithValue(response.error || "Failed to fetch product types");
    }

    return {
      data: response.data,
      pagination: response.pagination,
    };
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
    // Trả về cả id để reducer có thể dùng nếu cần
    return { productTypeId, data: response.data };
  }
);

export const addSizeToProductType = createAsyncThunk(
  "productType/addSizeToProductType",
  async ({ productTypeId, sizeId }, { rejectWithValue }) => {
    const response = await addSizeToProductTypeApi(productTypeId, sizeId);
    if (!response.success) {
      return rejectWithValue(
        response.error || "Failed to add size to product type"
      );
    }
    // Trả về productTypeId để có thể reload danh sách size
    return { productTypeId };
  }
);

export const deleteProductTypeSize = createAsyncThunk(
  "productType/deleteProductTypeSize",
  async ({ productTypeId, productTypeSizeId }, { rejectWithValue }) => {
    const response = await deleteProductTypeSizeApi(productTypeSizeId);
    if (!response.success) {
      return rejectWithValue(
        response.error || "Failed to delete product type size"
      );
    }
    // Trả về productTypeId để có thể reload danh sách size
    return { productTypeId };
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
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
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
        state.productTypes = action.payload.data;
        state.pagination = action.payload.pagination;
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
          state.productTypeSizes = action.payload.data;
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
  clearProductTypeSizes,
  setPagination,
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
export const selectProductTypePagination = (state) =>
  state.productType.pagination;

export default productTypeSlice.reducer;
