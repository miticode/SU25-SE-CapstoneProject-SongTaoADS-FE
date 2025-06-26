import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  discussContractApi,
  getOrderContractApi,
  uploadOrderContractApi,
  uploadRevisedContractApi,
  uploadSignedContractApi,
 
} from "../../../api/contractService";

// Contract status mapping
export const CONTRACT_STATUS_MAP = {
  SENT: { label: "Đã gửi", color: "info" },
  SIGNED: { label: "Đã ký", color: "success" },
  REJECTED: { label: "Từ chối", color: "error" },
  PENDING_REVIEW: { label: "Chờ xem xét", color: "warning" },
   DISCUSSING: { label: "Đang thảo luận", color: "warning" },
   NEED_RESIGNED: { label: "Yêu cầu ký lại", color: "warning" },
   CONFIRMED: { label: "Đã xác nhận", color: "success" },
};

// Async thunk for uploading contract
export const uploadContract = createAsyncThunk(
  "contract/uploadContract",
  async ({ orderId, formData }, { rejectWithValue }) => {
    try {
      const response = await uploadOrderContractApi(orderId, formData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Không thể tải lên hợp đồng");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể tải lên hợp đồng");
    }
  }
);
export const getOrderContract = createAsyncThunk(
  "contract/getOrderContract",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await getOrderContractApi(orderId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Không thể lấy thông tin hợp đồng");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể lấy thông tin hợp đồng");
    }
  }
);
export const discussContract = createAsyncThunk(
  "contract/discussContract",
  async (contractId, { rejectWithValue }) => {
    try {
      const response = await discussContractApi(contractId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Không thể yêu cầu thảo luận hợp đồng");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể yêu cầu thảo luận hợp đồng");
    }
  }
);
export const uploadRevisedContract = createAsyncThunk(
  "contract/uploadRevisedContract",
  async ({ contractId, formData }, { rejectWithValue }) => {
    try {
      const response = await uploadRevisedContractApi(contractId, formData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Không thể tải lên hợp đồng chỉnh sửa");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể tải lên hợp đồng chỉnh sửa");
    }
  }
);
export const uploadSignedContract = createAsyncThunk(
  "contract/uploadSignedContract",
  async ({ contractId, signedContractFile }, { rejectWithValue }) => {
    try {
      const response = await uploadSignedContractApi(contractId, signedContractFile);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Không thể tải lên hợp đồng đã ký");
    } catch (error) {
      return rejectWithValue(error.message || "Không thể tải lên hợp đồng đã ký");
    }
  }
);
const initialState = {
  contracts: [],
  currentContract: null,
  loading: false,
  success: false,
  error: null,
};

const contractSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {
    clearContractState: (state) => {
      state.error = null;
      state.success = false;
    },
    setCurrentContract: (state, action) => {
      state.currentContract = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload contract
      .addCase(uploadContract.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(uploadContract.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentContract = action.payload;
        
        // Thêm hoặc cập nhật hợp đồng trong danh sách
        const existingContractIndex = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        
        if (existingContractIndex !== -1) {
          state.contracts[existingContractIndex] = action.payload;
        } else {
          state.contracts.push(action.payload);
        }
      })
      .addCase(uploadContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
       .addCase(getOrderContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderContract.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContract = action.payload;
        
        // Thêm hoặc cập nhật hợp đồng trong danh sách
        const existingContractIndex = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        
        if (existingContractIndex !== -1) {
          state.contracts[existingContractIndex] = action.payload;
        } else {
          state.contracts.push(action.payload);
        }
      })
      .addCase(getOrderContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(discussContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(discussContract.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContract = action.payload;
        
        // Cập nhật hợp đồng trong danh sách
        const existingContractIndex = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        
        if (existingContractIndex !== -1) {
          state.contracts[existingContractIndex] = action.payload;
        } else {
          state.contracts.push(action.payload);
        }
      })
      .addCase(discussContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(uploadRevisedContract.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(uploadRevisedContract.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentContract = action.payload;
        
        // Cập nhật hợp đồng trong danh sách
        const existingContractIndex = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        
        if (existingContractIndex !== -1) {
          state.contracts[existingContractIndex] = action.payload;
        } else {
          state.contracts.push(action.payload);
        }
      })
      .addCase(uploadRevisedContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
       .addCase(uploadSignedContract.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(uploadSignedContract.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentContract = action.payload;
        
        // Cập nhật hợp đồng trong danh sách
        const existingContractIndex = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        
        if (existingContractIndex !== -1) {
          state.contracts[existingContractIndex] = action.payload;
        } else {
          state.contracts.push(action.payload);
        }
      })
      .addCase(uploadSignedContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
     
  },
});

export const { clearContractState, setCurrentContract } = contractSlice.actions;

// Selectors
export const selectContracts = (state) => state.contract.contracts;
export const selectCurrentContract = (state) => state.contract.currentContract;
export const selectContractLoading = (state) => state.contract.loading;
export const selectContractError = (state) => state.contract.error;
export const selectContractSuccess = (state) => state.contract.success;

export default contractSlice.reducer;