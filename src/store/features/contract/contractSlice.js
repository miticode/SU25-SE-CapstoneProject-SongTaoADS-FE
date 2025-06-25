import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  uploadOrderContractApi,
 
} from "../../../api/contractService";

// Contract status mapping
export const CONTRACT_STATUS_MAP = {
  SENT: { label: "Đã gửi", color: "info" },
  SIGNED: { label: "Đã ký", color: "success" },
  REJECTED: { label: "Từ chối", color: "error" },
  PENDING_REVIEW: { label: "Chờ xem xét", color: "warning" },
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