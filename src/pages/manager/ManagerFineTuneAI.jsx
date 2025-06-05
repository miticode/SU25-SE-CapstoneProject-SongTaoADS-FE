import React, { useState } from "react";
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

const ManagerFineTuneAI = () => {
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [modelStatus, setModelStatus] = useState("Latest model loaded");
  const [file, setFile] = useState(null);
  const [alert, setAlert] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAlert(null);
  };

  const handleUpload = () => {
    if (!file) {
      setAlert({ type: "warning", message: "Please select a file to upload." });
      return;
    }
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setAlert({ type: "success", message: "Data uploaded successfully!" });
    }, 2000);
  };

  const handleTrain = () => {
    setTraining(true);
    setModelStatus("Training in progress...");
    setTimeout(() => {
      setTraining(false);
      setModelStatus("New model trained and loaded!");
      setAlert({ type: "success", message: "AI model trained successfully!" });
    }, 4000);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Fine Tune AI
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Upload new training data, start training, and manage your AI model. This
        feature allows managers to fine-tune the AI for better performance and
        get the latest model.
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
          1. Upload Training Data
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
            sx={{ borderRadius: 2 }}
          >
            {file ? file.name : "Select File"}
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          <Button
            variant="outlined"
            onClick={handleUpload}
            disabled={uploading || !file}
            sx={{ borderRadius: 2 }}
          >
            Upload
          </Button>
        </Box>
        {uploading && <LinearProgress sx={{ mt: 2, width: 200 }} />}
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
          2. Train AI Model
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<AutorenewIcon />}
            onClick={handleTrain}
            disabled={training}
            sx={{ borderRadius: 2 }}
          >
            {training ? "Training..." : "Start Training"}
          </Button>
          <Typography
            variant="body2"
            color={training ? "warning.main" : "success.main"}
          >
            {modelStatus}
          </Typography>
        </Box>
        {training && <LinearProgress sx={{ mt: 2, width: 200 }} />}
      </Paper>
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}
      >
        <Typography variant="h6" mb={2}>
          3. Download Latest Model
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CheckCircleIcon />}
          sx={{ borderRadius: 2 }}
        >
          Download Model
        </Button>
        <Typography variant="body2" color="text.secondary" mt={1}>
          The latest trained model is available for download.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ManagerFineTuneAI;
