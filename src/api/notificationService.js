import axios from "axios";

// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL;

// Tạo instance axios với interceptors
const notificationService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Allow sending and receiving cookies from API
});

// Thêm interceptor request để gắn accessToken vào header Authorization
notificationService.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi
notificationService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm lấy danh sách thông báo của user
export const getNotificationsApi = async (isRead = false, page = 1, size = 10) => {
  try {
    console.log("Gọi API lấy danh sách thông báo với params:", {
      isRead,
      page,
      size,
    });

    // Kiểm tra token trước khi gọi API
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access Token:", accessToken ? "Có token" : "Không có token");

    if (!accessToken) {
      return {
        success: false,
        error: "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
      };
    }

    const params = { page, size };
    
    // Thêm isRead vào query params
    if (typeof isRead === 'boolean') {
      params.isRead = isRead;
    }

    const response = await notificationService.get('/api/notifications/users', { params });

    const {
      success,
      result,
      message,
      currentPage,
      totalPages,
      pageSize,
      totalElements,
      timestamp
    } = response.data;

    if (success) {
      return {
        success: true,
        data: {
          notifications: result,
          pagination: {
            currentPage,
            totalPages,
            pageSize,
            totalElements,
          },
          timestamp,
        },
      };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error fetching notifications:", error.response?.data || error);
    
    // Xử lý lỗi cụ thể
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        error: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      };
    }

    if (error.response?.status === 401) {
      return {
        success: false,
        error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        error: "Bạn không có quyền truy cập thông báo.",
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || "Không thể tải danh sách thông báo. Vui lòng thử lại.",
    };
  }
};

// Hàm lấy danh sách thông báo theo role
export const getRoleNotificationsApi = async (isRead = false, page = 1, size = 10) => {
  try {
    console.log("Gọi API lấy danh sách thông báo role với params:", {
      isRead,
      page,
      size,
    });

    // Kiểm tra token trước khi gọi API
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access Token:", accessToken ? "Có token" : "Không có token");

    if (!accessToken) {
      return {
        success: false,
        error: "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
      };
    }

    const params = { page, size };
    
    // Thêm isRead vào query params
    if (typeof isRead === 'boolean') {
      params.isRead = isRead;
    }

    const response = await notificationService.get('/api/notifications/roles', { params });

    const {
      success,
      result,
      message,
      currentPage,
      totalPages,
      pageSize,
      totalElements,
      timestamp
    } = response.data;

    if (success) {
      return {
        success: true,
        data: {
          notifications: result,
          pagination: {
            currentPage,
            totalPages,
            pageSize,
            totalElements,
          },
          timestamp,
        },
      };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error fetching role notifications:", error.response?.data || error);
    
    // Xử lý lỗi cụ thể
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        error: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      };
    }

    if (error.response?.status === 401) {
      return {
        success: false,
        error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        error: "Bạn không có quyền truy cập thông báo role.",
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || "Không thể tải danh sách thông báo role. Vui lòng thử lại.",
    };
  };
};

// Hàm đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (notificationId) => {
  try {
    console.log("Gọi API đánh dấu thông báo đã đọc với ID:", notificationId);

    // Kiểm tra notificationId
    if (!notificationId) {
      return {
        success: false,
        error: "ID thông báo không hợp lệ.",
      };
    }

    // Kiểm tra token trước khi gọi API
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access Token:", accessToken ? "Có token" : "Không có token");

    if (!accessToken) {
      return {
        success: false,
        error: "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
      };
    }

    const response = await notificationService.post(`/api/notifications/mark-read/${notificationId}`);

    const { success, message, result, timestamp } = response.data;

    if (success) {
      return {
        success: true,
        data: {
          result,
          timestamp,
          message,
        },
      };
    }

    return { success: false, error: message || "Không thể đánh dấu thông báo đã đọc" };
  } catch (error) {
    console.error("Error marking notification as read:", error.response?.data || error);
    
    // Xử lý lỗi cụ thể
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        error: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      };
    }

    if (error.response?.status === 401) {
      return {
        success: false,
        error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        error: "Bạn không có quyền thực hiện hành động này.",
      };
    }

    if (error.response?.status === 404) {
      return {
        success: false,
        error: "Không tìm thấy thông báo.",
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || "Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại.",
    };
  }
};

