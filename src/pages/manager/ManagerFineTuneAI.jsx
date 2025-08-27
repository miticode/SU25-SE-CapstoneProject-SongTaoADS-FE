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
  DialogActions,
  CircularProgress,
  Chip,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Pagination,
  Tooltip,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  Fab,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ViewIcon from "@mui/icons-material/Visibility";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SmartToy from "@mui/icons-material/SmartToy";
import TopicIcon from "@mui/icons-material/Topic";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import ChatIcon from "@mui/icons-material/Chat";
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
  checkFineTuneJobStatus,
  selectCurrentJobStatus,
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
  // File content API
  fetchFineTuneFileContent,
  selectFineTuneFileContent,
  selectFineTuneFileContentStatus,
  // Management APIs for tab 5
  fetchManagementFineTunedModels,
  selectManagementFineTunedModels,
  selectManagementFineTunedModelsStatus,
  selectManagementFineTunedModelsPagination,
  fetchChatBotTopicsByModelId,
  selectSelectedModelChatBotTopics,
  selectSelectedModelChatBotTopicsStatus,
  selectSelectedModelForTopics,
} from "../../store/features/chat/chatSlice";
import { downloadFile } from "../../api/s3Service";
import { getFineTunedModelsModelChatApi } from "../../api/chatService";
import {
  fetchAllTopics,
  createNewTopic,
  updateExistingTopic,
  deleteExistingTopic,
  selectAllTopics,
  selectTopicLoading,
  selectTopicError,
  selectTopicSuccess,
  clearError as clearTopicError,
  clearSuccess as clearTopicSuccess,
} from "../../store/features/topic/topicSlice";
import {
  fetchQuestionsByTopic,
  createNewQuestionByTopic,
  updateExistingQuestion,
  deleteExistingQuestion,
  selectQuestionsByTopic,
  selectQuestionLoading,
  selectQuestionError,
  selectQuestionSuccess,
  clearError as clearQuestionError,
  clearSuccess as clearQuestionSuccess,
} from "../../store/features/question/questionSlice";
import {
  fetchAllChatBotTopics,
  fetchChatBotTopicsByModelChat,
  fetchChatBotTopicsByTopic,
  addTopicToModelChatBot,
  addTopicFromExistingModel,
  copyTopicsFromPreviousModel,
  deleteChatBotTopicById,
  selectChatBotTopicsByModel,
  selectChatBotTopicsByTopic,
  selectChatBotTopicLoading,
  selectChatBotTopicCreateLoading,
  selectChatBotTopicDeleteLoading,
  selectChatBotTopicError,
  selectChatBotTopicSuccess,
  clearError as clearChatBotTopicError,
  clearSuccess as clearChatBotTopicSuccess,
} from "../../store/features/chatBotTopic/chatBotTopicSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
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
  const [openFileContent, setOpenFileContent] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(null);
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

  // Topic management selectors
  const topics = useSelector(selectAllTopics);
  const topicLoading = useSelector(selectTopicLoading);
  const topicError = useSelector(selectTopicError);
  const topicSuccess = useSelector(selectTopicSuccess);

  // Question management selectors
  const questionsByTopic = useSelector(selectQuestionsByTopic);
  const questionLoading = useSelector(selectQuestionLoading);
  const questionError = useSelector(selectQuestionError);
  const questionSuccess = useSelector(selectQuestionSuccess);

  // ChatBot Topic management selectors
  const chatBotTopicsByModel = useSelector(selectChatBotTopicsByModel);
  const chatBotTopicsByTopic = useSelector(selectChatBotTopicsByTopic);
  const chatBotTopicLoading = useSelector(selectChatBotTopicLoading);
  const chatBotTopicCreateLoading = useSelector(
    selectChatBotTopicCreateLoading
  );
  const chatBotTopicDeleteLoading = useSelector(
    selectChatBotTopicDeleteLoading
  );
  const chatBotTopicError = useSelector(selectChatBotTopicError);
  const chatBotTopicSuccess = useSelector(selectChatBotTopicSuccess);

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
  const fineTuneFileContent = useSelector(selectFineTuneFileContent);
  const fineTuneFileContentStatus = useSelector(
    selectFineTuneFileContentStatus
  );
  const currentJobStatus = useSelector(selectCurrentJobStatus);
  const succeededJobs = useSelector(selectSucceededFineTuneJobs);

  // Management selectors for tab 5
  const managementFineTunedModels = useSelector(
    selectManagementFineTunedModels
  );
  const managementFineTunedModelsStatus = useSelector(
    selectManagementFineTunedModelsStatus
  );
  const managementFineTunedModelsPagination = useSelector(
    selectManagementFineTunedModelsPagination
  );
  const selectedModelChatBotTopics = useSelector(
    selectSelectedModelChatBotTopics
  );
  const selectedModelChatBotTopicsStatus = useSelector(
    selectSelectedModelChatBotTopicsStatus
  );
  const selectedModelForTopics = useSelector(selectSelectedModelForTopics);
  const [selectedSucceededJob, setSelectedSucceededJob] = useState(null);
  const [integrateAlert, setIntegrateAlert] = useState(null);

  // Topic management states
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [openTopicDialog, setOpenTopicDialog] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [openQuestionManageDialog, setOpenQuestionManageDialog] =
    useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [topicForm, setTopicForm] = useState({ title: "", description: "" });
  const [questionForm, setQuestionForm] = useState({
    question: "",
    answer: "",
  });
  const [topicFilter, setTopicFilter] = useState("");
  const [questionFilter, setQuestionFilter] = useState("");
  const [topicAlert, setTopicAlert] = useState(null);
  const [currentTopicForQuestions, setCurrentTopicForQuestions] =
    useState(null);

  // ChatBot Topic management states
  const [openChatBotTopicDialog, setOpenChatBotTopicDialog] = useState(false);
  const [openChatBotTopicViewDialog, setOpenChatBotTopicViewDialog] =
    useState(false);
  const [selectedChatBotTopic, setSelectedChatBotTopic] = useState(null);
  const [chatBotTopicDialogMode, setChatBotTopicDialogMode] =
    useState("create");
  const [chatBotTopicForm, setChatBotTopicForm] = useState({
    modelChatBotId: "",
    topicId: "",
    description: "",
  });
  const [chatBotTopicAlert, setChatBotTopicAlert] = useState(null);

  // Model chat bot states
  const [fineTunedModels, setFineTunedModels] = useState([]);
  const [modelLoading, setModelLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success', 'error', 'warning', 'info'
  });

  // Confirmation Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Progress states for upload
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  // Management states for tab 5
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [showTopicsDialog, setShowTopicsDialog] = useState(false);
  const [managementPage, setManagementPage] = useState(1);
  const [managementPageSize, setManagementPageSize] = useState(10);

  // Debug dữ liệu file
  console.log("fineTuneFiles:", fineTuneFiles);

  // Helper function để format nội dung file
  const formatFileContent = (content) => {
    if (typeof content === "string") {
      return content
        .split("\n")
        .map((line, index) => {
          try {
            const parsed = JSON.parse(line);
            return JSON.stringify(parsed, null, 2);
          } catch {
            return line;
          }
        })
        .join("\n\n");
    }
    return JSON.stringify(content, null, 2);
  };

  // Helper function để hiển thị snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Helper function để đóng snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Auto-hide topicAlert after 3 seconds
  useEffect(() => {
    if (topicAlert) {
      const timer = setTimeout(() => {
        setTopicAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [topicAlert]);

  // Auto-hide chatBotTopicAlert after 3 seconds
  useEffect(() => {
    if (chatBotTopicAlert) {
      const timer = setTimeout(() => {
        setChatBotTopicAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [chatBotTopicAlert]);

  // Helper function để hiển thị dialog xác nhận
  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
    });
  };

  // Helper function để đóng dialog xác nhận
  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  // Function để lấy danh sách model đã fine-tune
  const fetchFineTunedModels = async () => {
    try {
      setModelLoading(true);
      const response = await getFineTunedModelsModelChatApi(1, 100); // Lấy tối đa 100 model
      if (response.success) {
        setFineTunedModels(response.result);
      } else {
        console.error("Lỗi khi lấy danh sách model:", response.error);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API model:", error);
    } finally {
      setModelLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(resetFineTuneStatus());
    };
  }, [dispatch]);

  // Fetch fine-tuned models khi mở dialog hoặc khi tab thay đổi
  useEffect(() => {
    if (tab === 5) {
      // Tab "Quản lý ChatBot Topic"
      fetchFineTunedModels();
    }
  }, [tab]);

  useEffect(() => {
    if (error) {
      setAlert({ type: "error", message: error });
    }
  }, [error]);

  useEffect(() => {
    if (tab === 1) dispatch(fetchFineTuneJobs());
    if (tab === 2) dispatch(fetchFineTuneFiles());
    if (tab === 4) dispatch(fetchAllTopics()); // Load topics when switching to tab 4
    if (tab === 5) {
      dispatch(fetchAllTopics()); // Load all topics for dropdown
      dispatch(fetchAllChatBotTopics()); // Load chat bot topics when switching to tab 5
      dispatch(
        fetchManagementFineTunedModels({
          page: managementPage,
          size: managementPageSize,
        })
      ); // Load management models
    }
    // Bỏ useEffect fetchOpenAiModels khi vào tab 0
    // if (tab === 0) dispatch(fetchOpenAiModels());
  }, [tab, dispatch, managementPage, managementPageSize]);

  // Kiểm tra trạng thái job hiện tại khi chuyển tab hoặc khi có job
  useEffect(() => {
    if (fineTuningJobId && (tab === 0 || tab === 1)) {
      // Kiểm tra trạng thái job khi vào tab quản lý tinh chỉnh hoặc danh sách job
      dispatch(checkFineTuneJobStatus(fineTuningJobId));
    }
  }, [fineTuningJobId, tab, dispatch]);

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

  // Tự động ẩn thông báo ChatBot Topic sau 3 giây
  useEffect(() => {
    if (chatBotTopicSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearChatBotTopicSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [chatBotTopicSuccess, dispatch]);

  // Tự động ẩn thông báo ChatBot Topic error sau 5 giây
  useEffect(() => {
    if (chatBotTopicError) {
      const timer = setTimeout(() => {
        dispatch(clearChatBotTopicError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [chatBotTopicError, dispatch]);

  // Kiểm tra trạng thái job fine-tune định kỳ khi có job đang chạy
  useEffect(() => {
    let intervalId;

    if (fineTuningJobId && trainingStatus === "loading") {
      // Kiểm tra trạng thái mỗi 30 giây
      intervalId = setInterval(() => {
        dispatch(checkFineTuneJobStatus(fineTuningJobId));
      }, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fineTuningJobId, trainingStatus, dispatch]);

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

    // Kiểm tra nếu đã có file được upload
    if (uploadedFile) {
      setAlert({
        type: "warning",
        message:
          "Đã có file được upload. Vui lòng xóa file cũ trước khi upload file mới.",
      });
      return;
    }

    // Reset progress states
    setUploadProgress(0);
    setUploadCompleted(false);
    setAlert(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

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

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadCompleted(true);

      setUploadResult(result);
      setTrainingFile(null);

      // Reset progress after 3 seconds
      setTimeout(() => {
        setUploadProgress(0);
        setUploadCompleted(false);
      }, 3000);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploadCompleted(false);
      setAlert({ type: "error", message: error || "Lỗi khi upload file" });
    }
  };

  const handleDeleteUploadedFile = async (fileId) => {
    if (!fileId) {
      setAlert({ type: "error", message: "Không tìm thấy ID file để xóa." });
      return;
    }

    setIsDeletingFile(true);
    try {
      await dispatch(deleteFineTuneFile(fileId)).unwrap();
      setAlert({
        type: "success",
        message: "Đã xóa file thành công. Bây giờ bạn có thể upload file mới.",
      });
      setUploadResult(null);
      setTrainingFile(null); // Clear the file input
      // Note: uploadedFile state will be automatically cleared by Redux after deleteFineTuneFile.fulfilled
    } catch (error) {
      setAlert({ type: "error", message: error || "Lỗi khi xóa file" });
    } finally {
      setIsDeletingFile(false);
    }
  };

  const handleTrain = async () => {
    if (!uploadedFile) {
      setAlert({
        type: "warning",
        message: "Vui lòng upload file trước khi tinh chỉnh.",
      });
      return;
    }
    if (!selectedModel) {
      setAlert({
        type: "warning",
        message: "Vui lòng chọn model trước khi tinh chỉnh.",
      });
      return;
    }

    // Kiểm tra nếu đã có job đang chạy hoặc đã hoàn thành
    if (fineTuningJobId && trainingStatus !== "idle") {
      if (trainingStatus === "loading") {
        setAlert({
          type: "warning",
          message:
            "Đã có job tinh chỉnh đang chạy. Vui lòng đợi hoặc huỷ job hiện tại.",
        });
        return;
      } else if (
        trainingStatus === "succeeded" ||
        trainingStatus === "failed"
      ) {
        setAlert({
          type: "info",
          message:
            "Job trước đã hoàn thành. Vui lòng nhấn 'Bắt đầu mới' để tạo job mới.",
        });
        return;
      }
    }

    setAlert(null);

    try {
      await dispatch(
        fineTuneModel({
          model: selectedModel.id,
          trainingFile: uploadedFile.id,
        })
      ).unwrap();

      setAlert({ type: "success", message: "Tinh chỉnh model thành công!" });
    } catch (error) {
      setAlert({
        type: "error",
        message: error || "Lỗi khi tinh chỉnh model AI",
      });
    }
  };

  const handleCancelTraining = async () => {
    if (!fineTuningJobId) {
      return;
    }

    try {
      // Kiểm tra trạng thái hiện tại của job trước khi huỷ
      const jobStatusResponse = await dispatch(
        checkFineTuneJobStatus(fineTuningJobId)
      ).unwrap();
      const currentStatus = jobStatusResponse.status;

      // Nếu job đã hoàn thành hoặc thất bại, không thể huỷ
      if (currentStatus === "succeeded" || currentStatus === "failed") {
        setAlert({
          type: "warning",
          message: `Không thể huỷ job vì job đã ${
            currentStatus === "succeeded" ? "hoàn thành" : "thất bại"
          }.`,
        });
        return;
      }

      // Nếu job đang chạy, thực hiện huỷ
      if (
        currentStatus === "running" ||
        currentStatus === "pending" ||
        currentStatus === "validating_files" ||
        currentStatus === "fine_tuning" ||
        currentStatus === "training"
      ) {
        const cancelResult = await dispatch(
          cancelFineTuneJob(fineTuningJobId)
        ).unwrap();

        setAlert({ type: "info", message: "Đã huỷ tinh chỉnh." });
      } else {
        setAlert({
          type: "info",
          message: `Job hiện tại có trạng thái: ${currentStatus}`,
        });
      }
    } catch (error) {
      console.error("Error in handleCancelTraining:", error);
      // Nếu lỗi là do job đã hoàn thành, cập nhật trạng thái
      if (error && error.includes && error.includes("already completed")) {
        setAlert({
          type: "warning",
          message: "Job đã hoàn thành, không thể huỷ.",
        });
        // Cập nhật trạng thái để UI phản ánh đúng
        dispatch(checkFineTuneJobStatus(fineTuningJobId));
      } else {
        setAlert({ type: "error", message: error || "Lỗi khi huỷ tinh chỉnh" });
      }
    }
  };

  const handleResetTraining = () => {
    dispatch(resetFineTuneStatus());
    setUploadResult(null);
    setTrainingFile(null); // Clear the file input
    setAlert({
      type: "info",
      message: "Đã reset trạng thái tinh chỉnh và file upload.",
    });
  };

  const handleReloadJobs = () => dispatch(fetchFineTuneJobs());
  const handleReloadFiles = () => dispatch(fetchFineTuneFiles());
  const handleViewFileDetail = (fileId) => {
    dispatch(fetchFineTuneFileDetail(fileId));
    setOpenFileDetail(true);
  };
  const handleCloseFileDetail = () => setOpenFileDetail(false);

  const handleViewFileContent = (fileId) => {
    setCurrentFileId(fileId);
    dispatch(fetchFineTuneFileContent(fileId));
    setOpenFileContent(true);
  };
  const handleCloseFileContent = () => {
    setOpenFileContent(false);
    setCurrentFileId(null);
  };

  const handleSelectModelForChat = async (jobId) => {
    try {
      await dispatch(selectModelForModelChat(jobId)).unwrap();
      setActiveModelId(jobId);
      setAlert({
        type: "success",
        message: "Đã chọn model này cho chatbot hệ thống!",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error || "Lỗi khi chọn model cho chatbot hệ thống",
      });
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

  // Topic management handlers
  const handleCreateTopic = async () => {
    if (!topicForm.title.trim()) {
      setTopicAlert({ type: "error", message: "Vui lòng nhập tiêu đề chủ đề" });
      return;
    }
    try {
      await dispatch(createNewTopic(topicForm)).unwrap();
      setTopicAlert({ type: "success", message: "Tạo chủ đề thành công!" });
      setOpenTopicDialog(false);
      setTopicForm({ title: "", description: "" });
      dispatch(fetchAllTopics());
    } catch (error) {
      setTopicAlert({ type: "error", message: error || "Lỗi khi tạo chủ đề" });
    }
  };

  const handleUpdateTopic = async () => {
    if (!topicForm.title.trim()) {
      setTopicAlert({ type: "error", message: "Vui lòng nhập tiêu đề chủ đề" });
      return;
    }
    try {
      await dispatch(
        updateExistingTopic({
          id: editingTopic.id,
          topicData: topicForm,
        })
      ).unwrap();
      setTopicAlert({
        type: "success",
        message: "Cập nhật chủ đề thành công!",
      });
      setOpenTopicDialog(false);
      setEditingTopic(null);
      setTopicForm({ title: "", description: "" });
      dispatch(fetchAllTopics());
    } catch (error) {
      setTopicAlert({
        type: "error",
        message: error || "Lỗi khi cập nhật chủ đề",
      });
    }
  };

  const handleDeleteTopic = (topicId) => {
    showConfirmDialog(
      "Xác nhận xóa chủ đề",
      "Bạn có chắc muốn xóa chủ đề này? Tất cả câu hỏi trong chủ đề cũng sẽ bị xóa.",
      async () => {
        try {
          await dispatch(deleteExistingTopic(topicId)).unwrap();
          showSnackbar("Xóa chủ đề thành công!", "success");
          dispatch(fetchAllTopics());
          handleCloseConfirmDialog();
        } catch (error) {
          showSnackbar(error || "Lỗi khi xóa chủ đề", "error");
          handleCloseConfirmDialog();
        }
      }
    );
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setTopicForm({ title: topic.title, description: topic.description || "" });
    setOpenTopicDialog(true);
  };

  const handleCreateQuestion = async () => {
    if (!questionForm.question.trim()) {
      setTopicAlert({ type: "error", message: "Vui lòng nhập câu hỏi" });
      return;
    }
    const topicId = currentTopicForQuestions?.id || selectedTopic?.id;
    if (!topicId) {
      setTopicAlert({ type: "error", message: "Không tìm thấy topic" });
      return;
    }
    try {
      await dispatch(
        createNewQuestionByTopic({
          topicId: topicId,
          questionData: questionForm,
        })
      ).unwrap();
      setTopicAlert({ type: "success", message: "Tạo câu hỏi thành công!" });
      setOpenQuestionDialog(false);
      setQuestionForm({ question: "", answer: "" });
      dispatch(fetchQuestionsByTopic(topicId));
    } catch (error) {
      setTopicAlert({ type: "error", message: error || "Lỗi khi tạo câu hỏi" });
    }
  };

  const handleUpdateQuestion = async () => {
    if (!questionForm.question.trim()) {
      setTopicAlert({ type: "error", message: "Vui lòng nhập câu hỏi" });
      return;
    }
    const topicId = currentTopicForQuestions?.id || selectedTopic?.id;
    try {
      await dispatch(
        updateExistingQuestion({
          questionId: editingQuestion.id,
          questionData: questionForm,
        })
      ).unwrap();
      setTopicAlert({
        type: "success",
        message: "Cập nhật câu hỏi thành công!",
      });
      setOpenQuestionDialog(false);
      setEditingQuestion(null);
      setQuestionForm({ question: "", answer: "" });
      if (topicId) {
        dispatch(fetchQuestionsByTopic(topicId));
      }
    } catch (error) {
      setTopicAlert({
        type: "error",
        message: error || "Lỗi khi cập nhật câu hỏi",
      });
    }
  };

  const handleDeleteQuestion = (questionId) => {
    showConfirmDialog(
      "Xác nhận xóa câu hỏi",
      "Bạn có chắc muốn xóa câu hỏi này?",
      async () => {
        const topicId = currentTopicForQuestions?.id || selectedTopic?.id;
        try {
          await dispatch(deleteExistingQuestion(questionId)).unwrap();
          showSnackbar("Xóa câu hỏi thành công!", "success");
          if (topicId) {
            dispatch(fetchQuestionsByTopic(topicId));
          }
          handleCloseConfirmDialog();
        } catch (error) {
          showSnackbar(error || "Lỗi khi xóa câu hỏi", "error");
          handleCloseConfirmDialog();
        }
      }
    );
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      answer: question.answer || "",
    });
    setOpenQuestionDialog(true);
  };

  const handleViewTopicQuestions = (topic) => {
    setCurrentTopicForQuestions(topic);
    setOpenQuestionManageDialog(true);
    dispatch(fetchQuestionsByTopic(topic.id));
  };

  const filteredTopics = topics
    ? topics.filter((topic) =>
        topic.title?.toLowerCase().includes(topicFilter.toLowerCase())
      )
    : [];

  const filteredQuestions = questionsByTopic
    ? questionsByTopic.filter((question) =>
        question.question?.toLowerCase().includes(questionFilter.toLowerCase())
      )
    : [];

  // ChatBot Topic management functions
  const handleOpenChatBotTopicDialog = (mode, item = null) => {
    setChatBotTopicDialogMode(mode);
    if (mode === "edit" && item) {
      setSelectedChatBotTopic(item);
      setChatBotTopicForm({
        modelChatBotId: item.modelChatBotId || "",
        topicId: item.topicId || "",
        description: item.description || "",
      });
    } else {
      setSelectedChatBotTopic(null);
      setChatBotTopicForm({
        modelChatBotId: "",
        topicId: "",
        description: "",
      });
    }
    setOpenChatBotTopicDialog(true);
  };

  const handleCloseChatBotTopicDialog = () => {
    setOpenChatBotTopicDialog(false);
    setSelectedChatBotTopic(null);
    setChatBotTopicForm({
      modelChatBotId: "",
      topicId: "",
      description: "",
    });
  };

  const handleChatBotTopicInputChange = (field, value) => {
    setChatBotTopicForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChatBotTopicSubmit = async () => {
    if (!chatBotTopicForm.modelChatBotId || !chatBotTopicForm.topicId) {
      setChatBotTopicAlert({
        type: "error",
        message: "Vui lòng chọn Model Chat Bot và Topic",
      });
      return;
    }

    try {
      if (chatBotTopicDialogMode === "create") {
        await dispatch(
          addTopicToModelChatBot({
            modelChatBotId: chatBotTopicForm.modelChatBotId,
            topicId: chatBotTopicForm.topicId,
          })
        ).unwrap();
      } else {
        await dispatch(
          addTopicFromExistingModel({
            modelChatBotId: chatBotTopicForm.modelChatBotId,
            topicData: {
              topicId: chatBotTopicForm.topicId,
            },
          })
        ).unwrap();
      }

      setChatBotTopicAlert({
        type: "success",
        message: "Gán topic cho model thành công!",
      });

      // Reset form và refresh data
      setChatBotTopicForm({
        ...chatBotTopicForm,
        topicId: "",
        description: "",
      });

      // Refresh topics for current model
      if (selectedModelForTopics) {
        dispatch(fetchChatBotTopicsByModelId(selectedModelForTopics));
      }

      dispatch(fetchAllChatBotTopics());
    } catch (error) {
      setChatBotTopicAlert({
        type: "error",
        message: error || "Lỗi khi thực hiện thao tác",
      });
    }
  };

  const handleDeleteChatBotTopic = (id) => {
    showConfirmDialog(
      "Xác nhận xóa ChatBot Topic",
      "Bạn có chắc muốn xóa liên kết này?",
      async () => {
        try {
          await dispatch(deleteChatBotTopicById(id)).unwrap();
          showSnackbar("Xóa ChatBot Topic thành công!", "success");

          // Refresh topics for current model
          if (selectedModelForTopics) {
            dispatch(fetchChatBotTopicsByModelId(selectedModelForTopics));
          }

          dispatch(fetchAllChatBotTopics());
          handleCloseConfirmDialog();
        } catch (error) {
          showSnackbar(error || "Lỗi khi xóa ChatBot Topic", "error");
          handleCloseConfirmDialog();
        }
      }
    );
  };

  // Sử dụng API thực tế thay vì mock data
  const modelChatBots = fineTunedModels.map((model) => ({
    id: model.id,
    name: model.modelName,
    active: model.active, // Thêm thuộc tính active
    description: `Model đã tinh chỉnh - ${
      model.active ? "Đang hoạt động" : "Không hoạt động"
    }`,
  }));

  // Management handlers for tab 5
  const handleViewModelTopics = async (modelId) => {
    setSelectedModelId(modelId);
    // Setup form for adding topics to this model
    setChatBotTopicForm({
      modelChatBotId: modelId,
      topicId: "",
      description: "",
    });
    await dispatch(fetchChatBotTopicsByModelId(modelId));
    setShowTopicsDialog(true);
  };

  const handleCloseTopicsDialog = () => {
    setShowTopicsDialog(false);
    setSelectedModelId(null);
    // Reset form
    setChatBotTopicForm({
      modelChatBotId: "",
      topicId: "",
      description: "",
    });
  };

  // Handler for copying topics from previous model
  const handleCopyTopicsFromPreviousModel = async () => {
    if (!selectedModelId) return;

    // Tìm model trước đó trong danh sách (model được tạo trước model hiện tại)
    const currentModelIndex = managementFineTunedModels.findIndex(
      (model) => model.id === selectedModelId
    );

    if (currentModelIndex <= 0) {
      // Không có model trước đó
      console.log("Không có model trước đó để copy topics");
      return;
    }

    const previousModel = managementFineTunedModels[currentModelIndex - 1];

    try {
      await dispatch(
        copyTopicsFromPreviousModel({
          targetModelId: selectedModelId,
          sourceModelId: previousModel.id,
        })
      ).unwrap();

      // Refresh topics for current model
      await dispatch(fetchChatBotTopicsByModelId(selectedModelId));

      console.log(`Đã copy topics từ model: ${previousModel.modelName}`);
    } catch (error) {
      console.error("Error copying topics:", error);
    }
  };

  const handleManagementPageChange = (event, newPage) => {
    setManagementPage(newPage);
  };

  const handleManagementPageSizeChange = (event) => {
    setManagementPageSize(event.target.value);
    setManagementPage(1);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Quản lý Chatbot - Tinh chỉnh Model AI & RAG
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Tải lên file dữ liệu của bạn, bắt đầu tinh chỉnh và quản lý model AI
        chatbot. Tính năng này cho phép quản lý tinh chỉnh AI để có hiệu suất
        tốt hơn và tích hợp model mới nhất vào hệ thống chatbot.
      </Typography>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          ".MuiTab-root": {
            fontWeight: 600,
            fontSize: 16,
            px: 3,
            py: 1.5,
            color: "#555",
            transition: "color 0.2s",
            "&.Mui-selected": {
              color: "#1976d2",
              bgcolor: "#e3f2fd",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(25, 118, 210, 0.08)",
            },
            "&:hover": {
              color: "#1976d2",
              bgcolor: "#f5faff",
            },
          },
          ".MuiTabs-indicator": {
            height: 4,
            borderRadius: 2,
            bgcolor: "#1976d2",
          },
        }}
      >
        <Tab label="Quản lý Tinh chỉnh" />
        <Tab label="Danh sách Job Tinh chỉnh" />
        <Tab label="Danh sách File Đã Upload" />
        <Tab label="Thống Kê" />
        <Tab label="Danh sách chủ đề" />
        <Tab label="Quản lý Model đã tinh chỉnh" />
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
              1. Tải lên file dữ liệu (JSONL hoặc Excel)
            </Typography>

            {/* Hướng dẫn */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Hướng dẫn:</strong> Tải lên file dữ liệu để tinh chỉnh
                model AI. Hỗ trợ 2 định dạng:
              </Typography>
              <Box mt={1}>
                <Typography variant="body2" component="div">
                  • <strong>File JSONL (.jsonl):</strong> Dữ liệu đã được format
                  sẵn cho AI
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>File Excel (.xlsx, .xls):</strong> Dữ liệu thô, hệ
                  thống sẽ tự động chuyển đổi thành JSONL
                </Typography>
              </Box>
              <Typography variant="body2" mt={1}>
                <strong>Lưu ý:</strong> File Excel cần có cấu trúc cột: "prompt"
                (câu hỏi) và "completion" (câu trả lời)
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
                disabled={fineTuneStatus === "loading" || uploadedFile}
                sx={{ borderRadius: 2 }}
              >
                {uploadedFile
                  ? "File đã upload"
                  : trainingFile
                  ? trainingFile.name
                  : "Chọn file"}
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
                disabled={
                  fineTuneStatus === "loading" || !trainingFile || uploadedFile
                }
                sx={{ borderRadius: 2 }}
              >
                Upload
              </Button>
            </Box>

            {/* Hiển thị file đã upload */}
            {uploadedFile && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <InsertDriveFileIcon color="primary" />
                    <Typography variant="body2" fontWeight={500}>
                      File đã upload:{" "}
                      {uploadedFile.filename ||
                        uploadedFile.name ||
                        "File dữ liệu"}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={
                      isDeletingFile ? (
                        <CircularProgress size={16} />
                      ) : (
                        <DeleteIcon />
                      )
                    }
                    onClick={() => handleDeleteUploadedFile(uploadedFile.id)}
                    disabled={fineTuneStatus === "loading" || isDeletingFile}
                    sx={{ borderRadius: 2 }}
                  >
                    {isDeletingFile ? "Đang xóa..." : "Xóa file"}
                  </Button>
                </Box>
                {uploadedFile.id && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    ID file: {uploadedFile.id}
                    {uploadedFile.bytes && (
                      <span>
                        {" "}
                        • Kích thước: {(uploadedFile.bytes / 1024).toFixed(
                          2
                        )}{" "}
                        KB
                      </span>
                    )}
                    {uploadedFile.created_at && (
                      <span>
                        {" "}
                        • Upload lúc:{" "}
                        {new Date(uploadedFile.created_at).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    )}
                  </Typography>
                )}
                <Alert severity="info" sx={{ mt: 1 }}>
                  File đã được upload thành công. Bạn cần xóa file này trước khi
                  có thể upload file mới.
                </Alert>
              </Box>
            )}

            {/* Progress bar for upload */}
            {(uploadProgress > 0 || uploadCompleted) && (
              <Box sx={{ mt: 2, width: "100%" }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="body2" color="text.secondary">
                    {uploadCompleted ? "Hoàn thành!" : "Đang upload..."}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {uploadProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: uploadCompleted ? "#4caf50" : "#1976d2",
                      borderRadius: 4,
                    },
                  }}
                />
                {uploadCompleted && (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography
                      variant="body2"
                      color="success.main"
                      fontWeight={500}
                    >
                      Upload thành công!
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

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
                <strong>Hướng dẫn:</strong> Chọn model OpenAI gốc và bắt đầu quá
                trình tinh chỉnh với dữ liệu đã upload.
              </Typography>
              <Box mt={1}>
                <Typography variant="body2" component="div">
                  • <strong>Chọn model:</strong> GPT-4 hoặc GPT-3.5 là lựa chọn
                  phổ biến
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>Tinh chỉnh:</strong> Quá trình có thể mất từ 10-60
                  phút tùy thuộc vào lượng dữ liệu
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>Huỷ tinh chỉnh:</strong> Có thể huỷ bất cứ lúc nào
                  nếu cần thiết
                </Typography>
              </Box>
              <Typography variant="body2" mt={1} color="warning.main">
                <strong>Lưu ý:</strong> Cần upload file dữ liệu ở bước 1 trước
                khi có thể bắt đầu tinh chỉnh
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
                getOptionLabel={(option) =>
                  option.id + (option.owned_by ? ` (${option.owned_by})` : "")
                }
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
                  ? "Đang Tinh chỉnh..."
                  : trainingStatus === "succeeded"
                  ? "Tinh chỉnh Thành công"
                  : trainingStatus === "failed"
                  ? "Tinh chỉnh Thất bại"
                  : "Bắt Đầu Tinh chỉnh"}
              </Button>
              {/* Debug info */}

              {/* Test button to verify click handler works */}

              {(trainingStatus === "loading" ||
                trainingStatus === "succeeded" ||
                trainingStatus === "failed") &&
                fineTuningJobId && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancelTraining}
                    disabled={
                      trainingStatus === "succeeded" ||
                      trainingStatus === "failed"
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    {trainingStatus === "succeeded" ||
                    trainingStatus === "failed"
                      ? "Không thể huỷ"
                      : "Huỷ Tinh chỉnh"}
                  </Button>
                )}

              {(trainingStatus === "succeeded" ||
                trainingStatus === "failed") && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<AutorenewIcon />}
                  onClick={handleResetTraining}
                  sx={{ borderRadius: 2 }}
                >
                  Bắt đầu mới
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
                    : trainingStatus === "failed"
                    ? "error.main"
                    : "text.secondary"
                }
              >
                {trainingStatus === "loading" &&
                  (currentJobStatus
                    ? `Đang tinh chỉnh... (${currentJobStatus})`
                    : "Đang tinh chỉnh...")}
                {trainingStatus === "cancelled" && "Đã huỷ tinh chỉnh"}
                {trainingStatus === "succeeded" && "Tinh chỉnh thành công!"}
                {trainingStatus === "failed" && "Tinh chỉnh thất bại"}
                {trainingStatus === "idle" && "Sẵn sàng tinh chỉnh"}
              </Typography>
            </Box>
            {/* Loading progress */}
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
                options={
                  Array.isArray(modelChatFineTunedModels)
                    ? modelChatFineTunedModels
                    : []
                }
                getOptionLabel={(option) =>
                  `${option.modelName} ${option.active ? "(Đang dùng)" : ""}`
                }
                value={selectedSucceededJob}
                onChange={(_, value) => setSelectedSucceededJob(value)}
                onOpen={() => {
                  if (modelChatFineTunedModelsStatus === "idle") {
                    dispatch(
                      fetchFineTunedModelsModelChat({ page: 1, size: 10 })
                    );
                  }
                }}
                sx={{ width: 500, mb: 2 }}
                renderOption={(props, option) => (
                  <li
                    {...props}
                    key={option.id}
                    style={{
                      fontWeight: option.active ? 700 : 400,
                      color: option.active ? "#43a047" : "inherit",
                      background: option.active ? "#e8f5e9" : "inherit",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={option.active ? 700 : 500}
                      >
                        {option.modelName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tạo lúc:{" "}
                        {new Date(option.createdAt).toLocaleString("vi-VN")}
                      </Typography>
                      {option.active && (
                        <Chip
                          label="Đang dùng"
                          color="success"
                          size="small"
                          sx={{ ml: 1, fontSize: "0.7rem" }}
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
                  3.2. Test model:{" "}
                  <span style={{ color: "#1976d2" }}>
                    {selectedSucceededJob.modelName}
                  </span>
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
                        setChatResponse(
                          "Lỗi khi kiểm tra model: " +
                            (error || "Không thể kết nối")
                        );
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
                      bgcolor: "#f8f9fa",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      mb={1}
                      fontWeight={600}
                    >
                      Phản hồi từ model:
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
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
                          setAlert({
                            type: "success",
                            message: "Đã copy vào clipboard!",
                          });
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
                    <strong> Tạo lúc:</strong>{" "}
                    {new Date(selectedSucceededJob.createdAt).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    |<strong> Trạng thái:</strong>{" "}
                    {selectedSucceededJob.active
                      ? "Đang sử dụng"
                      : "Chưa sử dụng"}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Hướng dẫn */}
            {!selectedSucceededJob && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Hướng dẫn:</strong> Chọn một model AI đã tinh chỉnh
                  thành công từ danh sách trên để bắt đầu test. Model AI có nhãn
                  "Đang dùng" là model hiện tại đang được sử dụng trong hệ
                  thống.
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
                <strong>Hướng dẫn:</strong> Tích hợp model đã tinh chỉnh thành
                công vào hệ thống chatbot để sử dụng thực tế.
              </Typography>
              <Box mt={1}>
                <Typography variant="body2" component="div">
                  • <strong>Chọn model:</strong> Chỉ hiển thị các model đã tinh
                  chỉnh thành công
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>Model đang dùng:</strong> Được highlight màu xanh,
                  không thể chọn lại
                </Typography>
                <Typography variant="body2" component="div">
                  • <strong>Tích hợp:</strong> Model mới sẽ thay thế model cũ
                  trong hệ thống
                </Typography>
              </Box>
              <Typography variant="body2" mt={1} color="success.main">
                <strong>Lưu ý:</strong> Nên test model ở bước 3 trước khi tích
                hợp để đảm bảo chất lượng
              </Typography>
            </Alert>

            <Autocomplete
              options={
                Array.isArray(modelChatFineTunedModels)
                  ? modelChatFineTunedModels
                  : []
              }
              getOptionLabel={(option) =>
                `${option.modelName} ${option.active ? "(Đang dùng)" : ""}`
              }
              value={selectedSucceededJob}
              onChange={(_, value) => setSelectedSucceededJob(value)}
              onOpen={() => {
                if (modelChatFineTunedModelsStatus === "idle") {
                  dispatch(
                    fetchFineTunedModelsModelChat({ page: 1, size: 10 })
                  );
                }
              }}
              sx={{ width: 500, mb: 2 }}
              renderOption={(props, option) => (
                <li
                  {...props}
                  key={option.id}
                  style={{
                    fontWeight: option.active ? 700 : 400,
                    color: option.active ? "#43a047" : "inherit",
                    background: option.active ? "#e8f5e9" : "inherit",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={option.active ? 700 : 500}
                    >
                      {option.modelName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tạo lúc:{" "}
                      {new Date(option.createdAt).toLocaleString("vi-VN")}
                    </Typography>
                    {option.active && (
                      <Chip
                        label="Đang dùng"
                        color="success"
                        size="small"
                        sx={{ ml: 1, fontSize: "0.7rem" }}
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
                  // Refresh lại danh sách model tinh chỉnh để cập nhật trạng thái active
                  dispatch(
                    fetchFineTunedModelsModelChat({ page: 1, size: 10 })
                  );
                } catch (error) {
                  setIntegrateAlert({
                    type: "error",
                    message: error || "Lưu khi tích hợp model",
                  });
                }
              }}
            >
              Tích hợp model vào chatbot hệ thống
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
              Model đã tinh chỉnh mới nhất có sẵn để tải xuống. Model đang dùng
              sẽ có nhãn <b>Đang dùng</b>.
            </Typography>
          </Paper>
        </>
      )}
      {tab === 1 && (
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 24px rgba(25,118,210,0.08)",
            p: 2,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6" fontWeight={700}>
              Danh sách Job Tinh chỉnh
            </Typography>
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
                bgcolor: "#f5faff",
                borderRadius: 2,
                boxShadow: "0 1px 4px rgba(25,118,210,0.04)",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
          <TableContainer sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#e3f2fd" }}>
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
                      transition: "background 0.2s",
                      "&:hover": { bgcolor: "#f5faff" },
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
                        sx={{ textTransform: "capitalize", fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      {job.created_at
                        ? new Date(job.created_at).toLocaleString()
                        : ""}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          onClick={() => handleViewJobDetail(job.id)}
                          sx={{
                            bgcolor: "#e3f2fd",
                            "&:hover": { bgcolor: "#1976d2", color: "#fff" },
                            transition: "all 0.2s",
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
            <DialogTitle>Chi tiết Job Tinh chỉnh</DialogTitle>
            <DialogContent>
              {jobDetailLoading ? (
                <CircularProgress />
              ) : selectedJobDetail ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <strong>ID:</strong> {selectedJobDetail.id}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <strong>Model Gốc:</strong> {selectedJobDetail.model}
                  </Typography>
                  {selectedJobDetail.fine_tuned_model && (
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "success.main" }}
                    >
                      <strong>Model Đã Tinh chỉnh:</strong>{" "}
                      {selectedJobDetail.fine_tuned_model}
                    </Typography>
                  )}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <strong>Trạng Thái:</strong>
                    <Chip
                      label={selectedJobDetail.status}
                      color={getStatusColor(selectedJobDetail.status)}
                      size="small"
                      sx={{
                        ml: 1,
                        textTransform: "capitalize",
                        fontWeight: 500,
                      }}
                    />
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <strong>File Dữ Liệu:</strong>{" "}
                    {selectedJobDetail.training_file}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <strong>Thời Gian Tạo:</strong>{" "}
                    {selectedJobDetail.created_at
                      ? new Date(
                          selectedJobDetail.created_at * 1000
                        ).toLocaleString("vi-VN")
                      : ""}
                  </Typography>
                  {selectedJobDetail.finished_at && (
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      <strong>Thời Gian Hoàn Thành:</strong>{" "}
                      {new Date(
                        selectedJobDetail.finished_at * 1000
                      ).toLocaleString("vi-VN")}
                    </Typography>
                  )}

                  {/* Thông tin so sánh model */}
                  {selectedJobDetail.fine_tuned_model && (
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: "#e8f5e9",
                        borderRadius: 1,
                        border: "1px solid #4caf50",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "success.main", mb: 1 }}
                      >
                        📊 So sánh Model
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Model cũ (Gốc):</strong>{" "}
                          {selectedJobDetail.model}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "success.main" }}
                        >
                          <strong>Model mới (Đã tinh chỉnh):</strong>{" "}
                          {selectedJobDetail.fine_tuned_model}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          display: "block",
                          color: "text.secondary",
                        }}
                      >
                        💡 Tip: Bạn có thể sử dụng thông tin này để rollback về
                        model cũ nếu cần thiết
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography>Không tìm thấy chi tiết job.</Typography>
              )}
            </DialogContent>
          </Dialog>
        </Paper>
      )}
      {tab === 2 && (
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 24px rgba(25,118,210,0.08)",
            p: 2,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6" fontWeight={700}>
              Danh sách File Đã Upload
            </Typography>
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
                  bgcolor: "#f5faff",
                  borderRadius: 2,
                  boxShadow: "0 1px 4px rgba(25,118,210,0.04)",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <Tooltip title="Làm mới danh sách">
                <IconButton
                  onClick={handleReloadFiles}
                  sx={{
                    bgcolor: "#e3f2fd",
                    "&:hover": { bgcolor: "#1976d2", color: "#fff" },
                    transition: "all 0.2s",
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
            <TableContainer sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Table>
                <TableHead sx={{ bgcolor: "#e3f2fd" }}>
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
                          transition: "background 0.2s",
                          "&:hover": { bgcolor: "#f5faff" },
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
                              bgcolor: "#e8f5e9",
                              color: "#2e7d32",
                              fontWeight: 500,
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
                              ? new Date(file.created_at * 1000).toLocaleString(
                                  "vi-VN"
                                )
                              : ""}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                onClick={() => handleViewFileDetail(file.id)}
                                sx={{
                                  bgcolor: "#e3f2fd",
                                  "&:hover": {
                                    bgcolor: "#1976d2",
                                    color: "#fff",
                                  },
                                  transition: "all 0.2s",
                                  borderRadius: 1,
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xem nội dung">
                              <IconButton
                                size="small"
                                onClick={() => handleViewFileContent(file.id)}
                                sx={{
                                  bgcolor: "#e3f2fd",
                                  "&:hover": {
                                    bgcolor: "#1976d2",
                                    color: "#fff",
                                  },
                                  transition: "all 0.2s",
                                  borderRadius: 1,
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                <DescriptionIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Xóa file">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setConfirmDeleteFileId(file.id)}
                                sx={{
                                  bgcolor: "#ffebee",
                                  "&:hover": {
                                    bgcolor: "#d32f2f",
                                    color: "#fff",
                                  },
                                  transition: "all 0.2s",
                                  borderRadius: 1,
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                <DeleteIcon fontSize="small" />
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
          {/* Dialog xem nội dung file */}
          <Dialog
            open={openFileContent}
            onClose={handleCloseFileContent}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6">Nội dung file</Typography>
                <IconButton onClick={handleCloseFileContent} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              {fineTuneFileContentStatus === "loading" ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : fineTuneFileContent ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Nội dung file JSONL (dữ liệu tinh chỉnh):
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "#f8f9fa",
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      maxHeight: 500,
                      overflow: "auto",
                      fontFamily: "monospace",
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {formatFileContent(fineTuneFileContent)}
                    </pre>
                  </Box>
                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const content = formatFileContent(fineTuneFileContent);
                        navigator.clipboard.writeText(content);
                        setAlert({
                          type: "success",
                          message: "Đã copy nội dung vào clipboard!",
                        });
                      }}
                    >
                      Copy nội dung
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        try {
                          // Tìm file tương ứng trong danh sách files để lấy filename
                          const currentFile = fineTuneFiles.find(
                            (file) => file.id === currentFileId
                          );

                          if (currentFile && currentFile.filename) {
                            const result = await downloadFile(
                              currentFile.filename,
                              currentFile.filename.split("/").pop() // Lấy tên file từ path
                            );

                            if (result.success) {
                              setAlert({
                                type: "success",
                                message: "Đã tải xuống file thành công!",
                              });
                            } else {
                              setAlert({
                                type: "error",
                                message:
                                  result.message || "Lỗi khi tải xuống file",
                              });
                            }
                          } else {
                            setAlert({
                              type: "error",
                              message: "Không tìm thấy thông tin file",
                            });
                          }
                        } catch (error) {
                          setAlert({
                            type: "error",
                            message: "Lỗi khi tải xuống file: " + error.message,
                          });
                        }
                      }}
                    >
                      Tải xuống file
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography color="error">
                  Không tìm thấy nội dung file.
                </Typography>
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
              Phân tích: Top 10 câu hỏi được hỏi nhiều nhất
            </Typography>
            {frequentQuestionsStatus === "loading" ? (
              <CircularProgress />
            ) : frequentQuestions && frequentQuestions.length > 0 ? (
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
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "text.secondary",
                }}
              >
                <Typography variant="body1">
                  Chưa có dữ liệu thống kê câu hỏi
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Dữ liệu sẽ hiển thị khi có người dùng tương tác với chatbot
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}
      {tab === 4 && (
        <Box>
          {/* Alert for topic operations */}
          {topicAlert && (
            <Alert
              severity={topicAlert.type}
              sx={{ mb: 2 }}
              onClose={() => setTopicAlert(null)}
            >
              {topicAlert.message}
            </Alert>
          )}

          {/* Topics Management */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              boxShadow: "0 8px 32px rgba(25, 118, 210, 0.12)",
              mb: 3,
              border: "1px solid #e3f2fd",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h6" fontWeight={700}>
                Quản lý Chủ đề
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <TextField
                  size="small"
                  placeholder="Tìm kiếm chủ đề..."
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 250 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingTopic(null);
                    setTopicForm({ title: "", description: "" });
                    setOpenTopicDialog(true);
                  }}
                  sx={{
                    borderRadius: 3,
                    background:
                      "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                    boxShadow: "0 3px 5px 2px rgba(25, 118, 210, .3)",
                    color: "white",
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 10px 2px rgba(25, 118, 210, .4)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Thêm chủ đề
                </Button>
              </Box>
            </Box>

            {topicLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  "& .MuiTable-root": { border: "none" },
                }}
              >
                <Table
                  sx={{
                    border: "none",
                    "& .MuiTableCell-root": { border: "none" },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#1565c0",
                          bgcolor: "#e3f2fd",
                          borderBottom: "2px solid #1976d2",
                          border: "none",
                        }}
                      >
                        Tiêu đề
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#1565c0",
                          bgcolor: "#e3f2fd",
                          borderBottom: "2px solid #1976d2",
                          border: "none",
                        }}
                      >
                        Mô tả
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#1565c0",
                          bgcolor: "#e3f2fd",
                          borderBottom: "2px solid #1976d2",
                          border: "none",
                        }}
                      >
                        Ngày tạo
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#1565c0",
                          bgcolor: "#e3f2fd",
                          borderBottom: "2px solid #1976d2",
                          border: "none",
                        }}
                      >
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTopics.length > 0 ? (
                      filteredTopics.map((topic) => (
                        <TableRow
                          key={topic.id}
                          hover
                          sx={{
                            transition: "all 0.3s ease",
                            "&:hover": {
                              bgcolor: "#f0f7ff",
                              transform: "scale(1.01)",
                              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
                            },
                            "& td": { border: "none" },
                          }}
                        >
                          <TableCell sx={{ border: "none" }}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <QuestionAnswerIcon
                                color="primary"
                                fontSize="small"
                              />
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color="#1976d2"
                              >
                                {topic.title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ border: "none" }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              {topic.description || "Chưa có mô tả"}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ border: "none" }}>
                            <Typography variant="body2" color="text.secondary">
                              {topic.createdAt
                                ? new Date(topic.createdAt).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "Không có"}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ border: "none" }}>
                            <Box display="flex" gap={1.5}>
                              <Tooltip title="Quản lý câu hỏi">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleViewTopicQuestions(topic)
                                  }
                                  sx={{
                                    bgcolor: "#e8f5e9",
                                    color: "#2e7d32",
                                    "&:hover": {
                                      bgcolor: "#4caf50",
                                      color: "#fff",
                                      transform: "scale(1.1)",
                                      boxShadow:
                                        "0 4px 8px rgba(76, 175, 80, 0.3)",
                                    },
                                    borderRadius: 2,
                                    transition: "all 0.2s ease",
                                    border: "1px solid #4caf50",
                                  }}
                                >
                                  <QuestionAnswerIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Chỉnh sửa chủ đề">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditTopic(topic)}
                                  sx={{
                                    bgcolor: "#fff3e0",
                                    color: "#ed6c02",
                                    "&:hover": {
                                      bgcolor: "#ff9800",
                                      color: "#fff",
                                      transform: "scale(1.1)",
                                      boxShadow:
                                        "0 4px 8px rgba(255, 152, 0, 0.3)",
                                    },
                                    borderRadius: 2,
                                    transition: "all 0.2s ease",
                                    border: "1px solid #ff9800",
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa chủ đề">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteTopic(topic.id)}
                                  sx={{
                                    bgcolor: "#ffebee",
                                    color: "#d32f2f",
                                    "&:hover": {
                                      bgcolor: "#f44336",
                                      color: "#fff",
                                      transform: "scale(1.1)",
                                      boxShadow:
                                        "0 4px 8px rgba(244, 67, 54, 0.3)",
                                    },
                                    borderRadius: 2,
                                    transition: "all 0.2s ease",
                                    border: "1px solid #f44336",
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"
                          sx={{ py: 4, border: "none" }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            Không có chủ đề nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Questions Management */}
          {selectedTopic && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                mb: 3,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Câu hỏi trong chủ đề: {selectedTopic.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quản lý các câu hỏi và câu trả lời cho chủ đề này
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    size="small"
                    placeholder="Tìm kiếm câu hỏi..."
                    value={questionFilter}
                    onChange={(e) => setQuestionFilter(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 250 }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => {
                      setEditingQuestion(null);
                      setQuestionForm({ question: "", answer: "" });
                      setOpenQuestionDialog(true);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Thêm câu hỏi
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedTopic(null)}
                    sx={{ borderRadius: 2 }}
                  >
                    Quay lại
                  </Button>
                </Box>
              </Box>

              {questionLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#e8f5e9" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Câu hỏi</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Câu trả lời
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Ngày tạo</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Hành động
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredQuestions.length > 0 ? (
                        filteredQuestions.map((question) => (
                          <TableRow
                            key={question.id}
                            hover
                            sx={{
                              transition: "background 0.2s",
                              "&:hover": { bgcolor: "#f5faff" },
                            }}
                          >
                            <TableCell>{question.id}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {question.question}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  maxWidth: 300,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {question.answer || "Chưa có câu trả lời"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {question.createdAt
                                  ? new Date(
                                      question.createdAt
                                    ).toLocaleDateString("vi-VN")
                                  : ""}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Sửa câu hỏi">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditQuestion(question)}
                                    sx={{
                                      bgcolor: "#fff3e0",
                                      "&:hover": {
                                        bgcolor: "#ff9800",
                                        color: "#fff",
                                      },
                                      borderRadius: 1,
                                    }}
                                  >
                                    <DescriptionIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa câu hỏi">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDeleteQuestion(question.id)
                                    }
                                    sx={{
                                      bgcolor: "#ffebee",
                                      "&:hover": {
                                        bgcolor: "#d32f2f",
                                        color: "#fff",
                                      },
                                      borderRadius: 1,
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                              Chưa có câu hỏi nào trong chủ đề này
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}

          {/* Topic Dialog */}
          <Dialog
            open={openTopicDialog}
            onClose={() => setOpenTopicDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {editingTopic ? "Sửa chủ đề" : "Thêm chủ đề mới"}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Tiêu đề chủ đề"
                fullWidth
                variant="outlined"
                value={topicForm.title}
                onChange={(e) =>
                  setTopicForm({ ...topicForm, title: e.target.value })
                }
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenTopicDialog(false)}>Hủy</Button>
              <Button
                onClick={editingTopic ? handleUpdateTopic : handleCreateTopic}
                variant="contained"
              >
                {editingTopic ? "Cập nhật" : "Tạo"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Question Dialog */}
          <Dialog
            open={openQuestionDialog}
            onClose={() => setOpenQuestionDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Câu hỏi"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={questionForm.question}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, question: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Câu trả lời (tùy chọn)"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={questionForm.answer}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, answer: e.target.value })
                }
                placeholder="Nhập câu trả lời mẫu cho câu hỏi này..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenQuestionDialog(false)}>Hủy</Button>
              <Button
                onClick={
                  editingQuestion ? handleUpdateQuestion : handleCreateQuestion
                }
                variant="contained"
              >
                {editingQuestion ? "Cập nhật" : "Tạo"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Question Management Dialog */}
          <Dialog
            open={openQuestionManageDialog}
            onClose={() => {
              setOpenQuestionManageDialog(false);
              setCurrentTopicForQuestions(null);
              setQuestionFilter("");
            }}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Quản lý câu hỏi: {currentTopicForQuestions?.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thêm, sửa, xóa câu hỏi trong chủ đề này
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => {
                    setOpenQuestionManageDialog(false);
                    setCurrentTopicForQuestions(null);
                    setQuestionFilter("");
                  }}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Search and Add Question */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                mb={3}
                p={2}
                bgcolor="#f8f9fa"
                borderRadius={2}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    size="small"
                    placeholder="Tìm kiếm câu hỏi..."
                    value={questionFilter}
                    onChange={(e) => setQuestionFilter(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      minWidth: 250,
                      bgcolor: "white",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Autocomplete
                    size="small"
                    options={topics || []}
                    getOptionLabel={(option) => option.title}
                    value={currentTopicForQuestions}
                    onChange={(_, value) => {
                      if (value) {
                        setCurrentTopicForQuestions(value);
                        dispatch(fetchQuestionsByTopic(value.id));
                      }
                    }}
                    sx={{
                      minWidth: 200,
                      bgcolor: "white",
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Chọn chủ đề khác"
                        placeholder="Chuyển chủ đề..."
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    )}
                  />
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingQuestion(null);
                    setQuestionForm({ question: "", answer: "" });
                    setOpenQuestionDialog(true);
                  }}
                  sx={{
                    borderRadius: 3,
                    background:
                      "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)",
                    boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)",
                    color: "white",
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #388e3c 30%, #4caf50 90%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 10px 2px rgba(76, 175, 80, .4)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Thêm câu hỏi
                </Button>
              </Box>

              {/* Questions Table */}
              {questionLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    maxHeight: 500,
                    "& .MuiTable-root": { border: "none" },
                  }}
                >
                  <Table
                    stickyHeader
                    sx={{
                      border: "none",
                      "& .MuiTableCell-root": { border: "none" },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#e8f5e9",
                            color: "#2e7d32",
                            borderBottom: "2px solid #4caf50",
                            border: "none",
                          }}
                        >
                          Câu hỏi
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#e8f5e9",
                            color: "#2e7d32",
                            borderBottom: "2px solid #4caf50",
                            border: "none",
                          }}
                        >
                          Ngày tạo
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#e8f5e9",
                            color: "#2e7d32",
                            borderBottom: "2px solid #4caf50",
                            border: "none",
                          }}
                        >
                          Thao tác
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredQuestions.length > 0 ? (
                        filteredQuestions.map((question) => (
                          <TableRow
                            key={question.id}
                            hover
                            sx={{
                              transition: "all 0.3s ease",
                              "&:hover": {
                                bgcolor: "#f0fff0",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.15)",
                              },
                              "& td": { border: "none" },
                            }}
                          >
                            <TableCell sx={{ border: "none" }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color="#2e7d32"
                                  sx={{
                                    maxWidth: 400,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {question.question}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ border: "none" }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {question.createdAt
                                  ? new Date(
                                      question.createdAt
                                    ).toLocaleDateString("vi-VN")
                                  : "Không có"}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ border: "none" }}>
                              <Box display="flex" gap={1.5}>
                                <Tooltip title="Chỉnh sửa câu hỏi">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditQuestion(question)}
                                    sx={{
                                      bgcolor: "#fff3e0",
                                      color: "#ed6c02",
                                      "&:hover": {
                                        bgcolor: "#ff9800",
                                        color: "#fff",
                                        transform: "scale(1.1)",
                                        boxShadow:
                                          "0 4px 8px rgba(255, 152, 0, 0.3)",
                                      },
                                      borderRadius: 2,
                                      transition: "all 0.2s ease",
                                      border: "1px solid #ff9800",
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa câu hỏi">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDeleteQuestion(question.id)
                                    }
                                    sx={{
                                      bgcolor: "#ffebee",
                                      color: "#d32f2f",
                                      "&:hover": {
                                        bgcolor: "#f44336",
                                        color: "#fff",
                                        transform: "scale(1.1)",
                                        boxShadow:
                                          "0 4px 8px rgba(244, 67, 54, 0.3)",
                                      },
                                      borderRadius: 2,
                                      transition: "all 0.2s ease",
                                      border: "1px solid #f44336",
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            align="center"
                            sx={{ py: 4, border: "none" }}
                          >
                            <Typography variant="body1" color="text.secondary">
                              Chưa có câu hỏi nào trong chủ đề này
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Enhanced Statistics */}
              <Box
                mt={3}
                p={3}
                sx={{
                  background:
                    "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                  borderRadius: 3,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Typography variant="h6" fontWeight={600} color="#1565c0">
                    Thống kê câu hỏi
                  </Typography>
                  {currentTopicForQuestions && (
                    <Chip
                      label={currentTopicForQuestions.title}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
                <Box display="flex" gap={3} flexWrap="wrap">
                  <Box
                    textAlign="center"
                    p={2}
                    bgcolor="white"
                    borderRadius={2}
                    minWidth={120}
                  >
                    <Typography variant="h4" color="#2e7d32" fontWeight={700}>
                      {questionsByTopic.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng câu hỏi
                    </Typography>
                  </Box>
                  {questionFilter && (
                    <Box
                      textAlign="center"
                      p={2}
                      bgcolor="white"
                      borderRadius={2}
                      minWidth={120}
                    >
                      <Typography variant="h4" color="#ed6c02" fontWeight={700}>
                        {filteredQuestions.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Kết quả tìm kiếm
                      </Typography>
                    </Box>
                  )}
                  <Box
                    textAlign="center"
                    p={2}
                    bgcolor="white"
                    borderRadius={2}
                    minWidth={120}
                  >
                    <Typography variant="h4" color="#1976d2" fontWeight={700}>
                      {questionsByTopic.filter((q) => q.answer).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Có câu trả lời
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpenQuestionManageDialog(false);
                  setCurrentTopicForQuestions(null);
                  setQuestionFilter("");
                }}
                variant="outlined"
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* Tab 5: Quản lý các Model đã tinh chỉnh */}
      {tab === 5 && (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Quản lý các Topic của Model
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Xem tất cả các model đã fine-tune và quản lý topics của từng
                  model
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() =>
                  dispatch(
                    fetchManagementFineTunedModels({
                      page: managementPage,
                      size: managementPageSize,
                    })
                  )
                }
                disabled={managementFineTunedModelsStatus === "loading"}
              >
                Làm mới
              </Button>
            </Box>

            {/* Loading */}
            {managementFineTunedModelsStatus === "loading" && (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            )}

            {/* Error */}
            {managementFineTunedModelsStatus === "failed" && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Có lỗi xảy ra khi tải danh sách models
              </Alert>
            )}

            {/* Models Table */}
            {managementFineTunedModelsStatus === "succeeded" && (
              <>
                <TableContainer component={Paper} elevation={1}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>STT</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Tên Model
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Model gốc
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Trạng thái
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Ngày tạo
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Thao tác
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {managementFineTunedModels.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              Không có model nào
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        managementFineTunedModels.map((model, index) => (
                          <TableRow key={model.id} hover>
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                align="center"
                              >
                                {(managementPage - 1) * managementPageSize +
                                  index +
                                  1}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {model.modelName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {model.previousModelName || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  model.active ? "Hoạt động" : "Không hoạt động"
                                }
                                color={model.active ? "success" : "default"}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {model.createdAt
                                  ? new Date(model.createdAt).toLocaleString(
                                      "vi-VN"
                                    )
                                  : "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Xem Topics">
                                <IconButton
                                  onClick={() =>
                                    handleViewModelTopics(model.id)
                                  }
                                  color="primary"
                                  size="small"
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {managementFineTunedModelsPagination &&
                  managementFineTunedModelsPagination.totalPages > 1 && (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      mt={2}
                      gap={2}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Trang {managementFineTunedModelsPagination.currentPage}{" "}
                        / {managementFineTunedModelsPagination.totalPages}
                      </Typography>
                      <Pagination
                        count={managementFineTunedModelsPagination.totalPages}
                        page={managementPage}
                        onChange={handleManagementPageChange}
                        color="primary"
                        size="small"
                      />
                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <InputLabel>Kích thước</InputLabel>
                        <Select
                          value={managementPageSize}
                          label="Kích thước"
                          onChange={handleManagementPageSizeChange}
                        >
                          <MenuItem value={5}>5</MenuItem>
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={20}>20</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
              </>
            )}
          </Paper>

          {/* Topics Dialog */}
          <Dialog
            open={showTopicsDialog}
            onClose={handleCloseTopicsDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <TopicIcon color="primary" />
                <Box>
                  <Typography variant="h6">Topics của Model</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Model:{" "}
                    {managementFineTunedModels.find(
                      (m) => m.id === selectedModelForTopics
                    )?.modelName || "Không xác định"}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedModelChatBotTopicsStatus === "loading" && (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              )}

              {selectedModelChatBotTopicsStatus === "failed" && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Không thể tải danh sách topics
                </Alert>
              )}

              {selectedModelChatBotTopicsStatus === "succeeded" && (
                <>
                  {/* Add Topic Section */}
                  <Box
                    sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Gán Topic cho Model
                    </Typography>
                    <Box
                      display="flex"
                      gap={2}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Chọn Topic</InputLabel>
                        <Select
                          value={chatBotTopicForm.topicId}
                          label="Chọn Topic"
                          onChange={(e) =>
                            handleChatBotTopicInputChange(
                              "topicId",
                              e.target.value
                            )
                          }
                        >
                          {topics &&
                            topics.map((topic) => (
                              <MenuItem key={topic.id} value={topic.id}>
                                {topic.title}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        onClick={handleChatBotTopicSubmit}
                        disabled={
                          !chatBotTopicForm.topicId || chatBotTopicCreateLoading
                        }
                        startIcon={
                          chatBotTopicCreateLoading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <AddIcon />
                          )
                        }
                      >
                        Gán Topic
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleCopyTopicsFromPreviousModel}
                        color="secondary"
                        disabled={
                          chatBotTopicCreateLoading ||
                          managementFineTunedModels.findIndex(
                            (m) => m.id === selectedModelId
                          ) <= 0
                        }
                        startIcon={
                          chatBotTopicCreateLoading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <CopyAllIcon />
                          )
                        }
                      >
                        Copy từ model trước đó
                      </Button>
                    </Box>
                  </Box>

                  {selectedModelChatBotTopics.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <Typography variant="body2" color="text.secondary">
                        Model này chưa có topic nào
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              STT
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Tên Topic
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Ngày tạo
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Thao tác
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedModelChatBotTopics.map((topic, index) => (
                            <TableRow key={topic.id} hover>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                  align="center"
                                >
                                  {index + 1}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {/* Find topic name from topics list */}
                                  {topics?.find((t) => t.id === topic.topicId)
                                    ?.title || "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {topic.createdAt
                                    ? new Date(topic.createdAt).toLocaleString(
                                        "vi-VN"
                                      )
                                    : "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Xóa Topic khỏi Model">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDeleteChatBotTopic(topic.id)
                                    }
                                    sx={{
                                      bgcolor: "#ffebee",
                                      "&:hover": {
                                        bgcolor: "#d32f2f",
                                        color: "#fff",
                                      },
                                      borderRadius: 1,
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseTopicsDialog} variant="outlined">
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* PLACEHOLDER_TO_DELETE */}
      {/* <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <SmartToy sx={{ fontSize: 40, color: "primary.main" }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {modelChatBots.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Model Chat Bot
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TopicIcon sx={{ fontSize: 40, color: "secondary.main" }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {topics?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Topic
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ChatIcon sx={{ fontSize: 40, color: "success.main" }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {chatBotTopics?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Liên kết Topic
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TopicIcon sx={{ fontSize: 40, color: "info.main" }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {topics?.filter((t) =>
                      chatBotTopics?.some((cbt) => cbt.topicId === t.id)
                    )?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Topic đã gán
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      {/* Alert for ChatBot Topic operations */}
      {chatBotTopicAlert && (
        <Alert
          severity={chatBotTopicAlert.type}
          sx={{ mb: 2 }}
          onClose={() => setChatBotTopicAlert(null)}
        >
          {chatBotTopicAlert.message}
        </Alert>
      )}

      {/* Main Table */}
      {/* <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Model Chat Bot</TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell>Mô tả Topic</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chatBotTopicLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredChatBotTopics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body1" color="text.secondary">
                          Không có dữ liệu
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredChatBotTopics.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.modelChatBot?.name || `Model ${item.modelChatBotId}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.topic?.title || `Topic ${item.topicId}`}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {item.description || 'Chưa có mô tả'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                onClick={() => handleViewChatBotTopic(item)}
                                color="info"
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenChatBotTopicDialog('edit', item)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteChatBotTopic(item.id)}
                                color="error"
                                disabled={chatBotTopicDeleteLoading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
        </Box>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#fff3e0",
            color: "#e65100",
            fontWeight: 700,
            borderBottom: "1px solid #ffcc02",
          }}
        >
          ⚠️ {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography
            variant="body1"
            sx={{ color: "#424242", lineHeight: 1.6 }}
          >
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseConfirmDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              color: "#666",
              borderColor: "#ddd",
              "&:hover": {
                borderColor: "#999",
                bgcolor: "#f5f5f5",
              },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(244, 67, 54, 0.4)",
              },
            }}
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* ChatBot Topic Create/Edit Dialog */}
      <Dialog
        open={openChatBotTopicDialog}
        onClose={handleCloseChatBotTopicDialog}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor:
              chatBotTopicDialogMode === "create" ? "#e8f5e9" : "#fff3e0",
            color: chatBotTopicDialogMode === "create" ? "#2e7d32" : "#e65100",
            fontWeight: 700,
            borderBottom: `1px solid ${
              chatBotTopicDialogMode === "create" ? "#4caf50" : "#ff9800"
            }`,
          }}
        >
          {chatBotTopicDialogMode === "create"
            ? "Thêm Topic cho Model Chat "
            : "Chỉnh sửa Topic cho Model Chat"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Model Chat Bot Selection */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.primary"
                mb={1}
              >
                Model đã tinh chỉnh
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Chọn Model </InputLabel>
                <Select
                  value={chatBotTopicForm.modelChatBotId}
                  onChange={(e) =>
                    handleChatBotTopicInputChange(
                      "modelChatBotId",
                      e.target.value
                    )
                  }
                  label="Chọn Model Chat Bot"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#f8f9fa",
                    },
                  }}
                >
                  {modelLoading ? (
                    <MenuItem disabled>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={16} />
                        <Typography>Đang tải danh sách model...</Typography>
                      </Box>
                    </MenuItem>
                  ) : modelChatBots.length > 0 ? (
                    modelChatBots.map((bot) => (
                      <MenuItem key={bot.id} value={bot.id}>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                          }}
                        >
                          <SmartToy
                            sx={{
                              color: bot.active ? "#4caf50" : "#666",
                              fontSize: 20,
                              mt: 0.5,
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              sx={{
                                color: bot.active ? "#4caf50" : "inherit",
                                mb: 0.5,
                              }}
                            >
                              {bot.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: bot.active
                                  ? "#4caf50"
                                  : "text.secondary",
                                fontWeight: bot.active ? 600 : 400,
                              }}
                            >
                              {bot.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography color="text.secondary">
                        Không có model nào được tìm thấy
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>

            {/* Topic Selection */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.primary"
                mb={1}
              >
                Topic *
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Chọn Topic</InputLabel>
                <Select
                  value={chatBotTopicForm.topicId}
                  onChange={(e) =>
                    handleChatBotTopicInputChange("topicId", e.target.value)
                  }
                  label="Chọn Topic"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#f8f9fa",
                    },
                  }}
                >
                  {topics?.map((topic) => (
                    <MenuItem key={topic.id} value={topic.id}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <TopicIcon
                          sx={{
                            color: "#1976d2",
                            fontSize: 20,
                            mt: 0.5,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {topic.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {topic.description || "Không có mô tả"}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseChatBotTopicDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              color: "#666",
              borderColor: "#ddd",
              "&:hover": {
                borderColor: "#999",
                bgcolor: "#f5f5f5",
              },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleChatBotTopicSubmit}
            variant="contained"
            disabled={chatBotTopicCreateLoading}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              background:
                chatBotTopicDialogMode === "create"
                  ? "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)"
                  : "linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
              },
            }}
          >
            {chatBotTopicCreateLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : chatBotTopicDialogMode === "create" ? (
              "Thêm mới"
            ) : (
              "Cập nhật"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ChatBot Topic View Dialog */}
      <Dialog
        open={openChatBotTopicViewDialog}
        onClose={() => setOpenChatBotTopicViewDialog(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#e3f2fd",
            color: "#1976d2",
            fontWeight: 700,
            borderBottom: "1px solid #1976d2",
          }}
        >
          👁️ Chi tiết ChatBot Topic
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedChatBotTopic && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: "#f5f5f5", border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="#1976d2"
                      gutterBottom
                    >
                      Model Chat Bot
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <SmartToy color="primary" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {selectedChatBotTopic.modelChatBot?.name ||
                            `Model ${selectedChatBotTopic.modelChatBotId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedChatBotTopic.modelChatBot?.description ||
                            "Không có mô tả"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: "#f5f5f5", border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="#2e7d32"
                      gutterBottom
                    >
                      Topic
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TopicIcon color="primary" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {selectedChatBotTopic.topic?.title ||
                            `Topic ${selectedChatBotTopic.topicId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedChatBotTopic.topic?.description ||
                            "Không có mô tả"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ bgcolor: "#fff3e0", border: "1px solid #ffcc02" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="#e65100"
                      gutterBottom
                    >
                      Mô tả liên kết
                    </Typography>
                    <Typography variant="body1">
                      {selectedChatBotTopic.description ||
                        "Không có mô tả cho liên kết này"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    Ngày tạo:{" "}
                    {selectedChatBotTopic.createdAt
                      ? new Date(selectedChatBotTopic.createdAt).toLocaleString(
                          "vi-VN"
                        )
                      : "Không có"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {selectedChatBotTopic.id}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenChatBotTopicViewDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              color: "#666",
              borderColor: "#ddd",
              "&:hover": {
                borderColor: "#999",
                bgcolor: "#f5f5f5",
              },
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManagerFineTuneAI;
