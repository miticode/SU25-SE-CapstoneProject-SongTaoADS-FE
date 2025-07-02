import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
} from "@mui/material";

const statusMap = {
  OPEN: { label: "Mới", color: "warning" },
  IN_PROGRESS: { label: "Đang xử lý", color: "info" },
  RESOLVED: { label: "Đã xử lý", color: "success" },
  CLOSED: { label: "Đã đóng", color: "default" },
};

const TicketDetailDialog = ({ open, ticket, onClose }) => {
  if (!ticket) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chi tiết Ticket</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography>
            <b>Đơn hàng:</b> {ticket.orderCode}
          </Typography>
          <Typography>
            <b>Khách hàng:</b> {ticket.customer}
          </Typography>
          <Typography mt={1}>
            <b>Loại ticket:</b> {ticket.type}
          </Typography>
          <Box mt={1}>
            <Chip
              label={statusMap[ticket.status]?.label || ticket.status}
              color={statusMap[ticket.status]?.color || "default"}
              size="small"
            />
          </Box>
          <Typography mt={1}>
            <b>Ngày tạo:</b>{" "}
            {new Date(ticket.createdAt).toLocaleString("vi-VN")}
          </Typography>
        </Box>
        {/* Lịch sử trao đổi, phản hồi, v.v. có thể bổ sung sau */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketDetailDialog;
