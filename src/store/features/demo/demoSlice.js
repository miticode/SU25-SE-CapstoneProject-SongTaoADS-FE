import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getDemoDesignsApi,
  createDemoDesignApi,
  rejectDemoDesignApi,
  updateDemoDesignImageApi,
  updateDemoDesignFeedbackImagesApi,
  updateDemoDesignDescriptionApi,
  approveDemoDesignApi,
  deleteDemoDesignApi,
  uploadDemoSubImagesApi,
  getDemoSubImagesApi,
  getCustomDesignRequestSubImagesApi,
  deleteDemoSubImageApi
} from '../../../api/demoService';

// Initial state
const initialState = {
  demoDesigns: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  actionStatus: 'idle',
  actionError: null,
  demoSubImages: {}, // Lưu sub-images theo từng demoId
  customDesignRequestSubImages: {}, // Lưu sub-images theo từng customDesignRequestId
};

//  Lấy lịch sử demo theo request
export const getDemoDesigns = createAsyncThunk(
  'demo/getDemoDesigns',
  async (customDesignRequestId, { rejectWithValue }) => {
    const res = await getDemoDesignsApi(customDesignRequestId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// Designer gửi bản demo cho khách hàng
export const createDemoDesign = createAsyncThunk(
  'demo/createDemoDesign',
  async ({ customDesignRequestId, data }, { rejectWithValue }) => {
    const res = await createDemoDesignApi(customDesignRequestId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// Khách hàng từ chối bản demo
export const rejectDemoDesign = createAsyncThunk(
  'demo/rejectDemoDesign',
  async ({ customDesignId, data }, { rejectWithValue }) => {
    const res = await rejectDemoDesignApi(customDesignId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

//  Designer cập nhật lại hình ảnh demo
export const updateDemoDesignImage = createAsyncThunk(
  'demo/updateDemoDesignImage',
  async ({ customDesignId, data }, { rejectWithValue }) => {
    const res = await updateDemoDesignImageApi(customDesignId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// Khách hàng gửi hình ảnh feedback
export const updateDemoDesignFeedbackImages = createAsyncThunk(
  'demo/updateDemoDesignFeedbackImages',
  async ({ customDesignId, data }, { rejectWithValue }) => {
    const res = await updateDemoDesignFeedbackImagesApi(customDesignId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

//  Designer cập nhật lại miêu tả cho bản thiết kế
export const updateDemoDesignDescription = createAsyncThunk(
  'demo/updateDemoDesignDescription',
  async ({ customDesignId, data }, { rejectWithValue }) => {
    const res = await updateDemoDesignDescriptionApi(customDesignId, data);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

//  Khách hàng chấp nhận bản demo
export const approveDemoDesign = createAsyncThunk(
  'demo/approveDemoDesign',
  async (customDesignId, { rejectWithValue }) => {
    const res = await approveDemoDesignApi(customDesignId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

//  Xóa cứng bản demo
export const deleteDemoDesign = createAsyncThunk(
  'demo/deleteDemoDesign',
  async (demoDesignId, { rejectWithValue }) => {
    const res = await deleteDemoDesignApi(demoDesignId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// Upload nhiều hình ảnh phụ cho bản demo
export const uploadDemoSubImages = createAsyncThunk(
  'demo/uploadDemoSubImages',
  async ({ customDesignId, files }, { rejectWithValue }) => {
    const res = await uploadDemoSubImagesApi(customDesignId, files);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);
// Lấy danh sách hình ảnh phụ của bản demo
export const getDemoSubImages = createAsyncThunk(
  'demo/getDemoSubImages',
  async (demoDesignId, { rejectWithValue }) => {
    const res = await getDemoSubImagesApi(demoDesignId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// Lấy danh sách hình ảnh phụ của bản thiết kế chính thức
export const getCustomDesignRequestSubImages = createAsyncThunk(
  'demo/getCustomDesignRequestSubImages',
  async (customDesignRequestId, { rejectWithValue }) => {
    const res = await getCustomDesignRequestSubImagesApi(customDesignRequestId);
    if (!res.success) return rejectWithValue(res.error);
    return res.result;
  }
);

// Xóa sub-image cụ thể của demo design
export const deleteDemoSubImage = createAsyncThunk(
  'demo/deleteDemoSubImage',
  async ({ customDesignId, subImageId }, { rejectWithValue }) => {
    const res = await deleteDemoSubImageApi(customDesignId, subImageId);
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
      .addCase(rejectDemoDesign.fulfilled, (state, _action) => {
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
        // Cập nhật demo trong mảng nếu cần
        const updatedDemo = action.payload;
        if (updatedDemo) {
          const index = state.demoDesigns.findIndex(d => d.id === updatedDemo.id);
          if (index !== -1) {
            state.demoDesigns[index] = { ...state.demoDesigns[index], ...updatedDemo };
          }
        }
      })
      .addCase(updateDemoDesignImage.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      .addCase(updateDemoDesignFeedbackImages.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(updateDemoDesignFeedbackImages.fulfilled, (state, _action) => {
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
        // Cập nhật demo trong mảng nếu cần
        const updatedDemo = action.payload;
        if (updatedDemo) {
          const index = state.demoDesigns.findIndex(d => d.id === updatedDemo.id);
          if (index !== -1) {
            state.demoDesigns[index] = { ...state.demoDesigns[index], ...updatedDemo };
          }
        }
      })
      .addCase(updateDemoDesignDescription.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      .addCase(approveDemoDesign.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(approveDemoDesign.fulfilled, (state, _action) => {
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
        // Xóa demo khỏi mảng
        const deletedDemoId = action.meta.arg;
        state.demoDesigns = state.demoDesigns.filter(d => d.id !== deletedDemoId);
        // Xóa sub-images của demo đã xóa
        if (state.demoSubImages[deletedDemoId]) {
          delete state.demoSubImages[deletedDemoId];
        }
      })
      .addCase(deleteDemoDesign.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      .addCase(uploadDemoSubImages.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(uploadDemoSubImages.fulfilled, (state, _action) => {
        state.actionStatus = 'succeeded';
        // Có thể lưu subImages vào state nếu cần
      })
      .addCase(uploadDemoSubImages.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })
      .addCase(getDemoSubImages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getDemoSubImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Lưu sub-images cho demoId tương ứng
        const demoId = action.meta.arg;
        state.demoSubImages[demoId] = action.payload;
      })
      .addCase(getDemoSubImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(getCustomDesignRequestSubImages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getCustomDesignRequestSubImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Lưu sub-images cho customDesignRequestId tương ứng
        const customDesignRequestId = action.meta.arg;
        state.customDesignRequestSubImages[customDesignRequestId] = action.payload;
      })
      .addCase(getCustomDesignRequestSubImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteDemoSubImage.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(deleteDemoSubImage.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        // Xóa sub-image cụ thể từ danh sách
        const { customDesignId, subImageId } = action.meta.arg;
        const subImages = state.customDesignRequestSubImages[customDesignId] || [];
        state.customDesignRequestSubImages[customDesignId] = subImages.filter(img => img.id !== subImageId);
      })
      .addCase(deleteDemoSubImage.rejected, (state, action) => {
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
// Selector lấy danh sách sub-images của demo theo demoId
export const selectDemoSubImages = (state, demoId) => state.demo.demoSubImages[demoId] || [];

// Selector lấy danh sách sub-images của custom design request theo customDesignRequestId
export const selectCustomDesignRequestSubImages = (state, customDesignRequestId) => state.demo.customDesignRequestSubImages[customDesignRequestId] || [];
