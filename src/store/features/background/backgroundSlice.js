import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createEditedDesignWithBackground,
  fetchBackgroundSuggestionsByCustomerChoiceIdApi,
  fetchBackgroundsByAttributeValueIdApi,
  createBackgroundByAttributeValueIdApi,
  updateBackgroundInfoApi,
  updateBackgroundImageApi,
  fetchAllBackgroundsApi,
  deleteBackgroundByIdApi,
  fetchEditedDesignByIdApi,
  createBackgroundExtrasApi
} from "../../../api/backgroundService";

// Initial state
const initialState = {
  backgroundSuggestions: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedBackground: null,
  // Thêm state cho edited design
  editedDesign: null,
  editedDesignStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  editedDesignError: null,
  // Thêm state cho edited design detail
  editedDesignDetail: null,
  editedDesignDetailStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  editedDesignDetailError: null,
  // Thêm state cho background extras
  backgroundExtras: null,
  backgroundExtrasStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  backgroundExtrasError: null,
};

// Async thunk for fetching background suggestions by customer choice ID
export const fetchBackgroundSuggestionsByCustomerChoiceId = createAsyncThunk(
  "background/fetchSuggestionsByCustomerChoiceId",
  async (customerChoiceId, { rejectWithValue }) => {
    try {
      console.log(
        "Fetching background suggestions for customer choice:",
        customerChoiceId
      );

      const response = await fetchBackgroundSuggestionsByCustomerChoiceIdApi(
        customerChoiceId
      );

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to fetch background suggestions"
        );
      }

      console.log(
        "Background suggestions fetched successfully:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Error in background suggestions thunk:", error);
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);
export const createEditedDesignWithBackgroundThunk = createAsyncThunk(
  "background/createEditedDesign",
  async (
    { customerDetailId, backgroundId, customerNote, editedImageFile },
    { rejectWithValue }
  ) => {
    try {
      console.log("Creating edited design with background:", {
        customerDetailId,
        backgroundId,
        customerNote,
        hasFile: !!editedImageFile,
      });

      // Tạo FormData
      const formData = new FormData();

      if (customerNote) {
        formData.append("customerNote", customerNote);
      }

      if (editedImageFile) {
        formData.append("editedImage", editedImageFile);
      }

      const response = await createEditedDesignWithBackground(
        customerDetailId,
        backgroundId,
        formData
      );

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to create edited design"
        );
      }

      console.log("Edited design created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in create edited design thunk:", error);
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// Async thunk for fetching edited design by ID
export const fetchEditedDesignById = createAsyncThunk(
  "background/fetchEditedDesignById",
  async (editedDesignId, { rejectWithValue }) => {
    try {
      console.log("Fetching edited design by ID:", editedDesignId);

      const response = await fetchEditedDesignByIdApi(editedDesignId);

      if (!response.success) {
        return rejectWithValue(
          response.error || "Failed to fetch edited design"
        );
      }

      console.log("Edited design fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in fetch edited design by ID thunk:", error);
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);
// Thunk lấy tất cả background
export const fetchAllBackgrounds = createAsyncThunk(
  "background/fetchAllBackgrounds",
  async (_, { rejectWithValue }) => {
    const response = await fetchAllBackgroundsApi();
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);
// Thunk lấy background theo giá trị thuộc tính
export const fetchBackgroundsByAttributeValueId = createAsyncThunk(
  "background/fetchBackgroundsByAttributeValueId",
  async (attributeValueId, { rejectWithValue }) => {
    const response = await fetchBackgroundsByAttributeValueIdApi(attributeValueId);
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);
// Thunk tạo background mới
export const createBackgroundByAttributeValueId = createAsyncThunk(
  "background/createBackgroundByAttributeValueId",
  async ({ attributeValueId, name, description, backgroundImage }, { rejectWithValue }) => {
    const response = await createBackgroundByAttributeValueIdApi(attributeValueId, { name, description, backgroundImage });
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);
// Thunk cập nhật thông tin background
export const updateBackgroundInfo = createAsyncThunk(
  "background/updateBackgroundInfo",
  async ({ backgroundId, name, description, isAvailable }, { rejectWithValue }) => {
    const response = await updateBackgroundInfoApi(backgroundId, { name, description, isAvailable });
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);
// Thunk cập nhật hình ảnh background
export const updateBackgroundImage = createAsyncThunk(
  "background/updateBackgroundImage",
  async ({ backgroundId, file }, { rejectWithValue }) => {
    const response = await updateBackgroundImageApi(backgroundId, file);
    if (!response.success) return rejectWithValue(response.error);
    return response.data;
  }
);
// Thunk xóa background
export const deleteBackgroundById = createAsyncThunk(
  "background/deleteBackgroundById",
  async (backgroundId, { rejectWithValue }) => {
    const response = await deleteBackgroundByIdApi(backgroundId);
    if (!response.success) return rejectWithValue(response.error);
    return { id: backgroundId };
  }
);

// Thunk tạo background extras
export const createBackgroundExtras = createAsyncThunk(
  "background/createBackgroundExtras",
  async ({ backgroundId, width = 512, height = 512 }, { rejectWithValue }) => {
    try {
      console.log("Creating background extras:", { backgroundId, width, height });

      const response = await createBackgroundExtrasApi(backgroundId, width, height);

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to create background extras");
      }

      console.log("Background extras created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in create background extras thunk:", error);
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);
// Background slice
const backgroundSlice = createSlice({
  name: "background",
  initialState,
  reducers: {
    // Reset status when needed
    resetBackgroundStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    // Set a selected background for preview or editing
    setSelectedBackground: (state, action) => {
      state.selectedBackground = action.payload;
      console.log("Selected background set:", action.payload);
    },
    // Clear selected background
    clearSelectedBackground: (state) => {
      state.selectedBackground = null;
      console.log("Selected background cleared");
    },
    // Clear all background suggestions
    clearBackgroundSuggestions: (state) => {
      state.backgroundSuggestions = [];
      state.status = "idle";
      state.error = null;
      console.log("Background suggestions cleared");
    },
    resetEditedDesignStatus: (state) => {
      state.editedDesignStatus = "idle";
      state.editedDesignError = null;
    },
    clearEditedDesign: (state) => {
      state.editedDesign = null;
      state.editedDesignStatus = "idle";
      state.editedDesignError = null;
    },
    // Reset và clear edited design detail
    resetEditedDesignDetailStatus: (state) => {
      state.editedDesignDetailStatus = "idle";
      state.editedDesignDetailError = null;
    },
    clearEditedDesignDetail: (state) => {
      state.editedDesignDetail = null;
      state.editedDesignDetailStatus = "idle";
      state.editedDesignDetailError = null;
    },
    // Reset và clear background extras
    resetBackgroundExtrasStatus: (state) => {
      state.backgroundExtrasStatus = "idle";
      state.backgroundExtrasError = null;
    },
    clearBackgroundExtras: (state) => {
      state.backgroundExtras = null;
      state.backgroundExtrasStatus = "idle";
      state.backgroundExtrasError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch background suggestions cases
      .addCase(
        fetchBackgroundSuggestionsByCustomerChoiceId.pending,
        (state) => {
          state.status = "loading";
          state.error = null;
          console.log("Fetching background suggestions...");
        }
      )
      .addCase(
        fetchBackgroundSuggestionsByCustomerChoiceId.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.backgroundSuggestions = action.payload;
          state.error = null;
          console.log(
            "Background suggestions loaded successfully:",
            action.payload.length,
            "items"
          );
        }
      )
      .addCase(
        fetchBackgroundSuggestionsByCustomerChoiceId.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
          state.backgroundSuggestions = [];
          console.error(
            "Failed to fetch background suggestions:",
            action.payload
          );
        }
      )
      .addCase(createEditedDesignWithBackgroundThunk.pending, (state) => {
        state.editedDesignStatus = "loading";
        state.editedDesignError = null;
        console.log("Creating edited design...");
      })
      .addCase(
        createEditedDesignWithBackgroundThunk.fulfilled,
        (state, action) => {
          state.editedDesignStatus = "succeeded";
          state.editedDesign = action.payload;
          state.editedDesignError = null;
          console.log("Edited design created successfully:", action.payload);
        }
      )
      .addCase(
        createEditedDesignWithBackgroundThunk.rejected,
        (state, action) => {
          state.editedDesignStatus = "failed";
          state.editedDesignError = action.payload;
          console.error("Failed to create edited design:", action.payload);
        }
      )
      // Fetch edited design by ID cases
      .addCase(fetchEditedDesignById.pending, (state) => {
        state.editedDesignDetailStatus = "loading";
        state.editedDesignDetailError = null;
        console.log("Fetching edited design by ID...");
      })
      .addCase(fetchEditedDesignById.fulfilled, (state, action) => {
        state.editedDesignDetailStatus = "succeeded";
        state.editedDesignDetail = action.payload;
        state.editedDesignDetailError = null;
        console.log("Edited design fetched successfully:", action.payload);
      })
      .addCase(fetchEditedDesignById.rejected, (state, action) => {
        state.editedDesignDetailStatus = "failed";
        state.editedDesignDetailError = action.payload;
        console.error("Failed to fetch edited design:", action.payload);
      })
      // Lấy background theo giá trị thuộc tính
      .addCase(fetchBackgroundsByAttributeValueId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBackgroundsByAttributeValueId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.backgroundSuggestions = action.payload;
        state.error = null;
        // Có thể lưu pagination nếu cần: state.pagination = action.payload.pagination;
      })
      .addCase(fetchBackgroundsByAttributeValueId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Tạo background
      .addCase(createBackgroundByAttributeValueId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createBackgroundByAttributeValueId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.backgroundSuggestions.push(action.payload);
        state.error = null;
      })
      .addCase(createBackgroundByAttributeValueId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Cập nhật thông tin background
      .addCase(updateBackgroundInfo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateBackgroundInfo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const idx = state.backgroundSuggestions.findIndex(bg => bg.id === action.payload.id);
        if (idx !== -1) state.backgroundSuggestions[idx] = action.payload;
        state.error = null;
      })
      .addCase(updateBackgroundInfo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Cập nhật hình ảnh background
      .addCase(updateBackgroundImage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateBackgroundImage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const idx = state.backgroundSuggestions.findIndex(bg => bg.id === action.payload.id);
        if (idx !== -1) state.backgroundSuggestions[idx] = action.payload;
        state.error = null;
      })
      .addCase(updateBackgroundImage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Lấy tất cả background
      .addCase(fetchAllBackgrounds.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllBackgrounds.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.backgroundSuggestions = action.payload;
        state.error = null;
      })
      .addCase(fetchAllBackgrounds.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Xóa background
      .addCase(deleteBackgroundById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteBackgroundById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.backgroundSuggestions = state.backgroundSuggestions.filter(bg => bg.id !== action.payload.id);
        state.error = null;
      })
      .addCase(deleteBackgroundById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Tạo background extras
      .addCase(createBackgroundExtras.pending, (state) => {
        state.backgroundExtrasStatus = 'loading';
        state.backgroundExtrasError = null;
        console.log("Creating background extras...");
      })
      .addCase(createBackgroundExtras.fulfilled, (state, action) => {
        state.backgroundExtrasStatus = 'succeeded';
        state.backgroundExtras = action.payload;
        state.backgroundExtrasError = null;
        console.log("Background extras created successfully:", action.payload);
      })
      .addCase(createBackgroundExtras.rejected, (state, action) => {
        state.backgroundExtrasStatus = 'failed';
        state.backgroundExtrasError = action.payload;
        console.error("Failed to create background extras:", action.payload);
      });
  },
});

// Export actions
export const {
  resetBackgroundStatus,
  setSelectedBackground,
  clearSelectedBackground,
  clearBackgroundSuggestions,
  resetEditedDesignStatus,
  clearEditedDesign,
  resetEditedDesignDetailStatus,
  clearEditedDesignDetail,
  resetBackgroundExtrasStatus,
  clearBackgroundExtras,
} = backgroundSlice.actions;

// Export selectors
export const selectAllBackgroundSuggestions = (state) =>
  state.background.backgroundSuggestions;
export const selectBackgroundStatus = (state) => state.background.status;
export const selectBackgroundError = (state) => state.background.error;
export const selectSelectedBackground = (state) =>
  state.background.selectedBackground;

// Helper selectors
export const selectAvailableBackgrounds = (state) =>
  state.background.backgroundSuggestions.filter((bg) => bg.isAvailable);

export const selectBackgroundById = (state, backgroundId) =>
  state.background.backgroundSuggestions.find((bg) => bg.id === backgroundId);
export const selectEditedDesign = (state) => state.background.editedDesign;
export const selectEditedDesignStatus = (state) =>
  state.background.editedDesignStatus;
export const selectEditedDesignError = (state) =>
  state.background.editedDesignError;

// Selectors cho edited design detail
export const selectEditedDesignDetail = (state) => state.background.editedDesignDetail;
export const selectEditedDesignDetailStatus = (state) =>
  state.background.editedDesignDetailStatus;
export const selectEditedDesignDetailError = (state) =>
  state.background.editedDesignDetailError;

// Selectors cho background extras
export const selectBackgroundExtras = (state) => state.background.backgroundExtras;
export const selectBackgroundExtrasStatus = (state) =>
  state.background.backgroundExtrasStatus;
export const selectBackgroundExtrasError = (state) =>
  state.background.backgroundExtrasError;

export default backgroundSlice.reducer;
