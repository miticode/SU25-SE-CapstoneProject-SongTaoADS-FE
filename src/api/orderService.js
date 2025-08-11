import axios from "axios";

// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL;

// Tạo instance axios với interceptors
const orderService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Allow sending and receiving cookies from API
});

// Thêm interceptor request để gắn accessToken vào header Authorization
orderService.interceptors.request.use(
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
orderService.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm tạo đơn hàng mới với API /api/orders
export const createNewOrderApi = async (orderData) => {
  try {
    console.log("Gọi API tạo đơn hàng mới với:", orderData);

    // Kiểm tra token trước khi gọi API
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access Token:", accessToken ? "Có token" : "Không có token");

    if (!accessToken) {
      return {
        success: false,
        error: "Không tìm thấy token. Vui lòng đăng nhập lại.",
      };
    }

    const response = await orderService.post("/api/orders", {
      address: orderData.address,
      orderType: orderData.orderType, // AI_DESIGN, CUSTOM_DESIGN_WITH_CONSTRUCTION, CUSTOM_DESIGN_WITHOUT_CONSTRUCTION
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API tạo đơn hàng mới:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error creating new order:", error.response?.data || error);

    // Xử lý lỗi cụ thể
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        error: "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.",
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
        error: "Không có quyền thực hiện thao tác này.",
      };
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Không thể tạo đơn hàng. Vui lòng thử lại.",
    };
  }
};

// Hàm thêm chi tiết đơn hàng với API /api/orders/{orderId}/details
export const addOrderDetailApi = async (orderId, orderDetailData) => {
  try {
    console.log("Gọi API thêm chi tiết đơn hàng với:", {
      orderId,
      orderDetailData,
    });

    // Tạo request body theo đúng format API documentation
    const requestBody = {
      customDesignRequestId: orderDetailData.customDesignRequestId || "",
      editedDesignId: orderDetailData.editedDesignId || "",
      customerChoiceId: orderDetailData.customerChoiceId || "",
      quantity: orderDetailData.quantity || 1,
    };

    console.log("Sending request to:", `/api/orders/${orderId}/details`);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await orderService.post(
      `/api/orders/${orderId}/details`,
      requestBody
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API thêm chi tiết đơn hàng:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error adding order detail:", {
      url: `/api/orders/${orderId}/details`,
      request: {
        customDesignRequestId: orderDetailData.customDesignRequestId || "",
        editedDesignId: orderDetailData.editedDesignId || "",
        customerChoiceId: orderDetailData.customerChoiceId || "",
        quantity: orderDetailData.quantity || 1,
      },
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      fullError: error.response,
      message: error.message,
    });

    // Log chi tiết error response để debug
    if (error.response?.data) {
      console.error(
        "Backend error details:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to add order detail",
    };
  }
};

// Hàm tạo đơn hàng mới theo customerChoiceId ( tạo đơn hàng bằng AI)
export const createOrderApi = async (customerChoiceId, orderData) => {
  try {
    // Lấy userId từ accessToken trong localStorage nếu chưa có trong orderData
    let userId = orderData.userId;
    if (!userId) {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        // Giả sử accessToken là JWT, giải mã để lấy userId
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        userId = payload.userId || payload.id || payload.sub;
      }
    }
    console.log("Gọi API tạo order với:", { customerChoiceId, orderData });
    const response = await orderService.post(
      `/api/customer-choices/${customerChoiceId}/orders`,
      {
        totalAmount: orderData.totalAmount,
        depositAmount: orderData.depositAmount,
        remainingAmount: orderData.remainingAmount,
        note: orderData.note,
        isCustomDesign: orderData.isCustomDesign,
        histories: orderData.histories || [],
        userId: userId,
        aiDesignId: orderData.aiDesignId,
      }
    );

    const { success, result, message } = response.data;

    if (success) {
      // Ensure histories is included in the response
      const formattedResult = {
        ...result,
        histories: result.histories || {
          productTypeName: "",
          calculateFormula: "",
          totalAmount: result.totalAmount,
          attributeSelections: [],
          sizeSelections: [],
        },
      };
      console.log("Kết quả trả về từ API tạo order:", {
        success,
        result: formattedResult,
      });
      return { success: true, data: formattedResult };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create order",
    };
  }
};
export const createAiOrderApi = async (
  editedDesignId,
  customerChoiceId,
  orderData
) => {
  try {
    console.log("Gọi API tạo AI order với:", {
      editedDesignId,
      customerChoiceId,
      orderData,
    });

    const response = await orderService.post(
      `/api/edited-designs/${editedDesignId}/customer-choices/${customerChoiceId}/orders`,
      {
        totalAmount: orderData.totalAmount,
        depositAmount: orderData.depositAmount || 0,
        remainingAmount: orderData.remainingAmount || orderData.totalAmount,
        note: orderData.note || "",
        address: orderData.address || "",
        deliveryDate: orderData.deliveryDate || null,
        histories: orderData.histories || [],
        // thêm vô
        status: "PENDING",
      }
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API tạo AI order:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error creating AI order:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create AI order",
    };
  }
};
// Hàm lấy danh sách đơn hàng
export const getOrdersApi = async (orderStatus = null, page = 1, size = 10, orderType = null) => {
  try {
    console.log("Gọi API lấy danh sách đơn hàng với params:", {
      orderStatus,
      page,
      size,
      orderType
    });

    const params = { page, size };

    // Thêm orderStatus vào query params nếu có và không phải empty string
    if (orderStatus && orderStatus !== "" && orderStatus !== "ALL") {
      params.orderStatus = orderStatus;
    }

    // Thêm orderType vào query params nếu có
    if (orderType && orderType !== "" && orderType !== "ALL") {
      params.orderType = orderType;
    }

    const response = await orderService.get('/api/orders', { params });

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
      console.log("Kết quả trả về từ API lấy danh sách đơn hàng:", {
        success,
        totalOrders: result?.length,
        currentPage,
        totalPages,
        timestamp
      });

      return {
        success: true,
        data: result || [],
        pagination: {
          currentPage: currentPage || page,
          totalPages: totalPages || 1,
          pageSize: pageSize || size,
          totalElements: totalElements || 0,
        },
        timestamp,
        message
      };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error fetching orders:", error.response?.data || error);
    
    // Xử lý lỗi cụ thể
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        error: "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.",
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
        error: "Không có quyền truy cập danh sách đơn hàng.",
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || "Không thể tải danh sách đơn hàng. Vui lòng thử lại.",
    };
  }
};

