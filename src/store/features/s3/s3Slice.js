import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getImageFromS3 } from '../../../api/s3Service';

// Thunk to get image from S3
export const fetchImageFromS3 = createAsyncThunk(
  's3/fetchImage',
  async (key, { rejectWithValue }) => {
    try {
      const response = await getImageFromS3(key);

      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch image');
      }

      return {
        key,
        url: response.imageUrl
      };
    } catch (error) {
      return rejectWithValue(error.message || 'An unexpected error occurred');
    }
  }
);

const initialState = {
  images: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const s3Slice = createSlice({
  name: 's3',
  initialState,
  reducers: {
    clearImages: (state) => {
      state.images = {};
    },
    removeImage: (state, action) => {
      const key = action.payload;
      if (state.images[key]) {
        // If the image URL was created with URL.createObjectURL, we should revoke it
        URL.revokeObjectURL(state.images[key]);
        delete state.images[key];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchImageFromS3
      .addCase(fetchImageFromS3.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchImageFromS3.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Save the image URL with the key as index for easy lookup
        state.images[action.payload.key] = action.payload.url;
      })
      .addCase(fetchImageFromS3.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch image';
      });
  }
});

export const { clearImages, removeImage } = s3Slice.actions;

// Selectors
export const selectS3Image = (state, key) => state.s3.images[key];
export const selectS3Status = (state) => state.s3.status;
export const selectS3Error = (state) => state.s3.error;

export default s3Slice.reducer;