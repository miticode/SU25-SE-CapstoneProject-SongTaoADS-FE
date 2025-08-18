import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Stack,
  Avatar,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Paper,
  Card,
  CardContent,
  Container,
  Grid,
  Fade,
  Collapse,
  MenuItem,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import BusinessIcon from "@mui/icons-material/Business";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EngineeringIcon from "@mui/icons-material/Engineering";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import ScheduleIcon from "@mui/icons-material/Schedule";
import InventoryIcon from "@mui/icons-material/Inventory";
import CampaignIcon from "@mui/icons-material/Campaign";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import HandymanIcon from "@mui/icons-material/Handyman";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PrintIcon from "@mui/icons-material/Print";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  sendChatMessage,
  addUserMessage,
  selectChatMessages,
  selectChatStatus,
  trackOrder,
  selectTrackingOrderStatus,
  setLastTrackedOrderCode,
  setCurrentThread,
  addBotMessage,
} from "../store/features/chat/chatSlice";
import {
  fetchAllTopics,
  selectAllTopics,
  selectTopicLoading,
} from "../store/features/topic/topicSlice";
import {
  fetchQuestionsByTopic,
  selectQuestionLoading,
} from "../store/features/question/questionSlice";
import { selectIsAuthenticated } from "../store/features/auth/authSlice";

const TypingIndicator = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, height: 20 }}>
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

