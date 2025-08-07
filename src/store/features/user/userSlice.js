import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllUsersApi,
  getUserDetailApi,
  createUserApi,
  updateUserApi,
  toggleUserStatusApi,
  getUsersByRoleApi,
  changeUserPasswordApi,
} from "../../../api/userService";

// Initial state
const initialState = {
  users: [],
  currentUser: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  searchQuery: "",
  designers: [],
  designersStatus: "idle",
  designersError: null,
};

// Async thunk để lấy danh sách người dùng
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    const response = await getAllUsersApi(page, limit, search);

    if (!response.success) {
      return rejectWithValue(response.error || "Failed to fetch users");
    }

    return {
      users: response.data,
      totalUsers: response.data.length, // Adjust if API provides total count
      totalPages: Math.ceil(response.data.length / limit), // Adjust if API provides total pages
    };
  }
);

// Async thunk để lấy thông tin chi tiết của một người dùng
export const fetchUserDetail = createAsyncThunk(
  "users/fetchUserDetail",
  async (userId, { rejectWithValue }) => {
    const response = await getUserDetailApi(userId);

    if (!response.success) {
      return rejectWithValue(response.error || "Failed to fetch user details");
    }

    return response.data;
  }
);

// Async thunk để tạo người dùng mới
export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    const response = await createUserApi(userData);

    if (!response.success) {
      return rejectWithValue(response.error || "Failed to create user");
    }

    return response.data;
  }
);

// Async thunk để cập nhật thông tin người dùng
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ userId, userData }, { rejectWithValue }) => {
    const response = await updateUserApi(userId, userData);

    if (!response.success) {
      return rejectWithValue(response.error || "Failed to update user");
    }

    return response.data;
  }
);

// Async thunk để kích hoạt/vô hiệu hóa người dùng
export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async ({ userId, isActive }, { rejectWithValue }) => {
    const response = await toggleUserStatusApi(userId, isActive);

    if (!response.success) {
      return rejectWithValue(response.error || "Failed to update user status");
    }

    return { userId, isActive };
  }
);

// Async thunk để thay đổi mật khẩu người dùng
export const changeUserPassword = createAsyncThunk(
  "users/changeUserPassword",
  async ({ userId, password }, { rejectWithValue }) => {
    const response = await changeUserPasswordApi(userId, password);

    if (!response.success) {
      return rejectWithValue(response.error || "Failed to change user password");
    }

    return response.data;
  }
);

export const fetchUsersByRole = createAsyncThunk(
  "users/fetchUsersByRole",
  async ({ roleName, page = 1, size = 10 }, { rejectWithValue }) => {
    const response = await getUsersByRoleApi(roleName, page, size);

    if (!response.success) {
      return rejectWithValue(
        response.error || `Failed to fetch users with role ${roleName}`
      );
    }

    return {
      users: response.data,
      pagination: response.pagination,
    };
  }
);

// Thunk lấy danh sách designer
export const fetchDesignersByRole = createAsyncThunk(
  "users/fetchDesignersByRole",
  async ({ page = 1, size = 10 }, { rejectWithValue }) => {
    const response = await getUsersByRoleApi("DESIGNER", page, size);
    if (!response.success) {
      return rejectWithValue(response.error || "Failed to fetch designers");
    }
    return {
      designers: response.data,
      pagination: response.pagination,
    };
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users cases
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload.users;
        state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch user detail cases
      .addCase(fetchUserDetail.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserDetail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create user cases
      .addCase(createUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update user cases
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Toggle user status cases
      .addCase(toggleUserStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { userId, isActive } = action.payload;
        const index = state.users.findIndex((user) => user.id === userId);
        if (index !== -1) {
          state.users[index].isActive = isActive;
        }
        if (state.currentUser && state.currentUser.id === userId) {
          state.currentUser.isActive = isActive;
        }
        state.error = null;
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Change user password cases
      .addCase(changeUserPassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(changeUserPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedUser = action.payload;
        const index = state.users.findIndex((user) => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.currentUser && state.currentUser.id === updatedUser.id) {
          state.currentUser = updatedUser;
        }
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchUsersByRole.pending, (state) => {
        state.usersByRoleStatus = "loading";
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        state.usersByRoleStatus = "succeeded";
        state.usersByRole = action.payload.users;
        state.roleFilteredPagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        state.usersByRoleStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchDesignersByRole.pending, (state) => {
        state.designersStatus = "loading";
      })
      .addCase(fetchDesignersByRole.fulfilled, (state, action) => {
        state.designersStatus = "succeeded";
        state.designers = action.payload.designers;
        state.designersError = null;
      })
      .addCase(fetchDesignersByRole.rejected, (state, action) => {
        state.designersStatus = "failed";
        state.designersError = action.payload;
      });
  },
});

export const { setSearchQuery, setCurrentPage, clearUserError } =
  userSlice.actions;

export default userSlice.reducer;

// Export selector lấy designers
export const selectDesigners = (state) => state.users.designers;
