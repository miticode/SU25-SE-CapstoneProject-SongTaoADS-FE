import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  DialogActions,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  Snackbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
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
  AttachMoney as AttachMoneyIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// Import Redux actions và selectors
import {
  fetchOrders,
  ORDER_STATUS_MAP,
  selectOrders,
  selectOrderStatus,
  selectOrderError,
  selectOrderPagination,
  searchProductionOrders,
  selectSearchProductionOrders,
  selectSearchProductionOrdersStatus,
  selectSearchProductionOrdersPagination,
  selectSearchProductionOrdersQuery,
  clearSearchProductionOrders,
  fetchOrderDetails,
} from "../../store/features/order/orderSlice";
import { useSelector as useReduxSelector } from 'react-redux';
import {
  createProgressLog,
  resetCreateStatus,
} from "../../store/features/progressLog/progressLogSlice";
import {
  castPaidThunk,
  selectPaymentSuccess,
  selectPaymentError,
} from "../../store/features/payment/paymentSlice";
import { getOrdersApi } from "../../api/orderService";

// Card thống kê sử dụng Tailwind
const StatsCard = ({ icon, label, value, loading, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    cyan: 'bg-cyan-50 text-cyan-600'
  };
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${colorMap[color] || colorMap.blue}`}>
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-lg font-semibold text-gray-800 h-6 flex items-center">
          {loading ? <CircularProgress size={18} /> : (value ?? 0)}
        </div>
        <p className="text-xs leading-snug text-gray-500 line-clamp-2">{label}</p>
      </div>
    </div>
  );
};

const OrderManager = () => {
  const dispatch = useDispatch();

  // Redux state
  const orders = useSelector(selectOrders); // normal list
  const orderStatusLoading = useSelector(selectOrderStatus) === "loading";
  const error = useSelector(selectOrderError);
  const normalPagination = useSelector(selectOrderPagination);
  // Production search state
  const productionSearchResults = useSelector(selectSearchProductionOrders);
  const productionSearchStatus = useSelector(selectSearchProductionOrdersStatus);
  const productionSearchPagination = useSelector(selectSearchProductionOrdersPagination);
  const productionSearchQuery = useSelector(selectSearchProductionOrdersQuery);

  // Payment selectors
  const paymentSuccess = useSelector(selectPaymentSuccess);
  const paymentError = useSelector(selectPaymentError);

  // Local state
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Order details state from redux (if already wired in slice)
  const orderDetails = useReduxSelector(state => state.order.orderDetails);
  const orderDetailsStatus = useReduxSelector(state => state.order.orderDetailsStatus);
  const orderDetailsError = useReduxSelector(state => state.order.orderDetailsError);

  const openDetailsDialog = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
    // Fetch richer details if installed or always (optionally only for INSTALLED)
    if (order?.id) {
      dispatch(fetchOrderDetails(order.id));
    }
  };
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false); // Dialog upload file
  const [uploading, setUploading] = useState(false); // Trạng thái upload
  const [description, setDescription] = useState(""); // Description cho progress log
  const [selectedFiles, setSelectedFiles] = useState([]); // Multiple files
  const [filePreviews, setFilePreviews] = useState([]); // Multiple file previews
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [statsLoading, setStatsLoading] = useState(false);
  const [productUploadDialogOpen, setProductUploadDialogOpen] = useState(false);
  const [deliveryUploadDialogOpen, setDeliveryUploadDialogOpen] =
    useState(false);
  const [installedUploadDialogOpen, setInstalledUploadDialogOpen] =
    useState(false);
  
  // State cho dialog xác nhận thanh toán tiền mặt
  const [cashPaymentDialogOpen, setCashPaymentDialogOpen] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  
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

  // Function mở dialog xác nhận thanh toán tiền mặt
  const openCashPaymentDialog = (order) => {
    setSelectedOrder(order);
    setCashPaymentDialogOpen(true);
  };

  // Function xử lý xác nhận thanh toán tiền mặt
  const handleConfirmCashPayment = async () => {
    if (!selectedOrder) {
      showNotification("Không tìm thấy thông tin đơn hàng!", "error");
      return;
    }

    setConfirmingPayment(true);
    try {
      await dispatch(
        castPaidThunk({
          orderId: selectedOrder.id,
          paymentType: "REMAINING_CONSTRUCTION",
        })
      ).unwrap();

      setCashPaymentDialogOpen(false);
      setSelectedOrder(null);

      // Reload dữ liệu
      loadOverviewStatsWithApi();
      loadOrdersByTab(currentTab);

      showNotification("Xác nhận thanh toán tiền mặt thành công! 💰", "success");
    } catch (error) {
      console.error("Error confirming cash payment:", error);
      showNotification("Có lỗi xảy ra khi xác nhận thanh toán: " + error, "error");
    } finally {
      setConfirmingPayment(false);
    }
  };

  // Refresh stats + current tab data
  const handleRefresh = () => {
    loadOverviewStatsWithApi();
    loadOrdersByTab(currentTab);
  };

  // Đổi tab
  const changeTab = (index) => {
    setCurrentTab(index);
    setPage(1);
  };

  // Search handlers
  const handleSearch = () => {
    if (searchInput.trim()) {
      dispatch(searchProductionOrders({ query: searchInput.trim(), page: 1, size: pageSize }));
    }
  };
  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const handleClearSearch = () => {
    setSearchInput('');
    dispatch(clearSearchProductionOrders());
    loadOrdersByTab(currentTab);
  };

  // Status chip renderer
  const getStatusChip = (status) => {
    if (!status) return null;
    const map = {
      IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
      PRODUCING: 'bg-purple-100 text-purple-700',
      PRODUCTION_COMPLETED: 'bg-emerald-100 text-emerald-700',
      DELIVERING: 'bg-amber-100 text-amber-700',
      INSTALLED: 'bg-cyan-100 text-cyan-700',
      ORDER_COMPLETED: 'bg-emerald-200 text-emerald-800'
    };
    const label = ORDER_STATUS_MAP[status]?.label || status;
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>{label}</span>;
  };

  // Payment side-effects notifications
  useEffect(() => {
    if (paymentSuccess) {
      showNotification('Thanh toán thành công', 'success');
    }
    if (paymentError) {
      showNotification('Lỗi thanh toán: ' + paymentError, 'error');
    }
  }, [paymentSuccess, paymentError]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Nếu đang tìm kiếm production thì gọi search, ngược lại load theo tab
    if (productionSearchQuery) {
      dispatch(searchProductionOrders({ query: productionSearchQuery, page, size: pageSize }));
    } else {
      loadOrdersByTab(currentTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productionSearchQuery, currentTab, page, pageSize, dispatch]);

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
    const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status };
    return (
      <div className="w-full">
    <div className="flex items-center justify-between mb-1 text-[11px] text-gray-500">
          <span>{statusInfo.label}</span>
          <span>{progress}%</span>
        </div>
    <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
      className={`h-full transition-all duration-300 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const displayedOrders = productionSearchQuery ? productionSearchResults : orders;
  const displayedPagination = productionSearchQuery ? productionSearchPagination : normalPagination;
  const displayedLoading = productionSearchQuery ? productionSearchStatus === "loading" : orderStatusLoading;

  if (displayedLoading && displayedOrders.length === 0) {
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
  <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">Quản lý Thi công & Vận chuyển</h1>
        <button
          onClick={handleRefresh}
          disabled={orderStatusLoading || statsLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed border-gray-300 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer"
        >
          {statsLoading && <CircularProgress size={16} />}
          <span>{statsLoading ? 'Đang tải...' : 'Làm mới'}</span>
        </button>
      </div>

      {error && (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Thống kê tổng quan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          icon={<AssignmentIcon fontSize="small" className="text-primary-600 text-blue-600" />}
          label="Đang trong quá trình thi công"
          value={overviewStats.inProgress}
          loading={statsLoading}
          color="blue"
        />
        <StatsCard
          icon={<BuildIcon fontSize="small" className="text-purple-600" />}
          label="Đang thi công"
          value={overviewStats.producing}
          loading={statsLoading}
          color="purple"
        />
        <StatsCard
          icon={<CheckCircleIcon fontSize="small" className="text-emerald-600" />}
          label="Đã thi công"
          value={overviewStats.productionCompleted}
          loading={statsLoading}
          color="emerald"
        />
        <StatsCard
          icon={<TimerIcon fontSize="small" className="text-amber-600" />}
          label="Đang vận chuyển"
          value={overviewStats.delivering}
          loading={statsLoading}
          color="amber"
        />
        <StatsCard
          icon={<CheckCircleIcon fontSize="small" className="text-cyan-600" />}
          label="Đã lắp đặt"
          value={overviewStats.installed}
          loading={statsLoading}
          color="cyan"
        />
      </div>

      {/* Tabs và bảng đơn hàng (Tailwind) */}
  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm space-y-4">
        {/* Tabs */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 md:gap-3 border-b border-gray-200 pb-2 mb-4">
            {[
              'Đang trong quá trình thi công',
              'Đang thi công',
              'Đã thi công',
              'Đang vận chuyển',
              'Đã lắp đặt'
            ].map((label, index) => (
              <button
                key={index}
                onClick={() => changeTab(index)}
                className={`whitespace-nowrap relative px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 flex items-center gap-1
                ${currentTab === index ? 'bg-indigo-50 text-indigo-600 shadow-inner ring-1 ring-indigo-200' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} cursor-pointer`}
              >
                {label}
                {index === 0 && overviewStats.inProgress > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[1.1rem] h-4 px-1 rounded-full text-[10px] font-semibold bg-indigo-600 text-white">{overviewStats.inProgress}</span>
                )}
                {index === 1 && overviewStats.producing > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[1.1rem] h-4 px-1 rounded-full text-[10px] font-semibold bg-purple-600 text-white">{overviewStats.producing}</span>
                )}
                {index === 2 && overviewStats.productionCompleted > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[1.1rem] h-4 px-1 rounded-full text-[10px] font-semibold bg-emerald-600 text-white">{overviewStats.productionCompleted}</span>
                )}
                {index === 3 && overviewStats.delivering > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[1.1rem] h-4 px-1 rounded-full text-[10px] font-semibold bg-amber-600 text-white">{overviewStats.delivering}</span>
                )}
                {index === 4 && overviewStats.installed > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[1.1rem] h-4 px-1 rounded-full text-[10px] font-semibold bg-cyan-600 text-white">{overviewStats.installed}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-400">
                <SearchIcon fontSize="small" />
              </span>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-800 placeholder-gray-400"
                placeholder="Tìm kiếm đơn hàng (mã đơn, khách hàng, ...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKey}
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-1 flex items-center px-1 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <CloseIcon fontSize="small" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={productionSearchStatus === 'loading'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2 shadow hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {productionSearchStatus === 'loading' && <CircularProgress size={16} color="inherit" />}
              <span>Tìm</span>
            </button>
            {productionSearchQuery && (
              <button
                onClick={handleClearSearch}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium px-3 py-2 hover:bg-gray-300 cursor-pointer"
              >
                <CloseIcon fontSize="small" />
                <span>Xóa</span>
              </button>
            )}
          </div>
        </div>
        {productionSearchQuery && (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700 mb-2">
            Đang hiển thị kết quả tìm kiếm cho: <strong>{productionSearchQuery}</strong> (Trang {displayedPagination.currentPage}/{displayedPagination.totalPages})
          </div>
        )}
        {/* Table */}
  <div className="overflow-x-auto rounded-lg border border-gray-200 relative">
          {/* Overlay spinner while loading but keep previous rows for smoother UX */}
          {displayedLoading && displayedOrders.length > 0 && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-start justify-end p-2 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/80 shadow text-[11px] font-medium text-gray-600">
                <CircularProgress size={14} />
                <span>Đang tải...</span>
              </div>
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                <th className="px-4 py-3 text-left">Mã đơn</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left min-w-[180px]">Tiến độ</th>
                <th className="px-4 py-3 text-left">Ngày tạo</th>
                <th className="px-4 py-3 text-left">Ngày giao dự kiến</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {displayedLoading && displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center">
                    <CircularProgress size={24} />
                  </td>
                </tr>
              ) : displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">Không có đơn hàng nào</td>
                </tr>
              ) : (
                displayedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{order.orderCode || order.id}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{order.users?.fullName || order.user?.name || order.customerName || 'N/A'}</td>
                    <td className="px-4 py-3">{getStatusChip(order.status)}</td>
                    <td className="px-4 py-3 w-56"><ProductionProgress order={order} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">{order.createdAt || order.createAt ? new Date(order.createdAt || order.createAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small" onClick={() => openDetailsDialog(order)} className="cursor-pointer">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {order.status === 'IN_PROGRESS' && (
                          <Tooltip title="Bắt đầu thi công">
                            <IconButton size="small" color="primary" onClick={() => openUploadDialog(order)} className="cursor-pointer">
                              <BuildIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {order.status === 'PRODUCING' && (
                          <Tooltip title="Hoàn thành sản xuất">
                            <IconButton size="small" color="success" onClick={() => openProductUploadDialog(order)} className="cursor-pointer">
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {order.status === 'PRODUCTION_COMPLETED' && (
                          <Tooltip title="Bắt đầu vận chuyển">
                            <IconButton size="small" color="info" onClick={() => openDeliveryUploadDialog(order)} className="cursor-pointer">
                              <LocalShippingIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {order.status === 'DELIVERING' && (
                          <Tooltip title="Hoàn thành lắp đặt">
                            <IconButton size="small" color="success" onClick={() => openInstalledUploadDialog(order)} className="cursor-pointer">
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {order.status === 'INSTALLED' && (
                          <Tooltip title="Xác nhận thanh toán tiền mặt">
                            <IconButton size="small" color="primary" onClick={() => openCashPaymentDialog(order)} className="cursor-pointer">
                              <AttachMoneyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                    {/* Các dialog upload tách ra khỏi map */}
                  </tr>
                )))}
              </tbody>
            </table>
        </div>
        {/* Pagination */}
        {displayedPagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <div className="text-xs text-gray-500">Trang {displayedPagination.currentPage} / {displayedPagination.totalPages} (Tổng {displayedPagination.totalElements} đơn hàng)</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >Trước</button>
              <div className="flex items-center gap-1 text-xs">
                <span className="px-2 py-1 rounded bg-indigo-600 text-white font-semibold">{page}</span>
              </div>
              <button
                onClick={() => setPage(p => Math.min(displayedPagination.totalPages, p + 1))}
                disabled={page === displayedPagination.totalPages}
                className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >Sau</button>
            </div>
          </div>
        )}
        {/* Tailwind Modal: Hoàn thành lắp đặt */}
        {installedUploadDialogOpen && (
          <div className="fixed inset-0 z-50 flex justify-center p-4 sm:p-6 items-start md:items-center pt-24 md:pt-6">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !uploading && setInstalledUploadDialogOpen(false)}
            />
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                  <CheckCircleIcon fontSize="small" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">Hoàn thành lắp đặt</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Upload ảnh lắp đặt & mô tả hoàn thành</p>
                </div>
                <button
                  onClick={() => !uploading && setInstalledUploadDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition inline-flex p-1 rounded-md hover:bg-gray-100"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
              {/* Body */}
              <div className="px-5 pb-4 pt-3 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-500">Mã đơn</span>
                      <span className="text-gray-800 text-sm font-semibold">{selectedOrder?.orderCode || selectedOrder?.id}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-500">Khách hàng</span>
                      <span className="text-gray-700 text-sm line-clamp-2">{selectedOrder?.users?.fullName || 'N/A'}</span>
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Mô tả hoàn thành</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả về tình trạng lắp đặt hoàn thành..."
                      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>
                  {/* Upload Zone */}
                  <div>
                    <label className="block mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Ảnh lắp đặt</label>
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition bg-gray-50/60 border-gray-300 hover:border-cyan-400 hover:bg-cyan-50/40">
                        <div className="flex flex-col items-center text-center gap-1">
                          <CloudUploadIcon className="text-cyan-500" fontSize="small" />
                          <span className="text-xs font-medium text-gray-700">Chọn ảnh lắp đặt (nhiều)</span>
                          <span className="text-[10px] text-gray-400">Tối đa 5MB mỗi ảnh</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={handleMultipleFileSelect}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    {selectedFiles.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">Đã chọn {selectedFiles.length} file</p>
                    )}
                  </div>
                  {/* Previews */}
                  {filePreviews.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Xem trước</p>
                        <span className="text-[10px] text-gray-400">{filePreviews.length} ảnh</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filePreviews.map((preview, index) => (
                          <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50 border-gray-200">
                            <img src={preview.preview || preview} alt={preview.name || `image-${index}`} className="h-32 w-full object-contain p-1 bg-white" />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                              <CancelIcon fontSize="inherit" className="!text-xs" />
                            </button>
                            <div className="px-1.5 pb-1">
                              <p className="text-[10px] font-medium text-gray-600 truncate" title={preview.name}>{preview.name || 'Ảnh'}</p>
                              {preview.size && <p className="text-[10px] text-gray-400">{(preview.size / 1024 / 1024).toFixed(2)}MB</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-[11px] text-cyan-700 leading-relaxed">
                    Sau khi upload, trạng thái đơn hàng sẽ chuyển thành <strong>Đã lắp đặt</strong>.
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
                <button
                  onClick={() => setInstalledUploadDialogOpen(false)}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUploadInstalledProgressImage}
                  disabled={selectedFiles.length === 0 || uploading || !description.trim()}
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed shadow"
                >
                  {uploading && <CircularProgress size={16} color="inherit" />}
                  {uploading ? 'Đang xử lý...' : 'Hoàn thành lắp đặt'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Tailwind Modal: Bắt đầu vận chuyển */}
        {deliveryUploadDialogOpen && (
          <div className="fixed inset-0 z-50 flex justify-center p-4 sm:p-6 items-start md:items-center pt-24 md:pt-6">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !uploading && setDeliveryUploadDialogOpen(false)}
            />
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <LocalShippingIcon fontSize="small" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">Bắt đầu vận chuyển</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Upload ảnh vận chuyển & mô tả tiến độ</p>
                </div>
                <button
                  onClick={() => !uploading && setDeliveryUploadDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition inline-flex p-1 rounded-md hover:bg-gray-100"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
              {/* Body */}
              <div className="px-5 pb-4 pt-3 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-500">Mã đơn</span>
                      <span className="text-gray-800 text-sm font-semibold">{selectedOrder?.orderCode || selectedOrder?.id}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-500">Khách hàng</span>
                      <span className="text-gray-700 text-sm line-clamp-2">{selectedOrder?.users?.fullName || 'N/A'}</span>
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Mô tả tiến độ</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả về quá trình vận chuyển..."
                      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                    />
                  </div>
                  {/* Upload Zone */}
                  <div>
                    <label className="block mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Ảnh vận chuyển</label>
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition bg-gray-50/60 border-gray-300 hover:border-sky-400 hover:bg-sky-50/40">
                        <div className="flex flex-col items-center text-center gap-1">
                          <CloudUploadIcon className="text-sky-500" fontSize="small" />
                          <span className="text-xs font-medium text-gray-700">Chọn ảnh vận chuyển</span>
                          <span className="text-[10px] text-gray-400">Có thể chọn nhiều ảnh (tối đa 5MB mỗi ảnh)</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={handleMultipleFileSelect}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    {selectedFiles.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">Đã chọn {selectedFiles.length} file</p>
                    )}
                  </div>
                  {/* Previews */}
                  {filePreviews.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Xem trước</p>
                        <span className="text-[10px] text-gray-400">{filePreviews.length} ảnh</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filePreviews.map((preview, index) => (
                          <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50 border-gray-200">
                            <img src={preview.preview} alt={preview.name} className="h-32 w-full object-contain p-1 bg-white" />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                              <CancelIcon fontSize="inherit" className="!text-xs" />
                            </button>
                            <div className="px-1.5 pb-1">
                              <p className="text-[10px] font-medium text-gray-600 truncate" title={preview.name}>{preview.name}</p>
                              <p className="text-[10px] text-gray-400">{(preview.size / 1024 / 1024).toFixed(2)}MB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-sky-700 leading-relaxed">
                    Sau khi upload sẽ tạo progress log mới và trạng thái đơn hàng chuyển thành <strong>Đang vận chuyển</strong>.
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
                <button
                  onClick={() => setDeliveryUploadDialogOpen(false)}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUploadDeliveryProgressImage}
                  disabled={selectedFiles.length === 0 || !description.trim() || uploading}
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed shadow"
                >
                  {uploading && <CircularProgress size={16} color="inherit" />}
                  {uploading ? 'Đang xử lý...' : 'Bắt đầu vận chuyển'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Tailwind Modal: Hoàn thành sản xuất */}
        {productUploadDialogOpen && (
          <div className="fixed inset-0 z-50 flex justify-center p-4 sm:p-6 items-start md:items-center pt-24 md:pt-6">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !uploading && setProductUploadDialogOpen(false)}
            />
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircleIcon fontSize="small" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">Hoàn thành sản xuất</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Upload ảnh sản phẩm & mô tả tiến độ</p>
                </div>
                <button
                  onClick={() => !uploading && setProductUploadDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition inline-flex p-1 rounded-md hover:bg-gray-100"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
              {/* Body */}
              <div className="px-5 pb-4 pt-3 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-500">Mã đơn</span>
                      <span className="text-gray-800 text-sm font-semibold">{selectedOrder?.orderCode || selectedOrder?.id}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-500">Khách hàng</span>
                      <span className="text-gray-700 text-sm line-clamp-2">{selectedOrder?.users?.fullName || 'N/A'}</span>
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Mô tả tiến độ</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả về sản phẩm hoàn thành..."
                      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    />
                  </div>
                  {/* Upload Zone */}
                  <div>
                    <label className="block mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Ảnh sản phẩm</label>
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition bg-gray-50/60 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/40">
                        <div className="flex flex-col items-center text-center gap-1">
                          <CloudUploadIcon className="text-emerald-500" fontSize="small" />
                          <span className="text-xs font-medium text-gray-700">Chọn ảnh sản phẩm hoàn thành</span>
                          <span className="text-[10px] text-gray-400">Có thể chọn nhiều ảnh (tối đa 5MB mỗi ảnh)</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={handleMultipleFileSelect}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    {selectedFiles.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">Đã chọn {selectedFiles.length} file</p>
                    )}
                  </div>
                  {/* Previews */}
                  {filePreviews.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Xem trước</p>
                        <span className="text-[10px] text-gray-400">{filePreviews.length} ảnh</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filePreviews.map((preview, index) => (
                          <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50 border-gray-200">
                            <img src={preview.preview} alt={preview.name} className="h-32 w-full object-contain p-1 bg-white" />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                              <CancelIcon fontSize="inherit" className="!text-xs" />
                            </button>
                            <div className="px-1.5 pb-1">
                              <p className="text-[10px] font-medium text-gray-600 truncate" title={preview.name}>{preview.name}</p>
                              <p className="text-[10px] text-gray-400">{(preview.size / 1024 / 1024).toFixed(2)}MB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700 leading-relaxed">
                    Sau khi upload sẽ tạo progress log mới và trạng thái đơn hàng chuyển thành <strong>Hoàn thành sản xuất</strong>.
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
                <button
                  onClick={() => setProductUploadDialogOpen(false)}
                  disabled={uploading}
                  className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUploadProductionCompletedImage}
                  disabled={selectedFiles.length === 0 || !description.trim() || uploading}
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed shadow"
                >
                  {uploading && <CircularProgress size={16} color="inherit" />}
                  {uploading ? 'Đang xử lý...' : 'Hoàn thành sản xuất'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Tailwind Modal: Bắt đầu thi công */}
        {uploadDialogOpen && (
          <div className="fixed inset-0 z-50 flex justify-center p-4 sm:p-6 items-start md:items-center pt-24 md:pt-6">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !uploading && setUploadDialogOpen(false)}
            />
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <CloudUploadIcon fontSize="small" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">Bắt đầu thi công</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Upload ảnh thiết kế & mô tả tiến độ</p>
                </div>
                <button
                  onClick={() => !uploading && setUploadDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition inline-flex p-1 rounded-md hover:bg-gray-100"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
              {/* Body */}
              <div className="px-5 pb-4 pt-3 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-500">Mã đơn</span>
                      <span className="text-gray-800 text-sm font-semibold">{selectedOrder?.orderCode || selectedOrder?.id}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-500">Khách hàng</span>
                      <span className="text-gray-700 text-sm line-clamp-2">{selectedOrder?.users?.fullName || 'N/A'}</span>
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Mô tả tiến độ</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả về tiến độ công việc..."
                      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                    />
                  </div>
                  {/* Upload Zone */}
                  <div>
                    <label className="block mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Ảnh thiết kế</label>
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition bg-gray-50/60 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40">
                        <div className="flex flex-col items-center text-center gap-1">
                          <CloudUploadIcon className="text-indigo-500" fontSize="small" />
                          <span className="text-xs font-medium text-gray-700">Chọn ảnh thiết kế</span>
                          <span className="text-[10px] text-gray-400">Có thể chọn nhiều ảnh (tối đa 5MB mỗi ảnh)</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={handleMultipleFileSelect}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    {selectedFiles.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">Đã chọn {selectedFiles.length} file</p>
                    )}
                  </div>
                  {/* Previews */}
                  {filePreviews.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Xem trước</p>
                        <span className="text-[10px] text-gray-400">{filePreviews.length} ảnh</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filePreviews.map((preview, index) => (
                          <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50 border-gray-200">
                            <img src={preview.preview} alt={preview.name} className="h-32 w-full object-contain p-1 bg-white" />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                              <CancelIcon fontSize="inherit" className="!text-xs" />
                            </button>
                            <div className="px-1.5 pb-1">
                              <p className="text-[10px] font-medium text-gray-600 truncate" title={preview.name}>{preview.name}</p>
                              <p className="text-[10px] text-gray-400">{(preview.size / 1024 / 1024).toFixed(2)}MB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-sky-600 leading-relaxed">
                    Sau khi upload sẽ tạo progress log mới và trạng thái đơn hàng chuyển thành <strong>Đang sản xuất</strong>.
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
                <button
                  onClick={() => setUploadDialogOpen(false)}
                  disabled={uploading}
                  className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUploadDraftImage}
                  disabled={selectedFiles.length === 0 || !description.trim() || uploading}
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow"
                >
                  {uploading && <CircularProgress size={16} color="inherit" />}
                  {uploading ? 'Đang xử lý...' : 'Bắt đầu sản xuất'}
                </button>
              </div>
            </div>
          </div>
        )}
  </div>

      {/* Tailwind Modal: Xác nhận thanh toán tiền mặt */}
      {cashPaymentDialogOpen && (
        <div className="fixed inset-0 z-50 flex justify-center p-4 sm:p-6 items-start md:items-center pt-24 md:pt-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !confirmingPayment && setCashPaymentDialogOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <AttachMoneyIcon fontSize="small" />
              </div>
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Xác nhận thanh toán tiền mặt</h2>
                <p className="text-xs text-gray-500 mt-0.5">Kiểm tra thông tin trước khi xác nhận</p>
              </div>
              <button
                onClick={() => !confirmingPayment && setCashPaymentDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition inline-flex p-1 rounded-md hover:bg-gray-100"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
            {/* Body */}
            <div className="px-5 pb-4 pt-3 overflow-y-auto custom-scrollbar">
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Đơn hàng</span>
                    <span className="font-semibold text-gray-800">{selectedOrder?.orderCode || selectedOrder?.id}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Khách hàng</span>
                    <span className="text-gray-700">{selectedOrder?.users?.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Số tiền còn lại</span>
                    <span className="text-gray-700">{selectedOrder?.remainingConstructionAmount?.toLocaleString('vi-VN') || '0'} VNĐ</span>
                  </div>
                </div>
                {/* Amount highlight */}
                <div className="rounded-lg bg-indigo-600 text-white px-4 py-3 text-center shadow">
                  <p className="text-xs font-medium tracking-wide opacity-80">Số tiền cần thanh toán</p>
                  <p className="text-lg font-bold mt-1">{selectedOrder?.remainingConstructionAmount?.toLocaleString('vi-VN') || '0'} VNĐ</p>
                </div>
                {/* Warning */}
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
                  <p className="font-semibold mb-1">Xác nhận thanh toán tiền mặt</p>
                  <p>Bạn đang xác nhận rằng khách hàng đã thanh toán toàn bộ số tiền còn lại của phần thi công bằng tiền mặt. Hành động này <strong>không thể hoàn tác</strong>.</p>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setCashPaymentDialogOpen(false)}
                disabled={confirmingPayment}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmCashPayment}
                disabled={confirmingPayment}
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow"
              >
                {confirmingPayment && <CircularProgress size={16} color="inherit" />}
                {confirmingPayment ? 'Đang xác nhận...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog chi tiết đơn hàng */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
  <DialogTitle>Chi tiết đơn hàng {selectedOrder?.orderCode || selectedOrder?.id}</DialogTitle>
        <DialogContent>
          {selectedOrder && (() => {
            const detail = orderDetails || selectedOrder;
            const customerName = detail?.user?.fullName || detail?.user?.name || selectedOrder?.users?.fullName || selectedOrder?.user?.name || 'N/A';
            const remainConstruction = detail?.remainingConstructionAmount ?? selectedOrder?.remainingConstructionAmount ?? 0;
            const remainOrder = detail?.totalOrderRemainingAmount ?? selectedOrder?.totalOrderRemainingAmount ?? 0;
            const addressValue = detail.address || selectedOrder.address || detail.user?.address || selectedOrder.users?.address || 'Chưa có';
            const orderType = detail.orderType || selectedOrder.orderType || 'N/A';
            const note = detail.note || selectedOrder.note || '';
            const estimatedDeliveryDate = detail.estimatedDeliveryDate || selectedOrder.estimatedDeliveryDate || null;
            const status = detail.status || selectedOrder.status;
            return (
              <div className="space-y-6">
                {/* Basic Info Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm shadow-gray-100 transition hover:shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-600 flex items-center gap-2">Thông tin cơ bản
                      {status && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700 normal-case">{status}</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600">{detail.orderCode || selectedOrder.orderCode}</span>
                      {orderType && <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">{orderType}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">Khách hàng</span>
                      <span className="font-medium text-gray-800">{customerName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">Địa chỉ</span>
                      <span className="text-gray-700 line-clamp-2">{addressValue}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">Ngày giao dự kiến</span>
                      <span className="text-gray-700">{estimatedDeliveryDate ? new Date(estimatedDeliveryDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-500">Ngày tạo</span>
                      <span className="text-gray-700">{detail.createdAt ? new Date(detail.createdAt).toLocaleString('vi-VN') : (selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : 'N/A')}</span>
                    </div>
                    {detail.updatedAt && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500">Cập nhật</span>
                        <span className="text-gray-700">{new Date(detail.updatedAt).toLocaleString('vi-VN')}</span>
                      </div>
                    )}
                    {note && (
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <span className="text-xs font-medium text-gray-500">Ghi chú</span>
                        <span className="text-gray-700 whitespace-pre-line">{note}</span>
                      </div>
                    )}
                    {orderDetailsStatus === 'loading' && (
                      <div className="sm:col-span-2 text-xs text-gray-500">Đang tải chi tiết...</div>
                    )}
                    {orderDetailsError && (
                      <div className="sm:col-span-2 text-xs text-red-600">{orderDetailsError}</div>
                    )}
                  </div>
                </div>

                {/* Financial Info Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm shadow-gray-100 transition hover:shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-600">Thông tin tài chính</h3>
                    {remainOrder > 0 ? (
                      <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">Còn nợ</span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Đã thanh toán</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div className="flex justify-between sm:block">
                      <p className="text-gray-500 mb-0.5 sm:mb-1 text-xs font-medium">Tổng thi công</p>
                      <p className="font-medium text-gray-800">{(detail.totalConstructionAmount || selectedOrder.totalConstructionAmount || 0).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    <div className="flex justify-between sm:block">
                      <p className="text-gray-500 mb-0.5 sm:mb-1 text-xs font-medium">Đặt cọc thi công</p>
                      <p className="text-gray-700">{(detail.depositConstructionAmount || selectedOrder.depositConstructionAmount || 0).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    <div className="flex justify-between sm:block">
                      <p className="text-gray-500 mb-0.5 sm:mb-1 text-xs font-medium">Còn lại thi công</p>
                      <p className={(remainConstruction>0? 'text-red-600':'text-emerald-600') + ' font-semibold'}>{(remainConstruction).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    <div className="flex justify-between sm:block">
                      <p className="text-gray-500 mb-0.5 sm:mb-1 text-xs font-medium">Tổng đơn hàng</p>
                      <p className="font-medium text-gray-800">{(detail.totalOrderAmount || selectedOrder.totalOrderAmount || 0).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    <div className="flex justify-between sm:block">
                      <p className="text-gray-500 mb-0.5 sm:mb-1 text-xs font-medium">Đặt cọc đơn hàng</p>
                      <p className="text-gray-700">{(detail.totalOrderDepositAmount || selectedOrder.totalOrderDepositAmount || 0).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    <div className="flex justify-between sm:block">
                      <p className="text-gray-500 mb-0.5 sm:mb-1 text-xs font-medium">Còn lại đơn hàng</p>
                      <p className={(remainOrder>0? 'text-red-600':'text-emerald-600') + ' font-semibold'}>{(remainOrder).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    {detail.contractors?.name && (
                      <div className="flex justify-between sm:block sm:col-span-2">
                        <p className="text-gray-500 mb-0.5 sm:mb-1 text-xs font-medium">Nhà thầu</p>
                        <p className="text-gray-700 font-medium">{detail.contractors.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Đóng</Button>
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
  </div>
  );
};

export default OrderManager;
