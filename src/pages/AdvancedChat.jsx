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
  }, [dispatch, isAuthenticated]);

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

  const sidebarWidth = 320;

  return (
    <Box 
      sx={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)
          `,
          animation: "float 8s ease-in-out infinite",
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
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
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
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
                    bgcolor: "rgba(99, 102, 241, 0.2)",
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
                src="https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
                alt="AI Bot"
                sx={{ 
                  width: 36, 
                  height: 36, 
                  border: "2px solid rgba(99, 102, 241, 0.3)",
                  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
                }}
              />
            </motion.div>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
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
                    bgcolor: "rgba(99, 102, 241, 0.2)",
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
              background: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Fixed Header */}
            <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(99, 102, 241, 0.2)" }}>
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
                  <CategoryIcon sx={{ color: "#6366f1" }} />
                  Danh mục tư vấn
                </Typography>
              </motion.div>
            </Box>
            
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
                    bgcolor: "rgba(99, 102, 241, 0.4)",
                    borderRadius: 4,
                    "&:hover": {
                      bgcolor: "rgba(99, 102, 241, 0.6)",
                    },
                  },
                  "&::-webkit-scrollbar-track": {
                    bgcolor: "rgba(15, 23, 42, 0.3)",
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
                                bgcolor: selectedTopic?.id === topic.id ? "rgba(99, 102, 241, 0.15)" : "transparent",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                  bgcolor: "rgba(99, 102, 241, 0.1)",
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
                                  <ExpandLessIcon sx={{ color: "#6366f1" }} /> : 
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
                                                bgcolor: "rgba(99, 102, 241, 0.1)",
                                                color: "white",
                                                transform: "translateX(4px)",
                                              },
                                            }}
                                          >
                                            <HelpOutlineIcon sx={{ fontSize: 16, mr: 1, color: "#6366f1" }} />
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
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(24px)",
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
                  bgcolor: "rgba(99, 102, 241, 0.4)",
                  borderRadius: 4,
                  "&:hover": {
                    bgcolor: "rgba(99, 102, 241, 0.6)",
                  },
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "rgba(15, 23, 42, 0.3)",
                },
              }}
            >
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      textAlign: "center",
                      minHeight: "400px",
                    }}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Avatar
                        src="https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
                        sx={{ 
                          width: 120, 
                          height: 120, 
                          mb: 3,
                          boxShadow: "0 0 40px rgba(99, 102, 241, 0.4)",
                          border: "3px solid rgba(99, 102, 241, 0.3)",
                        }}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Typography variant="h4" sx={{ color: "white", mb: 1, fontWeight: 600, textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}>
                        Chào mừng đến với Song Tạo AI Pro
                      </Typography>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Typography variant="h6" color="rgba(156, 163, 175, 0.9)" sx={{ mb: 4, maxWidth: 600 }}>
                        Chọn chủ đề bên trái hoặc nhập câu hỏi để bắt đầu cuộc trò chuyện. 
                        AI sẽ hỗ trợ bạn tư vấn chi tiết về biển quảng cáo.
                      </Typography>
                                             {!isAuthenticated && (
                         <Typography 
                           variant="body1" 
                           color="#ef4444" 
                           sx={{ 
                             mb: 3, 
                             maxWidth: 600,
                             textAlign: "center",
                             fontWeight: 500,
                             bgcolor: "rgba(239, 68, 68, 0.1)",
                             p: 2,
                             borderRadius: 2,
                             border: "1px solid rgba(239, 68, 68, 0.2)"
                           }}
                         >
                           ⚠️ Vui lòng đăng nhập để được hỗ trợ chi tiết từ AI
                         </Typography>
                       )}
                    </motion.div>
                    
                                         <Container maxWidth="md">
                       <Grid container spacing={3}>
                         {[
                           { 
                             icon: <DesignServicesIcon sx={{ fontSize: 40, color: "#6366f1" }} />, 
                             title: "Tư vấn thiết kế", 
                             desc: "Nhận tư vấn thiết kế phù hợp với nhu cầu", 
                             msg: "Tôi muốn tư vấn thiết kế biển quảng cáo",
                             requiresAuth: true
                           },
                           { 
                             icon: <AttachMoneyIcon sx={{ fontSize: 40, color: "#6366f1" }} />, 
                             title: "Báo giá nhanh", 
                             desc: "Nhận báo giá chi tiết và chính xác", 
                             msg: "Tôi muốn báo giá nhanh",
                             requiresAuth: true
                           },
                           { 
                             icon: <SupportAgentIcon sx={{ fontSize: 40, color: "#6366f1" }} />, 
                             title: "Hướng dẫn đặt hàng", 
                             desc: "Quy trình đặt hàng đơn giản", 
                             msg: "Hướng dẫn tôi quy trình đặt hàng",
                             requiresAuth: true
                           },
                           { 
                             icon: <EngineeringIcon sx={{ fontSize: 40, color: "#6366f1" }} />, 
                             title: "Hỗ trợ kỹ thuật", 
                             desc: "Giải đáp mọi thắc mắc kỹ thuật", 
                             msg: "Tôi cần hỗ trợ kỹ thuật",
                             requiresAuth: true
                           }
                         ].map((item, index) => (
                          <Grid item xs={12} sm={6} md={3} key={index}>
                            <motion.div
                              initial={{ opacity: 0, y: 50 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                              whileHover={{ 
                                y: -10,
                                scale: 1.05,
                                transition: { duration: 0.3 }
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card 
                                sx={{ 
                                  background: "rgba(15, 23, 42, 0.8)",
                                  backdropFilter: "blur(24px)",
                                  border: "1px solid rgba(99, 102, 241, 0.2)",
                                  cursor: "pointer",
                                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                  "&:hover": {
                                    background: "rgba(15, 23, 42, 0.9)",
                                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
                                    border: "1px solid rgba(99, 102, 241, 0.4)",
                                  }
                                                                 }} 
                                 onClick={() => {
                                   if (item.requiresAuth && !isAuthenticated) {
                                     dispatch(addUserMessage("Vui lòng đăng nhập để được hỗ trợ"));
                                   } else {
                                     handleSend(item.msg);
                                   }
                                 }}
                               >
                                <CardContent sx={{ p: 3, textAlign: "center" }}>
                                  <motion.div
                                    whileHover={{ scale: 1.2, rotate: 360 }}
                                    transition={{ duration: 0.4 }}
                                  >
                                    {item.icon}
                                  </motion.div>
                                  <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 600, mb: 1, mt: 2 }}>
                                    {item.title}
                                  </Typography>
                                  <Typography variant="body2" color="rgba(156, 163, 175, 0.8)">
                                    {item.desc}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    </Container>
                  </Box>
                </motion.div>
              ) : (
                <Stack spacing={3}>
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
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
                                  bgcolor: msg.from === "user" ? "rgba(99, 102, 241, 0.9)" : "rgba(15, 23, 42, 0.8)",
                                  color: msg.from === "user" ? "#fff" : "#6366f1",
                                  width: 44,
                                  height: 44,
                                  border: msg.from === "user" ? "none" : "2px solid rgba(99, 102, 241, 0.3)",
                                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
                                }}
                                src={
                                  msg.from === "bot"
                                    ? "https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
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
                                  bgcolor: msg.from === "user" ? "rgba(99, 102, 241, 0.9)" : "rgba(15, 23, 42, 0.8)",
                                  color: msg.from === "user" ? "#fff" : "#f3f4f6",
                                  px: 3,
                                  py: 2.5,
                                  borderRadius: 3,
                                  border: msg.from === "bot" ? "1px solid rgba(99, 102, 241, 0.2)" : "none",
                                  fontSize: "1rem",
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-line",
                                  backdropFilter: "blur(16px)",
                                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                                }}
                              >
                                {msg.text}
                              </Paper>
                            </motion.div>
                          </Box>
                        </Fade>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {status === "loading" && (
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
                            bgcolor: "rgba(15, 23, 42, 0.8)",
                            width: 44,
                            height: 44,
                            border: "2px solid rgba(99, 102, 241, 0.3)",
                          }}
                          src="https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
                        />
                        <Paper
                          elevation={0}
                          sx={{
                            bgcolor: "rgba(15, 23, 42, 0.8)",
                            px: 3,
                            py: 2.5,
                            borderRadius: 3,
                            border: "1px solid rgba(99, 102, 241, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            backdropFilter: "blur(16px)",
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

            {/* Input Area */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Box
                sx={{
                  p: 3,
                  background: "rgba(15, 23, 42, 0.8)",
                  backdropFilter: "blur(24px)",
                  borderTop: "1px solid rgba(99, 102, 241, 0.2)",
                  flexShrink: 0,
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
                      placeholder={isAuthenticated ? "Nhập tin nhắn của bạn..." : "Vui lòng đăng nhập để được hỗ trợ..."}
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
                          background: "rgba(15, 23, 42, 0.6)",
                          backdropFilter: "blur(16px)",
                          "& fieldset": {
                            borderColor: "rgba(99, 102, 241, 0.3)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(99, 102, 241, 0.5)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "rgba(99, 102, 241, 0.7)",
                          },
                          "& input, & textarea": {
                            color: "white",
                          },
                          "& .MuiInputBase-input::placeholder": {
                            color: "rgba(156, 163, 175, 0.7)",
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
                        disabled={status === "loading" || !input.trim() || !isAuthenticated}
                        sx={{
                          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                          color: "#fff",
                          width: 56,
                          height: 56,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: "0 8px 25px rgba(99, 102, 241, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                            transform: "rotate(15deg)",
                            boxShadow: "0 12px 35px rgba(99, 102, 241, 0.4)",
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
