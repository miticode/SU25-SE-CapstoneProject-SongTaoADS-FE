import axios from "axios";

// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL;

// Tạo instance axios với interceptors
const progressLogService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true, // Allow sending and receiving cookies from API
});

// Thêm interceptor request để gắn accessToken vào header Authorization
progressLogService.interceptors.request.use(
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
progressLogService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm tạo progress log mới
export const createProgressLogApi = async (orderId, progressLogData) => {
  try {
    console.log("Gọi API tạo progress log với:", { orderId, progressLogData });

    // Kiểm tra token trước khi gọi API
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access Token:", accessToken ? "Có token" : "Không có token");

    if (!accessToken) {
      return {
        success: false,
        error: "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
      };
    }

    // Tạo FormData để gửi multipart/form-data
    const formData = new FormData();
    
    // Thêm description và status
    if (progressLogData.description) {
      formData.append("description", progressLogData.description);
    }
    
    if (progressLogData.status) {
      formData.append("status", progressLogData.status);
    }

    // Thêm các file ảnh
    if (progressLogData.progressLogImages && progressLogData.progressLogImages.length > 0) {
      progressLogData.progressLogImages.forEach((file) => {
        formData.append("progressLogImages", file);
      });
    }

    // Log FormData content để debug
    console.log("FormData content:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await progressLogService.post(
      `/api/orders/${orderId}/progress-logs`,
      formData
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Tạo progress log thành công:", result);
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error creating progress log:", error.response?.data || error);

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
        error: "Bạn không có quyền thực hiện thao tác này.",
      };
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Không thể tạo progress log. Vui lòng thử lại.",
    };
  }
};

// Hàm lấy danh sách progress logs của một order với pagination
export const getProgressLogsByOrderIdApi = async (orderId, page = 1, size = 10) => {
  try {
    console.log("Gọi API lấy progress logs với:", { orderId, page, size });

    const response = await progressLogService.get(
      `/api/orders/${orderId}/progress-logs?page=${page}&size=${size}`
    );

    const { 
      success, 
      result, 
      message,
      currentPage,
      totalPages,
      pageSize,
      totalElements
    } = response.data;

    if (success) {
      console.log("Lấy progress logs thành công:", {
        data: result,
        pagination: { currentPage, totalPages, pageSize, totalElements }
      });
      return { 
        success: true, 
        data: result,
        pagination: {
          currentPage,
          totalPages,
          pageSize,
          totalElements
        }
      };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error fetching progress logs:", error.response?.data || error);

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
        error: "Bạn không có quyền thực hiện thao tác này.",
      };
    }

    if (error.response?.status === 404) {
      return {
        success: false,
        error: "Không tìm thấy đơn hàng hoặc progress logs.",
      };
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Không thể lấy danh sách progress logs. Vui lòng thử lại.",
    };
  }
};

// Hàm lấy danh sách ảnh của một progress log
export const getProgressLogImagesApi = async (progressLogId) => {
  try {
    console.log("Gọi API lấy ảnh progress log với:", { progressLogId });

    const response = await progressLogService.get(
      `/api/progress-logs/${progressLogId}/images`
    );

    const { 
      success, 
      result, 
      message 
    } = response.data;

    if (success) {
      console.log("Lấy ảnh progress log thành công:", result);
      return { 
        success: true, 
        data: result
      };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error fetching progress log images:", error.response?.data || error);

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
        error: "Bạn không có quyền thực hiện thao tác này.",
      };
    }

    if (error.response?.status === 404) {
      return {
        success: false,
        error: "Không tìm thấy progress log hoặc ảnh.",
      };
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Không thể lấy danh sách ảnh progress log. Vui lòng thử lại.",
    };
  }
};

export default progressLogService;
