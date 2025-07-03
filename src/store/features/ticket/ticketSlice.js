import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createTicketByOrder,
  staffReportTicket,
  saleReportTicket,
  deliveryTicketToStaff,
  getUserTickets,
  getAllTickets,
  getTicketDetail,
  getStaffTickets,
  getTicketsByStatus,
} from "../../../api/ticketService";

// Initial state
const initialState = {
  tickets: [],
  currentTicket: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalElements: 0,
  },
  status: "idle", // idle, loading, succeeded, failed
  error: null,
  createStatus: "idle",
  createError: null,
  reportStatus: "idle",
  reportError: null,
  deliveryStatus: "idle",
  deliveryError: null,
};

// Async thunks

// Customer tạo ticket theo đơn hàng
export const createTicket = createAsyncThunk(
  "ticket/createTicket",
  async ({ orderId, ticketData }, { rejectWithValue }) => {
    const response = await createTicketByOrder(orderId, ticketData);

    if (!response.success) {
      return rejectWithValue(response.error || "Tạo ticket thất bại");
    }

    return response.data;
  }
);

// Staff gửi phản hồi cho ticket
export const staffReport = createAsyncThunk(
  "ticket/staffReport",
  async ({ ticketId, reportData }, { rejectWithValue }) => {
    const response = await staffReportTicket(ticketId, reportData);

    if (!response.success) {
      return rejectWithValue(response.error || "Gửi phản hồi thất bại");
    }

    return response.data;
  }
);

// Sale gửi phản hồi cho ticket
export const saleReport = createAsyncThunk(
  "ticket/saleReport",
  async ({ ticketId, reportData }, { rejectWithValue }) => {
    const response = await saleReportTicket(ticketId, reportData);

    if (!response.success) {
      return rejectWithValue(response.error || "Gửi phản hồi thất bại");
    }

    return response.data;
  }
);

// Sale chuyển ticket cho staff
export const deliveryToStaff = createAsyncThunk(
  "ticket/deliveryToStaff",
  async (ticketId, { rejectWithValue }) => {
    const response = await deliveryTicketToStaff(ticketId);

    if (!response.success) {
      return rejectWithValue(response.error || "Chuyển ticket thất bại");
    }

    return response.data;
  }
);

// Customer xem tickets của mình
export const fetchUserTickets = createAsyncThunk(
  "ticket/fetchUserTickets",
  async ({ userId, page = 1, size = 10 }, { rejectWithValue }) => {
    const response = await getUserTickets(userId, page, size);

    if (!response.success) {
      return rejectWithValue(response.error || "Lấy danh sách ticket thất bại");
    }

    return {
      tickets: response.data,
      pagination: response.pagination,
    };
  }
);

// Sale xem tất cả ticket
export const fetchAllTickets = createAsyncThunk(
  "ticket/fetchAllTickets",
  async ({ page = 1, size = 10 }, { rejectWithValue }) => {
    const response = await getAllTickets(page, size);

    if (!response.success) {
      return rejectWithValue(response.error || "Lấy danh sách ticket thất bại");
    }

    return {
      tickets: response.data,
      pagination: response.pagination,
    };
  }
);

// Xem chi tiết ticket
export const fetchTicketDetail = createAsyncThunk(
  "ticket/fetchTicketDetail",
  async (ticketId, { rejectWithValue }) => {
    const response = await getTicketDetail(ticketId);

    if (!response.success) {
      return rejectWithValue(response.error || "Lấy chi tiết ticket thất bại");
    }

    return response.data;
  }
);

// Staff xem tất cả ticket liên quan production
export const fetchStaffTickets = createAsyncThunk(
  "ticket/fetchStaffTickets",
  async ({ page = 1, size = 10 }, { rejectWithValue }) => {
    const response = await getStaffTickets(page, size);

    if (!response.success) {
      return rejectWithValue(response.error || "Lấy danh sách ticket thất bại");
    }

    return {
      tickets: response.data,
      pagination: response.pagination,
    };
  }
);

