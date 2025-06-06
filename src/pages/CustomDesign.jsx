import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  Box,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import { getProfileApi } from "../api/authService";
import {
  updateCustomerDetail,
  fetchCustomerDetailByUserId,
  fetchCustomerChoices,
  selectCustomerDetail,
  selectCustomerStatus,
} from "../store/features/customer/customerSlice";
import { getProductTypesApi } from "../api/productTypeService";
import { getProductTypeSizesByProductTypeIdApi } from "../api/productTypeService";
import { getAttributesByProductTypeIdApi } from "../api/attributeService";
import { getAttributeValuesByAttributeIdApi } from "../api/attributeService";
import { linkSizeToCustomerChoiceApi } from "../api/customerService";
import { linkAttributeValueToCustomerChoiceApi } from "../api/customerService";
import { updateCustomerChoiceDetailApi } from "../api/customerService";

const steps = [
  { number: 1, label: "Bắt đầu" },
  { number: 2, label: "Thông tin doanh nghiệp" },
  { number: 3, label: "Chọn loại biển hiệu" },
  { number: 4, label: "Thông tin biển hiệu" },
  { number: 5, label: "Xem trước & Xác nhận" },
];

const getProductTypeImage = (id, index) => {
  const imageUrls = [
    "https://bienhieudep.vn/wp-content/uploads/2022/08/mau-bien-quang-cao-nha-hang-dep-37.jpg",
    "https://q8laser.com/wp-content/uploads/2021/01/thi-cong-bien-hieu-quang-cao.jpg",
    "https://www.denledday.vn/wp-content/uploads/2016/12/Den-gan-vien-bien-quang-cao.jpg",
    "https://appro.com.vn/wp-content/uploads/2020/09/den-pha-led-cho-bang-hieu-3.jpg",
    "https://www.denledday.vn/wp-content/uploads/2016/12/Den-gan-vien-bien-quang-cao.jpg",
    // Thêm nhiều ảnh nếu muốn
  ];
  return imageUrls[index % imageUrls.length];
};

const getProductTypeDescription = (name) => {
  const descriptions = {
    "Biển hiệu hiện đại": "Thiết kế biển hiệu hiện đại, thanh lịch và nổi bật.",
    "Biển hiệu truyền thống":
      "Thiết kế biển hiệu mang phong cách truyền thống, trang nhã.",
    // Thêm mô tả cho các loại khác nếu muốn
  };
  return (
    descriptions[name] ||
    "Thiết kế biển hiệu chuyên nghiệp cho doanh nghiệp của bạn."
  );
};

