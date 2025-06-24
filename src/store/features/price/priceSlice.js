import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPriceProposals,
  createPriceProposal,
  updatePriceProposalPricing,
  offerPriceProposal,
  approvePriceProposal,
} from "../../../api/priceService";

const initialState = {
  proposals: [],
  status: "idle",
  error: null,
  actionStatus: "idle",
  actionError: null,
};

export const fetchPriceProposals = createAsyncThunk(
  "price/fetchPriceProposals",
  async (customDesignRequestId, { rejectWithValue }) => {
    const res = await getPriceProposals(customDesignRequestId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

export const createProposal = createAsyncThunk(
  "price/createProposal",
  async ({ customDesignRequestId, data }, { rejectWithValue }) => {
    const res = await createPriceProposal(customDesignRequestId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

export const updateProposalPricing = createAsyncThunk(
  "price/updateProposalPricing",
  async ({ priceProposalId, data }, { rejectWithValue }) => {
    const res = await updatePriceProposalPricing(priceProposalId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

export const offerProposal = createAsyncThunk(
  "price/offerProposal",
  async ({ priceProposalId, data }, { rejectWithValue }) => {
    const res = await offerPriceProposal(priceProposalId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

export const approveProposal = createAsyncThunk(
  "price/approveProposal",
  async (priceProposalId, { rejectWithValue }) => {
    const res = await approvePriceProposal(priceProposalId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

const priceSlice = createSlice({
  name: "price",
  initialState,
  reducers: {
    resetPriceStatus: (state) => {
      state.status = "idle";
      state.error = null;
      state.actionStatus = "idle";
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch proposals
      .addCase(fetchPriceProposals.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPriceProposals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.proposals = action.payload;
      })
      .addCase(fetchPriceProposals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create proposal
      .addCase(createProposal.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.proposals.push(action.payload);
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload;
      })
      // Update pricing
      .addCase(updateProposalPricing.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(updateProposalPricing.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        // Cập nhật proposal trong mảng
        const idx = state.proposals.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.proposals[idx] = action.payload;
      })
      .addCase(updateProposalPricing.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload;
      })
      // Offer proposal
      .addCase(offerProposal.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(offerProposal.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        // Cập nhật proposal trong mảng
        const idx = state.proposals.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.proposals[idx] = action.payload;
      })
      .addCase(offerProposal.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload;
      })
      // Approve proposal
      .addCase(approveProposal.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(approveProposal.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        // Cập nhật proposal trong mảng
        const idx = state.proposals.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.proposals[idx] = action.payload;
      })
      .addCase(approveProposal.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload;
      });
  },
});

export const { resetPriceStatus } = priceSlice.actions;
export default priceSlice.reducer;

// Selectors
export const selectPriceProposals = (state) => state.price.proposals;
export const selectPriceStatus = (state) => state.price.status;
export const selectPriceError = (state) => state.price.error;
export const selectPriceActionStatus = (state) => state.price.actionStatus;
export const selectPriceActionError = (state) => state.price.actionError;