// Hàm cập nhật trạng thái đơn hàng
// export const updateOrderStatusApi = async (orderId, data) => {
//   try {
//     const response = await orderService.put(`/api/orders/${orderId}`, data);
//     const { success, result, message } = response.data;
//     if (success) {
//       return { success: true, data: result };
//     }
//     return { success: false, error: message || 'Invalid response format' };
//   } catch (error) {
//     return {
//       success: false,
//       error: error.response?.data?.message || 'Failed to update order status'
//     };
//   }
// };

// Hàm lấy chi tiết đơn hàng theo ID
export const getOrderByIdApi = async (orderId) => {
  try {
    const response = await orderService.get(`/api/orders/${orderId}`);

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return {
      success: false,
      error: message || "Định dạng phản hồi không hợp lệ",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Không thể lấy thông tin chi tiết đơn hàng",
    };
  }
};

// Lấy danh sách đơn hàng theo userId
export const getOrdersByUserIdApi = async (userId, page = 1, size = 10) => {
  try {
    const params = { page, size };
    
    const response = await orderService.get(`/api/users/${userId}/orders`, { params });
    
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
      error: error.response?.data?.message || "Failed to fetch orders",
    };
  }
};

// Lấy chi tiết đơn hàng theo orderId
export const getOrderDetailsApi = async (orderId) => {
  try {
    console.log("Gọi API lấy chi tiết đơn hàng với orderId:", orderId);

    const response = await orderService.get(`/api/orders/${orderId}/details`);

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API lấy chi tiết đơn hàng:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error fetching order details:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch order details",
    };
  }
};

// Cập nhật trạng thái đơn hàng (status)
export const updateOrderStatusApi = async (orderId, status) => {
  try {
    const response = await orderService.put(
      `/api/orders/${orderId}/status?status=${status}`
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update order status",
    };
  }
};

