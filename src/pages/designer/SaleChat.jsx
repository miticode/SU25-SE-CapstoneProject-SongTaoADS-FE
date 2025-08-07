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
  Card,
  CardContent,
  Stack,
  Container,
  Tooltip,
  Chip,
  Badge,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Message as MessageIcon,
  Circle as CircleIcon,
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Card sx={{ 
        mb: 3, 
        background: "linear-gradient(135deg, #ff6f00 0%, #ff8f00 50%, #ffa000 100%)",
        color: "white",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        },
      }}>
        <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar sx={{ 
              bgcolor: "rgba(255, 255, 255, 0.2)", 
              width: 56, 
              height: 56,
              border: "2px solid rgba(255, 255, 255, 0.3)"
            }}>
              <MessageIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Chat với Sale
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Giao tiếp và trao đổi thông tin với đội ngũ sale
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Danh sách Sale */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a" }}>
                  Danh sách Sale
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {mockSales.filter(sale => sale.status === "online").length} đang online
                </Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {mockSales.map((sale) => (
                  <ListItem
                    key={sale.id}
                    button
                    selected={selectedSale?.id === sale.id}
                    onClick={() => setSelectedSale(sale)}
                    sx={{
                      borderBottom: "1px solid #f1f5f9",
                      "&:hover": {
                        bgcolor: "rgba(255, 111, 0, 0.04)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(255, 111, 0, 0.08)",
                        borderRight: "3px solid #ff6f00",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        badgeContent={
                          <CircleIcon
                            sx={{
                              fontSize: 12,
                              color: sale.status === "online" ? "#22c55e" : "#94a3b8",
                            }}
                          />
                        }
                      >
                        <Avatar
                          sx={{
                            bgcolor: sale.status === "online" ? "#ff6f00" : "#94a3b8",
                            color: "white",
                            fontWeight: 600,
                          }}
                        >
                          {sale.avatar}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={sale.name}
                      secondary={
                        <Chip
                          label={sale.status === "online" ? "Online" : "Offline"}
                          size="small"
                          color={sale.status === "online" ? "success" : "default"}
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      }
                      primaryTypographyProps={{
                        fontWeight: selectedSale?.id === sale.id ? 600 : 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", height: "70vh" }}>
            <CardContent sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}>
              {/* Chat Header */}
              {selectedSale && (
                <Box sx={{ p: 3, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <CircleIcon
                          sx={{
                            fontSize: 12,
                            color: selectedSale.status === "online" ? "#22c55e" : "#94a3b8",
                          }}
                        />
                      }
                    >
                      <Avatar
                        sx={{
                          bgcolor: selectedSale.status === "online" ? "#ff6f00" : "#94a3b8",
                          color: "white",
                          fontWeight: 600,
                        }}
                      >
                        {selectedSale.avatar}
                      </Avatar>
                    </Badge>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {selectedSale.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedSale.status === "online" ? "Đang online" : "Offline"}
                      </Typography>
                    </Box>
                    <IconButton onClick={handleMenuClick}>
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>
                </Box>
              )}

              {/* Messages */}
              <Box sx={{ flexGrow: 1, p: 3, overflow: "auto", bgcolor: "#f8fafc" }}>
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      justifyContent: msg.sender === "designer" ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: "70%",
                        bgcolor: msg.sender === "designer" ? "#ff6f00" : "white",
                        color: msg.sender === "designer" ? "white" : "text.primary",
                        borderRadius: 3,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          opacity: 0.7,
                          fontSize: "0.7rem",
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 3, borderTop: "1px solid #e2e8f0", bgcolor: "white" }}>
                <Stack direction="row" spacing={2} alignItems="flex-end">
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Tooltip title="Gửi tin nhắn" arrow>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      sx={{
                        bgcolor: "#ff6f00",
                        "&:hover": {
                          bgcolor: "#e65100",
                        },
                        borderRadius: 3,
                        minWidth: 48,
                        height: 40,
                      }}
                    >
                      <SendIcon />
                    </Button>
                  </Tooltip>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>Xem thông tin</MenuItem>
        <MenuItem onClick={handleMenuClose}>Chặn tin nhắn</MenuItem>
      </Menu>
    </Container>
  );
};

export default SaleChat;
