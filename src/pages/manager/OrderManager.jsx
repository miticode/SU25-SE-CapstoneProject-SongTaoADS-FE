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
} from "@mui/icons-material";

// Import Redux actions và selectors
import {
  fetchOrders,
  updateOrderStatus,
  ORDER_STATUS_MAP,
  selectOrders,
  selectOrderStatus,
  selectOrderError,
  selectOrderPagination,
  updateOrderToProducing,
  updateOrderToProductionCompleted,
  updateOrderToDelivering,
  updateOrderToInstalled,
} from "../../store/features/order/orderSlice";
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
  const [selectedFile, setSelectedFile] = useState(null); // File được chọn
  const [filePreview, setFilePreview] = useState(null); // Preview ảnh
  const [uploading, setUploading] = useState(false); // Trạng thái upload
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statsLoading, setStatsLoading] = useState(false);
  const [productUploadDialogOpen, setProductUploadDialogOpen] = useState(false);
  const [selectedProductFile, setSelectedProductFile] = useState(null);
  const [productFilePreview, setProductFilePreview] = useState(null);
  const [productUploading, setProductUploading] = useState(false);
  const [deliveryUploadDialogOpen, setDeliveryUploadDialogOpen] =
    useState(false);
  const [selectedDeliveryFile, setSelectedDeliveryFile] = useState(null);
  const [deliveryFilePreview, setDeliveryFilePreview] = useState(null);
  const [deliveryUploading, setDeliveryUploading] = useState(false);
  const [installedUploadDialogOpen, setInstalledUploadDialogOpen] =
    useState(false);
  const [selectedInstalledFile, setSelectedInstalledFile] = useState(null);
  const [installedFilePreview, setInstalledFilePreview] = useState(null);
  const [installedUploading, setInstalledUploading] = useState(false);
  const openInstalledUploadDialog = (order) => {
    setSelectedOrder(order);
    setInstalledUploadDialogOpen(true);
  };
  const handleInstalledFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedInstalledFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setInstalledFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleUploadInstalledImage = async () => {
    if (!selectedInstalledFile || !selectedOrder) {
      alert("Vui lòng chọn file ảnh lắp đặt!");
      return;
    }

    setInstalledUploading(true);
    try {
      await dispatch(
        updateOrderToInstalled({
          orderId: selectedOrder.id,
          installedImageFile: selectedInstalledFile,
        })
      ).unwrap();

      // Đóng dialog và reset state
      setInstalledUploadDialogOpen(false);
      setSelectedInstalledFile(null);
      setInstalledFilePreview(null);
      setSelectedOrder(null);

      // Reload dữ liệu
      loadOverviewStatsWithApi();
      loadOrdersByTab(currentTab);

      alert("Hoàn thành lắp đặt thành công!");
    } catch (error) {
      console.error("Error uploading installed image:", error);
      alert("Có lỗi xảy ra khi upload ảnh lắp đặt: " + error);
    } finally {
      setInstalledUploading(false);
    }
  };
  const openDeliveryUploadDialog = (order) => {
    setSelectedOrder(order);
    setDeliveryUploadDialogOpen(true);
  };

  const handleDeliveryFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedDeliveryFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setDeliveryFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleUploadDeliveryImage = async () => {
    if (!selectedDeliveryFile || !selectedOrder) {
      alert("Vui lòng chọn file ảnh vận chuyển!");
      return;
    }

    setDeliveryUploading(true);
    try {
      await dispatch(
        updateOrderToDelivering({
          orderId: selectedOrder.id,
          deliveryImageFile: selectedDeliveryFile,
        })
      ).unwrap();

      // Đóng dialog và reset state
      setDeliveryUploadDialogOpen(false);
      setSelectedDeliveryFile(null);
      setDeliveryFilePreview(null);
      setSelectedOrder(null);

      // Reload dữ liệu
      loadOverviewStatsWithApi();
      loadOrdersByTab(currentTab);

      alert("Bắt đầu vận chuyển thành công!");
    } catch (error) {
      console.error("Error uploading delivery image:", error);
      alert("Có lỗi xảy ra khi upload ảnh vận chuyển: " + error);
    } finally {
      setDeliveryUploading(false);
    }
  };
  const openProductUploadDialog = (order) => {
    setSelectedOrder(order);
    setProductUploadDialogOpen(true);
  };
  const handleProductFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedProductFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleUploadProductImage = async () => {
    if (!selectedProductFile || !selectedOrder) {
      alert("Vui lòng chọn file ảnh sản phẩm!");
      return;
    }

    setProductUploading(true);
    try {
      await dispatch(
        updateOrderToProductionCompleted({
          orderId: selectedOrder.id,
          productImageFile: selectedProductFile,
        })
      ).unwrap();

      // Đóng dialog và reset state
      setProductUploadDialogOpen(false);
      setSelectedProductFile(null);
      setProductFilePreview(null);
      setSelectedOrder(null);

      // Reload dữ liệu
      loadOverviewStatsWithApi();
      loadOrdersByTab(currentTab);

      alert("Hoàn thành sản xuất thành công!");
    } catch (error) {
      console.error("Error uploading product image:", error);
      alert("Có lỗi xảy ra khi upload ảnh sản phẩm: " + error);
    } finally {
      setProductUploading(false);
    }
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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await dispatch(
        updateOrderStatus({ orderId, status: newStatus })
      ).unwrap();

      // Reload thống kê và tab hiện tại
      loadOverviewStats();
      loadOrdersByTab(currentTab);

      // Thông báo thành công
      console.log("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    }
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

  const getPriorityChip = (priority) => (
    <Chip
      label={priority}
      color={
        priority === "HIGH"
          ? "error"
          : priority === "MEDIUM"
          ? "warning"
          : "default"
      }
      size="small"
      variant="outlined"
    />
  );

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
    case "COMPLETED":
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
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh!");
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.");
        return;
      }

      setSelectedFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleUploadDraftImage = async () => {
    if (!selectedFile || !selectedOrder) {
      alert("Vui lòng chọn file ảnh!");
      return;
    }

    setUploading(true);
    try {
      await dispatch(
        updateOrderToProducing({
          orderId: selectedOrder.id,
          draftImageFile: selectedFile,
        })
      ).unwrap();

      // Đóng dialog và reset state
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      setSelectedOrder(null);

      // Reload dữ liệu
      loadOverviewStats();
      loadOrdersByTab(currentTab);

      alert("Cập nhật trạng thái sản xuất thành công!");
    } catch (error) {
      console.error("Error uploading draft image:", error);
      alert("Có lỗi xảy ra khi upload ảnh: " + error);
    } finally {
      setUploading(false);
    }
  };
  const openUploadDialog = (order) => {
    setSelectedOrder(order);
    setUploadDialogOpen(true);
    setSelectedFile(null);
    setFilePreview(null);
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
                    <TableCell>{order.id}</TableCell>
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
                      maxWidth="sm"
                      fullWidth
                    >
                      <DialogTitle>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CheckCircleIcon color="success" />
                          Hoàn thành lắp đặt - Upload ảnh lắp đặt
                        </Box>
                      </DialogTitle>
                      <DialogContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Đơn hàng: {selectedOrder?.id}
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
                            Chọn ảnh lắp đặt hoàn thành
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleInstalledFileSelect}
                            />
                          </Button>

                          {selectedInstalledFile && (
                            <Typography variant="body2" color="text.secondary">
                              File đã chọn: {selectedInstalledFile.name} (
                              {(
                                selectedInstalledFile.size /
                                1024 /
                                1024
                              ).toFixed(2)}
                              MB)
                            </Typography>
                          )}
                        </Box>

                        {installedFilePreview && (
                          <Box sx={{ mb: 2, textAlign: "center" }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Xem trước:
                            </Typography>
                            <Avatar
                              src={installedFilePreview}
                              variant="rounded"
                              sx={{
                                width: "100%",
                                height: 200,
                                margin: "0 auto",
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                        )}

                        <Alert severity="success" sx={{ mt: 2 }}>
                          Sau khi upload, trạng thái đơn hàng sẽ chuyển thành
                          "Đã lắp đặt"
                        </Alert>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => setInstalledUploadDialogOpen(false)}
                          disabled={installedUploading}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleUploadInstalledImage}
                          disabled={
                            !selectedInstalledFile || installedUploading
                          }
                          startIcon={
                            installedUploading ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                        >
                          {installedUploading
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
                            Đơn hàng: {selectedOrder?.id}
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
                            Chọn ảnh vận chuyển
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleDeliveryFileSelect}
                            />
                          </Button>

                          {selectedDeliveryFile && (
                            <Typography variant="body2" color="text.secondary">
                              File đã chọn: {selectedDeliveryFile.name} (
                              {(
                                selectedDeliveryFile.size /
                                1024 /
                                1024
                              ).toFixed(2)}
                              MB)
                            </Typography>
                          )}
                        </Box>

                        {deliveryFilePreview && (
                          <Box sx={{ mb: 2, textAlign: "center" }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Xem trước:
                            </Typography>
                            <Avatar
                              src={deliveryFilePreview}
                              variant="rounded"
                              sx={{
                                width: "100%",
                                height: 200,
                                margin: "0 auto",
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                        )}

                        <Alert severity="info" sx={{ mt: 2 }}>
                          Sau khi upload, trạng thái đơn hàng sẽ chuyển thành
                          "Đang vận chuyển"
                        </Alert>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => setDeliveryUploadDialogOpen(false)}
                          disabled={deliveryUploading}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          color="info"
                          onClick={handleUploadDeliveryImage}
                          disabled={!selectedDeliveryFile || deliveryUploading}
                          startIcon={
                            deliveryUploading ? (
                              <CircularProgress size={16} />
                            ) : (
                              <LocalShippingIcon />
                            )
                          }
                        >
                          {deliveryUploading
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
                            Đơn hàng: {selectedOrder?.id}
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
                            Chọn ảnh sản phẩm hoàn thành
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleProductFileSelect}
                            />
                          </Button>

                          {selectedProductFile && (
                            <Typography variant="body2" color="text.secondary">
                              File đã chọn: {selectedProductFile.name} (
                              {(selectedProductFile.size / 1024 / 1024).toFixed(
                                2
                              )}
                              MB)
                            </Typography>
                          )}
                        </Box>

                        {productFilePreview && (
                          <Box sx={{ mb: 2, textAlign: "center" }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Xem trước:
                            </Typography>
                            <Avatar
                              src={productFilePreview}
                              variant="rounded"
                              sx={{
                                width: "100%",
                                height: 200,
                                margin: "0 auto",
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                        )}

                        <Alert severity="success" sx={{ mt: 2 }}>
                          Sau khi upload, trạng thái đơn hàng sẽ chuyển thành
                          "Hoàn thành sản xuất"
                        </Alert>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => setProductUploadDialogOpen(false)}
                          disabled={productUploading}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleUploadProductImage}
                          disabled={!selectedProductFile || productUploading}
                          startIcon={
                            productUploading ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                        >
                          {productUploading
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
                Đơn hàng: {selectedOrder?.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Khách hàng: {selectedOrder?.users?.fullName || "N/A"}
              </Typography>
            </Box>

            {/* File Input */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Chọn ảnh thiết kế
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileSelect}
                />
              </Button>

              {selectedFile && (
                <Typography variant="body2" color="text.secondary">
                  File đã chọn: {selectedFile.name} (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                </Typography>
              )}
            </Box>

            {/* Preview ảnh */}
            {filePreview && (
              <Box sx={{ mb: 2, textAlign: "center" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Xem trước:
                </Typography>
                <Avatar
                  src={filePreview}
                  variant="rounded"
                  sx={{
                    width: "100%",
                    height: 200,
                    margin: "0 auto",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              Sau khi upload, trạng thái đơn hàng sẽ chuyển thành "Đang thi
              công"
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
              disabled={!selectedFile || uploading}
              startIcon={
                uploading ? <CircularProgress size={16} /> : <BuildIcon />
              }
            >
              {uploading ? "Đang xử lý..." : "Bắt đầu thi công"}
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
        <DialogTitle>Chi tiết đơn hàng {selectedOrder?.id}</DialogTitle>
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
    </Box>
  );
};

export default OrderManager;
