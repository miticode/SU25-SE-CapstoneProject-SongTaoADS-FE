import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createCustomerApi,
  deleteCustomerChoiceApi,
  fetchCustomerChoiceApi,
  fetchCustomerChoiceDetailsApi,
  getCustomerChoiceDetailApi,
  getCustomerDetailByUserIdApi,
  linkAttributeValueToCustomerChoiceApi,
  linkCustomerToProductTypeApi,
  linkSizeToCustomerChoiceApi,
  updateCustomerChoiceDetailApi,
  updateCustomerChoiceSizeApi,
  updateCustomerDetailApi,
} from "../../../api/customerService";

const initialState = {
  currentCustomer: null,
  status: "idle",
  error: null,
  attributeValuesStatus: "idle",
  sizesStatus: "idle",
  customerChoiceDetails: {},
  customerChoiceDetailsStatus: "idle",
  totalAmount: 0,
  fetchCustomerChoiceStatus: "idle",
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
        // Check if the error is about attribute already existing
        if (response.error && response.error.includes("Attribute existed")) {
          console.log("Attribute already exists, fetching all details");
          // Dispatch an action to fetch all customer choice details instead
          dispatch(fetchCustomerChoiceDetails(customerChoiceId));
          // Return with a special flag to indicate this was an expected "already exists" case
          return { attributeExists: true, attributeId };
        }

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
      // Check specifically for the "attribute already exists" error
      if (error.response?.data?.message?.includes("Attribute existed")) {
        console.log("Attribute already exists, fetching all details");
        // Dispatch an action to fetch all customer choice details
        dispatch(fetchCustomerChoiceDetails(customerChoiceId));
        // Return with a special flag to indicate this was an expected "already exists" case
        return { attributeExists: true, attributeId };
      }

      return rejectWithValue(error.message || "Unknown error occurred");
    }
  }
);
export const linkSizeToCustomerChoice = createAsyncThunk(
  "customers/linkSize",
  async ({ customerChoiceId, sizeId, sizeValue }, { rejectWithValue }) => {
    try {
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
export const updateCustomerChoiceSize = createAsyncThunk(
  "customers/updateCustomerChoiceSize",
  async ({ customerChoiceSizeId, sizeValue }, { rejectWithValue }) => {
    try {
      const response = await updateCustomerChoiceSizeApi(
        customerChoiceSizeId,
        sizeValue
      );

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to update size value");
      }

      return response.result;
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error occurred");
    }
  }
);
export const fetchCustomerChoiceDetails = createAsyncThunk(
  "customers/fetchCustomerChoiceDetails",
  async (customerChoiceId, { rejectWithValue }) => {
    try {
      const response = await fetchCustomerChoiceDetailsApi(customerChoiceId);

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to fetch customer choice details"
        );
      }

      return response.result;
    } catch (error) {
      return rejectWithValue(error.message || "Unknown error occurred");
    }
  }
);
export const fetchCustomerChoice = createAsyncThunk(
  "customers/fetchCustomerChoice",
  async (customerChoiceId, { rejectWithValue }) => {
    try {
      const response = await fetchCustomerChoiceApi(customerChoiceId);

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to fetch customer choice"
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
    updateAttributeSubtotal: (state, action) => {
      const { attributeId, subTotal } = action.payload;

      if (state.customerChoiceDetails[attributeId]) {
        state.customerChoiceDetails[attributeId] = {
          ...state.customerChoiceDetails[attributeId],
          subTotal: subTotal,
        };
      }
    },
    resetCustomerChoiceDetails: (state) => {
      state.customerChoiceDetails = {};
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
      })
      .addCase(updateCustomerChoiceSize.pending, (state) => {
        state.sizesStatus = "loading";
        state.error = null;
      })
      .addCase(updateCustomerChoiceSize.fulfilled, (state) => {
        state.sizesStatus = "succeeded";
        state.error = null;
      })
      .addCase(updateCustomerChoiceSize.rejected, (state, action) => {
        state.sizesStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCustomerChoiceDetails.pending, (state) => {
        state.customerChoiceDetailsStatus = "loading";
      })
      .addCase(fetchCustomerChoiceDetails.fulfilled, (state, action) => {
        state.customerChoiceDetailsStatus = "succeeded";

        // Process the details and update the price information
        const details = action.payload;
        if (details && Array.isArray(details)) {
          // Create a fresh details map for each update, but preserve any existing data not in the response
          const detailsMap = { ...state.customerChoiceDetails };

          details.forEach((detail) => {
            // Use the attribute's ID from the attributeValue relationship as the key
            if (
              detail.attributeValueId &&
              detail.attributeValue &&
              detail.attributeValue.attributeId
            ) {
              const attributeId = detail.attributeValue.attributeId;
              detailsMap[attributeId] = {
                ...detailsMap[attributeId], // Giữ lại thông tin cũ
                ...detail,
                attributeId: attributeId,
                // Ensure subTotal is a number
                subTotal: detail.subTotal !== undefined ? detail.subTotal : 0,
              };
            }
          });

          console.log("Processing customer choice details:", details);
          console.log("Mapped attribute prices:", detailsMap);

          // Cập nhật state với dữ liệu mới nhưng vẫn giữ lại dữ liệu cũ
          state.customerChoiceDetails = detailsMap;
        }
      })
      .addCase(fetchCustomerChoiceDetails.rejected, (state, action) => {
        state.customerChoiceDetailsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCustomerChoice.pending, (state) => {
        state.fetchCustomerChoiceStatus = "loading";
      })
      .addCase(fetchCustomerChoice.fulfilled, (state, action) => {
        state.fetchCustomerChoiceStatus = "succeeded";
        state.totalAmount = action.payload.totalAmount;
        // Also update the current order with more details
        state.currentOrder = action.payload;
      })
      .addCase(fetchCustomerChoice.rejected, (state, action) => {
        state.fetchCustomerChoiceStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  resetCustomerStatus,
  setCurrentCustomer,
  resetCustomerChoiceStatus,
  updateAttributeSubtotal,
  resetCustomerChoiceDetails,
} = customerSlice.actions;

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
export const selectCustomerDetail = (state) => state.customers?.customerDetail;
export const selectTotalAmount = (state) => state.customers?.totalAmount || 0;
export const selectFetchCustomerChoiceStatus = (state) =>
  state.customers?.fetchCustomerChoiceStatus || "idle";
export default customerSlice.reducer;
