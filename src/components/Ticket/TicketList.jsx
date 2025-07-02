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
  Button,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";

// Mock data
const mockTickets = [
  {
    id: 1,
    orderCode: "DH240001",
    customer: "Nguyễn Văn A",
    type: "Khiếu nại sản phẩm",
    status: "OPEN",
    createdAt: "2024-06-01T10:00:00Z",
  },
  {
    id: 2,
    orderCode: "DH240002",
    customer: "Trần Thị B",
    type: "Yêu cầu hỗ trợ giao hàng",
    status: "IN_PROGRESS",
    createdAt: "2024-06-02T14:30:00Z",
  },
];

const statusMap = {
  OPEN: { label: "Mới", color: "warning" },
  IN_PROGRESS: { label: "Đang xử lý", color: "info" },
  RESOLVED: { label: "Đã xử lý", color: "success" },
  CLOSED: { label: "Đã đóng", color: "default" },
};

const TicketList = ({ onView }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Danh sách Ticket
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Loại ticket</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockTickets.map((tk) => (
              <TableRow key={tk.id} hover>
                <TableCell>{tk.orderCode}</TableCell>
                <TableCell>{tk.customer}</TableCell>
                <TableCell>{tk.type}</TableCell>
                <TableCell>
                  <Chip
                    label={statusMap[tk.status]?.label || tk.status}
                    color={statusMap[tk.status]?.color || "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(tk.createdAt).toLocaleString("vi-VN")}
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => onView(tk)}>
                    <Visibility />
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

export default TicketList;
