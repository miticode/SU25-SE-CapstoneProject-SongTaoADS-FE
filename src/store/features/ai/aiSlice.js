import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAIDesignApi,
  generateImageFromTextApi,
  checkStableDiffusionProgressApi,
} from "../../../api/aiService";

// Tạo AI Design Thunk
export const createAIDesign = createAsyncThunk(
  "ai/createAIDesign",
  async (
    { customerDetailId, designTemplateId, customerNote, editedImage }, // Đổi từ aiImage thành editedImage
    { rejectWithValue }
  ) => {
    try {
      console.log("Creating AI Design with params:", {
        customerDetailId,
        designTemplateId,
        customerNote,
        editedImage: editedImage ? "Image file provided" : "No image",
      });

      const response = await createAIDesignApi(
        customerDetailId,
        designTemplateId,
        customerNote,
        editedImage // Đổi từ aiImage thành editedImage
      );

      if (!response.success) {
        return rejectWithValue(
          response.message || "Failed to create AI design"
        );
      }

      console.log("AI Design created successfully:", response.result);
      return response.result;
    } catch (error) {
      console.error("Failed to create AI design:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const generateImageFromText = createAsyncThunk(
  "ai/generateImageFromText",
  async ({ designTemplateId, prompt, width = 512, height = 512 }, { rejectWithValue }) => {
    try {
      const response = await generateImageFromTextApi(designTemplateId, prompt, width, height);

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

// Kiểm tra tiến trình Stable Diffusion
export const checkStableDiffusionProgress = createAsyncThunk(
  "ai/checkStableDiffusionProgress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await checkStableDiffusionProgressApi();

      if (!response.success) {
        return rejectWithValue(
          response.message || "Failed to check Stable Diffusion progress"
        );
      }

      return response.result;
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
  progressCheckStatus: "idle",
  error: null,
  imageGenerationError: null,
  progressCheckError: null,
  currentDesignTemplate: null,
  currentBackground: null,
  stableDiffusionProgress: null,
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
    resetProgressCheck: (state) => {
      state.progressCheckStatus = "idle";
      state.progressCheckError = null;
      state.stableDiffusionProgress = null;
    },
   setCurrentAIDesign: (state, action) => {
      state.currentAIDesign = action.payload;
      console.log('Current AI Design set:', action.payload);
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

        // Lưu thêm thông tin từ response mới
        if (action.payload.editedImage) {
          state.generatedImage = action.payload.editedImage;
        }

        if (action.payload.designTemplates) {
          state.currentDesignTemplate = action.payload.designTemplates;
        }

        if (action.payload.backgrounds) {
          state.currentBackground = action.payload.backgrounds;
        }
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
      })
      .addCase(checkStableDiffusionProgress.pending, (state) => {
        state.progressCheckStatus = "loading";
        state.progressCheckError = null;
      })
      .addCase(checkStableDiffusionProgress.fulfilled, (state, action) => {
        state.progressCheckStatus = "succeeded";
        state.stableDiffusionProgress = action.payload;
      })
      .addCase(checkStableDiffusionProgress.rejected, (state, action) => {
        state.progressCheckStatus = "failed";
        state.progressCheckError = action.payload;
      });
  },
});

export const { resetAIStatus, setCurrentAIDesign, resetImageGeneration, resetProgressCheck } = aiSlice.actions;

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
export const selectCurrentDesignTemplate = (state) =>
  state.ai.currentDesignTemplate;
export const selectCurrentBackground = (state) => state.ai.currentBackground;
export const selectEditedImageUrl = (state) =>
  state.ai.currentAIDesign?.editedImage;

// Selectors cho Stable Diffusion Progress
export const selectStableDiffusionProgress = (state) => state.ai.stableDiffusionProgress;
export const selectProgressCheckStatus = (state) => state.ai.progressCheckStatus;
export const selectProgressCheckError = (state) => state.ai.progressCheckError;

export default aiSlice.reducer;
