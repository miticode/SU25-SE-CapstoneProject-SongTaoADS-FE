import axios from "axios";

// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL;
// Tạo instance axios với interceptors
const productTypeService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cho phép gửi và nhận cookies từ API
});
productTypeService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // hoặc lấy token từ store của bạn
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Interceptor để xử lý lỗi
productTypeService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm lấy tất cả product types
export const getProductTypesApi = async (page = 1, size = 10) => {
  try {
    const response = await productTypeService.get("/api/product-types", {
      params: {
        page,
        size,
      },
    });

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
        success,
        data: result || [],
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
      error: error.response?.data?.message || "Failed to fetch product types",
    };
  }
};

// Hàm lấy chi tiết một product type
export const getProductTypeByIdApi = async (id) => {
  try {
    const response = await productTypeService.get(`/api/product-types/${id}`);

    const { success, result, message } = response.data;

    if (success) {
      return { success, data: result || {} };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch product type details",
    };
  }
};

// Hàm lấy product type sizes theo product type ID
export const getProductTypeSizesByProductTypeIdApi = async (productTypeId) => {
  try {
    const response = await productTypeService.get(
      `/api/product-types/${productTypeId}/product-type-sizes`
    );

    const { success, result, message } = response.data;

    if (success && Array.isArray(result)) {
      // Xử lý dữ liệu để phù hợp với frontend
      const processedData = result.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        productTypes: item.productTypes,
        sizes: item.sizes, // Giữ nguyên cấu trúc sizes object
        // Thêm các field để tương thích với code hiện tại
        sizeId: item.sizes?.id,
        sizeName: item.sizes?.name,
        // ✅ QUAN TRỌNG: Thêm minValue và maxValue từ API response
        minValue: item.minValue,
        maxValue: item.maxValue,
      }));

      return { success, data: processedData };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch product type sizes",
    };
  }
};

// Thêm mới product type
export const addProductTypeApi = async (data) => {
  try {
    // Tạo FormData để gửi multipart/form-data
    const formData = new FormData();
    
    // Thêm các field vào FormData
    formData.append('name', data.name);
    formData.append('calculateFormula', data.calculateFormula);
    formData.append('isAiGenerated', data.isAiGenerated);
    formData.append('isAvailable', data.isAvailable);
    
    // Thêm file image nếu có
    if (data.productTypeImage) {
      formData.append('productTypeImage', data.productTypeImage);
    }

    const response = await productTypeService.post("/api/product-types", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to add product type",
    };
  }
};

// Sửa thông tin product type
export const updateProductTypeApi = async (id, data) => {
  try {
    // Thay đổi phương thức từ PUT sang PATCH
    const response = await productTypeService.patch(
      `/api/product-types/${id}/information`,
      data
    );
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update product type",
    };
  }
};

// Cập nhật hình ảnh của product type
export const updateProductTypeImageApi = async (productTypeId, imageFile) => {
  try {
    // Tạo FormData để gửi multipart/form-data
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await productTypeService.patch(
      `/api/product-types/${productTypeId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update product type image",
    };
  }
};

// Xóa product type
export const deleteProductTypeApi = async (id) => {
  try {
    const response = await productTypeService.delete(
      `/api/product-types/${id}`
    );
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete product type",
    };
  }
};

// Thêm size vào product type
export const addSizeToProductTypeApi = async (productTypeId, sizeId) => {
  try {
    const response = await productTypeService.post(
      `/api/product-types/${productTypeId}/sizes/${sizeId}`
    );
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to add size to product type",
    };
  }
};

// Xóa size khỏi product type
export const deleteProductTypeSizeApi = async (productTypeSizeId) => {
  try {
    const response = await productTypeService.delete(
      `/api/product-type-sizes/${productTypeSizeId}`
    );
    const { success, result, message } = response.data;
    if (success) {
      return { success, data: result };
    }
    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to delete product type size",
    };
  }
};

export default productTypeService;
