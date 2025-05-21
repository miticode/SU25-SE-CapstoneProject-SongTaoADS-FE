import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createCustomerApi,
  getCustomerChoiceDetailApi,
  linkAttributeValueToCustomerChoiceApi,
  linkCustomerToProductTypeApi,
  linkSizeToCustomerChoiceApi,
} from "../../../api/customerService";

// Initial state
const initialState = {
  currentCustomer: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  attributeValuesStatus: "idle",
  sizesStatus: "idle",
  customerChoiceDetails: {}, // Store choice details by attributeId
  customerChoiceDetailsStatus: "idle",
};

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData, { rejectWithValue }) => {
    const response = await createCustomerApi(customerData);
    if (!response.success) {
      return rejectWithValue(response.error || "Failed to create customer");
    }
    return response.data;
  }
);
export const linkCustomerToProductType = createAsyncThunk(
  "customers/linkProductType",
  async ({ customerId, productTypeId }, { rejectWithValue }) => {
    try {
      const response = await linkCustomerToProductTypeApi(
        customerId,
        productTypeId
      );

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to link customer to product type"
        );
      }

      return response.result;
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error occurred");
    }
  }
);
export const linkAttributeValueToCustomerChoice = createAsyncThunk(
  "customers/linkAttributeValue",
  async ({ customerChoiceId, attributeValueId, attributeId }, { dispatch, rejectWithValue }) => {
    try {
      console.log(`Linking attribute value ${attributeValueId} for customer choice ${customerChoiceId}`);
      
      const response = await linkAttributeValueToCustomerChoiceApi(
        customerChoiceId,
        attributeValueId
      );

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to link attribute value to customer choice"
        );
      }

      // If successful and we have a result ID, fetch the customer choice detail
      if (response.result && response.result.id) {
        console.log(`Successfully linked attribute, now fetching details for: ${response.result.id}`);
        dispatch(fetchCustomerChoiceDetail({
          customerChoiceDetailId: response.result.id,
          attributeId
        }));
      }

      return { ...response.result, attributeId };
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error occurred");
    }
  }
);
export const linkSizeToCustomerChoice = createAsyncThunk(
  "customers/linkSize",
  async ({ customerChoiceId, sizeId, sizeValue }, { rejectWithValue }) => {
    try {
      console.log(
        `Thunk received: customerChoiceId=${customerChoiceId}, sizeId=${sizeId}, sizeValue=${sizeValue}`
      );

      // Ensure sizeValue is numeric
      const numericSizeValue = parseFloat(sizeValue);
      const response = await linkSizeToCustomerChoiceApi(
        customerChoiceId,
        sizeId,
        numericSizeValue
      );

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to link size to customer choice"
        );
      }

      return response.result;
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error occurred");
    }
  }
);
// Add a new thunk to fetch customer choice detail
export const fetchCustomerChoiceDetail = createAsyncThunk(
  "customers/fetchChoiceDetail",
  async ({ customerChoiceDetailId, attributeId }, { rejectWithValue }) => {
    try {
      // Pass only the ID string, not the whole object
      const response = await getCustomerChoiceDetailApi(customerChoiceDetailId);

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to fetch customer choice detail"
        );
      }

      return { ...response.result, attributeId };
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error occurred");
    }
  }
);

// Slice
const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    resetCustomerStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
    },
    resetCustomerChoiceStatus: (state) => {
      state.attributeValuesStatus = "idle";
      state.sizesStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentCustomer = action.payload;
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Link customer to product type
      .addCase(linkCustomerToProductType.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(linkCustomerToProductType.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(linkCustomerToProductType.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Link attribute value to customer choice
      .addCase(linkAttributeValueToCustomerChoice.pending, (state) => {
        state.attributeValuesStatus = "loading";
        state.error = null;
      })
      .addCase(linkAttributeValueToCustomerChoice.fulfilled, (state) => {
        state.attributeValuesStatus = "succeeded";
        state.error = null;
      })
      .addCase(linkAttributeValueToCustomerChoice.rejected, (state, action) => {
        state.attributeValuesStatus = "failed";
        state.error = action.payload;
      })

      // Link size to customer choice
      .addCase(linkSizeToCustomerChoice.pending, (state) => {
        state.sizesStatus = "loading";
        state.error = null;
      })
      .addCase(linkSizeToCustomerChoice.fulfilled, (state) => {
        state.sizesStatus = "succeeded";
        state.error = null;
      })
      .addCase(linkSizeToCustomerChoice.rejected, (state, action) => {
        state.sizesStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCustomerChoiceDetail.pending, (state) => {
        state.customerChoiceDetailsStatus = "loading";
      })
      .addCase(fetchCustomerChoiceDetail.fulfilled, (state, action) => {
        state.customerChoiceDetailsStatus = "succeeded";
        
        // Store the details by attribute ID
        if (action.payload.attributeId) {
          state.customerChoiceDetails[action.payload.attributeId] = action.payload;
        }
      })
      .addCase(fetchCustomerChoiceDetail.rejected, (state, action) => {
        state.customerChoiceDetailsStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetCustomerStatus, setCurrentCustomer } =
  customerSlice.actions;

// Selectors
export const selectCurrentCustomer = (state) =>
  state.customers?.currentCustomer;
export const selectCustomerStatus = (state) =>
  state.customers?.status || "idle";
export const selectCustomerError = (state) => state.customers?.error;
export const selectCurrentOrder = (state) => state.customers?.currentOrder;
export const selectAttributeValuesStatus = (state) =>
  state.customers?.attributeValuesStatus || "idle";
export const selectSizesStatus = (state) =>
  state.customers?.sizesStatus || "idle";
export const selectCustomerChoiceDetails = (state) => 
  state.customers?.customerChoiceDetails || {};
export default customerSlice.reducer;
