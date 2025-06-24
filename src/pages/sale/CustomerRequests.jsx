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
  fetchAllDesignRequests,
  selectAllDesignRequests,
  selectStatus,
  selectError,
  selectPagination,
  assignDesignerToRequest,
  updateRequestStatus,
  CUSTOM_DESIGN_STATUS_MAP,
} from "../../store/features/customeDesign/customerDesignSlice";
import { getCustomerDetailByIdApi } from "../../api/customerService";
import { getUsersByRoleApi } from "../../api/userService";
import { createProposal } from "../../store/features/price/priceSlice";
import {
  getPriceProposals,
  updatePriceProposalPricing,
} from "../../api/priceService";

const CustomerRequests = () => {
  const dispatch = useDispatch();
  const designRequests = useSelector(selectAllDesignRequests);
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

  // State cho form báo giá
  const [priceForm, setPriceForm] = useState({
    totalPrice: "",
    depositAmount: "",
  });
  const [creatingProposal, setCreatingProposal] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("PENDING"); // Mặc định là PENDING

  const [priceProposals, setPriceProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [updateDialog, setUpdateDialog] = useState({
    open: false,
    proposalId: null,
  });
  const [updateForm, setUpdateForm] = useState({
    totalPrice: "",
    depositAmount: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    // Fetch theo status mỗi khi selectedStatus thay đổi
    dispatch(
      fetchAllDesignRequests({ status: selectedStatus, page: 1, size: 10 })
    );
  }, [dispatch, selectedStatus]);

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
    const config = CUSTOM_DESIGN_STATUS_MAP[status] || {
      label: status,
      color: "default",
    };
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
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Custom Design Requests
      </Typography>

      {/* Dropdown filter status */}
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
          <MenuItem value="REVISION_REQUESTED">Yêu cầu chỉnh sửa</MenuItem>
          <MenuItem value="WAITING_FULL_PAYMENT">Chờ thanh toán đủ</MenuItem>
          <MenuItem value="FULLY_PAID">Đã thanh toán đủ</MenuItem>
          <MenuItem value="COMPLETED">Hoàn tất</MenuItem>
          <MenuItem value="CANCEL">Đã hủy</MenuItem>
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
                          {/* Nếu trạng thái là NEGOTIATING thì Sale được cập nhật lại giá */}
                          {proposal.status === "NEGOTIATING" && (
                            <Box mt={1}>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleOpenUpdateDialog(proposal)}
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
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Đóng</Button>
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
                {assigningDesigner ? "Đang giao..." : "Giao task thiết kế"}
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
