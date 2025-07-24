import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllContractors,
  getContractorById,
  createContractor,
  updateContractor,
  deleteContractor
} from '../../../api/contractorService';

// Lấy tất cả đơn vị thi công
export const fetchAllContractors = createAsyncThunk(
  'contractor/fetchAll',
  async (_, { rejectWithValue }) => {
    const response = await getAllContractors();
    if (response.success) {
      return response.data;
    } else {
      return rejectWithValue(response.error);
    }
  }
);

// Lấy đơn vị thi công theo ID
export const fetchContractorById = createAsyncThunk(
  'contractor/fetchById',
  async (contractorId, { rejectWithValue }) => {
    const response = await getContractorById(contractorId);
    if (response.success) {
      return response.data;
    } else {
      return rejectWithValue(response.error);
    }
  }
);

// Tạo mới đơn vị thi công
export const createContractorThunk = createAsyncThunk(
  'contractor/create',
  async (data, { rejectWithValue }) => {
    const response = await createContractor(data);
    if (response.success) {
      return response.data;
    } else {
      return rejectWithValue(response.error);
    }
  }
);

// Cập nhật thông tin đơn vị thi công
export const updateContractorThunk = createAsyncThunk(
  'contractor/update',
  async ({ contractorId, data }, { rejectWithValue }) => {
    const response = await updateContractor(contractorId, data);
    if (response.success) {
      return response.data;
    } else {
      return rejectWithValue(response.error);
    }
  }
);

// Xóa đơn vị thi công
export const deleteContractorThunk = createAsyncThunk(
  'contractor/delete',
  async (contractorId, { rejectWithValue }) => {
    const response = await deleteContractor(contractorId);
    if (response.success) {
      return contractorId;
    } else {
      return rejectWithValue(response.error);
    }
  }
);

const contractorSlice = createSlice({
  name: 'contractor',
  initialState: {
    contractors: [], // Danh sách tất cả đơn vị thi công
    contractorDetail: null, // Thông tin chi tiết 1 đơn vị thi công
    loading: false, // Trạng thái loading chung
    error: null, // Lỗi chung
  },
  reducers: {},
  extraReducers: (builder) => {
    // Xử lý lấy tất cả đơn vị thi công
    builder
      .addCase(fetchAllContractors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllContractors.fulfilled, (state, action) => {
        state.loading = false;
        state.contractors = action.payload;
      })
      .addCase(fetchAllContractors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý lấy đơn vị thi công theo ID
      .addCase(fetchContractorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContractorById.fulfilled, (state, action) => {
        state.loading = false;
        state.contractorDetail = action.payload;
      })
      .addCase(fetchContractorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý tạo mới đơn vị thi công
      .addCase(createContractorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContractorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.contractors.push(action.payload);
      })
      .addCase(createContractorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý cập nhật đơn vị thi công
      .addCase(updateContractorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContractorThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật contractor trong mảng nếu tồn tại
        const idx = state.contractors.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) {
          state.contractors[idx] = action.payload;
        }
        // Nếu contractorDetail đang xem trùng thì cũng cập nhật
        if (state.contractorDetail && state.contractorDetail.id === action.payload.id) {
          state.contractorDetail = action.payload;
        }
      })
      .addCase(updateContractorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý xóa đơn vị thi công
      .addCase(deleteContractorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContractorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.contractors = state.contractors.filter(c => c.id !== action.payload);
      })
      .addCase(deleteContractorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default contractorSlice.reducer;
