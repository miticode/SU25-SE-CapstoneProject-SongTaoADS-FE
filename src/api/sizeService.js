import axios from "axios";

// Sử dụng proxy trong development để tránh CORS
const API_URL = import.meta.env.DEV ? "" : "https://songtaoads.online";

const sizeService = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

sizeService.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

sizeService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// lấy tất cả kích thước
export const getAllSizesApi = async () => {
  try {
    const response = await sizeService.get("/api/sizes");
    const { success, result, message } = response.data;
    if (success) return { success, data: result || [] };
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || "Failed to fetch sizes" };
  }
};
// lấy kích thước theo id
export const getSizeByIdApi = async (id) => {
  try {
    const response = await sizeService.get(`/api/sizes/${id}`);
    const { success, result, message } = response.data;
    if (success) return { success, data: result || {} };
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || "Failed to fetch size details" };
  }
};
// thêm kích thước
export const addSizeApi = async (data) => {
  try {
    const response = await sizeService.post("/api/sizes", { ...data, isAvailable: true });
    const { success, result, message } = response.data;
    if (success) return { success, data: result };
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || "Failed to add size" };
  }
};
// sửa kích thước
export const updateSizeApi = async (id, data) => {
  try {
    const response = await sizeService.put(`/api/sizes/${id}`, data);
    const { success, result, message } = response.data;
    if (success) return { success, data: result };
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || "Failed to update size" };
  }
};
// xóa kích thước
export const deleteSizeApi = async (id) => {
  try {
    const response = await sizeService.delete(`/api/sizes/${id}`);
    const { success, result, message } = response.data;
    if (success) return { success, data: result };
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || "Failed to delete size" };
  }
};

export default sizeService;
