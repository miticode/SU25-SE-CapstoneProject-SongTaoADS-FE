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
  Tabs,
  Tab,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Fade,
  Zoom,
  Slide,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SettingsIcon from "@mui/icons-material/Settings";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SpeedIcon from "@mui/icons-material/Speed";
import HelpIcon from "@mui/icons-material/Help";
import InfoIcon from "@mui/icons-material/Info";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BusinessIcon from "@mui/icons-material/Business";
import PaletteIcon from "@mui/icons-material/Palette";
import PaymentIcon from "@mui/icons-material/Payment";
import SupportIcon from "@mui/icons-material/Support";
import HistoryIcon from "@mui/icons-material/History";
import TuneIcon from "@mui/icons-material/Tune";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  sendChatMessage,
  addUserMessage,
  selectChatMessages,
  selectChatStatus,
} from "../store/features/chat/chatSlice";
import {
  fetchAllTopics,
  selectAllTopics,
  selectTopicLoading,
} from "../store/features/topic/topicSlice";
import {
  fetchQuestionsByTopic,
  selectQuestionsByTopic,
  selectQuestionLoading,
} from "../store/features/question/questionSlice";

const FAQS = [
  "Song Tạo có bảo hành biển quảng cáo không?",
  "Biển hiệu hiện đại là gì?",
  "Bên bạn có những dịch vụ gì nổi bật ?",
  "Cửa hàng địa chỉ ở đâu ?",
];



const QUICK_ACTIONS = [
  {
    label: "Tư vấn thiết kế",
    icon: <PaletteIcon />,
    color: "#ff6b35",
    description: "Nhận tư vấn thiết kế phù hợp",
  },
  {
    label: "Báo giá nhanh",
    icon: <PaymentIcon />,
    color: "#4ecdc4",
    description: "Nhận báo giá chi tiết ngay",
  },
  {
    label: "Đặt hàng",
    icon: <BusinessIcon />,
    color: "#45b7d1",
    description: "Hướng dẫn đặt hàng",
  },
  {
    label: "Hỗ trợ kỹ thuật",
    icon: <SupportIcon />,
    color: "#96ceb4",
    description: "Giải đáp thắc mắc kỹ thuật",
  },
];

