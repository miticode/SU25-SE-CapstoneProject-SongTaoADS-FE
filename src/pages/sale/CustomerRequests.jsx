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
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import {
  fetchPendingDesignRequests,
  selectPendingDesignRequests,
  selectStatus,
  selectError,
  selectPagination,
  assignDesignerToRequest,
  updateRequestStatus,
} from "../../store/features/customeDesign/customerDesignSlice";
import { getCustomerDetailByIdApi } from "../../api/customerService";
import { getUsersByRoleApi } from "../../api/userService";

const CustomerRequests = () => {
  const dispatch = useDispatch();
  const designRequests = useSelector(selectPendingDesignRequests);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [customerDetails, setCustomerDetails] = useState({});
  const [loadingCustomers, setLoadingCustomers] = useState({});

  // Thêm state cho designer
  const [designers, setDesigners] = useState([]);
  const [selectedDesigner, setSelectedDesigner] = useState("");
  const [loadingDesigners, setLoadingDesigners] = useState(false);
  const [assigningDesigner, setAssigningDesigner] = useState(false);
  const [assignmentError, setAssignmentError] = useState(null);
  const [rejectingRequest, setRejectingRequest] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", // 'success', 'error', 'info', 'warning'
  });

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    dispatch(fetchPendingDesignRequests({ page: 1, size: 10 }));
  }, [dispatch]);

  // Fetch customer details when design requests load
  useEffect(() => {
    if (designRequests.length > 0) {
      const fetchCustomerDetails = async () => {
        // Create a Set to store unique customerDetailIds
        const uniqueCustomerDetailIds = new Set(
          designRequests
            .filter((request) => request.customerDetail)
            .map((request) => request.customerDetail)
        );

        // Fetch customer details for each unique ID
        for (const customerDetailId of uniqueCustomerDetailIds) {
          if (
            !customerDetails[customerDetailId] &&
            !loadingCustomers[customerDetailId]
          ) {
            // Mark this customer as loading
            setLoadingCustomers((prev) => ({
              ...prev,
              [customerDetailId]: true,
            }));

            try {
              const response = await getCustomerDetailByIdApi(customerDetailId);
              if (response.success) {
                setCustomerDetails((prev) => ({
                  ...prev,
                  [customerDetailId]: response.result,
                }));
              }
            } catch (error) {
              console.error(
                `Error fetching details for customer ${customerDetailId}:`,
                error
              );
            } finally {
              setLoadingCustomers((prev) => ({
                ...prev,
                [customerDetailId]: false,
              }));
            }
          }
        }
      };

      fetchCustomerDetails();
    }
  }, [designRequests]);

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
      fetchPendingDesignRequests({ page: value, size: pagination.pageSize })
    );
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setSelectedDesigner(request.assignDesigner || "");
    setDetailOpen(true);

    // Fetch designers when dialog opens
    fetchDesigners();
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
    setSelectedRequest(null);
    setComment("");
    setSelectedDesigner("");
  };

  const handleDesignerChange = (event) => {
    setSelectedDesigner(event.target.value);
  };

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
          fetchPendingDesignRequests({
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
          fetchPendingDesignRequests({
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
  const getCustomerName = (customerDetailId) => {
    if (!customerDetailId) return "Unknown";

    if (loadingCustomers[customerDetailId]) {
      return <CircularProgress size={16} />;
    }

    const customerDetail = customerDetails[customerDetailId];

    if (!customerDetail) return "Loading...";

    // Return fullName from the users object if available
    if (customerDetail.users && customerDetail.users.fullName) {
      return customerDetail.users.fullName;
    }

    // Fallback to company name if user fullName is not available
    return customerDetail.companyName || "Unnamed Customer";
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      PENDING_CONTRACT: {
        icon: <PendingIcon />,
        color: "warning",
        label: "Chờ ký kết hợp đồng",
      },
      CONTRACT_SENT: {
        icon: <PendingIcon />,
        color: "info",
        label: "Đã gửi hợp đồng",
      },
      CONTRACT_SIGNED: {
        icon: <CheckCircleIcon />,
        color: "success",
        label: "Đã ký kết hợp đồng",
      },
      CONTRACT_DISCUSS: {
        icon: <PendingIcon />,
        color: "info",
        label: "Đang thảo luận hợp đồng",
      },
      CONTRACT_CONFIRMED: {
        icon: <CheckCircleIcon />,
        color: "success",
        label: "Đã xác nhận hợp đồng",
      },
      DEPOSITED: {
        icon: <PendingIcon />,
        color: "info",
        label: "Đã đặt cọc",
      },
      IN_PROGRESS: {
        icon: <PendingIcon />,
        color: "info",
        label: "Đang xử lý",
      },
      PRODUCING: {
        icon: <PendingIcon />,
        color: "info",
        label: "Đang sản xuất",
      },
      PRODUCTION_COMPLETED: {
        icon: <CheckCircleIcon />,
        color: "success",
        label: "Đã hoàn thành sản xuất",
      },
      DELIVERING: {
        icon: <PendingIcon />,
        color: "info",
        label: "Đang vận chuyển",
      },
      INSTALLED: {
        icon: <PendingIcon />,
        color: "info",
        label: "Đang lắp đặt",
      },
      COMPLETED: {
        icon: <CheckCircleIcon />,
        color: "success",
        label: "Hoàn thành",
      },
      CANCELLED: {
        icon: <CancelIcon />,
        color: "error",
        label: "Đã hủy",
      },
      REJECTED: {
        icon: <CancelIcon />,
        color: "error",
        label: "Đã từ chối",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING_CONTRACT;

    return (
      <Chip
        icon={config.icon}
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
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Custom Design Requests
      </Typography>

      {designRequests.length === 0 && status === "succeeded" ? (
        <Alert severity="info">No pending design requests found.</Alert>
      ) : (
        <>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Product Type</TableCell>
                  <TableCell>Requirements</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Total Amount</TableCell>
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
                      {request.customerChoiceHistories.productTypeName}
                    </TableCell>
                    <TableCell>{request.requirements}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      {formatCurrency(
                        request.customerChoiceHistories.totalAmount
                      )}
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
                    Product Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.customerChoiceHistories.productTypeName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(
                      selectedRequest.customerChoiceHistories.totalAmount
                    )}
                  </Typography>
                </Grid>

                {/* Size Selections */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Size Specifications
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Size</TableCell>
                          <TableCell align="right">Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedRequest.customerChoiceHistories.sizeSelections.map(
                          (size) => (
                            <TableRow key={size.size}>
                              <TableCell>{size.size}</TableCell>
                              <TableCell align="right">{size.value}</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Material Specifications */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Material Specifications
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Attribute</TableCell>
                          <TableCell>Value</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedRequest.customerChoiceHistories.attributeSelections.map(
                          (attr) => (
                            <TableRow key={attr.attribute}>
                              <TableCell>{attr.attribute}</TableCell>
                              <TableCell>{attr.value}</TableCell>
                              <TableCell>{attr.unit}</TableCell>
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
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Formula
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      my: 1,
                      p: 1,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                    }}
                  >
                    {selectedRequest.customerChoiceHistories.calculateFormula}
                  </Typography>
                </Grid>

                {/* Assign Designer Section */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Assign Designer
                  </Typography>

                  <FormControl fullWidth>
                    <InputLabel id="designer-select-label">Designer</InputLabel>
                    <Select
                      labelId="designer-select-label"
                      id="designer-select"
                      value={selectedDesigner}
                      label="Designer"
                      onChange={handleDesignerChange}
                      disabled={loadingDesigners}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {designers.map((designer) => (
                        <MenuItem key={designer.id} value={designer.id}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              src={designer.avatar}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            >
                              {designer.fullName?.charAt(0) || "D"}
                            </Avatar>
                            <Typography>{designer.fullName}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {loadingDesigners && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Handle submit comment
                  handleCloseDetails();
                }}
              >
                Submit Notes
              </Button>
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
                {rejectingRequest ? "Rejecting..." : "Reject"}
              </Button>
              <Button
                variant="contained"
                color="success"
                disabled={
                  !selectedDesigner || assigningDesigner || loadingDesigners
                }
                onClick={handleAssignDesigner}
                startIcon={
                  assigningDesigner ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {assigningDesigner ? "Assigning..." : "Assign Designer"}
              </Button>
            </DialogActions>
            {assignmentError && (
              <Box sx={{ px: 3, pb: 2 }}>
                <Alert severity="error">{assignmentError}</Alert>
              </Box>
            )}
          </>
        )}
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
    </Box>
  );
};

export default CustomerRequests;
