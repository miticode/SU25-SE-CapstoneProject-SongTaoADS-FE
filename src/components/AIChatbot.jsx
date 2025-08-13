import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  Stack,
  Avatar,
  Badge,
  Button,
  Tooltip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TuneIcon from "@mui/icons-material/Tune";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest"; // Import SettingsSuggestIcon
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  sendChatMessage,
  addUserMessage,
  selectChatMessages,
  selectChatStatus,
} from "../store/features/chat/chatSlice";
import { selectIsAuthenticated } from "../store/features/auth/authSlice";

const FAQS = [
  "Song Tạo có bảo hành biển quảng cáo không?",
  "Biển hiệu hiện đại là gì?",
  "Bên bạn có những dịch vụ gì nổi bật ?",
  "Cửa hàng địa chỉ ở đâu ?",
];

const TypingIndicator = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      height: 20,
    }}
  >
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: "#6366f1",
        animation: "bounce 1.4s infinite ease-in-out",
        animationDelay: "0s",
      }}
    />
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: "#6366f1",
        animation: "bounce 1.4s infinite ease-in-out",
        animationDelay: "0.2s",
      }}
    />
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: "#6366f1",
        animation: "bounce 1.4s infinite ease-in-out",
        animationDelay: "0.4s",
      }}
    />
    <style>
      {`
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0.6);
            opacity: 0.6;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}
    </style>
  </Box>
);

const AIChatbot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const messages = useSelector(selectChatMessages);
  const status = useSelector(selectChatStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isHover, setIsHover] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem("ai_chatbot_messages", JSON.stringify(messages));
  }, [messages]);

  // Auto focus input when open
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [open]);

  // ESC to close chat
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Click outside to close chat
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Unread badge logic
  useEffect(() => {
    if (!open && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.from === "bot") setUnreadCount((c) => c + 1);
    }
    if (open) setUnreadCount(0);
  }, [messages, open]);

  // Hiển thị thông báo đăng nhập khi mở chatbot lần đầu và chưa đăng nhập
  useEffect(() => {
    if (open && !isAuthenticated && messages.length === 0) {
      dispatch(addUserMessage("Vui lòng đăng nhập để được hỗ trợ"));
    }
  }, [open, isAuthenticated, messages.length, dispatch]);

  const handleSend = async (msg) => {
    if ((!input.trim() && !msg) || status === "loading") return;

    // Kiểm tra trạng thái đăng nhập
    if (!isAuthenticated) {
      dispatch(addUserMessage("Vui lòng đăng nhập để được hỗ trợ"));
      return;
    }

    const userMessage = msg || input.trim();
    setInput("");

    dispatch(addUserMessage(userMessage));
    try {
      await dispatch(sendChatMessage(userMessage)).unwrap();
    } catch {
      // error message đã được xử lý trong slice
    }
  };

  const handleAdvancedToggle = () => {
    navigate("/advanced-chat");
  };

  // Ẩn chatbot khi đang ở trang advanced-chat
  if (location.pathname === "/advanced-chat") {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <Badge
          color="error"
          badgeContent={unreadCount > 0 ? unreadCount : null}
          overlap="circular"
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 9999,
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <IconButton
              sx={{
                bgcolor: "#6366f1",
                color: "#fff",
                width: 68,
                height: 68,
                boxShadow: "0 8px 25px rgba(99, 102, 241, 0.3)",
                "&:hover": {
                  bgcolor: "#4f46e5",
                  boxShadow: "0 12px 35px rgba(99, 102, 241, 0.4)",
                },
              }}
              onClick={() => setOpen(true)}
            >
              <Avatar
                src="https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
                alt="AI Bot"
                sx={{ width: 60, height: 60, bgcolor: "transparent" }}
              />
            </IconButton>
          </motion.div>
        </Badge>
      )}

      {/* Chatbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={chatBoxRef}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              position: "fixed",
              bottom: 32,
              right: 32,
              zIndex: 9999,
              width: 390,
              height: 600,
              display: "flex",
              flexDirection: "column",
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            <Paper
              elevation={3}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#fff",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#6366f1",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    src="https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
                    alt="AI Bot"
                    sx={{ width: 32, height: 32 }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    Song Tạo AI Pro
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => setOpen(false)}
                    sx={{ color: "#fff" }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Tooltip title="Mở chế độ nâng cao">
                    <IconButton
                      size="small"
                      onClick={handleAdvancedToggle}
                      sx={{ color: "#fff" }}
                    >
                      <SettingsSuggestIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Content Area - Scrollable */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  scrollbarWidth: "thin",
                  "&::-webkit-scrollbar": {
                    width: 6,
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(99, 102, 241, 0.3)",
                    borderRadius: 8,
                    "&:hover": {
                      background: "rgba(99, 102, 241, 0.5)",
                    },
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(17, 24, 39, 0.1)",
                  },
                }}
              >
                {/* FAQ Quick Replies */}
                <Box sx={{ px: 2, pt: 2, pb: 1, bgcolor: "#fff" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, color: "#6366f1", fontWeight: 600 }}
                  >
                    Câu hỏi thường gặp:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {FAQS.map((faq, idx) => (
                      <Button
                        key={idx}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: "#6366f1",
                          color: "#6366f1",
                          textTransform: "none",
                          fontSize: 12,
                          borderRadius: 2,
                          mb: 1,
                        }}
                        onClick={() => handleSend(faq)}
                        disabled={status === "loading"}
                      >
                        {faq}
                      </Button>
                    ))}
                  </Stack>
                  {!isAuthenticated && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#ef4444",
                        fontStyle: "italic",
                        display: "block",
                        mt: 1,
                      }}
                    >
                      * Vui lòng đăng nhập để được hỗ trợ chi tiết
                    </Typography>
                  )}
                </Box>

                {/* Chat Messages */}
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    bgcolor: "#fff",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Stack spacing={2}>
                    {messages.map((msg, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          flexDirection:
                            msg.from === "user" ? "row-reverse" : "row",
                          alignItems: "flex-end",
                          gap: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor:
                              msg.from === "user" ? "#6366f1" : "#f1f5f9",
                            color: msg.from === "user" ? "#fff" : "#6366f1",
                            width: 32,
                            height: 32,
                          }}
                          src={
                            msg.from === "bot"
                              ? "https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
                              : undefined
                          }
                        >
                          {msg.from === "user" ? (
                            <PersonIcon fontSize="small" />
                          ) : null}
                        </Avatar>
                        <Box
                          sx={{
                            bgcolor:
                              msg.from === "user" ? "#6366f1" : "#f8fafc",
                            color: msg.from === "user" ? "#fff" : "#1e293b",
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            maxWidth: "70%",
                            fontSize: 14,
                            border:
                              msg.from === "bot" ? "1px solid #e2e8f0" : "none",
                          }}
                        >
                          {msg.text}
                        </Box>
                      </Box>
                    ))}

                    {status === "loading" && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-end",
                          gap: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "#f1f5f9",
                            color: "#6366f1",
                            width: 32,
                            height: 32,
                          }}
                          src="https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
                        />
                        <Box
                          sx={{
                            bgcolor: "#f8fafc",
                            color: "#1e293b",
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <TypingIndicator />
                        </Box>
                      </Box>
                    )}
                    <div ref={messagesEndRef} />
                  </Stack>
                </Box>
              </Box>

              {/* Input Area */}
              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  gap: 1,
                  bgcolor: "#fff",
                  alignItems: "center",
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  placeholder={
                    isAuthenticated
                      ? "Bạn cần hỗ trợ gì?..."
                      : "Vui lòng đăng nhập để được hỗ trợ..."
                  }
                  value={input}
                  inputRef={inputRef}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#e2e8f0" },
                      "&:hover fieldset": { borderColor: "#6366f1" },
                      "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                    },
                  }}
                  disabled={status === "loading" || !isAuthenticated}
                />
                <IconButton
                  onClick={() => handleSend()}
                  disabled={
                    status === "loading" || !input.trim() || !isAuthenticated
                  }
                  sx={{
                    bgcolor: "#6366f1",
                    color: "#fff",
                    "&:hover": {
                      bgcolor: "#4f46e5",
                    },
                    "&:disabled": {
                      bgcolor: "#cbd5e1",
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
