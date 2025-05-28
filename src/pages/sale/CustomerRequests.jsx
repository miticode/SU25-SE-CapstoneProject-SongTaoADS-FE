import React, { useState } from "react";
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
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";

// Mock data - sẽ được thay thế bằng API call sau
const mockRequests = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    requestType: "Logo Design",
    status: "pending",
    createdAt: "2024-03-15",
    description: "Cần thiết kế logo cho công ty mới thành lập",
    budget: "2,000,000 VND",
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    requestType: "Banner Design",
    status: "in_progress",
    createdAt: "2024-03-14",
    description: "Thiết kế banner quảng cáo sự kiện",
    budget: "1,500,000 VND",
  },
  {
    id: 3,
    customerName: "Lê Văn C",
    requestType: "Social Media Design",
    status: "completed",
    createdAt: "2024-03-13",
    description: "Thiết kế nội dung cho Facebook và Instagram",
    budget: "3,000,000 VND",
  },
];

const CustomerRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [comment, setComment] = useState("");

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
      pending: {
        icon: <PendingIcon />,
        color: "warning",
        label: "Chờ xử lý",
      },
      in_progress: {
        icon: <PendingIcon />,
        color: "info",
        label: "Đang xử lý",
      },
      completed: {
        icon: <CheckCircleIcon />,
        color: "success",
        label: "Hoàn thành",
      },
      cancelled: {
        icon: <CancelIcon />,
        color: "error",
        label: "Đã hủy",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

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

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Customer Design Requests
      </Typography>

      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Loại yêu cầu</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>#{request.id}</TableCell>
                <TableCell>{request.customerName}</TableCell>
                <TableCell>{request.requestType}</TableCell>
                <TableCell>{request.createdAt}</TableCell>
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

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>Chi tiết yêu cầu #{selectedRequest.id}</DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Khách hàng
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.customerName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loại yêu cầu
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.requestType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngân sách
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.budget}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Ghi chú"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Đóng</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Xử lý gửi ghi chú
                  handleCloseDetails();
                }}
              >
                Gửi ghi chú
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CustomerRequests;
