import axios from "axios";


// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL
// Tạo instance axios với interceptors
const ticketService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cho phép gửi và nhận cookies từ API
});

// Thêm interceptor request để tự động gắn token
ticketService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response để xử lý lỗi
ticketService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Ticket service error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Customer gửi ticket theo đơn hàng
export const createTicketByOrder = async (orderId, ticketData) => {
  try {
    const response = await ticketService.post(`/api/orders/${orderId}/tickets`, {
      title: ticketData.title,
      description: ticketData.description,
      severity: ticketData.severity
    });

    const { success, result, message } = response.data;

    if (success) {
      return { success, data: result, message };
    }

    return { success: false, error: message || "Tạo ticket thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Tạo ticket thất bại",
    };
  }
};

// Staff gửi phản hồi cho ticket
export const staffReportTicket = async (ticketId, reportData) => {
  try {
    const response = await ticketService.patch(`/api/tickets/${ticketId}/report/staff`, {
      report: reportData.report
    });

    const { success, result, message } = response.data;

    if (success) {
      return { success, data: result, message };
    }

    return { success: false, error: message || "Gửi phản hồi thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Gửi phản hồi thất bại",
    };
  }
};

// Sale gửi phản hồi cho ticket
export const saleReportTicket = async (ticketId, reportData) => {
  try {
    const response = await ticketService.patch(`/api/tickets/${ticketId}/report/sale`, {
      report: reportData.report
    });

    const { success, result, message } = response.data;

    if (success) {
      return { success, data: result, message };
    }

    return { success: false, error: message || "Gửi phản hồi thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Gửi phản hồi thất bại",
    };
  }
};

// Sale chuyển ticket cho staff
export const deliveryTicketToStaff = async (ticketId) => {
  try {
    const response = await ticketService.patch(`/api/tickets/${ticketId}/deliveryTicket`);

    const { success, result, message } = response.data;

    if (success) {
      return { success, data: result, message };
    }

    return { success: false, error: message || "Chuyển ticket thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Chuyển ticket thất bại",
    };
  }
};

// Customer xem tickets của mình
export const getUserTickets = async (userId, page = 1, size = 10) => {
  try {
    const response = await ticketService.get(`/api/users/${userId}/tickets`, {
      params: { page, size }
    });

    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;

    if (success) {
      return {
        success,
        data: result,
        pagination: { currentPage, totalPages, pageSize, totalElements },
        message
      };
    }

    return { success: false, error: message || "Lấy danh sách ticket thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Lấy danh sách ticket thất bại",
    };
  }
};

// Customer xem tickets của mình theo trạng thái
export const getUserTicketsByStatus = async (userId, status, page = 1, size = 10) => {
  try {
    const response = await ticketService.get(`/api/users/${userId}/tickets`, {
      params: { status, page, size }
    });

    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;

    if (success) {
      return {
        success,
        data: result,
        pagination: { currentPage, totalPages, pageSize, totalElements },
        message
      };
    }

    return { success: false, error: message || "Lấy danh sách ticket thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Lấy danh sách ticket thất bại",
    };
  }
};

// Sale xem tất cả ticket
export const getAllTickets = async (page = 1, size = 10) => {
  try {
    const response = await ticketService.get('/api/tickets', {
      params: { page, size }
    });

    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;

    if (success) {
      return {
        success,
        data: result,
        pagination: { currentPage, totalPages, pageSize, totalElements },
        message
      };
    }

    return { success: false, error: message || "Lấy danh sách ticket thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Lấy danh sách ticket thất bại",
    };
  }
};

// Xem chi tiết ticket
export const getTicketDetail = async (ticketId) => {
  try {
    const response = await ticketService.get(`/api/tickets/${ticketId}`);

    const { success, result, message } = response.data;

    if (success) {
      return { success, data: result, message };
    }

    return { success: false, error: message || "Lấy chi tiết ticket thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Lấy chi tiết ticket thất bại",
    };
  }
};

// Staff xem tất cả ticket liên quan production
export const getStaffTickets = async (page = 1, size = 10) => {
  try {
    const response = await ticketService.get('/api/tickets/staff', {
      params: { page, size }
    });

    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;

    if (success) {
      return {
        success,
        data: result,
        pagination: { currentPage, totalPages, pageSize, totalElements },
        message
      };
    }

    return { success: false, error: message || "Lấy danh sách ticket thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Lấy danh sách ticket thất bại",
    };
  }
};

// Xem tất cả ticket theo trạng thái (cho sale)
export const getTicketsByStatus = async (status, page = 1, size = 10) => {
  try {
    const response = await ticketService.get('/api/tickets', {
      params: { status, page, size }
    });

    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;

    if (success) {
      return {
        success,
        data: result,
        pagination: { currentPage, totalPages, pageSize, totalElements },
        message
      };
    }

    return { success: false, error: message || "Lấy danh sách ticket thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Lấy danh sách ticket thất bại",
    };
  }
};

// Staff xem ticket theo trạng thái
export const getStaffTicketsByStatus = async (status, page = 1, size = 10) => {
  try {
    const response = await ticketService.get('/api/tickets/staff', {
      params: { status, page, size }
    });

    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;

    if (success) {
      return {
        success,
        data: result,
        pagination: { currentPage, totalPages, pageSize, totalElements },
        message
      };
    }

    return { success: false, error: message || "Lấy danh sách ticket thất bại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Lấy danh sách ticket thất bại",
    };
  }
};
