import axios from "axios";

// Sử dụng URL backend từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL;
// Lấy token
const getToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

// API để tạo AI design
export const createAIDesignApi = async (
  customerDetailId,
  designTemplateId,
  customerNote,
  editedImage
) => {
  try {
    const formData = new FormData();

    // Đảm bảo customerNote không bao giờ là null/undefined
    const safeNote =
      typeof customerNote === "string"
        ? customerNote
        : "Thiết kế từ người dùng";
    console.log("Setting customerNote:", safeNote);

    // Thêm các trường vào FormData
    formData.append("customerNote", safeNote);

    // Thêm file ảnh - đổi từ aiImage thành editedImage
    if (editedImage) {
      formData.append("editedImage", editedImage);
    }

    const token = getToken();

    // Log formData để kiểm tra
    for (let pair of formData.entries()) {
      console.log(
        pair[0] + ": " + (pair[0] === "editedImage" ? "Image File" : pair[1])
      );
    }

    // Cập nhật URL endpoint
    const response = await axios.post(
      `${API_URL}/api/customer-details/${customerDetailId}/design-templates/${designTemplateId}/edited-designs`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};
export const generateImageFromTextApi = async (
  designTemplateId,
  prompt,
  width = 512,
  height = 512
) => {
  try {
    const formData = new FormData();
    formData.append("prompt", prompt);

    const token = getToken();

    // Log để debug
    console.log("Sending text-to-image request:");
    console.log("Design Template ID:", designTemplateId);
    console.log("Prompt:", prompt);
    console.log("Width:", width);
    console.log("Height:", height);

    // Tạo URL với query parameters
    const url = new URL(
      `${API_URL}/api/design-templates/${designTemplateId}/txt2img`
    );
    url.searchParams.append("width", width.toString());
    url.searchParams.append("height", height.toString());

    const response = await axios.post(url.toString(), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob", // Important: to handle binary image data
    });

    // Convert blob to URL for display
    const imageUrl = URL.createObjectURL(response.data);

    // Only return the URL, not the blob itself
    return { success: true, imageUrl };
  } catch (error) {
    console.error(
      "Text-to-Image API Error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to generate image from text",
    };
  }
};

// API để kiểm tra tiến trình Stable Diffusion
export const checkStableDiffusionProgressApi = async () => {
  try {
    const token = getToken();

    console.log("Checking Stable Diffusion progress...");

    const response = await axios.post(
      `${API_URL}/api/stable-diffusion/progress`,
      {}, // Empty body for POST request
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Progress API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Stable Diffusion Progress API Error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to check progress",
    };
  }
};