// Tạo đơn hàng mới theo customDesignId ( tạo đơn hàng bằng custom design)
export const createOrderByCustomDesignApi = async (
  customDesignId,
  orderData
) => {
  try {
    const response = await orderService.post(
      `/api/custom-designs/${customDesignId}/orders`,
      orderData
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to create order by custom design",
    };
  }
};

// Xác nhận sale cho đơn hàng
export const saleConfirmOrderApi = async (orderId, data) => {
  try {
    const response = await orderService.patch(
      `/api/orders/${orderId}/sale-confirm`,
      data
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to confirm sale",
    };
  }
};

// Cập nhật thông tin khách hàng cho đơn hàng
export const updateOrderCustomerInfoApi = async (orderId, data) => {
  try {
    const response = await orderService.patch(
      `/api/orders/${orderId}/customer-information`,
      data
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to update customer information",
    };
  }
};

// Xóa đơn hàng
export const deleteOrderApi = async (orderId) => {
  try {
    console.log("Gọi API xóa đơn hàng với orderId:", orderId);

    const response = await orderService.delete(`/api/orders/${orderId}`);

    const { success, result, message, timestamp } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API xóa đơn hàng:", {
        success,
        result,
        message,
        timestamp,
      });
      return { success: true, data: result, message, timestamp };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error deleting order:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete order",
    };
  }
};
// Tạo đơn hàng từ request thiết kế
export const createOrderFromDesignRequestApi = async (
  customDesignRequestId
) => {
  try {
    const response = await orderService.post(
      `/api/custom-design-request/${customDesignRequestId}/orders`
    );

    const { success, result, message } = response.data;

    if (success) {
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error(
      "Error creating order from design request:",
      error.response?.data || error
    );
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to create order from design request",
    };
  }
};
export const contractResignOrderApi = async (orderId) => {
  try {
    console.log("Gọi API ký lại hợp đồng với orderId:", orderId);

    const response = await orderService.patch(
      `/api/orders/${orderId}/contract-resign`
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API ký lại hợp đồng:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error(
      "Error contract resign order:",
      error.response?.data || error
    );
    return {
      success: false,
      error: error.response?.data?.message || "Failed to contract resign order",
    };
  }
};
export const contractSignedOrderApi = async (orderId) => {
  try {
    console.log("Gọi API đánh dấu hợp đồng đã ký với orderId:", orderId);

    const response = await orderService.patch(
      `/api/orders/${orderId}/contract-signed`
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API contract-signed:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error(
      "Error contract signed order:",
      error.response?.data || error
    );
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to mark contract as signed",
    };
  }
};
export const updateOrderAddressApi = async (orderId, addressData) => {
  try {
    console.log("Gọi API cập nhật địa chỉ đơn hàng với:", {
      orderId,
      addressData,
    });

    const response = await orderService.patch(
      `/api/orders/${orderId}/address`,
      {
        address: addressData.address,
        note: addressData.note,
      }
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật địa chỉ:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error(
      "Error updating order address:",
      error.response?.data || error
    );
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update order address",
    };
  }
};
export const updateOrderEstimatedDeliveryDateApi = async (
  orderId,
  estimatedDeliveryDate,
  contractorId
) => {
  try {
    console.log("Gọi API cập nhật ngày giao hàng dự kiến với:", {
      orderId,
      estimatedDeliveryDate,
      contractorId,
    });

    const response = await orderService.patch(
      `/api/orders/${orderId}/estimate-delivery-date`,
      {
        estimatedDeliveryDate: estimatedDeliveryDate,
        contractorId: contractorId,
      }
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật ngày giao hàng:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error(
      "Error updating order estimated delivery date:",
      error.response?.data || error
    );
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to update estimated delivery date",
    };
  }
};
export const updateOrderToProducingApi = async (orderId, draftImageFile) => {
  try {
    console.log("Gọi API cập nhật trạng thái PRODUCING với:", {
      orderId,
      draftImageFile,
    });

    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append("draftImage", draftImageFile);

    const response = await orderService.patch(
      `/api/orders/${orderId}/producing`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật PRODUCING:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error(
      "Error updating order to producing:",
      error.response?.data || error
    );
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to update order to producing",
    };
  }
};
export const updateOrderToProductionCompletedApi = async (
  orderId,
  productImageFile
) => {
  try {
    console.log("Gọi API cập nhật trạng thái PRODUCTION_COMPLETED với:", {
      orderId,
      productImageFile,
    });

    // Validate input
    if (!orderId) {
      throw new Error("orderId is required");
    }

    if (!productImageFile) {
      throw new Error("productImageFile is required");
    }

    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append("productImage", productImageFile);

    const response = await orderService.patch(
      `/api/orders/${orderId}/production-completed`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật PRODUCTION_COMPLETED:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error(
      "Error updating order to production completed:",
      error.response?.data || error
    );
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to update order to production completed",
    };
  }
};
export const updateOrderToDeliveringApi = async (
  orderId,
  deliveryImageFile
) => {
  try {
    console.log("Gọi API cập nhật trạng thái DELIVERING với:", {
      orderId,
      deliveryImageFile,
    });

    // Validate input
    if (!orderId) {
      throw new Error("orderId is required");
    }

    if (!deliveryImageFile) {
      throw new Error("deliveryImageFile is required");
    }

    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append("deliveryImage", deliveryImageFile);

    const response = await orderService.patch(
      `/api/orders/${orderId}/delivering`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật DELIVERING:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error(
      "Error updating order to delivering:",
      error.response?.data || error
    );
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to update order to delivering",
    };
  }
};
export const updateOrderToInstalledApi = async (
  orderId,
  installedImageFile
) => {
  try {
    console.log("Gọi API cập nhật trạng thái INSTALLED với:", {
      orderId,
      installedImageFile,
    });

    // Validate input
    if (!orderId) {
      throw new Error("orderId is required");
    }

    if (!installedImageFile) {
      throw new Error("installedImageFile is required");
    }

    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append("installedImage", installedImageFile);

    const response = await orderService.patch(
      `/api/orders/${orderId}/installed`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật INSTALLED:", {
        success,
        result,
      });
      return { success: true, data: result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error(
      "Error updating order to installed:",
      error.response?.data || error
    );
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to update order to installed",
    };
  }
};

