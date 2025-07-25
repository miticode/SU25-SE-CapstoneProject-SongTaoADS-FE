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
  Autocomplete,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Chip,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
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
  fetchFineTuneJobs,
  fetchFineTuneFiles,
  fetchFineTuneFileDetail,
  selectFineTuneJobs,
  selectFineTuneJobsStatus,
  selectFineTuneFiles,
  selectFineTuneFilesStatus,
  selectFineTuneFileDetail,
  selectFineTuneFileDetailStatus,
  fetchFineTuneJobDetail,
  selectSucceededFineTuneJobs,
  // Model-chat API
  fetchFineTunedModelsModelChat,
  selectModelChatFineTunedModels,
  selectModelChatFineTunedModelsStatus,
  selectModelForModelChat,
  uploadFileExcelModelChat,
  testChat,
  selectFrequentQuestions,
  selectFrequentQuestionsStatus,
  fetchFrequentQuestions,
} from "../../store/features/chat/chatSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const getStatusColor = (status) => {
  switch (status) {
    case "succeeded":
      return "success";
    case "failed":
      return "error";
    case "cancelled":
      return "warning";
    default:
      return "default";
  }
};

const renderStatusChip = (status) => (
  <Chip
    label={status}
    color={getStatusColor(status)}
    size="small"
    sx={{ textTransform: "capitalize", fontWeight: 500 }}
  />
);

