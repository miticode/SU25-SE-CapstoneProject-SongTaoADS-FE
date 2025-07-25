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
  InputAdornment,
  Pagination,
  Tooltip,
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
  fetchOpenAiModels,
  selectOpenAiModels,
  selectOpenAiModelsStatus,
} from "../../store/features/chat/chatSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,

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

const getStatusIcon = (status) => {
  switch (status) {
    case "succeeded":
      return <CheckCircleIcon fontSize="small" />;
    case "failed":
      return <DeleteIcon fontSize="small" />;
    case "cancelled":
      return <AutorenewIcon fontSize="small" />;
    default:
      return null;
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
  const openAiModels = useSelector(selectOpenAiModels);
  const openAiModelsStatus = useSelector(selectOpenAiModelsStatus);
  const [selectedModel, setSelectedModel] = useState(null);
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
  const [integrateAlert, setIntegrateAlert] = useState(null);

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
    // Bỏ useEffect fetchOpenAiModels khi vào tab 0
    // if (tab === 0) dispatch(fetchOpenAiModels());
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

  // Chỉ giữ lại 1 useEffect này, KHÔNG tự động chọn model đầu tiên
  useEffect(() => {
    if (
      selectedModel &&
      (!openAiModels || !openAiModels.some((m) => m.id === selectedModel.id))
    ) {
      setSelectedModel(null);
    }
    // KHÔNG setSelectedModel(openAiModels[0]) ở đây!
  }, [openAiModels, selectedModel]);

  useEffect(() => {
    dispatch(fetchFineTuneJobs());
  }, [dispatch]);

  // Fetch frequent questions for analytics
  // Bỏ useEffect fetchFrequentQuestions khi vào trang
  // useEffect(() => {
  //   dispatch(fetchFrequentQuestions());
  // }, [dispatch]);

  useEffect(() => {
    if (openAiModels && openAiModels.length > 0 && !selectedModel) {
      setSelectedModel(openAiModels[0]);
    }
  }, [openAiModels, selectedModel]);

  // Khi options thay đổi, nếu selectedModel không còn trong options, set lại về null
  // useEffect(() => {
  //   if (
  //     selectedModel &&
  //     (!openAiModels || !openAiModels.some((m) => m.id === selectedModel.id))
  //   ) {
  //     setSelectedModel(null);
  //   }
  // }, [openAiModels, selectedModel]);

  // Gọi fetchFrequentQuestions khi chuyển sang tab Thống Kê
  useEffect(() => {
    if (tab === 3) {
      dispatch(fetchFrequentQuestions());
    }
  }, [tab, dispatch]);

  // Tự động ẩn thông báo tích hợp model sau 10 giây
  useEffect(() => {
    if (integrateAlert) {
      const timer = setTimeout(() => setIntegrateAlert(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [integrateAlert]);

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
      setSelectedJobDetail(detail.result || detail); // Lấy đúng object chi tiết job
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
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          '.MuiTab-root': {
            fontWeight: 600,
            fontSize: 16,
            px: 3,
            py: 1.5,
            color: '#555',
            transition: 'color 0.2s',
            '&.Mui-selected': {
              color: '#1976d2',
              bgcolor: '#e3f2fd',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
            },
            '&:hover': {
              color: '#1976d2',
              bgcolor: '#f5faff',
            },
          },
          '.MuiTabs-indicator': {
            height: 4,
            borderRadius: 2,
            bgcolor: '#1976d2',
          },
        }}
      >
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
            
            {/* Hướng dẫn */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Hướng dẫn:</strong> Tải lên file dữ liệu để training model AI. 
                Hỗ trợ 2 định dạng:
              </Typography>
              <Box mt={1}>
                <Typography variant="body2" component="div">
                  • <strong>File JSONL (.jsonl):</strong> Dữ liệu đã được format sẵn cho AI training
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>File Excel (.xlsx, .xls):</strong> Dữ liệu thô, hệ thống sẽ tự động convert thành JSONL
                </Typography>
              </Box>
              <Typography variant="body2" mt={1}>
                <strong>Lưu ý:</strong> File Excel cần có cấu trúc cột: "prompt" (câu hỏi) và "completion" (câu trả lời)
              </Typography>
            </Alert>

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
            
            {/* Hướng dẫn */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Hướng dẫn:</strong> Chọn model OpenAI gốc và bắt đầu quá trình fine-tune với dữ liệu đã upload.
              </Typography>
              <Box mt={1}>
                <Typography variant="body2" component="div">
                  • <strong>Chọn model:</strong> GPT-4 hoặc GPT-3.5 là lựa chọn phổ biến
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>Training:</strong> Quá trình có thể mất từ 10-60 phút tùy thuộc vào lượng dữ liệu
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>Huỷ training:</strong> Có thể huỷ bất cứ lúc nào nếu cần thiết
                </Typography>
              </Box>
              <Typography variant="body2" mt={1} color="warning.main">
                <strong>Lưu ý:</strong> Cần upload file dữ liệu ở bước 1 trước khi có thể bắt đầu training
              </Typography>
            </Alert>

            <Box display="flex" alignItems="center" gap={2}>
              <Autocomplete
                disablePortal
                options={Array.isArray(openAiModels) ? openAiModels : []}
                value={selectedModel}
                onChange={(_, value) => setSelectedModel(value)}
                onOpen={() => {
                  if (openAiModelsStatus === "idle") {
                    dispatch(fetchOpenAiModels());
                  }
                }}
                sx={{ width: 300 }}
                loading={openAiModelsStatus === "loading"}
                getOptionLabel={(option) => option.id + (option.owned_by ? ` (${option.owned_by})` : "")}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Chọn model OpenAI" />
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
          {/* Mục 3: Kiểm tra model-AI đã tinh chỉnh */}
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
              3. Kiểm tra model-AI đã tinh chỉnh
            </Typography>
            
            {/* Bước 1: Chọn model để test */}
            <Box mb={3}>
              <Typography variant="subtitle1" mb={2} fontWeight={600}>
                3.1. Chọn model để kiểm tra
            </Typography>
            <Autocomplete
              options={Array.isArray(modelChatFineTunedModels) ? modelChatFineTunedModels : []}
              getOptionLabel={(option) =>
                  `${option.modelName} ${option.active ? "(Đang dùng)" : ""}`
              }
              value={selectedSucceededJob}
              onChange={(_, value) => setSelectedSucceededJob(value)}
              onOpen={() => {
                if (modelChatFineTunedModelsStatus === "idle") {
                  dispatch(fetchFineTunedModelsModelChat({ page: 1, size: 10 }));
                }
              }}
                sx={{ width: 500, mb: 2 }}
              renderOption={(props, option) => (
                <li {...props} key={option.id} style={{
                  fontWeight: option.active ? 700 : 400,
                  color: option.active ? '#43a047' : 'inherit',
                  background: option.active ? '#e8f5e9' : 'inherit',
                }}>
                    <Box>
                      <Typography variant="body2" fontWeight={option.active ? 700 : 500}>
                        {option.modelName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tạo lúc: {new Date(option.createdAt).toLocaleString('vi-VN')}
                      </Typography>
                      {option.active && (
                        <Chip 
                          label="Đang dùng" 
                          color="success" 
                          size="small" 
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={modelChatFineTunedModelsStatus === "loading"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn model-AI đã tinh chỉnh thành công"
                    placeholder="Chọn model để test..."
                  />
                )}
              />
              {modelChatFineTunedModelsStatus === "loading" && (
                <CircularProgress size={20} sx={{ ml: 2 }} />
              )}
            </Box>

            {/* Bước 2: Test model */}
            {selectedSucceededJob && (
              <Box>
                <Typography variant="subtitle1" mb={2} fontWeight={600}>
                  3.2. Test model: <span style={{ color: '#1976d2' }}>{selectedSucceededJob.modelName}</span>
                </Typography>
                
                <Box display="flex" gap={2} mb={2}>
                  <TextField
                    label="Nhập câu hỏi để test model"
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    sx={{ flex: 1 }}
                    multiline
                    rows={2}
                    placeholder="Ví dụ: giá biển hiệu truyền thống, thông tin về sản phẩm..."
                  />
                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!selectedSucceededJob || !chatPrompt.trim()) return;
                      try {
                        const res = await dispatch(
                          testChat({
                            prompt: chatPrompt.trim(),
                            model: selectedSucceededJob.modelName,
                          })
                        ).unwrap();
                        setChatResponse(res);
                      } catch (error) {
                        setChatResponse("Lỗi khi kiểm tra model: " + (error || "Không thể kết nối"));
                      }
                    }}
                    disabled={!selectedSucceededJob || !chatPrompt.trim()}
                    sx={{ minWidth: 100, height: 56 }}
                  >
                    {fineTuneStatus === "loading" ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Test"
                    )}
                  </Button>
                </Box>

                {/* Hiển thị kết quả test */}
                {chatResponse && (
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#f8f9fa', 
                      border: '1px solid #e0e0e0',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="subtitle2" color="primary" mb={1} fontWeight={600}>
                      Phản hồi từ model:
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {chatResponse}
                    </Typography>
                    <Box mt={2} display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setChatPrompt("");
                          setChatResponse("");
                        }}
                      >
                        Xóa
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          navigator.clipboard.writeText(chatResponse);
                          setAlert({ type: "success", message: "Đã copy vào clipboard!" });
                        }}
                      >
                        Copy
                      </Button>
                    </Box>
                  </Paper>
                )}

                {/* Thông tin model */}
                <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Model ID:</strong> {selectedSucceededJob.id} | 
                    <strong> Tạo lúc:</strong> {new Date(selectedSucceededJob.createdAt).toLocaleString('vi-VN')} |
                    <strong> Trạng thái:</strong> {selectedSucceededJob.active ? "Đang sử dụng" : "Chưa sử dụng"}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Hướng dẫn */}
            {!selectedSucceededJob && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Hướng dẫn:</strong> Chọn một model đã fine-tune thành công từ danh sách trên để bắt đầu test. 
                  Model có nhãn "Đang dùng" là model hiện tại đang được sử dụng trong hệ thống.
                </Typography>
              </Alert>
            )}
          </Paper>
          {/* Mục 4: Chọn Model-AI tích hợp vào Chatbot hệ thống */}
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
              4. Chọn Model-AI tích hợp vào Chatbot hệ thống
            </Typography>
            
            {/* Hướng dẫn */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Hướng dẫn:</strong> Tích hợp model đã fine-tune thành công vào hệ thống chatbot để sử dụng thực tế.
              </Typography>
              <Box mt={1}>
                <Typography variant="body2" component="div">
                  • <strong>Chọn model:</strong> Chỉ hiển thị các model đã training thành công
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>Model đang dùng:</strong> Được highlight màu xanh, không thể chọn lại
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>Tích hợp:</strong> Model mới sẽ thay thế model cũ trong hệ thống
                </Typography>
              </Box>
              <Typography variant="body2" mt={1} color="success.main">
                <strong>Lưu ý:</strong> Nên test model ở bước 3 trước khi tích hợp để đảm bảo chất lượng
              </Typography>
            </Alert>

            <Autocomplete
              options={Array.isArray(modelChatFineTunedModels) ? modelChatFineTunedModels : []}
              getOptionLabel={(option) =>
                `${option.modelName} ${option.active ? "(Đang dùng)" : ""}`
              }
              value={selectedSucceededJob}
              onChange={(_, value) => setSelectedSucceededJob(value)}
              onOpen={() => {
                if (modelChatFineTunedModelsStatus === "idle") {
                  dispatch(fetchFineTunedModelsModelChat({ page: 1, size: 10 }));
                }
              }}
              sx={{ width: 500, mb: 2 }}
              renderOption={(props, option) => (
                <li {...props} key={option.id} style={{
                  fontWeight: option.active ? 700 : 400,
                  color: option.active ? '#43a047' : 'inherit',
                  background: option.active ? '#e8f5e9' : 'inherit',
                }}>
                  <Box>
                    <Typography variant="body2" fontWeight={option.active ? 700 : 500}>
                      {option.modelName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tạo lúc: {new Date(option.createdAt).toLocaleString('vi-VN')}
                    </Typography>
                    {option.active && (
                      <Chip 
                        label="Đang dùng" 
                        color="success" 
                        size="small" 
                        sx={{ ml: 1, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={modelChatFineTunedModelsStatus === "loading"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn model-AI tinh chỉnh thành công"
                  placeholder="Chọn model để tích hợp..."
                />
              )}
            />
            {modelChatFineTunedModelsStatus === "loading" && (
              <CircularProgress size={20} sx={{ ml: 2 }} />
            )}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CheckCircleIcon />}
              sx={{ borderRadius: 2 }}
              disabled={!selectedSucceededJob || selectedSucceededJob.active}
              onClick={async () => {
                if (!selectedSucceededJob) return;
                try {
                  await dispatch(
                    selectModelForModelChat(selectedSucceededJob.id)
                  ).unwrap();
                  setIntegrateAlert({
                    type: "success",
                    message: `Đã tích hợp model "${selectedSucceededJob.modelName}" cho chatbot!`,
                  });
                  setAlert(null); // Ẩn alert cũ nếu có
                  // Refresh lại danh sách model fine-tune để cập nhật trạng thái active
                  dispatch(fetchFineTunedModelsModelChat({ page: 1, size: 10 }));
                } catch (error) {
                  setIntegrateAlert({
                    type: "error",
                    message: error || "Lưu khi tích hợp model",
                  });
                }
              }}
            >
              Tích hợp model vào chatbot
            </Button>
            {integrateAlert && (
              <Alert
                severity={integrateAlert.type}
                sx={{ mt: 2, width: 400 }}
                onClose={() => setIntegrateAlert(null)}
              >
                {integrateAlert.message}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary" mt={1}>
              Model đã training mới nhất có sẵn để tải xuống. Model đang dùng sẽ có nhãn <b>Đang dùng</b>.
            </Typography>
          </Paper>
        </>
      )}
      {tab === 1 && (
        <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(25,118,210,0.08)', p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight={700}>Danh sách Job Fine-tune</Typography>
              <TextField
                size="small"
                variant="outlined"
              placeholder="Tìm kiếm..."
                InputProps={{
                  startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: '#f5faff',
                borderRadius: 2,
                boxShadow: '0 1px 4px rgba(25,118,210,0.04)',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            </Box>
          <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#e3f2fd' }}>
                  <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Model</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Thời gian tạo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {pagedJobs.map((job) => (
                  <TableRow
                    key={job.id}
                    hover
                    sx={{
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: '#f5faff' },
                    }}
                  >
                        <TableCell>{job.id}</TableCell>
                        <TableCell>{job.model}</TableCell>
                        <TableCell>{job.training_file}</TableCell>
                        <TableCell>
                            <Chip
                        label={job.status}
                        color={getStatusColor(job.status)}
                              size="small"
                        icon={getStatusIcon(job.status)}
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      {job.created_at ? new Date(job.created_at).toLocaleString() : ""}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Xem chi tiết">
                          <IconButton
                            onClick={() => handleViewJobDetail(job.id)}
                          sx={{
                            bgcolor: '#e3f2fd',
                            '&:hover': { bgcolor: '#1976d2', color: '#fff' },
                            transition: 'all 0.2s',
                            borderRadius: 2,
                          }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                      </Tooltip>
                        </TableCell>
                      </TableRow>
                ))}
                </TableBody>
              </Table>
            </TableContainer>
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(filteredJobs.length / jobRowsPerPage)}
              page={jobPage + 1}
              onChange={(_, value) => setJobPage(value - 1)}
              color="primary"
              shape="rounded"
              size="medium"
            />
          </Box>
          {/* Dialog xem chi tiết job */}
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
                  <Typography variant="subtitle2">ID: {selectedJobDetail.id}</Typography>
                  <Typography variant="subtitle2">Model: {selectedJobDetail.model}</Typography>
                  <Typography variant="subtitle2">Trạng Thái: {selectedJobDetail.status}</Typography>
                  <Typography variant="subtitle2">File Dữ Liệu: {selectedJobDetail.training_file}</Typography>
                  <Typography variant="subtitle2">Thời Gian Tạo: {selectedJobDetail.created_at ? new Date(selectedJobDetail.created_at * 1000).toLocaleString('vi-VN') : ''}</Typography>
                  {/* <Typography variant="subtitle2">Thời Gian Hoàn Thành: {selectedJobDetail.finished_at ? new Date(selectedJobDetail.finished_at * 1000).toLocaleString('vi-VN') : ''}</Typography> */}
                  {/* <Typography variant="subtitle2">Hyperparameters: {selectedJobDetail.hyperparameters ? JSON.stringify(selectedJobDetail.hyperparameters) : ''}</Typography> */}
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
        <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(25,118,210,0.08)', p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight={700}>Danh sách File Đã Upload</Typography>
            <Box display="flex" alignItems="center" gap={2}>
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
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: '#f5faff',
                  borderRadius: 2,
                  boxShadow: '0 1px 4px rgba(25,118,210,0.04)',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Tooltip title="Làm mới danh sách">
                <IconButton 
                  onClick={handleReloadFiles}
                  sx={{
                    bgcolor: '#e3f2fd',
                    '&:hover': { bgcolor: '#1976d2', color: '#fff' },
                    transition: 'all 0.2s',
                    borderRadius: 2,
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          {fineTuneFilesStatus === "loading" ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#e3f2fd' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tên file</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mục đích</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Kích thước</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ngày upload</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedFiles.length > 0 ? (
                    pagedFiles.map((file) => (
                      <TableRow
                        key={file.id}
                        hover
                        sx={{
                          transition: 'background 0.2s',
                          '&:hover': { bgcolor: '#f5faff' },
                        }}
                      >
                        <TableCell>{file.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {file.filename}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={file.purpose}
                            size="small"
                            sx={{ 
                              bgcolor: '#e8f5e9', 
                              color: '#2e7d32',
                              fontWeight: 500 
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {(file.bytes / 1024).toFixed(1)} KB
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {file.created_at
                              ? new Date(file.created_at * 1000).toLocaleString('vi-VN')
                              : ""}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                onClick={() => handleViewFileDetail(file.id)}
                                sx={{
                                  bgcolor: '#e3f2fd',
                                  '&:hover': { bgcolor: '#1976d2', color: '#fff' },
                                  transition: 'all 0.2s',
                                  borderRadius: 2,
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa file">
                              <IconButton
                                color="error"
                                onClick={() => setConfirmDeleteFileId(file.id)}
                                sx={{
                                  bgcolor: '#ffebee',
                                  '&:hover': { bgcolor: '#d32f2f', color: '#fff' },
                                  transition: 'all 0.2s',
                                  borderRadius: 2,
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          Không có file nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(filteredFiles.length / fileRowsPerPage)}
              page={filePage + 1}
              onChange={(_, value) => setFilePage(value - 1)}
              color="primary"
              shape="rounded"
              size="medium"
            />
          </Box>
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
