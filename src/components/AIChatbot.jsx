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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TuneIcon from "@mui/icons-material/Tune";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest"; // Import SettingsSuggestIcon
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
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
import { setCurrentThread } from "../store/features/chat/chatSlice";
import { saveChatMessages, clearChatMessages } from "../utils/chatStorage";

const FAQS = [
  "Tôi muốn thiết kế biển quảng cáo",
  "Tôi muốn hỏi về dịch vụ",
  "Tôi muốn đặt biển quảng cáo",
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
        bgcolor: "#ffffff",
        animation: "bounce 1.4s infinite ease-in-out",
        animationDelay: "0s",
      }}
    />
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: "#ffffff",
        animation: "bounce 1.4s infinite ease-in-out",
        animationDelay: "0.2s",
      }}
    />
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: "#ffffff",
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
  const isBusy = status === "loading";

  // Ensure thread is basic when not in advanced route
  useEffect(() => {
    if (location.pathname !== "/advanced-chat") {
      dispatch(setCurrentThread('basic'));
    } else {
      // Đảm bảo khi ở màn nâng cao, thread là advanced
      dispatch(setCurrentThread('advanced'));
    }
  }, [location.pathname, dispatch]);

  // Only render messages for basic thread
  const chatMessages = React.useMemo(
    () => (messages || []).filter((m) => (m.thread || 'basic') === 'basic'),
    [messages]
  );

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, open]);

  // Save messages to localStorage only when authenticated
  useEffect(() => {
    saveChatMessages(messages, isAuthenticated);
  }, [messages, isAuthenticated]);

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
    if (!open && chatMessages.length > 0) {
      const last = chatMessages[chatMessages.length - 1];
      if (last.from === "bot") setUnreadCount((c) => c + 1);
    }
    if (open) setUnreadCount(0);
  }, [chatMessages, open]);

  // Hiển thị thông báo đăng nhập khi mở chatbot lần đầu và chưa đăng nhập
  useEffect(() => {
    if (open && !isAuthenticated && chatMessages.length === 0) {
      dispatch(addUserMessage("Vui lòng đăng nhập để được hỗ trợ"));
    }
  }, [open, isAuthenticated, chatMessages.length, dispatch]);

  // Xóa chat messages khi người dùng chưa đăng nhập để đảm bảo bảo mật
  useEffect(() => {
    if (!isAuthenticated) {
      clearChatMessages();
    }
  }, [isAuthenticated]);

  const handleSend = async (msg) => {
    if ((!input.trim() && !msg) || isBusy) return;

    // Kiểm tra trạng thái đăng nhập
    if (!isAuthenticated) {
      dispatch(addUserMessage("Vui lòng đăng nhập để được hỗ trợ"));
      return;
    }

    const userMessage = msg || input.trim();
    setInput("");

    // Mặc định gửi sang chatbot
    dispatch(addUserMessage(userMessage));
    try {
      await dispatch(sendChatMessage(userMessage)).unwrap();
    } catch {
      // error message đã được xử lý trong slice
    }
  };

  const handleAdvancedToggle = () => {
    dispatch(setCurrentThread('advanced'));
    navigate("/advanced-chat");
  };

  // Tracking is only available in Advanced Chat

  // Ẩn chatbot khi đang ở trang advanced-chat
  if (location.pathname === "/advanced-chat") {
    // đảm bảo khi ở màn nâng cao, thread là advanced
    dispatch(setCurrentThread('advanced'));
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
            zIndex: 1400,
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <IconButton
              sx={{
                bgcolor: "#ffffff",
                color: "#fff",
                width: 68,
                height: 68,
                boxShadow: "0 8px 25px rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  bgcolor: "#f3f4f6",
                  boxShadow: "0 12px 35px rgba(255, 255, 255, 0.4)",
                },
              }}
              onClick={() => setOpen(true)}
            >
              <Avatar
                src="https://i.pinimg.com/originals/90/26/70/902670556722cfd9259344b2f24c8cfc.gif"
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
              zIndex: 1400,
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
                background: "rgba(22, 22, 24, 0.25)",
                backdropFilter: "blur(40px) saturate(200%)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.05)",

              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background: "rgba(22, 22, 24, 0.25)",
                  backdropFilter: "blur(40px) saturate(200%)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    src="https://i.pinimg.com/originals/90/26/70/902670556722cfd9259344b2f24c8cfc.gif"
                    alt="AI Bot"
                    sx={{ 
                      width: 32, 
                      height: 32,
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      boxShadow: "0 4px 20px rgba(255, 255, 255, 0.3)",
                    }}
                  />
                  <Typography variant="h6" fontWeight={600} sx={{ color: "white" }}>
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
                    background: "rgba(255, 255, 255, 0.3)",
                    borderRadius: 8,
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.5)",
                    },
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(22, 22, 24, 0.1)",
                  },
                }}
              >
                {/* FAQ Quick Replies */}
                <Box sx={{ 
                  px: 2, 
                  pt: 2, 
                  pb: 1, 
                  background: "rgba(22, 22, 24, 0.2)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.15)"
                }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, color: "#f8fafc", fontWeight: 600 }}
                  >
                    Câu hỏi thường gặp:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Tooltip
                      title={<Typography variant="caption">Theo dõi đơn hàng hiện có ở Chế độ nâng cao</Typography>}
                      PopperProps={{ sx: { zIndex: 20000 } }}
                    >
                      {/* <span>
                        <Button
                          key="track-order"
                          size="small"
                          variant="contained"
                                                  sx={{
                          bgcolor: "rgba(255, 255, 255, 0.9)",
                          color: "#fff",
                          textTransform: "none",
                          fontSize: 12,
                          borderRadius: 2,
                          mb: 1,
                          boxShadow: "0 4px 15px rgba(255, 255, 255, 0.3)",
                          '&:hover': { 
                            bgcolor: "rgba(255, 255, 255, 1)",
                            boxShadow: "0 6px 20px rgba(255, 255, 255, 0.4)"
                          },
                        }}
                          onClick={handleAdvancedToggle}
                          disabled={isBusy || !isAuthenticated}
                        >
                          Theo dõi đơn hàng
                        </Button>
                      </span> */}
                    </Tooltip>
                    {FAQS.map((faq, idx) => (
                      <Button
                        key={idx}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(255, 255, 255, 0.7)",
                          color: "#f8fafc",
                          textTransform: "none",
                          fontSize: 12,
                          borderRadius: 2,
                          mb: 1,
                          backdropFilter: "blur(8px)",
                          '&:hover': {
                            borderColor: "rgba(255, 255, 255, 0.9)",
                            bgcolor: "rgba(255, 255, 255, 0.15)"
                          }
                        }}
                        onClick={() => handleSend(faq)}
                        disabled={isBusy}
                      >
                        {faq}
                      </Button>
                    ))}
                  </Stack>
                  {!isAuthenticated && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(239, 68, 68, 0.8)",
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
                    background: "rgba(22, 22, 24, 0.15)",
                    backdropFilter: "blur(30px) saturate(150%)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Stack spacing={2}>
                    {chatMessages.map((msg, idx) => (
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
                              msg.from === "user" ? "rgba(99, 102, 241, 0.9)" : "rgba(22, 22, 24, 0.3)",
                            color: msg.from === "user" ? "#ffffff" : "#ffffff",
                            width: 32,
                            height: 32,
                            border: msg.from === "user" ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(255, 255, 255, 0.3)",
                            backdropFilter: "blur(15px)",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          }}
                          src={
                            msg.from === "bot"
                              ? "https://i.pinimg.com/originals/90/26/70/902670556722cfd9259344b2f24c8cfc.gif"
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
                              msg.from === "user" ? "rgba(99, 102, 241, 0.8)" : "rgba(22, 22, 24, 0.25)",
                            color: msg.from === "user" ? "#ffffff" : "#f8fafc",
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            maxWidth: "70%",
                            fontSize: 14,
                            border: "1px solid rgba(255, 255, 255, 0.18)",
                            backdropFilter: "blur(25px) saturate(180%)",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          {msg.text}
                        </Box>
                      </Box>
                    ))}

                    {/* Tracking form is only available in Advanced Chat */}

                    {isBusy && (
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
                            bgcolor: "rgba(22, 22, 24, 0.3)",
                            color: "#ffffff",
                            width: 32,
                            height: 32,
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            backdropFilter: "blur(15px)",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          }}
                          src="https://i.pinimg.com/originals/90/26/70/902670556722cfd9259344b2f24c8cfc.gif"
                        />
                        <Box
                          sx={{
                            bgcolor: "rgba(22, 22, 24, 0.25)",
                            color: "#f8fafc",
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            border: "1px solid rgba(255, 255, 255, 0.18)",
                            backdropFilter: "blur(25px) saturate(180%)",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
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

              {/* Tracking removed in basic chat */}

              {/* Input Area */}
              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                  display: "flex",
                  gap: 1,
                  background: "rgba(22, 22, 24, 0.2)",
                  backdropFilter: "blur(40px) saturate(200%)",
                  alignItems: "center",
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  placeholder={
                    isAuthenticated
                      ? "Nhập thông tin bạn cần tư vấn"
                      : "Vui lòng đăng nhập để được hỗ trợ..."
                  }
                  value={input}
                  inputRef={inputRef}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "rgba(22, 22, 24, 0.2)",
                      backdropFilter: "blur(25px) saturate(180%)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.18)" },
                      "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                      "&.Mui-focused fieldset": { borderColor: "rgba(255, 255, 255, 0.7)" },
                      "& input": { color: "#f8fafc" },
                      "& .MuiInputBase-input::placeholder": { color: "rgba(203, 213, 225, 0.7)" },
                    },
                  }}
                  disabled={isBusy || !isAuthenticated}
                />
                <Tooltip
                  title={<Typography variant="caption">Gợi ý: Bạn có thể hỏi về dịch vụ, quy trình, báo giá...</Typography>}
                  PopperProps={{ sx: { zIndex: 20000 } }}
                >
                  <span>
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.15)",
                        color: "#ffffff",
                        backdropFilter: "blur(15px) saturate(180%)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        "&:hover": { 
                          bgcolor: "rgba(255, 255, 255, 0.25)",
                          boxShadow: "0 4px 15px rgba(255, 255, 255, 0.2)"
                        },
                      }}
                      disabled={!isAuthenticated}
                    >
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <IconButton
                  onClick={() => handleSend()}
                  disabled={
                    isBusy || !input.trim() || !isAuthenticated
                  }
                  sx={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
                    color: "#1f2937",
                    boxShadow: "0 4px 15px rgba(255, 255, 255, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)",
                      boxShadow: "0 6px 20px rgba(255, 255, 255, 0.4)",
                    },
                    "&:disabled": {
                      background: "rgba(156, 163, 175, 0.3)",
                      color: "rgba(156, 163, 175, 0.5)",
                      boxShadow: "none",
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
