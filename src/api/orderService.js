import axios from 'axios';


// Sử dụng URL backend trực tiếp
const API_URL = "https://songtaoads.online";

// Tạo instance axios với interceptors
const orderService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi và nhận cookies từ API
});

// Thêm interceptor request để gắn accessToken vào header Authorization
orderService.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
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

// Hàm tạo đơn hàng mới theo customerChoiceId ( tạo đơn hàng bằng AI)
export const createOrderApi = async (customerChoiceId, orderData) => {
  try {
    // Lấy userId từ accessToken trong localStorage nếu chưa có trong orderData
    let userId = orderData.userId;
    if (!userId) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        // Giả sử accessToken là JWT, giải mã để lấy userId
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        userId = payload.userId || payload.id || payload.sub;
      }
    }
    console.log("Gọi API tạo order với:", { customerChoiceId, orderData });
    const response = await orderService.post(`/api/customer-choices/${customerChoiceId}/orders`, {
      totalAmount: orderData.totalAmount,
      depositAmount: orderData.depositAmount,
      remainingAmount: orderData.remainingAmount,
      note: orderData.note,
      isCustomDesign: orderData.isCustomDesign,
      histories: orderData.histories || [],
      userId: userId,
      aiDesignId: orderData.aiDesignId
    });

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
          sizeSelections: []
        }
      };
      console.log("Kết quả trả về từ API tạo order:", { success, result: formattedResult });
      return { success: true, data: formattedResult };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create order'
    };
  }
};
export const createAiOrderApi = async (editedDesignId, customerChoiceId, orderData) => {
  try {
    console.log("Gọi API tạo AI order với:", { editedDesignId, customerChoiceId, orderData });

    const response = await orderService.post(`/api/edited-designs/${editedDesignId}/customer-choices/${customerChoiceId}/orders`, {
      totalAmount: orderData.totalAmount,
      depositAmount: orderData.depositAmount || 0,
      remainingAmount: orderData.remainingAmount || orderData.totalAmount,
      note: orderData.note || '',
      address: orderData.address || '',
      deliveryDate: orderData.deliveryDate || null,
      histories: orderData.histories || [],
      // thêm vô
      status: 'PENDING'
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API tạo AI order:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error creating AI order:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create AI order'
    };
  }
};
// Hàm lấy danh sách đơn hàng
export const getOrdersApi = async (orderStatus, page = 1, size = 10) => {
  if (!orderStatus) {
    throw new Error('orderStatus is required!');
  }
  try {
    const url = `/api/orders?orderStatus=${orderStatus}&page=${page}&size=${size}`;
    const response = await orderService.get(url);

    const { success, result, message, currentPage, totalPages, pageSize, totalElements } = response.data;

    if (success) {
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

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch orders'
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

    return { success: false, error: message || 'Định dạng phản hồi không hợp lệ' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể lấy thông tin chi tiết đơn hàng'
    };
  }
};

// Lấy danh sách đơn hàng theo userId
export const getOrdersByUserIdApi = async (userId) => {
  try {
    const response = await orderService.get(`/api/users/${userId}/orders`);
    const { success, result, message } = response.data;
    if (success) {
      return { success: true, data: result };
    }
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch orders'
    };
  }
};

// Cập nhật trạng thái đơn hàng (status)
export const updateOrderStatusApi = async (orderId, status) => {
  try {
   
    const response = await orderService.put(`/api/orders/${orderId}/status?status=${status}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update order status'
    };
  }
};

// Tạo đơn hàng mới theo customDesignId ( tạo đơn hàng bằng custom design)
export const createOrderByCustomDesignApi = async (customDesignId, orderData) => {
  try {
    const response = await orderService.post(`/api/custom-designs/${customDesignId}/orders`, orderData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create order by custom design'
    };
  }
};

// Xác nhận sale cho đơn hàng
export const saleConfirmOrderApi = async (orderId, data) => {
  try {
    const response = await orderService.patch(`/api/orders/${orderId}/sale-confirm`, data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to confirm sale'
    };
  }
};

// Cập nhật thông tin khách hàng cho đơn hàng
export const updateOrderCustomerInfoApi = async (orderId, data) => {
  try {
    const response = await orderService.patch(`/api/orders/${orderId}/customer-information`, data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update customer information'
    };
  }
};

// Xóa đơn hàng
export const deleteOrderApi = async (orderId) => {
  try {
    const response = await orderService.delete(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete order'
    };
  }
};
// Tạo đơn hàng từ request thiết kế
export const createOrderFromDesignRequestApi = async (customDesignRequestId) => {
  try {
    const response = await orderService.post(`/api/custom-design-request/${customDesignRequestId}/orders`);
    
    const { success, result, message } = response.data;
    
    if (success) {
      return { success: true, data: result };
    }
    
    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error creating order from design request:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create order from design request'
    };
  }
};
export const contractResignOrderApi = async (orderId) => {
  try {
    console.log("Gọi API ký lại hợp đồng với orderId:", orderId);
    
    const response = await orderService.patch(`/api/orders/${orderId}/contract-resign`);

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API ký lại hợp đồng:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error contract resign order:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to contract resign order'
    };
  }
};
export const contractSignedOrderApi = async (orderId) => {
  try {
    console.log("Gọi API đánh dấu hợp đồng đã ký với orderId:", orderId);
    
    const response = await orderService.patch(`/api/orders/${orderId}/contract-signed`);

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API contract-signed:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error contract signed order:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to mark contract as signed'
    };
  }
};
export const updateOrderAddressApi = async (orderId, addressData) => {
  try {
    console.log("Gọi API cập nhật địa chỉ đơn hàng với:", { orderId, addressData });
    
    const response = await orderService.patch(`/api/orders/${orderId}/address`, {
      address: addressData.address,
      note: addressData.note
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật địa chỉ:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error updating order address:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update order address'
    };
  }
};
export const updateOrderEstimatedDeliveryDateApi = async (orderId, estimatedDeliveryDate) => {
  try {
    console.log("Gọi API cập nhật ngày giao hàng dự kiến với:", { orderId, estimatedDeliveryDate });
    
    const response = await orderService.patch(`/api/orders/${orderId}/estimate-delivery-date`, {
      estimatedDeliveryDate: estimatedDeliveryDate
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật ngày giao hàng:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error updating order estimated delivery date:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update estimated delivery date'
    };
  }
};
export const updateOrderToProducingApi = async (orderId, draftImageFile) => {
  try {
    console.log("Gọi API cập nhật trạng thái PRODUCING với:", { orderId, draftImageFile });
    
    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append('draftImage', draftImageFile);
    
    const response = await orderService.patch(`/api/orders/${orderId}/producing`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật PRODUCING:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error updating order to producing:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update order to producing'
    };
  }
};
export const updateOrderToProductionCompletedApi = async (orderId, productImageFile) => {
  try {
    console.log("Gọi API cập nhật trạng thái PRODUCTION_COMPLETED với:", { orderId, productImageFile });
    
    // Validate input
    if (!orderId) {
      throw new Error('orderId is required');
    }
    
    if (!productImageFile) {
      throw new Error('productImageFile is required');
    }

    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append('productImage', productImageFile);
    
    const response = await orderService.patch(`/api/orders/${orderId}/production-completed`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật PRODUCTION_COMPLETED:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error updating order to production completed:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update order to production completed'
    };
  }
};
export const updateOrderToDeliveringApi = async (orderId, deliveryImageFile) => {
  try {
    console.log("Gọi API cập nhật trạng thái DELIVERING với:", { orderId, deliveryImageFile });
    
    // Validate input
    if (!orderId) {
      throw new Error('orderId is required');
    }
    
    if (!deliveryImageFile) {
      throw new Error('deliveryImageFile is required');
    }

    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append('deliveryImage', deliveryImageFile);
    
    const response = await orderService.patch(`/api/orders/${orderId}/delivering`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật DELIVERING:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error updating order to delivering:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update order to delivering'
    };
  }
};
export const updateOrderToInstalledApi = async (orderId, installedImageFile) => {
  try {
    console.log("Gọi API cập nhật trạng thái INSTALLED với:", { orderId, installedImageFile });
    
    // Validate input
    if (!orderId) {
      throw new Error('orderId is required');
    }
    
    if (!installedImageFile) {
      throw new Error('installedImageFile is required');
    }

    // Tạo FormData để upload file
    const formData = new FormData();
    formData.append('installedImage', installedImageFile);
    
    const response = await orderService.patch(`/api/orders/${orderId}/installed`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { success, result, message } = response.data;

    if (success) {
      console.log("Kết quả trả về từ API cập nhật INSTALLED:", { success, result });
      return { success: true, data: result };
    }

    return { success: false, error: message || 'Invalid response format' };
  } catch (error) {
    console.error("Error updating order to installed:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update order to installed'
    };
  }
};
export default orderService;
