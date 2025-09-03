import React, { useState, useEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Snackbar,
  Tabs,
  Tab,
  Badge,
  Autocomplete,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Divider,
  Container,
  Tooltip,
  Fade,
  Zoom,
  TextField,
  Pagination,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Brush as BrushIcon,
  SmartToy as SmartToyIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  LocalShipping as ShippingIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  MonetizationOn as MoneyIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as OrderIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  fetchAllDesignRequests,
  selectAllDesignRequests,
  selectStatus,
  selectError,
  assignDesignerToRequest,
  updateRequestStatus,
  CUSTOM_DESIGN_STATUS_MAP,
  searchDesignRequestsSale,
} from "../../store/features/customeDesign/customerDesignSlice";

import { getUsersByRoleApi } from "../../api/userService";
import { createProposal } from "../../store/features/price/priceSlice";
import {
  getPriceProposals,
  updatePriceProposalPricing,
} from "../../api/priceService";
import orderService from "../../api/orderService";
import {
  uploadOrderContractApi,
  uploadRevisedContractApi,
  getOrderContractApi,
} from "../../api/contractService";
import {
  contractResignOrder,
  contractSignedOrder,
  fetchOrders,
  fetchCustomDesignOrders,
  ORDER_STATUS_MAP,
  selectOrderError,
  selectOrders,
  selectOrdersByType,
  selectOrderStatus,
  selectCustomDesignOrders,
  updateOrderEstimatedDeliveryDate,
  searchCustomDesignOrders,
} from "../../store/features/order/orderSlice";

import { fetchAllContractors } from "../../store/features/contractor/contractorSlice";
import { castPaidThunk } from "../../store/features/payment/paymentSlice"; // sử dụng cho xác nhận tiền mặt đặt cọc thiết kế

// Thay thế import cũ bằng import mới
// import ContractUploadForm from "../../components/ContractUploadForm";
// import S3Avatar from "../../components/S3Avatar";
// import UploadRevisedContract from "../../components/UploadRevisedContract";
import S3Avatar from "../../components/S3Avatar";
import { useMemo } from 'react';
import { getPresignedUrl } from "../../api/s3Service";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi";

