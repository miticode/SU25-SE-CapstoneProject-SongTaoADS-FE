import axios from 'axios';

// Cập nhật URL API thực tế của bạn
const API_URL = 'https://songtaoads.online';

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
export const createAiOrderApi = async (aiDesignId, customerChoiceId, orderData) => {
  try {
    console.log("Gọi API tạo AI order với:", { aiDesignId, customerChoiceId, orderData });
    
    const response = await orderService.post(`/api/ai-designs/${aiDesignId}/customer-choices/${customerChoiceId}/orders`, {
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
export const getOrdersApi = async (orderStatus) => {
  if (!orderStatus) {
    throw new Error('orderStatus is required!');
  }
  try {
    const url = `/api/orders?orderStatus=${orderStatus}`;
    const response = await orderService.get(url);

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
export default orderService;