import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  CircularProgress,
  Alert,
  Avatar,
  Snackbar,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  LocalShipping as LocalShippingIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Import Redux actions và selectors
import {
  fetchOrders,
  ORDER_STATUS_MAP,
  selectOrders,
  selectOrderStatus,
  selectOrderError,
  selectOrderPagination,
} from "../../store/features/order/orderSlice";
import {
  createProgressLog,
  resetCreateStatus,
} from "../../store/features/progressLog/progressLogSlice";
import { getOrdersApi } from "../../api/orderService";

const OrderManager = () => {
  const dispatch = useDispatch();

  // Redux state
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderStatus) === "loading";
  const error = useSelector(selectOrderError);
  const pagination = useSelector(selectOrderPagination);

  // Local state
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false); // Dialog upload file
  const [uploading, setUploading] = useState(false); // Trạng thái upload
  const [description, setDescription] = useState(""); // Description cho progress log
  const [selectedFiles, setSelectedFiles] = useState([]); // Multiple files
  const [filePreviews, setFilePreviews] = useState([]); // Multiple file previews
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statsLoading, setStatsLoading] = useState(false);
  const [productUploadDialogOpen, setProductUploadDialogOpen] = useState(false);
  const [deliveryUploadDialogOpen, setDeliveryUploadDialogOpen] =
    useState(false);
  const [installedUploadDialogOpen, setInstalledUploadDialogOpen] =
    useState(false);
  
  // Snackbar state cho thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success, error, warning, info
  });

  // Function để hiển thị thông báo
  const showNotification = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const openInstalledUploadDialog = (order) => {
    setSelectedOrder(order);
    setInstalledUploadDialogOpen(true);
    setSelectedFiles([]);
    setFilePreviews([]);
    setDescription("");
  };

  const openDeliveryUploadDialog = (order) => {
    setSelectedOrder(order);
    setDeliveryUploadDialogOpen(true);
    setSelectedFiles([]);
    setFilePreviews([]);
    setDescription("");
  };
  const openProductUploadDialog = (order) => {
    setSelectedOrder(order);
    setProductUploadDialogOpen(true);
    setSelectedFiles([]);
    setFilePreviews([]);
    setDescription("");
  };
  const [overviewStats, setOverviewStats] = useState({
    inProgress: 0,
    producing: 0,
    productionCompleted: 0,
    delivering: 0,
    installed: 0,
  });
  const loadOverviewStatsWithApi = async () => {
    setStatsLoading(true);
    try {
      console.log("Loading overview stats with API...");

      const statuses = [
        { key: "IN_PROGRESS", prop: "inProgress" },
        { key: "PRODUCING", prop: "producing" },
        { key: "PRODUCTION_COMPLETED", prop: "productionCompleted" },
        { key: "DELIVERING", prop: "delivering" },
        { key: "INSTALLED", prop: "installed" },
      ];

      const newStats = { ...overviewStats };

      // Gọi API trực tiếp từ orderService
      for (const status of statuses) {
        try {
          const result = await getOrdersApi(status.key, 1, 1);

          console.log(`${status.key} API result:`, result);

          if (result.success) {
            const count = result.pagination?.totalElements || 0;
            newStats[status.prop] = count;
            console.log(`${status.key}: ${count}`);
          } else {
            console.error(`API error for ${status.key}:`, result.error);
            newStats[status.prop] = 0;
          }
        } catch (error) {
          console.error(`Error loading ${status.key}:`, error);
          newStats[status.prop] = 0;
        }
      }

      console.log("Final stats:", newStats);
      setOverviewStats(newStats);
    } catch (error) {
      console.error("Error loading overview stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };
  const loadOrdersByTab = async (tabIndex) => {
    const statusMap = {
      0: "IN_PROGRESS",
      1: "PRODUCING",
      2: "PRODUCTION_COMPLETED",
      3: "DELIVERING",
      4: "INSTALLED",
    };

    const status = statusMap[tabIndex] || "IN_PROGRESS";

    try {
      await dispatch(
        fetchOrders({
          orderStatus: status,
          page: page,
          size: pageSize,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error loading orders by tab:", error);
    }
  };
  useEffect(() => {
    // Thử dùng API trực tiếp trước
    loadOverviewStatsWithApi();
  }, []);

  useEffect(() => {
    // Load đơn hàng khi thay đổi tab, page, pageSize
    loadOrdersByTab(currentTab);
  }, [currentTab, page, pageSize]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(1); // Reset về trang đầu
    // loadOrdersByTab sẽ được gọi tự động qua useEffect
  };
  const handleRefresh = () => {
    loadOverviewStatsWithApi(); // Refresh thống kê với API
    loadOrdersByTab(currentTab); // Refresh tab hiện tại
  };

  const getStatusChip = (status) => {
    const statusInfo = ORDER_STATUS_MAP[status] || {
      label: status,
      color: "default",
    };
    return (
      <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
    );
  };

  // Tính toán progress dựa trên status
 const calculateProgress = (status) => {
  switch (status) {
    case "IN_PROGRESS":
      return 20;
    case "PRODUCING":
      return 40;
    case "PRODUCTION_COMPLETED":
      return 60;
    case "DELIVERING":
      return 80;
    case "INSTALLED":
      return 100; // ✅ Sửa từ 90 thành 100
    case "ORDER_COMPLETED":
      return 100;
    default:
      return 0;
  }
};

  const ProductionProgress = ({ order }) => {
    const progress = calculateProgress(order.status);
    const statusInfo = ORDER_STATUS_MAP[order.status] || {
      label: order.status,
    };

    return (
      <Box sx={{ width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {statusInfo.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
          color={progress === 100 ? "success" : "primary"}
        />
      </Box>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleMultipleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // Kiểm tra định dạng và kích thước files
      const validFiles = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          showNotification(`File ${file.name} không phải là ảnh!`, "warning");
          continue;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          showNotification(`File ${file.name} quá lớn! Vui lòng chọn file nhỏ hơn 5MB.`, "warning");
          continue;
        }
        
        validFiles.push(file);
      }
      
      if (validFiles.length === 0) {
        return;
      }
      
      setSelectedFiles(validFiles);

      // Tạo preview cho từng file
      const previews = [];
      let loadedCount = 0;
      
      validFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[index] = {
            id: index,
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size
          };
          
          loadedCount++;
          if (loadedCount === validFiles.length) {
            setFilePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (indexToRemove) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = filePreviews.filter((_, index) => index !== indexToRemove);
    
    // Cập nhật lại id cho các preview còn lại
    const reindexedPreviews = updatedPreviews.map((preview, newIndex) => ({
      ...preview,
      id: newIndex
    }));
    
    setSelectedFiles(updatedFiles);
    setFilePreviews(reindexedPreviews);
  };
  const handleUploadDraftImage = async () => {
    if (selectedFiles.length === 0 || !selectedOrder) {
      showNotification("Vui lòng chọn ít nhất một file ảnh!", "warning");
      return;
    }

    if (!description.trim()) {
      showNotification("Vui lòng nhập mô tả!", "warning");
      return;
    }

    setUploading(true);
    try {
      // Gọi API createProgressLog thay vì updateOrderToProducing
      await dispatch(
        createProgressLog({
          orderId: selectedOrder.id,
          progressLogData: {
            description: description.trim(),
            status: "PRODUCING",
            progressLogImages: selectedFiles,
          },
        })
      ).unwrap();

      // Đóng dialog và reset state
      setUploadDialogOpen(false);
      setSelectedFiles([]);
      setFilePreviews([]);
      setDescription("");
      setSelectedOrder(null);
      
      // Reset create status
      dispatch(resetCreateStatus());

      // Reload dữ liệu
      loadOverviewStatsWithApi();
      loadOrdersByTab(currentTab);

      showNotification("Bắt đầu thi công thành công! 🔨", "success");
    } catch (error) {
      console.error("Error creating progress log:", error);
      showNotification("Có lỗi xảy ra khi tạo progress log: " + error, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadProductionCompletedImage = async () => {
    if (selectedFiles.length === 0 || !selectedOrder) {
      showNotification("Vui lòng chọn ít nhất một file ảnh!", "warning");
      return;
    }

    if (!description.trim()) {
      showNotification("Vui lòng nhập mô tả!", "warning");
      return;
    }

    setUploading(true);
    try {
      // Gọi API createProgressLog cho PRODUCTION_COMPLETED
      await dispatch(
        createProgressLog({
          orderId: selectedOrder.id,
          progressLogData: {
            description: description.trim(),
            status: "PRODUCTION_COMPLETED",
            progressLogImages: selectedFiles,
          },
        })
      ).unwrap();

      // Đóng dialog và reset state
      setProductUploadDialogOpen(false);
      setSelectedFiles([]);
      setFilePreviews([]);
      setDescription("");
      setSelectedOrder(null);
      
      // Reset create status
      dispatch(resetCreateStatus());

      // Reload dữ liệu
      loadOverviewStatsWithApi();
      loadOrdersByTab(currentTab);

      showNotification("Hoàn thành sản xuất thành công! 🎉", "success");
    } catch (error) {
      console.error("Error creating progress log for production completed:", error);
      showNotification("Có lỗi xảy ra khi tạo progress log: " + error, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadDeliveryProgressImage = async () => {
    if (selectedFiles.length === 0 || !selectedOrder) {
      showNotification("Vui lòng chọn ít nhất một file ảnh!", "warning");
      return;
    }

    if (!description.trim()) {
      showNotification("Vui lòng nhập mô tả!", "warning");
      return;
    }

    setUploading(true);
    try {
      // Gọi API createProgressLog cho DELIVERING
      await dispatch(
        createProgressLog({
          orderId: selectedOrder.id,
          progressLogData: {
            description: description.trim(),
            status: "DELIVERING",
            progressLogImages: selectedFiles,
          },
        })
      ).unwrap();

      // Đóng dialog và reset state
      setDeliveryUploadDialogOpen(false);
      setSelectedFiles([]);
      setFilePreviews([]);
      setDescription("");
      setSelectedOrder(null);
      
      // Reset create status
      dispatch(resetCreateStatus());

      // Reload dữ liệu
      loadOverviewStatsWithApi();
      loadOrdersByTab(currentTab);

      showNotification("Bắt đầu vận chuyển thành công! 🚚", "success");
    } catch (error) {
      console.error("Error creating progress log for delivery:", error);
      showNotification("Có lỗi xảy ra khi tạo progress log: " + error, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadInstalledProgressImage = async () => {
    if (selectedFiles.length === 0 || !selectedOrder) {
      showNotification("Vui lòng chọn ít nhất một file ảnh!", "warning");
      return;
    }

    if (!description.trim()) {
      showNotification("Vui lòng nhập mô tả!", "warning");
      return;
    }

    setUploading(true);
    try {
      // Gọi API createProgressLog cho INSTALLED
      await dispatch(
        createProgressLog({
          orderId: selectedOrder.id,
          progressLogData: {
            description: description.trim(),
            status: "INSTALLED",
            progressLogImages: selectedFiles,
          },
        })
      ).unwrap();

      // Đóng dialog và reset state
      setInstalledUploadDialogOpen(false);
      setSelectedFiles([]);
      setFilePreviews([]);
      setDescription("");
      setSelectedOrder(null);
      
      // Reset create status
      dispatch(resetCreateStatus());

      // Reload dữ liệu
      loadOverviewStatsWithApi();
      loadOrdersByTab(currentTab);

      showNotification("Hoàn thành lắp đặt thành công! 🎊", "success");
    } catch (error) {
      console.error("Error creating progress log for installed:", error);
      showNotification("Có lỗi xảy ra khi tạo progress log: " + error, "error");
    } finally {
      setUploading(false);
    }
  };
  const openUploadDialog = (order) => {
    setSelectedOrder(order);
    setUploadDialogOpen(true);
    setSelectedFiles([]);
    setFilePreviews([]);
    setDescription("");
  };
  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Quản lý Thi công & Vận chuyển
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading || statsLoading}
        >
          {statsLoading ? "Đang tải..." : "Làm mới"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">
                    {statsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      overviewStats.inProgress
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang trong quá trình thi công
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <BuildIcon color="secondary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">
                    {statsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      overviewStats.producing
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang thi công
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">
                    {statsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      overviewStats.productionCompleted
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã thi công
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TimerIcon color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">
                    {statsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      overviewStats.delivering
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang vận chuyển
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckCircleIcon color="info" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h6">
                    {statsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      overviewStats.installed
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã lắp đặt
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs và bảng đơn hàng */}
      <Paper sx={{ p: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Đang trong quá trình thi công" />
          <Tab label="Đang thi công" />
          <Tab label="Đã thi công" />
          <Tab label="Đang vận chuyển" />
          <Tab label="Đã lắp đặt" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Tiến độ</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Ngày giao dự kiến</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      Không có đơn hàng nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderCode || order.id}</TableCell>
                    <TableCell>
                      {order.users?.fullName ||
                        order.user?.name ||
                        order.customerName ||
                        "N/A"}
                    </TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <ProductionProgress order={order} />
                    </TableCell>
                    <TableCell>
                      {order.createAt
                        ? new Date(order.createAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {order.estimatedDeliveryDate
                        ? new Date(
                            order.estimatedDeliveryDate
                          ).toLocaleDateString("vi-VN")
                        : "Chưa xác định"}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedOrder(order);
                              setDialogOpen(true);
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Nút bắt đầu thi công chỉ hiện với status IN_PROGRESS */}
                        {order.status === "IN_PROGRESS" && (
                          <Tooltip title="Bắt đầu thi công">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openUploadDialog(order)}
                            >
                              <BuildIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Nút chuyển trạng thái tùy theo status hiện tại */}
                        {order.status === "PRODUCING" && (
                          <Tooltip title="Hoàn thành sản xuất">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => openProductUploadDialog(order)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {order.status === "PRODUCTION_COMPLETED" && (
                          <Tooltip title="Bắt đầu vận chuyển">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => openDeliveryUploadDialog(order)}
                            >
                              <LocalShippingIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {order.status === "DELIVERING" && (
                          <Tooltip title="Hoàn thành lắp đặt">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => openInstalledUploadDialog(order)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Cập nhật trạng thái">
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <Dialog
                      open={installedUploadDialogOpen}
                      onClose={() => setInstalledUploadDialogOpen(false)}
                      maxWidth="md"
                      fullWidth
                    >
                      <DialogTitle>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CheckCircleIcon color="success" />
                          Hoàn thành lắp đặt
                        </Box>
                      </DialogTitle>
                      <DialogContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Đơn hàng: {selectedOrder?.orderCode || selectedOrder?.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Khách hàng:{" "}
                            {selectedOrder?.users?.fullName || "N/A"}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            Chọn nhiều ảnh lắp đặt
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              hidden
                              onChange={handleMultipleFileSelect}
                            />
                          </Button>

                          {selectedFiles.length > 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Đã chọn {selectedFiles.length} file
                            </Typography>
                          )}

                          {filePreviews.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Xem trước ({filePreviews.length} ảnh):
                              </Typography>
                              <Grid container spacing={2}>
                                {filePreviews.map((preview, index) => (
                                  <Grid item xs={6} sm={4} key={index}>
                                    <Box sx={{ position: "relative" }}>
                                      <Avatar
                                        src={preview.preview || preview}
                                        variant="rounded"
                                        sx={{
                                          width: "100%",
                                          height: 120,
                                          objectFit: "cover",
                                        }}
                                      />
                                      <IconButton
                                        size="small"
                                        sx={{
                                          position: "absolute",
                                          top: 4,
                                          right: 4,
                                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                                          "&:hover": {
                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                                          },
                                        }}
                                        onClick={() => removeFile(index)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}
                        </Box>

                        <TextField
                          fullWidth
                          label="Mô tả hoàn thành lắp đặt"
                          multiline
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Nhập mô tả về tình trạng lắp đặt hoàn thành..."
                          sx={{ mb: 2 }}
                        />

                        <Alert severity="success" sx={{ mt: 2 }}>
                          Sau khi upload, trạng thái đơn hàng sẽ chuyển thành
                          "Đã lắp đặt"
                        </Alert>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => setInstalledUploadDialogOpen(false)}
                          disabled={uploading}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleUploadInstalledProgressImage}
                          disabled={selectedFiles.length === 0 || uploading || !description.trim()}
                          startIcon={
                            uploading ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                        >
                          {uploading
                            ? "Đang xử lý..."
                            : "Hoàn thành lắp đặt"}
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Dialog
                      open={deliveryUploadDialogOpen}
                      onClose={() => setDeliveryUploadDialogOpen(false)}
                      maxWidth="sm"
                      fullWidth
                    >
                      <DialogTitle>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocalShippingIcon color="info" />
                          Bắt đầu vận chuyển - Upload ảnh vận chuyển
                        </Box>
                      </DialogTitle>
                      <DialogContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Đơn hàng: {selectedOrder?.orderCode || selectedOrder?.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Khách hàng:{" "}
                            {selectedOrder?.users?.fullName || "N/A"}
                          </Typography>
                        </Box>

                        {/* Description Input */}
                        <Box sx={{ mb: 3 }}>
                          <TextField
                            label="Mô tả tiến độ"
                            multiline
                            rows={3}
                            fullWidth
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả về quá trình vận chuyển..."
                            variant="outlined"
                          />
                        </Box>

                        {/* Multiple File Input */}
                        <Box sx={{ mb: 3 }}>
                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            Chọn ảnh vận chuyển (có thể chọn nhiều file)
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              hidden
                              onChange={handleMultipleFileSelect}
                            />
                          </Button>

                          {selectedFiles.length > 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Đã chọn {selectedFiles.length} file
                            </Typography>
                          )}
                        </Box>

                        {/* Preview multiple images */}
                        {filePreviews.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Xem trước:
                            </Typography>
                            <Grid container spacing={2}>
                              {filePreviews.map((preview, index) => (
                                <Grid item xs={6} sm={4} key={index}>
                                  <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                      src={preview.preview}
                                      variant="rounded"
                                      sx={{
                                        width: "100%",
                                        height: 120,
                                        objectFit: "contain",
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        backgroundColor: 'error.main',
                                        color: 'white',
                                        '&:hover': {
                                          backgroundColor: 'error.dark',
                                        },
                                      }}
                                      onClick={() => removeFile(index)}
                                    >
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                    <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
                                      {preview.name}
                                    </Typography>
                                    <Typography variant="caption" display="block" textAlign="center" color="text.secondary">
                                      {(preview.size / 1024 / 1024).toFixed(2)}MB
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}

                        <Alert severity="info" sx={{ mt: 2 }}>
                          Sau khi upload, sẽ tạo progress log mới và trạng thái đơn hàng sẽ chuyển thành "Đang vận chuyển"
                        </Alert>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => setDeliveryUploadDialogOpen(false)}
                          disabled={uploading}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          color="info"
                          onClick={handleUploadDeliveryProgressImage}
                          disabled={selectedFiles.length === 0 || !description.trim() || uploading}
                          startIcon={
                            uploading ? (
                              <CircularProgress size={16} />
                            ) : (
                              <LocalShippingIcon />
                            )
                          }
                        >
                          {uploading
                            ? "Đang xử lý..."
                            : "Bắt đầu vận chuyển"}
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Dialog
                      open={productUploadDialogOpen}
                      onClose={() => setProductUploadDialogOpen(false)}
                      maxWidth="sm"
                      fullWidth
                    >
                      <DialogTitle>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CheckCircleIcon color="success" />
                          Hoàn thành sản xuất - Upload ảnh sản phẩm
                        </Box>
                      </DialogTitle>
                      <DialogContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Đơn hàng: {selectedOrder?.orderCode || selectedOrder?.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Khách hàng:{" "}
                            {selectedOrder?.users?.fullName || "N/A"}
                          </Typography>
                        </Box>

                        {/* Description Input */}
                        <Box sx={{ mb: 3 }}>
                          <TextField
                            label="Mô tả tiến độ"
                            multiline
                            rows={3}
                            fullWidth
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả về sản phẩm hoàn thành..."
                            variant="outlined"
                          />
                        </Box>

                        {/* Multiple File Input */}
                        <Box sx={{ mb: 3 }}>
                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            Chọn ảnh sản phẩm hoàn thành (có thể chọn nhiều file)
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              hidden
                              onChange={handleMultipleFileSelect}
                            />
                          </Button>

                          {selectedFiles.length > 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Đã chọn {selectedFiles.length} file
                            </Typography>
                          )}
                        </Box>

                        {/* Preview multiple images */}
                        {filePreviews.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Xem trước:
                            </Typography>
                            <Grid container spacing={2}>
                              {filePreviews.map((preview, index) => (
                                <Grid item xs={6} sm={4} key={index}>
                                  <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                      src={preview.preview}
                                      variant="rounded"
                                      sx={{
                                        width: "100%",
                                        height: 120,
                                        objectFit: "contain",
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        backgroundColor: 'error.main',
                                        color: 'white',
                                        '&:hover': {
                                          backgroundColor: 'error.dark',
                                        },
                                      }}
                                      onClick={() => removeFile(index)}
                                    >
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                    <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
                                      {preview.name}
                                    </Typography>
                                    <Typography variant="caption" display="block" textAlign="center" color="text.secondary">
                                      {(preview.size / 1024 / 1024).toFixed(2)}MB
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}

                        <Alert severity="success" sx={{ mt: 2 }}>
                          Sau khi upload, sẽ tạo progress log mới và trạng thái đơn hàng sẽ chuyển thành "Hoàn thành sản xuất"
                        </Alert>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => setProductUploadDialogOpen(false)}
                          disabled={uploading}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleUploadProductionCompletedImage}
                          disabled={selectedFiles.length === 0 || !description.trim() || uploading}
                          startIcon={
                            uploading ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                        >
                          {uploading
                            ? "Đang xử lý..."
                            : "Hoàn thành sản xuất"}
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Dialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CloudUploadIcon color="primary" />
              Bắt đầu thi công - Upload ảnh thiết kế
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Đơn hàng: {selectedOrder?.orderCode || selectedOrder?.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Khách hàng: {selectedOrder?.users?.fullName || "N/A"}
              </Typography>
            </Box>

            {/* Description Input */}
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Mô tả tiến độ"
                multiline
                rows={3}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả về tiến độ công việc..."
                variant="outlined"
              />
            </Box>

            {/* Multiple File Input */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Chọn ảnh thiết kế (có thể chọn nhiều file)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleMultipleFileSelect}
                />
              </Button>

              {selectedFiles.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Đã chọn {selectedFiles.length} file
                </Typography>
              )}
            </Box>

            {/* Preview multiple images */}
            {filePreviews.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Xem trước:
                </Typography>
                <Grid container spacing={2}>
                  {filePreviews.map((preview, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={preview.preview}
                          variant="rounded"
                          sx={{
                            width: "100%",
                            height: 120,
                            objectFit: "contain",
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'error.dark',
                            },
                          }}
                          onClick={() => removeFile(index)}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
                          {preview.name}
                        </Typography>
                        <Typography variant="caption" display="block" textAlign="center" color="text.secondary">
                          {(preview.size / 1024 / 1024).toFixed(2)}MB
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              Sau khi upload, sẽ tạo progress log mới và trạng thái đơn hàng sẽ chuyển thành "Đang sản xuất"
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploading}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleUploadDraftImage}
              disabled={selectedFiles.length === 0 || !description.trim() || uploading}
              startIcon={
                uploading ? <CircularProgress size={16} /> : <BuildIcon />
              }
            >
              {uploading ? "Đang xử lý..." : "Bắt đầu sản xuất"}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Trang {pagination.currentPage} / {pagination.totalPages}
              (Tổng {pagination.totalElements} đơn hàng)
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog chi tiết đơn hàng */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết đơn hàng {selectedOrder?.orderCode || selectedOrder?.id}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Thông tin cơ bản
                </Typography>
                <Typography>
                  Khách hàng: {selectedOrder.user?.name || "N/A"}
                </Typography>
                <Typography>
                  Trạng thái:{" "}
                  {ORDER_STATUS_MAP[selectedOrder.status]?.label ||
                    selectedOrder.status}
                </Typography>
                <Typography>
                  Tổng tiền:{" "}
                  {selectedOrder.totalAmount?.toLocaleString("vi-VN")} VNĐ
                </Typography>
                <Typography>
                  Địa chỉ: {selectedOrder.address || "Chưa có"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Trạng thái sản xuất
                </Typography>
                <ProductionProgress order={selectedOrder} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Đóng</Button>
          <Button variant="contained">Cập nhật</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderManager;
