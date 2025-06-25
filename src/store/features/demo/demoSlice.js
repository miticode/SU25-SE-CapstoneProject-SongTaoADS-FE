import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getDemoDesignsApi,
  createDemoDesignApi,
  rejectDemoDesignApi,
  updateDemoDesignImageApi,
  updateDemoDesignFeedbackImagesApi,
  updateDemoDesignDescriptionApi,
  approveDemoDesignApi,
  deleteDemoDesignApi
} from '../../../api/demoService';

// Initial state
const initialState = {
  demoDesigns: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  actionStatus: 'idle',
  actionError: null,
};

// 1. Lấy lịch sử demo theo request
export const getDemoDesigns = createAsyncThunk(
  'demo/getDemoDesigns',
  async (customDesignRequestId, { rejectWithValue }) => {
    const res = await getDemoDesignsApi(customDesignRequestId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// 2. Designer gửi bản demo cho khách hàng
export const createDemoDesign = createAsyncThunk(
  'demo/createDemoDesign',
  async ({ customDesignRequestId, data }, { rejectWithValue }) => {
    const res = await createDemoDesignApi(customDesignRequestId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// 3. Khách hàng từ chối bản demo
export const rejectDemoDesign = createAsyncThunk(
  'demo/rejectDemoDesign',
  async (customDesignId, { rejectWithValue }) => {
    const res = await rejectDemoDesignApi(customDesignId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// 4. Designer cập nhật lại hình ảnh demo
export const updateDemoDesignImage = createAsyncThunk(
  'demo/updateDemoDesignImage',
  async ({ customDesignId, data }, { rejectWithValue }) => {
    const res = await updateDemoDesignImageApi(customDesignId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// 5. Khách hàng gửi hình ảnh feedback
export const updateDemoDesignFeedbackImages = createAsyncThunk(
  'demo/updateDemoDesignFeedbackImages',
  async ({ customDesignId, data }, { rejectWithValue }) => {
    const res = await updateDemoDesignFeedbackImagesApi(customDesignId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// 6. Designer cập nhật lại miêu tả cho bản thiết kế
export const updateDemoDesignDescription = createAsyncThunk(
  'demo/updateDemoDesignDescription',
  async ({ customDesignId, data }, { rejectWithValue }) => {
    const res = await updateDemoDesignDescriptionApi(customDesignId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// 7. Khách hàng chấp nhận bản demo
export const approveDemoDesign = createAsyncThunk(
  'demo/approveDemoDesign',
  async (customDesignId, { rejectWithValue }) => {
    const res = await approveDemoDesignApi(customDesignId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// 8. Xóa cứng bản demo
export const deleteDemoDesign = createAsyncThunk(
  'demo/deleteDemoDesign',
  async (demoDesignId, { rejectWithValue }) => {
    const res = await deleteDemoDesignApi(demoDesignId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

const demoSlice = createSlice({
  name: 'demo',
  initialState,
  reducers: {
    resetDemoStatus: (state) => {
      state.status = 'idle';
      state.error = null;
      state.actionStatus = 'idle';
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Lấy lịch sử demo
      .addCase(getDemoDesigns.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getDemoDesigns.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.demoDesigns = action.payload;
      })
      .addCase(getDemoDesigns.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Action chung cho các thao tác
      .addCase(createDemoDesign.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(createDemoDesign.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.demoDesigns.push(action.payload);
      })
      .addCase(createDemoDesign.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      .addCase(rejectDemoDesign.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(rejectDemoDesign.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        // Cập nhật trạng thái demo trong mảng nếu cần
      })
      .addCase(rejectDemoDesign.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      .addCase(updateDemoDesignImage.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(updateDemoDesignImage.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
      })
      .addCase(updateDemoDesignImage.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      .addCase(updateDemoDesignFeedbackImages.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(updateDemoDesignFeedbackImages.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
      })
      .addCase(updateDemoDesignFeedbackImages.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      .addCase(updateDemoDesignDescription.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(updateDemoDesignDescription.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
      })
      .addCase(updateDemoDesignDescription.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      .addCase(approveDemoDesign.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(approveDemoDesign.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
      })
      .addCase(approveDemoDesign.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      .addCase(deleteDemoDesign.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(deleteDemoDesign.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        // Xóa demo khỏi mảng nếu cần
        state.demoDesigns = state.demoDesigns.filter(d => d.id !== action.meta.arg);
      })
      .addCase(deleteDemoDesign.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      });
  },
});

export const { resetDemoStatus } = demoSlice.actions;
export default demoSlice.reducer;

// Selectors
export const selectDemoDesigns = (state) => state.demo.demoDesigns;
export const selectDemoStatus = (state) => state.demo.status;
export const selectDemoError = (state) => state.demo.error;
export const selectDemoActionStatus = (state) => state.demo.actionStatus;
export const selectDemoActionError = (state) => state.demo.actionError;