const AdvancedChat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messages = useSelector(selectChatMessages);
  const status = useSelector(selectChatStatus);
  const topics = useSelector(selectAllTopics);
  const topicLoading = useSelector(selectTopicLoading);
  const questionLoading = useSelector(selectQuestionLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [input, setInput] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicQuestions, setTopicQuestions] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingType, setTrackingType] = useState("all");
  const [trackingError, setTrackingError] = useState("");
  const [inlineTrackingVisible, setInlineTrackingVisible] = useState(false);
  const trackingStatus = useSelector(selectTrackingOrderStatus);
  const isBusy = status === "loading" || trackingStatus === "loading";
  const ORDER_CODE_RGX = /DH-[A-Z0-9]{10}/i;
  const KEYWORDS = [
    { keys: ["trạng thái"], type: "status" },
    { keys: ["đơn vị thi công", "thi công"], type: "contractor" },
    { keys: ["ngày giao", "giao dự kiến", "hoàn thành dự kiến"], type: "delivery" },
    { keys: ["tổng tiền", "tổng đơn"], type: "total" },
    { keys: ["loại đơn hàng"], type: "orderType" },
  ];

  // Guard to avoid duplicate welcome in StrictMode
  const didWelcomeRef = useRef(false);

  const detectTrackingIntent = (text) => {
    const code = (text.match(ORDER_CODE_RGX) || [])[0];
    if (!code) return null;
    const lower = text.toLowerCase();
    const found = KEYWORDS.find(k => k.keys.some(w => lower.includes(w)));
    const type = found?.type || "all";
    return { code, type };
  };

  const getTopicIcon = (topic) => {
    const title = topic.title?.toLowerCase() || "";
    const description = topic.description?.toLowerCase() || "";
    
    if (title.includes("báo giá") || title.includes("thanh toán")) {
      return <RequestQuoteIcon sx={{ color: "white" }} />;
    }
    if (title.includes("dịch vụ") || title.includes("hỗ trợ")) {
      return <SupportAgentIcon sx={{ color: "white" }} />;
    }
    if (title.includes("quy trình") || title.includes("thời gian")) {
      return <ScheduleIcon sx={{ color: "white" }} />;
    }
    if (title.includes("sản phẩm") || title.includes("chất lượng")) {
      return <InventoryIcon sx={{ color: "white" }} />;
    }
    if (title.includes("tư vấn")) {
      return <BusinessCenterIcon sx={{ color: "white" }} />;
    }
    if (title.includes("thiết kế") || description.includes("design")) {
      return <DesignServicesIcon sx={{ color: "white" }} />;
    }
    if (title.includes("quảng cáo") || title.includes("marketing")) {
      return <CampaignIcon sx={{ color: "white" }} />;
    }
    if (title.includes("màu sắc") || title.includes("color")) {
      return <ColorLensIcon sx={{ color: "white" }} />;
    }
    if (title.includes("sản xuất") || title.includes("gia công")) {
      return <PrecisionManufacturingIcon sx={{ color: "white" }} />;
    }
    if (title.includes("kỹ thuật") || title.includes("technical")) {
      return <HandymanIcon sx={{ color: "white" }} />;
    }
    if (title.includes("in ấn") || title.includes("print")) {
      return <PrintIcon sx={{ color: "white" }} />;
    }
    return <BusinessIcon sx={{ color: "white" }} />;
  };

  useEffect(() => {
    // Chỉ gọi API khi đã đăng nhập
    if (isAuthenticated) {
      dispatch(fetchAllTopics());
    }
    // đặt thread là advanced khi vào màn này
    dispatch(setCurrentThread('advanced'));
  }, [dispatch, isAuthenticated]);

  // Add a single welcome message for the advanced thread when empty
  useEffect(() => {
    if (didWelcomeRef.current) return;
    const advancedMsgs = (messages || []).filter(m => (m.thread || 'basic') === 'advanced');
    if (advancedMsgs.length === 0) {
      didWelcomeRef.current = true;
      dispatch(addBotMessage({ text: 'Xin chào quý khách! Song Tạo có thể giúp gì cho bạn?', thread: 'advanced' }));
    }
  }, [messages, dispatch]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, []);

  // Hiển thị thông báo đăng nhập khi mở Advanced Chat lần đầu và chưa đăng nhập
  useEffect(() => {
    if (!isAuthenticated && messages.length === 0) {
      dispatch(addUserMessage("Vui lòng đăng nhập để được hỗ trợ"));
    }
  }, [isAuthenticated, messages.length, dispatch]);

  const handleSend = async (msg) => {
    if ((!input.trim() && !msg) || isBusy) return;
    
    // Kiểm tra trạng thái đăng nhập
    if (!isAuthenticated) {
      dispatch(addUserMessage("Vui lòng đăng nhập để được hỗ trợ"));
      return;
    }
    
    const userMessage = msg || input.trim();
    setInput("");
    // Nếu đang mở form theo dõi thì ẩn đi để không "dính" form
    if (inlineTrackingVisible) setInlineTrackingVisible(false);
    
    // Nhận diện tracking theo mã đơn
    const intent = detectTrackingIntent(userMessage);
    if (intent) {
      const prompt = buildTrackingPrompt(intent.code, intent.type);
      dispatch(addUserMessage(prompt));
      dispatch(setLastTrackedOrderCode(intent.code.toUpperCase()));
      try {
        await dispatch(trackOrder(prompt)).unwrap();
      } catch {
        // handled in slice
      }
      return;
    }

    // Mặc định gửi sang chatbot
    dispatch(addUserMessage(userMessage));
    try {
      await dispatch(sendChatMessage(userMessage)).unwrap();
    } catch {
      // error handled in slice
    }
  };

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setExpandedTopics(prev => ({
      ...prev,
      [topic.id]: !prev[topic.id]
    }));
    
    if (!topicQuestions[topic.id]) {
      try {
        const result = await dispatch(fetchQuestionsByTopic(topic.id)).unwrap();
        setTopicQuestions(prev => ({
          ...prev,
          [topic.id]: result.questions || result || []
        }));
      } catch (error) {
        console.error('Error loading questions for topic:', topic.id, error);
        setTopicQuestions(prev => ({
          ...prev,
          [topic.id]: []
        }));
      }
    }
  };

  const handleQuestionClick = (question) => {
    handleSend(question.question);
  };

  const buildTrackingPrompt = (code, type) => {
    const c = (code || "").trim();
    if (!c) return "";
    if (type === "status") return `Tôi muốn xem trạng thái đơn hàng ${c}`;
    if (type === "contractor") return `Tôi muốn xem đơn vị thi công đơn hàng ${c}`;
    if (type === "delivery") return `Tôi muốn xem ngày giao dự kiến đơn hàng ${c}`;
    if (type === "total") return `Tôi muốn xem tổng tiền đơn hàng ${c}`;
    if (type === "orderType") return `Tôi muốn xem loại đơn hàng ${c}`;
    return `Tôi muốn xem thông tin đơn hàng ${c}`;
  };

  const handleTrackSubmit = async () => {
    const prompt = buildTrackingPrompt(trackingCode, trackingType);
    if (!prompt) return;
    const valid = ORDER_CODE_RGX.test((trackingCode || "").trim());
    if (!valid) {
      setTrackingError("Mã đơn không hợp lệ. Ví dụ đúng: DH-ABCDEF1234");
      return;
    }
    if (!isAuthenticated) {
      dispatch(addUserMessage("Vui lòng đăng nhập để được hỗ trợ"));
      return;
    }
    dispatch(addUserMessage(prompt));
    setTrackingCode("");
    setTrackingType("all");
    setTrackingError("");
    try {
      dispatch(setLastTrackedOrderCode((trackingCode || "").toUpperCase()));
      await dispatch(trackOrder(prompt)).unwrap();
    } catch {
      // handled in slice
    }
  };

  const sidebarWidth = 320;

  return (
    <Box 
      sx={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        overflow: "hidden",
        background: "#161618",
        position: "relative",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <Box
          sx={{
            background: "rgba(22, 22, 24, 0.25)",
            backdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <IconButton
                color="inherit"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ 
                  color: "white",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    transform: "scale(1.1)",
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Avatar
                src="https://i.pinimg.com/originals/90/26/70/902670556722cfd9259344b2f24c8cfc.gif"
                alt="AI Bot"
                sx={{ 
                  width: 36, 
                  height: 36, 
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 4px 20px rgba(255, 255, 255, 0.3)",
                }}
              />
            </motion.div>
            <Typography variant="h6" sx={{ color: "#f8fafc", fontWeight: 600 }}>
              Song Tạo AI Pro - Chế độ nâng cao
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <IconButton 
                color="inherit" 
                onClick={() => navigate('/')}
                sx={{ 
                  color: "white",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    transform: "scale(1.1)",
                  }
                }}
              >
                <HomeIcon />
              </IconButton>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <IconButton 
                color="inherit" 
                onClick={() => navigate('/')}
                sx={{
                  color: "white",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "rgba(239, 68, 68, 0.2)",
                    transform: "scale(1.1)",
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      {/* Main Content - 2 cột như ChatGPT */}
      <Box sx={{ display: "flex", height: "calc(100vh - 80px)", overflow: "hidden", position: "relative", zIndex: 1 }}>
        {/* Left Sidebar - Topics */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: sidebarOpen ? 0 : -300, opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 20 }}
          style={{ 
            width: sidebarWidth,
            height: "100%",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: sidebarWidth,
              height: "100%",
              background: "rgba(22, 22, 24, 0.25)",
              backdropFilter: "blur(40px) saturate(200%)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Fixed Header */}
            <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(255, 255, 255, 0.15)" }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <CategoryIcon sx={{ color: "#ffffff" }} />
                  Danh mục tư vấn
                </Typography>
              </motion.div>
            </Box>
            
            {/* Tracking panel removed - inline in chat instead */}
            
                         {/* Scrollable Content */}
             {topicLoading ? (
               <Box sx={{ textAlign: "center", py: 4 }}>
                 <motion.div
                   animate={{ rotate: 360 }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 >
                   <Typography color="rgba(156, 163, 175, 0.8)">
                     Đang tải chủ đề...
                   </Typography>
                 </motion.div>
               </Box>
             ) : (
              <Box 
                sx={{ 
                  flex: 1,
                  height: 0,
                  overflowY: "scroll",
                  overflowX: "hidden",
                  "&::-webkit-scrollbar": {
                    width: 8,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "rgba(255, 255, 255, 0.4)",
                    borderRadius: 4,
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.6)",
                    },
                  },
                  "&::-webkit-scrollbar-track": {
                    bgcolor: "rgba(22, 22, 24, 0.3)",
                  },
                }}
              >
                                 <Box sx={{ p: 2.5 }}>
                   {!isAuthenticated || topics?.length === 0 ? (
                     <Box sx={{ py: 2 }}>
                       <Typography color="rgba(156, 163, 175, 0.7)" variant="body2">
                         Không có topics để hiển thị
                       </Typography>
                     </Box>
                   ) : (
                     <List sx={{ p: 0 }}>
                    <AnimatePresence>
                      {topics?.map((topic, index) => (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          style={{ marginBottom: 8 }}
                        >
                          <Box>
                            <ListItemButton
                              onClick={() => handleTopicClick(topic)}
                              sx={{
                                borderRadius: 3,
                                mb: 1,
                                bgcolor: selectedTopic?.id === topic.id ? "rgba(255, 255, 255, 0.15)" : "transparent",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                  bgcolor: "rgba(255, 255, 255, 0.1)",
                                  transform: "translateX(8px)",
                                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
                                },
                              }}
                            >
                              <ListItemIcon>
                                <motion.div
                                  whileHover={{ rotate: 360, scale: 1.1 }}
                                  transition={{ duration: 0.4, ease: "easeInOut" }}
                                >
                                  {getTopicIcon(topic)}
                                </motion.div>
                              </ListItemIcon>
                              <ListItemText
                                primary={topic.title}
                                secondary={topic.description}
                                primaryTypographyProps={{
                                  fontWeight: selectedTopic?.id === topic.id ? 600 : 400,
                                  color: "white",
                                }}
                                secondaryTypographyProps={{
                                  color: "rgba(156, 163, 175, 0.8)",
                                }}
                              />
                              <motion.div
                                animate={{ rotate: expandedTopics[topic.id] ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                {expandedTopics[topic.id] ? 
                                  <ExpandLessIcon sx={{ color: "#ffffff" }} /> : 
                                  <ExpandMoreIcon sx={{ color: "rgba(156, 163, 175, 0.8)" }} />
                                }
                              </motion.div>
                            </ListItemButton>

                            <Collapse in={expandedTopics[topic.id]} timeout="auto">
                              <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
                                {questionLoading && !topicQuestions[topic.id] ? (
                                  <Typography variant="body2" color="rgba(156, 163, 175, 0.7)" sx={{ py: 1 }}>
                                    Đang tải câu hỏi...
                                  </Typography>
                                ) : topicQuestions[topic.id]?.length > 0 ? (
                                  <Stack spacing={0.5}>
                                    <AnimatePresence>
                                      {topicQuestions[topic.id].map((question, qIndex) => (
                                        <motion.div
                                          key={question.id}
                                          initial={{ opacity: 0, x: -30 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: qIndex * 0.05, duration: 0.3 }}
                                          whileHover={{ scale: 1.02, x: 4 }}
                                        >
                                          <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => handleQuestionClick(question)}
                                            sx={{
                                              justifyContent: "flex-start",
                                              textAlign: "left",
                                              textTransform: "none",
                                              fontSize: "0.875rem",
                                              py: 0.8,
                                              px: 1.5,
                                              color: "rgba(156, 163, 175, 0.8)",
                                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                              borderRadius: 2,
                                              "&:hover": {
                                                bgcolor: "rgba(255, 255, 255, 0.1)",
                                                color: "white",
                                                transform: "translateX(4px)",
                                              },
                                            }}
                                          >
                                            <HelpOutlineIcon sx={{ fontSize: 16, mr: 1, color: "#ffffff" }} />
                                            {question.question}
                                          </Button>
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>
                                  </Stack>
                                ) : (
                                  <Typography variant="body2" color="rgba(156, 163, 175, 0.7)" sx={{ py: 1 }}>
                                    Chưa có câu hỏi
                                  </Typography>
                                )}
                              </Box>
                            </Collapse>
                          </Box>
                        </motion.div>
                      ))}
                                         </AnimatePresence>
                   </List>
                   )}
                 </Box>
               </Box>
             )}
           </Box>
         </motion.div>

        {/* Right Content - Chat Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ flexGrow: 1 }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              background: "rgba(22, 22, 24, 0.15)",
              backdropFilter: "blur(30px) saturate(150%)",
              transition: "margin-left 0.3s",
              marginLeft: sidebarOpen ? 0 : `-${sidebarWidth}px`,
              overflow: "hidden",
            }}
          >
            {/* Chat Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 3,
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                  width: 8,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(255, 255, 255, 0.4)",
                  borderRadius: 4,
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.6)",
                  },
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "rgba(22, 22, 24, 0.3)",
                },
              }}
            >
              {messages.filter(m => (m.thread || 'basic') === 'advanced').length === 0 ? (
                <></>
              ) : (
                <Stack spacing={3}>
                  <AnimatePresence>
                    {messages.filter(m => (m.thread || 'basic') === 'advanced').map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <Fade in={true} timeout={400} style={{ transitionDelay: `${idx * 50}ms` }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: msg.from === "user" ? "row-reverse" : "row",
                              alignItems: "flex-start",
                              gap: 2,
                            }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: msg.from === "user" ? "rgba(99, 102, 241, 0.9)" : "rgba(22, 22, 24, 0.8)",
                                  color: msg.from === "user" ? "#ffffff" : "#ffffff",
                                  width: 44,
                                  height: 44,
                                  border: msg.from === "user" ? "none" : "2px solid rgba(255, 255, 255, 0.3)",
                                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
                                }}
                                src={
                                  msg.from === "bot"
                                    ? "https://i.pinimg.com/originals/90/26/70/902670556722cfd9259344b2f24c8cfc.gif"
                                    : undefined
                                }
                              >
                                {msg.from === "user" ? <PersonIcon /> : null}
                              </Avatar>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                              style={{ maxWidth: "70%" }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  bgcolor: msg.from === "user" ? "rgba(99, 102, 241, 0.8)" : "rgba(22, 22, 24, 0.25)",
                                  color: msg.from === "user" ? "#ffffff" : "#f8fafc",
                                  px: 3,
                                  py: 2.5,
                                  borderRadius: 3,
                                  border: "1px solid rgba(255, 255, 255, 0.18)",
                                  fontSize: "1rem",
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-line",
                                  backdropFilter: "blur(25px) saturate(180%)",
                                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                {msg.text}
                              </Paper>
                            </motion.div>
                          </Box>
                        </Fade>
                      </motion.div>
                    ))}
                    {inlineTrackingVisible && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(22, 22, 24, 0.3)',
                              width: 44,
                              height: 44,
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              backdropFilter: 'blur(15px)',
                              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            src="https://i.pinimg.com/originals/90/26/70/902670556722cfd9259344b2f24c8cfc.gif"
                          />
                          <Paper
                            elevation={0}
                            sx={{
                              bgcolor: 'rgba(22, 22, 24, 0.25)',
                              px: 2,
                              py: 1.5,
                              borderRadius: 3,
                              border: '1px solid rgba(255, 255, 255, 0.18)',
                              backdropFilter: 'blur(25px) saturate(180%)',
                              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                              maxWidth: 360,
                              width: '100%'
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ color: '#e2e8f0', mb: 1 }}>
                              Theo dõi đơn hàng
                            </Typography>
                            <Stack spacing={1}>
                              <TextField
                                size="small"
                                label="Mã đơn hàng"
                                placeholder="VD: DH-WUUSCFZHRP"
                                value={trackingCode}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setTrackingCode(v);
                                  if (v && !ORDER_CODE_RGX.test(v.trim())) {
                                    setTrackingError('Mã đơn không hợp lệ. Ví dụ đúng: DH-ABCDEF1234');
                                  } else {
                                    setTrackingError('');
                                  }
                                }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleTrackSubmit(); }}
                                error={Boolean(trackingError)}
                                helperText={trackingError || 'Bắt đầu bằng DH- và 10 ký tự chữ/số'}
                                sx={{
                                  '& .MuiInputLabel-root': { color: '#e2e8f0' },
                                  '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                                  '& .MuiOutlinedInput-root': {
                                    color: '#f8fafc',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                                  },
                                  '& .MuiFormHelperText-root': { color: '#cbd5e1' },
                                  '& .MuiInputBase-input::placeholder': { color: 'rgba(203, 213, 225, 0.7)' }
                                }}
                              />
                              <TextField
                                size="small"
                                select
                                label="Thông tin cần xem"
                                value={trackingType}
                                onChange={(e) => setTrackingType(e.target.value)}
                                sx={{
                                  '& .MuiInputLabel-root': { color: '#e2e8f0' },
                                  '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                                  '& .MuiOutlinedInput-root': {
                                    color: '#f8fafc',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                                  },
                                  '& .MuiSelect-icon': { color: '#e2e8f0' }
                                }}
                              >
                                <MenuItem value="all">Tất cả thông tin</MenuItem>
                                <MenuItem value="status">Trạng thái</MenuItem>
                                <MenuItem value="contractor">Đơn vị thi công</MenuItem>
                                <MenuItem value="delivery">Ngày giao dự kiến</MenuItem>
                                <MenuItem value="total">Tổng tiền</MenuItem>
                                <MenuItem value="orderType">Loại đơn hàng</MenuItem>
                              </TextField>
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button 
                                  size="small" 
                                  onClick={() => setInlineTrackingVisible(false)}
                                  sx={{ color: '#e2e8f0' }}
                                >
                                  Hủy
                                </Button>
                                <Button 
                                  size="small" 
                                  variant="contained" 
                                  onClick={handleTrackSubmit} 
                                  disabled={!trackingCode.trim() || isBusy || !isAuthenticated}
                                  sx={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
                                    color: '#1f2937',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)'
                                    },
                                    '&:disabled': {
                                      background: 'rgba(156, 163, 175, 0.3)',
                                      color: 'rgba(156, 163, 175, 0.7)'
                                    }
                                  }}
                                >
                                  Tra cứu
                                </Button>
                              </Stack>
                            </Stack>
                          </Paper>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {isBusy && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "rgba(22, 22, 24, 0.3)",
                            width: 44,
                            height: 44,
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            backdropFilter: "blur(15px)",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          }}
                          src="https://i.pinimg.com/originals/90/26/70/902670556722cfd9259344b2f24c8cfc.gif"
                        />
                        <Paper
                          elevation={0}
                          sx={{
                            bgcolor: "rgba(22, 22, 24, 0.25)",
                            px: 3,
                            py: 2.5,
                            borderRadius: 3,
                            border: "1px solid rgba(255, 255, 255, 0.18)",
                            display: "flex",
                            alignItems: "center",
                            backdropFilter: "blur(25px) saturate(180%)",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <TypingIndicator />
                        </Paper>
                      </Box>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </Stack>
              )}
            </Box>

            {/* Tracking inline form removed from footer; now shown as a small chat bubble above */}

            {/* Input Area */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Box
                sx={{
                  p: 3,
                  background: "rgba(22, 22, 24, 0.25)",
                  backdropFilter: "blur(40px) saturate(200%)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.18)",
                  flexShrink: 0,
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                }}
              >
                <Container maxWidth="lg">
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-end",
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder={isAuthenticated ? "Nhập thông tin bạn cần tư vấn" : "Vui lòng đăng nhập để được hỗ trợ..."}
                      value={input}
                      inputRef={inputRef}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={status === "loading" || !isAuthenticated}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          background: "rgba(22, 22, 24, 0.25)",
                          backdropFilter: "blur(25px) saturate(180%)",
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.18)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.5)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.7)",
                          },
                          "& input, & textarea": {
                            color: "#f8fafc",
                          },
                          "& .MuiInputBase-input::placeholder": {
                            color: "rgba(203, 213, 225, 0.7)",
                          },
                        },
                      }}
                    />
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <IconButton
                        onClick={() => handleSend()}
                        disabled={isBusy || !input.trim() || !isAuthenticated}
                        sx={{
                          background: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
                          color: "#1f2937",
                          width: 56,
                          height: 56,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: "0 8px 25px rgba(255, 255, 255, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)",
                            transform: "rotate(15deg)",
                            boxShadow: "0 12px 35px rgba(255, 255, 255, 0.4)",
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
                    </motion.div>
                    <Button
                      variant="outlined"
                      onClick={() => setInlineTrackingVisible((v) => !v)}
                      disabled={!isAuthenticated}
                      sx={{
                        textTransform: 'none',
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                        color: '#e2e8f0',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.9)',
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      {inlineTrackingVisible ? 'Ẩn theo dõi' : 'Theo dõi đơn hàng'}
                    </Button>
                  </Box>
                </Container>
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default AdvancedChat;