// Hàm gửi thông báo cho user cụ thể
export const sendNotificationToUser = async (userId, message) => {
  try {
    console.log("Gọi API gửi thông báo cho user với params:", { userId, message });

    // Kiểm tra userId
    if (!userId) {
      return {
        success: false,
        error: "ID người dùng không hợp lệ.",
      };
    }

    // Kiểm tra message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        success: false,
        error: "Nội dung thông báo không hợp lệ.",
      };
    }

    // Kiểm tra token trước khi gọi API
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access Token:", accessToken ? "Có token" : "Không có token");

    if (!accessToken) {
      return {
        success: false,
        error: "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
      };
    }

    const response = await notificationService.post(
      `/api/notifications/users/${userId}`,
      message.trim(), // Send as string in request body
      {
        headers: {
          'Content-Type': 'text/plain', // Set content type as text/plain since we're sending a string
        },
      }
    );

    const { success, message: responseMessage, result, timestamp } = response.data;

    if (success) {
      return {
        success: true,
        data: {
          result,
          timestamp,
          message: responseMessage,
        },
      };
    }

    return { success: false, error: responseMessage || "Không thể gửi thông báo" };
  } catch (error) {
    console.error("Error sending notification to user:", error.response?.data || error);
    
    // Xử lý lỗi cụ thể
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        error: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      };
    }

    if (error.response?.status === 401) {
      return {
        success: false,
        error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        error: "Bạn không có quyền gửi thông báo.",
      };
    }

    if (error.response?.status === 404) {
      return {
        success: false,
        error: "Không tìm thấy người dùng.",
      };
    }

    if (error.response?.status === 400) {
      return {
        success: false,
        error: "Dữ liệu gửi không hợp lệ.",
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || "Không thể gửi thông báo. Vui lòng thử lại.",
    };
  }
};

// Hàm gửi thông báo cho role cụ thể
export const sendNotificationToRole = async (role, message) => {
  try {
    console.log("Gọi API gửi thông báo cho role với params:", { role, message });

    // Kiểm tra role
    if (!role) {
      return {
        success: false,
        error: "Role không hợp lệ.",
      };
    }

    // Kiểm tra message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        success: false,
        error: "Nội dung thông báo không hợp lệ.",
      };
    }

    // Kiểm tra token trước khi gọi API
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access Token:", accessToken ? "Có token" : "Không có token");

    if (!accessToken) {
      return {
        success: false,
        error: "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
      };
    }

    const response = await notificationService.post(
      `/api/notifications/roles/${role}`,
      message.trim(), // Send as string in request body
      {
        headers: {
          'Content-Type': 'text/plain', // Set content type as text/plain since we're sending a string
        },
      }
    );

    const { success, message: responseMessage, result, timestamp } = response.data;

    if (success) {
      return {
        success: true,
        data: {
          result,
          timestamp,
          message: responseMessage,
        },
      };
    }

    return { success: false, error: responseMessage || "Không thể gửi thông báo" };
  } catch (error) {
    console.error("Error sending notification to role:", error.response?.data || error);
    
    // Xử lý lỗi cụ thể
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        error: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      };
    }

    if (error.response?.status === 401) {
      return {
        success: false,
        error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        error: "Bạn không có quyền gửi thông báo.",
      };
    }

    if (error.response?.status === 404) {
      return {
        success: false,
        error: "Không tìm thấy role.",
      };
    }

    if (error.response?.status === 400) {
      return {
        success: false,
        error: "Dữ liệu gửi không hợp lệ.",
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || "Không thể gửi thông báo cho role. Vui lòng thử lại.",
    };
  }
};

export default notificationService;