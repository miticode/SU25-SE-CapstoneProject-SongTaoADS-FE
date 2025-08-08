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
  getTraditionalPricing,
  getModernPricing,
} from "../store/features/chat/chatSlice";

const FAQS = [
  "Song Tạo có bảo hành biển quảng cáo không?",
  "Biển hiệu hiện đại là gì?",
  "Bên bạn có những dịch vụ gì nổi bật ?",
  "Cửa hàng địa chỉ ở đâu ?",
];

// Advanced detailed questions by category
const DETAILED_QUESTIONS = {
  "Thiết kế & Sản xuất": [
    "Tôi muốn thiết kế biển hiệu cho cửa hàng ăn, có gợi ý gì không?",
    "Biển LED có tốn điện không và tuổi thọ bao lâu?",
    "Có thể thiết kế biển hiệu theo phong cách vintage không?",
    "Quy trình sản xuất biển hiệu mất bao lâu?",
    "Có thể xem mẫu thiết kế trước khi sản xuất không?",
    "Biển hiệu ngoài trời có chống nước không?",
  ],
  "Báo giá & Thanh toán": [
    "Bảng giá biển hiệu có cập nhật mới nhất không?",
    "Có chương trình khuyến mãi cho khách hàng mới không?",
    "Thanh toán có thể trả góp không?",
    "Có giảm giá khi đặt số lượng lớn không?",
    "Phí vận chuyển và lắp đặt tính như thế nào?",
    "Có bảo hành miễn phí không?",
  ],
  "Dịch vụ & Hỗ trợ": [
    "Có dịch vụ lắp đặt tại nhà không?",
    "Có bảo trì định kỳ không?",
    "Thời gian làm việc và liên hệ khẩn cấp?",
    "Có hỗ trợ thiết kế miễn phí không?",
    "Có thể chỉnh sửa thiết kế sau khi đặt hàng không?",
    "Có dịch vụ bảo hành mở rộng không?",
  ],
  "Sản phẩm & Chất lượng": [
    "Chất liệu nào bền nhất cho biển ngoài trời?",
    "Có biển hiệu phù hợp với không gian nhỏ không?",
    "Biển hiệu có thể tùy chỉnh kích thước không?",
    "Có biển hiệu thân thiện môi trường không?",
    "Chất liệu nào phù hợp cho biển trong nhà?",
    "Có biển hiệu chống cháy không?",
  ],
  "Quy trình & Thời gian": [
    "Quy trình đặt hàng như thế nào?",
    "Thời gian sản xuất biển hiệu mất bao lâu?",
    "Có thể gấp rút trong 24h không?",
    "Quy trình thanh toán và giao hàng?",
    "Có thể theo dõi tiến độ sản xuất không?",
    "Thời gian bảo hành và sửa chữa?",
  ],
};

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

const PRICING_FIELDS = [
  { 
    key: "frame", 
    label: "CHỌN KHUNG BẢNG", 
    placeholder: "VD: Chọn khung sắt vuông cùng với kích thước của bạn",
    suggestions: ["Sắt vuông 20x20x1mm", "Sắt vuông 25x25x0.9mm", "Sắt vuông 25x25x1mm", "Sắt vuông 30x30x1mm", "Sắt vuông 30x30x1.2mm"]
  },
  { 
    key: "background", 
    label: "CHỌN NỀN BẢNG", 
    placeholder: "VD: Chọn nền bảng",
    suggestions: ["Không lót tôn ", "Lót tôn dầy 6dem", "Lót tôn mỏng 4dem"]
  },
  { 
    key: "border", 
    label: "CHỌN VIỀN BẢNG", 
    placeholder: "VD:Chọn chất liệu làm viền bảng",
    suggestions: ["Nhôm V20 trắng mờ", "Nhôm V20 trắng sữa", "V inox vàng/ trắng"]
  },
  { 
    key: "numberOfFaces", 
    label: "SỐ MẶT BẢNG", 
    placeholder: "VD: 1 mặt, 2 mặt, 3 mặt...",
    suggestions: ["1", "2", "3", "4"]
  },
  { 
    key: "billboardFace", 
    label: "CHỌN MẶT BẢNG", 
    placeholder: "VD: Chọn chất liệu làm mặt bảng",
    suggestions: ["Căng bạt thường dầy 320gsm", "Căng bạt 2da dầy 360gsm", "Hộp đèn bạt thường", "Dán decal trắng, cán màng bóng","Dán decal trắng in UV"]
  },
  {
    key: "installationMethod",
    label: "QUY CÁCH GẮN",
    placeholder: "VD: Chọn quy cách gắn",
    suggestions: ["Gắn trên mái", "Chân tự đứng", "Chôn trụ phi 60", "Chôn trụ phi 90", "Hộp đèn treo"]
  },
 
  { 
    key: "height", 
    label: "CHIỀU CAO (m)?", 
    placeholder: "VD: 1.5, 2.0, 3.0...(đơn vị mét)",
    suggestions: ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0"]
  },
  { 
    key: "width", 
    label: "CHIỀU NGANG (m)?", 
    placeholder: "VD: 1.0, 1.5, 2.0...(đơn vị mét)",
    suggestions: ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0"]
  },
];

