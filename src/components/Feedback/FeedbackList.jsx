import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Rating,
  Button,
} from "@mui/material";
import { Visibility, Delete } from "@mui/icons-material";

// Mock data
const mockFeedbacks = [
  {
    id: 1,
    orderCode: "DH240001",
    customer: "Nguyễn Văn A",
    rating: 5,
    content: "Dịch vụ rất tốt, sẽ ủng hộ lần sau!",
    status: "PENDING",
    createdAt: "2024-06-01T10:00:00Z",
  },
  {
    id: 2,
    orderCode: "DH240002",
    customer: "Trần Thị B",
    rating: 4,
    content: "Thiết kế đẹp, giao hàng đúng hẹn.",
    status: "RESPONDED",
    createdAt: "2024-06-02T14:30:00Z",
  },
];

const statusMap = {
  PENDING: { label: "Chờ phản hồi", color: "warning" },
  RESPONDED: { label: "Đã phản hồi", color: "success" },
};

const FeedbackList = ({ onView, onDelete }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Danh sách Feedback
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Nội dung</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockFeedbacks.map((fb) => (
              <TableRow key={fb.id} hover>
                <TableCell>{fb.orderCode}</TableCell>
                <TableCell>{fb.customer}</TableCell>
                <TableCell>
                  <Rating value={fb.rating} readOnly size="small" />
                </TableCell>
                <TableCell>
                  <Tooltip title={fb.content}>
                    <span>
                      {fb.content.length > 30
                        ? fb.content.slice(0, 30) + "..."
                        : fb.content}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusMap[fb.status]?.label || fb.status}
                    color={statusMap[fb.status]?.color || "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(fb.createdAt).toLocaleString("vi-VN")}
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => onView(fb)}>
                    <Visibility />
                  </IconButton>
                  <IconButton color="error" onClick={() => onDelete(fb)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FeedbackList;
