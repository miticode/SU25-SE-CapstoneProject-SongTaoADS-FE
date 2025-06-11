import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Divider,
  TextField,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  uploadFileFineTune,
  fineTuneModel,
  cancelFineTuneJob,
  deleteFineTuneFile,
  resetFineTuneStatus,
  selectFineTuneStatus,
  selectTrainingStatus,
  selectUploadedFile,
  selectChatError,
  selectFineTuningJobId,
} from "../../store/features/chat/chatSlice";

const ManagerFineTuneAI = () => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [alert, setAlert] = useState(null);

  const fineTuneStatus = useSelector(selectFineTuneStatus);
  const trainingStatus = useSelector(selectTrainingStatus);
  const uploadedFile = useSelector(selectUploadedFile);
  const error = useSelector(selectChatError);
  const fineTuningJobId = useSelector(selectFineTuningJobId);

  useEffect(() => {
    return () => {
      dispatch(resetFineTuneStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setAlert({ type: "error", message: error });
    }
  }, [error]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAlert(null);
  };

  const handleRemoveFile = async () => {
    setAlert(null);
    if (uploadedFile && uploadedFile.id) {
      try {
        await dispatch(deleteFineTuneFile(uploadedFile.id)).unwrap();
        setFile(null);
        setAlert({ type: "success", message: "Đã xoá file khỏi server." });
      } catch (error) {
        setAlert({ type: "error", message: error || "Lỗi khi xoá file" });
      }
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setAlert({ type: "warning", message: "Vui lòng chọn file để upload." });
      return;
    }

    try {
      await dispatch(uploadFileFineTune(file)).unwrap();
      setAlert({ type: "success", message: "Upload file thành công!" });
    } catch (error) {
      setAlert({ type: "error", message: error || "Lỗi khi upload file" });
    }
  };

  const handleTrain = async () => {
    if (!uploadedFile) {
      setAlert({
        type: "warning",
        message: "Vui lòng upload file trước khi training.",
      });
      return;
    }

    try {
      await dispatch(
        fineTuneModel({
          model: "gpt-3.5-turbo", // hoặc model phù hợp của bạn
          trainingFile: uploadedFile.id,
        })
      ).unwrap();
      setAlert({ type: "success", message: "Training model thành công!" });
    } catch (error) {
      setAlert({ type: "error", message: error || "Lỗi khi training model" });
    }
  };

  const handleCancelTraining = async () => {
    if (!fineTuningJobId) return;
    try {
      await dispatch(cancelFineTuneJob(fineTuningJobId)).unwrap();
      setAlert({ type: "info", message: "Đã huỷ training." });
    } catch (error) {
      setAlert({ type: "error", message: error || "Lỗi khi huỷ training" });
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Fine Tune AI
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Upload dữ liệu training mới, bắt đầu training và quản lý model AI của
        bạn. Tính năng này cho phép quản lý fine-tune AI để có hiệu suất tốt hơn
        và lấy model mới nhất.
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          mb: 3,
        }}
      >
        <Typography variant="h6" mb={2}>
          1. Upload Dữ Liệu Training
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            disabled={fineTuneStatus === "loading"}
            sx={{ borderRadius: 2 }}
          >
            {file ? file.name : "Chọn File"}
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {(file || uploadedFile) && (
            <DeleteIcon
              color="error"
              sx={{ cursor: "pointer" }}
              onClick={handleRemoveFile}
            />
          )}
          <Button
            variant="outlined"
            onClick={handleUpload}
            disabled={fineTuneStatus === "loading" || !file}
            sx={{ borderRadius: 2 }}
          >
            Upload
          </Button>
        </Box>
        {fineTuneStatus === "loading" && (
          <LinearProgress sx={{ mt: 2, width: 200 }} />
        )}
        {alert && (
          <Alert severity={alert.type} sx={{ mt: 2, width: 300 }}>
            {alert.message}
          </Alert>
        )}
      </Paper>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          mb: 3,
        }}
      >
        <Typography variant="h6" mb={2}>
          2. Training Model AI
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<AutorenewIcon />}
            onClick={handleTrain}
            disabled={trainingStatus === "loading" || !uploadedFile}
            sx={{ borderRadius: 2 }}
          >
            {trainingStatus === "loading"
              ? "Đang Training..."
              : "Bắt Đầu Training"}
          </Button>
          {trainingStatus === "loading" && fineTuningJobId && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelTraining}
              sx={{ borderRadius: 2 }}
            >
              Huỷ Training
            </Button>
          )}
          <Typography
            variant="body2"
            color={
              trainingStatus === "loading"
                ? "warning.main"
                : trainingStatus === "cancelled"
                ? "error.main"
                : trainingStatus === "succeeded"
                ? "success.main"
                : "text.secondary"
            }
          >
            {trainingStatus === "loading" && "Đang training..."}
            {trainingStatus === "cancelled" && "Đã huỷ training"}
            {/* Nếu có API kiểm tra trạng thái job, có thể hiển thị "Training thành công!" khi job hoàn thành */}
          </Typography>
        </Box>
        {trainingStatus === "loading" && (
          <LinearProgress sx={{ mt: 2, width: 200 }} />
        )}
      </Paper>
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}
      >
        <Typography variant="h6" mb={2}>
          3. Tải Model Mới Nhất
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CheckCircleIcon />}
          sx={{ borderRadius: 2 }}
        >
          Tải Model
        </Button>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Model đã training mới nhất có sẵn để tải xuống.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ManagerFineTuneAI;
