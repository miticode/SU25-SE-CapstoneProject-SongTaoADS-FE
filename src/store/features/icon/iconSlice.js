import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchIconsApi } from "../../../api/iconService";

// Initial state
const initialState = {
  icons: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedIcon: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
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
  async ({ page = 1, size = 20 } = {}, { rejectWithValue }) => {
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
        pageSize: 20,
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
