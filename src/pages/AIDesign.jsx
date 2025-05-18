import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import StepIndicator from "../components/StepIndicator";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Typography,
  Grid,
  Box,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { FaCheck, FaRedo, FaCheckCircle, FaRobot } from "react-icons/fa";

// Cấu trúc dữ liệu cho các options
const formOptions = {
  frame: {
    label: "Chọn khung bảng",
    options: [
      { value: "aluminum", label: "Nhôm" },
      { value: "steel", label: "Thép" },
      { value: "composite", label: "Composite" },
    ],
  },
  background: {
    label: "Nền Bảng",
    options: [
      { value: "acrylic", label: "Acrylic" },
      { value: "aluminum", label: "Nhôm" },
      { value: "composite", label: "Composite" },
    ],
  },
  border: {
    label: "Chọn viền bảng",
    options: [
      { value: "none", label: "Không viền" },
      { value: "thin", label: "Viền mỏng" },
      { value: "thick", label: "Viền dày" },
    ],
  },
  textAndLogo: {
    label: "Chọn chữ & logo",
    options: [
      { value: "cutout", label: "Chữ cắt" },
      { value: "printed", label: "Chữ in" },
      { value: "led", label: "LED" },
    ],
  },
  textStyle: {
    label: "Chọn quy cách chữ",
    options: [
      { value: "uppercase", label: "Chữ in hoa" },
      { value: "lowercase", label: "Chữ thường" },
      { value: "mixed", label: "Hỗn hợp" },
    ],
  },
  mountingStyle: {
    label: "Chọn quy cách gắn",
    options: [
      { value: "wall", label: "Gắn tường" },
      { value: "stand", label: "Đứng độc lập" },
      { value: "hanging", label: "Treo" },
    ],
  },
};

// Cấu trúc dữ liệu cho các trường số
const numberFields = [
  { name: "height", label: "Chiều cao (cm)" },
  { name: "width", label: "Chiều ngang (cm)" },
  { name: "textLogoSize", label: "Kích thước chữ & logo (cm)" },
];

// Cấu trúc dữ liệu cho các options của biển hiệu truyền thống
const traditionalFormOptions = {
  frame: {
    label: "Khung bảng",
    options: [
      { value: "wood", label: "Gỗ" },
      { value: "iron", label: "Sắt" },
      { value: "steel", label: "Thép" },
    ],
  },
  background: {
    label: "Nền bảng",
    options: [
      { value: "wood", label: "Gỗ" },
      { value: "mica", label: "Mica" },
      { value: "composite", label: "Composite" },
    ],
  },
  border: {
    label: "Viền bảng",
    options: [
      { value: "none", label: "Không viền" },
      { value: "thin", label: "Viền mỏng" },
      { value: "thick", label: "Viền dày" },
    ],
  },
  surface: {
    label: "Mặt bảng",
    options: [
      { value: "single", label: "Một mặt" },
      { value: "double", label: "Hai mặt" },
      { value: "triple", label: "Ba mặt" },
    ],
  },
  mountingStyle: {
    label: "Quy cách gắn",
    options: [
      { value: "wall", label: "Gắn tường" },
      { value: "stand", label: "Đứng độc lập" },
      { value: "hanging", label: "Treo" },
    ],
  },
  faces: {
    label: "Số mặt",
    options: [
      { value: "1", label: "1 mặt" },
      { value: "2", label: "2 mặt" },
      { value: "3", label: "3 mặt" },
    ],
  },
};

// Cấu trúc dữ liệu cho các trường số
const traditionalNumberFields = [
  { name: "height", label: "Chiều cao (cm)" },
  { name: "width", label: "Chiều ngang (cm)" },
];

