import axios from "axios";
// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL;

const chatService = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  withCredentials: true,
});

chatService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

chatService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Authentication error:", error.response.data);
      // You could handle logout or token refresh here
    }
    return Promise.reject(error);
  }
);

export const sendChatMessageApi = async (prompt) => {
  try {
    const response = await chatService.post("/api/chat-bot/chat", {
      prompt,
    });

    const { success, result, message } = response.data;

    if (success) {
      return { success, result };
    }

    return { success: false, error: message || "Invalid response format" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to send chat message",
    };
  }
};
// upload file để finetunefinetune
export const uploadFileFineTuneApi = async (file) => {
  try {
    const formData = new FormData();

    formData.append("file", file);
    const response = await chatService.post(
      "/api/fine-tune/upload-file-finetune",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const { success, result, message } = response.data;
    if (success) {
      return { success, result };
    }
    return { success: false, error: message || "Lỗi khi upload file" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể upload file",
    };
  }
};
// training model
export const fineTuneModelApi = async (model, trainingFile) => {
  try {
    const response = await chatService.post("/api/fine-tune/finetune-model", {
      model,
      training_file: trainingFile,
    });

    const { success, result, message } = response.data;
    if (success) {
      return { success, result };
    }
    return { success: false, error: message || "Lỗi khi fine-tune model" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể fine-tune model",
    };
  }
};
// hủy training model
export const cancelFineTuneJobApi = async (fineTuningJobId) => {
  try {
    const response = await chatService.post(
      `/api/fine-tune/${fineTuningJobId}/fine-tuning-jobs/cancel`
    );

    const { success, result, message } = response.data;
    if (success) {
      return { success, result };
    }
    return { success: false, error: message || "Lỗi khi huỷ training" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể huỷ training",
    };
  }
};
// xóa file
export const deleteFineTuneFileApi = async (fileId) => {
  try {
    const response = await chatService.delete(`/api/fine-tune/files/${fileId}`);
    const { success, result, message } = response.data;
    if (success) {
      return { success, result };
    }
    return { success: false, error: message || "Lỗi khi xóa file" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể xóa file",
    };
  }
};
// Lấy danh sách job fine-tune
export const getFineTuneJobsApi = async () => {
  try {
    const response = await chatService.get("/api/fine-tune/fine-tune-jobs");

    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Lỗi khi lấy danh sách job" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể lấy danh sách job",
    };
  }
};

// Lấy danh sách file
export const getFineTuneFilesApi = async () => {
  try {
    const response = await chatService.get("/api/fine-tune/files");

    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Lỗi khi lấy danh sách file" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể lấy danh sách file",
    };
  }
};

// Lấy chi tiết file
export const getFineTuneFileDetailApi = async (fileId) => {
  try {
    const response = await chatService.get(`/api/fine-tune/files/${fileId}`);
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Lỗi khi lấy chi tiết file" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể lấy chi tiết file",
    };
  }
};

// Lấy chi tiết job đã fine-tune
export const getFineTuneJobDetailApi = async (fineTuneJobId) => {
  try {
    const response = await chatService.get(
      `/api/fine-tune/${fineTuneJobId}/fine-tune-jobs`
    );
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Lỗi khi lấy chi tiết job" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể lấy chi tiết job",
    };
  }
};

// Chọn model để chat từ list model (model-chat)
export const selectModelForModelChatApi = async (modelChatId) => {
  try {
    const response = await chatService.post(
      `/api/model-chat/${modelChatId}/fine-tuning-jobs/select-model`
    );

    const { success, result, message } = response.data;
    if (success) {
      return { success, result };
    }
    return { success: false, error: message || "Lỗi khi chọn model" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể chọn model",
    };
  }
};

// Upload file excel để convert thành file jsonl (model-chat)
export const uploadFileExcelModelChatApi = async (file, fileName) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await chatService.post(
      `/api/model-chat/upload-file-excel?fileName=${encodeURIComponent(
        fileName
      )}`,

      formData
    );
    const { success, result, message } = response.data;
    if (success) {
      return { success, result };
    }
    return { success: false, error: message || "Lỗi khi upload file excel" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể upload file excel",
    };
  }
};

// Lấy danh sách tất cả các model đã fine-tune (model-chat, có phân trang)
export const getFineTunedModelsModelChatApi = async (page = 1, size = 10) => {
  try {
    const response = await chatService.get(
      `/api/model-chat/models-fine-tune?page=${page}&size=${size}`
    );
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return {
      success: false,
      error: message || "Lỗi khi lấy danh sách model fine-tune",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Không thể lấy danh sách model fine-tune",
    };
  }
};

// Lấy top 10 câu hỏi được hỏi nhiều nhất
export const getFrequentQuestionsApi = async () => {
  try {
    const response = await chatService.get("/api/chat-bot/frequent-questions");
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return {
      success: false,
      error: message || "Lỗi khi lấy danh sách câu hỏi thường gặp",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Không thể lấy danh sách câu hỏi thường gặp",
    };
  }
};

// Báo giá bảng quảng cáo truyền thống bằng chatbot
export const getTraditionalPricingApi = async (data) => {
  try {
    const response = await chatService.post(
      "/api/chat-bot/pricing/traditional",
      data
    );
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Lỗi khi báo giá truyền thống" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể báo giá truyền thống",
    };
  }
};

// Báo giá bảng quảng cáo hiện đại bằng chatbot
export const getModernPricingApi = async (data) => {
  try {
    const response = await chatService.post(
      "/api/chat-bot/pricing/modern",
      data
    );
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Lỗi khi báo giá hiện đại" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể báo giá hiện đại",
    };
  }
};

// Test chat với model dành cho staff
export const testChatApi = async (data) => {
  try {
    const response = await chatService.post("/api/chat-bot/test-chat", data);
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Lỗi khi test chat" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể test chat",
    };
  }
};
