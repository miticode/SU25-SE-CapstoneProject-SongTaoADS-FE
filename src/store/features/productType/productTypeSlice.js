import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProductTypesApi,
  getProductTypeByIdApi,
  getProductTypeSizesByProductTypeIdApi,
  addProductTypeApi,
  addSizeToProductTypeApi,
  deleteProductTypeSizeApi,
  updateProductTypeImageApi,
} from "../../../api/productTypeService";

// Initial state
const initialState = {
  productTypes: [],
  currentProductType: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // State cho việc tạo mới product type
  addStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  addError: null,
  // State cho việc cập nhật hình ảnh product type
  updateImageStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  updateImageError: null,
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
  async ({ page = 1, size = 10, isAvailable = null } = {}, { rejectWithValue }) => {
    const response = await getProductTypesApi(page, size, isAvailable);

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

export const addProductType = createAsyncThunk(
  "productType/addProductType",
  async (productTypeData, { rejectWithValue }) => {
    const response = await addProductTypeApi(productTypeData);
    if (!response.success) {
      return rejectWithValue(
        response.error || "Failed to add product type"
      );
    }
    return response.data;
  }
);

export const addSizeToProductType = createAsyncThunk(
  "productType/addSizeToProductType",
  async ({ productTypeId, sizeId, sizeData }, { rejectWithValue }) => {
    const response = await addSizeToProductTypeApi(productTypeId, sizeId, sizeData);
    if (!response.success) {
      return rejectWithValue(
        response.error || "Failed to add size to product type"
      );
    }
    // Trả về productTypeId để có thể reload danh sách size
    return { productTypeId, data: response.data };
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

export const updateProductTypeImage = createAsyncThunk(
  "productType/updateProductTypeImage",
  async ({ productTypeId, imageFile }, { rejectWithValue }) => {
    const response = await updateProductTypeImageApi(productTypeId, imageFile);
    if (!response.success) {
      return rejectWithValue(
        response.error || "Failed to update product type image"
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
    resetAddProductTypeStatus: (state) => {
      state.addStatus = "idle";
      state.addError = null;
    },
    resetUpdateImageStatus: (state) => {
      state.updateImageStatus = "idle";
      state.updateImageError = null;
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

      // Add product type cases
      .addCase(addProductType.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
      })
      .addCase(addProductType.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        // Thêm product type mới vào danh sách
        state.productTypes.push(action.payload);
        state.addError = null;
      })
      .addCase(addProductType.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload;
      })

      // Fetch product type sizes cases
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
      )

      // Update product type image cases
      .addCase(updateProductTypeImage.pending, (state) => {
        state.updateImageStatus = "loading";
        state.updateImageError = null;
      })
      .addCase(updateProductTypeImage.fulfilled, (state, action) => {
        state.updateImageStatus = "succeeded";
        // Cập nhật hình ảnh trong danh sách productTypes
        const updatedProductType = action.payload;
        const index = state.productTypes.findIndex(
          (pt) => pt.id === updatedProductType.id
        );
        if (index !== -1) {
          state.productTypes[index] = updatedProductType;
        }
        // Cập nhật currentProductType nếu có
        if (state.currentProductType && state.currentProductType.id === updatedProductType.id) {
          state.currentProductType = updatedProductType;
        }
        state.updateImageError = null;
      })
      .addCase(updateProductTypeImage.rejected, (state, action) => {
        state.updateImageStatus = "failed";
        state.updateImageError = action.payload;
      });
  },
});

export const {
  resetProductTypeStatus,
  resetAddProductTypeStatus,
  resetUpdateImageStatus,
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
// Selectors cho việc tạo mới product type
export const selectAddProductTypeStatus = (state) => state.productType.addStatus;
export const selectAddProductTypeError = (state) => state.productType.addError;
// Selectors cho việc cập nhật hình ảnh product type
export const selectUpdateImageStatus = (state) => state.productType.updateImageStatus;
export const selectUpdateImageError = (state) => state.productType.updateImageError;
export const selectProductTypeSizes = (state) =>
  state.productType.productTypeSizes;
export const selectProductTypeSizesStatus = (state) =>
  state.productType.sizesStatus;
export const selectProductTypeSizesError = (state) =>
  state.productType.sizesError;
export const selectProductTypePagination = (state) =>
  state.productType.pagination;

export default productTypeSlice.reducer;
