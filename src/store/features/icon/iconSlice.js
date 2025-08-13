import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchIconsApi,
  createIconApi,
  updateIconInfoApi,
  updateIconImageApi,
  deleteIconApi
} from "../../../api/iconService";

// Initial state
const initialState = {
  icons: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedIcon: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  },
  // States for individual icon fetch
  currentIcon: null,
  currentIconStatus: "idle",
  currentIconError: null,
};

// Async thunk for fetching all icons with pagination
export const fetchIcons = createAsyncThunk(
  "icon/fetchIcons",
  async ({ page = 1, size = 10 } = {}, { rejectWithValue }) => {
    try {
      console.log("Fetching icons with pagination:", { page, size });

      const response = await fetchIconsApi(page, size);

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to fetch icons");
      }

      console.log("Icons fetched successfully:", response.data.length, "items");
      return {
        icons: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error in fetch icons thunk:", error);
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const refreshIconPresignedUrls = createAsyncThunk(
  "icon/refreshIconPresignedUrls",
  async (iconIds, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const icons = state.icon.icons;
      const { getPresignedUrl } = await import("../../../api/s3Service");

      const updatedIcons = await Promise.all(
        icons.map(async (icon) => {
          if (iconIds.includes(icon.id) && icon.imageUrl) {
            try {
              console.log(`Refreshing presigned URL for icon ${icon.id}`);
              const result = await getPresignedUrl(icon.imageUrl, 60);

              if (result.success) {
                return {
                  ...icon,
                  presignedUrl: result.url,
                  fullImageUrl: result.url,
                };
              }
            } catch (error) {
              console.error(
                `Failed to refresh presigned URL for icon ${icon.id}:`,
                error
              );
            }
          }
          return icon;
        })
      );

      return updatedIcons;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk để tạo icon mới
export const createIcon = createAsyncThunk(
  "icon/createIcon",
  async (formData, { rejectWithValue }) => {
    try {
      console.log("Creating new icon with formData:", formData);

      const response = await createIconApi(formData);

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to create icon");
      }

      console.log("Icon created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in create icon thunk:", error);
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// Async thunk để cập nhật thông tin icon
export const updateIconInfo = createAsyncThunk(
  "icon/updateIconInfo",
  async ({ iconId, updateData }, { rejectWithValue }) => {
    try {
      console.log(`Updating icon ${iconId} with data:`, updateData);

      const response = await updateIconInfoApi(iconId, updateData);

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to update icon info");
      }

      console.log("Icon info updated successfully:", response.data);
      return { iconId, updatedIcon: response.data };
    } catch (error) {
      console.error("Error in update icon info thunk:", error);
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// Async thunk để cập nhật hình ảnh icon
export const updateIconImage = createAsyncThunk(
  "icon/updateIconImage",
  async ({ iconId, formData }, { rejectWithValue }) => {
    try {
      console.log(`Updating icon image for ${iconId}`);

      const response = await updateIconImageApi(iconId, formData);

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to update icon image");
      }

      console.log("Icon image updated successfully:", response.data);
      return { iconId, updatedIcon: response.data };
    } catch (error) {
      console.error("Error in update icon image thunk:", error);
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// Async thunk để xóa icon
export const deleteIcon = createAsyncThunk(
  "icon/deleteIcon",
  async (fileDataId, { rejectWithValue }) => {
    try {
      console.log(`Deleting icon with fileDataId: ${fileDataId}`);

      const response = await deleteIconApi(fileDataId);

      if (!response.success) {
        return rejectWithValue(response.error || "Failed to delete icon");
      }

      console.log("Icon deleted successfully:", response.message);
      return { fileDataId, message: response.message };
    } catch (error) {
      console.error("Error in delete icon thunk:", error);
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// Icon slice
const iconSlice = createSlice({
  name: "icon",
  initialState,
  reducers: {
    // Reset status when needed
    resetIconStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    // Set a selected icon for preview or usage
    setSelectedIcon: (state, action) => {
      state.selectedIcon = action.payload;
      console.log("Selected icon set:", action.payload);
    },
    // Clear selected icon
    clearSelectedIcon: (state) => {
      state.selectedIcon = null;
      console.log("Selected icon cleared");
    },
    // Clear all icons
    clearIcons: (state) => {
      state.icons = [];
      state.status = "idle";
      state.error = null;
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalElements: 0,
      };
      console.log("Icons cleared");
    },
    // Reset current icon status
    resetCurrentIconStatus: (state) => {
      state.currentIconStatus = "idle";
      state.currentIconError = null;
    },
    // Clear current icon
    clearCurrentIcon: (state) => {
      state.currentIcon = null;
      state.currentIconStatus = "idle";
      state.currentIconError = null;
    },
    // Set pagination info
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateIconUrl: (state, action) => {
      const { iconId, presignedUrl } = action.payload;
      const iconIndex = state.icons.findIndex(icon => icon.id === iconId);

      if (iconIndex !== -1) {
        state.icons[iconIndex] = {
          ...state.icons[iconIndex],
          presignedUrl,
          fullImageUrl: presignedUrl,
          lastUpdated: Date.now()
        };

        console.log(`Icon ${iconId} URL updated in store`);
      }

      // Also update selected icon if it matches
      if (state.selectedIcon?.id === iconId) {
        state.selectedIcon = {
          ...state.selectedIcon,
          presignedUrl,
          fullImageUrl: presignedUrl,
          lastUpdated: Date.now()
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch icons cases
      .addCase(fetchIcons.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("Fetching icons...");
      })
      .addCase(fetchIcons.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.icons = action.payload.icons;
        state.pagination = action.payload.pagination;
        state.error = null;
        console.log(
          "Icons loaded successfully:",
          action.payload.icons.length,
          "items"
        );
      })
      .addCase(fetchIcons.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.icons = [];
        console.error("Failed to fetch icons:", action.payload);
      })
      // Create icon cases
      .addCase(createIcon.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("Creating icon...");
      })
      .addCase(createIcon.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.icons.unshift(action.payload);
        state.error = null;
        console.log("Icon created successfully:", action.payload);
      })
      .addCase(createIcon.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        console.error("Failed to create icon:", action.payload);
      })
      // Update icon info cases
      .addCase(updateIconInfo.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("Updating icon info...");
      })
      .addCase(updateIconInfo.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { iconId, updatedIcon } = action.payload;
        const iconIndex = state.icons.findIndex(icon => icon.id === iconId);
        if (iconIndex !== -1) {
          state.icons[iconIndex] = { ...state.icons[iconIndex], ...updatedIcon };
        }
        state.error = null;
        console.log("Icon info updated successfully:", updatedIcon);
      })
      .addCase(updateIconInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        console.error("Failed to update icon info:", action.payload);
      })
      // Update icon image cases
      .addCase(updateIconImage.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("Updating icon image...");
      })
      .addCase(updateIconImage.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { iconId, updatedIcon } = action.payload;
        const iconIndex = state.icons.findIndex(icon => icon.id === iconId);
        if (iconIndex !== -1) {
          state.icons[iconIndex] = { ...state.icons[iconIndex], ...updatedIcon };
        }
        state.error = null;
        console.log("Icon image updated successfully:", updatedIcon);
      })
      .addCase(updateIconImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        console.error("Failed to update icon image:", action.payload);
      })
      // Delete icon cases
      .addCase(deleteIcon.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("Deleting icon...");
      })
      .addCase(deleteIcon.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { fileDataId } = action.payload;
        state.icons = state.icons.filter(icon => icon.id !== fileDataId);
        state.error = null;
        console.log("Icon deleted successfully:", action.payload.message);
      })
      .addCase(deleteIcon.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        console.error("Failed to delete icon:", action.payload);
      })
      .addCase(refreshIconPresignedUrls.fulfilled, (state, action) => {
        state.icons = action.payload;
        console.log("Icon presigned URLs refreshed successfully");
      })
      .addCase(refreshIconPresignedUrls.rejected, (state, action) => {
        console.error("Failed to refresh icon presigned URLs:", action.payload);
      });
  },
});

// Export actions
export const {
  resetIconStatus,
  setSelectedIcon,
  clearSelectedIcon,
  clearIcons,
  resetCurrentIconStatus,
  clearCurrentIcon,
  setPagination,
  updateIconUrl
} = iconSlice.actions;

// Export selectors
export const selectAllIcons = (state) => state.icon.icons;
export const selectIconStatus = (state) => state.icon.status;
export const selectIconError = (state) => state.icon.error;
export const selectSelectedIcon = (state) => state.icon.selectedIcon;
export const selectIconPagination = (state) => state.icon.pagination;

// Current icon selectors
export const selectCurrentIcon = (state) => state.icon.currentIcon;
export const selectCurrentIconStatus = (state) => state.icon.currentIconStatus;
export const selectCurrentIconError = (state) => state.icon.currentIconError;

// Helper selectors
export const selectIconById = (state, iconId) =>
  state.icon.icons.find((icon) => icon.id === iconId);

export const selectIconsByContentType = (state, contentType) =>
  state.icon.icons.filter((icon) => icon.contentType === contentType);

export const selectAvailableIcons = (state) =>
  state.icon.icons.filter((icon) => icon.imageUrl && icon.fileType);

// Pagination helper selectors
export const selectHasNextPage = (state) => {
  const { currentPage, totalPages } = state.icon.pagination;
  return currentPage < totalPages;
};

export const selectHasPreviousPage = (state) => {
  const { currentPage } = state.icon.pagination;
  return currentPage > 1;
};

export const selectTotalIcons = (state) => state.icon.pagination.totalElements;

export default iconSlice.reducer;
