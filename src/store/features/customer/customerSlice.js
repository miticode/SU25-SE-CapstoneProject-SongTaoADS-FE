import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createCustomerApi } from '../../../api/customerService';

// Initial state
const initialState = {
  currentCustomer: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    const response = await createCustomerApi(customerData);
    if (!response.success) {
      return rejectWithValue(response.error || 'Failed to create customer');
    }
    return response.data;
  }
);

// Slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    resetCustomerStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCustomer = action.payload;
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { resetCustomerStatus, setCurrentCustomer } = customerSlice.actions;

// Selectors
export const selectCurrentCustomer = (state) => state.customers?.currentCustomer;
export const selectCustomerStatus = (state) => state.customers?.status || 'idle';
export const selectCustomerError = (state) => state.customers?.error;

export default customerSlice.reducer;
