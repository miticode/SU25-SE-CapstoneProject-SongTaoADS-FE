import axios from "axios";
// Sử dụng proxy trong development để tránh CORS

const API_URL = "https://songtaoads.online";

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
      "/api/chat-bot/upload-file-finetune",
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
    const response = await chatService.post("/api/chat-bot/finetune-model", {
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
      `/api/chat-bot/${fineTuningJobId}/fine-tuning-jobs/cancel`
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
    const response = await chatService.delete(`/api/chat-bot/files/${fileId}`);
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
    const response = await chatService.get("/api/chat-bot/fine-tune-jobs");
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
    const response = await chatService.get("/api/chat-bot/files");
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
    const response = await chatService.get(`/api/chat-bot/files/${fileId}`);
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

// Chọn model để chat từ list job
export const selectModelForChatApi = async (fineTuningJobId) => {
  try {
    const response = await chatService.post(
      `/api/chat-bot/${fineTuningJobId}/fine-tuning-jobs/select-model`
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

// Upload file excel để convert thành file jsonl
export const uploadFileExcelApi = async (file, fileName) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await chatService.post(
      `/api/chat-bot/upload-file-excel?fileName=${encodeURIComponent(
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

// Lấy chi tiết job đã fine-tune
export const getFineTuneJobDetailApi = async (fineTuneJobId) => {
  try {
    const response = await chatService.get(
      `/api/chat-bot/${fineTuneJobId}/fine-tune-jobs`
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

// Lấy danh sách tất cả các model OpenAI
export const getOpenAiModelsApi = async () => {
  try {
    const response = await chatService.get("/api/chat-bot/models");
    const { success, result, message } = response.data;
    if (success) return { success, result };
    return { success: false, error: message || "Lỗi khi lấy danh sách model" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể lấy danh sách model",
    };
  }
};

// Lấy danh sách tất cả các model đã fine-tune (có phân trang)
export const getFineTunedModelsApi = async (page = 1, size = 10) => {
  try {
    const response = await chatService.get(
      `/api/chat-bot/models-fine-tune?page=${page}&size=${size}`
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
