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
} from "../../store/features/customeDesign/customerDesignSlice";

const CustomerRequests = () => {
  const dispatch = useDispatch();
  const designRequests = useSelector(selectPendingDesignRequests);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    dispatch(fetchPendingDesignRequests({ page: 1, size: 10 }));
  }, [dispatch]);

  const handlePageChange = (event, value) => {
    dispatch(
      fetchPendingDesignRequests({ page: value, size: pagination.pageSize })
    );
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
    setSelectedRequest(null);
    setComment("");
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      PENDING: {
        icon: <PendingIcon />,
        color: "warning",
        label: "Chờ xử lý",
      },
      IN_PROGRESS: {
        icon: <PendingIcon />,
        color: "info",
        label: "Đang xử lý",
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
    };

    const config = statusConfig[status] || statusConfig.PENDING;

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
                  <TableCell>ID</TableCell>
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
                    <TableCell>{request.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      {request.customerChoiceHistories.productTypeName}
                    </TableCell>
                    <TableCell>{request.requirements}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      {formatCurrency(request.customerChoiceHistories.totalAmount)}
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

          {/* Pagination */}
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

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>
              Request Details - {selectedRequest.id.substring(0, 8)}...
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

                {/* Attribute Selections */}
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
                color="success"
                onClick={() => {
                  // Handle approve request - would need additional functionality
                  handleCloseDetails();
                }}
              >
                Approve Request
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CustomerRequests;
