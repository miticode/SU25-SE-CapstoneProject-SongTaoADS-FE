import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAttributeValueApi,
  deleteAttributeValueApi,
  getAttributeValuesByAttributeIdApi,
  updateAttributeValueApi,
} from "../../../api/attributeValueService";

// Initial state
const initialState = {
  attributeValues: [],
  currentAttributeValue: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  },
};

// Create a new attribute value
export const createAttributeValue = createAsyncThunk(
  "attributeValue/create",
  async ({ attributeId, attributeValueData }, thunkAPI) => {
    try {
      const response = await createAttributeValueApi(
        attributeId,
        attributeValueData
      );
      if (!response.success) {
        return thunkAPI.rejectWithValue(
          response.error || "Failed to create attribute value"
        );
      }
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  }
);
export const getAttributeValuesByAttributeId = createAsyncThunk(
  "attributeValue/getByAttributeId",
  async ({ attributeId, page = 1, size = 10 }, thunkAPI) => {
    try {
      const response = await getAttributeValuesByAttributeIdApi(
        attributeId,
        page,
        size
      );
      if (!response.success) {
        return thunkAPI.rejectWithValue(
          response.error || "Failed to fetch attribute values"
        );
      }

      // Return both the data and pagination info
      return {
        attributeValues: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  }
);
export const updateAttributeValue = createAsyncThunk(
  "attributeValue/update",
  async ({ attributeValueId, attributeValueData }, thunkAPI) => {
    try {
      const response = await updateAttributeValueApi(
        attributeValueId,
        attributeValueData
      );
      if (!response.success) {
        return thunkAPI.rejectWithValue(
          response.error || "Failed to update attribute value"
        );
      }
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  }
);
export const deleteAttributeValue = createAsyncThunk(
  "attributeValue/delete",
  async (attributeValueId, thunkAPI) => {
    try {
      const response = await deleteAttributeValueApi(attributeValueId);
      if (!response.success) {
        return thunkAPI.rejectWithValue(
          response.error || "Failed to delete attribute value"
        );
      }
      // Return the ID of the deleted value so we can remove it from the state
      return attributeValueId;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  }
);
const attributeValueSlice = createSlice({
  name: "attributeValue",
  initialState,
  reducers: {
    resetAttributeValue: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    clearAttributeValue: (state) => {
      state.currentAttributeValue = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create attribute value
      .addCase(createAttributeValue.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(createAttributeValue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attributeValues.push(action.payload);
        state.currentAttributeValue = action.payload;
      })
      .addCase(createAttributeValue.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAttributeValuesByAttributeId.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(getAttributeValuesByAttributeId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attributeValues = action.payload.attributeValues;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAttributeValuesByAttributeId.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
       .addCase(updateAttributeValue.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
      state.isError = false;
    })
    .addCase(updateAttributeValue.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      // Update the attribute value in the array
      state.attributeValues = state.attributeValues.map((value) =>
        value.id === action.payload.id ? action.payload : value
      );
      state.currentAttributeValue = action.payload;
    })
    .addCase(updateAttributeValue.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    })
     .addCase(deleteAttributeValue.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
      state.isError = false;
    })
    .addCase(deleteAttributeValue.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      // Remove the deleted attribute value from the array
      state.attributeValues = state.attributeValues.filter(
        (value) => value.id !== action.payload
      );
      if (state.currentAttributeValue && state.currentAttributeValue.id === action.payload) {
        state.currentAttributeValue = null;
      }
    })
    .addCase(deleteAttributeValue.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    });
  },
});

export const { resetAttributeValue, clearAttributeValue } =
  attributeValueSlice.actions;
export default attributeValueSlice.reducer;
