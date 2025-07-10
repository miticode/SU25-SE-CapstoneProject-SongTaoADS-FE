import axios from "axios";


// Sử dụng URL backend trực tiếp
const API_URL = "https://songtaoads.online";

// Tạo instance axios với interceptors
const costypeService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cho phép gửi và nhận cookies từ API
});

// Thêm interceptor request để gắn accessToken vào header Authorization
costypeService.interceptors.request.use(
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
costypeService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm lấy danh sách loại chi phí
export const getCostTypesApi = async (page = 1, size = 10) => {
  try {
    const url = `/api/cost-types?page=${page}&size=${size}`;
    const response = await costypeService.get(url);

    const {
      success,
      result,
      message,
      currentPage,
      totalPages,
      pageSize,
      totalElements,
    } = response.data;

    if (success) {
      return {
        success: true,
        data: result,
        pagination: {
          currentPage,
          totalPages,
          pageSize,
          totalElements,
        },
      };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch cost types",
    };
  }
};
export const getCostTypesByProductTypeIdApi = async (productTypeId) => {
  try {
    const response = await costypeService.get(`/api/product-types/${productTypeId}/cost-types`);
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success: true, data: result || [] };
    }
    
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch cost types by product type",
    };
  }
};
export const createCostTypeApi = async (productTypeId, costTypeData) => {
  try {
    const response = await costypeService.post(
      `/api/product-types/${productTypeId}/cost-types`,
      costTypeData
    );

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create cost type",
    };
  }
};
export const updateCostTypeApi = async (costTypeId, costTypeData) => {
  try {
    const response = await costypeService.put(
      `/api/cost-types/${costTypeId}`,
      costTypeData
    );

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update cost type",
    };
  }
};
export default costypeService;
