import axios from "axios";

// Sử dụng URL backend trực tiếp
const API_URL = "https://songtaoads.online";

// Tạo instance axios với interceptors
const customerService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cho phép gửi và nhận cookies từ API
});
const getToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};
customerService.interceptors.request.use(
  (config) => {
    // Lấy access token từ localStorage
    const token = getToken();

    if (token) {
      // Thêm token vào header cho tất cả các request
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Adding token to request:", config.url);
    } else {
      console.warn("No token found for request:", config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Interceptor để xử lý lỗi
customerService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Authentication error:", error.response.data);
      // Có thể xử lý đăng xuất hoặc refresh token ở đây
    }
    return Promise.reject(error);
  }
);

// Hàm tạo customer mới
export const createCustomerApi = async (customerData) => {
  try {
    const formData = new FormData();

    // Thêm các trường text vào FormData - ensure all required fields are present
    formData.append("companyName", customerData.companyName || "");
    formData.append("address", customerData.address || "");
    formData.append("contactInfo", customerData.contactInfo || "");

    // Thêm file logo nếu có
    if (customerData.customerDetailLogo) {
      formData.append("customerDetailLogo", customerData.customerDetailLogo);
    }

    console.log("Sending form data:", {
      companyName: customerData.companyName,
      address: customerData.address,
      contactInfo: customerData.contactInfo,
      hasLogo: !!customerData.customerDetailLogo,
    });

    // Kiểm tra token trước khi gọi API
    const token = getToken();
    console.log("Token available:", !!token);

    const response = await customerService.post(
      "/api/customer-details",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Đảm bảo token có trong header
        },
      }
    );

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create customer",
    };
  }
};