const ManagerFineTuneAI = () => {
  const dispatch = useDispatch();
  const modelChatFineTunedModels = useSelector(selectModelChatFineTunedModels);
  const modelChatFineTunedModelsStatus = useSelector(
    selectModelChatFineTunedModelsStatus
  );
  const [selectedModel, setSelectedModel] = useState("");
  const [tab, setTab] = useState(0);
  const [openFileDetail, setOpenFileDetail] = useState(false);
  const [fileFilter, setFileFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [filePage, setFilePage] = useState(0);
  const [fileRowsPerPage, setFileRowsPerPage] = useState(5);
  const [jobPage, setJobPage] = useState(0);
  const [jobRowsPerPage, setJobRowsPerPage] = useState(5);
  const [confirmDeleteFileId, setConfirmDeleteFileId] = useState(null);
  const [openJobDetail, setOpenJobDetail] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [jobDetailLoading, setJobDetailLoading] = useState(false);
  const [activeModelId, setActiveModelId] = useState(null);
  const [fileType, setFileType] = useState("jsonl");
  const [trainingFile, setTrainingFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [alert, setAlert] = useState(null);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const frequentQuestions = useSelector(selectFrequentQuestions);
  const frequentQuestionsStatus = useSelector(selectFrequentQuestionsStatus);

  const fineTuneStatus = useSelector(selectFineTuneStatus);
  const trainingStatus = useSelector(selectTrainingStatus);
  const uploadedFile = useSelector(selectUploadedFile);
  const error = useSelector(selectChatError);
  const fineTuningJobId = useSelector(selectFineTuningJobId);
  const fineTuneJobs = useSelector(selectFineTuneJobs);
  const fineTuneJobsStatus = useSelector(selectFineTuneJobsStatus);
  const fineTuneFiles = useSelector(selectFineTuneFiles);
  const fineTuneFilesStatus = useSelector(selectFineTuneFilesStatus);
  const fineTuneFileDetail = useSelector(selectFineTuneFileDetail);
  const fineTuneFileDetailStatus = useSelector(selectFineTuneFileDetailStatus);
  const succeededJobs = useSelector(selectSucceededFineTuneJobs);
  const [selectedSucceededJob, setSelectedSucceededJob] = useState(null);

  // Debug dữ liệu file
  console.log("fineTuneFiles:", fineTuneFiles);

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

  useEffect(() => {
    if (tab === 1) dispatch(fetchFineTuneJobs());
    if (tab === 2) dispatch(fetchFineTuneFiles());
  }, [tab, dispatch]);

  useEffect(() => {
    if (fineTuneJobs && fineTuneJobs.length > 0) {
      const activeJob = fineTuneJobs.find((j) => j.active);
      setActiveModelId(activeJob ? activeJob.id : null);
    }
  }, [fineTuneJobs]);

  useEffect(() => {
    dispatch(fetchFineTunedModelsModelChat({ page: 1, size: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (
      modelChatFineTunedModels &&
      modelChatFineTunedModels.length > 0 &&
      !selectedModel
    ) {
      setSelectedModel(modelChatFineTunedModels[0]);
    }
  }, [modelChatFineTunedModels, selectedModel]);

  useEffect(() => {
    dispatch(fetchFineTuneJobs());
  }, [dispatch]);

  // Fetch frequent questions for analytics
  useEffect(() => {
    dispatch(fetchFrequentQuestions());
  }, [dispatch]);

  const handleTrainingFileChange = (e) => {
    setTrainingFile(e.target.files[0]);
    setUploadResult(null);
    setAlert(null);
  };

  const handleUploadTrainingFile = async () => {
    if (!trainingFile) {
      setAlert({ type: "warning", message: "Vui lòng chọn file." });
      return;
    }
    try {
      let result;
      if (fileType === "jsonl") {
        result = await dispatch(uploadFileFineTune(trainingFile)).unwrap();
      } else {
        result = await dispatch(
          uploadFileExcelModelChat({
            file: trainingFile,
            fileName: trainingFile.name,
          })
        ).unwrap();
      }
      setUploadResult(result);
      setTrainingFile(null);
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
    if (!selectedModel) {
      setAlert({
        type: "warning",
        message: "Vui lòng chọn model trước khi training.",
      });
      return;
    }
    try {
      await dispatch(
        fineTuneModel({
          model: selectedModel.id,
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

  const handleReloadJobs = () => dispatch(fetchFineTuneJobs());
  const handleReloadFiles = () => dispatch(fetchFineTuneFiles());
  const handleViewFileDetail = (fileId) => {
    dispatch(fetchFineTuneFileDetail(fileId));
    setOpenFileDetail(true);
  };
  const handleCloseFileDetail = () => setOpenFileDetail(false);

  const handleSelectModelForChat = async (jobId) => {
    try {
      await dispatch(selectModelForModelChat(jobId)).unwrap();
      setActiveModelId(jobId);
      setAlert({ type: "success", message: "Đã chọn model này cho chat!" });
    } catch (error) {
      setAlert({ type: "error", message: error || "Lỗi khi chọn model chat" });
    }
  };

  const handleViewJobDetail = async (jobId) => {
    setJobDetailLoading(true);
    setOpenJobDetail(true);
    try {
      const detail = await dispatch(fetchFineTuneJobDetail(jobId)).unwrap();
      setSelectedJobDetail(detail);
    } catch {
      setSelectedJobDetail(null);
    }
    setJobDetailLoading(false);
  };

  const filteredFiles = fineTuneFiles
    ? fineTuneFiles.filter((f) =>
        f.filename?.toLowerCase().includes(fileFilter.toLowerCase())
      )
    : [];
  const pagedFiles = filteredFiles.slice(
    filePage * fileRowsPerPage,
    filePage * fileRowsPerPage + fileRowsPerPage
  );
  const filteredJobs = fineTuneJobs
    ? fineTuneJobs.filter(
        (j) =>
          j.model?.toLowerCase().includes(jobFilter.toLowerCase()) ||
          j.training_file?.toLowerCase().includes(jobFilter.toLowerCase()) ||
          j.status?.toLowerCase().includes(jobFilter.toLowerCase())
      )
    : [];
  const pagedJobs = filteredJobs.slice(
    jobPage * jobRowsPerPage,
    jobPage * jobRowsPerPage + jobRowsPerPage
  );

  // Dummy data for UI demo
  const dummyLineData = [
    { date: "01/07", count: 12 },
    { date: "02/07", count: 18 },
    { date: "03/07", count: 9 },
    { date: "04/07", count: 15 },
    { date: "05/07", count: 22 },
    { date: "06/07", count: 17 },
    { date: "07/07", count: 25 },
  ];
  const dummyPieData = [
    { name: "Báo giá", value: 8 },
    { name: "Kỹ thuật", value: 5 },
    { name: "Sản phẩm", value: 7 },
    { name: "Hỗ trợ", value: 4 },
  ];
  const dummyBarData = [
    { type: "Tự động", value: 32 },
    { type: "Chuyển người thật", value: 8 },
  ];
  const pieColors = ["#1976d2", "#43a047", "#ff9800", "#e53935"];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Quản lí Chatbot- Tinh chỉnh Model-AI
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Tải lên file dữ liệu của bạn, bắt đầu tinh chỉnh và quản lý model AI của
        bạn. Tính năng này cho phép quản lý tinh chỉnh AI để có hiệu suất tốt
        hơn và lấy model mới nhất tích hợp vào Chatbot hệ thống.
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Quản lý Fine-tune" />
        <Tab label="Danh sách Job Fine-tune" />
        <Tab label="Danh sách File Đã Upload" />
        <Tab label="Thống Kê" />
      </Tabs>
      {tab === 0 && (
        <>
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
              1. Tải lên file dữ liệu (jsonl hoặc excel)
            </Typography>
            <FormControl sx={{ mb: 2 }}>
              <RadioGroup
                row
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                <FormControlLabel
                  value="jsonl"
                  control={<Radio />}
                  label="File data (.jsonl)"
                />
                <FormControlLabel
                  value="excel"
                  control={<Radio />}
                  label="File excel (.xlsx, .xls)"
                />
              </RadioGroup>
            </FormControl>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={fineTuneStatus === "loading"}
                sx={{ borderRadius: 2 }}
              >
                {trainingFile ? trainingFile.name : "Chọn file"}
                <input
                  type="file"
                  hidden
                  accept={fileType === "jsonl" ? ".jsonl" : ".xlsx,.xls"}
                  onChange={handleTrainingFileChange}
                />
              </Button>
              <Button
                variant="outlined"
                onClick={handleUploadTrainingFile}
                disabled={fineTuneStatus === "loading" || !trainingFile}
                sx={{ borderRadius: 2 }}
              >
                Upload
              </Button>
            </Box>
            {/* Thông báo sau khi upload file */}
            {uploadResult ? (
              <Alert severity="success" sx={{ mt: 2, width: 300 }}>
                Đã upload file thành công!
                <br />
                {/* {uploadResult.id && (
                  <>
                    ID file: <b>{uploadResult.id}</b>
                  </>
                )} */}
              </Alert>
            ) : alert ? (
              <Alert severity={alert.type} sx={{ mt: 2, width: 300 }}>
                {alert.message}
              </Alert>
            ) : null}
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
              2. Tinh chỉnh Model-AI
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Autocomplete
                disablePortal
                options={
                  Array.isArray(modelChatFineTunedModels)
                    ? modelChatFineTunedModels
                    : []
                }
                value={selectedModel}
                onChange={(_, value) => setSelectedModel(value)}
                sx={{ width: 300 }}
                loading={modelChatFineTunedModelsStatus === "loading"}
                getOptionLabel={(option) => option.modelName || option.id || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Chọn model" />
                )}
              />
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
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              mb: 3,
            }}
          >
            <Typography variant="h6" mb={2}>
              3. Kiểm tra Model-AI
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                label="Nhập câu hỏi cho chatbot"
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                sx={{ width: 400 }}
              />
              <Button
                variant="contained"
                onClick={async () => {
                  // Call API test chat with selectedModel
                  if (!selectedModel || !chatPrompt) return;
                  try {
                    const res = await dispatch(
                      testChat({
                        prompt: chatPrompt,
                        model: selectedModel.modelName || selectedModel.id,
                      })
                    ).unwrap();
                    setChatResponse(res);
                  } catch {
                    setChatResponse("Lỗi khi kiểm tra model");
                  }
                }}
                disabled={!selectedModel || !chatPrompt}
              >
                Gửi
              </Button>
            </Box>
            {chatResponse && (
              <Alert severity="info" sx={{ mt: 2, width: 500 }}>
                <b>Phản hồi Chatbot:</b> {chatResponse}
              </Alert>
            )}
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <Typography variant="h6" mb={2}>
              4. Chọn Model-AI tích hợp vào Chatbot hệ thống
            </Typography>
            <Autocomplete
              options={Array.isArray(succeededJobs) ? succeededJobs : []}
              getOptionLabel={(option) => option.fine_tuned_model || ""}
              value={selectedSucceededJob}
              onChange={(_, value) => setSelectedSucceededJob(value)}
              sx={{ width: 400, mb: 2 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn model fine-tune đã thành công"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CheckCircleIcon />}
              sx={{ borderRadius: 2 }}
              disabled={!selectedSucceededJob}
              onClick={async () => {
                if (!selectedSucceededJob) return;
                try {
                  await dispatch(
                    selectModelForModelChat(selectedSucceededJob.id)
                  ).unwrap();
                  setAlert({
                    type: "success",
                    message: "Đã tích hợp model cho chatbot!",
                  });
                } catch (error) {
                  setAlert({
                    type: "error",
                    message: error || "Lỗi khi tích hợp model",
                  });
                }
              }}
            >
              Tích hợp model này cho chatbot
            </Button>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Model đã training mới nhất có sẵn để tải xuống.
            </Typography>
          </Paper>
        </>
      )}
      {tab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6">Danh sách Job Fine-tune</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Tìm kiếm model, file, trạng thái..."
                value={jobFilter}
                onChange={(e) => {
                  setJobFilter(e.target.value);
                  setJobPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                  ),
                }}
                sx={{ minWidth: 220 }}
              />
              <IconButton onClick={handleReloadJobs}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
          {fineTuneJobsStatus === "loading" ? (
            <CircularProgress />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thời gian tạo</TableCell>
                    <TableCell>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedJobs.length > 0 ? (
                    pagedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.id}</TableCell>
                        <TableCell>{job.model}</TableCell>
                        <TableCell>{job.training_file}</TableCell>
                        <TableCell>{renderStatusChip(job.status)}</TableCell>
                        <TableCell>
                          {job.created_at
                            ? new Date(job.created_at).toLocaleString()
                            : ""}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleSelectModelForChat(job.id)}
                            disabled={job.status !== "succeeded"}
                            sx={{ mr: 1, mb: 1 }}
                          >
                            Chọn làm model chat
                          </Button>
                          {activeModelId === job.id && (
                            <Chip
                              label="Đang dùng cho chat"
                              color="success"
                              size="small"
                              sx={{ mb: 1 }}
                            />
                          )}
                          <IconButton
                            onClick={() => handleViewJobDetail(job.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Không có job nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button
                  size="small"
                  disabled={jobPage === 0}
                  onClick={() => setJobPage((p) => Math.max(0, p - 1))}
                >
                  Trước
                </Button>
                <Typography mx={2} mt={1}>
                  {jobPage + 1} /{" "}
                  {Math.ceil(filteredJobs.length / jobRowsPerPage) || 1}
                </Typography>
                <Button
                  size="small"
                  disabled={
                    (jobPage + 1) * jobRowsPerPage >= filteredJobs.length
                  }
                  onClick={() => setJobPage((p) => p + 1)}
                >
                  Sau
                </Button>
                <TextField
                  select
                  size="small"
                  value={jobRowsPerPage}
                  onChange={(e) => {
                    setJobRowsPerPage(Number(e.target.value));
                    setJobPage(0);
                  }}
                  sx={{ width: 70, ml: 2 }}
                  SelectProps={{ native: true }}
                >
                  {[5, 10, 20].map((n) => (
                    <option key={n} value={n}>
                      {n}/trang
                    </option>
                  ))}
                </TextField>
              </Box>
            </TableContainer>
          )}
          <Dialog
            open={openJobDetail}
            onClose={() => setOpenJobDetail(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Chi tiết Job Fine-tune</DialogTitle>
            <DialogContent>
              {jobDetailLoading ? (
                <CircularProgress />
              ) : selectedJobDetail ? (
                <Box>
                  <Typography variant="subtitle2">
                    ID: {selectedJobDetail.id}
                  </Typography>
                  <Typography variant="subtitle2">
                    Model: {selectedJobDetail.model}
                  </Typography>
                  <Typography variant="subtitle2">
                    Status: {selectedJobDetail.status}
                  </Typography>
                  <Typography variant="subtitle2">
                    Training file: {selectedJobDetail.training_file}
                  </Typography>
                  <Typography variant="subtitle2">
                    Created at:{" "}
                    {selectedJobDetail.created_at
                      ? new Date(selectedJobDetail.created_at).toLocaleString()
                      : ""}
                  </Typography>
                  <Typography variant="subtitle2">
                    Finished at:{" "}
                    {selectedJobDetail.finished_at
                      ? new Date(selectedJobDetail.finished_at).toLocaleString()
                      : ""}
                  </Typography>
                  <Typography variant="subtitle2">
                    Hyperparameters:{" "}
                    {selectedJobDetail.hyperparameters
                      ? JSON.stringify(selectedJobDetail.hyperparameters)
                      : ""}
                  </Typography>
                  {/* Có thể bổ sung thêm các trường khác nếu cần */}
                </Box>
              ) : (
                <Typography>Không tìm thấy chi tiết job.</Typography>
              )}
            </DialogContent>
          </Dialog>
        </Paper>
      )}
      {tab === 2 && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6">Danh sách File Đã Upload</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Tìm kiếm tên file..."
                value={fileFilter}
                onChange={(e) => {
                  setFileFilter(e.target.value);
                  setFilePage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                  ),
                }}
                sx={{ minWidth: 180 }}
              />
              <IconButton onClick={handleReloadFiles}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
          {fineTuneFilesStatus === "loading" ? (
            <CircularProgress />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tên file</TableCell>
                    <TableCell>Mục đích</TableCell>
                    <TableCell>Kích thước (bytes)</TableCell>
                    <TableCell>Ngày upload</TableCell>
                    <TableCell>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedFiles.length > 0 ? (
                    pagedFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.id}</TableCell>
                        <TableCell>{file.filename}</TableCell>
                        <TableCell>{file.purpose}</TableCell>
                        <TableCell>{file.bytes}</TableCell>
                        <TableCell>
                          {file.created_at
                            ? new Date(file.created_at * 1000).toLocaleString()
                            : ""}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleViewFileDetail(file.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => setConfirmDeleteFileId(file.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Không có file nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button
                  size="small"
                  disabled={filePage === 0}
                  onClick={() => setFilePage((p) => Math.max(0, p - 1))}
                >
                  Trước
                </Button>
                <Typography mx={2} mt={1}>
                  {filePage + 1} /{" "}
                  {Math.ceil(filteredFiles.length / fileRowsPerPage) || 1}
                </Typography>
                <Button
                  size="small"
                  disabled={
                    (filePage + 1) * fileRowsPerPage >= filteredFiles.length
                  }
                  onClick={() => setFilePage((p) => p + 1)}
                >
                  Sau
                </Button>
                <TextField
                  select
                  size="small"
                  value={fileRowsPerPage}
                  onChange={(e) => {
                    setFileRowsPerPage(Number(e.target.value));
                    setFilePage(0);
                  }}
                  sx={{ width: 70, ml: 2 }}
                  SelectProps={{ native: true }}
                >
                  {[5, 10, 20].map((n) => (
                    <option key={n} value={n}>
                      {n}/trang
                    </option>
                  ))}
                </TextField>
              </Box>
            </TableContainer>
          )}
          {/* Dialog xem chi tiết file */}
          <Dialog
            open={openFileDetail}
            onClose={handleCloseFileDetail}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Chi tiết file</DialogTitle>
            <DialogContent>
              {fineTuneFileDetailStatus === "loading" ? (
                <CircularProgress />
              ) : fineTuneFileDetail ? (
                <Box>
                  <Typography variant="subtitle2">
                    ID: {fineTuneFileDetail.id}
                  </Typography>
                  <Typography variant="subtitle2">
                    Tên file: {fineTuneFileDetail.filename}
                  </Typography>
                  <Typography variant="subtitle2">
                    Purpose: {fineTuneFileDetail.purpose}
                  </Typography>
                  <Typography variant="subtitle2">
                    Kích thước: {fineTuneFileDetail.bytes} bytes
                  </Typography>
                  <Typography variant="subtitle2">
                    Ngày upload:{" "}
                    {fineTuneFileDetail.created_at
                      ? new Date(
                          fineTuneFileDetail.created_at * 1000
                        ).toLocaleString()
                      : ""}
                  </Typography>
                  {fineTuneFileDetail.content && (
                    <>
                      <Typography variant="subtitle2" mt={2}>
                        Nội dung file:
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: "#f5f5f5",
                          p: 2,
                          borderRadius: 1,
                          mt: 1,
                          maxHeight: 300,
                          overflow: "auto",
                        }}
                      >
                        <pre style={{ margin: 0, fontSize: 14 }}>
                          {fineTuneFileDetail.content}
                        </pre>
                      </Box>
                    </>
                  )}
                </Box>
              ) : (
                <Typography>Không tìm thấy chi tiết file.</Typography>
              )}
            </DialogContent>
          </Dialog>
          {/* Dialog xác nhận xóa file */}
          <Dialog
            open={!!confirmDeleteFileId}
            onClose={() => setConfirmDeleteFileId(null)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Xác nhận xóa file</DialogTitle>
            <DialogContent>
              <Typography>Bạn có chắc muốn xóa file này không?</Typography>
              <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                <Button onClick={() => setConfirmDeleteFileId(null)}>
                  Hủy
                </Button>
                <Button
                  color="error"
                  variant="contained"
                  onClick={async () => {
                    await dispatch(deleteFineTuneFile(confirmDeleteFileId));
                    setConfirmDeleteFileId(null);
                    dispatch(fetchFineTuneFiles());
                  }}
                >
                  Xóa
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
        </Paper>
      )}
      {tab === 3 && (
        <Box>
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
              5. Phân tích: Top 10 câu hỏi được hỏi nhiều nhất
            </Typography>
            {frequentQuestionsStatus === "loading" ? (
              <CircularProgress />
            ) : (
              <Box sx={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={frequentQuestions}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="question"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="frequency" fill="#1976d2" name="Số lần hỏi" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
          {/* Số lượng câu hỏi theo thời gian */}
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
              Số lượng câu hỏi theo thời gian (Demo)
            </Typography>
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={dummyLineData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Số câu hỏi"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            {/* TODO: Kết nối API số lượng câu hỏi theo thời gian */}
          </Paper>
          {/* Tỉ lệ chủ đề câu hỏi */}
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
              Tỉ lệ chủ đề câu hỏi (Demo)
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: 300,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <Pie
                    data={dummyPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {dummyPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            {/* TODO: Kết nối API phân loại chủ đề câu hỏi */}
          </Paper>
          {/* Tỉ lệ câu hỏi đã trả lời tự động vs. chuyển người thật */}
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
              Tỉ lệ câu hỏi đã trả lời tự động vs. chuyển người thật (Demo)
            </Typography>
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dummyBarData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#43a047" name="Số câu hỏi" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            {/* TODO: Kết nối API tỉ lệ tự động vs. chuyển người thật */}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ManagerFineTuneAI;
