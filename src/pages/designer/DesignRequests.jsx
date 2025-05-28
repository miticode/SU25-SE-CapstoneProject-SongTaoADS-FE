import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import {
  CheckCircle as ConfirmIcon,
  Cancel as RejectIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

// Mock data cho yêu cầu thiết kế
const mockDesignRequests = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    requestType: "Thiết kế logo",
    status: "pending",
    createdAt: "2024-03-15",
    description: "Cần thiết kế logo cho công ty mới thành lập",
    budget: 2000000,
    images: [
      "https://example.com/reference1.jpg",
      "https://example.com/reference2.jpg",
    ],
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    requestType: "Thiết kế banner",
    status: "in_progress",
    createdAt: "2024-03-14",
    description: "Thiết kế banner quảng cáo sự kiện",
    budget: 1500000,
    images: ["https://example.com/reference3.jpg"],
  },
  {
    id: 3,
    customerName: "Lê Văn C",
    requestType: "Thiết kế catalogue",
    status: "completed",
    createdAt: "2024-03-13",
    description: "Thiết kế catalogue sản phẩm mới",
    budget: 3000000,
    images: ["https://example.com/reference4.jpg"],
  },
];

const DesignRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comment, setComment] = useState("");

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setComment("");
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "pending":
        return (
          <Chip
            icon={<ConfirmIcon />}
            label="Chờ xử lý"
            color="warning"
            variant="outlined"
          />
        );
      case "in_progress":
        return (
          <Chip
            icon={<ConfirmIcon />}
            label="Đang thực hiện"
            color="info"
            variant="outlined"
          />
        );
      case "completed":
        return (
          <Chip
            icon={<ConfirmIcon />}
            label="Hoàn thành"
            color="success"
            variant="outlined"
          />
        );
      case "rejected":
        return (
          <Chip
            icon={<RejectIcon />}
            label="Từ chối"
            color="error"
            variant="outlined"
          />
        );
      default:
        return <Chip label={status} />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Yêu Cầu Thiết Kế
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell>ID</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Loại yêu cầu</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Ngân sách</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockDesignRequests.map((request) => (
              <TableRow key={request.id} hover>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.customerName}</TableCell>
                <TableCell>{request.requestType}</TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell>{request.budget.toLocaleString("vi-VN")}₫</TableCell>
                <TableCell>{getStatusChip(request.status)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleViewDetails(request)}
                  >
                    Xem chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog hiển thị chi tiết yêu cầu */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết yêu cầu thiết kế</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Thông tin khách hàng
                </Typography>
                <Typography>Họ tên: {selectedRequest.customerName}</Typography>
                <Typography>
                  Loại yêu cầu: {selectedRequest.requestType}
                </Typography>
                <Typography>
                  Ngân sách: {selectedRequest.budget.toLocaleString("vi-VN")}₫
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Mô tả yêu cầu
                </Typography>
                <Typography>{selectedRequest.description}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Tài liệu tham khảo
                </Typography>
                <Grid container spacing={2}>
                  {selectedRequest.images.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="200"
                          image={image}
                          alt={`Reference ${index + 1}`}
                        />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Tài liệu tham khảo {index + 1}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Xử lý gửi ghi chú
              handleCloseDialog();
            }}
          >
            Gửi ghi chú
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesignRequests;