// Component ContractorListDialog
const ContractorListDialog = ({
  open,
  onClose,
  contractors,
  order,
  generateOrderCode,
  onReportDelivery,
}) => {
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Chỉ lấy nhà thầu khả dụng
  const availableContractors = useMemo(
    () => (contractors || []).filter(c => c?.isAvailable),
    [contractors]
  );

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedContractorId(null);
      setEstimatedDeliveryDate(null);
    }
  }, [open]);

  // Set Vietnamese locale for dayjs
  useEffect(() => {
    dayjs.locale("vi");
  }, []);

  const handleSubmit = async () => {
    if (!selectedContractorId || !estimatedDeliveryDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Format the date as LocalDateTime in ISO format
      // Set time to 09:00:00 for delivery date
      const deliveryDateTime = estimatedDeliveryDate
        .hour(9)
        .minute(0)
        .second(0);
      const formattedDateTime = deliveryDateTime.format("YYYY-MM-DDTHH:mm:ss");

      console.log("Formatted delivery date:", formattedDateTime);
      await onReportDelivery(order.id, formattedDateTime, selectedContractorId);
      onClose();
    } catch (error) {
      console.error("Error reporting delivery date:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedContractorId && estimatedDeliveryDate;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShippingIcon color="info" />
            <Typography variant="h6">
              Báo ngày giao dự kiến - Đơn hàng{" "}
              {order ? order.orderCode || order.id : ""}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
    {availableContractors && availableContractors.length > 0 ? (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom>
      Chọn đơn vị thi công và báo ngày giao dự kiến cho đơn hàng {order ? order.orderCode || order.id : ""} ({availableContractors.length} đơn vị khả dụng)
                </Typography>

                {/* Date Picker */}
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    gutterBottom
                  >
                    Ngày giao dự kiến
                  </Typography>
                  <DatePicker
                    label="Chọn ngày giao hàng"
                    value={estimatedDeliveryDate}
                    onChange={(newValue) => setEstimatedDeliveryDate(newValue)}
                    minDate={dayjs().add(1, "day")}
                    format="DD/MM/YYYY"
                    sx={{ width: "100%" }}
                    slotProps={{
                      textField: {
                        helperText:
                          "Vui lòng chọn ngày giao hàng dự kiến (định dạng: Ngày/Tháng/Năm)",
                      },
                    }}
                  />
                </Box>

                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  gutterBottom
                  sx={{ mt: 3 }}
                >
                  Chọn đơn vị thi công thực hiện
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {availableContractors.map((contractor) => (
                    <Grid item xs={12} md={6} key={contractor.id}>
                      <Card
                        elevation={
                          selectedContractorId === contractor.id ? 4 : 2
                        }
                        sx={{
                          borderRadius: 3,
                          border: "2px solid",
                          borderColor:
                            selectedContractorId === contractor.id
                              ? "info.main"
                              : "divider",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            boxShadow: 4,
                            transform: "translateY(-2px)",
                            borderColor:
                              selectedContractorId === contractor.id
                                ? "info.main"
                                : "warning.main",
                          },
                        }}
                        onClick={() => setSelectedContractorId(contractor.id)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          {/* Header */}
                          <Box
                            sx={{
                              background:
                                selectedContractorId === contractor.id
                                  ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
                                  : "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
                              borderRadius: 2,
                              p: 2,
                              mb: 2,
                              position: "relative",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flex: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: contractor.isInternal
                                    ? "success.main"
                                    : "info.main",
                                }}
                              />
                              <Typography
                                variant="h6"
                                color="text.primary"
                                fontWeight="bold"
                              >
                                {contractor.name}
                              </Typography>
                              <Chip
                                label={
                                  contractor.isInternal ? "Nội bộ" : "Bên ngoài"
                                }
                                size="small"
                                color={
                                  contractor.isInternal ? "success" : "info"
                                }
                                sx={{ ml: "auto", fontWeight: "medium" }}
                              />
                            </Box>
                          </Box>

                          {/* Thông tin chi tiết */}
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Box
                                sx={{
                                  p: 2,
                                  bgcolor: "grey.50",
                                  borderRadius: 2,
                                  mb: 2,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Địa chỉ
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {contractor.address}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Box
                                sx={{
                                  p: 2,
                                  bgcolor: "grey.50",
                                  borderRadius: 2,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Số điện thoại
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight="medium"
                                  color="primary.main"
                                >
                                  {contractor.phone}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Box
                                sx={{
                                  p: 2,
                                  bgcolor: "grey.50",
                                  borderRadius: 2,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Email
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight="medium"
                                  color="primary.main"
                                >
                                  {contractor.email}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Trạng thái availability */}
                          <Box sx={{ mt: 2, textAlign: "center" }}>
                            <Chip
                              label={
                                contractor.isAvailable
                                  ? "Có sẵn"
                                  : "Không có sẵn"
                              }
                              color={
                                contractor.isAvailable ? "success" : "error"
                              }
                              variant="filled"
                              sx={{ fontWeight: "medium" }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
    ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <ShippingIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
      Chưa có đơn vị thi công khả dụng để báo ngày giao
                </Typography>
                <Typography variant="body2" color="text.secondary">
      Hiện tại tất cả đơn vị thi công đều không khả dụng. Vui lòng thử lại sau.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isFormValid || isSubmitting}
            startIcon={
              isSubmitting ? <CircularProgress size={16} /> : <ShippingIcon />
            }
          >
            {isSubmitting ? "Đang xử lý..." : "Báo ngày giao dự kiến"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

const CustomerRequests = () => {
  const dispatch = useDispatch();
  const allDesignRequests = useSelector(selectAllDesignRequests);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Thêm state cho designer
  const [designers, setDesigners] = useState([]);
  const [selectedDesigner, setSelectedDesigner] = useState("");
  const [loadingDesigners, setLoadingDesigners] = useState(false);
  const [assigningDesigner, setAssigningDesigner] = useState(false);
  const [assignmentError, setAssignmentError] = useState(null);
  const [rejectingRequest, setRejectingRequest] = useState(false);
  const [currentTab, setCurrentTab] = useState(0); // 0: Design Requests, 1: Custom Design Orders
  const [orderLoading, setOrderLoading] = useState(false);

  // Pagination states
  const [designRequestsPage, setDesignRequestsPage] = useState(1);
  const [designRequestsTotalPages, setDesignRequestsTotalPages] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [contractId, setContractId] = useState(null);
  const [fetchingContract, setFetchingContract] = useState(false);

  // State quản lý dropdown cho thông tin tài chính và chi tiết đơn hàng
  const [financialInfoExpanded, setFinancialInfoExpanded] = useState(true);
  const [orderDetailsExpanded, setOrderDetailsExpanded] = useState(false);
  const [orderInfoExpanded, setOrderInfoExpanded] = useState(true);
  const [customerInfoExpanded, setCustomerInfoExpanded] = useState(true);

  // Sử dụng customDesignOrders từ Redux store cho tab custom design
  const allOrders = useSelector(selectOrders);
  const customDesignOrders = useSelector(selectCustomDesignOrders);
  const ordersPagination = useSelector((state) => state.order.pagination);

  // Khai báo biến orders sớm để tránh lỗi "Cannot access before initialization"
  const orders = currentTab === 1 ? customDesignOrders : allOrders;

  // Calculate pagination for filtered orders whenever data changes
  useEffect(() => {
    if (currentTab === 1) {
      // Sử dụng pagination từ server thay vì tính toán client-side
      const totalPages = ordersPagination.totalPages || 1;
      setOrdersTotalPages(totalPages);
    }
  }, [currentTab, ordersPagination.totalPages]);

  // Debug: Log order breakdown and pagination (Server-side)
  useEffect(() => {
    if (currentTab === 1) {
      const orderTypeCount = orders.reduce((acc, order) => {
        acc[order.orderType] = (acc[order.orderType] || 0) + 1;
        return acc;
      }, {});

      console.log("📊 Order breakdown (Server-side pagination):");
      console.log("  - Total custom design orders:", customDesignOrders.length);
      console.log("  - Current page orders:", orders.length);
      console.log("  - Order type breakdown:", orderTypeCount);
      console.log("📄 Pagination info:");
      console.log("  - Current page:", ordersPage);
      console.log("  - Total pages:", ordersTotalPages);
      console.log("  - Server pagination:", ordersPagination);
    }
  }, [
    currentTab,
    orders,
    ordersPage,
    ordersTotalPages,
    customDesignOrders.length,
    ordersPagination,
  ]);

  // Reset page if current page exceeds total pages
  useEffect(() => {
    if (ordersPage > ordersTotalPages && ordersTotalPages > 0) {
      console.log("⚠️ Current page exceeds total pages, resetting to page 1");
      setOrdersPage(1);
    }
  }, [ordersPage, ordersTotalPages]);

  // Khởi tạo dữ liệu ban đầu khi component mount
  useEffect(() => {
    try {
      // Fetch initial data based on current tab
      if (currentTab === 0) {
        dispatch(
          fetchAllDesignRequests({
            status: selectedStatus,
            page: designRequestsPage,
            size: 10,
          })
        ).catch((error) => {
          console.error("Error in initial fetch:", error);
        });
      } else if (currentTab === 1) {
        dispatch(
          fetchCustomDesignOrders({
            orderStatus:
              selectedOrderStatus === "" ? null : selectedOrderStatus,
            page: ordersPage,
            size: 10,
          })
        ).catch((error) => {
          console.error("Error in initial fetch:", error);
        });
      }
    } catch (error) {
      console.error("Error in initial useEffect:", error);
    }
  }, []); // Chỉ chạy một lần khi component mount

  const orderStatus = useSelector(selectOrderStatus);
  const orderError = useSelector(selectOrderError);

  // Lấy danh sách contractors từ Redux store
  const { contractors } = useSelector((state) => state.contractor);
  const [contractViewLoading, setContractViewLoading] = useState(false);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(null);

  const [updatingDeliveryDate, setUpdatingDeliveryDate] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [selectedOrderStatus, setSelectedOrderStatus] = useState(""); // Mặc định là tất cả trạng thái
  const [searchQuery, setSearchQuery] = useState(""); // State cho search
  const [searchDesignRequests, setSearchDesignRequests] = useState(""); // State cho search design requests
  const [activeSearchKeyword, setActiveSearchKeyword] = useState(""); // Keyword đang được search
  const [searchKeyword, setSearchKeyword] = useState(""); // State cho keyword tạm thời trước khi search
  const [isTabSwitching, setIsTabSwitching] = useState(false); // State để track tab switching

  // State cho search orders
  const [activeOrderSearchKeyword, setActiveOrderSearchKeyword] = useState(""); // Keyword đang được search cho orders
  const [orderSearchKeyword, setOrderSearchKeyword] = useState(""); // State cho keyword tạm thời trước khi search orders
  const [orderSearchLoading, setOrderSearchLoading] = useState(false); // Loading state cho order search
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", // 'success', 'error', 'info', 'warning'
  });
  const [openContractUpload, setOpenContractUpload] = useState(false);
  const [openRevisedContractUpload, setOpenRevisedContractUpload] =
    useState(false);
  // State cho form báo giá
  const [priceForm, setPriceForm] = useState({
    totalPrice: "",
    depositAmount: "",
  });
  const [creatingProposal, setCreatingProposal] = useState(false);

  // ===== NEW: Cash design deposit confirmation dialog state =====
  const [cashDesignDepositDialog, setCashDesignDepositDialog] = useState({
    open: false,
    order: null,
  });
  const [confirmingCashDesignDeposit, setConfirmingCashDesignDeposit] =
    useState(false);

  const openCashDesignDepositDialog = (order) => {
    setCashDesignDepositDialog({ open: true, order });
  };
  const closeCashDesignDepositDialog = () => {
    setCashDesignDepositDialog({ open: false, order: null });
  };
  const handleConfirmCashDesignDeposit = async () => {
    if (!cashDesignDepositDialog.order) return;
    setConfirmingCashDesignDeposit(true);
    try {
      await dispatch(
        castPaidThunk({
          orderId: cashDesignDepositDialog.order.id,
          paymentType: "DEPOSIT_DESIGN",
        })
      ).unwrap();
      setNotification({
        open: true,
        message: "Đã xác nhận đặt cọc thiết kế (tiền mặt) thành công!",
        severity: "success",
      });
      closeCashDesignDepositDialog();
      await refreshOrdersData?.(); // nếu hàm tồn tại
    } catch (e) {
      setNotification({
        open: true,
        message: "Lỗi xác nhận đặt cọc thiết kế: " + (e?.message || e),
        severity: "error",
      });
    } finally {
      setConfirmingCashDesignDeposit(false);
    }
  };

  // ===== NEW: Cash remaining design payment confirmation dialog state =====
  const [cashDesignRemainingDialog, setCashDesignRemainingDialog] = useState({
    open: false,
    order: null,
  });
  const [confirmingCashDesignRemaining, setConfirmingCashDesignRemaining] =
    useState(false);

  const openCashDesignRemainingDialog = (order) => {
    setCashDesignRemainingDialog({ open: true, order });
  };
  const closeCashDesignRemainingDialog = () => {
    setCashDesignRemainingDialog({ open: false, order: null });
  };
  const handleConfirmCashDesignRemaining = async () => {
    if (!cashDesignRemainingDialog.order) return;
    setConfirmingCashDesignRemaining(true);
    try {
      await dispatch(
        castPaidThunk({
          orderId: cashDesignRemainingDialog.order.id,
          paymentType: "REMAINING_DESIGN",
        })
      ).unwrap();
      setNotification({
        open: true,
        message: "Đã xác nhận thanh toán đủ thiết kế (tiền mặt) thành công!",
        severity: "success",
      });
      closeCashDesignRemainingDialog();
      await refreshOrdersData?.();
    } catch (e) {
      setNotification({
        open: true,
        message: "Lỗi xác nhận thanh toán đủ thiết kế: " + (e?.message || e),
        severity: "error",
      });
    } finally {
      setConfirmingCashDesignRemaining(false);
    }
  };

  // ===== NEW: Cash construction deposit confirmation dialog state =====
  const [cashConstructionDepositDialog, setCashConstructionDepositDialog] =
    useState({ open: false, order: null });
  const [
    confirmingCashConstructionDeposit,
    setConfirmingCashConstructionDeposit,
  ] = useState(false);

  const openCashConstructionDepositDialog = (order) => {
    setCashConstructionDepositDialog({ open: true, order });
  };
  const closeCashConstructionDepositDialog = () => {
    setCashConstructionDepositDialog({ open: false, order: null });
  };
  const handleConfirmCashConstructionDeposit = async () => {
    if (!cashConstructionDepositDialog.order) return;
    setConfirmingCashConstructionDeposit(true);
    try {
      await dispatch(
        castPaidThunk({
          orderId: cashConstructionDepositDialog.order.id,
          paymentType: "DEPOSIT_CONSTRUCTION",
        })
      ).unwrap();
      setNotification({
        open: true,
        message: "Đã xác nhận đặt cọc thi công (tiền mặt) thành công!",
        severity: "success",
      });
      closeCashConstructionDepositDialog();
      await refreshOrdersData?.();
    } catch (e) {
      setNotification({
        open: true,
        message: "Lỗi xác nhận đặt cọc thi công: " + (e?.message || e),
        severity: "error",
      });
    } finally {
      setConfirmingCashConstructionDeposit(false);
    }
  };

  const [selectedStatus, setSelectedStatus] = useState(""); // Mặc định là tất cả trạng thái

  /*
   * CÁCH SỬ DỤNG CÁC FUNCTION REFRESH:
   *
   * 1. refreshDesignRequestsData() - Refresh data cho tab "Yêu cầu thiết kế"
   *    - Sử dụng sau khi: assign designer, set pending contract, reject request, create proposal, update proposal
   *
   * 2. refreshOrdersData() - Refresh data cho tab "Đơn hàng thiết kế tùy chỉnh"
   *    - Sử dụng sau khi: update order status, report delivery, contract operations
   *    - Sử dụng API mới: /api/orders/custom-design
   *
   * 3. refreshAllData() - Refresh tất cả data (thông minh theo tab hiện tại)
   *    - Sử dụng khi không chắc chắn cần refresh gì
   *
   * LƯU Ý: Không cần reload trang nữa, chỉ cần gọi các function này!
   */

  // ===== CÁC FUNCTION REFRESH =====
  const refreshDesignRequestsData = async () => {
    if (currentTab === 0) {
      // Sử dụng search API nếu có activeSearchKeyword, ngược lại sử dụng fetchAllDesignRequests
      if (activeSearchKeyword.trim()) {
        await dispatch(
          searchDesignRequestsSale({
            keyword: activeSearchKeyword.trim(),
            page: designRequestsPage,
            size: 10,
          })
        ).then((action) => {
          if (action.payload && action.payload.totalPages) {
            setDesignRequestsTotalPages(action.payload.totalPages);
          }
        });
      } else {
        await dispatch(
          fetchAllDesignRequests({
            status: selectedStatus,
            page: designRequestsPage,
            size: 10,
          })
        ).then((action) => {
          if (action.payload && action.payload.totalPages) {
            setDesignRequestsTotalPages(action.payload.totalPages);
          }
        });
      }
    }
  };

  const refreshOrdersData = async () => {
    if (currentTab === 1) {
      // Sử dụng search API nếu có activeOrderSearchKeyword, ngược lại sử dụng fetchCustomDesignOrders
      if (activeOrderSearchKeyword.trim()) {
        await dispatch(
          searchCustomDesignOrders({
            query: activeOrderSearchKeyword.trim(),
            page: ordersPage,
            size: 10,
          })
        ).then((action) => {
          if (
            action.payload &&
            action.payload.pagination &&
            action.payload.pagination.totalPages
          ) {
            setOrdersTotalPages(action.payload.pagination.totalPages);
          }
        });
      } else {
        await dispatch(
          fetchCustomDesignOrders({
            orderStatus:
              selectedOrderStatus === "" ? null : selectedOrderStatus,
            page: ordersPage,
            size: 10,
          })
        );
      }
    }
  };

  const refreshAllData = async () => {
    if (currentTab === 0) {
      await refreshDesignRequestsData();
    } else if (currentTab === 1) {
      await refreshOrdersData();
    }
  };
  // ===== KẾT THÚC CÁC FUNCTION REFRESH =====

  // Apply filters for orders (chỉ áp dụng cho tab không phải custom design)
  let filteredOrders = allOrders.filter((order) => {
    if (order.orderType === "AI_DESIGN") return false;

    // Apply search filter if searchQuery exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const orderCode = (order.orderCode || order.id || "").toLowerCase();
      const companyName = (
        order.customerDetail?.companyName || ""
      ).toLowerCase();
      const customerName = (order.customerDetail?.fullName || "").toLowerCase();

      return (
        orderCode.includes(query) ||
        companyName.includes(query) ||
        customerName.includes(query)
      );
    }

    return true;
  });

  // Apply filters for custom design orders
  let filteredCustomDesignOrders = customDesignOrders;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredCustomDesignOrders = customDesignOrders.filter((order) => {
      const orderCode = (order.orderCode || order.id || "").toLowerCase();
      const customerName = (order.users?.fullName || "").toLowerCase();
      const address = (order.address || "").toLowerCase();

      return (
        orderCode.includes(query) ||
        customerName.includes(query) ||
        address.includes(query)
      );
    });
  }

  // Sử dụng customDesignOrders cho tab custom design, allOrders cho tab khác
  // Biến orders đã được khai báo ở trên để tránh lỗi "Cannot access before initialization"

  const [priceProposals, setPriceProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [contractDialog, setContractDialog] = useState({
    open: false,
    contract: null,
    orderId: null,
    orderCode: null, // Lưu orderCode để hiển thị trong dialog
  });
  const [updateDialog, setUpdateDialog] = useState({
    open: false,
    proposalId: null,
  });
  const [updateForm, setUpdateForm] = useState({
    totalPrice: "",
    depositAmount: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // State cho flow báo ngày giao dự kiến
  const [contractorDialog, setContractorDialog] = useState({
    open: false,
    order: null,
  });
  // Fetch design requests when component mounts or tab changes to 0
  useEffect(() => {
    // Không fetch khi đang switching tab
    if (isTabSwitching) return;

    if (currentTab === 0 && !activeSearchKeyword.trim()) {
      // Chỉ fetch khi không có active search keyword
      const timeoutId = setTimeout(() => {
        dispatch(
          fetchAllDesignRequests({
            status: selectedStatus,
            page: designRequestsPage,
            size: 10,
          })
        )
          .then((action) => {
            if (action.payload && action.payload.totalPages) {
              setDesignRequestsTotalPages(action.payload.totalPages);
            }
          })
          .catch((error) => {
            console.error("Error fetching design requests:", error);
            setNotification({
              open: true,
              message:
                "Lỗi khi tải yêu cầu thiết kế: " +
                (error.message || "Không thể tải dữ liệu"),
              severity: "error",
            });
          });
      }, 100); // 100ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [
    currentTab,
    dispatch,
    selectedStatus,
    designRequestsPage,
    activeSearchKeyword,
    isTabSwitching,
  ]);

  useEffect(() => {
    // Không fetch khi đang switching tab
    if (isTabSwitching) return;

    if (currentTab === 1) {
      const timeoutId = setTimeout(() => {
        const fetchTimestamp = Date.now();
        console.log(
          `🚀 [${fetchTimestamp}] Tab 1 active - fetching CUSTOM DESIGN orders:`,
          {
            status: selectedOrderStatus,
            page: ordersPage,
            size: 10,
          }
        );

        // Sử dụng API mới /api/orders/custom-design
        dispatch(
          fetchCustomDesignOrders({
            orderStatus:
              selectedOrderStatus === "" ? null : selectedOrderStatus,
            page: ordersPage,
            size: 10,
          })
        )
          .then((action) => {
            console.log(
              `✅ [${fetchTimestamp}] Custom Design Orders API Response:`,
              action.payload
            );
            if (action.payload && action.payload.orders) {
              // Sử dụng pagination từ server
              const totalOrders = action.payload.orders || [];
              const totalPages = action.payload.pagination?.totalPages || 1;

              setOrdersTotalPages(totalPages);
              console.log(
                `📊 [${fetchTimestamp}] Custom Design Orders:`,
                totalOrders.length
              );
              console.log(`📊 [${fetchTimestamp}] Server Pages:`, totalPages);
            }
          })
          .catch((error) => {
            console.error("Error fetching custom design orders:", error);
            setNotification({
              open: true,
              message:
                "Lỗi khi tải đơn hàng thiết kế tùy chỉnh: " +
                (error.message || "Không thể tải dữ liệu"),
              severity: "error",
            });
          });
      }, 100); // 100ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [currentTab, selectedOrderStatus, ordersPage, dispatch, isTabSwitching]);

  // Pagination handlers
  const handleDesignRequestsPageChange = (event, newPage) => {
    setDesignRequestsPage(newPage);

    // Trigger immediate fetch for pagination
    if (activeSearchKeyword.trim()) {
      dispatch(
        searchDesignRequestsSale({
          keyword: activeSearchKeyword.trim(),
          page: newPage,
          size: 10,
        })
      ).then((action) => {
        if (action.payload && action.payload.totalPages) {
          setDesignRequestsTotalPages(action.payload.totalPages);
        }
      });
    } else {
      dispatch(
        fetchAllDesignRequests({
          status: selectedStatus,
          page: newPage,
          size: 10,
        })
      ).then((action) => {
        if (action.payload && action.payload.totalPages) {
          setDesignRequestsTotalPages(action.payload.totalPages);
        }
      });
    }
  };

  const handleOrdersPageChange = (event, newPage) => {
    setOrdersPage(newPage);
    console.log("🔄 Changing to orders page:", newPage);

    // Trigger immediate fetch for pagination
    if (activeOrderSearchKeyword.trim()) {
      dispatch(
        searchCustomDesignOrders({
          query: activeOrderSearchKeyword.trim(),
          page: newPage,
          size: 10,
        })
      ).then((action) => {
        if (
          action.payload &&
          action.payload.pagination &&
          action.payload.pagination.totalPages
        ) {
          setOrdersTotalPages(action.payload.pagination.totalPages);
        }
      });
    } else {
      dispatch(
        fetchCustomDesignOrders({
          orderStatus: selectedOrderStatus === "" ? null : selectedOrderStatus,
          page: newPage,
          size: 10,
        })
      );
    }
  };

  const handleUpdateEstimatedDeliveryDate = async (orderId, deliveryDate) => {
    if (!deliveryDate) {
      setNotification({
        open: true,
        message: "Vui lòng chọn ngày giao hàng dự kiến",
        severity: "warning",
      });
      return;
    }

    setUpdatingDeliveryDate(true);
    try {
      const isoDate = deliveryDate.toISOString();

      const result = await dispatch(
        updateOrderEstimatedDeliveryDate({
          orderId,
          estimatedDeliveryDate: isoDate,
        })
      );

      if (updateOrderEstimatedDeliveryDate.fulfilled.match(result)) {
        setNotification({
          open: true,
          message: "Cập nhật ngày giao hàng dự kiến thành công!",
          severity: "success",
        });

        // Refresh orders list
        await refreshOrdersData();

        // Close detail dialog
        handleCloseOrderDetails();
      } else {
        setNotification({
          open: true,
          message:
            result.payload || "Không thể cập nhật ngày giao hàng dự kiến",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Lỗi: " + error.message,
        severity: "error",
      });
    } finally {
      setUpdatingDeliveryDate(false);
    }
  };
  const handleContractSigned = async (orderId) => {
    setConfirmDialog({
      open: true,
      title: "Xác nhận hợp đồng đã ký",
      message:
        "Bạn có chắc chắn rằng khách hàng đã ký hợp đồng và muốn xác nhận hợp đồng này?",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const result = await dispatch(contractSignedOrder(orderId));

          if (contractSignedOrder.fulfilled.match(result)) {
            setNotification({
              open: true,
              message: "Đã xác nhận hợp đồng thành công!",
              severity: "success",
            });

            // Refresh danh sách orders
            await refreshOrdersData();

            handleCloseOrderDetails();
          } else {
            setNotification({
              open: true,
              message: result.payload || "Không thể xác nhận hợp đồng",
              severity: "error",
            });
          }
        } catch (error) {
          setNotification({
            open: true,
            message: "Lỗi: " + error.message,
            severity: "error",
          });
        } finally {
          setActionLoading(false);
          handleCloseConfirmDialog();
        }
      },
    });
  };
  const handleViewContract = async (orderId) => {
    setContractViewLoading(true);
    try {
      const response = await getOrderContractApi(orderId);
      if (response.success && response.data) {
        // Tìm order tương ứng để lấy orderCode (vì API hợp đồng không trả về orderCode)
        let foundOrder = null;
        try {
          // Kết hợp cả danh sách customDesignOrders và allOrders để chắc chắn tìm thấy
          const combinedOrders = [
            ...(customDesignOrders || []),
            ...(allOrders || []),
          ];
          foundOrder = combinedOrders.find((o) => o.id === orderId) || null;
        } catch (e) {
          console.warn("Không thể tìm order để lấy orderCode:", e);
        }

        setContractDialog({
          open: true,
          contract: response.data,
          orderId: orderId,
          orderCode: foundOrder?.orderCode || null,
        });
      } else {
        setNotification({
          open: true,
          message: "Không tìm thấy hợp đồng cho đơn hàng này",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      setNotification({
        open: true,
        message: "Lỗi khi tải thông tin hợp đồng: " + error.message,
        severity: "error",
      });
    } finally {
      setContractViewLoading(false);
    }
  };
  const handleCloseContractDialog = () => {
    setContractDialog({
      open: false,
      contract: null,
      orderId: null,
      orderCode: null,
    });
  };
  const handleViewContractFile = async (contractUrl, type) => {
    if (!contractUrl) {
      setNotification({
        open: true,
        message: `Không có file hợp đồng ${
          type === "signed" ? "đã ký" : "gốc"
        }`,
        severity: "warning",
      });
      return;
    }

    // Hiển thị loading
    setContractViewLoading(true);

    try {
      // Lấy key từ contractUrl
      // Giả sử contractUrl có format: "https://domain.com/bucket/path/to/file.pdf"
      // hoặc chỉ là key: "contracts/order-123/contract.pdf"
      let key = contractUrl;

      // Nếu contractUrl là full URL, extract key từ URL
      if (contractUrl.startsWith("http")) {
        const urlParts = contractUrl.split("/");
        // Lấy phần sau domain làm key
        const domainIndex = urlParts.findIndex((part) => part.includes("."));
        if (domainIndex >= 0) {
          key = urlParts.slice(domainIndex + 1).join("/");
        }
      }

      console.log("Opening contract with key:", key);

      // Gọi API để lấy presigned URL
      const result = await getPresignedUrl(key, 60); // 60 phút

      if (result.success) {
        // Mở file trong tab mới
        window.open(result.url, "_blank");

        setNotification({
          open: true,
          message: `Đã mở hợp đồng ${type === "signed" ? "đã ký" : "gốc"}`,
          severity: "success",
        });
      } else {
        setNotification({
          open: true,
          message: `Không thể mở hợp đồng: ${result.message}`,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error opening contract file:", error);
      setNotification({
        open: true,
        message: `Lỗi khi mở hợp đồng: ${error.message}`,
        severity: "error",
      });
    } finally {
      setContractViewLoading(false);
    }
  };
  const handleContractResign = async (orderId) => {
    setConfirmDialog({
      open: true,
      title: "Xác nhận yêu cầu ký lại hợp đồng",
      message: "Bạn có chắc chắn muốn yêu cầu khách hàng ký lại hợp đồng? ",
      onConfirm: () => executeContractResign(orderId),
    });
  };
  const executeContractResign = async (orderId) => {
    setActionLoading(true);
    try {
      const result = await dispatch(contractResignOrder(orderId));

      if (contractResignOrder.fulfilled.match(result)) {
        setNotification({
          open: true,
          message: "Đã yêu cầu khách hàng ký lại hợp đồng thành công!",
          severity: "success",
        });

        // Refresh data
        await refreshOrdersData();

        // Đóng dialog chi tiết đơn hàng
        handleCloseOrderDetails();
      } else {
        setNotification({
          open: true,
          message: result.payload || "Không thể yêu cầu ký lại hợp đồng",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Lỗi khi yêu cầu ký lại hợp đồng",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmDialog({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
      });
    }
  };
  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
  };
  const handleConfirmAction = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
  };
  const getContractIdForOrder = async (orderId) => {
    setFetchingContract(true);
    try {
      console.log("Fetching contract for order:", orderId);
      const response = await getOrderContractApi(orderId);

      if (response.success && response.data) {
        console.log("Contract found:", response.data);
        setContractId(response.data.id);
        setOpenRevisedContractUpload(true);
      } else {
        console.log("No contract found:", response);
        setNotification({
          open: true,
          message: "Không tìm thấy hợp đồng cho đơn hàng này",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      setNotification({
        open: true,
        message: "Lỗi khi tải thông tin hợp đồng: " + error.message,
        severity: "error",
      });
    } finally {
      setFetchingContract(false);
    }
  };
  const handleRevisedContractUploadSuccess = (updatedContract) => {
    setNotification({
      open: true,
      message: "Tải lên hợp đồng chỉnh sửa thành công!",
      severity: "success",
    });

    // Close upload dialog first
    setOpenRevisedContractUpload(false);
    setContractId(null);

    // Refresh data
    setTimeout(async () => {
      await refreshOrdersData();
    }, 300);

    // Close main dialog last
    setTimeout(() => {
      handleCloseOrderDetails();
    }, 200);
  };
  const handleContractUploadSuccess = () => {
    // Tránh vòng lặp bằng cách dùng nextTick/setTimeout
    setTimeout(() => {
      // Hiển thị thông báo thành công trước
      setNotification({
        open: true,
        message: "Tải lên hợp đồng thành công!",
        severity: "success",
      });

      // Đóng form upload
      setOpenContractUpload(false);

      // Sau đó mới dispatch action để fetch dữ liệu mới
      setTimeout(async () => {
        await refreshOrdersData();
      }, 300);
    }, 0);
  };

  const handleTabChange = (event, newValue) => {
    if (newValue !== currentTab) {
      console.log(`🔄 Tab changing from ${currentTab} to ${newValue}`);
      setIsTabSwitching(true);
      setCurrentTab(newValue);

      // Reset pagination và clear search khi switch tab
      if (newValue === 0) {
        setDesignRequestsPage(1);
        setActiveSearchKeyword("");
        setSearchDesignRequests("");
        setSearchKeyword("");
      } else {
        setOrdersPage(1);
      }

      // Clear tab switching state sau một delay ngắn
      setTimeout(() => {
        console.log(`✅ Tab switch completed to ${newValue}`);
        setIsTabSwitching(false);
      }, 100);
    }
  };
  const handleOrderStatusChange = (e) => {
    setSelectedOrderStatus(e.target.value);
    setOrdersPage(1); // Reset to first page when changing status
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setOrdersPage(1); // Reset to first page when searching
  };

  const handleSearchDesignRequests = (e) => {
    setSearchKeyword(e.target.value);
  };

  // Function để thực hiện tìm kiếm khi nhấn nút
  const handlePerformSearch = async () => {
    try {
      const keyword = searchKeyword.trim();
      setActiveSearchKeyword(keyword);
      setSearchDesignRequests(keyword);
      setDesignRequestsPage(1); // Reset về trang đầu khi search

      if (keyword) {
        // Gọi API search
        const action = await dispatch(
          searchDesignRequestsSale({
            keyword: keyword,
            page: 1,
            size: 10,
          })
        );
        if (action.payload && action.payload.totalPages) {
          setDesignRequestsTotalPages(action.payload.totalPages);
        }
      } else {
        // Gọi API lấy tất cả với status filter
        const action = await dispatch(
          fetchAllDesignRequests({
            status: selectedStatus,
            page: 1,
            size: 10,
          })
        );
        if (action.payload && action.payload.totalPages) {
          setDesignRequestsTotalPages(action.payload.totalPages);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setNotification({
        open: true,
        message: "Lỗi khi tìm kiếm: " + (error.message || "Không thể tìm kiếm"),
        severity: "error",
      });
    }
  };

  // Function để clear search
  const handleClearSearch = async () => {
    try {
      setSearchKeyword("");
      setActiveSearchKeyword("");
      setSearchDesignRequests("");
      setDesignRequestsPage(1);

      // Gọi lại API lấy tất cả
      const action = await dispatch(
        fetchAllDesignRequests({
          status: selectedStatus,
          page: 1,
          size: 10,
        })
      );
      if (action.payload && action.payload.totalPages) {
        setDesignRequestsTotalPages(action.payload.totalPages);
      }
    } catch (error) {
      console.error("Clear search error:", error);
      setNotification({
        open: true,
        message:
          "Lỗi khi xóa tìm kiếm: " +
          (error.message || "Không thể xóa tìm kiếm"),
        severity: "error",
      });
    }
  };

  // Function để handle Enter key cho design requests
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePerformSearch();
    }
  };

  // Orders Search Functions
  const handleSearchOrders = (e) => {
    setOrderSearchKeyword(e.target.value);
  };

  // Function để thực hiện tìm kiếm orders khi bấm nút
  const handlePerformOrderSearch = async () => {
    try {
      setOrderSearchLoading(true);
      const keyword = orderSearchKeyword.trim();
      setActiveOrderSearchKeyword(keyword);
      setOrdersPage(1);

      if (keyword) {
        // Gọi API search orders
        const action = await dispatch(
          searchCustomDesignOrders({
            query: keyword,
            page: 1,
            size: 10,
          })
        );
        if (
          action.payload &&
          action.payload.pagination &&
          action.payload.pagination.totalPages
        ) {
          setOrdersTotalPages(action.payload.pagination.totalPages);
        }
      } else {
        // Gọi API lấy tất cả với status filter
        const action = await dispatch(
          fetchCustomDesignOrders({
            orderStatus:
              selectedOrderStatus === "" ? null : selectedOrderStatus,
            page: 1,
            size: 10,
          })
        );
        if (
          action.payload &&
          action.payload.pagination &&
          action.payload.pagination.totalPages
        ) {
          setOrdersTotalPages(action.payload.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Perform order search error:", error);
      setNotification({
        open: true,
        message:
          "Lỗi khi tìm kiếm đơn hàng: " +
          (error.message || "Không thể tìm kiếm đơn hàng"),
        severity: "error",
      });
    } finally {
      setOrderSearchLoading(false);
    }
  };

  // Function để clear search orders
  const handleClearOrderSearch = async () => {
    try {
      setOrderSearchLoading(true);
      setOrderSearchKeyword("");
      setActiveOrderSearchKeyword("");
      setOrdersPage(1);

      // Gọi lại API lấy tất cả
      const action = await dispatch(
        fetchCustomDesignOrders({
          orderStatus: selectedOrderStatus === "" ? null : selectedOrderStatus,
          page: 1,
          size: 10,
        })
      );
      if (
        action.payload &&
        action.payload.pagination &&
        action.payload.pagination.totalPages
      ) {
        setOrdersTotalPages(action.payload.pagination.totalPages);
      }
    } catch (error) {
      console.error("Clear order search error:", error);
      setNotification({
        open: true,
        message:
          "Lỗi khi xóa tìm kiếm đơn hàng: " +
          (error.message || "Không thể xóa tìm kiếm"),
        severity: "error",
      });
    } finally {
      setOrderSearchLoading(false);
    }
  };

  // Function để handle Enter key cho orders
  const handleOrderSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePerformOrderSearch();
    }
  };

  // Reset page when search or status filter changes
  useEffect(() => {
    setOrdersPage(1);
  }, [searchQuery, selectedOrderStatus]);

  // Reset design requests page when search or status filter changes
  useEffect(() => {
    setDesignRequestsPage(1);
  }, [searchDesignRequests, selectedStatus]);
  const handleViewOrderDetails = async (order) => {
    console.log("Order data structure:", order);
    setSelectedOrder(order);
    setOrderDetailOpen(true);

    // Fetch order details
    setLoadingOrderDetails(true);
    try {
      const response = await orderService.get(
        `/api/orders/${order.id}/details`
      );
      if (response.data.success) {
        setOrderDetails(response.data.result);
      } else {
        console.error("Failed to fetch order details:", response.data.message);
        setOrderDetails(null);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setOrderDetails(null);
    } finally {
      setLoadingOrderDetails(false);
    }
  };
  const handleCloseOrderDetails = React.useCallback(() => {
    // Blur focused element
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }

    // Close any open nested dialogs first
    setOpenRevisedContractUpload(false);
    setOpenContractUpload(false);
    setContractId(null);

    // Then close main dialog
    setTimeout(() => {
      setSelectedOrder(null);
      setOrderDetailOpen(false);
    }, 50);
  }, []);
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      const response = await orderService.put(
        `/api/orders/${orderId}/status?status=${newStatus}`
      );
      if (response.data.success) {
        // Hiển thị thông báo thành công
        setNotification({
          open: true,
          message: `Đã cập nhật trạng thái sang "${
            ORDER_STATUS_MAP[newStatus]?.label || newStatus
          }"!`,
          severity: "success",
        });

        // Refresh orders data
        await refreshOrdersData();

        // Đóng dialog chi tiết đơn hàng
        handleCloseOrderDetails();
      } else {
        setNotification({
          open: true,
          message: response.data.message || "Không thể cập nhật trạng thái",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);

      // Hiển thị thông báo lỗi cụ thể
      let errorMessage = "Không thể cập nhật trạng thái đơn hàng";

      if (error.response) {
        if (error.response.status === 500) {
          errorMessage =
            "Lỗi máy chủ: Đơn hàng này có thể đã được cập nhật hoặc đang có vấn đề";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Handler wrapper cho xem chi tiết - lấy contractors nếu cần
  const handleViewDetail = async (orderId) => {
    // Tìm order để kiểm tra trạng thái
    const order = orders.find((o) => o.id === orderId);

    // Nếu đơn hàng ở trạng thái DEPOSITED, lấy danh sách contractors và mở dialog
    if (order && order.status === "DEPOSITED") {
      try {
        await dispatch(fetchAllContractors()).unwrap();
        console.log("Đã lấy danh sách contractors cho đơn hàng DEPOSITED");

        // Mở dialog hiển thị danh sách đơn vị thi công
        setContractorDialog({
          open: true,
          order: order,
        });

        return; // Không gọi handleViewOrderDetails gốc cho trạng thái DEPOSITED
      } catch (error) {
        console.error("Lỗi khi lấy danh sách contractors:", error);
        setNotification({
          open: true,
          message: "Có lỗi khi tải danh sách đơn vị thi công",
          severity: "warning",
        });
      }
    }

    // Gọi hàm handleViewOrderDetails gốc cho các trạng thái khác
    if (order) {
      handleViewOrderDetails(order);
    }
  };

  // Handler đóng contractor dialog
  const handleCloseContractorDialog = () => {
    setContractorDialog({
      open: false,
      order: null,
    });
  };

  // Handler báo ngày giao dự kiến
  const handleReportDelivery = async (
    orderId,
    estimatedDeliveryDate,
    contractorId
  ) => {
    try {
      console.log("Báo ngày giao dự kiến:", {
        orderId,
        estimatedDeliveryDate,
        contractorId,
      });

      await dispatch(
        updateOrderEstimatedDeliveryDate({
          orderId,
          estimatedDeliveryDate,
          contractorId,
        })
      ).unwrap();

      setNotification({
        open: true,
        message: "Báo ngày giao dự kiến thành công!",
        severity: "success",
      });

      // Refresh danh sách orders để cập nhật thông tin mới
      await refreshOrdersData();
    } catch (error) {
      console.error("Lỗi khi báo ngày giao dự kiến:", error);
      setNotification({
        open: true,
        message: error || "Có lỗi khi báo ngày giao dự kiến",
        severity: "error",
      });
    }
  };

  // Customer details are now included in the API response, so we don't need to fetch them separately
  // The customerDetail object is already available in each design request

  // Fetch designers when dialog is opened
  const fetchDesigners = async () => {
    setLoadingDesigners(true);
    try {
      const response = await getUsersByRoleApi("DESIGNER", 1, 10);
      if (response.success) {
        setDesigners(response.data || []);
      } else {
        console.error("Failed to fetch designers:", response.error);
        setNotification({
          open: true,
          message:
            "Không thể tải danh sách designer: " +
            (response.error || "Lỗi không xác định"),
          severity: "warning",
        });
      }
    } catch (error) {
      console.error("Error fetching designers:", error);
      setNotification({
        open: true,
        message:
          "Lỗi khi tải danh sách designer: " +
          (error.message || "Lỗi không xác định"),
        severity: "error",
      });
    } finally {
      setLoadingDesigners(false);
    }
  };

  // Removed pagination handler since we're displaying all items

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setSelectedDesigner(request.assignDesigner || "");
    setDetailOpen(true);
    setPriceForm({ totalPrice: "", depositAmount: "" });

    // Fetch designers when dialog opens
    fetchDesigners();
  };

  const handleCloseDetails = React.useCallback(() => {
    setDetailOpen(false);
    setSelectedRequest(null);
    // setComment("");
    setSelectedDesigner("");
    setPriceForm({ totalPrice: "", depositAmount: "" });
  }, []);

  // Handle assign designer to request
  const handleAssignDesigner = async () => {
    if (!selectedDesigner || !selectedRequest) return;

    setAssigningDesigner(true);
    setAssignmentError(null);

    try {
      const resultAction = await dispatch(
        assignDesignerToRequest({
          customDesignRequestId: selectedRequest.id,
          designerId: selectedDesigner,
        })
      );

      if (assignDesignerToRequest.fulfilled.match(resultAction)) {
        // Show success notification
        console.log("Designer assigned successfully!");
        setNotification({
          open: true,
          message: "Designer assigned successfully!",
          severity: "success",
        });

        // Cập nhật selectedRequest ngay lập tức với designer được assign
        setSelectedRequest((prevRequest) => ({
          ...prevRequest,
          assignDesigner: selectedDesigner,
          status: "ASSIGNED", // Cập nhật status nếu cần
        }));

        // Refresh data after assignment
        await refreshDesignRequestsData();

        // Close the dialog
        handleCloseDetails();
      } else {
        setNotification({
          open: true,
          message: resultAction.payload || "Failed to assign designer",
          severity: "error",
        });
        // Show error message
        setAssignmentError(resultAction.payload || "Failed to assign designer");
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "An error occurred",
        severity: "error",
      });
      setAssignmentError(error.message || "An error occurred");
      console.error("Error assigning designer:", error);
    } finally {
      setAssigningDesigner(false);
    }
  };
  const handleSetPendingContract = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);

    try {
      const resultAction = await dispatch(
        updateRequestStatus({
          customDesignRequestId: selectedRequest.id,
          status: "PENDING_CONTRACT",
        })
      );

      if (updateRequestStatus.fulfilled.match(resultAction)) {
        setNotification({
          open: true,
          message: "Đã chuyển trạng thái sang 'Chờ gửi hợp đồng'!",
          severity: "success",
        });

        // Cập nhật selectedRequest ngay lập tức
        setSelectedRequest((prevRequest) => ({
          ...prevRequest,
          status: "PENDING_CONTRACT",
        }));

        // Refresh data
        await refreshDesignRequestsData();

        // Close the dialog
        handleCloseDetails();
      } else {
        setNotification({
          open: true,
          message: resultAction.payload || "Không thể chuyển trạng thái",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "Đã xảy ra lỗi",
        severity: "error",
      });
      console.error("Error setting pending contract status:", error);
    } finally {
      setActionLoading(false);
    }
  };
  // Handle rejecting the request
  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    setRejectingRequest(true);

    try {
      const resultAction = await dispatch(
        updateRequestStatus({
          customDesignRequestId: selectedRequest.id,
          status: "REJECTED",
        })
      );

      if (updateRequestStatus.fulfilled.match(resultAction)) {
        // Show success notification
        setNotification({
          open: true,
          message: "Request rejected successfully!",
          severity: "success",
        });

        // Cập nhật selectedRequest ngay lập tức
        setSelectedRequest((prevRequest) => ({
          ...prevRequest,
          status: "REJECTED",
        }));

        // Refresh data after rejection
        await refreshDesignRequestsData();

        // Close the dialog
        handleCloseDetails();
      } else {
        setNotification({
          open: true,
          message: resultAction.payload || "Failed to reject request",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "An error occurred",
        severity: "error",
      });
      console.error("Error rejecting request:", error);
    } finally {
      setRejectingRequest(false);
    }
  };

  // Get customer name from customer details
  const getCustomerName = (customerDetail) => {
    if (!customerDetail) return "Unknown";

    // Return fullName from the users object if available
    if (customerDetail.users && customerDetail.users.fullName) {
      return customerDetail.users.fullName;
    }

    // Fallback to company name if user fullName is not available
    return customerDetail.companyName || "Unnamed Customer";
  };

  const getStatusChip = (status) => {
    const config = CUSTOM_DESIGN_STATUS_MAP[status] || {
      label: status,
      color: "default",
    };

    // Nếu trạng thái là FULLY_PAID, hiển thị thêm badge nhỏ để nhắc nhở cần chuyển sang PENDING_CONTRACT
    if (status === "FULLY_PAID") {
      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip
            label={config.label}
            color={config.color}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label="Cần chuyển trạng thái"
            color="warning"
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem" }}
          />
        </Stack>
      );
    }

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusInVietnamese = (status) => {
    const statusMap = {
      PENDING: "Chờ xác nhận",
      PRICING_NOTIFIED: "Đã báo giá",
      REJECTED_PRICING: "Từ chối báo giá",
      APPROVED_PRICING: "Đã duyệt giá",
      DEPOSITED: "Đã đặt cọc",
      ASSIGNED_DESIGNER: "Đã giao designer",
      PROCESSING: "Đang thiết kế",
      DESIGNER_REJECTED: "Designer từ chối",
      DEMO_SUBMITTED: "Đã nộp demo",
      REVISION_REQUESTED: "Yêu cầu chỉnh sửa",
      WAITING_FULL_PAYMENT: "Chờ thanh toán đủ",
      FULLY_PAID: "Đã thanh toán đủ",
      PENDING_CONTRACT: "Chờ gửi hợp đồng",
      COMPLETED: "Hoàn tất",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  // Format date from ISO string
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN");
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "";
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + " VND"
    );
  };

  // Hàm báo giá
  const handleCreateProposal = async () => {
    if (!selectedRequest) return;
    setCreatingProposal(true);
    try {
      const data = {
        totalPrice: Number(priceForm.totalPrice),
        depositAmount: Number(priceForm.depositAmount),
      };
      const resultAction = await dispatch(
        createProposal({
          customDesignRequestId: selectedRequest.id,
          data,
        })
      );
      if (createProposal.fulfilled.match(resultAction)) {
        setNotification({
          open: true,
          message: "Báo giá thành công!",
          severity: "success",
        });

        // Cập nhật status của selectedRequest ngay lập tức để UI hiển thị đúng
        setSelectedRequest((prevRequest) => ({
          ...prevRequest,
          status: "PRICING_NOTIFIED",
        }));

        // Reset form
        setPriceForm({ totalPrice: "", depositAmount: "" });
        // Reload proposals to show the new one
        getPriceProposals(selectedRequest.id).then((res) => {
          if (res.success) {
            setPriceProposals(res.result);
          }
        });
        // Refresh design requests data
        await refreshDesignRequestsData();
      } else {
        setNotification({
          open: true,
          message: resultAction.payload || "Báo giá thất bại",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "Có lỗi xảy ra",
        severity: "error",
      });
    } finally {
      setCreatingProposal(false);
    }
  };

  // Fetch price proposals when detailOpen or selectedRequest changes
  useEffect(() => {
    if (detailOpen && selectedRequest) {
      setLoadingProposals(true);
      getPriceProposals(selectedRequest.id).then((res) => {
        if (res.success) {
          setPriceProposals(res.result);
        } else {
          setPriceProposals([]);
        }
        setLoadingProposals(false);
      });
    }
  }, [detailOpen, selectedRequest]);

  const handleOpenUpdateDialog = (proposal) => {
    setUpdateDialog({ open: true, proposalId: proposal.id });
    setUpdateForm({
      totalPrice: proposal.totalPriceOffer || proposal.totalPrice || "",
      depositAmount:
        proposal.depositAmountOffer || proposal.depositAmount || "",
    });
  };

  // Function để chấp nhận offer và tự động tạo báo giá mới
  const handleAcceptOffer = async (proposal) => {
    if (!proposal.totalPriceOffer || !proposal.depositAmountOffer) {
      setNotification({
        open: true,
        message: "Không tìm thấy thông tin offer từ khách hàng!",
        severity: "error",
      });
      return;
    }

    if (!selectedRequest) {
      setNotification({
        open: true,
        message: "Không tìm thấy thông tin yêu cầu thiết kế!",
        severity: "error",
      });
      return;
    }

    setCreatingProposal(true);
    try {
      const data = {
        totalPrice: Number(proposal.totalPriceOffer),
        depositAmount: Number(proposal.depositAmountOffer),
      };

      const resultAction = await dispatch(
        createProposal({
          customDesignRequestId: selectedRequest.id,
          data,
        })
      );

      if (createProposal.fulfilled.match(resultAction)) {
        setNotification({
          open: true,
          message: "Đã chấp nhận offer và tạo báo giá mới thành công!",
          severity: "success",
        });

        // Cập nhật status của selectedRequest ngay lập tức để UI hiển thị đúng
        setSelectedRequest((prevRequest) => ({
          ...prevRequest,
          status: "PRICING_NOTIFIED",
        }));

        // Reset form báo giá (ẩn form)
        setPriceForm({ totalPrice: "", depositAmount: "" });

        // Reload proposals to show the new one
        getPriceProposals(selectedRequest.id).then((res) => {
          if (res.success) {
            setPriceProposals(res.result);
          }
        });

        // Refresh design requests data
        await refreshDesignRequestsData();
      } else {
        setNotification({
          open: true,
          message: resultAction.payload || "Không thể tạo báo giá",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Có lỗi xảy ra khi tạo báo giá",
        severity: "error",
      });
    }
    setCreatingProposal(false);
  };

  // Helper function để kiểm tra xem có phải proposal mới nhất có offer và chưa được chấp nhận không
  const isLatestProposalWithOffer = (proposal) => {
    // Tìm tất cả proposals có offer
    const proposalsWithOffer = priceProposals.filter(
      (p) => p.totalPriceOffer && p.depositAmountOffer
    );

    // Nếu không có proposal nào có offer thì return false
    if (proposalsWithOffer.length === 0) return false;

    // Sắp xếp theo thời gian tạo (mới nhất trước)
    proposalsWithOffer.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Kiểm tra xem proposal hiện tại có phải là proposal mới nhất có offer không
    const isLatestWithOffer = proposalsWithOffer[0].id === proposal.id;

    // Kiểm tra xem có proposal nào được tạo sau proposal có offer này không
    // (nghĩa là offer này đã được chấp nhận và tạo báo giá mới)
    const hasNewerProposal = priceProposals.some(
      (p) =>
        new Date(p.createdAt) > new Date(proposal.createdAt) &&
        !p.totalPriceOffer // Proposal mới không có offer (nghĩa là do sale tạo)
    );

    // Chỉ hiển thị nút nếu là proposal mới nhất có offer VÀ chưa có proposal mới nào được tạo sau nó
    return isLatestWithOffer && !hasNewerProposal;
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialog({ open: false, proposalId: null });
  };

  const handleUpdateSubmit = async () => {
    setActionLoading(true);
    const { proposalId } = updateDialog;
    const data = {
      totalPrice: Number(updateForm.totalPrice),
      depositAmount: Number(updateForm.depositAmount),
    };
    const res = await updatePriceProposalPricing(proposalId, data);
    if (res.success) {
      setNotification({
        open: true,
        message: "Cập nhật giá thành công!",
        severity: "success",
      });
      handleCloseUpdateDialog();
      // Reload proposals
      getPriceProposals(selectedRequest.id).then(
        (r) => r.success && setPriceProposals(r.result)
      );
      // Refresh design requests data
      await refreshDesignRequestsData();
    } else {
      setNotification({
        open: true,
        message: res.error || "Cập nhật giá thất bại",
        severity: "error",
      });
    }
    setActionLoading(false);
  };

  // Loading states
  if (isTabSwitching) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Đang chuyển tab...
        </Typography>
      </Box>
    );
  }

  if (
    status === "loading" &&
    allDesignRequests.length === 0 &&
    currentTab === 0
  ) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  if (status === "failed") {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">
          Lỗi tải dữ liệu: {error || "Không thể tải dữ liệu"}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #030C20 0%, #030C20 100%)",
              borderRadius: 3,
              p: 3,
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "100%",
                height: "100%",
                background:
                  'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\')',
                opacity: 0.3,
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ position: "relative", zIndex: 1 }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                }}
              >
                <AssignmentIcon sx={{ fontSize: 30, color: "white" }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Đơn hàng thiết kế thủ công
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Theo dõi và quản lý các yêu cầu thiết kế tùy chỉnh, đơn hàng
                  thiết kế thủ công
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Tabs Section */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              px: 2,
              "& .MuiTab-root": {
                minHeight: 64,
                fontSize: "1rem",
                fontWeight: 500,
                textTransform: "none",
              },
              "& .Mui-selected": {
                color: "primary.main",
                fontWeight: 600,
              },
            }}
            variant="fullWidth"
          >
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BrushIcon />
                  <span>Yêu cầu thiết kế</span>
                </Stack>
              }
            />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <OrderIcon />
                  <span>Đơn hàng thiết kế tùy chỉnh</span>
                </Stack>
              }
            />
          </Tabs>
        </Card>
        {currentTab === 0 ? (
          <>
            {/* Filter Section */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <FilterIcon color="primary" />
                <Typography variant="h6" fontWeight="medium" sx={{ mr: 1 }}>
                  Bộ lọc
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    try {
                      setNotification({
                        open: true,
                        message: "Đang làm mới dữ liệu...",
                        severity: "info",
                      });
                      await refreshDesignRequestsData();
                      setNotification({
                        open: true,
                        message: "Làm mới thành công",
                        severity: "success",
                      });
                    } catch (e) {
                      setNotification({
                        open: true,
                        message: "Làm mới thất bại",
                        severity: "error",
                      });
                    }
                  }}
                  startIcon={<RefreshIcon />}
                >
                  Làm mới
                </Button>
              </Stack>

              {/* Search and Filter Row */}
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                {/* Search Field */}

                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: 250 }}>
                  <InputLabel id="status-filter-label">
                    Lọc theo trạng thái
                  </InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={selectedStatus}
                    label="Lọc theo trạng thái"
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setDesignRequestsPage(1); // Reset to first page when changing status
                    }}
                  >
                    <MenuItem value="">Tất cả trạng thái</MenuItem>
                    <MenuItem value="PENDING">Chờ xác nhận</MenuItem>
                    <MenuItem value="PRICING_NOTIFIED">Đã báo giá</MenuItem>
                    <MenuItem value="REJECTED_PRICING">
                      Từ chối báo giá
                    </MenuItem>
                    <MenuItem value="APPROVED_PRICING">Đã duyệt giá</MenuItem>
                    <MenuItem value="DEPOSITED">Đã đặt cọc</MenuItem>
                    <MenuItem value="ASSIGNED_DESIGNER">
                      Đã giao designer
                    </MenuItem>
                    <MenuItem value="PROCESSING">Đang thiết kế</MenuItem>
                    <MenuItem value="DESIGNER_REJECTED">
                      Designer từ chối
                    </MenuItem>
                    <MenuItem value="DEMO_SUBMITTED">Đã nộp demo</MenuItem>
                    <MenuItem value="REVISION_REQUESTED">
                      Yêu cầu chỉnh sửa
                    </MenuItem>
                    <MenuItem value="WAITING_FULL_PAYMENT">
                      Chờ thanh toán đủ
                    </MenuItem>
                    <MenuItem value="FULLY_PAID">Đã thanh toán đủ</MenuItem>
                    <MenuItem value="COMPLETED">Hoàn tất</MenuItem>
                    <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                  </Select>
                </FormControl>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flex: 1, alignItems: "flex-start" }}
                >
                  <TextField
                    size="small"
                    placeholder="Tìm kiếm theo mã yêu cầu, tên công ty."
                    value={searchKeyword}
                    onChange={handleSearchDesignRequests}
                    onKeyPress={handleSearchKeyPress}
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 1, color: "text.secondary" }}>
                          <SearchIcon />
                        </Box>
                      ),
                      endAdornment: searchKeyword && (
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          sx={{ mr: 0.5 }}
                          title="Xóa tìm kiếm"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handlePerformSearch}
                    disabled={status === "loading"}
                    startIcon={
                      status === "loading" && searchDesignRequests.trim() ? (
                        <CircularProgress size={16} />
                      ) : (
                        <SearchIcon />
                      )
                    }
                    sx={{
                      px: 3,
                      whiteSpace: "nowrap",
                      minWidth: "120px",
                    }}
                  >
                    {status === "loading" && activeSearchKeyword.trim()
                      ? "Đang tìm..."
                      : "Tìm kiếm"}
                  </Button>
                  {activeSearchKeyword.trim() && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleClearSearch}
                      sx={{
                        px: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Card>

            {/* Search Results Info */}
            {activeSearchKeyword.trim() && (
              <Card
                sx={{
                  p: 2,
                  bgcolor: "info.light",
                  border: "1px solid",
                  borderColor: "info.main",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SearchIcon sx={{ fontSize: 20, color: "info.dark" }} />
                  <Typography variant="body2" color="info.dark">
                    <strong>Kết quả tìm kiếm cho:</strong> "
                    {activeSearchKeyword.trim()}"
                    {status === "succeeded" && (
                      <span>
                        {" "}
                        - Tìm thấy {allDesignRequests.length} yêu cầu
                      </span>
                    )}
                    {status === "loading" && <span> - Đang tìm kiếm...</span>}
                  </Typography>
                </Box>
              </Card>
            )}

            {/* Content Section */}
            {allDesignRequests.length === 0 && status === "succeeded" ? (
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>
                  <BrushIcon sx={{ fontSize: 64, color: "grey.400" }} />
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {activeSearchKeyword.trim()
                    ? "Không tìm thấy kết quả"
                    : "Chưa có yêu cầu thiết kế nào"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeSearchKeyword.trim()
                    ? `Không tìm thấy yêu cầu thiết kế nào phù hợp với từ khóa "${activeSearchKeyword}"`
                    : "Hiện tại không có yêu cầu thiết kế nào phù hợp với bộ lọc đã chọn"}
                </Typography>
              </Card>
            ) : (
              <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: "#030C20" }}>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "white",
                          }}
                        >
                          Mã yêu cầu
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "white",
                          }}
                        >
                          Khách hàng
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "white",
                          }}
                        >
                          Công ty
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "white",
                          }}
                        >
                          Yêu cầu
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "white",
                          }}
                        >
                          Ngày tạo
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "white",
                          }}
                        >
                          Tổng tiền
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "white",
                          }}
                        >
                          Trạng thái
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            textAlign: "center",
                            color: "white",
                          }}
                        >
                          Thao tác
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allDesignRequests.map((request, index) => (
                        <TableRow
                          key={request.id}
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(25, 118, 210, 0.04)",
                              transition: "background-color 0.2s ease",
                            },
                            "&:nth-of-type(even)": {
                              backgroundColor: "rgba(0, 0, 0, 0.02)",
                            },
                          }}
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="primary.main"
                            >
                              {request.code || ""}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <S3Avatar
                                s3Key={request.customerDetail?.users?.avatar}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: "0.8rem",
                                }}
                              >
                                {getCustomerName(request.customerDetail)
                                  .charAt(0)
                                  .toUpperCase()}
                              </S3Avatar>
                              <Typography variant="body2" fontWeight="medium">
                                {getCustomerName(request.customerDetail)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {request.customerDetail?.companyName ||
                                "Chưa có thông tin"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={request.requirements}
                              placement="top"
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 200,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {request.requirements}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(request.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="primary.main"
                            >
                              {formatCurrency(request.totalPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell>{getStatusChip(request.status)}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Xem chi tiết" placement="top">
                              <IconButton
                                color="primary"
                                onClick={() => handleViewDetails(request)}
                                sx={{
                                  "&:hover": {
                                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                                    transform: "scale(1.1)",
                                    transition: "all 0.2s ease",
                                  },
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

                {/* Pagination for Design Requests */}
                {designRequestsTotalPages > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                  >
                    <Pagination
                      count={designRequestsTotalPages}
                      page={designRequestsPage}
                      onChange={handleDesignRequestsPageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Filter Section */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <FilterIcon color="primary" />
                <Typography variant="h6" fontWeight="medium">
                  Bộ lọc đơn hàng
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    try {
                      setNotification({
                        open: true,
                        message: "Đang làm mới dữ liệu...",
                        severity: "info",
                      });
                      await refreshOrdersData();
                      setNotification({
                        open: true,
                        message: "Làm mới thành công",
                        severity: "success",
                      });
                    } catch {
                      setNotification({
                        open: true,
                        message: "Làm mới thất bại",
                        severity: "error",
                      });
                    }
                  }}
                  startIcon={<RefreshIcon />}
                  sx={{ ml: 1 }}
                >
                  Làm mới
                </Button>
              </Stack>

              {/* Search and Filter Row */}
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: 300 }}>
                  <InputLabel id="order-status-filter-label">
                    Lọc theo trạng thái đơn hàng
                  </InputLabel>
                  <Select
                    labelId="order-status-filter-label"
                    value={selectedOrderStatus}
                    label="Lọc theo trạng thái đơn hàng"
                    onChange={handleOrderStatusChange}
                  >
                    <MenuItem value="">Tất cả trạng thái</MenuItem>
                    <MenuItem value="PENDING_DESIGN">Chờ thiết kế</MenuItem>
                    <MenuItem value="NEED_DEPOSIT_DESIGN">
                      Cần đặt cọc thiết kế
                    </MenuItem>
                    <MenuItem value="DEPOSITED_DESIGN">
                      Đã đặt cọc thiết kế
                    </MenuItem>
                    <MenuItem value="NEED_FULLY_PAID_DESIGN">
                      Cần thanh toán đủ thiết kế
                    </MenuItem>
                    <MenuItem value="WAITING_FINAL_DESIGN">
                      Chờ thiết kế cuối
                    </MenuItem>
                    <MenuItem value="DESIGN_COMPLETED">
                      Hoàn thành thiết kế
                    </MenuItem>
                    <MenuItem value="PENDING_CONTRACT">Chờ hợp đồng</MenuItem>
                    <MenuItem value="CONTRACT_SENT">Đã gửi hợp đồng</MenuItem>
                    <MenuItem value="CONTRACT_SIGNED">Đã ký hợp đồng</MenuItem>
                    <MenuItem value="CONTRACT_DISCUSS">
                      Đàm phán hợp đồng
                    </MenuItem>
                    <MenuItem value="CONTRACT_RESIGNED">
                      Từ chối hợp đồng
                    </MenuItem>
                    <MenuItem value="CONTRACT_CONFIRMED">
                      Xác nhận hợp đồng
                    </MenuItem>
                    <MenuItem value="DEPOSITED">Đã đặt cọc</MenuItem>
                    <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                    <MenuItem value="PRODUCING">Đang sản xuất</MenuItem>
                    <MenuItem value="PRODUCTION_COMPLETED">
                      Hoàn thành sản xuất
                    </MenuItem>
                    <MenuItem value="DELIVERING">Đang giao hàng</MenuItem>
                    <MenuItem value="INSTALLED">Đã lắp đặt</MenuItem>
                    <MenuItem value="ORDER_COMPLETED">
                      Hoàn tất đơn hàng
                    </MenuItem>
                    <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                  </Select>
                </FormControl>

                {/* Search Field */}
                <TextField
                  size="small"
                  placeholder="Tìm kiếm theo mã đơn hàng, tên công ty..."
                  value={orderSearchKeyword}
                  onChange={(e) => setOrderSearchKeyword(e.target.value)}
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: "text.secondary" }}>
                        <SearchIcon />
                      </Box>
                    ),
                    endAdornment: orderSearchKeyword && (
                      <IconButton
                        size="small"
                        onClick={handleClearOrderSearch}
                        sx={{ mr: 0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handlePerformOrderSearch();
                    }
                  }}
                />

                {/* Search Button */}
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handlePerformOrderSearch}
                  disabled={orderSearchLoading}
                  sx={{
                    minWidth: 120,
                    height: 40,
                    background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #1565c0, #1976d2)",
                    },
                  }}
                >
                  {orderSearchLoading ? "Đang tìm..." : "Tìm kiếm"}
                </Button>

                {/* Clear Search Button */}
                {orderSearchKeyword && (
                  <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={handleClearOrderSearch}
                    disabled={orderSearchLoading}
                    sx={{ minWidth: 100, height: 40 }}
                  >
                    Xóa
                  </Button>
                )}
              </Stack>
            </Card>

            {/* Content Section */}
            {orders.length === 0 ? (
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>
                  <OrderIcon sx={{ fontSize: 64, color: "grey.400" }} />
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchQuery.trim()
                    ? "Không tìm thấy kết quả"
                    : "Chưa có đơn hàng nào"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery.trim()
                    ? `Không tìm thấy đơn hàng nào phù hợp với từ khóa "${searchQuery}"`
                    : "Không tìm thấy đơn hàng nào với trạng thái đã chọn"}
                </Typography>
              </Card>
            ) : (
              <>
                {/* {allOrders.length > orders.length && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Hiển thị {orders.length} đơn hàng thiết kế tùy chỉnh (tổng {allOrders.length} đơn hàng từ API)
                  </Alert>
                )} */}

                <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: "#030C20" }}>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              color: "white",
                            }}
                          >
                            Mã đơn hàng
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              color: "white",
                            }}
                          >
                            Khách hàng
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              color: "white",
                            }}
                          >
                            Địa chỉ
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              color: "white",
                            }}
                          >
                            Loại đơn hàng
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              color: "white",
                            }}
                          >
                            Ngày tạo
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              color: "white",
                            }}
                          >
                            Tổng tiền
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              color: "white",
                            }}
                          >
                            Trạng thái
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              textAlign: "center",
                              color: "white",
                            }}
                          >
                            Thao tác
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow
                            key={order.id}
                            sx={{
                              "&:hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.04)",
                                transition: "background-color 0.2s ease",
                              },
                              "&:nth-of-type(even)": {
                                backgroundColor: "rgba(0, 0, 0, 0.02)",
                              },
                            }}
                          >
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color="primary.main"
                              >
                                {order.orderCode || order.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <S3Avatar
                                  s3Key={order.users?.avatar}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  {(order.users?.fullName || "K")
                                    .charAt(0)
                                    .toUpperCase()}
                                </S3Avatar>
                                <Typography variant="body2" fontWeight="medium">
                                  {order.users?.fullName || "Chưa có thông tin"}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                title={order.address || "Chưa có địa chỉ"}
                                placement="top"
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    maxWidth: 200,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {order.address || "Chưa có địa chỉ"}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  order.orderType ===
                                  "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                                    ? "Thiết kế tùy chỉnh có thi công"
                                    : order.orderType ===
                                      "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"
                                    ? "Thiết kế tùy chỉnh không thi công"
                                    : order.orderType === "AI_DESIGN"
                                    ? "Thiết kế AI"
                                    : order.orderType
                                }
                                color={
                                  order.orderType ===
                                  "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                                    ? "success"
                                    : order.orderType ===
                                      "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"
                                    ? "info"
                                    : "primary"
                                }
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {formatDate(order.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color="primary.main"
                              >
                                {formatCurrency(
                                  order.totalOrderAmount || order.totalAmount
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Chip
                                  label={
                                    ORDER_STATUS_MAP[order.status]?.label ||
                                    order.status
                                  }
                                  color={
                                    ORDER_STATUS_MAP[order.status]?.color ||
                                    "default"
                                  }
                                  size="small"
                                  sx={{ fontWeight: 500 }}
                                />
                              </Stack>
                            </TableCell>
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "stretch",
                                  gap: 0.75,
                                }}
                              >
                                <Button
                                  variant="contained"
                                  color={
                                    order.status === "DEPOSITED"
                                      ? "info"
                                      : "primary"
                                  }
                                  size="small"
                                  onClick={() => handleViewDetail(order.id)}
                                  startIcon={
                                    order.status === "DEPOSITED" ? (
                                      <ShippingIcon />
                                    ) : undefined
                                  }
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: "medium",
                                    fontSize: "0.70rem",
                                    px: 1.5,
                                    py: 0.6,
                                    minWidth:
                                      order.status === "DEPOSITED" ? 110 : 78,
                                    boxShadow: 2,
                                    background:
                                      order.status === "DEPOSITED"
                                        ? "linear-gradient(135deg,#0284c7 0%,#0ea5e9 100%)"
                                        : "linear-gradient(135deg,#1565c0 0%,#1976d2 100%)",
                                    "&:hover": {
                                      boxShadow: 4,
                                      transform: "translateY(-1px)",
                                      background:
                                        order.status === "DEPOSITED"
                                          ? "linear-gradient(135deg,#026799 0%,#0284c7 100%)"
                                          : "linear-gradient(135deg,#0d47a1 0%,#1565c0 100%)",
                                    },
                                  }}
                                >
                                  {order.status === "DEPOSITED"
                                    ? "Báo giao hàng"
                                    : "Xem chi tiết"}
                                </Button>
                                {/* NEW: Cash confirm design deposit button for NEED_DEPOSIT_DESIGN */}
                                {order.status === "NEED_DEPOSIT_DESIGN" && (
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={() =>
                                      openCashDesignDepositDialog(order)
                                    }
                                    startIcon={<AttachMoneyIcon />}
                                    sx={{
                                      mt: 0.5,
                                      borderRadius: 2,
                                      textTransform: "none",
                                      fontWeight: "medium",
                                      fontSize: "0.65rem",
                                      px: 1.2,
                                      py: 0.5,
                                      background:
                                        "linear-gradient(135deg,#2e7d32 0%,#43a047 100%)",
                                      boxShadow:
                                        "0 3px 10px rgba(46,125,50,0.35)",
                                      "&:hover": {
                                        background:
                                          "linear-gradient(135deg,#27672b 0%,#3b8a3f 100%)",
                                        boxShadow:
                                          "0 5px 16px rgba(46,125,50,0.5)",
                                        transform: "translateY(-1px)",
                                      },
                                      "&:active": { transform: "scale(.95)" },
                                    }}
                                  >
                                    Xác nhận cọc (tiền mặt)
                                  </Button>
                                )}
                                {/* NEW: Cash confirm remaining design payment button for NEED_FULLY_PAID_DESIGN */}
                                {order.status === "NEED_FULLY_PAID_DESIGN" && (
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={() =>
                                      openCashDesignRemainingDialog(order)
                                    }
                                    startIcon={<AttachMoneyIcon />}
                                    sx={{
                                      mt: 0.5,
                                      borderRadius: 2,
                                      textTransform: "none",
                                      fontWeight: "medium",
                                      fontSize: "0.65rem",
                                      px: 1.2,
                                      py: 0.5,
                                      background:
                                        "linear-gradient(135deg,#1b5e20 0%,#2e7d32 100%)",
                                      boxShadow:
                                        "0 3px 10px rgba(27,94,32,0.35)",
                                      "&:hover": {
                                        background:
                                          "linear-gradient(135deg,#154a19 0%,#27672b 100%)",
                                        boxShadow:
                                          "0 5px 16px rgba(27,94,32,0.5)",
                                        transform: "translateY(-1px)",
                                      },
                                      "&:active": { transform: "scale(.95)" },
                                    }}
                                  >
                                    Xác nhận đủ TK (tiền mặt)
                                  </Button>
                                )}
                              </Box>
                              {/* Các nút hành động hợp đồng (áp dụng cho đơn hàng thiết kế tùy chỉnh từ trạng thái PENDING_CONTRACT trở đi) */}
                              {[
                                "PENDING_CONTRACT",
                                "CONTRACT_SENT",
                                "CONTRACT_DISCUSS",
                                "CONTRACT_SIGNED",
                                "CONTRACT_RESIGNED",
                                "CONTRACT_CONFIRMED",
                                "DEPOSITED",
                                "IN_PROGRESS",
                                "PRODUCING",
                                "PRODUCTION_COMPLETED",
                                "DELIVERING",
                                "INSTALLED",
                                "ORDER_COMPLETED",
                              ].includes(order.status) && (
                                <Box
                                  sx={(theme) => {
                                    const verticalStatuses = [
                                      "CONTRACT_DISCUSS",
                                      "CONTRACT_SIGNED",
                                      "CONTRACT_RESIGNED",
                                      "CONTRACT_CONFIRMED",
                                      "DEPOSITED",
                                      "IN_PROGRESS",
                                      "PRODUCING",
                                      "PRODUCTION_COMPLETED",
                                      "DELIVERING",
                                      "INSTALLED",
                                      "ORDER_COMPLETED",
                                    ];
                                    const isVertical =
                                      verticalStatuses.includes(order.status);
                                    return {
                                      display: "flex",
                                      flexDirection: isVertical
                                        ? "column"
                                        : "row",
                                      alignItems: isVertical
                                        ? "stretch"
                                        : "center",
                                      gap: 0.75,
                                      mt: 1,
                                      justifyContent: "center",
                                      // Full width buttons when vertical
                                      "& > *": isVertical
                                        ? { width: "100%" }
                                        : {},
                                    };
                                  }}
                                >
                                  {/* Gửi hợp đồng */}
                                  {order.status === "PENDING_CONTRACT" && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<UploadIcon />}
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setOpenContractUpload(true);
                                      }}
                                      sx={{
                                        textTransform: "none",
                                        fontSize: "0.65rem",
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 0.4,
                                        background:
                                          "linear-gradient(135deg,#2e7d32 0%,#43a047 100%)",
                                        boxShadow:
                                          "0 3px 10px rgba(46,125,50,0.35)",
                                        "&:hover": {
                                          background:
                                            "linear-gradient(135deg,#27672b 0%,#3b8a3f 100%)",
                                          boxShadow:
                                            "0 5px 16px rgba(46,125,50,0.5)",
                                          transform: "translateY(-1px)",
                                        },
                                        "&:active": { transform: "scale(.95)" },
                                      }}
                                    >
                                      Gửi hợp đồng
                                    </Button>
                                  )}
                                  {/* Gửi lại hợp đồng */}
                                  {order.status === "CONTRACT_DISCUSS" && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<UploadIcon />}
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        getContractIdForOrder(order.id);
                                      }}
                                      sx={{
                                        textTransform: "none",
                                        fontSize: "0.65rem",
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 0.6,
                                        background:
                                          "linear-gradient(135deg,#f59e0b 0%,#fbbf24 100%)",
                                        color: "#222",
                                        boxShadow:
                                          "0 3px 10px rgba(245,158,11,0.35)",
                                        "&:hover": {
                                          background:
                                            "linear-gradient(135deg,#d98206 0%,#e6a814 100%)",
                                          boxShadow:
                                            "0 5px 16px rgba(245,158,11,0.5)",
                                          transform: "translateY(-1px)",
                                        },
                                        "&:active": { transform: "scale(.95)" },
                                        width: "100%",
                                      }}
                                    >
                                      Gửi lại hợp đồng
                                    </Button>
                                  )}
                                  {/* Xem hợp đồng */}
                                  {[
                                    "CONTRACT_SIGNED",
                                    "CONTRACT_SENT",
                                    "CONTRACT_CONFIRMED",
                                    "CONTRACT_DISCUSS",
                                    "CONTRACT_RESIGNED",
                                    "PRODUCTION_COMPLETED",
                                    "ORDER_COMPLETED",
                                  ].includes(order.status) && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={
                                        contractViewLoading ? (
                                          <CircularProgress size={14} />
                                        ) : (
                                          <DescriptionIcon />
                                        )
                                      }
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        handleViewContract(order.id);
                                      }}
                                      disabled={contractViewLoading}
                                      sx={{
                                        textTransform: "none",
                                        fontSize: "0.65rem",
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 0.4,
                                        background:
                                          "linear-gradient(135deg,#1976d2 0%,#2196f3 100%)",
                                        boxShadow:
                                          "0 3px 10px rgba(25,118,210,0.35)",
                                        "&:hover": {
                                          background:
                                            "linear-gradient(135deg,#1565c0 0%,#1e88e5 100%)",
                                          boxShadow:
                                            "0 5px 16px rgba(25,118,210,0.5)",
                                          transform: "translateY(-1px)",
                                        },
                                        "&:active": { transform: "scale(.95)" },
                                      }}
                                    >
                                      {contractViewLoading
                                        ? "Đang tải..."
                                        : "Xem hợp đồng"}
                                    </Button>
                                  )}
                                  {/* NEW: Cash confirm construction deposit (after contract confirmed) */}
                                  {order.status === "CONTRACT_CONFIRMED" && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<AttachMoneyIcon />}
                                      onClick={() =>
                                        openCashConstructionDepositDialog(order)
                                      }
                                      sx={{
                                        textTransform: "none",
                                        fontSize: "0.65rem",
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 0.4,
                                        background:
                                          "linear-gradient(135deg,#00695c 0%,#00897b 100%)",
                                        boxShadow:
                                          "0 3px 10px rgba(0,105,92,0.35)",
                                        "&:hover": {
                                          background:
                                            "linear-gradient(135deg,#00534a 0%,#007065 100%)",
                                          boxShadow:
                                            "0 5px 16px rgba(0,105,92,0.5)",
                                          transform: "translateY(-1px)",
                                        },
                                        "&:active": { transform: "scale(.95)" },
                                      }}
                                    >
                                      Xác nhận cọc thi công
                                    </Button>
                                  )}
                                  {/* Xác nhận hoàn tất khi khách đã ký */}
                                  {order.status === "CONTRACT_SIGNED" && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<DescriptionIcon />}
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        handleContractSigned(order.id);
                                      }}
                                      sx={{
                                        textTransform: "none",
                                        fontSize: "0.65rem",
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 0.4,
                                        background:
                                          "linear-gradient(135deg,#388e3c 0%,#4caf50 100%)",
                                        boxShadow:
                                          "0 3px 10px rgba(56,142,60,0.35)",
                                        "&:hover": {
                                          background:
                                            "linear-gradient(135deg,#2e7d32 0%,#43a047 100%)",
                                          boxShadow:
                                            "0 5px 16px rgba(56,142,60,0.5)",
                                          transform: "translateY(-1px)",
                                        },
                                        "&:active": { transform: "scale(.95)" },
                                      }}
                                    >
                                      Xác nhận hoàn tất
                                    </Button>
                                  )}
                                  {/* Nút "Yêu cầu ký lại" được chuyển vào dialog Xem hợp đồng */}
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination for Custom Design Orders (Server-side) */}
                  {ordersTotalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                    >
                      <Pagination
                        count={ordersTotalPages}
                        page={ordersPage}
                        onChange={handleOrdersPageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </Card>
              </>
            )}
          </>
        )}

        {/* NEW: Dialog xác nhận đặt cọc thiết kế bằng tiền mặt */}
        <Dialog
          open={cashDesignDepositDialog.open}
          onClose={
            confirmingCashDesignDeposit
              ? undefined
              : closeCashDesignDepositDialog
          }
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Xác nhận đặt cọc thiết kế (tiền mặt)</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography variant="body2">
                Bạn có chắc chắn muốn xác nhận khách hàng đã thanh toán tiền mặt
                tiền cọc thiết kế cho đơn hàng:
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                {cashDesignDepositDialog.order?.orderCode ||
                  cashDesignDepositDialog.order?.id}
              </Typography>
              <Typography variant="body2">
                Số tiền cọc:{" "}
                <strong>
                  {formatCurrency(
                    cashDesignDepositDialog.order?.depositDesignAmount || 0
                  )}
                </strong>
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={closeCashDesignDepositDialog}
              disabled={confirmingCashDesignDeposit}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmCashDesignDeposit}
              disabled={confirmingCashDesignDeposit}
              startIcon={
                confirmingCashDesignDeposit ? (
                  <CircularProgress size={16} />
                ) : (
                  <AttachMoneyIcon />
                )
              }
            >
              {confirmingCashDesignDeposit ? "Đang xác nhận..." : "Xác nhận"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* NEW: Dialog xác nhận thanh toán đủ thiết kế bằng tiền mặt */}
        <Dialog
          open={cashDesignRemainingDialog.open}
          onClose={
            confirmingCashDesignRemaining
              ? undefined
              : closeCashDesignRemainingDialog
          }
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Xác nhận thanh toán đủ thiết kế (tiền mặt)</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography variant="body2">
                Bạn có chắc chắn muốn xác nhận khách hàng đã thanh toán tiền mặt
                phần còn lại phí thiết kế cho đơn hàng:
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                {cashDesignRemainingDialog.order?.orderCode ||
                  cashDesignRemainingDialog.order?.id}
              </Typography>
              <Typography variant="body2">
                Số tiền còn lại:{" "}
                <strong>
                  {formatCurrency(
                    cashDesignRemainingDialog.order?.remainingDesignAmount || 0
                  )}
                </strong>
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={closeCashDesignRemainingDialog}
              disabled={confirmingCashDesignRemaining}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmCashDesignRemaining}
              disabled={confirmingCashDesignRemaining}
              startIcon={
                confirmingCashDesignRemaining ? (
                  <CircularProgress size={16} />
                ) : (
                  <AttachMoneyIcon />
                )
              }
            >
              {confirmingCashDesignRemaining ? "Đang xác nhận..." : "Xác nhận"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* NEW: Dialog xác nhận đặt cọc thi công bằng tiền mặt */}
        <Dialog
          open={cashConstructionDepositDialog.open}
          onClose={
            confirmingCashConstructionDeposit
              ? undefined
              : closeCashConstructionDepositDialog
          }
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Xác nhận đặt cọc thi công (tiền mặt)</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography variant="body2">
                Bạn có chắc chắn muốn xác nhận khách hàng đã thanh toán tiền mặt
                tiền cọc thi công cho đơn hàng:
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                {cashConstructionDepositDialog.order?.orderCode ||
                  cashConstructionDepositDialog.order?.id}
              </Typography>
              <Typography variant="body2">
                Số tiền cọc thi công:{" "}
                <strong>
                  {formatCurrency(
                    cashConstructionDepositDialog.order
                      ?.depositConstructionAmount || 0
                  )}
                </strong>
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={closeCashConstructionDepositDialog}
              disabled={confirmingCashConstructionDeposit}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmCashConstructionDeposit}
              disabled={confirmingCashConstructionDeposit}
              startIcon={
                confirmingCashConstructionDeposit ? (
                  <CircularProgress size={16} />
                ) : (
                  <AttachMoneyIcon />
                )
              }
            >
              {confirmingCashConstructionDeposit
                ? "Đang xác nhận..."
                : "Xác nhận"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={detailOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          {selectedRequest && (
            <>
              <DialogTitle
                sx={{
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                  color: "white",
                  borderRadius: "12px 12px 0 0",
                  py: 1.5,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      background: "rgba(255, 255, 255, 0.2)",
                      width: 32,
                      height: 32,
                    }}
                  >
                    <BrushIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ fontSize: "1.1rem" }}
                    >
                      Chi tiết yêu cầu thiết kế
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, fontSize: "0.8rem" }}
                    >
                      {selectedRequest.code
                        ? `Mã: ${selectedRequest.code}`
                        : "Chưa có mã"}{" "}
                      • {getCustomerName(selectedRequest.customerDetail)}
                    </Typography>
                  </Box>
                </Stack>
              </DialogTitle>
              <DialogContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {/* Requirements Section */}
                  <Card
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "grey.100",
                        transform: "translateY(-1px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <DescriptionIcon color="primary" fontSize="small" />
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        sx={{ fontSize: "0.95rem" }}
                      >
                        Yêu cầu thiết kế
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "white",
                        borderRadius: 1,
                        transition: "all 0.2s ease",
                        "&:hover": { bgcolor: "grey.50" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ lineHeight: 1.4, fontSize: "0.85rem" }}
                      >
                        {selectedRequest.requirements}
                      </Typography>
                    </Box>
                  </Card>

                  {/* Customer Information */}
                  <Card
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "grey.100",
                        transform: "translateY(-1px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1.5 }}
                    >
                      <BusinessIcon color="primary" fontSize="small" />
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        sx={{ fontSize: "0.95rem" }}
                      >
                        Thông tin khách hàng
                      </Typography>
                    </Stack>
                    <Grid container spacing={1.5}>
                      {[
                        {
                          label: "Tên công ty",
                          value: selectedRequest.customerDetail?.companyName,
                        },
                        {
                          label: "Địa chỉ",
                          value: selectedRequest.customerDetail?.address,
                        },
                        {
                          label: "SĐT",
                          value: selectedRequest.customerDetail?.contactInfo,
                        },
                        {
                          label: "Người liên hệ",
                          value:
                            selectedRequest.customerDetail?.users?.fullName,
                        },
                        {
                          label: "Email",
                          value: selectedRequest.customerDetail?.users?.email,
                        },
                      ].map((item, index) => (
                        <Grid item xs={6} md={2.4} key={index}>
                          <Box
                            sx={{
                              textAlign: "center",
                              p: 1,
                              bgcolor: "white",
                              borderRadius: 1,
                              height: 60,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              transition: "all 0.2s ease",
                              cursor: "default",
                              "&:hover": {
                                bgcolor: "primary.50",
                                transform: "scale(1.02)",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.7rem", mb: 0.3 }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="500"
                              noWrap
                              sx={{ fontSize: "0.8rem" }}
                              title={item.value || "Chưa có"}
                            >
                              {item.value || "Chưa có"}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Card>

                  {/* Financial Information */}
                  <Card
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "grey.100",
                        transform: "translateY(-1px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1.5 }}
                    >
                      <AttachMoneyIcon color="primary" fontSize="small" />
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        sx={{ fontSize: "0.95rem" }}
                      >
                        Thông tin tài chính
                      </Typography>
                    </Stack>
                    <Grid container spacing={1.5}>
                      {[
                        {
                          label: "Tổng tiền",
                          value: formatCurrency(selectedRequest.totalPrice),
                          color: "primary.main",
                        },
                        {
                          label: "Tiền cọc",
                          value: formatCurrency(selectedRequest.depositAmount),
                          color: "success.main",
                        },
                        {
                          label: "Còn lại",
                          value: formatCurrency(
                            selectedRequest.remainingAmount
                          ),
                          color: "info.main",
                        },
                      ].map((item, index) => (
                        <Grid item xs={12} md={4} key={index}>
                          <Box
                            sx={{
                              textAlign: "center",
                              p: 1.5,
                              bgcolor: "white",
                              borderRadius: 1,
                              height: 70,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              transition: "all 0.2s ease",
                              cursor: "default",
                              "&:hover": {
                                bgcolor: "grey.50",
                                transform: "scale(1.02)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.7rem", mb: 0.5 }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color={item.color}
                              sx={{ fontSize: "1rem" }}
                            >
                              {item.value}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Card>

                  {/* Status & Designer in one row */}
                  <Grid container spacing={2}>
                    {/* Status Information */}
                    <Grid
                      item
                      xs={12}
                      md={selectedRequest.assignDesigner ? 6 : 12}
                    >
                      <Card
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          height: "100%",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "grey.100",
                            transform: "translateY(-1px)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: 1.5 }}
                        >
                          <ScheduleIcon color="primary" fontSize="small" />
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            sx={{ fontSize: "0.95rem" }}
                          >
                            Trạng thái
                          </Typography>
                        </Stack>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                textAlign: "center",
                                p: 1,
                                bgcolor: "white",
                                borderRadius: 1,
                                transition: "all 0.2s ease",
                                "&:hover": { bgcolor: "grey.50" },
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: "0.7rem",
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                Ngày tạo
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="500"
                                sx={{ fontSize: "0.8rem" }}
                              >
                                {formatDate(selectedRequest.createdAt)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                textAlign: "center",
                                p: 1,
                                bgcolor: "white",
                                borderRadius: 1,
                                transition: "all 0.2s ease",
                                "&:hover": { bgcolor: "grey.50" },
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: "0.7rem",
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                Trạng thái
                              </Typography>
                              {getStatusChip(selectedRequest.status)}
                            </Box>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>

                    {/* Designer Assignment Section - Always show */}
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          height: "100%",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "grey.100",
                            transform: "translateY(-1px)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: 1.5 }}
                        >
                          {selectedRequest?.assignDesigner ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <PendingIcon color="warning" fontSize="small" />
                          )}
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            sx={{ fontSize: "0.95rem" }}
                          >
                            Designer phụ trách
                          </Typography>
                        </Stack>

                        {selectedRequest?.assignDesigner ? (
                          <Grid container spacing={1}>
                            {[
                              {
                                label: "Tên",
                                value: selectedRequest.assignDesigner.fullName,
                              },
                              {
                                label: "Email",
                                value: selectedRequest.assignDesigner.email,
                              },
                              {
                                label: "SĐT",
                                value: selectedRequest.assignDesigner.phone,
                              },
                            ].map((item, index) => (
                              <Grid item xs={12} key={index}>
                                <Box
                                  sx={{
                                    p: 1,
                                    bgcolor: "white",
                                    borderRadius: 1,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      bgcolor: "success.50",
                                      transform: "translateX(2px)",
                                    },
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: "0.7rem" }}
                                  >
                                    {item.label}:
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight="500"
                                    sx={{ fontSize: "0.8rem", ml: 0.5 }}
                                    component="span"
                                  >
                                    {item.value || "Chưa có"}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              borderRadius: 2,
                              textAlign: "center",
                              border: "1px dashed",
                              borderColor: "warning.main",
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="warning.main"
                              fontWeight="500"
                              sx={{ fontSize: "0.85rem" }}
                            >
                              Chưa được phân công designer
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Designer Selection Section */}
                  {selectedRequest &&
                    (selectedRequest.status === "DEPOSITED" ||
                      selectedRequest.status === "DESIGNER_REJECTED") && (
                      <Card
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "grey.100",
                            transform: "translateY(-1px)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="600"
                          sx={{
                            fontSize: "1rem",
                            mb: 2,
                            color: "primary.main",
                          }}
                        >
                          Giao task thiết kế
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2, fontSize: "0.9rem" }}
                          >
                            Chọn designer để giao task thiết kế:
                          </Typography>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={7}>
                              {loadingDesigners ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    py: 3,
                                    bgcolor: "grey.50",
                                    borderRadius: 2,
                                  }}
                                >
                                  <CircularProgress size={24} sx={{ mr: 2 }} />
                                  <Typography>
                                    Đang tải danh sách designers...
                                  </Typography>
                                </Box>
                              ) : (
                                <FormControl fullWidth>
                                  <Select
                                    value={selectedDesigner || ""}
                                    onChange={(e) =>
                                      setSelectedDesigner(e.target.value)
                                    }
                                    size="medium"
                                    sx={{
                                      height: "64px",
                                      "& .MuiSelect-select": {
                                        py: 2,
                                        px: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        height: "64px",
                                        fontSize: "1rem",
                                      },
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                        height: "64px",
                                      },
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "grey.300",
                                      },
                                      "&:hover .MuiOutlinedInput-notchedOutline":
                                        {
                                          borderColor: "primary.main",
                                        },
                                    }}
                                    displayEmpty
                                    renderValue={(value) => {
                                      const designer = designers.find(
                                        (d) => d.id === value
                                      );
                                      if (!designer) {
                                        return (
                                          <Typography
                                            color="text.secondary"
                                            sx={{ fontSize: "1rem" }}
                                          >
                                            Chọn designer...
                                          </Typography>
                                        );
                                      }
                                      return (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                          }}
                                        >
                                          <Avatar
                                            src={designer.avatar}
                                            sx={{ width: 36, height: 36 }}
                                          >
                                            {designer.fullName
                                              ?.charAt(0)
                                              ?.toUpperCase()}
                                          </Avatar>
                                          <Box>
                                            <Typography
                                              variant="body1"
                                              sx={{
                                                fontSize: "1rem",
                                                fontWeight: "500",
                                              }}
                                            >
                                              {designer.fullName}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      );
                                    }}
                                  >
                                    {designers.length === 0 ? (
                                      <MenuItem disabled>
                                        <Typography color="text.secondary">
                                          Không có designer nào
                                        </Typography>
                                      </MenuItem>
                                    ) : (
                                      designers.map((designer) => (
                                        <MenuItem
                                          key={designer.id}
                                          value={designer.id}
                                          sx={{
                                            py: 2,
                                            px: 2,
                                            "&:hover": {
                                              bgcolor: "primary.50",
                                            },
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 2,
                                              width: "100%",
                                            }}
                                          >
                                            <Avatar
                                              src={designer.avatar}
                                              sx={{ width: 42, height: 42 }}
                                            >
                                              {designer.fullName
                                                ?.charAt(0)
                                                ?.toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                              <Typography
                                                variant="body1"
                                                sx={{
                                                  fontSize: "1rem",
                                                  fontWeight: "500",
                                                  lineHeight: 1.3,
                                                }}
                                              >
                                                {designer.fullName}
                                              </Typography>
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                  fontSize: "0.85rem",
                                                  lineHeight: 1.2,
                                                }}
                                              >
                                                {designer.email}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </MenuItem>
                                      ))
                                    )}
                                  </Select>
                                </FormControl>
                              )}
                            </Grid>

                            <Grid item xs={12} sm={5}>
                              <Button
                                variant="contained"
                                color="success"
                                size="large"
                                disabled={
                                  !selectedDesigner ||
                                  assigningDesigner ||
                                  loadingDesigners
                                }
                                onClick={async () => {
                                  await handleAssignDesigner();
                                  handleCloseDetails();
                                }}
                                fullWidth
                                sx={{
                                  height: "64px",
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                  borderRadius: 2,
                                  textTransform: "none",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    transform: "translateY(-1px)",
                                  },
                                  "&:disabled": {
                                    opacity: 0.6,
                                  },
                                }}
                              >
                                {assigningDesigner
                                  ? "Đang giao task..."
                                  : "Giao task"}
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </Card>
                    )}

                  {/* Form báo giá thống nhất - dùng cho cả PENDING và REJECTED_PRICING */}
                  {selectedRequest &&
                    (selectedRequest.status === "PENDING" ||
                      selectedRequest.status === "REJECTED_PRICING") && (
                      <Card
                        sx={{
                          p: 2,
                          bgcolor:
                            selectedRequest.status === "REJECTED_PRICING"
                              ? "rgba(237, 108, 2, 0.05)"
                              : "rgba(25, 118, 210, 0.05)",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor:
                            selectedRequest.status === "REJECTED_PRICING"
                              ? "warning.main"
                              : "primary.main",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: 1.5 }}
                        >
                          {selectedRequest.status === "REJECTED_PRICING" ? (
                            <RefreshIcon color="warning" fontSize="small" />
                          ) : (
                            <AddIcon color="primary" fontSize="small" />
                          )}
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            sx={{ fontSize: "0.95rem" }}
                            color={
                              selectedRequest.status === "REJECTED_PRICING"
                                ? "warning.main"
                                : "primary.main"
                            }
                          >
                            {selectedRequest.status === "REJECTED_PRICING"
                              ? "Báo giá lại"
                              : "Báo giá"}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="end">
                          <TextField
                            size="small"
                            label={
                              selectedRequest.status === "REJECTED_PRICING"
                                ? "Tổng giá mới (VND)"
                                : "Tổng giá (VND)"
                            }
                            type="number"
                            value={priceForm.totalPrice}
                            onChange={(e) =>
                              setPriceForm((f) => ({
                                ...f,
                                totalPrice: e.target.value,
                              }))
                            }
                            sx={{ flex: 1 }}
                            error={
                              priceForm.totalPrice &&
                              Number(priceForm.totalPrice) < 1000
                            }
                            helperText={
                              priceForm.totalPrice &&
                              Number(priceForm.totalPrice) < 1000
                                ? "Tối thiểu 1.000 VNĐ"
                                : ""
                            }
                          />

                          <TextField
                            size="small"
                            label={
                              selectedRequest.status === "REJECTED_PRICING"
                                ? "Tiền cọc mới (VND)"
                                : "Tiền cọc (VND)"
                            }
                            type="number"
                            value={priceForm.depositAmount}
                            onChange={(e) =>
                              setPriceForm((f) => ({
                                ...f,
                                depositAmount: e.target.value,
                              }))
                            }
                            sx={{ flex: 1 }}
                            error={
                              priceForm.depositAmount &&
                              (Number(priceForm.depositAmount) < 1000 ||
                                (priceForm.totalPrice &&
                                  Number(priceForm.depositAmount) >
                                    Number(priceForm.totalPrice)))
                            }
                            helperText={
                              priceForm.depositAmount &&
                              Number(priceForm.depositAmount) < 1000
                                ? "Tối thiểu 1.000 VNĐ"
                                : priceForm.totalPrice &&
                                  priceForm.depositAmount &&
                                  Number(priceForm.depositAmount) >
                                    Number(priceForm.totalPrice)
                                ? "Cọc không được > tổng giá"
                                : ""
                            }
                          />
                        </Stack>
                      </Card>
                    )}

                  {/* Pricing History Section */}
                  <Card
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "grey.100",
                        transform: "translateY(-1px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1.5 }}
                    >
                      <AttachMoneyIcon color="primary" fontSize="small" />
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        sx={{ fontSize: "0.95rem" }}
                      >
                        Lịch sử báo giá ({priceProposals.length})
                      </Typography>
                    </Stack>

                    {priceProposals.length === 0 ? (
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "white",
                          borderRadius: 2,
                          textAlign: "center",
                          border: "1px dashed",
                          borderColor: "grey.300",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.85rem" }}
                        >
                          Chưa có báo giá nào
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1}>
                        {priceProposals.map((proposal, index) => (
                          <Box
                            key={proposal.id}
                            sx={{
                              p: 2,
                              border: "1px solid",
                              borderColor:
                                proposal.status === "APPROVED"
                                  ? "success.main"
                                  : proposal.status === "REJECTED"
                                  ? "error.main"
                                  : "grey.300",
                              bgcolor: "white",
                              borderRadius: 2,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                borderColor: "primary.main",
                                transform: "translateY(-1px)",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            <Grid container spacing={2} alignItems="center">
                              {/* Báo giá number */}
                              <Grid item xs={12} sm={2}>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                  sx={{ fontSize: "0.9rem" }}
                                >
                                  Báo giá #{index + 1}
                                </Typography>
                              </Grid>

                              {/* Giá gốc */}
                              <Grid item xs={6} sm={2}>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: "0.7rem" }}
                                  >
                                    GIÁ BÁO
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    sx={{ fontSize: "0.85rem" }}
                                  >
                                    {formatCurrency(proposal.totalPrice)}
                                  </Typography>
                                </Box>
                              </Grid>

                              {/* Tiền cọc */}
                              <Grid item xs={6} sm={2}>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: "0.7rem" }}
                                  >
                                    CỌC
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    sx={{ fontSize: "0.85rem" }}
                                  >
                                    {formatCurrency(proposal.depositAmount)}
                                  </Typography>
                                </Box>
                              </Grid>

                              {/* Giá offer (nếu có) */}
                              {proposal.totalPriceOffer && (
                                <Grid item xs={6} sm={2}>
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ fontSize: "0.7rem" }}
                                    >
                                      OFFER
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      fontWeight="bold"
                                      color="warning.main"
                                      sx={{ fontSize: "0.85rem" }}
                                    >
                                      {formatCurrency(proposal.totalPriceOffer)}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}

                              {/* Cọc offer (nếu có) */}
                              {proposal.depositAmountOffer && (
                                <Grid item xs={6} sm={1.5}>
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ fontSize: "0.7rem" }}
                                    >
                                      CỌC OFFER
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      fontWeight="bold"
                                      color="warning.main"
                                      sx={{ fontSize: "0.85rem" }}
                                    >
                                      {formatCurrency(
                                        proposal.depositAmountOffer
                                      )}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}

                              {/* Status */}
                              <Grid
                                item
                                xs={6}
                                sm={proposal.totalPriceOffer ? 1.5 : 2}
                              >
                                <Chip
                                  label={
                                    proposal.status === "PENDING"
                                      ? "Chờ phản hồi"
                                      : proposal.status === "APPROVED"
                                      ? "Đã chấp nhận"
                                      : proposal.status === "REJECTED"
                                      ? "Đã từ chối"
                                      : proposal.status === "NEGOTIATING"
                                      ? "Đang TL"
                                      : proposal.status
                                  }
                                  size="small"
                                  color={
                                    proposal.status === "PENDING"
                                      ? "warning"
                                      : proposal.status === "APPROVED"
                                      ? "success"
                                      : proposal.status === "REJECTED"
                                      ? "error"
                                      : proposal.status === "NEGOTIATING"
                                      ? "info"
                                      : "default"
                                  }
                                  sx={{
                                    fontSize: "0.7rem",
                                    height: 24,
                                    fontWeight: "bold",
                                  }}
                                />
                              </Grid>

                              {/* Date */}
                              <Grid
                                item
                                xs={6}
                                sm={
                                  proposal.totalPriceOffer &&
                                  proposal.depositAmountOffer &&
                                  (proposal.status === "NEGOTIATING" ||
                                    proposal.status === "REJECTED") &&
                                  isLatestProposalWithOffer(proposal)
                                    ? 0.5
                                    : proposal.totalPriceOffer
                                    ? 1
                                    : 2
                                }
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.7rem" }}
                                >
                                  {new Date(
                                    proposal.createdAt
                                  ).toLocaleDateString("vi-VN")}
                                </Typography>
                              </Grid>

                              {/* Action button */}
                              {proposal.status === "PENDING" && (
                                <Grid
                                  item
                                  xs={12}
                                  sm={
                                    proposal.totalPriceOffer &&
                                    proposal.depositAmountOffer
                                      ? 1.5
                                      : 1
                                  }
                                >
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    onClick={() =>
                                      handleOpenUpdateDialog(proposal)
                                    }
                                    startIcon={<EditIcon fontSize="small" />}
                                    sx={{
                                      fontSize: "0.7rem",
                                      py: 0.5,
                                      px: 1,
                                      minWidth: "auto",
                                      transition: "all 0.2s ease",
                                      "&:hover": { transform: "scale(1.05)" },
                                    }}
                                  >
                                    Sửa
                                  </Button>
                                </Grid>
                              )}

                              {/* Nút chấp nhận offer - chỉ hiển thị cho proposal mới nhất có offer và chưa được chấp nhận */}
                              {proposal.totalPriceOffer &&
                                proposal.depositAmountOffer &&
                                (proposal.status === "NEGOTIATING" ||
                                  proposal.status === "REJECTED") &&
                                isLatestProposalWithOffer(proposal) && (
                                  <Grid item xs={12} sm={2}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      onClick={() =>
                                        handleAcceptOffer(proposal)
                                      }
                                      startIcon={
                                        <CheckCircleIcon fontSize="small" />
                                      }
                                      sx={{
                                        fontSize: "0.7rem",
                                        py: 0.5,
                                        px: 1,
                                        minWidth: "auto",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          transform: "scale(1.05)",
                                          bgcolor: "success.dark",
                                        },
                                      }}
                                    >
                                      Chấp nhận offer
                                    </Button>
                                  </Grid>
                                )}
                            </Grid>

                            {/* Lý do từ chối hoặc ghi chú */}
                            {(proposal.rejectionReason ||
                              proposal.negotiationNote) && (
                              <Box
                                sx={{
                                  mt: 1,
                                  pt: 1,
                                  borderTop: "1px dashed",
                                  borderColor: "grey.300",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color={
                                    proposal.status === "REJECTED"
                                      ? "error.main"
                                      : "info.main"
                                  }
                                  sx={{
                                    fontSize: "0.75rem",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {proposal.status === "REJECTED"
                                    ? "Lý do từ chối: "
                                    : "Ghi chú TL: "}
                                  {proposal.rejectionReason ||
                                    proposal.negotiationNote}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Card>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button
                  onClick={handleCloseDetails}
                  variant="outlined"
                  startIcon={<CloseIcon />}
                >
                  Đóng
                </Button>
                {/* Nút báo giá thống nhất - hiện cho cả PENDING và REJECTED_PRICING */}
                {selectedRequest &&
                  (selectedRequest.status === "PENDING" ||
                    selectedRequest.status === "REJECTED_PRICING") && (
                    <Button
                      variant="contained"
                      color={
                        selectedRequest.status === "REJECTED_PRICING"
                          ? "warning"
                          : "primary"
                      }
                      onClick={handleCreateProposal}
                      disabled={
                        creatingProposal ||
                        !priceForm.totalPrice ||
                        !priceForm.depositAmount ||
                        Number(priceForm.totalPrice) < 1000 ||
                        Number(priceForm.depositAmount) < 1000 ||
                        Number(priceForm.depositAmount) >
                          Number(priceForm.totalPrice)
                      }
                      startIcon={
                        creatingProposal ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : selectedRequest.status === "REJECTED_PRICING" ? (
                          <RefreshIcon />
                        ) : (
                          <AddIcon />
                        )
                      }
                    >
                      {creatingProposal
                        ? "Đang tạo..."
                        : selectedRequest.status === "REJECTED_PRICING"
                        ? "BÁO GIÁ LẠI"
                        : "BÁO GIÁ"}
                    </Button>
                  )}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Dialog cập nhật lại giá */}
        <Dialog
          open={updateDialog.open}
          onClose={handleCloseUpdateDialog}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "primary.main",
              color: "white",
              py: 2,
            }}
          >
            <EditIcon />
            <Typography variant="h6" fontWeight="600">
              Cập nhật giá báo
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 5, pb: 1 }}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                label="Tổng giá mới"
                type="number"
                fullWidth
                size="small"
                value={updateForm.totalPrice}
                onChange={(e) =>
                  setUpdateForm((f) => ({
                    ...f,
                    totalPrice: e.target.value,
                  }))
                }
                InputProps={{
                  inputProps: { min: 1000 },
                  startAdornment: (
                    <Typography sx={{ mr: 1, color: "primary.main" }}>
                      VND
                    </Typography>
                  ),
                }}
                error={
                  !updateForm.totalPrice || Number(updateForm.totalPrice) < 1000
                }
                helperText={
                  !updateForm.totalPrice
                    ? "Vui lòng nhập tổng giá mới"
                    : Number(updateForm.totalPrice) < 1000
                    ? "Tổng giá phải ≥ 1.000 VNĐ"
                    : ""
                }
              />

              <TextField
                label="Tiền cọc mới"
                type="number"
                fullWidth
                size="small"
                value={updateForm.depositAmount}
                onChange={(e) =>
                  setUpdateForm((f) => ({
                    ...f,
                    depositAmount: e.target.value,
                  }))
                }
                InputProps={{
                  inputProps: { min: 1000 },
                  startAdornment: (
                    <Typography sx={{ mr: 1, color: "primary.main" }}>
                      VND
                    </Typography>
                  ),
                }}
                error={
                  !updateForm.depositAmount ||
                  Number(updateForm.depositAmount) < 1000 ||
                  (updateForm.totalPrice &&
                    Number(updateForm.depositAmount) >
                      Number(updateForm.totalPrice))
                }
                helperText={
                  !updateForm.depositAmount
                    ? "Vui lòng nhập tiền cọc mới"
                    : Number(updateForm.depositAmount) < 1000
                    ? "Tiền cọc phải ≥ 1.000 VNĐ"
                    : updateForm.totalPrice &&
                      Number(updateForm.depositAmount) >
                        Number(updateForm.totalPrice)
                    ? "Tiền cọc không được > tổng giá"
                    : ""
                }
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              onClick={handleCloseUpdateDialog}
              variant="outlined"
              size="small"
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateSubmit}
              variant="contained"
              size="small"
              disabled={
                actionLoading ||
                !updateForm.totalPrice ||
                !updateForm.depositAmount ||
                Number(updateForm.totalPrice) < 1000 ||
                Number(updateForm.depositAmount) < 1000 ||
                Number(updateForm.depositAmount) > Number(updateForm.totalPrice)
              }
              startIcon={
                actionLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <EditIcon sx={{ fontSize: 16 }} />
                )
              }
            >
              {actionLoading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog này đã được xóa vì trùng lặp với dialog bên dưới */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleCloseConfirmDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "warning.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" color="warning.main">
                !
              </Typography>
            </Box>
            {confirmDialog.title}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {confirmDialog.message}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseConfirmDialog}
              variant="outlined"
              disabled={actionLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmAction}
              variant="contained"
              color="warning"
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={16} /> : null}
            >
              {actionLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
        <Dialog
          open={contractDialog.open}
          onClose={handleCloseContractDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {(() => {
              // Hiển thị orderCode nếu có (ưu tiên), fallback ID
              const orderLabel =
                contractDialog.orderCode ||
                contractDialog.contract?.orderCode ||
                contractDialog.orderId;
              return `Thông tin hợp đồng - Đơn hàng ${
                orderLabel ? "#" + orderLabel : ""
              }`;
            })()}
            <IconButton
              aria-label="close"
              onClick={handleCloseContractDialog}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {contractDialog.contract ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Chi tiết hợp đồng
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID hợp đồng
                    </Typography>
                    <Typography variant="body1">
                      {contractDialog.contract.id}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Số hợp đồng
                    </Typography>
                    <Typography variant="body1">
                      {contractDialog.contract.contractNumber || "N/A"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    {(() => {
                      const status = contractDialog.contract.status;
                      // Bản đồ dịch trạng thái hợp đồng sang tiếng Việt
                      const viMap = {
                        SENT: "Đã gửi",
                        SIGNED: "Đã ký",
                        REVISED: "Đã chỉnh sửa",
                        RESIGNED: "Đã ký lại",
                        PENDING: "Đang chờ",
                        DISCUSSING: "Đang thảo luận",
                        NEED_RESIGNED: "Cần ký lại",
                        CONFIRMED: "Đã xác nhận",
                      };
                      const chipLabel = viMap[status] || status;
                      let chipColor = "default";
                      if (status === "SIGNED") chipColor = "success";
                      else if (status === "SENT") chipColor = "info";
                      else if (status === "DISCUSSING") chipColor = "warning";
                      else if (status === "NEED_RESIGNED")
                        chipColor = "warning";
                      else if (status === "RESIGNED") chipColor = "secondary";
                      else if (status === "CONFIRMED") chipColor = "success";
                      return (
                        <Chip
                          label={chipLabel}
                          color={chipColor}
                          size="small"
                        />
                      );
                    })()}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày gửi
                    </Typography>
                    <Typography variant="body1">
                      {contractDialog.contract.sentDate
                        ? new Date(
                            contractDialog.contract.sentDate
                          ).toLocaleString("vi-VN")
                        : "N/A"}
                    </Typography>
                  </Grid>

                  {contractDialog.contract.signedDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Ngày ký
                      </Typography>
                      <Typography variant="body1">
                        {new Date(
                          contractDialog.contract.signedDate
                        ).toLocaleString("vi-VN")}
                      </Typography>
                    </Grid>
                  )}

                  {contractDialog.contract.depositPercentChanged && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tỷ lệ đặt cọc thay đổi
                      </Typography>
                      <Typography variant="body1">
                        {contractDialog.contract.depositPercentChanged}%
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {/* Hợp đồng gốc */}
                {contractDialog.contract.contractUrl && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      border: 1,
                      borderColor: "primary.main",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      📄 Hợp đồng gốc
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        handleViewContractFile(
                          contractDialog.contract.contractUrl,
                          "original"
                        )
                      }
                      disabled={contractViewLoading}
                      startIcon={
                        contractViewLoading ? (
                          <CircularProgress size={16} />
                        ) : null
                      }
                    >
                      {contractViewLoading ? "Đang tải..." : "Xem hợp đồng gốc"}
                    </Button>
                  </Box>
                )}

                {/* Hợp đồng đã ký */}
                {contractDialog.contract.signedContractUrl && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: 1,
                      borderColor: "success.main",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      ✅ Hợp đồng đã ký
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() =>
                        handleViewContractFile(
                          contractDialog.contract.signedContractUrl,
                          "signed"
                        )
                      }
                      disabled={contractViewLoading}
                      startIcon={
                        contractViewLoading ? (
                          <CircularProgress size={16} />
                        ) : null
                      }
                    >
                      {contractViewLoading
                        ? "Đang tải..."
                        : "Xem hợp đồng đã ký"}
                    </Button>
                    {/* Yêu cầu ký lại nằm trong dialog nếu hợp đồng ở trạng thái đã ký trong hệ thống */}
                    {selectedOrder &&
                      selectedOrder.status === "CONTRACT_SIGNED" && (
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() => handleContractResign(selectedOrder.id)}
                          sx={{
                            ml: 2,
                            textTransform: "none",
                            fontSize: "0.7rem",
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.6,
                            background:
                              "linear-gradient(135deg,#ed6c02 0%,#ff9800 100%)",
                            color: "#222",
                            boxShadow: "0 3px 10px rgba(237,108,2,0.35)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg,#d35400 0%,#fb8c00 100%)",
                              boxShadow: "0 5px 16px rgba(237,108,2,0.5)",
                              transform: "translateY(-1px)",
                            },
                            "&:active": { transform: "scale(.95)" },
                          }}
                        >
                          Yêu cầu ký lại
                        </Button>
                      )}
                  </Box>
                )}

                {/* Status information */}
                <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {contractDialog.contract.status === "SIGNED" &&
                      "✅ Hợp đồng đã được ký thành công!"}
                    {contractDialog.contract.status === "SENT" &&
                      "📤 Hợp đồng đã được gửi, đang chờ khách hàng ký."}
                    {contractDialog.contract.status === "DISCUSSING" &&
                      "💬 Hợp đồng đang trong quá trình thảo luận."}
                    {contractDialog.contract.status === "NEED_RESIGNED" &&
                      "🔄 Hợp đồng cần được ký lại."}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography color="text.secondary">
                  Chưa có hợp đồng cho đơn hàng này
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseContractDialog}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Order Details Dialog */}
        <Dialog
          open={orderDetailOpen}
          onClose={handleCloseOrderDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              position: "relative",
            }}
          >
            Chi tiết đơn hàng - {selectedOrder?.orderCode || selectedOrder?.id}
            <IconButton
              aria-label="close"
              onClick={handleCloseOrderDetails}
              sx={{ position: "absolute", right: 8, top: 8, color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {loadingOrderDetails ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : selectedOrder ? (
              <Box>
                {/* Order Information */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                    onClick={() => setOrderInfoExpanded(!orderInfoExpanded)}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Thông tin đơn hàng
                    </Typography>
                    <IconButton size="small">
                      <ExpandMoreIcon
                        sx={{
                          transform: orderInfoExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    </IconButton>
                  </Box>

                  {orderInfoExpanded && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Mã đơn hàng
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.orderCode || selectedOrder.id}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Loại đơn hàng
                        </Typography>
                        <Chip
                          label={
                            selectedOrder.orderType ===
                            "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                              ? "Thiết kế tùy chỉnh có thi công"
                              : selectedOrder.orderType ===
                                "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"
                              ? "Thiết kế tùy chỉnh không thi công"
                              : selectedOrder.orderType === "AI_DESIGN"
                              ? "Thiết kế AI"
                              : selectedOrder.orderType
                          }
                          color={
                            selectedOrder.orderType ===
                            "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                              ? "success"
                              : selectedOrder.orderType ===
                                "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"
                              ? "info"
                              : "primary"
                          }
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Trạng thái
                        </Typography>
                        <Chip
                          label={
                            ORDER_STATUS_MAP[selectedOrder.status]?.label ||
                            selectedOrder.status
                          }
                          color={
                            ORDER_STATUS_MAP[selectedOrder.status]?.color ||
                            "default"
                          }
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngày tạo
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedOrder.createdAt)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.address || "Chưa có địa chỉ"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ghi chú
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.note || "Không có ghi chú"}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Box>

                {/* Customer Information */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                    onClick={() =>
                      setCustomerInfoExpanded(!customerInfoExpanded)
                    }
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Thông tin khách hàng
                    </Typography>
                    <IconButton size="small">
                      <ExpandMoreIcon
                        sx={{
                          transform: customerInfoExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    </IconButton>
                  </Box>

                  {customerInfoExpanded && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Họ tên
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.users?.fullName || "Chưa có thông tin"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.users?.email || "Chưa có thông tin"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.users?.phone || "Chưa có thông tin"}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Box>

                {/* Detailed Financial Breakdown */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                    onClick={() =>
                      setFinancialInfoExpanded(!financialInfoExpanded)
                    }
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Thông tin tài chính
                    </Typography>
                    <IconButton size="small">
                      <ExpandMoreIcon
                        sx={{
                          transform: financialInfoExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    </IconButton>
                  </Box>

                  {financialInfoExpanded && (
                    <Box sx={{ mt: 2 }}>
                      {/* Thiết kế */}
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        gutterBottom
                        sx={{ mt: 2, color: "primary.main", mb: 1 }}
                      >
                        Chi phí thiết kế
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                          <Card
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "grey.300",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight="medium"
                            >
                              Tổng tiền thiết kế
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              {formatCurrency(
                                selectedOrder.totalDesignAmount || 0
                              )}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Card
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "grey.300",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight="medium"
                            >
                              Tiền cọc thiết kế
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              {formatCurrency(
                                selectedOrder.depositDesignAmount || 0
                              )}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Card
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "grey.300",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight="medium"
                            >
                              Tiền còn lại thiết kế
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              {formatCurrency(
                                selectedOrder.remainingDesignAmount || 0
                              )}
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>

                      {/* Thi công */}
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        gutterBottom
                        sx={{ mt: 2, color: "success.main", mb: 1 }}
                      >
                        Chi phí thi công
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                          <Card
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "grey.300",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight="medium"
                            >
                              Tổng tiền thi công
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              {formatCurrency(
                                selectedOrder.totalConstructionAmount || 0
                              )}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Card
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "grey.300",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight="medium"
                            >
                              Tiền cọc thi công
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              {formatCurrency(
                                selectedOrder.depositConstructionAmount || 0
                              )}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Card
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "grey.300",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight="medium"
                            >
                              Tiền còn lại thi công
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              {formatCurrency(
                                selectedOrder.remainingConstructionAmount || 0
                              )}
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>

                      {/* Tổng hợp đơn hàng */}
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        gutterBottom
                        sx={{ mt: 2, color: "warning.main", mb: 1 }}
                      >
                        Tổng tiền đơn hàng
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                          <Card
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "grey.300",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight="medium"
                            >
                              Tổng tiền đơn hàng
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              {formatCurrency(
                                selectedOrder.totalOrderAmount || 0
                              )}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Card
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "grey.300",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight="medium"
                            >
                              Tiền cọc đơn hàng
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              {formatCurrency(
                                selectedOrder.totalOrderDepositAmount || 0
                              )}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Card
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "grey.300",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight="medium"
                            >
                              Tiền còn lại đơn hàng
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="text.primary"
                            >
                              {formatCurrency(
                                selectedOrder.totalOrderRemainingAmount || 0
                              )}
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>

                {/* Order Details */}
                {orderDetails && orderDetails.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        "&:hover": { bgcolor: "grey.100" },
                      }}
                      onClick={() =>
                        setOrderDetailsExpanded(!orderDetailsExpanded)
                      }
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        Chi tiết đơn hàng ({orderDetails.length} mục)
                      </Typography>
                      <IconButton size="small">
                        <ExpandMoreIcon
                          sx={{
                            transform: orderDetailsExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      </IconButton>
                    </Box>

                    {orderDetailsExpanded && (
                      <Box sx={{ mt: 2 }}>
                        {orderDetails.map((detail, index) => (
                          <Box
                            key={detail.id || index}
                            sx={{
                              mb: 3,
                              p: 2,
                              border: "1px solid",
                              borderColor: "grey.300",
                              borderRadius: 2,
                              bgcolor: "grey.25",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              gutterBottom
                              color="text.primary"
                            >
                              Chi tiết #{index + 1}
                            </Typography>

                            {/* Custom Design Request Information */}
                            {detail.customDesignRequests && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  gutterBottom
                                  fontWeight="medium"
                                >
                                  Yêu cầu thiết kế
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {detail.customDesignRequests.requirements}
                                </Typography>

                                {/* Customer Detail */}
                                {detail.customDesignRequests.customerDetail && (
                                  <Box
                                    sx={{
                                      mt: 1,
                                      p: 1.5,
                                      bgcolor: "grey.50",
                                      borderRadius: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      color="text.secondary"
                                      fontWeight="medium"
                                    >
                                      Thông tin khách hàng:
                                    </Typography>
                                    <Typography variant="body2">
                                      Công ty:{" "}
                                      {
                                        detail.customDesignRequests
                                          .customerDetail.companyName
                                      }
                                    </Typography>
                                    <Typography variant="body2">
                                      Địa chỉ:{" "}
                                      {
                                        detail.customDesignRequests
                                          .customerDetail.address
                                      }
                                    </Typography>
                                    <Typography variant="body2">
                                      Liên hệ:{" "}
                                      {
                                        detail.customDesignRequests
                                          .customerDetail.contactInfo
                                      }
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            )}

                            {/* Customer Choice Histories */}
                            {detail.customerChoiceHistories && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  gutterBottom
                                  fontWeight="medium"
                                >
                                  Lịch sử lựa chọn
                                </Typography>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    bgcolor: "grey.50",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography variant="body2">
                                    Loại sản phẩm:{" "}
                                    {
                                      detail.customerChoiceHistories
                                        .productTypeName
                                    }
                                  </Typography>
                                  <Typography variant="body2">
                                    Công thức tính:{" "}
                                    {
                                      detail.customerChoiceHistories
                                        .calculateFormula
                                    }
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    Tổng tiền:{" "}
                                    {formatCurrency(
                                      detail.customerChoiceHistories.totalAmount
                                    )}
                                  </Typography>
                                </Box>

                                {/* Attribute Selections */}
                                {detail.customerChoiceHistories
                                  .attributeSelections &&
                                  detail.customerChoiceHistories
                                    .attributeSelections.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                        gutterBottom
                                        fontWeight="medium"
                                      >
                                        Thuộc tính đã chọn:
                                      </Typography>
                                      {detail.customerChoiceHistories.attributeSelections.map(
                                        (attr, attrIndex) => (
                                          <Box
                                            key={attrIndex}
                                            sx={{
                                              ml: 2,
                                              mb: 1,
                                              p: 1,
                                              bgcolor: "grey.50",
                                              borderRadius: 1,
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              fontWeight="bold"
                                            >
                                              {attr.attribute}: {attr.value}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              color="text.secondary"
                                            >
                                              Đơn vị: {attr.unit} | Giá:{" "}
                                              {formatCurrency(attr.unitPrice)} |
                                              Tổng:{" "}
                                              {formatCurrency(attr.subTotal)}
                                            </Typography>
                                          </Box>
                                        )
                                      )}
                                    </Box>
                                  )}

                                {/* Size Selections */}
                                {detail.customerChoiceHistories
                                  .sizeSelections &&
                                  detail.customerChoiceHistories.sizeSelections
                                    .length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                        gutterBottom
                                        fontWeight="medium"
                                      >
                                        Kích thước:
                                      </Typography>
                                      <Box
                                        sx={{
                                          p: 1,
                                          bgcolor: "grey.50",
                                          borderRadius: 1,
                                        }}
                                      >
                                        {detail.customerChoiceHistories.sizeSelections.map(
                                          (size, sizeIndex) => (
                                            <Typography
                                              key={sizeIndex}
                                              variant="body2"
                                              sx={{ ml: 2 }}
                                            >
                                              {size.size}: {size.value}
                                            </Typography>
                                          )
                                        )}
                                      </Box>
                                    </Box>
                                  )}
                              </Box>
                            )}

                            {/* Financial Details */}
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                                fontWeight="medium"
                              >
                                Chi tiết tài chính
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                Số lượng: {detail.quantity}
                              </Typography>

                              {/* Chi tiết chi phí thiết kế */}
                              {detail.detailDesignAmount && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    p: 1.5,
                                    bgcolor: "grey.100",
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: "grey.300",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.primary"
                                    fontWeight="bold"
                                  >
                                    💰 Chi phí thiết kế:{" "}
                                    {formatCurrency(detail.detailDesignAmount)}
                                  </Typography>
                                </Box>
                              )}

                              {/* Chi tiết chi phí thi công */}
                              {detail.detailConstructionAmount && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    p: 1.5,
                                    bgcolor: "blue.50",
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: "blue.200",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.primary"
                                    fontWeight="bold"
                                  >
                                    🏗️ Chi phí thi công:{" "}
                                    {formatCurrency(
                                      detail.detailConstructionAmount
                                    )}
                                  </Typography>
                                </Box>
                              )}

                              {/* Chi tiết chi phí vật liệu nếu có */}
                              {detail.detailMaterialAmount && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    p: 1.5,
                                    bgcolor: "orange.50",
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: "orange.200",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.primary"
                                    fontWeight="bold"
                                  >
                                    📦 Chi phí vật liệu:{" "}
                                    {formatCurrency(
                                      detail.detailMaterialAmount
                                    )}
                                  </Typography>
                                </Box>
                              )}

                              {/* Tổng chi phí chi tiết */}
                              <Box
                                sx={{
                                  mt: 2,
                                  p: 2,
                                  bgcolor: "grey.100",
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "grey.400",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  gutterBottom
                                >
                                  Tổng chi phí chi tiết:
                                </Typography>
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  color="text.primary"
                                >
                                  {formatCurrency(
                                    (detail.detailDesignAmount || 0) +
                                      (detail.detailConstructionAmount || 0) +
                                      (detail.detailMaterialAmount || 0)
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Update Status Section (ẩn nếu trạng thái trước đàm phán hoặc từ đàm phán trở đi theo yêu cầu mới) */}

                {selectedOrder &&
                  ![
                    "PENDING_CONTRACT",
                    "CONTRACT_SENT",
                    "CONTRACT_DISCUSS",
                    "CONTRACT_SIGNED",
                    "CONTRACT_RESIGNED",
                    "CONTRACT_CONFIRMED",
                    "IN_PROGRESS",
                    "PENDING_DESIGN",
                    "NEED_DEPOSIT_DESIGN",
                    "DEPOSITED_DESIGN",
                    "NEED_FULLY_PAID_DESIGN",
                    "WAITING_FINAL_DESIGN",
                    "DESIGN_COMPLETED",
                  ].includes(selectedOrder.status) && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Trạng thái đơn hàng
                      </Typography>

                      {/* <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Chuyển đến trạng thái:

                      </Typography> */}

                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Chuyển đến trạng thái:
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 2,
                          }}
                        >
                          {/* Contract Phase */}
                          {[
                            "PENDING_CONTRACT",
                            "CONTRACT_SENT",
                            "CONTRACT_DISCUSS",
                            "CONTRACT_SIGNED",
                            "CONTRACT_RESIGNED",
                          ].includes(selectedOrder.status) && (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                width: "100%",
                              }}
                            >
                              <Typography variant="subtitle2" color="primary">
                                Giai đoạn hợp đồng:
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                {/* Đã ẩn nút tải lên hợp đồng cho trạng thái PENDING_CONTRACT theo yêu cầu */}

                                {selectedOrder.status === "CONTRACT_SENT" && (
                                  <>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          selectedOrder.id,
                                          "CONTRACT_SIGNED"
                                        )
                                      }
                                    >
                                      Đã ký hợp đồng
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="secondary"
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          selectedOrder.id,
                                          "CONTRACT_DISCUSS"
                                        )
                                      }
                                    >
                                      Đàm phán hợp đồng
                                    </Button>
                                  </>
                                )}

                                {selectedOrder.status ===
                                  "CONTRACT_DISCUSS" && (
                                  <>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      size="small"
                                      startIcon={
                                        fetchingContract ? (
                                          <CircularProgress size={16} />
                                        ) : (
                                          <CloudUploadIcon />
                                        )
                                      }
                                      disabled={
                                        actionLoading || fetchingContract
                                      }
                                      onClick={() =>
                                        getContractIdForOrder(selectedOrder.id)
                                      }
                                      sx={{ mr: 1 }}
                                    >
                                      {fetchingContract
                                        ? "Đang tải..."
                                        : "Upload hợp đồng chỉnh sửa"}
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          selectedOrder.id,
                                          "CONTRACT_RESIGNED"
                                        )
                                      }
                                    >
                                      Ký lại hợp đồng
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          selectedOrder.id,
                                          "CONTRACT_CONFIRMED"
                                        )
                                      }
                                    >
                                      Xác nhận hợp đồng
                                    </Button>
                                  </>
                                )}

                                {selectedOrder.status === "CONTRACT_SIGNED" && (
                                  <>
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() =>
                                        handleContractSigned(selectedOrder.id)
                                      }
                                    >
                                      {actionLoading ? (
                                        <CircularProgress
                                          size={16}
                                          color="inherit"
                                        />
                                      ) : (
                                        "Xác nhận hợp đồng"
                                      )}
                                    </Button>

                                    {/* Nút xem hợp đồng */}
                                    <Button
                                      variant="outlined"
                                      color="info"
                                      size="small"
                                      disabled={contractViewLoading}
                                      onClick={() =>
                                        handleViewContract(selectedOrder.id)
                                      }
                                      startIcon={
                                        contractViewLoading ? (
                                          <CircularProgress size={16} />
                                        ) : (
                                          <VisibilityIcon />
                                        )
                                      }
                                      sx={{ ml: 1 }}
                                    >
                                      {contractViewLoading
                                        ? "Đang tải..."
                                        : "Xem hợp đồng"}
                                    </Button>

                                    {/* Nút yêu cầu gửi lại hợp đồng */}
                                    <Button
                                      variant="outlined"
                                      color="warning"
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() =>
                                        handleContractResign(selectedOrder.id)
                                      }
                                      sx={{ ml: 1 }}
                                    >
                                      {actionLoading ? (
                                        <CircularProgress
                                          size={16}
                                          color="inherit"
                                        />
                                      ) : (
                                        "Yêu cầu gửi lại hợp đồng"
                                      )}
                                    </Button>
                                  </>
                                )}

                                {selectedOrder.status ===
                                  "CONTRACT_RESIGNED" && (
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleUpdateOrderStatus(
                                        selectedOrder.id,
                                        "CONTRACT_CONFIRMED"
                                      )
                                    }
                                  >
                                    Xác nhận hợp đồng
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          )}

                          {/* Production Phase */}
                          {[
                            "CONTRACT_CONFIRMED",
                            "DEPOSITED",
                            "IN_PROGRESS",
                            "PRODUCING",
                          ].includes(selectedOrder.status) && (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                width: "100%",
                              }}
                            >
                              <Typography variant="subtitle2" color="primary">
                                Giai đoạn sản xuất:
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                {selectedOrder.status ===
                                  "CONTRACT_CONFIRMED" && (
                                  <>
                                    <Button
                                      variant="contained"
                                      color="warning"
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          selectedOrder.id,
                                          "DEPOSITED"
                                        )
                                      }
                                    >
                                      Đã đặt cọc
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          selectedOrder.id,
                                          "IN_PROGRESS"
                                        )
                                      }
                                    >
                                      Bắt đầu thực hiện
                                    </Button>
                                  </>
                                )}

                                {selectedOrder.status === "DEPOSITED" && (
                                  <>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          selectedOrder.id,
                                          "IN_PROGRESS"
                                        )
                                      }
                                    >
                                      Bắt đầu thực hiện
                                    </Button>
                                  </>
                                )}

                                {selectedOrder.status === "IN_PROGRESS" && (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleUpdateOrderStatus(
                                        selectedOrder.id,
                                        "PRODUCING"
                                      )
                                    }
                                  >
                                    Đang sản xuất
                                  </Button>
                                )}

                                {selectedOrder.status === "PRODUCING" && (
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleUpdateOrderStatus(
                                        selectedOrder.id,
                                        "PRODUCTION_COMPLETED"
                                      )
                                    }
                                  >
                                    Hoàn thành sản xuất
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          )}

                          {/* Delivery Phase */}
                          {[
                            "PRODUCTION_COMPLETED",
                            "DELIVERING",
                            "INSTALLED",
                          ].includes(selectedOrder.status) && (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                width: "100%",
                              }}
                            >
                              <Typography variant="subtitle2" color="primary">
                                Giai đoạn giao hàng:
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                {selectedOrder.status ===
                                  "PRODUCTION_COMPLETED" && (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleUpdateOrderStatus(
                                        selectedOrder.id,
                                        "DELIVERING"
                                      )
                                    }
                                  >
                                    Đang giao hàng
                                  </Button>
                                )}

                                {selectedOrder.status === "DELIVERING" && (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleUpdateOrderStatus(
                                        selectedOrder.id,
                                        "INSTALLED"
                                      )
                                    }
                                  >
                                    Đã lắp đặt
                                  </Button>
                                )}

                                {selectedOrder.status === "INSTALLED" && (
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleUpdateOrderStatus(
                                        selectedOrder.id,
                                        "COMPLETED"
                                      )
                                    }
                                  >
                                    Hoàn tất
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          )}

                          {/* Đã loại bỏ nút Hủy đơn hàng theo yêu cầu */}
                        </Box>
                      </Paper>
                    </Box>
                  )}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography color="text.secondary">
                  Không thể tải thông tin chi tiết đơn hàng
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOrderDetails}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Contractor List Dialog */}
        <ContractorListDialog
          open={contractorDialog.open}
          onClose={handleCloseContractorDialog}
          contractors={contractors}
          order={contractorDialog.order}
          onReportDelivery={handleReportDelivery}
        />

        {/* Component Upload Contract Dialog - Đồng nhất với DashboardContent.jsx */}
        <UploadContractDialog
          open={openContractUpload}
          onClose={() => setOpenContractUpload(false)}
          orderId={selectedOrder?.id}
          onUploadSuccess={handleContractUploadSuccess}
        />

        {/* Component Upload Revised Contract Dialog - Đồng nhất với DashboardContent.jsx */}
        <UploadRevisedContractDialog
          open={openRevisedContractUpload}
          onClose={() => {
            setOpenRevisedContractUpload(false);
            setContractId(null);
          }}
          orderId={selectedOrder?.id}
          onUploadSuccess={handleRevisedContractUploadSuccess}
        />
      </Container>
    </LocalizationProvider>
  );
};