// Hủy đơn hàng
export const cancelOrderApi = async (orderId) => {
  try {
    console.log("Gọi API hủy đơn hàng với orderId:", orderId);

    const response = await orderService.patch(`/api/orders/${orderId}/cancel`);

    const { success, result, message, timestamp } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API hủy đơn hàng:", {
        success,
        result,
        message,
        timestamp,
      });
      return { success: true, data: result, message, timestamp };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error canceling order:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to cancel order",
    };
  }
};

// Hàm lấy danh sách đơn hàng custom design
export const getCustomDesignOrdersApi = async (orderStatus = null, page = 1, size = 10) => {
  try {
    console.log("Gọi API lấy danh sách custom design orders với params:", {
      orderStatus,
      page,
      size
    });

    const params = { page, size };

    // Thêm orderStatus vào query params nếu có và không phải empty string
    if (orderStatus && orderStatus !== "" && orderStatus !== "ALL") {
      params.orderStatus = orderStatus;
    }

    const response = await orderService.get('/api/orders/custom-design', { params });

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
      console.log("Kết quả trả về từ API lấy danh sách custom design orders:", {
        success,
        totalOrders: result?.length,
        currentPage,
        totalPages,
        timestamp
      });

      return {
        success: true,
        data: result || [],
        pagination: {
          currentPage: currentPage || page,
          totalPages: totalPages || 1,
          pageSize: pageSize || size,
          totalElements: totalElements || 0,
        },
        timestamp,
        message
      };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    console.error("Error fetching custom design orders:", error.response?.data || error);
    
    // Xử lý lỗi cụ thể
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        error: "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.",
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
        error: "Không có quyền truy cập danh sách đơn hàng custom design.",
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || "Không thể tải danh sách đơn hàng custom design. Vui lòng thử lại.",
    };
  }
};

export default orderService;
