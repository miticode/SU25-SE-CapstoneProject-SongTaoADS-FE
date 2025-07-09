import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createCostTypeApi,
  getCostTypesApi,
  getCostTypesByProductTypeIdApi,
} from "../../../api/costypeService";

export const fetchCostTypes = createAsyncThunk(
  "costype/fetchCostTypes",
  async (params = {}, { rejectWithValue }) => {
    const { page = 1, size = 10 } = params;

    const response = await getCostTypesApi(page, size);
    if (response.success) {
      return {
        costTypes: response.data,
        pagination: response.pagination,
      };
    }
    return rejectWithValue(response.error);
  }
);
export const createCostType = createAsyncThunk(
  "costype/createCostType",
  async ({ productTypeId, costTypeData }, { rejectWithValue }) => {
    const response = await createCostTypeApi(productTypeId, costTypeData);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
export const fetchCostTypesByProductTypeId = createAsyncThunk(
  "costype/fetchCostTypesByProductTypeId",
  async (productTypeId, { rejectWithValue }) => {
    const response = await getCostTypesByProductTypeIdApi(productTypeId);
    if (response.success) {
      return response.data;
    }
    return rejectWithValue(response.error);
  }
);
const initialState = {
  costTypes: [],
  productTypeCostTypes: [], // Thêm state mới cho cost types theo product type
  loading: false,
  error: null,
  currentCostType: null,
  currentCostTypeStatus: "idle",
  currentCostTypeError: null,
  productTypeCostTypesStatus: "idle", // Thêm status cho product type cost types
  productTypeCostTypesError: null, // Thêm error cho product type cost types
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  },
};

const costypeSlice = createSlice({
  name: "costype",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.currentCostTypeError = null;
      state.productTypeCostTypesError = null; // Thêm clear error cho product type cost types
    },
    setCurrentCostType: (state, action) => {
      state.currentCostType = action.payload;
    },
    clearCurrentCostType: (state) => {
      state.currentCostType = null;
      state.currentCostTypeStatus = "idle";
      state.currentCostTypeError = null;
    },
    clearProductTypeCostTypes: (state) => {
      // Thêm action để clear product type cost types
      state.productTypeCostTypes = [];
      state.productTypeCostTypesStatus = "idle";
      state.productTypeCostTypesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cost Types
      .addCase(fetchCostTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCostTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.costTypes = action.payload.costTypes;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchCostTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCostType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCostType.fulfilled, (state, action) => {
        state.loading = false;
        state.costTypes.unshift(action.payload); // Thêm vào đầu danh sách
      })
      .addCase(createCostType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCostTypesByProductTypeId.pending, (state) => {
        state.productTypeCostTypesStatus = "loading";
        state.productTypeCostTypesError = null;
      })
      .addCase(fetchCostTypesByProductTypeId.fulfilled, (state, action) => {
        state.productTypeCostTypesStatus = "succeeded";
        state.productTypeCostTypes = action.payload;
      })
      .addCase(fetchCostTypesByProductTypeId.rejected, (state, action) => {
        state.productTypeCostTypesStatus = "failed";
        state.productTypeCostTypesError = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentCostType,
  clearCurrentCostType,
  clearProductTypeCostTypes, // Export action mới
} = costypeSlice.actions;

export const selectCostTypes = (state) => state.costype.costTypes;
export const selectCostTypesLoading = (state) => state.costype.loading;
export const selectCostTypesError = (state) => state.costype.error;
export const selectCurrentCostType = (state) => state.costype.currentCostType;

export const selectProductTypeCostTypes = (state) =>
  state.costype.productTypeCostTypes;
export const selectProductTypeCostTypesStatus = (state) =>
  state.costype.productTypeCostTypesStatus;
export const selectProductTypeCostTypesError = (state) =>
  state.costype.productTypeCostTypesError;
export const selectCurrentCostTypeStatus = (state) =>
  state.costype.currentCostTypeStatus;
export const selectCurrentCostTypeError = (state) =>
  state.costype.currentCostTypeError;
export const selectCostTypesPagination = (state) => state.costype.pagination;
export const selectCostTypesStatus = (state) =>
  state.costype.loading
    ? "loading"
    : state.costype.error
    ? "failed"
    : "succeeded";
export default costypeSlice.reducer;