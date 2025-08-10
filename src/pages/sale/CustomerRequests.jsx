import React, { useState, useEffect, useMemo } from "react";
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
  const allDesignRequests = useSelector(selectAllDesignRequests);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  
  // Filter design requests based on search query (will be defined after state declarations)
  let designRequests = allDesignRequests;

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
  // Removed fetchingOrders state as it's not needed for server-side pagination
  const allOrders = useSelector(selectOrders);
  // Filter out AI_DESIGN orders for custom design tab and apply search filter (will be defined after state declarations)
  let filteredOrders = allOrders;
  
  // Client-side pagination for custom design tab
  const itemsPerPage = 10;
  const startIndex = (ordersPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFilteredOrders = filteredOrders.slice(startIndex, endIndex);
  
  const orders = currentTab === 1 ? paginatedFilteredOrders : allOrders; // Use paginated filtered orders for custom design tab
  const ordersPagination = useSelector((state) => state.order.pagination); // Get pagination from Redux
  
  // Calculate pagination for filtered orders whenever data changes
  useEffect(() => {
    if (currentTab === 1) {
      const filteredTotalPages = Math.ceil(filteredOrders.length / itemsPerPage);
      setOrdersTotalPages(filteredTotalPages || 1);
    }
  }, [currentTab, filteredOrders.length, itemsPerPage]);

  // Debug: Log order type breakdown and pagination (Client-side)
  useEffect(() => {
    if (currentTab === 1) {
      const orderTypeCount = orders.reduce((acc, order) => {
        acc[order.orderType] = (acc[order.orderType] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Order breakdown (Client-side pagination):');
      console.log('  - Total filtered orders:', filteredOrders.length);
      console.log('  - Current page orders:', orders.length);
      console.log('  - Order type breakdown:', orderTypeCount);
      console.log('📄 Pagination info:');
      console.log('  - Current page:', ordersPage);
      console.log('  - Total pages:', ordersTotalPages);
    }
  }, [currentTab, orders, ordersPage, ordersTotalPages, filteredOrders.length]);

  // Reset page if current page exceeds total pages
  useEffect(() => {
    if (ordersPage > ordersTotalPages && ordersTotalPages > 0) {
      console.log('⚠️ Current page exceeds total pages, resetting to page 1');
      setOrdersPage(1);
    }
  }, [ordersPage, ordersTotalPages]);
  
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
  const [searchQuery, setSearchQuery] = useState(""); // State cho search
  const [searchDesignRequests, setSearchDesignRequests] = useState(""); // State cho search design requests
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
  const [showRepricingForm, setShowRepricingForm] = useState(false);
  const [showCreatePriceForm, setShowCreatePriceForm] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState(""); // Mặc định là tất cả trạng thái

  /*
   * CÁCH SỬ DỤNG CÁC FUNCTION REFRESH:
   *
   * 1. refreshDesignRequestsData() - Refresh data cho tab "Yêu cầu thiết kế"
   *    - Sử dụng sau khi: assign designer, set pending contract, reject request, create proposal, update proposal
   *
   * 2. refreshOrdersData() - Refresh data cho tab "Đơn hàng thiết kế tùy chỉnh"
   *    - Sử dụng sau khi: update order status, report delivery, contract operations
   *
   * 3. refreshAllData() - Refresh tất cả data (thông minh theo tab hiện tại)
   *    - Sử dụng khi không chắc chắn cần refresh gì
   *
   * LƯU Ý: Không cần reload trang nữa, chỉ cần gọi các function này!
   */

  // ===== CÁC FUNCTION REFRESH =====
  const refreshDesignRequestsData = async () => {
    if (currentTab === 0) {
      await dispatch(
        fetchAllDesignRequests({ 
          status: selectedStatus, 
          page: designRequestsPage, 
          size: 10 
        })
      ).then((action) => {
        if (action.payload && action.payload.totalPages) {
          setDesignRequestsTotalPages(action.payload.totalPages);
        }
      });
    }
  };

  const refreshOrdersData = async () => {
    if (currentTab === 1) {
      await dispatch(
        fetchOrders({
          orderStatus: selectedOrderStatus === "" ? null : selectedOrderStatus,
          page: 1,
          size: 100,
          orderType: null,
        })
      );
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

  // Apply filters after all states are declared
  designRequests = allDesignRequests.filter(request => {
    if (!searchDesignRequests.trim()) return true;
    
    const query = searchDesignRequests.toLowerCase().trim();
    const code = (request.code || request.id || '').toLowerCase();
    const companyName = (request.customerDetail?.companyName || '').toLowerCase();
    const customerName = (request.customerDetail?.fullName || '').toLowerCase();
    
    return code.includes(query) || 
           companyName.includes(query) || 
           customerName.includes(query);
  });

  // Apply filters for orders
  filteredOrders = allOrders.filter(order => {
    if (order.orderType === 'AI_DESIGN') return false;
    
    // Apply search filter if searchQuery exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const orderCode = (order.orderCode || order.id || '').toLowerCase();
      const companyName = (order.customerDetail?.companyName || '').toLowerCase();
      const customerName = (order.customerDetail?.fullName || '').toLowerCase();
      
      return orderCode.includes(query) || 
             companyName.includes(query) || 
             customerName.includes(query);
    }
    
    return true;
  });

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
        fetchAllDesignRequests({ status: selectedStatus, page: designRequestsPage, size: 10 })
      ).then((action) => {
        if (action.payload && action.payload.totalPages) {
          setDesignRequestsTotalPages(action.payload.totalPages);
        }
      });
    }
  }, [currentTab, dispatch, selectedStatus, designRequestsPage]);

  useEffect(() => {
    if (currentTab === 1) {
      const fetchTimestamp = Date.now();
      console.log(`🚀 [${fetchTimestamp}] Tab 1 active - fetching CUSTOM DESIGN orders:`, {
        status: selectedOrderStatus,
        page: ordersPage,
        size: 10
      });
      
      // Thêm memoization để tránh fetch quá nhiều lần
      const controller = new AbortController();
      const signal = controller.signal;

      // For custom design tab, we need both orderTypes
      const orderTypes = ['CUSTOM_DESIGN_WITH_CONSTRUCTION', 'CUSTOM_DESIGN_WITHOUT_CONSTRUCTION'];
      
      // Since API only accepts single orderType, we'll call for each type and combine
      // Or if backend supports multiple types, we can pass as comma-separated
      dispatch(
        fetchOrders({
          orderStatus: selectedOrderStatus === "" ? null : selectedOrderStatus,
          page: 1, // Always get page 1 since we'll do client-side pagination
          size: 100, // Get more data to ensure enough custom design orders for pagination
          orderType: null, // Don't filter by orderType, we'll filter client-side to exclude AI_DESIGN
          signal,
          _timestamp: fetchTimestamp, // Debug identifier
        })
      ).then((action) => {
        console.log(`✅ [${fetchTimestamp}] Orders API Response:`, action.payload);
        if (action.payload && action.payload.orders) {
          // Calculate client-side pagination for filtered orders
          const totalOrders = action.payload.orders || [];
          const customDesignOrders = totalOrders.filter(order => order.orderType !== 'AI_DESIGN');
          const filteredTotalPages = Math.ceil(customDesignOrders.length / itemsPerPage);
          
          setOrdersTotalPages(filteredTotalPages || 1);
          console.log(`📊 [${fetchTimestamp}] Server Total Orders:`, totalOrders.length);
          console.log(`📊 [${fetchTimestamp}] Custom Design Orders:`, customDesignOrders.length);
          console.log(`📊 [${fetchTimestamp}] Client-side Pages:`, filteredTotalPages);
        }
        if (action.payload && action.payload.orders) {
          console.log(`🔍 [${fetchTimestamp}] Order types:`, action.payload.orders.map(o => o.orderType));
        }
      });

      // Cleanup function để hủy fetch nếu component re-render
      return () => {
        controller.abort();
      };
    }
  }, [currentTab, selectedOrderStatus]); // Remove ordersPage since we do client-side pagination

  // Pagination handlers
  const handleDesignRequestsPageChange = (event, newPage) => {
    setDesignRequestsPage(newPage);
  };

  const handleOrdersPageChange = (event, newPage) => {
    setOrdersPage(newPage);
    console.log('🔄 Changing to orders page:', newPage);
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
    setCurrentTab(newValue);
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
    setSearchDesignRequests(e.target.value);
    setDesignRequestsPage(1); // Reset to first page when searching
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
      await refreshOrdersData();

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
    setShowRepricingForm(false);
    setShowCreatePriceForm(false);
    setPriceForm({ totalPrice: "", depositAmount: "" });

    // Fetch designers when dialog opens
    fetchDesigners();
  };

  const handleCloseDetails = React.useCallback(() => {
    setDetailOpen(false);
    setSelectedRequest(null);
    // setComment("");
    setSelectedDesigner("");
    setShowRepricingForm(false);
    setShowCreatePriceForm(false);
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
      "PENDING": "Chờ xác nhận",
      "PRICING_NOTIFIED": "Đã báo giá",
      "REJECTED_PRICING": "Từ chối báo giá",
      "APPROVED_PRICING": "Đã duyệt giá",
      "DEPOSITED": "Đã đặt cọc",
      "ASSIGNED_DESIGNER": "Đã giao designer",
      "PROCESSING": "Đang thiết kế",
      "DESIGNER_REJECTED": "Designer từ chối",
      "DEMO_SUBMITTED": "Đã nộp demo",
      "REVISION_REQUESTED": "Yêu cầu chỉnh sửa",
      "WAITING_FULL_PAYMENT": "Chờ thanh toán đủ",
      "FULLY_PAID": "Đã thanh toán đủ",
      "PENDING_CONTRACT": "Chờ gửi hợp đồng",
      "COMPLETED": "Hoàn tất",
      "CANCELLED": "Đã hủy"
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
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + " VND";
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
        // Reset form and hide both forms
        setPriceForm({ totalPrice: "", depositAmount: "" });
        setShowRepricingForm(false);
        setShowCreatePriceForm(false);
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
                  {!status.includes("loading") && allDesignRequests.length > 0 && (
                    <Badge
                      badgeContent={allDesignRequests.length}
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
              
              {/* Search and Filter Row */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                {/* Search Field */}
                
                
                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: 250 }}>
                  <InputLabel id="status-filter-label">Lọc theo trạng thái</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={selectedStatus}
                    label="Lọc theo trạng thái"
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setDesignRequestsPage(1); // Reset to first page when changing status
                    }}
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
                <TextField
                  size="small"
                  placeholder="Tìm kiếm theo mã yêu cầu, tên công ty..."
                  value={searchDesignRequests}
                  onChange={handleSearchDesignRequests}
                  sx={{ minWidth: 800 }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: 'text.secondary' }}>
                        <SearchIcon />
                      </Box>
                    ),
                    endAdornment: searchDesignRequests && (
                      <IconButton
                        size="small"
                        onClick={() => setSearchDesignRequests("")}
                        sx={{ mr: 0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
              </Stack>
            </Card>

            {/* Content Section */}
            {designRequests.length === 0 && status === "succeeded" ? (
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>
                  <BrushIcon sx={{ fontSize: 64, color: "grey.400" }} />
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchDesignRequests.trim() ? "Không tìm thấy kết quả" : "Chưa có yêu cầu thiết kế nào"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchDesignRequests.trim() 
                    ? `Không tìm thấy yêu cầu thiết kế nào phù hợp với từ khóa "${searchDesignRequests}"`
                    : "Hiện tại không có yêu cầu thiết kế nào phù hợp với bộ lọc đã chọn"
                  }
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
                              {request.code || ""}
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
                          <TableCell>
                            {getStatusChip(request.status)}
                          </TableCell>
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
                
                {/* Pagination for Design Requests */}
                {designRequestsTotalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <FilterIcon color="primary" />
                <Typography variant="h6" fontWeight="medium">
                  Bộ lọc đơn hàng
                </Typography>
              </Stack>
              
              {/* Search and Filter Row */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                {/* Search Field */}
                <TextField
                  size="small"
                  placeholder="Tìm kiếm theo mã yêu cầu, tên công ty..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  sx={{ minWidth: 350 }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: 'text.secondary' }}>
                        <SearchIcon />
                      </Box>
                    ),
                    endAdornment: searchQuery && (
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery("")}
                        sx={{ mr: 0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
                
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
                    startAdornment={
                      <Box sx={{ mr: 1 }}>
                        <Chip 
                          size="small" 
                          label={filteredOrders.length} 
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
              </Stack>
            </Card>

            {/* Content Section */}
            {filteredOrders.length === 0 ? (
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>
                  <OrderIcon sx={{ fontSize: 64, color: "grey.400" }} />
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchQuery.trim() ? "Không tìm thấy kết quả" : "Chưa có đơn hàng nào"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery.trim() 
                    ? `Không tìm thấy đơn hàng nào phù hợp với từ khóa "${searchQuery}"`
                    : "Không tìm thấy đơn hàng nào với trạng thái đã chọn"
                  }
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
                        {paginatedFilteredOrders.map((order) => (
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
                              <Stack direction="row" alignItems="center" spacing={1}>
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
                  
                  {/* Pagination for Orders */}
                  {ordersTotalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
                      {selectedRequest.code ? `Mã: ${selectedRequest.code}` : "Chưa có mã"}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
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
                          Thông tin khách hàng
                        </Typography>
                      </Stack>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Tên công ty:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedRequest.customerDetail?.companyName || "Chưa có thông tin"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Địa chỉ:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedRequest.customerDetail?.address || "Chưa có thông tin"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Số điện thoại:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedRequest.customerDetail?.contactInfo || "Chưa có thông tin"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Người liên hệ:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedRequest.customerDetail?.users?.fullName || "Chưa có thông tin"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Email:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedRequest.customerDetail?.users?.email || "Chưa có thông tin"}
                          </Typography>
                        </Box>
                        <Box>
                         
                        </Box>
                      </Stack>
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

                  {/* Time Information */}
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)", height: "100%" }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <ScheduleIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight="medium">
                         Trạng thái
                        </Typography>
                      </Stack>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Ngày tạo:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatDate(selectedRequest.createdAt)}
                          </Typography>
                        </Box>
                        {/* <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Ngày cập nhật cuối:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatDate(selectedRequest.updatedAt)}
                          </Typography>
                        </Box> */}
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Trạng thái yêu cầu:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary.main">
                            {getStatusChip(selectedRequest.status)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  {/* Designer Assignment Section */}
                  {selectedRequest && selectedRequest.assignDesigner && (
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ p: 2, background: "linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)", height: "100%" }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Chip 
                            label="Designer phụ trách" 
                              color="success" 
                              icon={<CheckCircleIcon />}
                              sx={{ fontWeight: 600 }}
                            />
                            <Typography variant="body1" fontWeight="medium">
                              Designer phụ trách:{" "}
                              <Typography component="span" color="primary.main" fontWeight="bold">
                              {selectedRequest.assignDesigner.fullName || "Chưa rõ"}
                              </Typography>
                            </Typography>
                          </Stack>
                        <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(255,255,255,0.7)", borderRadius: 1 }}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                Email:
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {selectedRequest.assignDesigner.email || "Chưa có thông tin"}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                Số điện thoại:
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {selectedRequest.assignDesigner.phone || "Chưa có thông tin"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                        </Card>
                      </Grid>
                    )}

                  {/* Designer Selection Section */}
                  {selectedRequest &&
                    (selectedRequest.status === "DEPOSITED" ||
                      selectedRequest.status === "DESIGNER_REJECTED") && (
                      <Grid item xs={12}>
                      <Card sx={{ p: 2, background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)" }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                          <PersonAddIcon color="primary" />
                          <Typography variant="subtitle1" fontWeight="medium">
                            Giao task thiết kế
                            </Typography>
                          </Stack>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={8}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Chọn designer</InputLabel>
                            <Select
                                value={selectedDesigner || ""}
                                onChange={(e) => setSelectedDesigner(e.target.value)}
                              label="Chọn designer"
                              disabled={loadingDesigners}
                            >
                                {loadingDesigners ? (
                                  <MenuItem disabled>
                                    <CircularProgress size={20} />
                                    Đang tải danh sách designer...
                              </MenuItem>
                                ) : (
                                  designers.map((designer) => (
                                <MenuItem key={designer.id} value={designer.id}>
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                    <Avatar
                                      src={designer.avatar}
                                          sx={{ width: 24, height: 24 }}
                                        />
                                        <Typography variant="body2">
                                      {designer.fullName}
                                    </Typography>
                                  </Stack>
                                </MenuItem>
                                  ))
                                )}
                            </Select>
                          </FormControl>
                      </Grid>
                          <Grid item xs={12} sm={4}>
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
                              fullWidth
                            >
                              {assigningDesigner
                                ? "Đang giao..."
                                : "Giao task thiết kế"}
                            </Button>
                          </Grid>
                        </Grid>
                    </Card>
                  </Grid>
                  )}

                  {/* Pricing History Section */}
                  <Grid item xs={12}>
                    <Card sx={{ p: 2, background: "linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)" }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <AttachMoneyIcon color="primary" />
                        <Typography variant="h6" fontWeight="medium">
                          Lịch sử báo giá chi tiết
                        </Typography>
                      </Stack>
                      
                      {priceProposals.length === 0 ? (
                        <Box sx={{ p: 3, bgcolor: "rgba(255,255,255,0.7)", borderRadius: 2 }}>
                          <Typography variant="body1" color="text.secondary">
                            Chưa có lịch sử báo giá nào
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          {priceProposals.map((proposal, index) => (
                            <Card 
                              key={proposal.id}
                              sx={{ 
                                p: 2, 
                                border: "1px solid",
                                borderColor: "grey.200",
                                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
                              }}
                            >
                              <Box sx={{ mb: 2, p: 1, bgcolor: "primary.light", borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="white" fontWeight="bold">
                                  Báo giá #{index + 1} - {new Date(proposal.createdAt).toLocaleDateString("vi-VN")}
                                </Typography>
                              </Box>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Giá ban đầu:
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold" color="error.main">
                                    {formatCurrency(proposal.totalPrice)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Tiền cọc:
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold" color="warning.main">
                                    {formatCurrency(proposal.depositAmount)}
                                  </Typography>
                                </Grid>
                                {proposal.totalPriceOffer && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Giá đề xuất:
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                                      {formatCurrency(proposal.totalPriceOffer)}
                                    </Typography>
                                  </Grid>
                                )}
                                {proposal.depositAmountOffer && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Cọc đề xuất:
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
                                    label={
                                      proposal.status === "PENDING" ? "Chờ phản hồi" :
                                      proposal.status === "APPROVED" ? "Đã chấp nhận" :
                                      proposal.status === "REJECTED" ? "Đã từ chối" :
                                      proposal.status === "NEGOTIATING" ? "Đang thương lượng" :
                                      proposal.status
                                    } 
                                    size="small" 
                                    color={
                                      proposal.status === "PENDING" ? "warning" :
                                      proposal.status === "APPROVED" ? "success" :
                                      proposal.status === "REJECTED" ? "error" :
                                      proposal.status === "NEGOTIATING" ? "info" :
                                      "default"
                                    }
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" color="text.secondary">
                                    Ngày báo giá:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {formatDate(proposal.createdAt)}
                                  </Typography>
                                </Grid>
                                
                                {/* Thông tin từ chối nếu có */}
                                {proposal.status === "REJECTED" && proposal.rejectionReason && (
                                  <Grid item xs={12}>
                                    <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 1 }}>
                                      <Typography variant="body2" color="error.dark" fontWeight="bold">
                                        Lý do từ chối:
                                      </Typography>
                                      <Typography variant="body2" color="error.dark">
                                        {proposal.rejectionReason}
                                      </Typography>
                                    </Box>
                              </Grid>
                                )}
                                
                                {/* Thông tin thương lượng nếu có */}
                                {proposal.status === "NEGOTIATING" && proposal.negotiationNote && (
                                  <Grid item xs={12}>
                                    <Box sx={{ p: 2, bgcolor: "info.light", borderRadius: 1 }}>
                                      <Typography variant="body2" color="info.dark" fontWeight="bold">
                                        Ghi chú thương lượng:
                                      </Typography>
                                      <Typography variant="body2" color="info.dark">
                                        {proposal.negotiationNote}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                              </Grid>
                              
                              {/* Action buttons for each proposal */}
                              <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                                {/* Chỉ hiển thị nút cập nhật khi proposal có status PENDING */}
                                {proposal.status === "PENDING" && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleOpenUpdateDialog(proposal)}
                                    startIcon={<EditIcon />}
                                  >
                                    Cập nhật giá
                                  </Button>
                              )}
                              </Box>
                            </Card>
                          ))}
                        </Stack>
                      )}
                      
                      {/* Form báo giá lại cho requests bị từ chối */}
                      {selectedRequest && 
                       selectedRequest.status === "REJECTED_PRICING" && 
                       showRepricingForm && (
                        <Box 
                          sx={{ 
                            mt: 2, 
                            p: 2.5, 
                            bgcolor: "rgba(255,255,255,0.95)", 
                            borderRadius: 3, 
                            border: "2px solid", 
                            borderColor: "warning.main",
                            boxShadow: "0 4px 20px rgba(255, 152, 0, 0.15)",
                            position: "relative",
                            overflow: "hidden"
                          }}
                        >
                          {/* Header với icon */}
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
                            <Box sx={{ 
                              p: 1, 
                              bgcolor: "warning.main", 
                              borderRadius: 2, 
                              mr: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <RefreshIcon sx={{ color: "white", fontSize: 20 }} />
                            </Box>
                            <Typography variant="h6" color="warning.main" fontWeight="600">
                              Báo giá lại
                            </Typography>
                          </Box>

                          {/* Form fields */}
                          <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={6}>
                        <TextField
                                fullWidth
                          label="Tổng giá mới (VND)"
                          type="number"
                                value={priceForm.totalPrice}
                          onChange={(e) =>
                                  setPriceForm((f) => ({
                              ...f,
                              totalPrice: e.target.value,
                            }))
                          }
                                InputProps={{ 
                                  inputProps: { min: 1000 },
                                  startAdornment: <AttachMoneyIcon color="warning" sx={{ mr: 1 }} />
                                }}
                                sx={{ 
                                  bgcolor: "white", 
                                  borderRadius: 2,
                                  "& .MuiOutlinedInput-root": {
                                    "&:hover fieldset": {
                                      borderColor: "warning.main",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "warning.main",
                                    },
                                  }
                                }}
                                error={!priceForm.totalPrice || Number(priceForm.totalPrice) < 1000}
                                helperText={
                                  !priceForm.totalPrice 
                                    ? "Vui lòng nhập tổng giá mới" 
                                    : Number(priceForm.totalPrice) < 1000 
                                      ? "Tổng giá phải lớn hơn 1.000 VNĐ" 
                                      : ""
                                }
                                FormHelperTextProps={{
                                  sx: { 
                                    fontSize: "0.75rem",
                                    fontWeight: 500
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                        <TextField
                                fullWidth
                          label="Tiền cọc mới (VND)"
                          type="number"
                                value={priceForm.depositAmount}
                          onChange={(e) =>
                                  setPriceForm((f) => ({
                              ...f,
                              depositAmount: e.target.value,
                            }))
                          }
                                InputProps={{ 
                                  inputProps: { min: 1000 },
                                  startAdornment: <AttachMoneyIcon color="warning" sx={{ mr: 1 }} />
                                }}
                                sx={{ 
                                  bgcolor: "white", 
                                  borderRadius: 2,
                                  "& .MuiOutlinedInput-root": {
                                    "&:hover fieldset": {
                                      borderColor: "warning.main",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "warning.main",
                                    },
                                  }
                                }}
                                error={!priceForm.depositAmount || Number(priceForm.depositAmount) < 1000 || (priceForm.totalPrice && Number(priceForm.depositAmount) > Number(priceForm.totalPrice))}
                                helperText={
                                  !priceForm.depositAmount 
                                    ? "Vui lòng nhập tiền cọc mới" 
                                    : Number(priceForm.depositAmount) < 1000 
                                      ? "Tiền cọc phải lớn hơn 1.000 VNĐ" 
                                      : (priceForm.totalPrice && Number(priceForm.depositAmount) > Number(priceForm.totalPrice))
                                        ? "Tiền cọc không được lớn hơn tổng giá"
                                        : ""
                                }
                                FormHelperTextProps={{
                                  sx: { 
                                    fontSize: "0.75rem",
                                    fontWeight: 600
                                  }
                                }}
                              />
                            </Grid>
                          </Grid>

                          {/* Action buttons */}
                          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                        <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => {
                                setShowRepricingForm(false);
                                setPriceForm({ totalPrice: "", depositAmount: "" });
                              }}
                              sx={{ 
                                flex: 1,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                py: 1.2
                              }}
                            >
                              Hủy
                        </Button>
                  <Button
                    variant="contained"
                              color="warning"
                              onClick={handleCreateProposal}
                              disabled={creatingProposal || !priceForm.totalPrice || !priceForm.depositAmount || Number(priceForm.totalPrice) < 1000 || Number(priceForm.depositAmount) < 1000 || (priceForm.totalPrice && priceForm.depositAmount && Number(priceForm.depositAmount) > Number(priceForm.totalPrice))}
                    startIcon={
                                creatingProposal ? (
                                  <CircularProgress size={18} color="inherit" />
                                ) : (
                                  <RefreshIcon />
                                )
                              }
                              sx={{ 
                                flex: 1,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                py: 1.2,
                                boxShadow: "0 2px 8px rgba(255, 152, 0, 0.3)"
                              }}
                            >
                              {creatingProposal ? "Đang tạo..." : "Tạo báo giá mới"}
                  </Button>
                          </Box>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button
                  onClick={handleCloseDetails}
                  variant="outlined"
                  startIcon={<CloseIcon />}
                >
                  Đóng
                </Button>
                {selectedRequest &&
                  (selectedRequest.status === "PENDING" ||
                    selectedRequest.status === "DESIGNER_REJECTED") && (
                  <Button
                    variant="contained"
                    color="primary"
                      onClick={() => setShowCreatePriceForm(!showCreatePriceForm)}
                      startIcon={<AddIcon />}
                    >
                      {showCreatePriceForm ? "Ẩn form" : "Báo giá"}
                  </Button>
                )}
                {/* Nút báo giá lại chỉ hiện khi request có status là REJECTED_PRICING */}
                {selectedRequest && selectedRequest.status === "REJECTED_PRICING" && (
                <Button
                  variant="contained"
                    color="warning"
                    onClick={() => setShowRepricingForm(!showRepricingForm)}
                    startIcon={<RefreshIcon />}
                  >
                    {showRepricingForm ? "Ẩn form" : "Báo giá lại"}
                </Button>
                )}
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
              
              {/* Form tạo báo giá mới - chỉ hiện khi bấm nút "Báo giá" */}
              {selectedRequest && 
               (selectedRequest.status === "PENDING" || selectedRequest.status === "DESIGNER_REJECTED") && 
               showCreatePriceForm && (
                <Box 
                  sx={{ 
                    p: 2.5, 
                    bgcolor: "rgba(255,255,255,0.95)", 
                    borderRadius: 3, 
                    border: "2px solid", 
                    borderColor: "primary.main",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    mt: 2,
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Header với icon */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
                    <Box sx={{ 
                      p: 1, 
                      bgcolor: "primary.main", 
                      borderRadius: 2, 
                      mr: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <AddIcon sx={{ color: "white", fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" color="primary.main" fontWeight="600">
                      Tạo báo giá mới
                    </Typography>
                  </Box>

                  {/* Form fields */}
                  <Grid container spacing={2.5}>
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
                          inputProps: { min: 1000 },
                          startAdornment: <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                        }}
                        sx={{ 
                          bgcolor: "white", 
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "primary.main",
                            },
                          }
                        }}
                        error={!priceForm.totalPrice || Number(priceForm.totalPrice) < 1000}
                        helperText={
                          !priceForm.totalPrice 
                            ? "Vui lòng nhập tổng giá" 
                            : Number(priceForm.totalPrice) < 1000 
                              ? "Tổng giá phải lớn hơn 1.000 VNĐ" 
                              : ""
                        }
                        FormHelperTextProps={{
                          sx: { 
                            fontSize: "0.75rem",
                            fontWeight: 500
                          }
                        }}
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
                          inputProps: { min: 1000 },
                          startAdornment: <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                        }}
                        sx={{ 
                          bgcolor: "white", 
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "primary.main",
                            },
                          }
                        }}
                        error={!priceForm.depositAmount || Number(priceForm.depositAmount) < 1000 || (priceForm.totalPrice && Number(priceForm.depositAmount) > Number(priceForm.totalPrice))}
                        helperText={
                          !priceForm.depositAmount 
                            ? "Vui lòng nhập tiền cọc" 
                            : Number(priceForm.depositAmount) < 1000 
                              ? "Tiền cọc phải lớn hơn 1.000 VNĐ" 
                              : (priceForm.totalPrice && Number(priceForm.depositAmount) > Number(priceForm.totalPrice))
                                ? "Tiền cọc không được lớn hơn tổng giá"
                                : ""
                        }
                        FormHelperTextProps={{
                          sx: { 
                            fontSize: "0.75rem",
                            fontWeight: 500
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Action buttons */}
                  <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setShowCreatePriceForm(false);
                        setPriceForm({ totalPrice: "", depositAmount: "" });
                      }}
                      sx={{ 
                        flex: 1,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1.2
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCreateProposal}
                      disabled={creatingProposal || !priceForm.totalPrice || !priceForm.depositAmount || Number(priceForm.totalPrice) < 1000 || Number(priceForm.depositAmount) < 1000}
                      startIcon={
                        creatingProposal ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <AddIcon />
                        )
                      }
                      sx={{ 
                        flex: 1,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1.2,
                        boxShadow: "0 2px 8px rgba(25, 118, 210, 0.3)"
                      }}
                    >
                      {creatingProposal ? "Đang tạo..." : "Tạo báo giá"}
                    </Button>
                  </Box>
                </Box>
              )}
              
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Dialog cập nhật lại giá */}
        <Dialog
          open={updateDialog.open}
          onClose={handleCloseUpdateDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            display: "flex", 
            alignItems: "center", 
            gap: 2,
            borderBottom: "1px solid",
            borderColor: "divider"
          }}>
            <Box sx={{ 
              p: 1.5, 
              bgcolor: "primary.main", 
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <EditIcon sx={{ color: "white", fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight="600">
              Cập nhật giá báo
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Tổng giá mới (VND)"
                  type="number"
                  fullWidth
                  value={updateForm.totalPrice}
                  onChange={(e) =>
                    setUpdateForm((f) => ({
                      ...f,
                      totalPrice: e.target.value,
                    }))
                  }
                  InputProps={{ 
                    inputProps: { min: 1000 },
                    startAdornment: <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  }}
                  sx={{ 
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                      },
                    }
                  }}
                  error={!updateForm.totalPrice || Number(updateForm.totalPrice) < 1000}
                  helperText={
                    !updateForm.totalPrice 
                      ? "Vui lòng nhập tổng giá mới" 
                      : Number(updateForm.totalPrice) < 1000 
                        ? "Tổng giá phải lớn hơn 1.000 VNĐ" 
                        : ""
                  }
                  FormHelperTextProps={{
                    sx: { 
                      fontSize: "0.75rem",
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Tiền cọc mới (VND)"
                  type="number"
                  fullWidth
                  value={updateForm.depositAmount}
                  onChange={(e) =>
                    setUpdateForm((f) => ({
                      ...f,
                      depositAmount: e.target.value,
                    }))
                  }
                  InputProps={{ 
                    inputProps: { min: 1000 },
                    startAdornment: <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  }}
                  sx={{ 
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                      },
                    }
                  }}
                  error={!updateForm.depositAmount || Number(updateForm.depositAmount) < 1000 || (updateForm.totalPrice && Number(updateForm.depositAmount) > Number(updateForm.totalPrice))}
                  helperText={
                    !updateForm.depositAmount 
                      ? "Vui lòng nhập tiền cọc mới" 
                      : Number(updateForm.depositAmount) < 1000 
                        ? "Tiền cọc phải lớn hơn 1.000 VNĐ" 
                        : (updateForm.totalPrice && Number(updateForm.depositAmount) > Number(updateForm.totalPrice))
                          ? "Tiền cọc không được lớn hơn tổng giá"
                          : ""
                  }
                  FormHelperTextProps={{
                    sx: { 
                      fontSize: "0.75rem",
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
            <Button 
              onClick={handleCloseUpdateDialog} 
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.2
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateSubmit}
              variant="contained"
              color="primary"
              disabled={actionLoading || !updateForm.totalPrice || !updateForm.depositAmount || Number(updateForm.totalPrice) < 1000 || Number(updateForm.depositAmount) < 1000}
              startIcon={
                actionLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <EditIcon />
                )
              }
              sx={{ 
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.2,
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.3)"
              }}
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

              

                {/* Detailed Financial Breakdown */}
                <Typography variant="h6" gutterBottom>
                  Thông tin tài chính
                </Typography>
                
                {/* Thiết kế */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
                  Chi phí thiết kế
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: "primary.light", color: "white" }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                        Tổng tiền thiết kế
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(selectedOrder.totalDesignAmount || 0)}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                        Tiền cọc thiết kế
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(selectedOrder.depositDesignAmount || 0)}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: "primary.dark", color: "white" }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                        Tiền còn lại thiết kế
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(selectedOrder.remainingDesignAmount || 0)}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Thi công */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2, color: 'success.main' }}>
                  Chi phí thi công
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: "success.light", color: "white" }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                        Tổng tiền thi công
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(selectedOrder.totalConstructionAmount || 0)}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: "success.main", color: "white" }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                        Tiền cọc thi công
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(selectedOrder.depositConstructionAmount || 0)}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: "success.dark", color: "white" }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                        Tiền còn lại thi công
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(selectedOrder.remainingConstructionAmount || 0)}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Tổng hợp đơn hàng */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2, color: 'warning.main' }}>
                  Tổng tiền đơn hàng
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: "warning.light", color: "white" }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                        Tổng tiền đơn hàng
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(selectedOrder.totalOrderAmount || 0)}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: "warning.main", color: "white" }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                        Tiền cọc đơn hàng
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(selectedOrder.totalOrderDepositAmount || 0)}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 2, bgcolor: "warning.dark", color: "white" }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                        Tiền còn lại đơn hàng
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(selectedOrder.totalOrderRemainingAmount || 0)}
                      </Typography>
                    </Card>
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
                          
                          {/* Chi tiết chi phí thiết kế */}
                          {detail.detailDesignAmount && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: "primary.light", borderRadius: 1 }}>
                              <Typography variant="body2" color="primary.dark" fontWeight="bold">
                                💰 Chi phí thiết kế: {formatCurrency(detail.detailDesignAmount)}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Chi tiết chi phí thi công */}
                          {detail.detailConstructionAmount && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: "success.light", borderRadius: 1 }}>
                              <Typography variant="body2" color="success.dark" fontWeight="bold">
                                🏗️ Chi phí thi công: {formatCurrency(detail.detailConstructionAmount)}
                            </Typography>
                            </Box>
                          )}
                          
                          {/* Chi tiết chi phí vật liệu nếu có */}
                          {detail.detailMaterialAmount && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: "warning.light", borderRadius: 1 }}>
                              <Typography variant="body2" color="warning.dark" fontWeight="bold">
                                📦 Chi phí vật liệu: {formatCurrency(detail.detailMaterialAmount)}
                            </Typography>
                            </Box>
                          )}
                          
                          {/* Tổng chi phí chi tiết */}
                          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Tổng chi phí chi tiết:
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
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