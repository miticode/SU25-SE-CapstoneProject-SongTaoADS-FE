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
  const [depositPercentChanged, setDepositPercentChanged] = useState("");
  const [contractFile, setContractFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [preview, setPreview] = useState("");

  // Validation states
  const [contractNumberError, setContractNumberError] = useState("");
  const [depositPercentError, setDepositPercentError] = useState("");

  // Validation functions
  const validateContractNumber = (value) => {
    if (!value || value.trim() === "") {
      return "Số hợp đồng không được để trống";
    }
    if (value.trim().length > 50) {
      return "Số hợp đồng không được vượt quá 50 ký tự";
    }
    // Kiểm tra định dạng số hợp đồng (chỉ cho phép chữ, số, dấu gạch ngang và dấu chấm)
    const contractNumberRegex = /^[a-zA-Z0-9.\-/]+$/;
    if (!contractNumberRegex.test(value.trim())) {
      return "Số hợp đồng chỉ được chứa chữ cái, số, dấu gạch ngang (-), dấu chấm (.) và dấu gạch chéo (/)";
    }
    return "";
  };

  const validateDepositPercent = (value) => {
    if (!value || value.toString().trim() === "") {
      return "Phần trăm đặt cọc không được để trống";
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Phần trăm đặt cọc phải là một số hợp lệ";
    }
    if (numValue < 0) {
      return "Phần trăm đặt cọc không được âm";
    }
    if (numValue > 100) {
      return "Phần trăm đặt cọc không được vượt quá 100%";
    }
    if (numValue === 0) {
      return "Phần trăm đặt cọc phải lớn hơn 0%";
    }
    return "";
  };

  const validateFile = (file) => {
    if (!file) {
      return "Vui lòng chọn file hợp đồng";
    }

    // Kiểm tra định dạng file
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return "Vui lòng chỉ tải lên file PDF, JPEG hoặc PNG";
    }

    // Kiểm tra kích thước file (giới hạn 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "Kích thước file không được vượt quá 10MB";
    }

    return "";
  };

  // Reset form when dialog opens or closes
  React.useEffect(() => {
    if (open) {
      setContractNumber("");
      setDepositPercentChanged("");
      setContractFile(null);
      setFileError("");
      setPreview("");
      setError(null);
      setSuccess(false);
      // Reset validation errors
      setContractNumberError("");
      setDepositPercentError("");
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
  }, [success, onSuccess, handleClose]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setContractFile(null);
      setFileError("");
      setPreview("");
      return;
    }

    // Validate file using the new validation function
    const fileValidationError = validateFile(file);
    if (fileValidationError) {
      setFileError(fileValidationError);
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

  // Handle contract number change with validation
  const handleContractNumberChange = (e) => {
    const value = e.target.value;
    setContractNumber(value);

    // Real-time validation
    const error = validateContractNumber(value);
    setContractNumberError(error);
  };

  // Handle deposit percent change with validation
  const handleDepositPercentChange = (e) => {
    const value = e.target.value;
    setDepositPercentChanged(value);

    // Real-time validation
    const error = validateDepositPercent(value);
    setDepositPercentError(error);
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

    // Validate all fields before submission
    const contractNumberValidation = validateContractNumber(contractNumber);
    const depositPercentValidation = validateDepositPercent(
      depositPercentChanged
    );
    const fileValidation = validateFile(contractFile);

    // Set all validation errors
    setContractNumberError(contractNumberValidation);
    setDepositPercentError(depositPercentValidation);
    setFileError(fileValidation);

    // Check if there are any validation errors
    if (
      contractNumberValidation ||
      depositPercentValidation ||
      fileValidation
    ) {
      setError("Vui lòng kiểm tra và sửa các lỗi trong form");
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
      formData.append("depositPercentChanged", depositPercentChanged);

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
            onChange={handleContractNumberChange}
            required
            error={!!contractNumberError}
            helperText={contractNumberError || "Nhập số hợp đồng ( lớn hơn 0)"}
          />

          <TextField
            label="Phần trăm đặt cọc (%)"
            type="number"
            fullWidth
            margin="normal"
            value={depositPercentChanged}
            onChange={handleDepositPercentChange}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            helperText={
              depositPercentError || "Nhập phần trăm đặt cọc (1-100%)"
            }
            required
            error={!!depositPercentError}
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
            disabled={
              loading ||
              !contractFile ||
              !contractNumber ||
              !depositPercentChanged ||
              !!contractNumberError ||
              !!depositPercentError ||
              !!fileError
            }
          >
            {loading ? <CircularProgress size={24} /> : "Tải lên"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContractUploadForm;
