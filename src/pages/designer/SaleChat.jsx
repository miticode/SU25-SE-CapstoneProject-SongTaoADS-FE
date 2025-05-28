import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

// Mock data cho danh sách sale
const mockSales = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "A",
    status: "online",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "B",
    status: "offline",
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: "C",
    status: "online",
  },
];

// Mock data cho tin nhắn
const mockMessages = [
  {
    id: 1,
    sender: "sale",
    content: "Chào bạn, có yêu cầu thiết kế mới cần xử lý",
    timestamp: "2024-03-15T10:00:00",
  },
  {
    id: 2,
    sender: "designer",
    content: "Vâng, tôi sẽ xem ngay",
    timestamp: "2024-03-15T10:01:00",
  },
  {
    id: 3,
    sender: "sale",
    content: "Khách hàng cần gấp trong ngày hôm nay",
    timestamp: "2024-03-15T10:02:00",
  },
];

const SaleChat = () => {
  const [selectedSale, setSelectedSale] = useState(mockSales[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "designer",
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ height: "calc(100vh - 100px)" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Chat với Sale
      </Typography>

      <Grid container spacing={2} sx={{ height: "100%" }}>
        {/* Danh sách sale */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: "100%", overflow: "auto" }}>
            <List>
              {mockSales.map((sale) => (
                <React.Fragment key={sale.id}>
                  <ListItem
                    button
                    selected={selectedSale.id === sale.id}
                    onClick={() => setSelectedSale(sale)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor:
                            sale.status === "online"
                              ? "success.main"
                              : "grey.500",
                        }}
                      >
                        {sale.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={sale.name}
                      secondary={
                        sale.status === "online"
                          ? "Đang hoạt động"
                          : "Ngoại tuyến"
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Khu vực chat */}
        <Grid item xs={12} md={9}>
          <Paper
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor:
                      selectedSale.status === "online"
                        ? "success.main"
                        : "grey.500",
                    mr: 2,
                  }}
                >
                  {selectedSale.avatar}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {selectedSale.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSale.status === "online"
                      ? "Đang hoạt động"
                      : "Ngoại tuyến"}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  Xóa cuộc trò chuyện
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>Chặn người dùng</MenuItem>
              </Menu>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.sender === "designer" ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: "70%",
                      bgcolor:
                        msg.sender === "designer" ? "primary.main" : "grey.100",
                      color:
                        msg.sender === "designer" ? "white" : "text.primary",
                    }}
                  >
                    <Typography variant="body1">{msg.content}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color:
                          msg.sender === "designer"
                            ? "rgba(255,255,255,0.7)"
                            : "text.secondary",
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString("vi-VN")}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              <Grid container spacing={2}>
                <Grid item xs>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </Grid>
                <Grid item>
                  <IconButton>
                    <AttachFileIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                  >
                    Gửi
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SaleChat;
