import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllSizesApi,
  getSizeByIdApi,
  addSizeApi,
  updateSizeApi,
  deleteSizeApi,
} from "../../../api/sizeService";

const initialState = {
  sizes: [],
  currentSize: null,
  status: "idle",
  error: null,
};

export const fetchSizes = createAsyncThunk(
  "size/fetchSizes",
  async (_, { rejectWithValue }) => {
    const response = await getAllSizesApi();
    if (!response.success) return rejectWithValue(response.error || "Failed to fetch sizes");
    return response.data;
  }
);

export const fetchSizeById = createAsyncThunk(
  "size/fetchSizeById",
  async (id, { rejectWithValue }) => {
    const response = await getSizeByIdApi(id);
    if (!response.success) return rejectWithValue(response.error || "Failed to fetch size");
    return response.data;
  }
);

export const addSize = createAsyncThunk(
  "size/addSize",
  async (data, { rejectWithValue }) => {
    const response = await addSizeApi(data);
    if (!response.success) return rejectWithValue(response.error || "Failed to add size");
    return response.data;
  }
);

export const updateSize = createAsyncThunk(
  "size/updateSize",
  async ({ id, data }, { rejectWithValue }) => {
    const response = await updateSizeApi(id, data);
    if (!response.success) return rejectWithValue(response.error || "Failed to update size");
    return response.data;
  }
);

export const deleteSize = createAsyncThunk(
  "size/deleteSize",
  async (id, { rejectWithValue }) => {
    const response = await deleteSizeApi(id);
    if (!response.success) return rejectWithValue(response.error || "Failed to delete size");
    return response.data;
  }
);

const sizeSlice = createSlice({
  name: "size",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSizes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sizes = action.payload;
        state.error = null;
      })
      .addCase(fetchSizes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchSizeById.fulfilled, (state, action) => {
        state.currentSize = action.payload;
      })
      .addCase(addSize.fulfilled, (state, action) => {
        state.sizes.push(action.payload);
      })
      .addCase(updateSize.fulfilled, (state, action) => {
        const idx = state.sizes.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.sizes[idx] = action.payload;
      })
      .addCase(deleteSize.fulfilled, (state, action) => {
        state.sizes = state.sizes.filter((s) => s.id !== action.payload.id);
      });
  },
});

export const selectAllSizes = (state) => state.size.sizes;
export const selectCurrentSize = (state) => state.size.currentSize;
export const selectSizeStatus = (state) => state.size.status;
export const selectSizeError = (state) => state.size.error;

export default sizeSlice.reducer;
