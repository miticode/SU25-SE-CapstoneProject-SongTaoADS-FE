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
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessageApi } from "../api/chatService";

const FAQS = [
  "Song Tạo có bảo hành biển quảng cáo không?",
  "Biển hiệu hiện đại là gì?",
  "Cửa hàng có mấy loại Decal ?",
  "Công thức tính giá biển hiệu truyền thống?",
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
        bgcolor: "#1a237e",
        animation: "bounce 1.4s infinite ease-in-out",
        animationDelay: "0s",
      }}
    />
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: "#1a237e",
        animation: "bounce 1.4s infinite ease-in-out",
        animationDelay: "0.2s",
      }}
    />
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: "#1a237e",
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
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("ai_chatbot_messages");
    return saved
      ? JSON.parse(saved)
      : [
          {
            from: "bot",
            text: "Xin chào quý khách! Song Tạo có thể giúp gì cho bạn?",
          },
        ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    // eslint-disable-next-line
  }, [messages, open]);

  const handleSend = async (msg) => {
    if ((!input.trim() && !msg) || isLoading) return;
    const userMessage = msg || input.trim();
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setIsLoading(true);
    try {
      const response = await sendChatMessageApi(userMessage);
      if (response.success) {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: response.result },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button with robot icon */}
      {!open && (
        <>
          <Box
            sx={{
              position: "fixed",
              bottom: 100,
              right: 32,
              zIndex: 10000,
              display: isHover ? "block" : "none",
              transition: "opacity 0.2s",
              opacity: isHover ? 1 : 0,
            }}
          >
            <Box
              sx={{
                bgcolor: "#fff",
                border: "1.5px solid #3949ab",
                borderRadius: 2,
                boxShadow: "0 4px 24px 0 rgba(26,35,126,0.10)",
                px: 2,
                py: 1.2,
                minWidth: 180,
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              <div className="text-custom-primary">
                <b>Hỗ trợ 24/7</b>
              </div>
              <div className="text-custom-primary">Tư vấn miễn phí</div>
              <div className="text-custom-primary">Phản hồi nhanh chóng</div>
              <div style={{ fontSize: 13, color: "#3949ab" }}>
                Nhấn để bắt đầu trò chuyện!
              </div>
            </Box>
          </Box>
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
            <IconButton
              sx={{
                bgcolor: "#fff",
                color: "#3949ab",
                boxShadow: "0 4px 16px 0 rgba(26,35,126,0.10)",
                border: "2px solid #3949ab",
                width: 64,
                height: 64,
                p: 0,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#e8eaf6",
                  color: "#1a237e",
                  border: "2px solid #1a237e",
                },
              }}
              onClick={() => setOpen(true)}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              <Avatar
                src="https://thumbs.dreamstime.com/b/ai-assistant-icon-chat-bot-design-virtual-smart-chatbot-symbol-concept-artificial-intelligence-support-device-generative-361146386.jpg"
                alt="AI Bot"
                sx={{ width: 56, height: 56, bgcolor: "transparent" }}
              />
            </IconButton>
          </Badge>
        </>
      )}

      {/* Chatbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={chatBoxRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{
              position: "fixed",
              bottom: 32,
              right: 32,
              zIndex: 9999,
              width: 390,
              height: 600,
              display: "flex",
              flexDirection: "column",
              borderRadius: 20,
              boxShadow: "0 8px 32px 0 rgba(26,35,126,0.18)",
              overflow: "hidden",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                boxShadow: "none",
                overflow: "hidden",
                bgcolor: "#f4f6fb",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background:
                    "linear-gradient(90deg, #1a237e 60%, #3949ab 100%)",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  boxShadow: "0 2px 8px 0 rgba(26,35,126,0.10)",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    src="https://thumbs.dreamstime.com/b/ai-assistant-icon-chat-bot-design-virtual-smart-chatbot-symbol-concept-artificial-intelligence-support-device-generative-361146386.jpg"
                    alt="AI Bot"
                    sx={{
                      bgcolor: "#fff",
                      width: 36,
                      height: 36,
                      boxShadow: 1,
                    }}
                  />
                  <Typography
                    fontWeight={700}
                    fontSize={20}
                    letterSpacing={0.5}
                  >
                    Song Tạo AI Pro 4.1
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => setOpen(false)}
                  sx={{ color: "#fff", ml: 1 }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              {/* FAQ Quick Replies */}
              <Box sx={{ px: 2, pt: 2, pb: 0, bgcolor: "#f4f6fb" }}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {FAQS.map((faq, idx) => (
                    <Button
                      key={idx}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: "#3949ab",
                        color: "#3949ab",
                        textTransform: "none",
                        fontSize: 13,
                        borderRadius: 999,
                        mb: 1,
                        px: 2,
                        py: 0.5,
                        boxShadow: "0 1px 4px 0 rgba(26,35,126,0.04)",
                        "&:hover": {
                          borderColor: "#1a237e",
                          color: "#1a237e",
                          bgcolor: "#e8eaf6",
                        },
                      }}
                      onClick={() => handleSend(faq)}
                      disabled={isLoading}
                    >
                      {faq}
                    </Button>
                  ))}
                </Stack>
              </Box>
              {/* Body */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  overflowY: "auto",
                  bgcolor: "#f4f6fb",
                  display: "flex",
                  flexDirection: "column",
                  scrollbarWidth: "thin",
                  "&::-webkit-scrollbar": {
                    width: 6,
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#e0e3ef",
                    borderRadius: 8,
                  },
                }}
              >
                <Stack spacing={1.5}>
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
                          bgcolor: msg.from === "user" ? "#1a237e" : "#fff",
                          color: msg.from === "user" ? "#fff" : "#3949ab",
                          width: 32,
                          height: 32,
                          boxShadow: 1,
                          border:
                            msg.from === "user"
                              ? "2px solid #1a237e"
                              : "2px solid #3949ab",
                          mt: msg.from === "user" ? 0 : 0.5,
                          ml: msg.from === "user" ? 1 : 0,
                          mr: msg.from === "user" ? 0 : 1,
                        }}
                        src={
                          msg.from === "bot"
                            ? "https://thumbs.dreamstime.com/b/ai-assistant-icon-chat-bot-design-virtual-smart-chatbot-symbol-concept-artificial-intelligence-support-device-generative-361146386.jpg"
                            : undefined
                        }
                        alt={msg.from === "bot" ? "AI Bot" : "User"}
                      >
                        {msg.from === "user" ? (
                          <PersonIcon fontSize="small" />
                        ) : null}
                      </Avatar>
                      <Box
                        sx={{
                          bgcolor: msg.from === "user" ? "#1a237e" : "#fff",
                          color: msg.from === "user" ? "#fff" : "#1a237e",
                          px: 2,
                          py: 1.2,
                          borderRadius: 2.5,
                          maxWidth: "75%",
                          boxShadow:
                            msg.from === "bot"
                              ? "0 2px 8px 0 rgba(26, 35, 126, 0.08)"
                              : "0 1px 4px 0 rgba(26,35,126,0.04)",
                          fontSize: 15,
                          ml: msg.from === "user" ? 0 : 0,
                          mr: msg.from === "user" ? 0 : 0,
                          minHeight: 36,
                          display: "flex",
                          alignItems: "center",
                          borderTopLeftRadius: msg.from === "user" ? 16 : 6,
                          borderTopRightRadius: msg.from === "user" ? 6 : 16,
                          borderBottomLeftRadius: 16,
                          borderBottomRightRadius: 16,
                        }}
                      >
                        {msg.text}
                      </Box>
                    </Box>
                  ))}
                  {isLoading && (
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
                          bgcolor: "#fff",
                          color: "#3949ab",
                          width: 32,
                          height: 32,
                          boxShadow: 1,
                          border: "2px solid #3949ab",
                          mt: 0.5,
                          mr: 1,
                        }}
                        src="https://thumbs.dreamstime.com/b/ai-assistant-icon-chat-bot-design-virtual-smart-chatbot-symbol-concept-artificial-intelligence-support-device-generative-361146386.jpg"
                        alt="AI Bot"
                      />
                      <Box
                        sx={{
                          bgcolor: "#fff",
                          color: "#1a237e",
                          px: 2,
                          py: 1.2,
                          borderRadius: 2.5,
                          maxWidth: "75%",
                          boxShadow: "0 2px 8px 0 rgba(26, 35, 126, 0.08)",
                          fontSize: 15,
                          minHeight: 36,
                          display: "flex",
                          alignItems: "center",
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 6,
                          borderBottomLeftRadius: 16,
                          borderBottomRightRadius: 16,
                        }}
                      >
                        <TypingIndicator />
                      </Box>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Stack>
              </Box>
              {/* Input */}
              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid #e3e3e3",
                  display: "flex",
                  gap: 1,
                  bgcolor: "#fff",
                  alignItems: "center",
                  boxShadow: "0 -2px 8px 0 rgba(26,35,126,0.04)",
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Bạn cần hỗ trợ gì?..."
                  value={input}
                  inputRef={inputRef}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  sx={{
                    bgcolor: "#f8f9fa",
                    borderRadius: 999,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#e0e3ef" },
                      "&:hover fieldset": { borderColor: "#3949ab" },
                      "&.Mui-focused fieldset": { borderColor: "#1a237e" },
                    },
                    "& .MuiInputBase-input": {
                      color: "#1a237e",
                      fontSize: 15,
                      py: 1.2,
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "#3949ab",
                      opacity: 0.7,
                    },
                  }}
                  disabled={isLoading}
                />
                <IconButton
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  sx={{
                    bgcolor: "#3949ab",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 44,
                    height: 44,
                    ml: 1,
                    border: "2px solid #3949ab",
                    p: 0,
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "#1a237e",
                      color: "#fff",
                      border: "2px solid #1a237e",
                    },
                  }}
                >
                  <SendIcon sx={{ fontSize: 26 }} />
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
