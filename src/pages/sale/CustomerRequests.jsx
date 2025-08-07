import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import {
  fetchAllDesignRequests,
  selectAllDesignRequests,
  selectStatus,
  selectError,
  assignDesignerToRequest,
  updateRequestStatus,
  CUSTOM_DESIGN_STATUS_MAP,
} from "../../store/features/customeDesign/customerDesignSlice";

import { getUsersByRoleApi } from "../../api/userService";
import { createProposal } from "../../store/features/price/priceSlice";
import {
  getPriceProposals,
  updatePriceProposalPricing,
} from "../../api/priceService";
import orderService from "../../api/orderService";
import {
  contractResignOrder,
  contractSignedOrder,
  fetchOrders,
  ORDER_STATUS_MAP,
  selectOrderError,
  selectOrders,
  selectOrdersByType,
  selectOrderStatus,
  updateOrderEstimatedDeliveryDate,
} from "../../store/features/order/orderSlice";

import { fetchAllContractors } from "../../store/features/contractor/contractorSlice";

import ContractUploadForm from "../../components/ContractUploadForm";
import S3Avatar from "../../components/S3Avatar";
import UploadRevisedContract from "../../components/UploadRevisedContract";
import { getOrderContractApi } from "../../api/contractService";
import { getPresignedUrl } from "../../api/s3Service";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// Component ContractorListDialog
const ContractorListDialog = ({ open, onClose, contractors, order, generateOrderCode, onReportDelivery }) => {
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedContractorId(null);
      setEstimatedDeliveryDate(null);
    }
  }, [open]);

  // Set Vietnamese locale for dayjs
  useEffect(() => {
    dayjs.locale('vi');
  }, []);

  const handleSubmit = async () => {
    if (!selectedContractorId || !estimatedDeliveryDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Format the date as LocalDateTime in ISO format
      // Set time to 09:00:00 for delivery date
      const deliveryDateTime = estimatedDeliveryDate.hour(9).minute(0).second(0);
      const formattedDateTime = deliveryDateTime.format('YYYY-MM-DDTHH:mm:ss');
      
      console.log('Formatted delivery date:', formattedDateTime);
      await onReportDelivery(order.id, formattedDateTime, selectedContractorId);
      onClose();
    } catch (error) {
      console.error('Error reporting delivery date:', error);
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
              Báo ngày giao dự kiến - Đơn hàng {order ? (order.orderCode || order.id) : '#N/A'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {contractors && contractors.length > 0 ? (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Chọn nhà thầu và báo ngày giao dự kiến cho đơn hàng {order ? (order.orderCode || order.id) : '#N/A'} ({contractors.length} nhà thầu có sẵn)
                </Typography>
                
                {/* Date Picker */}
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Ngày giao dự kiến
                  </Typography>
                  <DatePicker
                    label="Chọn ngày giao hàng"
                    value={estimatedDeliveryDate}
                    onChange={(newValue) => setEstimatedDeliveryDate(newValue)}
                    minDate={dayjs().add(1, 'day')}
                    format="DD/MM/YYYY"
                    sx={{ width: '100%' }}
                    slotProps={{
                      textField: {
                        helperText: 'Vui lòng chọn ngày giao hàng dự kiến (định dạng: Ngày/Tháng/Năm)'
                      }
                    }}
                  />
                </Box>

                <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ mt: 3 }}>
                  Chọn nhà thầu thực hiện
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {contractors.map((contractor) => (
                    <Grid item xs={12} md={6} key={contractor.id}>
                      <Card
                        elevation={selectedContractorId === contractor.id ? 4 : 2}
                        sx={{
                          borderRadius: 3,
                          border: "2px solid",
                          borderColor: selectedContractorId === contractor.id ? "info.main" : "divider",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            boxShadow: 4,
                            transform: "translateY(-2px)",
                            borderColor: selectedContractorId === contractor.id ? "info.main" : "warning.main",
                          },
                        }}
                        onClick={() => setSelectedContractorId(contractor.id)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          {/* Header */}
                          <Box
                            sx={{
                              background: selectedContractorId === contractor.id 
                                ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
                                : "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
                              borderRadius: 2,
                              p: 2,
                              mb: 2,
                              position: 'relative'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: contractor.isInternal ? "success.main" : "info.main",
                                }}
                              />
                              <Typography variant="h6" color="text.primary" fontWeight="bold">
                                {contractor.name}
                              </Typography>
                              <Chip
                                label={contractor.isInternal ? "Nội bộ" : "Bên ngoài"}
                                size="small"
                                color={contractor.isInternal ? "success" : "info"}
                                sx={{ ml: "auto", fontWeight: "medium" }}
                              />
                            </Box>
                          </Box>

                          {/* Thông tin chi tiết */}
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Địa chỉ
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {contractor.address}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Số điện thoại
                                </Typography>
                                <Typography variant="body2" fontWeight="medium" color="primary.main">
                                  {contractor.phone}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Email
                                </Typography>
                                <Typography variant="body2" fontWeight="medium" color="primary.main">
                                  {contractor.email}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Trạng thái availability */}
                          <Box sx={{ mt: 2, textAlign: "center" }}>
                            <Chip
                              label={contractor.isAvailable ? "Có sẵn" : "Không có sẵn"}
                              color={contractor.isAvailable ? "success" : "error"}
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
                  Chưa có nhà thầu nào để báo ngày giao
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hiện tại chưa có nhà thầu nào có sẵn để báo ngày giao dự kiến cho đơn hàng này
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
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <ShippingIcon />}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Báo ngày giao dự kiến'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

const CustomerRequests = () => {
  const dispatch = useDispatch();
  const designRequests = useSelector(selectAllDesignRequests);
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
  const [contractId, setContractId] = useState(null);
  const [fetchingContract, setFetchingContract] = useState(false);
  const allOrders = useSelector(selectOrders);
  // Filter chỉ lấy custom design orders (không phải AI design)
  const customDesignOrderTypes = [
    'CUSTOM_DESIGN_WITH_CONSTRUCTION',
    'CUSTOM_DESIGN_WITHOUT_CONSTRUCTION'
  ];
  const orders = useSelector(state => selectOrdersByType(state, customDesignOrderTypes));
  
  // Debug: Log order type breakdown
  useEffect(() => {
    if (currentTab === 1 && allOrders.length > 0) {
      const orderTypeCount = allOrders.reduce((acc, order) => {
        acc[order.orderType] = (acc[order.orderType] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Order type breakdown:', orderTypeCount);
      console.log('Total orders from API:', allOrders.length);
      console.log('Custom design orders (filtered):', orders.length);
      console.log('Custom design order types:', customDesignOrderTypes);
    }
  }, [currentTab, allOrders, orders, customDesignOrderTypes]);
  
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
  const [selectedOrderStatus, setSelectedOrderStatus] =
    useState(""); // Mặc định là tất cả trạng thái
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

  const [selectedStatus, setSelectedStatus] = useState(""); // Mặc định là tất cả trạng thái

  const [priceProposals, setPriceProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [contractDialog, setContractDialog] = useState({
    open: false,
    contract: null,
    orderId: null,
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
    if (currentTab === 0) {
      dispatch(
        fetchAllDesignRequests({ status: selectedStatus, page: 1, size: 1000 })
      );
    }
  }, [currentTab, dispatch, selectedStatus]);

  useEffect(() => {
    if (currentTab === 1) {
      // Thêm memoization để tránh fetch quá nhiều lần
      const controller = new AbortController();
      const signal = controller.signal;

      dispatch(
        fetchOrders({
          orderStatus: selectedOrderStatus,
          page: 1,
          size: 1000,
          signal,
        })
      );

      // Cleanup function để hủy fetch nếu component re-render
      return () => {
        controller.abort();
      };
    }
  }, [currentTab, selectedOrderStatus]);

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
        dispatch(
          fetchOrders({
            orderStatus: selectedOrderStatus,
            page: 1,
            size: 1000,
          })
        );

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
            await dispatch(
              fetchOrders({
                orderStatus: selectedOrderStatus,
                page: 1,
                size: 1000,
              })
            );

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
        setContractDialog({
          open: true,
          contract: response.data,
          orderId: orderId,
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
        dispatch(
          fetchOrders({
            orderStatus: selectedOrderStatus,
            page: 1,
            size: 1000,
          })
        );

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
        setTimeout(() => {
          dispatch(
            fetchOrders({
              orderStatus: selectedOrderStatus,
              page: 1,
              size: 1000,
            })
          );
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
      setTimeout(() => {
        dispatch(
          fetchOrders({
            orderStatus: selectedOrderStatus,
            page: 1,
            size: 1000,
          })
        );
      }, 300);
    }, 0);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  const handleOrderStatusChange = (e) => {
    setSelectedOrderStatus(e.target.value);
  };
  const handleViewOrderDetails = async (order) => {
    console.log("Order data structure:", order);
    setSelectedOrder(order);
    setOrderDetailOpen(true);
    
    // Fetch order details
    setLoadingOrderDetails(true);
    try {
      const response = await orderService.get(`/api/orders/${order.id}/details`);
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

        // Sử dụng Redux dispatch thay vì gọi fetchCustomDesignOrders
        dispatch(
          fetchOrders({
            orderStatus: selectedOrderStatus,
            page: 1,
            size: 1000,
          })
        );

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
    const order = orders.find(o => o.id === orderId);
    
    // Nếu đơn hàng ở trạng thái DEPOSITED, lấy danh sách contractors và mở dialog
    if (order && order.status === 'DEPOSITED') {
      try {
        await dispatch(fetchAllContractors()).unwrap();
        console.log('Đã lấy danh sách contractors cho đơn hàng DEPOSITED');
        
        // Mở dialog hiển thị danh sách nhà thầu
        setContractorDialog({
          open: true,
          order: order,
        });
        
        return; // Không gọi handleViewOrderDetails gốc cho trạng thái DEPOSITED
      } catch (error) {
        console.error('Lỗi khi lấy danh sách contractors:', error);
        setNotification({
          open: true,
          message: "Có lỗi khi tải danh sách nhà thầu",
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
  const handleReportDelivery = async (orderId, estimatedDeliveryDate, contractorId) => {
    try {
      console.log('Báo ngày giao dự kiến:', { orderId, estimatedDeliveryDate, contractorId });
      
      await dispatch(updateOrderEstimatedDeliveryDate({
        orderId,
        estimatedDeliveryDate,
        contractorId
      })).unwrap();

      setNotification({
        open: true,
        message: "Báo ngày giao dự kiến thành công!",
        severity: "success",
      });

      // Refresh danh sách orders để cập nhật thông tin mới
      dispatch(
        fetchOrders({
          orderStatus: selectedOrderStatus,
          page: 1,
          size: 1000,
        })
      );

    } catch (error) {
      console.error('Lỗi khi báo ngày giao dự kiến:', error);
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
        setDesigners(response.data);
      } else {
        console.error("Failed to fetch designers:", response.error);
      }
    } catch (error) {
      console.error("Error fetching designers:", error);
    } finally {
      setLoadingDesigners(false);
    }
  };

  // Removed pagination handler since we're displaying all items

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setSelectedDesigner(request.assignDesigner || "");
    setDetailOpen(true);

    // Fetch designers when dialog opens
    fetchDesigners();
  };

  const handleCloseDetails = React.useCallback(() => {
    setDetailOpen(false);
    setSelectedRequest(null);
    // setComment("");
    setSelectedDesigner("");
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
        // Refresh data after assignment
        dispatch(
          fetchAllDesignRequests({
            status: selectedStatus,
            page: 1,
            size: 1000,
          })
        );

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

        // Refresh data
        dispatch(
          fetchAllDesignRequests({
            status: selectedStatus,
            page: 1,
            size: 1000,
          })
        );

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

        // Refresh data after rejection
        dispatch(
          fetchAllDesignRequests({
            status: selectedStatus,
            page: 1,
            size: 1000,
          })
        );

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={config.label}
            color={config.color}
            size="small"
            sx={{ fontWeight: 500 }}
          />
          <Chip
            label="Cần xử lý"
            color="warning"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500, fontSize: "0.7rem" }}
          />
        </Box>
      );
    }

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
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
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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
        handleCloseDetails();
        // Có thể reload lại danh sách đơn thiết kế nếu muốn
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
    } else {
      setNotification({
        open: true,
        message: res.error || "Cập nhật giá thất bại",
        severity: "error",
      });
    }
    setActionLoading(false);
  };

  if (status === "loading" && designRequests.length === 0) {
    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "60vh",
        gap: 2
      }}>
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
        <Alert severity="error">Lỗi tải dữ liệu: {error}</Alert>
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
                background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"25\" cy=\"25\" r=\"1\" fill=\"white\" opacity=\"0.1\"/><circle cx=\"75\" cy=\"75\" r=\"1\" fill=\"white\" opacity=\"0.1\"/><circle cx=\"50\" cy=\"10\" r=\"0.5\" fill=\"white\" opacity=\"0.1\"/><circle cx=\"10\" cy=\"60\" r=\"0.5\" fill=\"white\" opacity=\"0.1\"/><circle cx=\"90\" cy=\"40\" r=\"0.5\" fill=\"white\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>')",
                opacity: 0.3,
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ position: "relative", zIndex: 1 }}>
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
                  Theo dõi và quản lý các yêu cầu thiết kế tùy chỉnh, đơn hàng thiết kế thủ công
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
                  {!status.includes("loading") && designRequests.length > 0 && (
                    <Badge
                      badgeContent={designRequests.length}
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Stack>
              } 
            />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <OrderIcon />
                  <span>Đơn hàng thiết kế tùy chỉnh</span>
                  {!orderLoading && orders.length > 0 && (
                    <Badge
                      badgeContent={orders.length}
                      color="warning"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Stack>
              }
            />
          </Tabs>
        </Card>
        {currentTab === 0 ? (
          <>
            {/* Filter Section */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <FilterIcon color="primary" />
                <Typography variant="h6" fontWeight="medium">
                  Bộ lọc
                </Typography>
              </Stack>
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel id="status-filter-label">Lọc theo trạng thái</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={selectedStatus}
                  label="Lọc theo trạng thái"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  startAdornment={
                    <Box sx={{ mr: 1 }}>
                      <Chip 
                        size="small" 
                        label={designRequests.length} 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                  }
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value="PENDING">Chờ xác nhận</MenuItem>
                  <MenuItem value="PRICING_NOTIFIED">Đã báo giá</MenuItem>
                  <MenuItem value="REJECTED_PRICING">Từ chối báo giá</MenuItem>
                  <MenuItem value="APPROVED_PRICING">Đã duyệt giá</MenuItem>
                  <MenuItem value="DEPOSITED">Đã đặt cọc</MenuItem>
                  <MenuItem value="ASSIGNED_DESIGNER">Đã giao designer</MenuItem>
                  <MenuItem value="PROCESSING">Đang thiết kế</MenuItem>
                  <MenuItem value="DESIGNER_REJECTED">Designer từ chối</MenuItem>
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
            </Card>

            {/* Content Section */}
            {designRequests.length === 0 && status === "succeeded" ? (
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>
                  <BrushIcon sx={{ fontSize: 64, color: "grey.400" }} />
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Chưa có yêu cầu thiết kế nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hiện tại không có yêu cầu thiết kế nào phù hợp với bộ lọc đã chọn
                </Typography>
              </Card>
            ) : (
              <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: "#030C20" }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                          Mã yêu cầu
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                          Khách hàng
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                          Công ty
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                          Yêu cầu
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                          Ngày tạo
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                          Tổng tiền
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                          Trạng thái
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", textAlign: "center", color: "white" }}>
                          Thao tác
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {designRequests.map((request, index) => (
                        <TableRow 
                          key={request.id}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                              transition: 'background-color 0.2s ease'
                            },
                            '&:nth-of-type(even)': { 
                              backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              {request.code || "Chưa có mã"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <S3Avatar 
                                s3Key={request.customerDetail?.users?.avatar}
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  fontSize: "0.8rem"
                                }}
                              >
                                {getCustomerName(request.customerDetail).charAt(0).toUpperCase()}
                              </S3Avatar>
                              <Typography variant="body2" fontWeight="medium">
                                {getCustomerName(request.customerDetail)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {request.customerDetail?.companyName || "Chưa có thông tin"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={request.requirements} placement="top">
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  maxWidth: 200, 
                                  overflow: "hidden", 
                                  textOverflow: "ellipsis", 
                                  whiteSpace: "nowrap" 
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
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
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
                                  '&:hover': { 
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    transform: 'scale(1.1)',
                                    transition: 'all 0.2s ease'
                                  }
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
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Filter Section */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <FilterIcon color="primary" />
                <Typography variant="h6" fontWeight="medium">
                  Bộ lọc đơn hàng
                </Typography>
              </Stack>
              <FormControl size="small" sx={{ minWidth: 300 }}>
                <InputLabel id="order-status-filter-label">
                  Lọc theo trạng thái đơn hàng
                </InputLabel>
                <Select
                  labelId="order-status-filter-label"
                  value={selectedOrderStatus}
                  label="Lọc theo trạng thái đơn hàng"
                  onChange={handleOrderStatusChange}
                  startAdornment={
                    <Box sx={{ mr: 1 }}>
                      <Chip 
                        size="small" 
                        label={orders.length} 
                        color="warning" 
                        variant="outlined"
                      />
                    </Box>
                  }
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value="PENDING_DESIGN">Chờ thiết kế</MenuItem>
                  <MenuItem value="NEED_DEPOSIT_DESIGN">Cần đặt cọc thiết kế</MenuItem>
                  <MenuItem value="DEPOSITED_DESIGN">Đã đặt cọc thiết kế</MenuItem>
                  <MenuItem value="NEED_FULLY_PAID_DESIGN">Cần thanh toán đủ thiết kế</MenuItem>
                  <MenuItem value="WAITING_FINAL_DESIGN">Chờ thiết kế cuối</MenuItem>
                  <MenuItem value="DESIGN_COMPLETED">Hoàn thành thiết kế</MenuItem>
                  <MenuItem value="PENDING_CONTRACT">Chờ hợp đồng</MenuItem>
                  <MenuItem value="CONTRACT_SENT">Đã gửi hợp đồng</MenuItem>
                  <MenuItem value="CONTRACT_SIGNED">Đã ký hợp đồng</MenuItem>
                  <MenuItem value="CONTRACT_DISCUSS">Đàm phán hợp đồng</MenuItem>
                  <MenuItem value="CONTRACT_RESIGNED">Từ chối hợp đồng</MenuItem>
                  <MenuItem value="CONTRACT_CONFIRMED">Xác nhận hợp đồng</MenuItem>
                  <MenuItem value="DEPOSITED">Đã đặt cọc</MenuItem>
                  <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                  <MenuItem value="PRODUCING">Đang sản xuất</MenuItem>
                  <MenuItem value="PRODUCTION_COMPLETED">Hoàn thành sản xuất</MenuItem>
                  <MenuItem value="DELIVERING">Đang giao hàng</MenuItem>
                  <MenuItem value="INSTALLED">Đã lắp đặt</MenuItem>
                  <MenuItem value="ORDER_COMPLETED">Hoàn tất đơn hàng</MenuItem>
                  <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Card>

            {/* Content Section */}
            {orders.length === 0 ? (
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>
                  <OrderIcon sx={{ fontSize: 64, color: "grey.400" }} />
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Chưa có đơn hàng nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Không tìm thấy đơn hàng nào với trạng thái đã chọn
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
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                            Mã đơn hàng
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                            Khách hàng
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                            Địa chỉ
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                            Loại đơn hàng
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                            Ngày tạo
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                            Tổng tiền
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                            Trạng thái
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", textAlign: "center", color: "white" }}>
                            Thao tác
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow 
                            key={order.id}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                transition: 'background-color 0.2s ease'
                              },
                              '&:nth-of-type(even)': { 
                                backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                              }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold" color="primary.main">
                                {order.orderCode || order.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <S3Avatar 
                                  s3Key={order.users?.avatar}
                                  sx={{ 
                                    width: 32, 
                                    height: 32,
                                    fontSize: "0.8rem"
                                  }}
                                >
                                  {(order.users?.fullName || "K").charAt(0).toUpperCase()}
                                </S3Avatar>
                                <Typography variant="body2" fontWeight="medium">
                                  {order.users?.fullName || "Chưa có thông tin"}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={order.address || "Chưa có địa chỉ"} placement="top">
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    maxWidth: 200, 
                                    overflow: "hidden", 
                                    textOverflow: "ellipsis", 
                                    whiteSpace: "nowrap" 
                                  }}
                                >
                                  {order.address || "Chưa có địa chỉ"}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  order.orderType === "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                                    ? "Thiết kế tùy chỉnh có thi công"
                                    : order.orderType === "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"
                                    ? "Thiết kế tùy chỉnh không thi công"
                                    : order.orderType === "AI_DESIGN"
                                    ? "Thiết kế AI"
                                    : order.orderType
                                }
                                color={
                                  order.orderType === "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                                    ? "success"
                                    : order.orderType === "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"
                                    ? "info"
                                    : "primary"
                                }
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(order.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold" color="primary.main">
                                {formatCurrency(order.totalOrderAmount || order.totalAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip 
                                title={order.status === "DEPOSITED" ? "Báo ngày giao dự kiến" : "Xem chi tiết"} 
                                placement="top"
                              >
                                <IconButton
                                  color="primary"
                                  onClick={() => handleViewDetail(order.id)}
                                  sx={{ 
                                    '&:hover': { 
                                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                      transform: 'scale(1.1)',
                                      transition: 'all 0.2s ease'
                                    }
                                  }}
                                >
                                  {order.status === "DEPOSITED" ? <ShippingIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </>
            )}
          </>
        )}

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
              <DialogTitle sx={{ 
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                color: "white",
                borderRadius: "12px 12px 0 0"
              }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar 
                    sx={{ 
                      background: "rgba(255, 255, 255, 0.2)",
                      width: 40,
                      height: 40
                    }}
                  >
                    <BrushIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Chi tiết yêu cầu thiết kế
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {getCustomerName(selectedRequest.customerDetail)}
                    </Typography>
                  </Box>
                </Stack>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Requirements Section */}
                  <Grid item xs={12}>
                    <Card sx={{ p: 2, background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <DescriptionIcon color="primary" />
                        <Typography variant="h6" fontWeight="medium">
                          Yêu cầu thiết kế
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {selectedRequest.requirements}
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Customer Information */}
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, height: "100%" }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <BusinessIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight="medium">
                          Thông tin công ty
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {selectedRequest.customerDetail?.companyName || "Chưa có thông tin"}
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Financial Information */}
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, height: "100%" }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <AttachMoneyIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight="medium">
                          Thông tin tài chính
                        </Typography>
                      </Stack>
                      <Stack spacing={1}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Tổng tiền:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary.main">
                            {formatCurrency(selectedRequest.totalPrice)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Tiền cọc:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {formatCurrency(selectedRequest.depositAmount)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Còn lại:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="info.main">
                            {formatCurrency(selectedRequest.remainingAmount)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  {/* Designer Assignment Section */}
                  {selectedRequest &&
                    selectedRequest.status === "ASSIGNED_DESIGNER" && (
                      <Grid item xs={12}>
                        <Card sx={{ p: 2, background: "linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)" }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Chip 
                              label="Đã giao task" 
                              color="success" 
                              icon={<CheckCircleIcon />}
                              sx={{ fontWeight: 600 }}
                            />
                            <Typography variant="body1" fontWeight="medium">
                              Designer phụ trách:{" "}
                              <Typography component="span" color="primary.main" fontWeight="bold">
                                {(() => {
                                  const d = designers.find(
                                    (d) =>
                                      d.id ===
                                      selectedRequest.assignDesigner.fullName
                                  );
                                  return d
                                    ? d.fullName
                                    : selectedRequest.assignDesigner.fullName ||
                                        "Chưa rõ";
                                })()}
                              </Typography>
                            </Typography>
                          </Stack>
                        </Card>
                      </Grid>
                    )}

                  {/* Designer Selection Section */}
                  {selectedRequest &&
                    (selectedRequest.status === "DEPOSITED" ||
                      selectedRequest.status === "DESIGNER_REJECTED") && (
                      <Grid item xs={12}>
                        <Card sx={{ p: 2, background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)" }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <AssignmentIcon color="warning" />
                            <Typography variant="h6" fontWeight="medium">
                              Giao designer
                            </Typography>
                          </Stack>
                          <FormControl fullWidth>
                            <InputLabel id="designer-select-label">
                              Chọn designer
                            </InputLabel>
                            <Select
                              labelId="designer-select-label"
                              id="designer-select"
                              value={selectedDesigner}
                              label="Chọn designer"
                              onChange={(e) =>
                                setSelectedDesigner(e.target.value)
                              }
                              disabled={loadingDesigners}
                            >
                              <MenuItem value="">
                                <em>Chọn designer...</em>
                              </MenuItem>
                              {designers.map((designer) => (
                                <MenuItem key={designer.id} value={designer.id}>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar
                                      src={designer.avatar}
                                      sx={{ width: 32, height: 32 }}
                                    >
                                      {designer.fullName?.charAt(0) || "D"}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight="medium">
                                      {designer.fullName}
                                    </Typography>
                                  </Stack>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {loadingDesigners && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 2,
                              }}
                            >
                              <CircularProgress size={24} />
                            </Box>
                          )}
                        </Card>
                      </Grid>
                    )}

                  {/* Pricing Section */}
                  <Grid item xs={12}>
                    <Card sx={{ p: 2, background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)" }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <AttachMoneyIcon color="primary" />
                        <Typography variant="h6" fontWeight="medium">
                          Báo giá
                        </Typography>
                      </Stack>
                      
                      {priceProposals.length > 0 ? (
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Tổng giá đã báo
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {formatCurrency(priceProposals[0].totalPrice)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Tiền cọc đã báo
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                {formatCurrency(priceProposals[0].depositAmount)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      ) : (
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Tổng giá (VND)"
                              type="number"
                              value={priceForm.totalPrice}
                              onChange={(e) =>
                                setPriceForm((f) => ({
                                  ...f,
                                  totalPrice: e.target.value,
                                }))
                              }
                              InputProps={{ 
                                inputProps: { min: 0 },
                                startAdornment: <AttachMoneyIcon color="action" sx={{ mr: 1 }} />
                              }}
                              sx={{ bgcolor: "white", borderRadius: 1 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Tiền cọc (VND)"
                              type="number"
                              value={priceForm.depositAmount}
                              onChange={(e) =>
                                setPriceForm((f) => ({
                                  ...f,
                                  depositAmount: e.target.value,
                                }))
                              }
                              InputProps={{ 
                                inputProps: { min: 0 },
                                startAdornment: <AttachMoneyIcon color="action" sx={{ mr: 1 }} />
                              }}
                              sx={{ bgcolor: "white", borderRadius: 1 }}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Card>
                  </Grid>

                  {/* Pricing History Section */}
                  <Grid item xs={12}>
                    <Card sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <ScheduleIcon color="primary" />
                        <Typography variant="h6" fontWeight="medium">
                          Lịch sử báo giá
                        </Typography>
                      </Stack>
                      
                      {loadingProposals ? (
                        <Box display="flex" justifyContent="center" py={3}>
                          <CircularProgress />
                        </Box>
                      ) : priceProposals.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                          <AttachMoneyIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            Chưa có báo giá nào
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          {priceProposals.map((proposal) => (
                            <Card 
                              key={proposal.id}
                              sx={{ 
                                p: 2, 
                                border: "1px solid",
                                borderColor: "grey.200",
                                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
                              }}
                            >
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Tổng giá:
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                                    {formatCurrency(proposal.totalPrice)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Tiền cọc:
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold" color="success.main">
                                    {formatCurrency(proposal.depositAmount)}
                                  </Typography>
                                </Grid>
                                {proposal.totalPriceOffer && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Giá offer:
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                                      {formatCurrency(proposal.totalPriceOffer)}
                                    </Typography>
                                  </Grid>
                                )}
                                {proposal.depositAmountOffer && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Cọc offer:
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                                      {formatCurrency(proposal.depositAmountOffer)}
                                    </Typography>
                                  </Grid>
                                )}
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Trạng thái:
                                  </Typography>
                                  <Chip 
                                    label={proposal.status} 
                                    size="small" 
                                    color={proposal.status === "PENDING" ? "warning" : "default"}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Ngày báo giá:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {new Date(proposal.createAt).toLocaleString("vi-VN")}
                                  </Typography>
                                </Grid>
                              </Grid>
                              
                              {/* Action Buttons */}
                              {(proposal.status === "PENDING" || proposal.status === "NEGOTIATING") && (
                                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                                  <Button
                                    variant={proposal.status === "PENDING" ? "outlined" : "contained"}
                                    color="primary"
                                    size="small"
                                    onClick={() => handleOpenUpdateDialog(proposal)}
                                    disabled={actionLoading}
                                    startIcon={<RefreshIcon />}
                                  >
                                    Cập nhật lại giá
                                  </Button>
                                </Box>
                              )}
                            </Card>
                          ))}
                        </Stack>
                      )}
                    </Card>
                  </Grid>
                    {/* Dialog cập nhật lại giá */}
                    <Dialog
                      open={updateDialog.open}
                      onClose={handleCloseUpdateDialog}
                    >
                      <DialogTitle>Cập nhật lại giá báo</DialogTitle>
                      <DialogContent>
                        <TextField
                          label="Tổng giá mới (VND)"
                          type="number"
                          fullWidth
                          margin="normal"
                          value={updateForm.totalPrice}
                          onChange={(e) =>
                            setUpdateForm((f) => ({
                              ...f,
                              totalPrice: e.target.value,
                            }))
                          }
                        />
                        <TextField
                          label="Tiền cọc mới (VND)"
                          type="number"
                          fullWidth
                          margin="normal"
                          value={updateForm.depositAmount}
                          onChange={(e) =>
                            setUpdateForm((f) => ({
                              ...f,
                              depositAmount: e.target.value,
                            }))
                          }
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseUpdateDialog}>Hủy</Button>
                        <Button
                          onClick={handleUpdateSubmit}
                          variant="contained"
                          color="primary"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            "Cập nhật"
                          )}
                        </Button>
                      </DialogActions>
                    </Dialog>
                  {selectedRequest &&
                    selectedRequest.status === "FULLY_PAID" && (
                      <Grid item xs={12}>
                        <Alert
                          severity="warning"
                          icon={<PendingIcon />}
                          sx={{ mt: 2 }}
                        >
                          Đơn hàng đã được thanh toán đầy đủ. Vui lòng chuyển
                          sang trạng thái "Chờ gửi hợp đồng" để tiếp tục quy
                          trình.
                        </Alert>
                      </Grid>
                    )}
                </Grid>
              </DialogContent>
              <DialogActions>
                {selectedRequest && selectedRequest.status === "FULLY_PAID" && (
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={actionLoading}
                    onClick={handleSetPendingContract}
                    startIcon={
                      actionLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : null
                    }
                  >
                    Chờ gửi hợp đồng
                  </Button>
                )}
                <Button onClick={handleCloseDetails}>Đóng</Button>
                {/* Nút báo giá chỉ hiện khi chưa có proposal */}
                {priceProposals.length === 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateProposal}
                    disabled={creatingProposal}
                  >
                    {creatingProposal ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Báo giá"
                    )}
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleRejectRequest}
                  disabled={rejectingRequest}
                  startIcon={
                    rejectingRequest ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CancelIcon />
                    )
                  }
                >
                  {rejectingRequest ? "Đang từ chối..." : "Từ chối"}
                </Button>
                {/* Nút giao task chỉ hiện khi request có status là DEPOSITED hoặc DESIGNER_REJECTED */}
                {selectedRequest &&
                  (selectedRequest.status === "DEPOSITED" ||
                    selectedRequest.status === "DESIGNER_REJECTED") && (
                    <Button
                      variant="contained"
                      color="success"
                      disabled={
                        !selectedDesigner ||
                        assigningDesigner ||
                        loadingDesigners
                      }
                      onClick={async () => {
                        await handleAssignDesigner();
                        handleCloseDetails(); // Đóng dialog sau khi giao task thành công
                      }}
                      startIcon={
                        assigningDesigner ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : null
                      }
                    >
                      {assigningDesigner
                        ? "Đang giao..."
                        : "Giao task thiết kế"}
                    </Button>
                  )}
              </DialogActions>
              {assignmentError && (
                <Box sx={{ px: 3, pb: 2 }}>
                  <Alert severity="error">{assignmentError}</Alert>
                </Box>
              )}
            </>
          )}
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
        <ContractUploadForm
          open={openContractUpload}
          handleClose={() => setOpenContractUpload(false)}
          orderId={selectedOrder?.id}
          onSuccess={handleContractUploadSuccess}
        />
        <UploadRevisedContract
          open={openRevisedContractUpload}
          onClose={() => {
            setOpenRevisedContractUpload(false);
            setContractId(null);
          }}
          contractId={contractId}
          onSuccess={handleRevisedContractUploadSuccess}
        />
        <Dialog
          open={contractDialog.open}
          onClose={handleCloseContractDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Thông tin hợp đồng - Đơn hàng #{contractDialog.orderId}
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
                    <Chip
                      label={contractDialog.contract.status}
                      color={
                        contractDialog.contract.status === "SIGNED"
                          ? "success"
                          : contractDialog.contract.status === "SENT"
                          ? "info"
                          : "default"
                      }
                      size="small"
                    />
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
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Chi tiết đơn hàng - {selectedOrder?.orderCode || selectedOrder?.id}
            <IconButton
              aria-label="close"
              onClick={handleCloseOrderDetails}
              sx={{ position: "absolute", right: 8, top: 8 }}
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
                <Typography variant="h6" gutterBottom>
                  Thông tin đơn hàng
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
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
                        selectedOrder.orderType === "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                          ? "Thiết kế tùy chỉnh có thi công"
                          : selectedOrder.orderType === "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"
                          ? "Thiết kế tùy chỉnh không thi công"
                          : selectedOrder.orderType === "AI_DESIGN"
                          ? "Thiết kế AI"
                          : selectedOrder.orderType
                      }
                      color={
                        selectedOrder.orderType === "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                          ? "success"
                          : selectedOrder.orderType === "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"
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

                {/* Customer Information */}
                <Typography variant="h6" gutterBottom>
                  Thông tin khách hàng
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
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

                {/* Financial Information */}
                <Typography variant="h6" gutterBottom>
                  Thông tin tài chính
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tổng tiền đơn hàng
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(selectedOrder.totalOrderAmount || selectedOrder.totalAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tiền đặt cọc
                    </Typography>
                    <Typography variant="body1" color="success.main">
                      {formatCurrency(selectedOrder.totalOrderDepositAmount || selectedOrder.depositAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tiền còn lại
                    </Typography>
                    <Typography variant="body1" color="info.main">
                      {formatCurrency(selectedOrder.totalOrderRemainingAmount || selectedOrder.remainingAmount)}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Order Details */}
                {orderDetails && orderDetails.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Chi tiết đơn hàng
                    </Typography>
                    {orderDetails.map((detail, index) => (
                      <Box key={detail.id || index} sx={{ mb: 3, p: 2, border: 1, borderColor: "grey.300", borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Chi tiết #{index + 1}
                        </Typography>
                        
                        {/* Custom Design Request Information */}
                        {detail.customDesignRequests && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Yêu cầu thiết kế
                            </Typography>
                            <Typography variant="body2">
                              {detail.customDesignRequests.requirements}
                            </Typography>
                            
                            {/* Customer Detail */}
                            {detail.customDesignRequests.customerDetail && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Thông tin khách hàng:
                                </Typography>
                                <Typography variant="body2">
                                  Công ty: {detail.customDesignRequests.customerDetail.companyName}
                                </Typography>
                                <Typography variant="body2">
                                  Địa chỉ: {detail.customDesignRequests.customerDetail.address}
                                </Typography>
                                <Typography variant="body2">
                                  Liên hệ: {detail.customDesignRequests.customerDetail.contactInfo}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}

                        {/* Customer Choice Histories */}
                        {detail.customerChoiceHistories && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Lịch sử lựa chọn
                            </Typography>
                            <Typography variant="body2">
                              Loại sản phẩm: {detail.customerChoiceHistories.productTypeName}
                            </Typography>
                            <Typography variant="body2">
                              Công thức tính: {detail.customerChoiceHistories.calculateFormula}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              Tổng tiền: {formatCurrency(detail.customerChoiceHistories.totalAmount)}
                            </Typography>
                            
                            {/* Attribute Selections */}
                            {detail.customerChoiceHistories.attributeSelections && detail.customerChoiceHistories.attributeSelections.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Thuộc tính đã chọn:
                                </Typography>
                                {detail.customerChoiceHistories.attributeSelections.map((attr, attrIndex) => (
                                  <Box key={attrIndex} sx={{ ml: 2, mb: 1 }}>
                                    <Typography variant="body2" fontWeight="bold">
                                      {attr.attribute}: {attr.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Đơn vị: {attr.unit} | Giá: {formatCurrency(attr.unitPrice)} | Tổng: {formatCurrency(attr.subTotal)}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}

                            {/* Size Selections */}
                            {detail.customerChoiceHistories.sizeSelections && detail.customerChoiceHistories.sizeSelections.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Kích thước:
                                </Typography>
                                {detail.customerChoiceHistories.sizeSelections.map((size, sizeIndex) => (
                                  <Typography key={sizeIndex} variant="body2" sx={{ ml: 2 }}>
                                    {size.size}: {size.value}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </Box>
                        )}

                        {/* Financial Details */}
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Chi tiết tài chính
                          </Typography>
                          <Typography variant="body2">
                            Số lượng: {detail.quantity}
                          </Typography>
                          {detail.detailConstructionAmount && (
                            <Typography variant="body2">
                              Tiền thi công: {formatCurrency(detail.detailConstructionAmount)}
                            </Typography>
                          )}
                          {detail.detailDesignAmount && (
                            <Typography variant="body2">
                              Tiền thiết kế: {formatCurrency(detail.detailDesignAmount)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </>
                )}

                {/* Update Status Section */}
                {selectedOrder && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Cập nhật trạng thái
                    </Typography>

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
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
                              {selectedOrder.status === "PENDING_CONTRACT" && (
                                <>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    startIcon={<CloudUploadIcon />}
                                    disabled={actionLoading}
                                    onClick={() => setOpenContractUpload(true)}
                                    sx={{ mr: 1 }}
                                  >
                                    Tải lên hợp đồng
                                  </Button>

                                  {/* Chỉ hiển thị nút này khi cần cập nhật trạng thái thủ công */}
                                  <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    disabled={actionLoading}
                                    onClick={() => {
                                      // Hiện thông báo xác nhận trước khi thay đổi trạng thái
                                      if (
                                        window.confirm(
                                          "Xác nhận đã gửi hợp đồng cho khách hàng (không tải file)?"
                                        )
                                      ) {
                                        handleUpdateOrderStatus(
                                          selectedOrder.id,
                                          "CONTRACT_SENT"
                                        );
                                      }
                                    }}
                                  >
                                    Đánh dấu đã gửi hợp đồng
                                  </Button>
                                </>
                              )}

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

                              {selectedOrder.status === "CONTRACT_DISCUSS" && (
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
                                    disabled={actionLoading || fetchingContract}
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

                              {selectedOrder.status === "CONTRACT_RESIGNED" && (
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
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
                              {selectedOrder.status === "CONTRACT_CONFIRMED" && (
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
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
                              {selectedOrder.status === "PRODUCTION_COMPLETED" && (
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

                        {/* Cancel option - available in most states except COMPLETED */}
                        {selectedOrder.status !== "COMPLETED" &&
                          selectedOrder.status !== "CANCELLED" && (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                width: "100%",
                                mt: 2,
                              }}
                            >
                              <Typography variant="subtitle2" color="error">
                                Hủy đơn hàng:
                              </Typography>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                disabled={actionLoading}
                                onClick={() =>
                                  handleUpdateOrderStatus(
                                    selectedOrder.id,
                                    "CANCELLED"
                                  )
                                }
                                startIcon={<CancelIcon />}
                              >
                                Hủy đơn hàng
                              </Button>
                            </Box>
                          )}
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
      </Container>
    </LocalizationProvider>
  );
};

export default CustomerRequests;