const ModernBillboardForm = () => {
  const [formData, setFormData] = useState({
    frame: "",
    background: "",
    border: "",
    textAndLogo: "",
    textStyle: "",
    mountingStyle: "",
    height: "",
    width: "",
    textLogoSize: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm render Select field
  const renderSelectField = (fieldName) => {
    const field = formOptions[fieldName];
    return (
      <FormControl fullWidth variant="outlined">
        <Select
          labelId={`${fieldName}-label`}
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleChange}
          displayEmpty
        >
          <MenuItem value="" disabled>
            <em>{field.label}</em>
          </MenuItem>
          {field.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  // Hàm render Number field
  const renderNumberField = (field) => (
    <TextField
      fullWidth
      label={field.label}
      name={field.name}
      type="number"
      value={formData[field.name]}
      onChange={handleChange}
      InputProps={{ inputProps: { min: 0 } }}
      variant="outlined"
    />
  );

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          maxWidth: 900,
          width: "100%",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          fontWeight={700}
          color="primary"
          mb={3}
        >
          Thông số kỹ thuật
        </Typography>

        {/* Select Fields */}
        <Grid container spacing={3} mb={2}>
          {Object.keys(formOptions).map((fieldName) => (
            <Grid item xs={12} sm={6} md={4} key={fieldName}>
              {renderSelectField(fieldName)}
            </Grid>
          ))}
        </Grid>

        {/* Number Fields */}
        <Grid container spacing={3} mb={2}>
          {numberFields.map((field) => (
            <Grid item xs={12} sm={4} key={field.name}>
              {renderNumberField(field)}
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          maxWidth: 900,
          width: "100%",
        }}
      >
        <Typography variant="h6" fontWeight={600} text-yellow mb={2}>
          Ghi chú thiết kế
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          name="designNotes"
          placeholder="Mô tả yêu cầu thiết kế chi tiết của bạn..."
          variant="outlined"
        />
      </Paper>
    </Box>
  );
};

const TraditionalBillboardForm = () => {
  const [formData, setFormData] = useState({
    frame: "",
    background: "",
    border: "",
    surface: "",
    mountingStyle: "",
    faces: "",
    height: "",
    width: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm render Select field
  const renderSelectField = (fieldName) => {
    const field = traditionalFormOptions[fieldName];
    return (
      <FormControl fullWidth variant="outlined" sx={{ minWidth: 180 }}>
        <InputLabel id={`${fieldName}-label`}>{field.label}</InputLabel>
        <Select
          labelId={`${fieldName}-label`}
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleChange}
          label={field.label}
        >
          <MenuItem value="" disabled>
            Chọn {field.label.toLowerCase()}
          </MenuItem>
          {field.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  // Hàm render Number field
  const renderNumberField = (field) => (
    <TextField
      fullWidth
      label={field.label}
      name={field.name}
      type="number"
      value={formData[field.name]}
      onChange={handleChange}
      InputProps={{ inputProps: { min: 0 } }}
      variant="outlined"
    />
  );

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          maxWidth: 900,
          width: "100%",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          fontWeight={700}
          color="primary"
          mb={3}
        >
          Thông số kỹ thuật
        </Typography>

        {/* Select Fields */}
        <Grid container spacing={3} mb={2}>
          {Object.keys(traditionalFormOptions).map((fieldName) => (
            <Grid item xs={12} sm={6} md={4} key={fieldName}>
              {renderSelectField(fieldName)}
            </Grid>
          ))}
        </Grid>

        {/* Number Fields */}
        <Grid container spacing={3} mb={2}>
          {traditionalNumberFields.map((field) => (
            <Grid item xs={12} sm={6} key={field.name}>
              {renderNumberField(field)}
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

const AIDesign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1); // 1: Start, 2: Business, 3: Billboard Type, 4: Billboard Form, 5: Preview
  const [billboardType, setBillboardType] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    contactInfo: "",
    logo: null,
  });

  // Tạm thời sử dụng 4 ảnh mẫu
  const previewImages = [
    {
      id: 1,
      url: "https://bienhieudep.vn/wp-content/uploads/2022/08/mau-bien-quang-cao-nha-hang-dep-37.jpg",
      title: "Mẫu 1",
    },
    {
      id: 2,
      url: "https://q8laser.com/wp-content/uploads/2021/01/thi-cong-bien-hieu-quang-cao.jpg",
      title: "Mẫu 2",
    },
    {
      id: 3,
      url: "https://bienquangcao247.com/wp-content/uploads/2024/07/lam-bien-quang-cao-01.jpg",
      title: "Mẫu 3",
    },
    {
      id: 4,
      url: "https://bienquangcao247.com/wp-content/uploads/2024/07/bang-hieu-quang-cao-01.jpg",
      title: "Mẫu 4",
    },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const step = params.get("step");

    if (step === "business") {
      setCurrentStep(2);
    } else if (step === "billboard") {
      setCurrentStep(3);
      const type = params.get("type");
      if (type) {
        setBillboardType(type);
        setCurrentStep(4);
      }
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBusinessInfo((prev) => ({
        ...prev,
        logo: file,
      }));
    }
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    console.log("Business Info:", businessInfo);
    setCurrentStep(3);
    navigate("/ai-design?step=billboard");
  };

  const handleBillboardSubmit = async (e) => {
    e.preventDefault();
    console.log("Billboard Type:", billboardType);
    setIsGenerating(true);

    // Giả lập thời gian AI tạo hình ảnh (3 giây)
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(5);
    }, 3000);
  };

  const handleImageSelect = (imageId) => {
    setSelectedImage(imageId);
  };

  const handleRegenerate = () => {
    setCurrentStep(3); // Quay lại bước chọn loại biển hiệu
    navigate("/ai-design?step=billboard");
  };

  const handleConfirm = () => {
    setShowSuccess(true);
    // Sau 3 giây sẽ đóng popup và chuyển về trang chủ
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/");
    }, 3000);
  };

  const handleBillboardTypeSelect = (type) => {
    setBillboardType(type);
    setCurrentStep(4);
    navigate(`/ai-design?step=billboard&type=${type}`);
  };

  const handleBackToTypeSelection = () => {
    setBillboardType("");
    setCurrentStep(3);
    navigate("/ai-design?step=billboard");
  };

  const handleStepClick = (step) => {
    if (step < currentStep) {
      switch (step) {
        case 1:
          setCurrentStep(1);
          navigate("/ai-design");
          break;
        case 2:
          setCurrentStep(2);
          navigate("/ai-design?step=business");
          break;
        case 3:
          setCurrentStep(3);
          navigate("/ai-design?step=billboard");
          break;
        default:
          break;
      }
    }
  };

  const steps = [
    { number: 1, label: "Bắt đầu" },
    { number: 2, label: "Thông tin doanh nghiệp" },
    { number: 3, label: "Chọn loại biển hiệu" },
    { number: 4, label: "Thông tin biển hiệu" },
    { number: 5, label: "Xem trước" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
    hover: {
      scale: 1.03,
      boxShadow:
        "0 20px 25px -5px rgba(86, 89, 232, 0.15), 0 10px 10px -5px rgba(86, 89, 232, 0.06)",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-5xl font-bold text-custom-dark mb-8 bg-clip-text text-transparent bg-gradient-to-r from-custom-primary to-custom-secondary"
              variants={itemVariants}
            >
              Thiết kế quảng cáo với AI
            </motion.h1>
            <motion.p
              className="text-xl text-black mb-12 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Tạo biển hiệu đẹp mắt cho bạn trong vài phút với sự hỗ trợ của
              công nghệ AI tiên tiến.
            </motion.p>
            <motion.button
              onClick={() => {
                setCurrentStep(2);
                navigate("/ai-design?step=business");
              }}
              className="px-10 py-4 bg-custom-primary text-white font-medium text-lg rounded-lg hover:bg-custom-secondary transition-all shadow-lg hover:shadow-xl flex items-center mx-auto"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Bắt đầu ngay
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </motion.button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            className="max-w-2xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-3xl font-bold text-custom-dark mb-8 text-center"
              variants={itemVariants}
            >
              Thông tin doanh nghiệp
            </motion.h2>

            <motion.form
              onSubmit={handleBusinessSubmit}
              className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tên công ty
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={businessInfo.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={businessInfo.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="contactInfo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Thông tin liên hệ
                </label>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  value={businessInfo.contactInfo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="logo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Logo công ty
                </label>
                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="w-full"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                className="flex justify-end space-x-4 pt-4"
                variants={itemVariants}
              >
                <motion.button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    navigate("/ai-design");
                  }}
                  className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Hủy
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-custom-primary text-white font-medium rounded-lg hover:bg-custom-secondary transition-all shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Tiếp tục
                  <svg
                    className="w-5 h-5 ml-1 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-3xl font-bold text-custom-dark mb-8 text-center"
              variants={itemVariants}
            >
              Chọn loại biển hiệu
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="rounded-xl overflow-hidden shadow-md bg-white border border-gray-100"
              >
                <div className="h-48 bg-gradient-to-r from-custom-primary to-custom-secondary flex items-center justify-center">
                  <img
                    src="https://bienhieudep.vn/wp-content/uploads/2022/08/mau-bien-quang-cao-nha-hang-dep-37.jpg"
                    alt="Biển hiệu hiện đại"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-custom-dark mb-2">
                    Biển hiệu hiện đại
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thiết kế hiện đại, phù hợp với không gian đương đại, sử dụng
                    công nghệ mới nhất.
                  </p>
                  <motion.button
                    onClick={() => handleBillboardTypeSelect("modern")}
                    className="w-full py-3 px-4 bg-custom-light text-custom-primary font-medium rounded-lg hover:bg-custom-tertiary hover:text-white transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Chọn
                    <svg
                      className="w-5 h-5 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="rounded-xl overflow-hidden shadow-md bg-white border border-gray-100"
              >
                <div className="h-48 bg-gradient-to-r from-amber-600 to-amber-400 flex items-center justify-center">
                  <img
                    src="https://q8laser.com/wp-content/uploads/2021/01/thi-cong-bien-hieu-quang-cao.jpg"
                    alt="Biển hiệu truyền thống"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-custom-dark mb-2">
                    Biển hiệu truyền thống
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thiết kế cổ điển, mang đậm nét truyền thống, sử dụng các vật
                    liệu tự nhiên.
                  </p>
                  <motion.button
                    onClick={() => handleBillboardTypeSelect("traditional")}
                    className="w-full py-3 px-4 bg-custom-light text-custom-primary font-medium rounded-lg hover:bg-custom-tertiary hover:text-white transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Chọn
                    <svg
                      className="w-5 h-5 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 flex justify-center">
              <motion.button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  navigate("/ai-design?step=business");
                }}
                className="px-6 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Quay lại
              </motion.button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-3xl font-bold text-custom-dark mb-8 text-center"
              variants={itemVariants}
            >
              {billboardType === "modern"
                ? "Biển hiệu hiện đại"
                : "Biển hiệu truyền thống"}
            </motion.h2>

            <motion.form
              onSubmit={handleBillboardSubmit}
              variants={containerVariants}
            >
              {billboardType === "modern" ? (
                <ModernBillboardForm />
              ) : (
                <TraditionalBillboardForm />
              )}

              <motion.div
                className="flex justify-between mt-8"
                variants={itemVariants}
              >
                <motion.button
                  type="button"
                  onClick={handleBackToTypeSelection}
                  className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Quay lại
                </motion.button>

                <motion.button
                  type="submit"
                  className="px-8 py-3 bg-custom-primary text-white font-medium rounded-lg hover:bg-custom-secondary transition-all shadow-md hover:shadow-lg flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Hoàn thành
                  <svg
                    className="w-5 h-5 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-3xl font-bold text-custom-dark mb-8 text-center"
              variants={itemVariants}
            >
              Xem trước thiết kế
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {previewImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-300 ${
                    selectedImage === image.id
                      ? "ring-4 ring-custom-secondary scale-105"
                      : "hover:scale-105"
                  }`}
                  onClick={() => handleImageSelect(image.id)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white rounded-full p-2">
                      <FaCheck className="w-6 h-6 text-custom-secondary" />
                    </div>
                  </div>
                  {selectedImage === image.id && (
                    <div className="absolute top-2 right-2 bg-custom-secondary text-white rounded-full p-2">
                      <FaCheckCircle className="w-6 h-6" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRegenerate}
                className="px-8 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all flex items-center"
              >
                <FaRedo className="mr-2" />
                Tạo lại
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                disabled={!selectedImage}
                className={`px-8 py-3 font-medium rounded-lg transition-all flex items-center ${
                  selectedImage
                    ? "bg-custom-secondary text-white hover:bg-custom-secondary/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <FaCheck className="mr-2" />
                Xác nhận
              </motion.button>
            </div>

            {/* Success Snackbar */}
            <Snackbar
              open={showSuccess}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              autoHideDuration={3000}
              onClose={() => setShowSuccess(false)}
            >
              <Alert
                onClose={() => setShowSuccess(false)}
                severity="success"
                variant="filled"
                sx={{ width: "100%" }}
              >
                Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.
              </Alert>
            </Snackbar>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
        {renderContent()}
      </div>

      {/* AI Generation Loading Backdrop */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        }}
        open={isGenerating}
      >
        <div className="flex flex-col items-center">
          <CircularProgress color="secondary" size={60} />
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <FaRobot className="w-8 h-8 text-custom-secondary mr-3 animate-bounce" />
              <h3 className="text-2xl font-bold text-white">
                AI đang tạo hình ảnh
              </h3>
            </div>
            <p className="text-gray-300 max-w-md">
              Hệ thống AI đang phân tích yêu cầu và tạo ra các mẫu thiết kế phù
              hợp với thông số kỹ thuật của bạn. Vui lòng chờ trong giây lát...
            </p>
          </div>
        </div>
      </Backdrop>
    </div>
  );
};

export default AIDesign;