export const updateCustomerDetailApi = async (
  customerDetailId,
  customerData
) => {
  try {
    let textUpdateSuccess = false;
    let imageUpdateSuccess = false;
    let textUpdateResult = null;
    let imageUpdateResult = null;

    // 1. First, get the current customer details to get the existing logo_url
    try {
      const currentDetailResponse = await customerService.get(
        `/api/customer-details/${customerDetailId}`
      );
      const currentDetail = currentDetailResponse.data.result;
      console.log("Current customer detail:", currentDetail);

      // 2. Update text fields first (companyName, tagLine, contactInfo)
      const textData = {
        companyName: customerData.companyName || "",
        address: customerData.address || "",
        contactInfo: customerData.contactInfo || "",
        logoUrl: currentDetail.logoUrl, // Keep existing logo URL to prevent null value
        userId: customerData.userId,
      };

      console.log("Updating customer text details:", {
        id: customerDetailId,
        ...textData,
      });

      // Lấy token từ localStorage
      const token = getToken();

      // Gọi API PUT để cập nhật thông tin text
      const textResponse = await customerService.patch(
        `/api/customer-details/${customerDetailId}/information`,
        textData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const textResult = textResponse.data;
      textUpdateSuccess = textResult.success;
      textUpdateResult = textResult.result;
      console.log("Text update response:", textResult);
    } catch (textError) {
      console.error(
        "Failed to update text fields:",
        textError.response?.data || textError.message
      );
      return {
        success: false,
        error:
          textError.response?.data?.message ||
          "Failed to update customer details",
      };
    }

    // 3. Update image if provided
    if (customerData.customerDetailLogo) {
      const formData = new FormData();
      formData.append("image", customerData.customerDetailLogo);

      console.log("Updating customer logo image");

      try {
        // Lấy token từ localStorage
        const token = getToken();

        const imageResponse = await customerService.patch(
          `/api/customer-details/${customerDetailId}/image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const imageResult = imageResponse.data;
        imageUpdateSuccess = imageResult.success;
        imageUpdateResult = imageResult.result;
        console.log("Image update response:", imageResult);
      } catch (imageError) {
        console.error(
          "Failed to update logo image:",
          imageError.response?.data || imageError.message
        );

        // If text update was successful but image update failed, return partial success
        if (textUpdateSuccess) {
          return {
            success: true,
            data: textUpdateResult,
            warning: "Text information updated but logo upload failed",
          };
        }

        return {
          success: false,
          error:
            imageError.response?.data?.message || "Failed to update logo image",
        };
      }
    }

    // If both updates were successful or only text was updated (no image provided)
    return {
      success: true,
      data: imageUpdateResult || textUpdateResult,
    };
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to update customer detail",
    };
  }
};
export const getCustomerDetailByUserIdApi = async (userId) => {
  try {
    const response = await customerService.get(
      `/api/users/${userId}/customer-details`
    );

    return response.data;
  } catch (error) {
    // If 404, it means the customer detail doesn't exist yet, which is not an error
    if (error.response && error.response.status === 404) {
      return { success: true, result: null };
    }

    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch customer detail",
    };
  }
};
export const linkCustomerToProductTypeApi = async (
  customerId,
  productTypeId
) => {
  try {
    // Validate inputs
    if (!customerId || !productTypeId) {
      console.error("Invalid parameters:", { customerId, productTypeId });
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    console.log("Linking customer to product type:", {
      customerId,
      productTypeId,
    });

    // First check if customer already has a choice
    try {
      const existingChoices = await customerService.get(
        `/api/customers/${customerId}/customer-choices`
      );
      
      if (existingChoices.data.success && existingChoices.data.result) {
        const existingChoice = existingChoices.data.result;
        
        // Check if the existing choice has the same product type
        // CẬP NHẬT: Kiểm tra productTypes.id thay vì productTypeId
        const existingProductTypeId = existingChoice.productTypes?.id;
        
        if (existingProductTypeId === productTypeId) {
          console.log("Customer already has this product type, returning existing choice");
          return existingChoices.data;
        } else {
          console.log("Customer has different product type, updating...");
          // Update to new product type
          const response = await customerService.put(
            `/api/customers/${customerId}/product-types/${productTypeId}`
          );
          console.log("Update response:", response.data);
          return response.data;
        }
      }
    } catch (error) {
      console.log("No existing customer choice found, creating new...");
    }

    // If no existing choice, create new
    const response = await customerService.post(
      `/api/customers/${customerId}/product-types/${productTypeId}`
    );
    console.log("Create response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error linking customer to product type:", {
      error: error.response?.data || error.message,
      status: error.response?.status,
      customerId,
      productTypeId,
    });

    // Xử lý lỗi duplicate key constraint
    if (error.response?.data?.message?.includes("duplicate key")) {
      console.log("Duplicate key error, fetching existing choice...");
      try {
        // Nếu gặp lỗi duplicate key, fetch lại existing choice
        const existingChoices = await customerService.get(
          `/api/customers/${customerId}/customer-choices`
        );
        
        if (existingChoices.data.success && existingChoices.data.result) {
          return existingChoices.data;
        }
      } catch (fetchError) {
        console.error("Failed to fetch existing choice after duplicate error:", fetchError);
      }
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to link customer to product type",
    };
  }
};
// API to link attribute value to customer choice
export const linkAttributeValueToCustomerChoiceApi = async (
  customerChoiceId,
  attributeValueId
) => {
  try {
    const response = await customerService.post(
      `/api/customer-choices/${customerChoiceId}/attribute-values/${attributeValueId}`
    );

    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to link attribute value to customer choice",
    };
  }
};
// API to link size to customer choice
export const linkSizeToCustomerChoiceApi = async (
  customerChoiceId,
  sizeId,
  sizeValue
) => {
  try {
    console.log(
      `API call with customerChoiceId: ${customerChoiceId}, sizeId: ${sizeId}, sizeValue: ${sizeValue} (type: ${typeof sizeValue})`
    );
    const numericSizeValue = parseFloat(sizeValue);
    const response = await customerService.post(
      `/api/customer-choices/${customerChoiceId}/sizes/${sizeId}`,
      {
        sizeValue: numericSizeValue,
      }
    );
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to link size to customer choice",
    };
  }
};
export const getCustomerChoiceDetailApi = async (customerChoiceDetailId) => {
  try {
    // Log the ID to verify it's a string
    console.log(
      "Fetching customer choice detail with ID:",
      customerChoiceDetailId
    );

    // Make sure customerChoiceDetailId is a string
    if (typeof customerChoiceDetailId !== "string") {
      console.error(
        "Invalid customerChoiceDetailId type:",
        typeof customerChoiceDetailId
      );
      return {
        success: false,
        error: "Invalid customer choice detail ID",
      };
    }

    const response = await customerService.get(
      `/api/customer-choice-details/${customerChoiceDetailId}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching customer choice detail:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to fetch customer choice detail",
    };
  }
};
export const deleteCustomerChoiceApi = async (customerChoiceId) => {
  try {
    const response = await customerService.delete(
      `/api/customer-choices/${customerChoiceId}`
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting customer choice:", error);
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to delete customer choice",
    };
  }
};
export const updateCustomerChoiceDetailApi = async (
  customerChoiceDetailId,
  attributeValueId
) => {
  try {
    const response = await customerService.put(
      `/api/customer-choice-details/${customerChoiceDetailId}/attribute-values/${attributeValueId}`
    );

    return response.data;
  } catch (error) {
    console.error("Error updating customer choice detail:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to update customer choice detail",
    };
  }
};
export const updateCustomerChoiceSizeApi = async (
  customerChoiceSizeId,
  sizeValue
) => {
  try {
    console.log(
      `Updating size with ID: ${customerChoiceSizeId}, new value: ${sizeValue}`
    );

    const numericSizeValue = parseFloat(sizeValue);
    const response = await customerService.put(
      `/api/customer-choice-sizes/${customerChoiceSizeId}`,
      {
        sizeValue: numericSizeValue,
      }
    );

    console.log("Update size API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating size:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update size value",
    };
  }
};
export const fetchCustomerChoiceDetailsApi = async (customerChoiceId) => {
  try {
    const response = await customerService.get(
      `/api/customer-choices/${customerChoiceId}/customer-choice-details`
    );

    const { success, result, message } = response.data;

    if (success) {
      return { success, result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to fetch customer choice details",
    };
  }
};
export const fetchCustomerChoiceApi = async (customerChoiceId) => {
  try {
    const response = await customerService.get(
      `/api/customer-choices/${customerChoiceId}`
    );

    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch customer choice",
    };
  }
};
export const getCustomerChoicesApi = async (customerId) => {
  try {
    const response = await customerService.get(
      `/api/customers/${customerId}/customer-choices`
    );
    return response.data;
  } catch (error) {
    // If 404, it means the customer has no choices yet, which is not an error
    if (error.response && error.response.status === 404) {
      return { success: true, result: null };
    }

    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch customer choices",
    };
  }
};
export const fetchCustomerChoiceSizesApi = async (customerChoiceId) => {
  try {
    const response = await customerService.get(
      `/api/customer-choices/${customerChoiceId}/customer-choices-value`
    );

    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to fetch customer choice sizes",
    };
  }
};
// Thêm hàm cập nhật customer choice product type
export const updateCustomerChoiceProductTypeApi = async (
  customerId,
  productTypeId
) => {
  try {
    const response = await customerService.put(
      `/api/customers/${customerId}/product-types/${productTypeId}`
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to update customer choice product type",
    };
  }
};
// Lấy danh sách kích thước đã nhập cho customer choice
export const fetchCustomerChoiceSizesByCustomerChoiceIdApi = async (
  customerChoicesId
) => {
  try {
    const response = await customerService.get(
      `/api/customer-choices/${customerChoicesId}/customer-choices-value`
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to fetch customer choice sizes",
    };
  }
};
// Lấy danh sách thuộc tính đã chọn cho customer choice
export const fetchCustomerChoiceDetailsByCustomerChoiceIdApi = async (
  customerChoiceId
) => {
  try {
    const response = await customerService.get(
      `/api/customer-choices/${customerChoiceId}/customer-choice-details`
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to fetch customer choice details",
    };
  }
};

// Tạo đơn hàng thiết kế thủ công (requirements)
export const postCustomDesignRequirementApi = async (
  customerDetailId,
  customerChoiceId,
  requirements
) => {
  try {
    const response = await customerService.post(
      `/api/customer-details/${customerDetailId}/customer-choices/${customerChoiceId}`,
      { requirements }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to create custom design order",
    };
  }
};
export const getCustomerDetailByIdApi = async (customerDetailId) => {
  try {
    if (!customerDetailId) {
      console.error("Invalid customer detail ID provided");
      return {
        success: false,
        error: "Customer detail ID is required",
      };
    }

    console.log("Fetching customer detail with ID:", customerDetailId);

    const response = await customerService.get(
      `/api/customer-details/${customerDetailId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching customer detail:",
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch customer detail",
    };
  }
};
export default customerService;
