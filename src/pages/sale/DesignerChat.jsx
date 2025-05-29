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

// Mock data - sẽ được thay thế bằng API call sau
const mockDesigners = [
  {
    id: 1,
    name: "Designer A",
    avatar: "https://i.pravatar.cc/150?img=1",
    status: "online",
  },
  {
    id: 2,
    name: "Designer B",
    avatar: "https://i.pravatar.cc/150?img=2",
    status: "offline",
  },
];

const mockMessages = [
  {
    id: 1,
    sender: "designer",
    content: "Chào bạn, tôi đã nhận được yêu cầu thiết kế của bạn.",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    sender: "sale",
    content: "Cảm ơn bạn. Khách hàng muốn thay đổi một chút về màu sắc.",
    timestamp: "10:32 AM",
  },
];

const DesignerChat = () => {
  const [selectedDesigner, setSelectedDesigner] = useState(mockDesigners[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "sale",
      content: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
        Designer Chat
      </Typography>

      <Grid container spacing={2} sx={{ height: "100%" }}>
        {/* Designer List */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <List>
              {mockDesigners.map((designer) => (
                <ListItem
                  key={designer.id}
                  button
                  selected={selectedDesigner.id === designer.id}
                  onClick={() => setSelectedDesigner(designer)}
                >
                  <ListItemAvatar>
                    <Avatar src={designer.avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={designer.name}
                    secondary={
                      <Typography
                        variant="caption"
                        color={
                          designer.status === "online"
                            ? "success.main"
                            : "text.secondary"
                        }
                      >
                        {designer.status === "online" ? "Online" : "Offline"}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={9}>
          <Paper
            elevation={0}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar src={selectedDesigner.avatar} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedDesigner.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={
                      selectedDesigner.status === "online"
                        ? "success.main"
                        : "text.secondary"
                    }
                  >
                    {selectedDesigner.status === "online"
                      ? "Online"
                      : "Offline"}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
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
                      msg.sender === "sale" ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: "70%",
                      backgroundColor:
                        msg.sender === "sale" ? "primary.main" : "grey.100",
                      color: msg.sender === "sale" ? "white" : "text.primary",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1">{msg.content}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color:
                          msg.sender === "sale"
                            ? "rgba(255,255,255,0.7)"
                            : "text.secondary",
                      }}
                    >
                      {msg.timestamp}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                display: "flex",
                gap: 2,
              }}
            >
              <IconButton>
                <AttachFileIcon />
              </IconButton>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                Gửi
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Xem thông tin</MenuItem>
        <MenuItem onClick={handleMenuClose}>Xóa cuộc trò chuyện</MenuItem>
      </Menu>
    </Box>
  );
};

export default DesignerChat;
