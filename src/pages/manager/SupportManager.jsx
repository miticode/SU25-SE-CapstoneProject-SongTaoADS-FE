import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Support as SupportIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { getDesignRequestsNeedSupport } from "../../api/customeDesignService";

const SupportManager = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchSupportRequests();
  }, [page]);

  const fetchSupportRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDesignRequestsNeedSupport(page, pageSize);
      if (response.success) {
        setSupportRequests(response.result || []);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || 0);
      } else {
        setError(response.error || "Không thể tải dữ liệu yêu cầu hỗ trợ");
        setSupportRequests([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Error fetching support requests:", error);
      setError("Đã xảy ra lỗi khi tải dữ liệu");
      setSupportRequests([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchSupportRequests();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "error";
      case "IN_PROGRESS":
        return "warning";
      case "PRICING_NOTIFIED":
        return "info";
      case "COMPLETED":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "PRICING_NOTIFIED":
        return "Đã thông báo giá";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          p: 3,
          borderRadius: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Hỗ trợ (Hệ thống)
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Quản lý yêu cầu thiết kế cần hỗ trợ từ manager
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={`${totalElements} yêu cầu`}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: 600,
            }}
          />
          <Tooltip title="Làm mới dữ liệu" arrow>
            <IconButton
              onClick={handleRefresh}
              sx={{
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  transform: "rotate(180deg)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã yêu cầu</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Yêu cầu</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {supportRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    py={6}
                    color="text.secondary"
                  >
                    <SupportIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Không có yêu cầu cần hỗ trợ
                    </Typography>
                    <Typography variant="body2">
                      Hiện tại không có yêu cầu thiết kế nào cần hỗ trợ từ manager.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              supportRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                    {request.code || ""}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {request.customerDetail?.users?.fullName || ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.customerDetail?.companyName || ""}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {request.requirements || ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(request.status)}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell>
                    <Tooltip title="Xem chi tiết" arrow>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(request)}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && supportRequests.length > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết yêu cầu hỗ trợ</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              {/* Thông tin cơ bản */}
              <Typography variant="h6" sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}>
                Thông tin yêu cầu
              </Typography>
              
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã yêu cầu
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: "primary.main" }}>
                    {selectedRequest.code || ""}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={getStatusText(selectedRequest.status)}
                    color={getStatusColor(selectedRequest.status)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Yêu cầu thiết kế
                </Typography>
                <Typography variant="body1" sx={{ 
                  backgroundColor: "grey.50", 
                  p: 1.5, 
                  borderRadius: 1, 
                  border: "1px solid",
                  borderColor: "grey.200",
                  mt: 0.5
                }}>
                  {selectedRequest.requirements || ""}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(selectedRequest.createdAt)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(selectedRequest.updatedAt)}
                  </Typography>
                </Box>
              </Box>

              {/* Thông tin khách hàng */}
              <Typography variant="h6" sx={{ mb: 2, color: "primary.main", fontWeight: 600, mt: 3 }}>
                Thông tin khách hàng
              </Typography>
              
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ tên
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedRequest.customerDetail?.users?.fullName || ""}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedRequest.customerDetail?.users?.email || ""}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedRequest.customerDetail?.users?.phone || ""}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Công ty
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedRequest.customerDetail?.companyName || ""}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Địa chỉ
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedRequest.customerDetail?.address || ""}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportManager;
