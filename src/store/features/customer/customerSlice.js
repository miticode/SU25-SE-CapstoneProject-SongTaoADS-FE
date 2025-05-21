import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createCustomerApi,
  deleteCustomerChoiceApi,
  getCustomerChoiceDetailApi,
  getCustomerDetailByUserIdApi,
  linkAttributeValueToCustomerChoiceApi,
  linkCustomerToProductTypeApi,
  linkSizeToCustomerChoiceApi,
  updateCustomerChoiceDetailApi,
  updateCustomerDetailApi,
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
  async (
    { customerChoiceId, attributeValueId, attributeId },
    { dispatch, rejectWithValue }
  ) => {
    try {
      console.log(
        `Linking attribute value ${attributeValueId} for customer choice ${customerChoiceId}`
      );

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
        console.log(
          `Successfully linked attribute, now fetching details for: ${response.result.id}`
        );
        dispatch(
          fetchCustomerChoiceDetail({
            customerChoiceDetailId: response.result.id,
            attributeId,
          })
        );
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
export const deleteCustomerChoice = createAsyncThunk(
  "customers/deleteCustomerChoice",
  async (customerChoiceId, { rejectWithValue }) => {
    try {
      const response = await deleteCustomerChoiceApi(customerChoiceId);

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to delete customer choice"
        );
      }

      return customerChoiceId;
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error occurred");
    }
  }
);
export const updateCustomerChoiceDetail = createAsyncThunk(
  "customers/updateChoiceDetail",
  async (
    { customerChoiceDetailId, attributeValueId, attributeId },
    { dispatch, rejectWithValue }
  ) => {
    try {
      console.log(
        `Updating customer choice detail ${customerChoiceDetailId} with attribute value ${attributeValueId}`
      );

      const response = await updateCustomerChoiceDetailApi(
        customerChoiceDetailId,
        attributeValueId
      );

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to update customer choice detail"
        );
      }

      // If successful, fetch the updated customer choice detail
      if (response.result && response.result.id) {
        console.log(
          `Successfully updated choice detail, now fetching updated details for: ${response.result.id}`
        );
        dispatch(
          fetchCustomerChoiceDetail({
            customerChoiceDetailId: response.result.id,
            attributeId,
          })
        );
      }

      return { ...response.result, attributeId };
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error occurred");
    }
  }
);
export const updateCustomerDetail = createAsyncThunk(
  "customers/updateCustomerDetail",
  async ({ customerDetailId, customerData }, { rejectWithValue }) => {
    const response = await updateCustomerDetailApi(
      customerDetailId,
      customerData
    );
    if (!response.success) {
      return rejectWithValue(
        response.error || "Failed to update customer detail"
      );
    }
    return response.data;
  }
);

export const fetchCustomerDetailByUserId = createAsyncThunk(
  "customers/fetchDetailByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getCustomerDetailByUserIdApi(userId);

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to fetch customer detail"
        );
      }

      return response.result;
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
          state.customerChoiceDetails[action.payload.attributeId] =
            action.payload;
        }
      })
      .addCase(fetchCustomerChoiceDetail.rejected, (state, action) => {
        state.customerChoiceDetailsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(deleteCustomerChoice.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteCustomerChoice.fulfilled, (state) => {
        state.status = "succeeded";
        state.currentOrder = null; // Reset current order after deletion
        state.error = null;
        // Also reset customer choice details
        state.customerChoiceDetails = {};
      })
      .addCase(deleteCustomerChoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateCustomerChoiceDetail.pending, (state) => {
        state.attributeValuesStatus = "loading";
        state.error = null;
      })
      .addCase(updateCustomerChoiceDetail.fulfilled, (state) => {
        state.attributeValuesStatus = "succeeded";
        state.error = null;
      })
      .addCase(updateCustomerChoiceDetail.rejected, (state, action) => {
        state.attributeValuesStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCustomerDetailByUserId.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomerDetailByUserId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customerDetail = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomerDetailByUserId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateCustomerDetail.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateCustomerDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customerDetail = action.payload;
        state.error = null;
      })
      .addCase(updateCustomerDetail.rejected, (state, action) => {
        state.status = "failed";
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
export const selectCustomerDetail = (state) => state.customers?.customerDetail
export default customerSlice.reducer;
