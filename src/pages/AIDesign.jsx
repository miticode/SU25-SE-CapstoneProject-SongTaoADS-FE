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
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProductTypes,
  selectAllProductTypes,
  selectProductTypeStatus,
} from "../store/features/productType/productTypeSlice";
import {
  createCustomer,
  selectCustomerStatus,
  selectCustomerError,
  linkCustomerToProductType,
  selectCurrentOrder,
} from "../store/features/customer/customerSlice";
import { getProfileApi } from "../api/authService";
import {
  fetchAttributesByProductTypeId,
  fetchAttributeValuesByAttributeId,
  selectAllAttributes,
  selectAttributeError,
  selectAttributeStatus,
} from "../store/features/attribute/attributeSlice";
// Cấu trúc dữ liệu cho các options

// Cấu trúc dữ liệu cho các trường số
const numberFields = [
  { name: "height", label: "Chiều cao (cm)" },
  { name: "width", label: "Chiều ngang (cm)" },
  { name: "textLogoSize", label: "Kích thước chữ & logo (cm)" },
];

// Cấu trúc dữ liệu cho các options của biển hiệu truyền thống

// Cấu trúc dữ liệu cho các trường số
const traditionalNumberFields = [
  { name: "height", label: "Chiều cao (cm)" },
  { name: "width", label: "Chiều ngang (cm)" },
];