const CustomDesign = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customerDetail = useSelector(selectCustomerDetail);
  const customerStatus = useSelector(selectCustomerStatus);
  const [currentStep, setCurrentStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    contactInfo: "",
    logoUrl: "",
  });
  const [selectedType, setSelectedType] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [user, setUser] = useState(null);
  const [productTypes, setProductTypes] = useState([]);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false);
  const [productTypeError, setProductTypeError] = useState("");
  const [productTypeSizes, setProductTypeSizes] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [sizeValues, setSizeValues] = useState({});
  const [attributeValues, setAttributeValues] = useState({});
  const [attributeValueOptions, setAttributeValueOptions] = useState({});
  const [customerChoiceId, setCustomerChoiceId] = useState(null);
  const [attributeDetailIds, setAttributeDetailIds] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [loadingTotal, setLoadingTotal] = useState(false);
  const [existingAttributeDetails, setExistingAttributeDetails] = useState({});

  const handleStepClick = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
      switch (step) {
        case 1:
          navigate("/custom-design");
          break;
        case 2:
          navigate("/custom-design?step=business");
          break;
        case 3:
          navigate("/custom-design?step=billboard");
          break;
        default:
          break;
      }
    }
  };

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

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    let logoFile = null;
    if (businessInfo.logoUrl) {
      // Nếu user đã upload logo, chuyển base64 sang file
      const arr = businessInfo.logoUrl.split(",");
      if (arr.length === 2) {
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        logoFile = new File([u8arr], "logo.png", { type: mime });
      }
    } else {
      // Nếu không có logo, dùng file mặc định
      const response = await fetch("/default-logo.png");
      const blob = await response.blob();
      logoFile = new File([blob], "default-logo.png", { type: blob.type });
    }
    try {
      if (customerDetail) {
        // Update existing customer detail
        const result = await dispatch(
          updateCustomerDetail({
            customerDetailId: customerDetail.id,
            customerData: {
              companyName: businessInfo.companyName,
              tagLine: businessInfo.address,
              contactInfo: businessInfo.contactInfo,
              logoUrl: businessInfo.logoUrl,
              userId: user.id,
            },
          })
        ).unwrap();

        console.log("Kết quả trả về từ updateCustomerDetail:", result);

        if ((result && result.success) || (result && result.id)) {
          setSnackbar({
            open: true,
            message: "Cập nhật thông tin thành công!",
            severity: "success",
          });
          setCurrentStep(3);
          navigate("/custom-design?step=billboard");

          // Sau khi tạo/cập nhật thành công
          const res = await dispatch(
            fetchCustomerDetailByUserId(user.id)
          ).unwrap();
          if (res && res.result) {
            // Cập nhật state hoặc hiển thị thông tin mới
            setBusinessInfo({
              companyName: res.result.companyName,
              tagLine: res.result.tagLine,
              contactInfo: res.result.contactInfo,
              logoUrl: res.result.logoUrl,
            });
          }
        } else {
          throw new Error(result.error || "Cập nhật thông tin thất bại");
        }
      } else {
        // Create new customer detail
        const result = await import("../api/customerService").then((m) =>
          m.createCustomerApi({
            companyName: businessInfo.companyName,
            tagLine: businessInfo.address,
            contactInfo: businessInfo.contactInfo,
            customerDetailLogo: logoFile,
            userId: user.id,
          })
        );
        if (result.success) {
          setSnackbar({
            open: true,
            message: "Lưu thông tin thành công!",
            severity: "success",
          });
          setCurrentStep(3);
          navigate("/custom-design?step=billboard");
        } else {
          throw new Error(result.error || "Lưu thông tin thất bại");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSnackbar({
        open: true,
        message:
          error.message || "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.",
        severity: "error",
      });
    }
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
              Thiết kế quảng cáo tùy chỉnh
            </motion.h1>
            <motion.p
              className="text-xl text-black mb-12 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Từ ý tưởng đến hiện thực - Đội ngũ thiết kế chuyên nghiệp đồng
              hành
            </motion.p>
            <motion.button
              onClick={() => {
                setCurrentStep(2);
                navigate("/custom-design?step=business");
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
                  onChange={(e) =>
                    setBusinessInfo({
                      ...businessInfo,
                      companyName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="tagLine"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="tagLine"
                  name="tagLine"
                  value={businessInfo.address || ""}
                  onChange={(e) =>
                    setBusinessInfo({
                      ...businessInfo,
                      address: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setBusinessInfo({
                      ...businessInfo,
                      contactInfo: e.target.value,
                    })
                  }
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
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-custom-primary hover:text-custom-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-custom-primary"
                      >
                        <span>Tải lên file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setBusinessInfo({
                                  ...businessInfo,
                                  logoUrl: reader.result,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">hoặc kéo thả</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF tối đa 10MB
                    </p>
                  </div>
                </div>
                {businessInfo.logoUrl && (
                  <div className="mt-4">
                    <img
                      src={businessInfo.logoUrl}
                      alt="Logo preview"
                      className="h-20 w-auto mx-auto"
                    />
                  </div>
                )}
              </motion.div>

              <motion.div
                className="flex justify-end space-x-4 pt-4"
                variants={itemVariants}
              >
                <motion.button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    navigate("/custom-design");
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

            {loadingProductTypes ? (
              <div className="flex justify-center items-center py-12">
                <CircularProgress color="primary" />
                <span className="ml-3">Đang tải loại biển hiệu...</span>
              </div>
            ) : productTypeError ? (
              <div className="text-red-500 text-center py-8">
                {productTypeError}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {productTypes.map((type, index) => (
                  <motion.div
                    key={type.id}
                    variants={cardVariants}
                    whileHover="hover"
                    className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${
                      selectedType === type.id
                        ? "ring-4 ring-custom-secondary scale-105"
                        : "hover:scale-105"
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="h-48 bg-gradient-to-r from-custom-primary to-custom-secondary flex items-center justify-center">
                      <img
                        src={getProductTypeImage(type.id, index)}
                        alt={type.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-custom-dark mb-2">
                        {type.name}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {getProductTypeDescription(type.name)}
                      </p>
                      <motion.button
                        onClick={() => setSelectedType(type.id)}
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
                    {selectedType === type.id && (
                      <div className="absolute top-2 right-2 bg-custom-secondary text-white rounded-full p-2">
                        <FaCheckCircle className="w-6 h-6" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            <motion.div
              className="flex justify-between mt-8"
              variants={itemVariants}
            >
              <motion.button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  navigate("/custom-design?step=business");
                }}
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
                onClick={async () => {
                  if (!selectedType) {
                    setSnackbar({
                      open: true,
                      message: "Vui lòng chọn loại biển hiệu",
                      severity: "warning",
                    });
                    return;
                  }
                  if (!user?.id) {
                    setSnackbar({
                      open: true,
                      message: "Không tìm thấy thông tin người dùng",
                      severity: "error",
                    });
                    return;
                  }

                  try {
                    console.log(
                      "Attempting to link customer to product type:",
                      {
                        userId: user.id,
                        productTypeId: selectedType,
                      }
                    );

                    const postRes = await import("../api/customerService").then(
                      (m) =>
                        m.linkCustomerToProductTypeApi(user.id, selectedType)
                    );

                    console.log("Link response:", postRes);

                    if (postRes.success && postRes.result?.id) {
                      setCustomerChoiceId(postRes.result.id);
                      setCurrentStep(4);
                      navigate("/custom-design?step=specs");
                    } else {
                      throw new Error(
                        postRes.error || "Không thể tạo lựa chọn khách hàng"
                      );
                    }
                  } catch (error) {
                    console.error("Error in product type selection:", error);
                    setSnackbar({
                      open: true,
                      message:
                        error.message ||
                        "Có lỗi xảy ra khi chọn loại biển hiệu. Vui lòng thử lại.",
                      severity: "error",
                    });
                  }
                }}
                className="px-6 py-3 bg-custom-primary text-white font-medium rounded-lg hover:bg-custom-secondary transition-all shadow-md hover:shadow-lg flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Tiếp tục
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
              Thông số kỹ thuật
            </motion.h2>
            {loadingSpecs ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                py={4}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box mb={4}>
                  <Typography variant="h6" gutterBottom>
                    Kích thước (nhập giá trị):
                  </Typography>
                  <Grid container spacing={2}>
                    {productTypeSizes.length === 0 ? (
                      <Grid item xs={12}>
                        Không có kích thước nào cho loại biển hiệu này.
                      </Grid>
                    ) : (
                      productTypeSizes.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <TextField
                            fullWidth
                            label={item.sizes?.name || "Không rõ tên"}
                            type="number"
                            value={sizeValues[item.id] || ""}
                            onChange={(e) =>
                              setSizeValues({
                                ...sizeValues,
                                [item.id]: e.target.value,
                              })
                            }
                            onBlur={async (e) => {
                              const value = e.target.value;
                              if (customerChoiceId && item.sizes?.id && value) {
                                try {
                                  // First try to get existing size
                                  const existingSizes = await import(
                                    "../api/customerService"
                                  ).then((m) =>
                                    m.fetchCustomerChoiceSizesApi(
                                      customerChoiceId
                                    )
                                  );

                                  if (
                                    existingSizes.success &&
                                    existingSizes.result
                                  ) {
                                    // Find if this size already exists
                                    const existingSize =
                                      existingSizes.result.find(
                                        (size) => size.sizeId === item.sizes.id
                                      );

                                    if (existingSize) {
                                      // If exists, update using PUT
                                      console.log(
                                        "Updating existing size:",
                                        existingSize.id
                                      );
                                      const res = await import(
                                        "../api/customerService"
                                      ).then((m) =>
                                        m.updateCustomerChoiceSizeApi(
                                          existingSize.id,
                                          value
                                        )
                                      );
                                      if (!res.success) {
                                        setSnackbar({
                                          open: true,
                                          message:
                                            res.error ||
                                            "Cập nhật kích thước thất bại",
                                          severity: "error",
                                        });
                                      }
                                    } else {
                                      // If not exists, create new using POST
                                      console.log("Creating new size");
                                      const res = await import(
                                        "../api/customerService"
                                      ).then((m) =>
                                        m.linkSizeToCustomerChoiceApi(
                                          customerChoiceId,
                                          item.sizes.id,
                                          value
                                        )
                                      );
                                      if (!res.success) {
                                        setSnackbar({
                                          open: true,
                                          message:
                                            res.error ||
                                            "Lưu kích thước thất bại",
                                          severity: "error",
                                        });
                                      }
                                    }
                                  }
                                } catch (error) {
                                  console.error("Error handling size:", error);
                                  setSnackbar({
                                    open: true,
                                    message:
                                      "Có lỗi xảy ra khi xử lý kích thước",
                                    severity: "error",
                                  });
                                }
                              }
                            }}
                            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                            variant="outlined"
                            sx={{ minWidth: 220, mb: 2 }}
                          />
                        </Grid>
                      ))
                    )}
                  </Grid>
                </Box>
                <Box mb={4}>
                  <Typography variant="h6" gutterBottom>
                    Thuộc tính (chọn giá trị):
                  </Typography>
                  <Grid container spacing={2}>
                    {attributes.map((attr) => (
                      <Grid item xs={12} sm={6} md={4} key={attr.id}>
                        <Box
                          sx={{
                            border: "1px solid #e0e8ff",
                            borderRadius: 2,
                            p: 2,
                            mb: 2,
                            background: "#f8faff",
                          }}
                        >
                          <Typography
                            fontWeight={700}
                            fontSize="1.05rem"
                            color="primary"
                            mb={1}
                            sx={{
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            {attr.name}
                          </Typography>
                          <FormControl
                            fullWidth
                            size="small"
                            variant="outlined"
                          >
                            <Select
                              displayEmpty
                              value={attributeValues[attr.id] || ""}
                              onChange={async (e) => {
                                const value = e.target.value;
                                setAttributeValues({
                                  ...attributeValues,
                                  [attr.id]: value,
                                });

                                if (customerChoiceId && value) {
                                  const detailId = attributeDetailIds[attr.id];
                                  if (detailId) {
                                    // If exists, update using PUT
                                    const res =
                                      await updateCustomerChoiceDetailApi(
                                        detailId,
                                        value
                                      );
                                    if (!res.success) {
                                      setSnackbar({
                                        open: true,
                                        message:
                                          res.error ||
                                          "Cập nhật thuộc tính thất bại",
                                        severity: "error",
                                      });
                                    }
                                  } else {
                                    // If not exists, create new using POST
                                    const res =
                                      await linkAttributeValueToCustomerChoiceApi(
                                        customerChoiceId,
                                        value
                                      );
                                    if (res.success && res.result?.id) {
                                      setAttributeDetailIds((prev) => ({
                                        ...prev,
                                        [attr.id]: res.result.id,
                                      }));
                                    } else if (!res.success) {
                                      setSnackbar({
                                        open: true,
                                        message:
                                          res.error ||
                                          "Lưu thuộc tính thất bại",
                                        severity: "error",
                                      });
                                    }
                                  }
                                }
                              }}
                              sx={{
                                background: "#fff",
                                borderRadius: 1,
                                fontWeight: 500,
                                fontSize: "1rem",
                                ".MuiSelect-select": { py: 1.2 },
                              }}
                            >
                              <MenuItem value="">
                                <em>Chọn giá trị</em>
                              </MenuItem>
                              {(attributeValueOptions[attr.id] || []).map(
                                (val) => (
                                  <MenuItem value={val.id} key={val.id}>
                                    <Box
                                      display="flex"
                                      justifyContent="space-between"
                                      width="100%"
                                    >
                                      <span>{val.name}</span>
                                      <span
                                        style={{
                                          color: "#43a047",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {val.unitPrice?.toLocaleString("vi-VN")}{" "}
                                        đ
                                      </span>
                                    </Box>
                                  </MenuItem>
                                )
                              )}
                            </Select>
                          </FormControl>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Box
                  sx={{
                    mt: 4,
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid #cce4ff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      color: "#1565c0",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "1rem",
                    }}
                  >
                    <span className="inline-block w-1 h-4 bg-blue-500 mr-2 rounded"></span>
                    TỔNG CHI PHÍ DỰ KIẾN
                  </Typography>

                  {loadingTotal ? (
                    <Box display="flex" alignItems="center">
                      <CircularProgress size={16} />
                      <Typography variant="body2" ml={1} color="text.secondary">
                        Đang tính...
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="success.main"
                      sx={{ fontSize: "1.1rem" }}
                    >
                      {totalAmount.toLocaleString("vi-VN")} đ
                    </Typography>
                  )}
                </Box>
              </>
            )}
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
              Xem trước & Xác nhận
            </motion.h2>

            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
              variants={itemVariants}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thông tin doanh nghiệp
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Tên doanh nghiệp</p>
                      <p className="font-medium">{businessInfo.companyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa chỉ</p>
                      <p className="font-medium">{businessInfo.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Thông tin liên hệ</p>
                      <p className="font-medium">{businessInfo.contactInfo}</p>
                    </div>
                    {businessInfo.logoUrl && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Logo</p>
                        <img
                          src={businessInfo.logoUrl}
                          alt="Logo"
                          className="h-12 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thông tin biển hiệu
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Loại biển hiệu</p>
                      <p className="font-medium">
                        {productTypes.find((t) => t.id === selectedType)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Kích thước</p>
                      <p className="font-medium">
                        {sizeValues.width}m x {sizeValues.height}m
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Chất liệu</p>
                      <p className="font-medium">{attributeValues.material}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Màu sắc</p>
                      <p className="font-medium">{attributeValues.color}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex justify-between mt-8"
              variants={itemVariants}
            >
              <motion.button
                type="button"
                onClick={() => {
                  setCurrentStep(4);
                  navigate("/custom-design?step=specs");
                }}
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
                onClick={() => {
                  setSnackbar({
                    open: true,
                    message:
                      "Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.",
                    severity: "success",
                  });
                  // Reset form and go back to step 1
                  setTimeout(() => {
                    setCurrentStep(1);
                    navigate("/");
                  }, 2000);
                }}
                className="px-6 py-3 bg-custom-primary text-white font-medium rounded-lg hover:bg-custom-secondary transition-all shadow-md hover:shadow-lg flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Xác nhận đặt hàng
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await getProfileApi();
      if (res.success && res.data) {
        setUser(res.data);
        if (res.data.id) {
          dispatch(fetchCustomerDetailByUserId(res.data.id));
        }
      }
    };
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      // Khi vào case 2, luôn kiểm tra thông tin doanh nghiệp
      import("../api/customerService")
        .then((m) => m.getCustomerDetailByUserIdApi(user.id))
        .then((res) => {
          if (res.success && res.result) {
            setBusinessInfo({
              companyName: res.result.companyName || "",
              address: res.result.tagLine || "",
              contactInfo: res.result.contactInfo || "",
              logoUrl: res.result.logoUrl || "",
            });
            // Có thể set customerDetail vào state nếu cần
          } else {
            // Không có thông tin, để form trống, không báo lỗi
            setBusinessInfo({
              companyName: "",
              address: "",
              contactInfo: "",
              logoUrl: "",
            });
          }
        });
    }
  }, [user]);

  useEffect(() => {
    if (currentStep === 3) {
      setLoadingProductTypes(true);
      getProductTypesApi()
        .then((res) => {
          if (res.success) {
            setProductTypes(res.data);
            setProductTypeError("");
          } else {
            setProductTypeError(res.error || "Không thể tải loại biển hiệu");
          }
        })
        .catch(() => setProductTypeError("Không thể tải loại biển hiệu"))
        .finally(() => setLoadingProductTypes(false));
    }
  }, [currentStep]);

  useEffect(() => {
    const fetchSpecs = async () => {
      if (currentStep === 4 && selectedType) {
        setLoadingSpecs(true);
        // Lấy kích thước
        const sizeRes = await getProductTypeSizesByProductTypeIdApi(
          selectedType
        );
        if (sizeRes.success) setProductTypeSizes(sizeRes.data);
        // Lấy thuộc tính
        const attrRes = await getAttributesByProductTypeIdApi(selectedType);
        if (attrRes.success) setAttributes(attrRes.data);
        setLoadingSpecs(false);
      }
    };
    fetchSpecs();
  }, [currentStep, selectedType]);

  useEffect(() => {
    const fetchAllAttributeValues = async () => {
      if (attributes.length > 0) {
        const newOptions = {};
        for (const attr of attributes) {
          const res = await getAttributeValuesByAttributeIdApi(attr.id);
          if (res.success) {
            newOptions[attr.id] = res.data || res.result || [];
          } else {
            newOptions[attr.id] = [];
          }
        }
        setAttributeValueOptions(newOptions);
      }
    };
    fetchAllAttributeValues();
  }, [attributes]);

  const calculateTotalAmount = async () => {
    if (!customerChoiceId) return;

    setLoadingTotal(true);
    try {
      const res = await import("../api/customerService").then((m) =>
        m.fetchCustomerChoiceApi(customerChoiceId)
      );
      if (res.success && res.result) {
        setTotalAmount(res.result.totalAmount || 0);
      }
    } catch (error) {
      console.error("Error calculating total:", error);
    } finally {
      setLoadingTotal(false);
    }
  };

  useEffect(() => {
    if (customerChoiceId) {
      calculateTotalAmount();
    }
  }, [customerChoiceId, attributeValues]);

  const loadExistingChoices = async () => {
    if (!customerChoiceId) return;

    try {
      // Load existing attribute values
      const detailsRes = await import("../api/customerService").then((m) =>
        m.fetchCustomerChoiceDetailsApi(customerChoiceId)
      );

      if (detailsRes.success && detailsRes.result) {
        const details = {};
        const attributeValues = {};
        const detailIds = {};

        detailsRes.result.forEach((detail) => {
          details[detail.attributeId] = detail.attributeValueId;
          attributeValues[detail.attributeId] = detail.attributeValueId;
          detailIds[detail.attributeId] = detail.id;
        });

        setExistingAttributeDetails(details);
        setAttributeValues(attributeValues);
        setAttributeDetailIds(detailIds);
      }

      // Load existing sizes
      const sizesRes = await import("../api/customerService").then((m) =>
        m.fetchCustomerChoiceSizesApi(customerChoiceId)
      );

      if (sizesRes.success && sizesRes.result) {
        const sizes = {};
        sizesRes.result.forEach((size) => {
          sizes[size.sizeId] = size.sizeValue;
        });
        setSizeValues(sizes);
      }
    } catch (error) {
      console.error("Error loading existing choices:", error);
    }
  };

  useEffect(() => {
    if (customerChoiceId) {
      loadExistingChoices();
    }
  }, [customerChoiceId]);

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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CustomDesign;