const ADVANCED_FEATURES = [
  {
    id: "smart_suggestions",
    title: "Gợi ý thông minh",
    description: "AI gợi ý câu hỏi phù hợp với nhu cầu",
    icon: <PsychologyIcon />,
    enabled: true,
  },
  {
    id: "detailed_questions",
    title: "Câu hỏi chi tiết",
    description: "Hướng dẫn khách hàng từng bước",
    icon: <HelpIcon />,
    enabled: true,
  },
  {
    id: "quick_responses",
    title: "Phản hồi nhanh",
    description: "Tối ưu tốc độ trả lời",
    icon: <SpeedIcon />,
    enabled: true,
  },
  {
    id: "context_aware",
    title: "Hiểu ngữ cảnh",
    description: "AI nhớ cuộc trò chuyện trước đó",
    icon: <AutoAwesomeIcon />,
    enabled: true,
  },
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
  const dispatch = useDispatch();
  const messages = useSelector(selectChatMessages);
  const status = useSelector(selectChatStatus);
  const topics = useSelector(selectAllTopics);
  const topicLoading = useSelector(selectTopicLoading);
  
  // Debug topics state
  console.log('🎯 Current topics state:', topics);
  console.log('🎯 Topic loading state:', topicLoading);
  

  const questionsByTopic = useSelector(selectQuestionsByTopic);
  const questionLoading = useSelector(selectQuestionLoading);
  const [topicQuestions, setTopicQuestions] = useState({});
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isHover, setIsHover] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showFAQ, setShowFAQ] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  // Load topics when component mounts
  useEffect(() => {
    dispatch(fetchAllTopics()).then((result) => {
      console.log('🎯 Topics data structure:', result.payload);
    });
  }, [dispatch]);

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
    if ((!input.trim() && !msg) || status === "loading") return;
    const userMessage = msg || input.trim();
    setInput("");
    
    // Chat thông thường
    dispatch(addUserMessage(userMessage));
    try {
      await dispatch(sendChatMessage(userMessage)).unwrap();
    } catch {
      // error message đã được xử lý trong slice
    }
  };

  const handleAdvancedToggle = () => {
    setIsAdvancedMode(!isAdvancedMode);
  };

  const handleQuickAction = (action) => {
    const message = `Tôi muốn ${action.label.toLowerCase()}`;
    handleSend(message);
  };

  const handleDetailedQuestion = (question) => {
    handleSend(question);
  };

  const handleTopicExpand = async (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
    
    // Load questions for this topic if not already loaded
    if (!topicQuestions[topicId]) {
      try {
        const result = await dispatch(fetchQuestionsByTopic(topicId)).unwrap();
        console.log('🎯 Questions data structure for topic', topicId, ':', result);
        setTopicQuestions(prev => ({
          ...prev,
          [topicId]: result.questions || result || []
        }));
      } catch (error) {
        console.error('Error loading questions for topic:', topicId, error);
        setTopicQuestions(prev => ({
          ...prev,
          [topicId]: []
        }));
      }
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
                src="https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
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
              width: isAdvancedMode ? 500 : 390,
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
              {/* Header - Always visible */}
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
                  zIndex: 10,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    src="https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
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
                <Stack direction="row" spacing={1}>
                  <Tooltip title={isAdvancedMode ? "Tắt chế độ nâng cao" : "Bật chế độ nâng cao"}>
                    <IconButton
                      size="small"
                      onClick={handleAdvancedToggle}
                      sx={{ 
                        color: "#fff",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.1)",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <TuneIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={() => setOpen(false)}
                    sx={{ color: "#fff", ml: 1 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Box>

              {/* Advanced Mode Toggle */}
              <Box sx={{ px: 2, pt: 1, pb: 0, bgcolor: "#f4f6fb" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant={isAdvancedMode ? "contained" : "outlined"}
                    onClick={handleAdvancedToggle}
                    sx={{
                      borderColor: "#3949ab",
                      color: isAdvancedMode ? "#fff" : "#3949ab",
                      bgcolor: isAdvancedMode ? "#3949ab" : "transparent",
                      textTransform: "none",
                      fontSize: 12,
                      borderRadius: 999,
                      px: 2,
                      py: 0.5,
                      "&:hover": {
                        bgcolor: isAdvancedMode ? "#1a237e" : "#e8eaf6",
                      },
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Advanced
                  </Button>
                  {isAdvancedMode && (
                    <Chip
                      label="Nâng cao"
                      size="small"
                      color="primary"
                      sx={{ fontSize: 10 }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Advanced Features */}
              {isAdvancedMode && (
                <Box sx={{ px: 2, pt: 1, pb: 0, bgcolor: "#f4f6fb" }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      "& .MuiTab-root": {
                        minWidth: "auto",
                        fontSize: 12,
                        textTransform: "none",
                      },
                    }}
                  >
                    <Tab label="Chat" />
                    <Tab label="Chủ đề" />
                  </Tabs>
                </Box>
              )}

              {/* Content Area - Scrollable */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto", // Main scroll for the entire content area
                  display: "flex",
                  flexDirection: "column",
                  // Scrollbar styles moved from Body to here for the main scroll
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
                {/* Topics Tab */}
                {isAdvancedMode && activeTab === 1 && (
                  <Box sx={{ px: 2, pt: 2, pb: 1, bgcolor: "#f4f6fb" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "#1a237e" }}
                    >
                      Câu hỏi chi tiết theo chủ đề:
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                      {topicLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                          <Typography variant="body2" color="#3949ab">
                            Đang tải chủ đề...
                          </Typography>
                        </Box>
                      ) : topics && topics.length > 0 ? (
                        console.log('🔍 Rendering topics:', topics) ||
                        topics.map((topic) => (
                          <Accordion 
                            key={topic.id} 
                            sx={{ mb: 1 }}
                            expanded={expandedTopics[topic.id] || false}
                            onChange={() => handleTopicExpand(topic.id)}
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="body2" fontWeight={500}>
                                {topic.title}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Stack spacing={1}>
                                {expandedTopics[topic.id] && (
                                  <>
                                    {!topicQuestions[topic.id] && questionLoading ? (
                                      <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
                                        <Typography variant="body2" color="#3949ab" fontSize={11}>
                                          Đang tải câu hỏi...
                                        </Typography>
                                      </Box>
                                    ) : topicQuestions[topic.id] && topicQuestions[topic.id].length > 0 ? (
                                      topicQuestions[topic.id].map((question) => (
                                        <Button
                                          key={question.id}
                                          size="small"
                                          variant="outlined"
                                          onClick={() =>
                                            handleDetailedQuestion(question.question)
                                          }
                                          disabled={status === "loading"}
                                          sx={{
                                            borderColor: "#3949ab",
                                            color: "#3949ab",
                                            textTransform: "none",
                                            fontSize: 11,
                                            textAlign: "left",
                                            justifyContent: "flex-start",
                                            "&:hover": {
                                              borderColor: "#1a237e",
                                              color: "#1a237e",
                                              bgcolor: "#e8eaf6",
                                            },
                                          }}
                                        >
                                          {question.question}
                                        </Button>
                                      ))
                                    ) : (
                                      <Typography variant="body2" color="#666" fontSize={11}>
                                        Chưa có câu hỏi cho chủ đề này
                                      </Typography>
                                    )}
                                  </>
                                )}
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        ))
                      ) : (
                        <Box sx={{ textAlign: "center", p: 2 }}>
                          <Typography variant="body2" color="#666">
                            {topicLoading ? "Đang tải chủ đề..." : "Chưa có chủ đề nào"}
                          </Typography>
                          {!topicLoading && (
                            <Typography variant="caption" color="#999" sx={{ mt: 1, display: "block" }}>
                              Vui lòng thử lại sau hoặc liên hệ hỗ trợ
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* FAQ Quick Replies - Also show in normal mode when not in pricing flow */}
                {!isAdvancedMode && (
                  <Fade in={true} timeout={400}>
                    <Box sx={{ px: 2, pt: 2, pb: 0, bgcolor: "#f4f6fb" }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, color: "#1a237e", fontWeight: 600 }}>
                        Câu hỏi thường gặp:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {FAQS.map((faq, idx) => (
                          <Zoom in={true} style={{ transitionDelay: `${idx * 80}ms` }} key={idx}>
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: "#3949ab",
                                color: "#3949ab",
                                textTransform: "none",
                                fontSize: 13,
                                borderRadius: 2, // Thay đổi từ 999 thành 2 để tạo hình vuông
                                mb: 1,
                                px: 2,
                                py: 0.5,
                                boxShadow: "0 1px 4px 0 rgba(26,35,126,0.04)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  borderColor: "#1a237e",
                                  color: "#1a237e",
                                  bgcolor: "#e8eaf6",
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 2px 8px 0 rgba(26,35,126,0.12)",
                                },
                              }}
                              onClick={() => handleSend(faq)}
                              disabled={status === "loading"}
                            >
                              {faq}
                            </Button>
                          </Zoom>
                        ))}
                      </Stack>
                    </Box>
                  </Fade>
                )}



                {/* Body - Always show in Advanced mode, adjust height based on content */}
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    bgcolor: "#f4f6fb",
                    display: "flex",
                    flexDirection: "column",
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
                              ? "https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
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
                            whiteSpace: "pre-line",
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
                            bgcolor: "#fff",
                            color: "#3949ab",
                            width: 32,
                            height: 32,
                            boxShadow: 1,
                            border: "2px solid #3949ab",
                            mt: 0.5,
                            mr: 1,
                          }}
                          src="https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
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
              </Box>

              {/* Input - Always visible, especially in Advanced mode */}
              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid #e3e3e3",
                  display: "flex",
                  gap: 1,
                  bgcolor: "#fff",
                  alignItems: "center",
                  boxShadow: "0 -2px 8px 0 rgba(26,35,126,0.04)",
                  position: "relative",
                  mt: 0, // Remove margin top when in pricing flow to avoid overlap
                  minHeight: isAdvancedMode ? "80px" : "70px", // Ensure minimum height in Advanced mode
                }}
              >
                  
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={
                      isAdvancedMode
                        ? "Nhập tin nhắn hoặc chọn câu hỏi gợi ý..."
                        : "Bạn cần hỗ trợ gì?..."
                    }
                    value={input}
                    inputRef={inputRef}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    sx={{
                      bgcolor: "#f8f9fa",
                      borderRadius: 999,
                      border: "none",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#e0e3ef" },
                        "&:hover fieldset": { borderColor: "#3949ab" },
                        "&.Mui-focused fieldset": { borderColor: "#1a237e" },
                      },
                      "& .MuiInputBase-input": {
                        color: "#1a237e",
                        fontSize: 15,
                        py: 1.2,
                        fontWeight: 400,
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "#3949ab",
                        opacity: 0.7,
                        fontWeight: 400,
                      },
                      boxShadow: "none",
                    }}
                    disabled={status === "loading"}
                  />
                  <IconButton
                    onClick={() => handleSend()}
                    disabled={status === "loading" || !input.trim()}
                    sx={{
                      bgcolor: "#3949ab",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 44,
                      height: 44,
                      ml: 1,
                      border: `2px solid #3949ab`,
                      p: 0,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "#1a237e",
                        color: "#fff",
                        border: `2px solid #1a237e`,
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

      {/* Advanced Settings Dialog */}
      {/* This section is removed as the settings dialog is removed */}

      {/* Flow nhập từng trường báo giá truyền thống - REMOVED */}
      {/* Hiển thị kết quả báo giá sau khi gọi API - REMOVED */}
    </>
  );
};

export default AIChatbot;
