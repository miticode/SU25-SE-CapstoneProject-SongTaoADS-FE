import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  Stack,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Song Tạo có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");
    // Gọi API AI ở đây, rồi push tin nhắn bot vào messages
  };

  return (
    <>
      {/* Floating Button with robot icon */}
      {!open && (
        <IconButton
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 9999,
            bgcolor: "var(--color-primary)",
            color: "var(--color-secondary)",
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.15)",
            "&:hover": {
              bgcolor: "var(--color-secondary)",
              color: "var(--color-primary)",
            },
            width: 64,
            height: 64,
            border: "2px solid var(--color-secondary)",
            p: 0,
          }}
          onClick={() => setOpen(true)}
        >
          <Avatar
            src="https://thumbs.dreamstime.com/b/ai-assistant-icon-chat-bot-design-virtual-smart-chatbot-symbol-concept-artificial-intelligence-support-device-generative-361146386.jpg"
            alt="AI Bot"
            sx={{ width: 56, height: 56, bgcolor: "transparent" }}
          />
        </IconButton>
      )}

      {/* Chatbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{
              position: "fixed",
              bottom: 32,
              right: 32,
              zIndex: 9999,
              width: 370,
              height: 540,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Paper
              elevation={10}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 5,
                boxShadow: "0 8px 32px 0 rgba(25, 118, 210, 0.25)",
                border: "2px solid #1976d2",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background:
                    "linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    src="https://thumbs.dreamstime.com/b/ai-assistant-icon-chat-bot-design-virtual-smart-chatbot-symbol-concept-artificial-intelligence-support-device-generative-361146386.jpg"
                    alt="AI Bot"
                    sx={{ bgcolor: "#fff", width: 36, height: 36 }}
                  />
                  <Typography fontWeight={700} fontSize={18}>
                    SongTao AI Chatbot
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => setOpen(false)}
                  sx={{ color: "#fff" }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              {/* Body */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  overflowY: "auto",
                  bgcolor: "#f4f8fb",
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
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor:
                            msg.from === "user"
                              ? "var(--color-primary)"
                              : "var(--color-secondary)",
                          color:
                            msg.from === "user"
                              ? "var(--color-secondary)"
                              : "var(--color-primary)",
                          width: 36,
                          height: 36,
                          boxShadow: 1,
                          border: "1.5px solid var(--color-primary)",
                        }}
                        src={
                          msg.from === "bot"
                            ? "https://thumbs.dreamstime.com/b/ai-assistant-icon-chat-bot-design-virtual-smart-chatbot-symbol-concept-artificial-intelligence-support-device-generative-361146386.jpg"
                            : undefined
                        }
                        alt={msg.from === "bot" ? "AI Bot" : "User"}
                      >
                        {msg.from === "user" ? <PersonIcon /> : null}
                      </Avatar>
                      <Box
                        sx={{
                          bgcolor: msg.from === "user" ? "#1976d2" : "#fff",
                          color: msg.from === "user" ? "#fff" : "#1976d2",
                          px: 2,
                          py: 1.2,
                          borderRadius: 3,
                          maxWidth: "75%",
                          boxShadow: "0 2px 8px 0 rgba(25, 118, 210, 0.08)",
                          fontSize: 15,
                          ml: msg.from === "user" ? 0 : 1,
                          mr: msg.from === "user" ? 1 : 0,
                        }}
                      >
                        {msg.text}
                      </Box>
                    </Box>
                  ))}
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
                  bgcolor: "#f7fbff",
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#90caf9" },
                      "&:hover fieldset": { borderColor: "#1976d2" },
                    },
                  }}
                />
                <IconButton
                  onClick={handleSend}
                  sx={{
                    bgcolor: "var(--color-primary)",
                    color: "var(--color-secondary)",
                    borderRadius: "50%",
                    width: 44,
                    height: 44,
                    ml: 1,
                    border: "1.5px solid var(--color-primary)",
                    p: 0,
                    "&:hover": {
                      bgcolor: "var(--color-secondary)",
                      color: "var(--color-primary)",
                      border: "1.5px solid var(--color-primary)",
                    },
                  }}
                >
                  <SendIcon sx={{ fontSize: 24 }} />
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
