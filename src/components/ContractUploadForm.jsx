import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import axios from "axios";

const API_URL = "https://songtaoads.online";

const ContractUploadForm = ({ open, handleClose, orderId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [contractNumber, setContractNumber] = useState("");
  const [contractFile, setContractFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [preview, setPreview] = useState("");

  // Reset form when dialog opens or closes
  React.useEffect(() => {
    if (open) {
      setContractNumber("");
      setContractFile(null);
      setFileError("");
      setPreview("");
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  // Handle success state
  React.useEffect(() => {
    if (success) {
      // Chú ý: Chỉ gọi onSuccess() một lần tại đây, khi success = true
      if (onSuccess) {
        // Đặt timeout để đảm bảo xử lý state được đồng bộ
        setTimeout(() => {
          onSuccess();
        }, 0);
      }

      // Đặt timeout để đóng dialog sau khi hiển thị thông báo thành công
      const timer = setTimeout(() => {
        handleClose();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setFileError("Vui lòng chỉ tải lên file PDF, JPEG hoặc PNG");
      setContractFile(null);
      setPreview("");
      return;
    }

    setContractFile(file);
    setFileError("");

    // Create preview if it's an image
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(""); // No preview for PDF
    }
  };

  const uploadContract = async (orderId, formData) => {
    const token = localStorage.getItem("accessToken");

    try {
      // Log the formData contents for debugging
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const response = await axios.post(
        `${API_URL}/api/orders/${orderId}/contract`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: response.data.success,
        data: response.data.result,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error uploading contract:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        throw new Error(
          error.response.data?.message ||
            "Bad Request: Kiểm tra dữ liệu nhập vào"
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        throw new Error("Không nhận được phản hồi từ máy chủ");
      } else {
        // Something happened in setting up the request
        throw new Error("Lỗi khi gửi yêu cầu: " + error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contractFile) {
      setFileError("Vui lòng chọn file hợp đồng");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData - Make sure key names match API expectations
      const formData = new FormData();

      // Rename key from 'contractFile' to 'contactFile' to match API requirement
      formData.append("contactFile", contractFile);
      formData.append("contractNumber", contractNumber);

      // Add optional deposit percent if needed
      // formData.append('depositPercentChanged', 30); // Example: 30%

      // Call API directly
      const result = await uploadContract(orderId, formData);

      if (result.success) {
        setSuccess(true);

        // Đóng form sau khi upload thành công - di chuyển logic từ useEffect
        setTimeout(() => {
          if (onSuccess) onSuccess();
          setTimeout(() => handleClose(), 1500);
        }, 0);
      } else {
        setError(result.message || "Không thể tải lên hợp đồng");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Tải lên Hợp đồng</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Tải lên hợp đồng thành công!
            </Alert>
          )}

          <TextField
            label="Số hợp đồng"
            fullWidth
            margin="normal"
            value={contractNumber}
            onChange={(e) => setContractNumber(e.target.value)}
            required
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              File hợp đồng*
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1, mb: 1 }}
              disabled={loading}
            >
              Chọn file
              <input
                type="file"
                hidden
                accept="application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
              />
            </Button>

            {contractFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Đã chọn: {contractFile.name}
              </Typography>
            )}

            {fileError && (
              <Typography
                color="error"
                variant="caption"
                display="block"
                sx={{ mt: 1 }}
              >
                {fileError}
              </Typography>
            )}

            {preview && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Xem trước:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 1, mt: 1, maxHeight: 300, overflow: "auto" }}
                >
                  <img
                    src={preview}
                    alt="Contract preview"
                    style={{ width: "100%" }}
                  />
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !contractFile}
          >
            {loading ? <CircularProgress size={24} /> : "Tải lên"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContractUploadForm;
