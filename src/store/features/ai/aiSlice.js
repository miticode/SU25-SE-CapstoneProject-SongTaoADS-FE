import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAIDesignApi,
  generateImageFromTextApi,
} from "../../../api/aiService";

// Tạo AI Design Thunk
export const createAIDesign = createAsyncThunk(
  "ai/createAIDesign",
  async (
    { customerDetailId, designTemplateId, customerNote, aiImage },
    { rejectWithValue }
  ) => {
    try {
      const response = await createAIDesignApi(
        customerDetailId,
        designTemplateId,
        customerNote,
        aiImage
      );

      if (!response.success) {
        return rejectWithValue(
          response.message || "Failed to create AI design"
        );
      }

      return response.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const generateImageFromText = createAsyncThunk(
  "ai/generateImageFromText",
  async ({ designTemplateId, prompt }, { rejectWithValue }) => {
    try {
      const response = await generateImageFromTextApi(designTemplateId, prompt);

      if (!response.success) {
        return rejectWithValue(
          response.message || "Failed to generate image from text"
        );
      }

      return {
        imageUrl: response.imageUrl,
        imageBlob: response.blob,
      };
    } catch (error) {
      return rejectWithValue(error.message || "An unexpected error occurred");
    }
  }
);

const initialState = {
  currentAIDesign: null,
  generatedImage: null,
  // generatedImageBlob: null,
  status: "idle",
  imageGenerationStatus: "idle",
  error: null,
  imageGenerationError: null,
};

// Slice
const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    resetAIStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    resetImageGeneration: (state) => {
      state.imageGenerationStatus = "idle";
      state.imageGenerationError = null;
      state.generatedImage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAIDesign.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createAIDesign.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentAIDesign = action.payload;
      })
      .addCase(createAIDesign.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(generateImageFromText.pending, (state) => {
        state.imageGenerationStatus = "loading";
        state.imageGenerationError = null;
      })
      .addCase(generateImageFromText.fulfilled, (state, action) => {
        state.imageGenerationStatus = "succeeded";
        // Only store the URL, not the Blob
        state.generatedImage = action.payload.imageUrl;
      })
      .addCase(generateImageFromText.rejected, (state, action) => {
        state.imageGenerationStatus = "failed";
        state.imageGenerationError = action.payload;
      });
  },
});

export const { resetAIStatus } = aiSlice.actions;

// Selectors
export const selectCurrentAIDesign = (state) => state.ai.currentAIDesign;
export const selectAIStatus = (state) => state.ai.status;
export const selectAIError = (state) => state.ai.error;

export const selectGeneratedImage = (state) => state.ai.generatedImage;
export const selectGeneratedImageBlob = (state) => state.ai.generatedImageBlob;
export const selectImageGenerationStatus = (state) =>
  state.ai.imageGenerationStatus;
export const selectImageGenerationError = (state) =>
  state.ai.imageGenerationError;

export default aiSlice.reducer;
