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
} from "../../store/features/chat/chatSlice";

const OPENAI_MODELS = [
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-1106",
  "gpt-3.5-turbo-instruct-0914",
  "gpt-4-0613",
  "gpt-4-turbo-2024-04-09",
  "gpt-4.1-2025-04-14",
  "gpt-4.1-mini-2025-04-14",
  "gpt-4.1-nano-2025-04-14",
  "gpt-4.5-preview-2025-02-27",
  "gpt-4o-2024-05-13",
  "gpt-4o-2024-08-06",
  "gpt-4o-2024-11-20",
  "gpt-4o-audio-preview-2024-10-01",
  "gpt-4o-audio-preview-2024-12-17",
  "gpt-4o-audio-preview-2025-06-03",
];

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
  const [file, setFile] = useState(null);
  const [alert, setAlert] = useState(null);
  const [selectedModel, setSelectedModel] = useState(OPENAI_MODELS[0]);
  const [tab, setTab] = useState(0);
  const [openFileDetail, setOpenFileDetail] = useState(false);
  const [fileFilter, setFileFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [filePage, setFilePage] = useState(0);
  const [fileRowsPerPage, setFileRowsPerPage] = useState(5);
  const [jobPage, setJobPage] = useState(0);
  const [jobRowsPerPage, setJobRowsPerPage] = useState(5);
  const [confirmDeleteFileId, setConfirmDeleteFileId] = useState(null);

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
          model: selectedModel,
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
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Quản lý Fine-tune" />
        <Tab label="Danh sách Job Fine-tune" />
        <Tab label="Danh sách File Đã Upload" />
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
              <Autocomplete
                disablePortal
                options={OPENAI_MODELS}
                value={selectedModel}
                onChange={(_, value) => setSelectedModel(value)}
                sx={{ width: 300 }}
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
            }}
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
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
    </Box>
  );
};

export default ManagerFineTuneAI;
