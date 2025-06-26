import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
  Rating,
  TextField,
  Avatar,
  IconButton,
} from "@mui/material";
import { Delete, Image, Send } from "@mui/icons-material";

const statusMap = {
  PENDING: { label: "Chờ phản hồi", color: "warning" },
  RESPONDED: { label: "Đã phản hồi", color: "success" },
};

const FeedbackDetailDialog = ({
  open,
  feedback,
  onClose,
  onRespond,
  onDelete,
  onUpdateImage,
}) => {
  const [response, setResponse] = useState("");
  const [image, setImage] = useState(null);

  if (!feedback) return null;

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chi tiết Feedback</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography>
            <b>Đơn hàng:</b> {feedback.orderCode}
          </Typography>
          <Typography>
            <b>Khách hàng:</b> {feedback.customer}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Typography>
              <b>Rating:</b>
            </Typography>
            <Rating value={feedback.rating} readOnly size="small" />
          </Box>
          <Typography mt={1}>
            <b>Nội dung:</b> {feedback.content}
          </Typography>
          <Box mt={1}>
            <Chip
              label={statusMap[feedback.status]?.label || feedback.status}
              color={statusMap[feedback.status]?.color || "default"}
              size="small"
            />
          </Box>
          <Typography mt={1}>
            <b>Ngày tạo:</b>{" "}
            {new Date(feedback.createdAt).toLocaleString("vi-VN")}
          </Typography>
        </Box>
        {/* Ảnh feedback */}
        <Box mb={2}>
          <Typography fontWeight={600}>Ảnh feedback:</Typography>
          {feedback.imageUrl ? (
            <Avatar
              src={feedback.imageUrl}
              variant="rounded"
              sx={{ width: 120, height: 120, mt: 1 }}
            />
          ) : (
            <Typography color="text.secondary">Chưa có ảnh</Typography>
          )}
          <Box mt={1}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Image />}
              size="small"
            >
              Cập nhật ảnh
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
            {image && (
              <Typography variant="caption" ml={1}>
                {image.name}
              </Typography>
            )}
            {image && (
              <Button
                size="small"
                variant="contained"
                sx={{ ml: 1 }}
                onClick={() => onUpdateImage(image)}
              >
                Lưu ảnh
              </Button>
            )}
          </Box>
        </Box>
        {/* Phản hồi feedback */}
        <Box mb={2}>
          <Typography fontWeight={600}>Phản hồi của Sale:</Typography>
          {feedback.response ? (
            <Box mt={1}>
              <Typography>{feedback.response}</Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Nhập phản hồi..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        {!feedback.response && (
          <Button
            variant="contained"
            color="primary"
            endIcon={<Send />}
            onClick={() => onRespond(response)}
            disabled={!response.trim()}
          >
            Gửi phản hồi
          </Button>
        )}
        <IconButton color="error" onClick={onDelete}>
          <Delete />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDetailDialog;