// Component Upload Contract Dialog - Đồng nhất với DashboardContent.jsx
const UploadContractDialog = memo(
  ({ open, onClose, orderId, onUploadSuccess }) => {
    const dispatch = useDispatch();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [depositPercent, setDepositPercent] = useState(10); // Mặc định 10%
    const [contractNumber, setContractNumber] = useState(""); // Số hợp đồng

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Kiểm tra định dạng file (chỉ cho phép PDF)
        if (file.type !== "application/pdf") {
          setError("Vui lòng chọn file PDF");
          return;
        }

        // Kiểm tra kích thước file (tối đa 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError("Kích thước file không được vượt quá 10MB");
          return;
        }

        setSelectedFile(file);
        setError(null);
      }
    };

    const handleDepositPercentChange = (event) => {
      const value = parseFloat(event.target.value);
      if (isNaN(value) || value < 0 || value > 100) {
        setError("Phần trăm cọc phải từ 0% đến 100%");
        return;
      }
      setDepositPercent(value);
      setError(null);
    };

    const handleContractNumberChange = (event) => {
      setContractNumber(event.target.value);
      setError(null);
    };

    const handleUpload = async () => {
      if (!selectedFile) {
        setError("Vui lòng chọn file hợp đồng");
        return;
      }

      if (depositPercent < 0 || depositPercent > 100) {
        setError("Phần trăm cọc phải từ 0% đến 100%");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("contactFile", selectedFile); // Theo API spec: contactFile
        formData.append("depositPercentChanged", depositPercent.toString());
        formData.append("contractNumber", contractNumber.trim()); // Sử dụng giá trị Sale nhập

        // Sử dụng API upload contract từ contractService
        const response = await uploadOrderContractApi(orderId, formData);

        if (response.success) {
          // Thông báo thành công và refresh danh sách
          onUploadSuccess();
          handleClose();
        } else {
          setError(response.error || "Có lỗi xảy ra khi tải lên hợp đồng");
        }
      } catch (error) {
        setError(
          error?.response?.data?.message || "Có lỗi xảy ra khi tải lên hợp đồng"
        );
      } finally {
        setUploading(false);
      }
    };

    const handleClose = () => {
      setSelectedFile(null);
      setError(null);
      setUploading(false);
      setDepositPercent(10); // Reset về mặc định 10%
      setContractNumber(""); // Reset số hợp đồng
      onClose();
    };

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UploadIcon color="primary" />
            <Typography variant="h6">Tải lên hợp đồng</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Chọn file hợp đồng (định dạng PDF, tối đa 10MB)
            </Typography>

            {/* Trường nhập phần trăm cọc */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <TextField
                label="Phần trăm cọc (%)"
                type="number"
                value={depositPercent}
                onChange={handleDepositPercentChange}
                fullWidth
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.1,
                }}
                helperText="Nhập phần trăm tiền cọc (mặc định 10%)"
                sx={{ mb: 2 }}
              />

              <TextField
                label="Số hợp đồng"
                type="text"
                value={contractNumber}
                onChange={handleContractNumberChange}
                fullWidth
                placeholder="Nhập số hợp đồng (tùy chọn)"
                helperText="Số hợp đồng để quản lý và tra cứu"
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ mt: 2, mb: 2 }}>
              <input
                accept=".pdf"
                style={{ display: "none" }}
                id="contract-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="contract-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 1 }}
                  fullWidth
                >
                  Chọn file hợp đồng
                </Button>
              </label>

              {selectedFile && (
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    bgcolor: "success.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "success.200",
                  }}
                >
                  <Typography variant="body2" color="success.main">
                    ✓ Đã chọn file: {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                    MB
                  </Typography>
                </Box>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
            startIcon={
              uploading ? <CircularProgress size={20} /> : <UploadIcon />
            }
          >
            {uploading ? "Đang tải lên..." : "Tải lên"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

UploadContractDialog.displayName = "UploadContractDialog";

// Component Upload Revised Contract Dialog - Đồng nhất với DashboardContent.jsx
const UploadRevisedContractDialog = memo(
  ({ open, onClose, orderId, onUploadSuccess }) => {
    const dispatch = useDispatch();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [depositPercent, setDepositPercent] = useState(10); // Mặc định 10%

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Kiểm tra định dạng file (chỉ cho phép PDF)
        if (file.type !== "application/pdf") {
          setError("Vui lòng chọn file PDF");
          return;
        }

        // Kiểm tra kích thước file (tối đa 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError("Kích thước file không được vượt quá 10MB");
          return;
        }

        setSelectedFile(file);
        setError(null);
      }
    };

    const handleDepositPercentChange = (event) => {
      const value = parseFloat(event.target.value);
      if (isNaN(value) || value < 0 || value > 100) {
        setError("Phần trăm cọc phải từ 0% đến 100%");
        return;
      }
      setDepositPercent(value);
      setError(null);
    };

    const handleUpload = async () => {
      if (!selectedFile) {
        setError("Vui lòng chọn file hợp đồng đã chỉnh sửa");
        return;
      }

      if (depositPercent < 0 || depositPercent > 100) {
        setError("Phần trăm cọc phải từ 0% đến 100%");
        return;
      }

      setUploading(true);
      try {
        // Lấy thông tin hợp đồng từ orderId để có contractId
        const contractResponse = await getOrderContractApi(orderId);
        if (!contractResponse.success) {
          setError("Không thể lấy thông tin hợp đồng để gửi lại");
          setUploading(false);
          return;
        }

        const contractId = contractResponse.data.id;
        const formData = new FormData();
        formData.append("contactFile", selectedFile); // Theo API spec: contactFile
        formData.append("depositPercentChanged", depositPercent.toString());

        // Sử dụng API upload revised contract từ contractService
        const response = await uploadRevisedContractApi(contractId, formData);

        if (response.success) {
          // Thông báo thành công và refresh danh sách
          onUploadSuccess();
          handleClose();
        } else {
          setError(
            response.error || "Có lỗi xảy ra khi tải lên hợp đồng đã chỉnh sửa"
          );
        }
      } catch (error) {
        setError(
          error?.response?.data?.message ||
            "Có lỗi xảy ra khi tải lên hợp đồng đã chỉnh sửa"
        );
      } finally {
        setUploading(false);
      }
    };

    const handleClose = () => {
      setSelectedFile(null);
      setError(null);
      setUploading(false);
      setDepositPercent(10); // Reset về mặc định 10%
      onClose();
    };

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UploadIcon color="warning" />
            <Typography variant="h6">Gửi lại hợp đồng đã chỉnh sửa</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Tải lên hợp đồng đã chỉnh sửa theo yêu cầu thảo luận của khách
              hàng
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Chọn file hợp đồng (định dạng PDF, tối đa 10MB)
            </Typography>

            {/* Trường nhập phần trăm cọc */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <TextField
                label="Phần trăm cọc (%)"
                type="number"
                value={depositPercent}
                onChange={handleDepositPercentChange}
                fullWidth
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.1,
                }}
                helperText="Nhập phần trăm tiền cọc (mặc định 10%)"
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ mt: 2, mb: 2 }}>
              <input
                accept=".pdf"
                style={{ display: "none" }}
                id="revised-contract-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="revised-contract-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 1 }}
                  fullWidth
                  color="warning"
                >
                  Chọn file hợp đồng đã chỉnh sửa
                </Button>
              </label>

              {selectedFile && (
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    bgcolor: "warning.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "warning.200",
                  }}
                >
                  <Typography variant="body2" color="warning.main">
                    ✓ Đã chọn file: {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                    MB
                  </Typography>
                </Box>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="warning"
            disabled={!selectedFile || uploading}
            startIcon={
              uploading ? <CircularProgress size={20} /> : <UploadIcon />
            }
          >
            {uploading ? "Đang gửi lại..." : "Gửi lại hợp đồng"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

UploadRevisedContractDialog.displayName = "UploadRevisedContractDialog";

export default CustomerRequests;
