import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadRevisedContract,
  selectContractLoading,
} from "../store/features/contract/contractSlice";

const UploadRevisedContract = ({ open, onClose, contractId, onSuccess }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectContractLoading);

  const [formData, setFormData] = useState({
    depositPercentChanged: "",
    contractFile: null,
  });
  const [error, setError] = useState("");
  useEffect(() => {
    if (open && !contractId) {
      setError("Không có ID hợp đồng để upload");
    } else {
      setError("");
    }
  }, [open, contractId]);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Chỉ chấp nhận file PDF, DOC, DOCX");
        return;
      }

      // Kiểm tra kích thước file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File không được vượt quá 10MB");
        return;
      }

      setFormData((prev) => ({ ...prev, contractFile: file }));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // THÊM VALIDATION
    if (!contractId) {
      setError("Không có ID hợp đồng để upload");
      return;
    }

    if (!formData.contractFile) {
      setError("Vui lòng chọn file hợp đồng");
      return;
    }

    console.log("Uploading to contractId:", contractId); // DEBUG LOG

    try {
      const submitFormData = new FormData();
      submitFormData.append("contactFile", formData.contractFile); // Lưu ý: API dùng 'contactFile'

      if (formData.depositPercentChanged) {
        submitFormData.append(
          "depositPercentChanged",
          formData.depositPercentChanged
        );
      }

      const result = await dispatch(
        uploadRevisedContract({
          contractId,
          formData: submitFormData,
        })
      );

      if (uploadRevisedContract.fulfilled.match(result)) {
        onSuccess && onSuccess(result.payload);
        handleClose();
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Có lỗi xảy ra khi tải lên hợp đồng: " + error.message);
    }
  };

  const handleClose = () => {
    setFormData({
      depositPercentChanged: "",
      contractFile: null,
    });
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Hợp Đồng Chỉnh Sửa</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {contractId && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Contract ID: {contractId}
            </Alert>
          )}
          <TextField
            label="Tỷ lệ đặt cọc thay đổi (%)"
            type="number"
            fullWidth
            margin="normal"
            value={formData.depositPercentChanged}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                depositPercentChanged: e.target.value,
              }))
            }
            helperText="Để trống nếu không thay đổi tỷ lệ đặt cọc"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              File hợp đồng chỉnh sửa *
            </Typography>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ width: "100%", padding: "8px" }}
            />
            {formData.contractFile && (
              <Typography
                variant="caption"
                color="success.main"
                sx={{ mt: 1, display: "block" }}
              >
                Đã chọn: {formData.contractFile.name}
              </Typography>
            )}
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Chỉ chấp nhận file PDF, DOC, DOCX. Kích thước tối đa: 10MB
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.contractFile || !contractId} // THÊM !contractId
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Đang tải lên..." : "Upload"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UploadRevisedContract;
