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
  TextField,
  Grid,
  CircularProgress,
  Pagination,
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
} from "@mui/icons-material";
import {
  fetchAllDesignRequests,
  selectAllDesignRequests,
  selectStatus,
  selectError,
  selectPagination,
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
  selectOrderPagination,
  selectOrders,
  selectOrdersByType,
  selectOrderStatus,
  updateOrderEstimatedDeliveryDate,
} from "../../store/features/order/orderSlice";

import ContractUploadForm from "../../components/ContractUploadForm";
import UploadRevisedContract from "../../components/UploadRevisedContract";
import { getOrderContractApi } from "../../api/contractService";
import { getPresignedUrl } from "../../api/s3Service";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
const CustomerRequests = () => {
  const dispatch = useDispatch();
  const designRequests = useSelector(selectAllDesignRequests);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);

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
  const orderStatus = useSelector(selectOrderStatus);
  const orderError = useSelector(selectOrderError);
  const orderPagination = useSelector(selectOrderPagination);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(10);
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
    useState("PENDING_CONTRACT");
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
  const handleOrderPageChange = (event, value) => {
    setOrderPage(value);
  };
  const [creatingProposal, setCreatingProposal] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("PENDING"); // Mặc định là PENDING

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
  useEffect(() => {
    if (currentTab === 1) {
      // Thêm memoization để tránh fetch quá nhiều lần
      const controller = new AbortController();
      const signal = controller.signal;

      dispatch(
        fetchOrders({
          orderStatus: selectedOrderStatus,
          page: orderPage,
          size: orderPageSize,
          signal,
        })
      );

      // Cleanup function để hủy fetch nếu component re-render
      return () => {
        controller.abort();
      };
    }
  }, [currentTab, selectedOrderStatus, orderPage, orderPageSize]);
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
            page: orderPage,
            size: orderPageSize,
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
                orderStatus: selectedOrderStatus || "PENDING_CONTRACT",
                page: orderPage,
                size: orderPageSize,
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
            page: orderPage,
            size: orderPageSize,
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
          page: orderPage,
          size: orderPageSize,
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
            page: orderPage,
            size: orderPageSize,
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
            page: orderPage,
            size: orderPageSize,
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

  useEffect(() => {
    // Fetch theo status mỗi khi selectedStatus thay đổi
    dispatch(
      fetchAllDesignRequests({ status: selectedStatus, page: 1, size: 10 })
    );
  }, [dispatch, selectedStatus]);

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

  const handlePageChange = (event, value) => {
    dispatch(
      fetchAllDesignRequests({ page: value, size: pagination.pageSize })
    );
  };

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
            page: pagination.currentPage,
            size: pagination.pageSize,
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
            page: pagination.currentPage,
            size: pagination.pageSize,
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
            page: pagination.currentPage,
            size: pagination.pageSize,
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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "failed") {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">Error loading data: {error}</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Customer Design Management
        </Typography>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Design Requests" />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <span>Custom Design Orders</span>
                {!orderLoading && orders.length > 0 && (
                  <Badge
                    badgeContent={orders.length}
                    color="warning"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
        {currentTab === 0 ? (
          <>
            <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
              <InputLabel id="status-filter-label">Trạng thái</InputLabel>
              <Select
                labelId="status-filter-label"
                value={selectedStatus}
                label="Trạng thái"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="PENDING">Chờ xác nhận</MenuItem>
                <MenuItem value="PRICING_NOTIFIED">Đã báo giá</MenuItem>
                <MenuItem value="NEGOTIATING">Đang thương lượng</MenuItem>
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
                <MenuItem value="PENDING_CONTRACT">Chờ gửi hợp đồng</MenuItem>
                <MenuItem value="COMPLETED">Hoàn tất</MenuItem>
                <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                <MenuItem value="REJECTED_PRICING">Từ chối báo giá</MenuItem>
              </Select>
            </FormControl>
            {designRequests.length === 0 && status === "succeeded" ? (
              <Alert severity="info">No design requests found.</Alert>
            ) : (
              <>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                                            <TableHead>
                          <TableRow>
                            <TableCell>Customer Name</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Requirements</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Total Price</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                    <TableBody>
                      {designRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {getCustomerName(request.customerDetail)}
                          </TableCell>
                          <TableCell>
                            {request.customerDetail?.companyName || "N/A"}
                          </TableCell>
                          <TableCell>{request.requirements}</TableCell>
                          <TableCell>{formatDate(request.createdAt)}</TableCell>
                          <TableCell>
                            {formatCurrency(request.totalPrice)}
                          </TableCell>
                          <TableCell>{getStatusChip(request.status)}</TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleViewDetails(request)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            )}
          </>
        ) : (
          <>
            <FormControl size="small" sx={{ minWidth: 250, mb: 2 }}>
              <InputLabel id="order-status-filter-label">
                Trạng thái đơn hàng
              </InputLabel>
              <Select
                labelId="order-status-filter-label"
                value={selectedOrderStatus}
                label="Trạng thái đơn hàng"
                onChange={handleOrderStatusChange}
              >
                <MenuItem value="">Tất cả</MenuItem>
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
            {orders.length === 0 ? (
              <Alert severity="info">
                Không tìm thấy đơn hàng nào với trạng thái đã chọn.
              </Alert>
            ) : (
              <>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã đơn hàng</TableCell>
                        <TableCell>Khách hàng</TableCell>
                        <TableCell>Địa chỉ</TableCell>
                        <TableCell>Loại đơn hàng</TableCell>
                        <TableCell>Ngày tạo</TableCell>
                        <TableCell>Tổng tiền</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.orderCode || order.id}</TableCell>
                          <TableCell>
                            {order.users?.fullName || "Chưa có thông tin"}
                          </TableCell>
                          <TableCell>
                            {order.address || "Chưa có địa chỉ"}
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
                            />
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            {formatCurrency(order.totalOrderAmount || order.totalAmount)}
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
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleViewOrderDetails(order)}
                              title="Xem chi tiết"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={orderPagination.totalPages || 1}
                    page={orderPage}
                    onChange={handleOrderPageChange}
                    color="primary"
                  />
                </Box>
              </>
            )}
          </>
        )}

        <Dialog
          open={detailOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          {selectedRequest && (
            <>
              <DialogTitle>
                Request Details -{" "}
                {getCustomerName(selectedRequest.customerDetail)}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Requirements
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.requirements}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Company Name
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.customerDetail?.companyName || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Price
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(selectedRequest.totalPrice)}
                    </Typography>
                  </Grid>

                  {/* Pricing Information */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Deposit Amount
                    </Typography>
                    <Typography variant="body1" color="success.main">
                      {formatCurrency(selectedRequest.depositAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Remaining Amount
                    </Typography>
                    <Typography variant="body1" color="info.main">
                      {formatCurrency(selectedRequest.remainingAmount)}
                    </Typography>
                  </Grid>

                  {/* Nếu đã giao task thì hiển thị tag và tên designer */}
                  {selectedRequest &&
                    selectedRequest.status === "ASSIGNED_DESIGNER" && (
                      <Grid item xs={12}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Chip label="Đã giao task" color="success" />
                          <Typography>
                            Designer phụ trách:{" "}
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
                        </Box>
                      </Grid>
                    )}

                  {/* Chỉ hiện mục chọn designer khi status là DEPOSITED hoặc DESIGNER_REJECTED */}
                  {selectedRequest &&
                    (selectedRequest.status === "DEPOSITED" ||
                      selectedRequest.status === "DESIGNER_REJECTED") && (
                      <Grid item xs={6}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Chọn Designer
                        </Typography>
                        <FormControl fullWidth>
                          <InputLabel id="designer-select-label">
                            Designer
                          </InputLabel>
                          <Select
                            labelId="designer-select-label"
                            id="designer-select"
                            value={selectedDesigner}
                            label="Designer"
                            onChange={(e) =>
                              setSelectedDesigner(e.target.value)
                            }
                            disabled={loadingDesigners}
                          >
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            {designers.map((designer) => (
                              <MenuItem key={designer.id} value={designer.id}>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Avatar
                                    src={designer.avatar}
                                    sx={{ width: 24, height: 24, mr: 1 }}
                                  >
                                    {designer.fullName?.charAt(0) || "D"}
                                  </Avatar>
                                  <Typography noWrap>
                                    {designer.fullName}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {loadingDesigners && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              mt: 1,
                            }}
                          >
                            <CircularProgress size={24} />
                          </Box>
                        )}
                      </Grid>
                    )}

                  {/* Báo giá: Nếu đã có proposal thì chỉ hiện tổng giá và tiền cọc, nếu chưa thì hiện ô nhập */}
                  {priceProposals.length > 0 ? (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tổng giá đã báo
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formatCurrency(priceProposals[0].totalPrice)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tiền cọc đã báo
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formatCurrency(priceProposals[0].depositAmount)}
                        </Typography>
                      </Grid>
                    </>
                  ) : (
                    <>
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
                          InputProps={{ inputProps: { min: 0 } }}
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
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Lịch sử báo giá */}
                  <Grid item xs={12}>
                    <Typography variant="h6" mt={2}>
                      Lịch sử báo giá
                    </Typography>
                    {loadingProposals ? (
                      <Box display="flex" justifyContent="center" py={2}>
                        <CircularProgress />
                      </Box>
                    ) : priceProposals.length === 0 ? (
                      <Typography>Chưa có báo giá nào.</Typography>
                    ) : (
                      <Box>
                        {priceProposals.map((proposal) => (
                          <Box
                            key={proposal.id}
                            mb={2}
                            p={2}
                            border={1}
                            borderRadius={2}
                            borderColor="grey.300"
                          >
                            <Typography>
                              <b>Giá báo:</b>{" "}
                              {proposal.totalPrice?.toLocaleString("vi-VN")}₫
                            </Typography>
                            <Typography>
                              <b>Tiền cọc:</b>{" "}
                              {proposal.depositAmount?.toLocaleString("vi-VN")}₫
                            </Typography>
                            {proposal.totalPriceOffer && (
                              <Typography>
                                <b>Giá offer:</b>{" "}
                                {proposal.totalPriceOffer?.toLocaleString(
                                  "vi-VN"
                                )}
                                ₫
                              </Typography>
                            )}
                            {proposal.depositAmountOffer && (
                              <Typography>
                                <b>Cọc offer:</b>{" "}
                                {proposal.depositAmountOffer?.toLocaleString(
                                  "vi-VN"
                                )}
                                ₫
                              </Typography>
                            )}
                            <Typography>
                              <b>Trạng thái:</b> {proposal.status}
                            </Typography>
                            <Typography>
                              <b>Ngày báo giá:</b>{" "}
                              {new Date(proposal.createAt).toLocaleString(
                                "vi-VN"
                              )}
                            </Typography>
                            {/* Nếu trạng thái là PENDING thì Sale được cập nhật lại giá */}
                            {proposal.status === "PENDING" && (
                              <Box mt={1}>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  onClick={() =>
                                    handleOpenUpdateDialog(proposal)
                                  }
                                  disabled={actionLoading}
                                >
                                  Cập nhật lại giá
                                </Button>
                              </Box>
                            )}
                            {/* Nếu trạng thái là NEGOTIATING thì vẫn giữ nút cập nhật nếu cần (nếu muốn) */}
                            {proposal.status === "NEGOTIATING" && (
                              <Box mt={1}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() =>
                                    handleOpenUpdateDialog(proposal)
                                  }
                                  disabled={actionLoading}
                                >
                                  Cập nhật lại giá
                                </Button>
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
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
                  </Grid>
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
        <Dialog
          open={orderDetailOpen}
          onClose={handleCloseOrderDetails}
          maxWidth="md"
          fullWidth
          disableRestoreFocus
          keepMounted={false}
        >
          {selectedOrder && (
            <>
              <DialogTitle>
                Chi tiết đơn hàng #{selectedOrder.id}
                <IconButton
                  aria-label="close"
                  onClick={handleCloseOrderDetails}
                  sx={{ position: "absolute", right: 8, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Khách hàng
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedOrder.users?.fullName || "Chưa có thông tin"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày đặt đơn
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedOrder.orderDate)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tổng tiền
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Đã đặt cọc
                    </Typography>
                    <Typography variant="body1" color="success.main">
                      {formatCurrency(selectedOrder.depositAmount)}
                    </Typography>
                  </Grid>

                  {selectedOrder.remainingAmount > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Còn lại
                      </Typography>
                      <Typography variant="body1" color="info.main">
                        {formatCurrency(selectedOrder.remainingAmount)}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày giao dự kiến
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.estimatedDeliveryDate
                        ? formatDate(selectedOrder.estimatedDeliveryDate)
                        : "Chưa có thông tin"}
                    </Typography>
                  </Grid>
                  {selectedOrder.status === "DEPOSITED" && (
                    <Grid item xs={12}>
                      <Typography variant="h6" mt={2} mb={1}>
                        Cập nhật ngày giao hàng dự kiến
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={6}>
                            <DatePicker
                              label="Ngày giao hàng dự kiến"
                              value={estimatedDeliveryDate}
                              onChange={(newDate) =>
                                setEstimatedDeliveryDate(newDate)
                              }
                              format="dd/MM/yyyy"
                              minDate={new Date()} // Không cho chọn ngày trong quá khứ
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  helperText:
                                    "Chọn ngày giao hàng dự kiến cho đơn hàng",
                                  required: true,
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                handleUpdateEstimatedDeliveryDate(
                                  selectedOrder.id,
                                  estimatedDeliveryDate
                                )
                              }
                              disabled={
                                updatingDeliveryDate || !estimatedDeliveryDate
                              }
                              startIcon={
                                updatingDeliveryDate ? (
                                  <CircularProgress size={20} />
                                ) : null
                              }
                              sx={{ minWidth: 200 }}
                            >
                              {updatingDeliveryDate
                                ? "Đang cập nhật..."
                                : "Cập nhật ngày giao hàng"}
                            </Button>
                          </Grid>
                        </Grid>

                        {/* Hiển thị ngày hiện tại nếu có */}
                        {selectedOrder.estimatedDeliveryDate && (
                          <Box
                            sx={{
                              mt: 2,
                              p: 1,
                              bgcolor: "info.light",
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2" color="info.dark">
                              <strong>Ngày giao hàng hiện tại:</strong>{" "}
                              {new Date(
                                selectedOrder.estimatedDeliveryDate
                              ).toLocaleDateString("vi-VN")}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái hiện tại
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={
                          ORDER_STATUS_MAP[selectedOrder.status]?.label ||
                          selectedOrder.status
                        }
                        color={
                          ORDER_STATUS_MAP[selectedOrder.status]?.color ||
                          "default"
                        }
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nguồn gốc đơn hàng
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {selectedOrder.aiDesigns ? (
                        <Chip
                          icon={<SmartToyIcon />}
                          label="AI Design"
                          color="secondary"
                          sx={{ fontWeight: 500 }}
                        />
                      ) : selectedOrder.customDesignRequests ? (
                        <Chip
                          icon={<BrushIcon />}
                          label="Custom Design"
                          color="primary"
                          sx={{ fontWeight: 500 }}
                        />
                      ) : (
                        <Chip
                          label="Đơn thường"
                          color="default"
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                    </Box>
                  </Grid>
                  {selectedOrder.customerChoiceHistories && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="h6" mt={2}>
                          Thông tin kỹ thuật
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                          <Typography variant="body2" gutterBottom>
                            <b>Loại sản phẩm:</b>{" "}
                            {
                              selectedOrder.customerChoiceHistories
                                .productTypeName
                            }
                          </Typography>

                          {selectedOrder.customerChoiceHistories.sizeSelections
                            ?.length > 0 && (
                            <>
                              <Typography variant="subtitle2" mt={2} mb={1}>
                                Kích thước:
                              </Typography>
                              <TableContainer
                                component={Paper}
                                variant="outlined"
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Loại</TableCell>
                                      <TableCell align="right">
                                        Giá trị
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {selectedOrder.customerChoiceHistories.sizeSelections.map(
                                      (size) => (
                                        <TableRow key={size.size}>
                                          <TableCell>{size.size}</TableCell>
                                          <TableCell align="right">
                                            {size.value}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </>
                          )}

                          {selectedOrder.customerChoiceHistories
                            .attributeSelections?.length > 0 && (
                            <>
                              <Typography variant="subtitle2" mt={2} mb={1}>
                                Vật liệu:
                              </Typography>
                              <TableContainer
                                component={Paper}
                                variant="outlined"
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Thuộc tính</TableCell>
                                      <TableCell>Giá trị</TableCell>
                                      <TableCell align="right">
                                        Đơn giá
                                      </TableCell>
                                      <TableCell align="right">
                                        Thành tiền
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {selectedOrder.customerChoiceHistories.attributeSelections.map(
                                      (attr) => (
                                        <TableRow key={attr.attribute}>
                                          <TableCell>
                                            {attr.attribute}
                                          </TableCell>
                                          <TableCell>{attr.value}</TableCell>
                                          <TableCell align="right">
                                            {formatCurrency(attr.unitPrice)}
                                          </TableCell>
                                          <TableCell align="right">
                                            {formatCurrency(attr.subTotal)}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </>
                          )}
                        </Paper>
                      </Grid>
                    </>
                  )}
                  {/* Custom Design Request Information */}
                  {selectedOrder.customDesignRequests && (
                    <Grid item xs={12}>
                      <Typography variant="h6" mt={2}>
                        Thông tin yêu cầu thiết kế
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                        <Typography variant="body2" gutterBottom>
                          <b>Yêu cầu:</b>{" "}
                          {selectedOrder.customDesignRequests.requirements}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <b>Trạng thái thiết kế:</b>{" "}
                          {CUSTOM_DESIGN_STATUS_MAP[
                            selectedOrder.customDesignRequests.status
                          ]?.label || selectedOrder.customDesignRequests.status}
                        </Typography>
                        {selectedOrder.customDesignRequests
                          .finalDesignImage && (
                          <Box mt={2}>
                            <Typography variant="body2" fontWeight="medium">
                              Thiết kế cuối:
                            </Typography>
                            <Box sx={{ mt: 1, maxWidth: 300 }}>
                              <img
                                src={
                                  selectedOrder.customDesignRequests
                                    .finalDesignImage
                                }
                                alt="Final design"
                                style={{ width: "100%", borderRadius: 4 }}
                              />
                            </Box>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  )}

                  {/* Update Status Section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" mt={2} mb={1}>
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
                                  {/* Ví dụ: khi hợp đồng được gửi qua email hoặc phương thức khác */}
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
                                    } // SỬA LẠI
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
                                    } // Thay đổi từ handleUpdateOrderStatus
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

                                  {/* Thêm thông báo nhắc nhở */}
                                  <Box sx={{ width: "100%", mt: 1 }}>
                                    <Typography
                                      variant="body2"
                                      color="info.main"
                                      sx={{ fontStyle: "italic" }}
                                    >
                                      💡 Đừng quên cập nhật ngày giao hàng dự
                                      kiến trước khi chuyển trạng thái
                                    </Typography>
                                  </Box>
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
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseOrderDetails}>Đóng</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
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
      </Box>
    </LocalizationProvider>
  );
};

export default CustomerRequests;