const ModernBillboardForm = ({ attributes, status }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const attributeValuesState = useSelector(
    (state) => state.attribute.attributeValues
  );
  const attributeValuesStatusState = useSelector(
    (state) => state.attribute.attributeValuesStatus
  );

  useEffect(() => {
    if (attributes && attributes.length > 0) {
      const initialData = {};
      attributes.forEach((attr) => {
        initialData[attr.id] = "";
      });
      setFormData(initialData);

      attributes.forEach((attr) => {
        if (attributeValuesStatusState[attr.id] === "idle") {
          dispatch(fetchAttributeValuesByAttributeId(attr.id));
        }
      });
    }
  }, [attributes, dispatch, attributeValuesStatusState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <CircularProgress color="primary" size={60} />
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải thông số kỹ thuật...
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="text-center py-12 px-4 bg-red-50 rounded-xl border border-red-100">
        <svg
          className="w-12 h-12 text-red-500 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-red-600 font-medium text-lg">
          Không thể tải thông số kỹ thuật
        </p>
        <p className="text-gray-600 mt-2">
          Vui lòng thử lại sau hoặc liên hệ với quản trị viên.
        </p>
      </div>
    );
  }

  // Group attributes by name
  const attributesByName = attributes.reduce((acc, attr) => {
    const categoryName = attr.name;

    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(attr);
    return acc;
  }, {});

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={6}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          maxWidth: 900,
          width: "100%",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          fontWeight={700}
          color="primary"
          mb={4}
          sx={{
            borderBottom: "2px solid #f0f0f0",
            paddingBottom: 2,
          }}
        >
          Thông Số Kỹ Thuật Biển Hiệu
        </Typography>

        {Object.entries(attributesByName).map(([name, attrs]) => (
          <Box
            key={name}
            mb={3}
            sx={{
              background: "#fafafa",
              borderRadius: 2,
              padding: { xs: 2, md: 2.5 },
              border: "1px solid #eaeaea",
               maxWidth: '100%',
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              mb={2} 
              sx={{
                color: "#2c3e50",
                display: "flex",
                alignItems: "center",
                 fontSize: '0.95rem',
              }}
            >
              <span ></span>
              {name}
            </Typography>

            <Box mb={3}>
              {attrs.map((attr) => {
                const attributeValues = attributeValuesState[attr.id] || [];
                const isLoadingValues =
                  attributeValuesStatusState[attr.id] === "loading";

                return (
                  <Box
                    key={attr.id}
                    mb={3}
                    sx={{
                      transition: "all 0.3s ease",
                    }}
                  >
                    {attributeValues.length > 0 ? (
                      <FormControl
                        fullWidth
                        variant="outlined"
                        sx={{ minWidth: "100%" }}
                      >
                        <InputLabel id={`${attr.id}-label`}>
                          {attr.name}
                        </InputLabel>
                        <Select
                          labelId={`${attr.id}-label`}
                          name={attr.id}
                          value={formData[attr.id] || ""}
                          onChange={handleChange}
                          label={attr.name}
                          disabled={isLoadingValues}
                          sx={{
                            "&.MuiOutlinedInput-root": {
                              borderRadius: "8px",
                            },
                          }}
                        >
                          <MenuItem value="" disabled>
                            Chọn {(attr.name || "").toLowerCase()}
                          </MenuItem>
                          {attributeValues.map((value) => (
                            <MenuItem key={value.id} value={value.id}>
                              {value.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {isLoadingValues && (
                          <Box display="flex" justifyContent="center" mt={1}>
                            <CircularProgress size={20} />
                          </Box>
                        )}
                      </FormControl>
                    ) : attr.type === "number" ? (
                      <TextField
                        fullWidth
                        label={attr.name}
                        name={attr.id}
                        type="number"
                        value={formData[attr.id] || ""}
                        onChange={handleChange}
                        InputProps={{
                          inputProps: { min: 0 },
                          startAdornment: (
                            <span className="text-gray-400 mr-2">#</span>
                          ),
                        }}
                        variant="outlined"
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label={attr.name}
                        name={attr.id}
                        value={formData[attr.id] || ""}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Paper>

      <Paper
        elevation={2}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          maxWidth: 900,
          width: "100%",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          mb={3}
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            className="w-5 h-5 mr-2 text-custom-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Ghi chú thiết kế
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          name="designNotes"
          placeholder="Mô tả yêu cầu thiết kế chi tiết của bạn, bao gồm màu sắc, phong cách, hoặc nội dung cụ thể muốn hiển thị trên biển hiệu..."
          variant="outlined"
          value={formData.designNotes || ""}
          onChange={handleChange}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
          mt={2}
          sx={{ fontStyle: "italic" }}
        >
          Thông tin chi tiết sẽ giúp AI tạo ra thiết kế phù hợp hơn với nhu cầu
          của bạn.
        </Typography>
      </Paper>
    </Box>
  );
};

const AIDesign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const productTypes = useSelector(selectAllProductTypes);
  const productTypeStatus = useSelector(selectProductTypeStatus);
  const customerStatus = useSelector(selectCustomerStatus);
  const customerError = useSelector(selectCustomerError);
  const [currentStep, setCurrentStep] = useState(1);
  const [billboardType, setBillboardType] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const currentOrder = useSelector(selectCurrentOrder);
  const attributes = useSelector(selectAllAttributes);
  const attributeStatus = useSelector(selectAttributeStatus);
  const attributeError = useSelector(selectAttributeError);
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    contactInfo: "",
    logoUrl: "",
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

  useEffect(() => {
    if (currentStep === 3 && productTypeStatus === "idle") {
      dispatch(fetchProductTypes());
    }
  }, [currentStep, dispatch, productTypeStatus]);
  useEffect(() => {
    if (currentStep === 4 && billboardType && attributeStatus === "idle") {
      dispatch(fetchAttributesByProductTypeId(billboardType));
    }
  }, [currentStep, billboardType, dispatch, attributeStatus]);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileApi();
        console.log("Profile API Response:", res);
        if (res.success && res.data) {
          console.log("User data from data:", res.data);
          setUser(res.data);
        } else {
          console.error("Profile API response missing data:", res);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    console.log("Current user state:", user);
    if (!user?.id) {
      console.error("No user ID found in user state:", user);
      return;
    }

    const customerDetail = {
      logoUrl: businessInfo.logoUrl,
      companyName: businessInfo.companyName,
      tagLine: businessInfo.address,
      contactInfo: businessInfo.contactInfo,
      userId: user.id,
    };

    console.log("Customer detail to be sent:", customerDetail);

    try {
      const result = await dispatch(createCustomer(customerDetail)).unwrap();
      console.log("Customer created successfully:", result);
      setCustomerDetail(result);
      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to create customer. Full error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    }
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

  const handleBillboardTypeSelect = async (productTypeId) => {
    // First check if we have the customer details
    if (!user?.id) {
      console.error("No user ID found.");
      setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      // Find the appropriate customer ID to use
      const userId = user.id;
      console.log(`Linking user ${userId} to product type ${productTypeId}`);
      // Dispatch the action to link customer with product type
      const resultAction = await dispatch(
        linkCustomerToProductType({
          customerId: userId, // Always use the user ID from authentication
          productTypeId,
        })
      ).unwrap();

      console.log("Customer linked to product type:", resultAction);

      // After successful API call, update UI and navigate
      setBillboardType(productTypeId);

      // Fetch attributes for the selected product type
      dispatch(fetchAttributesByProductTypeId(productTypeId));

      setCurrentStep(4);
      navigate(`/ai-design?step=billboard&type=${productTypeId}`);
    } catch (error) {
      console.error("Failed to link customer to product type:", error);
      // Handle error - maybe show a notification to the user
      if (error?.message?.includes("User not found")) {
        setError(
          "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
        );
      } else {
        setError(
          error?.message ||
            "Có lỗi xảy ra khi chọn loại biển hiệu. Vui lòng thử lại."
        );
      }
    }
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

            {customerError && (
              <motion.div
                className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                variants={itemVariants}
              >
                {customerError}
              </motion.div>
            )}

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
                  htmlFor="logoUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  URL Logo công ty
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={businessInfo.logoUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                  placeholder="https://example.com/logo.png"
                  required
                />
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
                  disabled={customerStatus === "loading"}
                >
                  Hủy
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-custom-primary text-white font-medium rounded-lg hover:bg-custom-secondary transition-all shadow-md hover:shadow-lg flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={customerStatus === "loading"}
                >
                  {customerStatus === "loading" ? (
                    <>
                      <CircularProgress
                        size={20}
                        color="inherit"
                        className="mr-2"
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
            {error && (
              <motion.div
                className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center"
                variants={itemVariants}
              >
                {error}
              </motion.div>
            )}
            {productTypeStatus === "loading" || customerStatus === "loading" ? (
              <div className="flex justify-center items-center py-12">
                <CircularProgress color="primary" />
              </div>
            ) : productTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {productTypes.map((productType, index) => {
                  // Tạo mapping để mỗi product type có một ảnh khác nhau
                  const getProductTypeImage = (id, index) => {
                    const imageUrls = [
                      "https://bienhieudep.vn/wp-content/uploads/2022/08/mau-bien-quang-cao-nha-hang-dep-37.jpg",
                      "https://q8laser.com/wp-content/uploads/2021/01/thi-cong-bien-hieu-quang-cao.jpg",
                    ];

                    // Sử dụng index để đảm bảo mỗi sản phẩm có một ảnh riêng
                    return imageUrls[index % imageUrls.length];
                  };

                  // Tạo mô tả mẫu cho từng loại biển hiệu
                  const getProductTypeDescription = (name) => {
                    const descriptions = {
                      "Biển hiệu hiện đại":
                        "Thiết kế biển hiệu hiện đại, thanh lịch và nổi bật.",
                      "Biển hiệu truyền thống":
                        "Thiết kế biển hiệu mang phong cách truyền thống, trang nhã.",
                    };

                    return (
                      descriptions[name] ||
                      "Thiết kế biển hiệu chuyên nghiệp cho doanh nghiệp của bạn."
                    );
                  };

                  return (
                    <motion.div
                      key={productType.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className="rounded-xl overflow-hidden shadow-md bg-white border border-gray-100"
                    >
                      <div className="h-48 bg-gradient-to-r from-custom-primary to-custom-secondary flex items-center justify-center">
                        <img
                          src={getProductTypeImage(productType.id, index)}
                          alt={productType.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-custom-dark mb-2">
                          {productType.name}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {getProductTypeDescription(productType.name)}
                        </p>
                        <motion.button
                          onClick={() =>
                            handleBillboardTypeSelect(productType.id)
                          }
                          className="w-full py-3 px-4 bg-custom-light text-custom-primary font-medium rounded-lg hover:bg-custom-tertiary hover:text-white transition-all flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={customerStatus === "loading"}
                        >
                          {customerStatus === "loading" ? (
                            <>
                              <CircularProgress
                                size={20}
                                color="inherit"
                                className="mr-2"
                              />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Không tìm thấy loại biển hiệu nào. Vui lòng thử lại sau.</p>
              </div>
            )}

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
              Thông tin biển hiệu
            </motion.h2>

            {attributeError && (
              <motion.div
                className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center"
                variants={itemVariants}
              >
                {attributeError}
              </motion.div>
            )}

            <motion.form
              onSubmit={handleBillboardSubmit}
              variants={containerVariants}
            >
              <ModernBillboardForm
                attributes={attributes}
                status={attributeStatus}
              />

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
                  disabled={attributeStatus === "loading"}
                >
                  {attributeStatus === "loading" ? (
                    <>
                      <CircularProgress
                        size={20}
                        color="inherit"
                        className="mr-2"
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