const MODERN_PRICING_FIELDS = [
  { 
    key: "frame", 
    label: "CHỌN KHUNG BẢNG", 
    placeholder: "VD: Chọn khung sắt vuông cùng với kích thước của bạn",
    suggestions: ["Sắt vuông 20x20x1mm", "Sắt vuông 25x25x0.9mm", "Sắt vuông 25x25x1mm", "Sắt vuông 30x30x1mm", "Sắt vuông 30x30x1.2mm"]
  },
  { 
    key: "background", 
    label: "CHỌN NỀN BẢNG ", 
    placeholder: "VD: Alu Arado, Alu Alcorest , Alu Trieuchen, tấm Pima...",
    suggestions: ["Alu Arado 3mm (rẻ)", "Alu Alcorest 3mm (thường)", "Alu Trieuchen 3mm (tốt)", "Tấm pima (nhựa giả đá) ", "Nhựa giả gỗ dạng sóng cao 0.15 x 2.9m"]
  },
  { 
    key: "border", 
    label: "CHỌN VIỀN BẢNG", 
    placeholder: "VD: Chọn viền sắt vuông cùng với kích thước của bạn",
    suggestions: ["Nhôm V20 trắng mờ", "V inox vàng/ trắng", "Viền giật hộp Alu thường không đèn", "Viền giật hộp mica có đèn led sáng", "Viền LED bát sáng full màu"]
  },
  { 
    key: "textAndLogo", 
    label: "CHẤT LIỆU CHỮ VÀ LOGO", 
    placeholder: "VD: Chọn chất liệu chữ và logo",
    suggestions: ["Mica Đài Loan 2mm ", "Alu Alcorest 3mm (thường)", "Chữ Inox, mặt inox không đèn", "Chữ Inox, mặt inox mica", "Chữ hạt Acrylic đổ keo", "Mica hút nổi"]
  },
  { 
    key: "textSpecification", 
    label: "QUY CÁCH CHỮ", 
    placeholder: "VD: Chọn quy cách chữ",
    suggestions: ["Dán trực tiếp (Dán dẹt)", "Form 3mm cao 3cm", "Hông form có đèn LED âm", "LED âm loại thường", "LED âm loại tốt"]
  },
  {
    key: "installationMethod",
    label: "QUY CÁCH GẮN?",
    placeholder: "VD: Treo tường, cắm đất, dán kính...",
    suggestions: ["Gắn trên mái", "Chân tự đứng", "Chôn trụ phi 60", "Chôn trụ phi 90", "Hộp đèn treo"]
  },
  { 
    key: "height", 
    label: "CHIỀU CAO (m)?", 
    placeholder: "VD: 1.5, 2.0, 3.0...(đơn vị mét)",
    suggestions: ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0"]
  },
  { 
    key: "width", 
    label: "CHIỀU NGANG (m)?", 
    placeholder: "VD: 1.0, 1.5, 2.0...(đơn vị mét)",
    suggestions: ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0"]
  },
  { 
    key: "textSize", 
    label: "KÍCH THƯỚC CHỮ", 
    placeholder: "VD: 1.0, 1.5, 2.0...(đơn vị mét)",
    suggestions: ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0"]
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
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isHover, setIsHover] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showFAQ, setShowFAQ] = useState(true);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);
  const [isPricingFlow, setIsPricingFlow] = useState(false);
  const [pricingType, setPricingType] = useState("traditional"); // "traditional" or "modern"
  const [pricingStep, setPricingStep] = useState(0);
  const [pricingData, setPricingData] = useState({});
  const [pricingResult, setPricingResult] = useState(null);
  const [pricingError, setPricingError] = useState(null);
  const [currentPricingInput, setCurrentPricingInput] = useState("");

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
    
    // Nếu đang ở flow báo giá
    if (isPricingFlow) {
      const fields = pricingType === "traditional" ? PRICING_FIELDS : MODERN_PRICING_FIELDS;
      const field = fields[pricingStep];
      const nextData = { ...pricingData, [field.key]: userMessage };
      setPricingData(nextData);
      
      if (pricingStep < fields.length - 1) {
        setPricingStep(pricingStep + 1);
        // Không thêm câu hỏi vào chat, chỉ cập nhật step
      } else {
        // Hoàn thành flow báo giá - gọi API
        setIsPricingFlow(false);
        setCurrentPricingInput("");
        
        try {
          const result = pricingType === "traditional" 
            ? await dispatch(getTraditionalPricing(nextData)).unwrap()
            : await dispatch(getModernPricing(nextData)).unwrap();
            
          if (result && Array.isArray(result)) {
            // Hiển thị kết quả báo giá trực tiếp trong chat, không gọi API chat
            const pricingResult = result.join('\n');
            dispatch(addUserMessage(`Báo giá ${pricingType === "traditional" ? "truyền thống" : "hiện đại"}: ${pricingResult}`));
          } else {
            dispatch(addUserMessage("Không thể tính toán báo giá. Vui lòng thử lại."));
          }
        } catch (err) {
          dispatch(addUserMessage(`Lỗi khi báo giá: ${err.message || "Không xác định"}`));
        }
      }
      return;
    }
    
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

  const handleStartPricingFlow = (type = "traditional") => {
    setIsPricingFlow(true);
    setPricingType(type);
    setPricingStep(0);
    setPricingData({});
    setCurrentPricingInput("");
    // Không thêm vào chat, chỉ hiển thị câu hỏi trong pricing flow
  };

  const handleCancelPricingFlow = () => {
    setIsPricingFlow(false);
    setPricingType("traditional");
    setPricingStep(0);
    setPricingData({});
    setCurrentPricingInput("");
    setPricingResult(null);
    setPricingError(null);
    // Không thêm vào chat, chỉ reset state
  };

  const handlePricingInputChange = (e) => {
    setCurrentPricingInput(e.target.value);
  };

  const handlePricingInputSubmit = () => {
    if (currentPricingInput.trim()) {
      handleSend(currentPricingInput);
      setCurrentPricingInput("");
    }
  };

  const handlePricingInputKeyDown = (e) => {
    if (e.key === "Enter" && currentPricingInput.trim()) {
      handlePricingInputSubmit();
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
                    <Tab label="Hướng dẫn" />
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
                {/* Quick Actions Tab */}
                {isAdvancedMode && activeTab === 1 && (
                  <Box sx={{ px: 2, pt: 2, pb: 1, bgcolor: "#f4f6fb" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "#1a237e" }}
                    >
                      Hành động nhanh:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      sx={{ mb: 2 }}
                    >
                      {QUICK_ACTIONS.map((action, idx) => (
                        <Chip
                          key={idx}
                          label={action.label}
                          icon={action.icon}
                          onClick={() => handleQuickAction(action)}
                          sx={{
                            bgcolor: action.color,
                            color: "#fff",
                            fontSize: 11,
                            "&:hover": {
                              bgcolor: action.color,
                              opacity: 0.8,
                            },
                          }}
                        />
                      ))}
                    </Stack>

                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, color: "#1a237e" }}
                    >
                      Câu hỏi chi tiết theo chủ đề:
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                      {Object.entries(DETAILED_QUESTIONS).map(
                        ([category, questions]) => (
                          <Accordion key={category} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="body2" fontWeight={500}>
                                {category}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Stack spacing={1}>
                                {questions.map((question, idx) => (
                                  <Button
                                    key={idx}
                                    size="small"
                                    variant="outlined"
                                    onClick={() =>
                                      handleDetailedQuestion(question)
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
                                    {question}
                                  </Button>
                                ))}
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        )
                      )}
                    </Box>
                  </Box>
                )}

                {/* Pricing Options - Always show in Advanced mode */}
                {isAdvancedMode && (
                  <Box sx={{ px: 2, pt: 2, pb: 0, bgcolor: "#f4f6fb" }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: "#1a237e", flex: 1, fontWeight: 600 }}>
                        Tư vấn báo giá:
                      </Typography>
                      <Chip
                        label="Advanced Mode"
                        size="small"
                        icon={<RocketLaunchIcon />}
                        sx={{
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                          fontWeight: 500,
                          fontSize: 11,
                        }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Zoom in={true} style={{ transitionDelay: "100ms" }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleStartPricingFlow("traditional")}
                          disabled={isPricingFlow}
                          startIcon={<BusinessIcon />}
                          sx={{
                            bgcolor: "#2196f3",
                            color: "#fff",
                            textTransform: "none",
                            fontSize: 13,
                            borderRadius: 999,
                            mb: 1,
                            px: 2,
                            py: 0.5,
                            boxShadow: "0 2px 8px rgba(33,150,243,0.3)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "#1976d2",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(33,150,243,0.4)",
                            },
                          }}
                        >
                          Tư vấn báo giá biển truyền thống
                        </Button>
                      </Zoom>
                      <Zoom in={true} style={{ transitionDelay: "200ms" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleStartPricingFlow("modern")}
                          disabled={isPricingFlow}
                          startIcon={<AutoAwesomeIcon />}
                          sx={{
                            borderColor: "#2196f3",
                            color: "#2196f3",
                            textTransform: "none",
                            fontSize: 13,
                            borderRadius: 999,
                            mb: 1,
                            px: 2,
                            py: 0.5,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#1976d2",
                              color: "#1976d2",
                              bgcolor: "#e3f2fd",
                              transform: "translateY(-1px)",
                              boxShadow: "0 2px 8px rgba(33,150,243,0.2)",
                            },
                          }}
                        >
                          Tư vấn báo giá biển hiện đại
                        </Button>
                      </Zoom>
                    </Stack>
                  </Box>
                )}

                {/* FAQ Quick Replies - Also show in normal mode when not in pricing flow */}
                {!isAdvancedMode && !isPricingFlow && (
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
                    
                    {/* Hiển thị gợi ý cho trường hiện tại trong flow báo giá - Cải thiện UI */}
                    {isPricingFlow && (
                      <Fade in={true} timeout={300}>
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
                              color: "#2196f3",
                              width: 32,
                              height: 32,
                              boxShadow: 1,
                              border: "2px solid #2196f3",
                              mt: 0.5,
                              mr: 1,
                            }}
                              src="https://i.pinimg.com/originals/2f/d0/0b/2fd00b440146251022ea7bdf0466f88c.gif"
                            alt="AI Bot"
                          />
                          <Card
                            sx={{
                              bgcolor: "#e3f2fd",
                              color: "#1565c0",
                              px: 2,
                              py: 1.5,
                              borderRadius: 2.5,
                              maxWidth: "85%",
                              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.15)",
                              border: "1px solid #2196f3",
                              borderTopLeftRadius: 16,
                              borderTopRightRadius: 6,
                              borderBottomLeftRadius: 16,
                              borderBottomRightRadius: 16,
                            }}
                          >
                            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                              <Typography variant="body2" fontWeight={600} mb={1.5} color="#1976d2">
                                Chọn {(() => {
                                  const fields = pricingType === "traditional" ? PRICING_FIELDS : MODERN_PRICING_FIELDS;
                                  return fields[pricingStep]?.label.toLowerCase();
                                })()}:
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {(() => {
                                  const fields = pricingType === "traditional" ? PRICING_FIELDS : MODERN_PRICING_FIELDS;
                                  return fields[pricingStep]?.suggestions.map((suggestion, idx) => (
                                    <Zoom in={true} style={{ transitionDelay: `${idx * 50}ms` }} key={idx}>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => {
                                          setCurrentPricingInput(suggestion);
                                          handleSend(suggestion);
                                        }}
                                        sx={{
                                          bgcolor: "#fff",
                                          color: "#1976d2",
                                          border: "1px solid #2196f3",
                                          fontSize: 12,
                                          fontWeight: 500,
                                          borderRadius: 999,
                                          px: 2,
                                          py: 0.5,
                                          textTransform: "none",
                                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                          transition: "all 0.2s ease",
                                          "&:hover": {
                                            bgcolor: "#2196f3",
                                            color: "#fff",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 4px 12px rgba(33,150,243,0.4)",
                                          },
                                          "&:active": {
                                            transform: "translateY(0)",
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                          },
                                        }}
                                      >
                                        {suggestion}
                                      </Button>
                                    </Zoom>
                                  ));
                                })()}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Box>
                      </Fade>
                    )}
                    
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
                  mt: isPricingFlow ? 5 : 0, // Add margin top when in pricing flow to avoid overlap
                  minHeight: isAdvancedMode ? "80px" : "70px", // Ensure minimum height in Advanced mode
                }}
              >
                  {isPricingFlow && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -50, // Move up more to avoid overlap
                        left: 16,
                        right: 16,
                        bgcolor: "#e3f2fd",
                        borderRadius: 2,
                        p: 1.5,
                        border: "1px solid #2196f3",
                        zIndex: 1,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor: "#2196f3",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: "bold",
                          }}
                        >
                          {pricingStep + 1}
                        </Box>
                        <Typography variant="caption" color="primary" fontWeight={500}>
                          Báo giá {pricingType === "traditional" ? "truyền thống" : "hiện đại"} ({pricingStep + 1}/{(() => {
                            const fields = pricingType === "traditional" ? PRICING_FIELDS : MODERN_PRICING_FIELDS;
                            return fields.length;
                          })()})
                        </Typography>
                        
                        {/* Progress Bar */}
                        <Box
                          sx={{
                            flex: 1,
                            height: 4,
                            bgcolor: "#e0e0e0",
                            borderRadius: 2,
                            overflow: "hidden",
                            ml: 1,
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              bgcolor: "#2196f3",
                              borderRadius: 2,
                              width: `${((pricingStep + 1) / (() => {
                                const fields = pricingType === "traditional" ? PRICING_FIELDS : MODERN_PRICING_FIELDS;
                                return fields.length;
                              })()) * 100}%`,
                              transition: "width 0.3s ease",
                            }}
                          />
                        </Box>
                        
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={handleCancelPricingFlow}
                          sx={{ ml: 1, fontSize: 11 }}
                        >
                          Hủy
                        </Button>
                      </Stack>
                    </Box>
                  )}
                  
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={
                      isPricingFlow
                        ? `Nhập ${(() => {
                            const fields = pricingType === "traditional" ? PRICING_FIELDS : MODERN_PRICING_FIELDS;
                            return fields[pricingStep]?.label.toLowerCase();
                          })()}...`
                        : isAdvancedMode
                        ? "Nhập tin nhắn hoặc chọn câu hỏi gợi ý..."
                        : "Bạn cần hỗ trợ gì?..."
                    }
                    value={isPricingFlow ? currentPricingInput : input}
                    inputRef={inputRef}
                    onChange={isPricingFlow ? handlePricingInputChange : (e) => setInput(e.target.value)}
                    onKeyDown={isPricingFlow ? handlePricingInputKeyDown : (e) => e.key === "Enter" && handleSend()}
                    sx={{
                      bgcolor: "#f8f9fa",
                      borderRadius: 999,
                      border: isPricingFlow ? "2px solid #2196f3" : "none",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: isPricingFlow ? "#2196f3" : "#e0e3ef" },
                        "&:hover fieldset": { borderColor: isPricingFlow ? "#1976d2" : "#3949ab" },
                        "&.Mui-focused fieldset": { borderColor: isPricingFlow ? "#1565c0" : "#1a237e" },
                      },
                      "& .MuiInputBase-input": {
                        color: "#1a237e",
                        fontSize: 15,
                        py: 1.2,
                        fontWeight: isPricingFlow ? 500 : 400,
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: isPricingFlow ? "#1976d2" : "#3949ab",
                        opacity: 0.7,
                        fontWeight: isPricingFlow ? 500 : 400,
                      },
                      boxShadow: isPricingFlow ? "0 2px 8px rgba(33,150,243,0.15)" : "none",
                    }}
                    disabled={status === "loading"}
                  />
                  <IconButton
                    onClick={isPricingFlow ? handlePricingInputSubmit : () => handleSend()}
                    disabled={status === "loading" || (isPricingFlow ? !currentPricingInput.trim() : !input.trim())}
                    sx={{
                      bgcolor: isPricingFlow ? "#2196f3" : "#3949ab",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 44,
                      height: 44,
                      ml: 1,
                      border: `2px solid ${isPricingFlow ? "#2196f3" : "#3949ab"}`,
                      p: 0,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: isPricingFlow ? "#1976d2" : "#1a237e",
                        color: "#fff",
                        border: `2px solid ${isPricingFlow ? "#1976d2" : "#1a237e"}`,
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
      {pricingError && (
        <Dialog
          open={!!pricingError}
          onClose={() => setPricingError(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Lỗi báo giá</DialogTitle>
          <DialogContent>
            <Typography color="error">{pricingError}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPricingError(null)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default AIChatbot;