// Xem tất cả ticket theo trạng thái
export const fetchTicketsByStatus = createAsyncThunk(
  "ticket/fetchTicketsByStatus",
  async ({ status, page = 1, size = 10 }, { rejectWithValue }) => {
    const response = await getTicketsByStatus(status, page, size);

    if (!response.success) {
      return rejectWithValue(response.error || "Lấy danh sách ticket thất bại");
    }

    return {
      tickets: response.data,
      pagination: response.pagination,
    };
  }
);

// Ticket slice
const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    resetTicketStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    resetCreateStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
    resetReportStatus: (state) => {
      state.reportStatus = "idle";
      state.reportError = null;
    },
    resetDeliveryStatus: (state) => {
      state.deliveryStatus = "idle";
      state.deliveryError = null;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    clearTickets: (state) => {
      state.tickets = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        totalElements: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create ticket cases
      .addCase(createTicket.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.tickets.unshift(action.payload); // Thêm ticket mới vào đầu danh sách
        state.createError = null;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      })

      // Staff report cases
      .addCase(staffReport.pending, (state) => {
        state.reportStatus = "loading";
        state.reportError = null;
      })
      .addCase(staffReport.fulfilled, (state, action) => {
        state.reportStatus = "succeeded";
        // Cập nhật ticket trong danh sách
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        // Cập nhật current ticket nếu đang xem
        if (state.currentTicket && state.currentTicket.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
        state.reportError = null;
      })
      .addCase(staffReport.rejected, (state, action) => {
        state.reportStatus = "failed";
        state.reportError = action.payload;
      })

      // Sale report cases
      .addCase(saleReport.pending, (state) => {
        state.reportStatus = "loading";
        state.reportError = null;
      })
      .addCase(saleReport.fulfilled, (state, action) => {
        state.reportStatus = "succeeded";
        // Cập nhật ticket trong danh sách
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        // Cập nhật current ticket nếu đang xem
        if (state.currentTicket && state.currentTicket.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
        state.reportError = null;
      })
      .addCase(saleReport.rejected, (state, action) => {
        state.reportStatus = "failed";
        state.reportError = action.payload;
      })

      // Delivery to staff cases
      .addCase(deliveryToStaff.pending, (state) => {
        state.deliveryStatus = "loading";
        state.deliveryError = null;
      })
      .addCase(deliveryToStaff.fulfilled, (state, action) => {
        state.deliveryStatus = "succeeded";
        // Cập nhật ticket trong danh sách
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        // Cập nhật current ticket nếu đang xem
        if (state.currentTicket && state.currentTicket.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
        state.deliveryError = null;
      })
      .addCase(deliveryToStaff.rejected, (state, action) => {
        state.deliveryStatus = "failed";
        state.deliveryError = action.payload;
      })

      // Fetch user tickets cases
      .addCase(fetchUserTickets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tickets = action.payload.tickets;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch all tickets cases
      .addCase(fetchAllTickets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tickets = action.payload.tickets;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch ticket detail cases
      .addCase(fetchTicketDetail.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTicketDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentTicket = action.payload;
        state.error = null;
      })
      .addCase(fetchTicketDetail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch staff tickets cases
      .addCase(fetchStaffTickets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStaffTickets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tickets = action.payload.tickets;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchStaffTickets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch tickets by status cases
      .addCase(fetchTicketsByStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTicketsByStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tickets = action.payload.tickets;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTicketsByStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  resetTicketStatus,
  resetCreateStatus,
  resetReportStatus,
  resetDeliveryStatus,
  clearCurrentTicket,
  clearTickets,
} = ticketSlice.actions;

// Export selectors
export const selectTickets = (state) => state.ticket.tickets;
export const selectCurrentTicket = (state) => state.ticket.currentTicket;
export const selectTicketPagination = (state) => state.ticket.pagination;
export const selectTicketStatus = (state) => state.ticket.status;
export const selectTicketError = (state) => state.ticket.error;
export const selectCreateStatus = (state) => state.ticket.createStatus;
export const selectCreateError = (state) => state.ticket.createError;
export const selectReportStatus = (state) => state.ticket.reportStatus;
export const selectReportError = (state) => state.ticket.reportError;
export const selectDeliveryStatus = (state) => state.ticket.deliveryStatus;
export const selectDeliveryError = (state) => state.ticket.deliveryError;

// Export reducer
export default ticketSlice.reducer;
