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
} from "@mui/material";

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
        <Grid container spacing={3} mb={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <Select
                labelId="frame-label"
                name="frame"
                value={formData.frame}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Chọn khung bảng</em>
                </MenuItem>
                <MenuItem value="aluminum">Nhôm</MenuItem>
                <MenuItem value="steel">Thép</MenuItem>
                <MenuItem value="composite">Composite</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <Select
                labelId="background-label"
                name="background"
                value={formData.background}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Nền Bảng
                </MenuItem>
                <MenuItem value="acrylic">Acrylic</MenuItem>
                <MenuItem value="aluminum">Nhôm</MenuItem>
                <MenuItem value="composite">Composite</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <Select
                labelId="border-label"
                name="border"
                value={formData.border}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Chọn viền bảng</em>
                </MenuItem>
                <MenuItem value="none">Không viền</MenuItem>
                <MenuItem value="thin">Viền mỏng</MenuItem>
                <MenuItem value="thick">Viền dày</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <Select
                labelId="textAndLogo-label"
                name="textAndLogo"
                value={formData.textAndLogo}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Chọn chữ & logo</em>
                </MenuItem>
                <MenuItem value="cutout">Chữ cắt</MenuItem>
                <MenuItem value="printed">Chữ in</MenuItem>
                <MenuItem value="led">LED</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <Select
                labelId="textStyle-label"
                name="textStyle"
                value={formData.textStyle}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Chọn quy cách chữ</em>
                </MenuItem>
                <MenuItem value="uppercase">Chữ in hoa</MenuItem>
                <MenuItem value="lowercase">Chữ thường</MenuItem>
                <MenuItem value="mixed">Hỗn hợp</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <Select
                labelId="mountingStyle-label"
                name="mountingStyle"
                value={formData.mountingStyle}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Chọn quy cách gắn</em>
                </MenuItem>
                <MenuItem value="wall">Gắn tường</MenuItem>
                <MenuItem value="stand">Đứng độc lập</MenuItem>
                <MenuItem value="hanging">Treo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={3} mb={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Chiều cao (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Chiều ngang (cm)"
              name="width"
              type="number"
              value={formData.width}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Kích thước chữ & logo (cm)"
              name="textLogoSize"
              type="number"
              value={formData.textLogoSize}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
              variant="outlined"
            />
          </Grid>
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
        <Grid container spacing={3} mb={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 180 }}>
              <InputLabel id="frame-label">Khung bảng</InputLabel>
              <Select
                labelId="frame-label"
                name="frame"
                value={formData.frame}
                onChange={handleChange}
                label="Khung bảng"
              >
                <MenuItem value="" disabled>
                  Chọn khung bảng
                </MenuItem>
                <MenuItem value="wood">Gỗ</MenuItem>
                <MenuItem value="iron">Sắt</MenuItem>
                <MenuItem value="steel">Thép</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 180 }}>
              <InputLabel id="background-label">Nền bảng</InputLabel>
              <Select
                labelId="background-label"
                name="background"
                value={formData.background}
                onChange={handleChange}
                label="Nền bảng"
              >
                <MenuItem value="" disabled>
                  Chọn nền bảng
                </MenuItem>
                <MenuItem value="wood">Gỗ</MenuItem>
                <MenuItem value="mica">Mica</MenuItem>
                <MenuItem value="composite">Composite</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 180 }}>
              <InputLabel id="border-label">Viền bảng</InputLabel>
              <Select
                labelId="border-label"
                name="border"
                value={formData.border}
                onChange={handleChange}
                label="Viền bảng"
              >
                <MenuItem value="" disabled>
                  Chọn viền bảng
                </MenuItem>
                <MenuItem value="none">Không viền</MenuItem>
                <MenuItem value="thin">Viền mỏng</MenuItem>
                <MenuItem value="thick">Viền dày</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 180 }}>
              <InputLabel id="surface-label">Mặt bảng</InputLabel>
              <Select
                labelId="surface-label"
                name="surface"
                value={formData.surface}
                onChange={handleChange}
                label="Mặt bảng"
              >
                <MenuItem value="" disabled>
                  Chọn mặt bảng
                </MenuItem>
                <MenuItem value="single">Một mặt</MenuItem>
                <MenuItem value="double">Hai mặt</MenuItem>
                <MenuItem value="triple">Ba mặt</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 180 }}>
              <InputLabel id="mountingStyle-label">Quy cách gắn</InputLabel>
              <Select
                labelId="mountingStyle-label"
                name="mountingStyle"
                value={formData.mountingStyle}
                onChange={handleChange}
                label="Quy cách gắn"
              >
                <MenuItem value="" disabled>
                  Chọn quy cách gắn
                </MenuItem>
                <MenuItem value="wall">Gắn tường</MenuItem>
                <MenuItem value="stand">Đứng độc lập</MenuItem>
                <MenuItem value="hanging">Treo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined" sx={{ minWidth: 180 }}>
              <InputLabel id="faces-label">Số mặt</InputLabel>
              <Select
                labelId="faces-label"
                name="faces"
                value={formData.faces}
                onChange={handleChange}
                label="Số mặt"
              >
                <MenuItem value="" disabled>
                  Chọn số mặt
                </MenuItem>
                <MenuItem value="1">1 mặt</MenuItem>
                <MenuItem value="2">2 mặt</MenuItem>
                <MenuItem value="3">3 mặt</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={3} mb={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Chiều cao (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Chiều ngang (cm)"
              name="width"
              type="number"
              value={formData.width}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

const AIDesign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1); // 1: Start, 2: Business, 3: Billboard Type, 4: Billboard Form
  const [billboardType, setBillboardType] = useState("");
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    contactInfo: "",
    logo: null,
  });

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
    setCurrentStep(1);
    navigate("/ai-design");
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
    </div>
  );
};

export default AIDesign;
