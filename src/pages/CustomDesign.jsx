import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { FaCheck, FaCheckCircle } from "react-icons/fa";

const steps = [
  { number: 1, label: "Bắt đầu" },
  { number: 2, label: "Thông tin doanh nghiệp" },
  { number: 3, label: "Chọn loại biển hiệu" },
  { number: 4, label: "Thông số kỹ thuật" },
  { number: 5, label: "Xem trước & Xác nhận" },
];

const productTypes = [
  { id: 1, name: "Biển hiệu truyền thống" },
  { id: 2, name: "Biển hiệu hiện đại" },
];

const CustomDesign = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    contactInfo: "",
    logoUrl: "",
  });
  const [selectedType, setSelectedType] = useState("");
  const [specs, setSpecs] = useState({
    width: "",
    height: "",
    material: "",
    color: "",
    notes: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentStep(3);
                navigate("/custom-design?step=billboard");
              }}
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
                  onChange={(e) =>
                    setBusinessInfo({
                      ...businessInfo,
                      logoUrl: e.target.value,
                    })
                  }
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
                    navigate("/custom-design");
                  }}
                  className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Hủy
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-custom-primary text-white font-medium rounded-lg hover:bg-custom-secondary transition-all shadow-md hover:shadow-lg flex items-center"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {productTypes.map((type) => (
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
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <Typography variant="h6" className="text-gray-600">
                      {type.name}
                    </Typography>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white rounded-full p-2">
                      <FaCheck className="w-6 h-6 text-custom-secondary" />
                    </div>
                  </div>
                  {selectedType === type.id && (
                    <div className="absolute top-2 right-2 bg-custom-secondary text-white rounded-full p-2">
                      <FaCheckCircle className="w-6 h-6" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

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
                onClick={() => {
                  if (!selectedType) {
                    setSnackbar({
                      open: true,
                      message: "Vui lòng chọn loại biển hiệu",
                      severity: "warning",
                    });
                    return;
                  }
                  setCurrentStep(4);
                  navigate("/custom-design?step=specs");
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

            <motion.form
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentStep(5);
                navigate("/custom-design?step=preview");
              }}
              className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              variants={containerVariants}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="width"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Chiều rộng (m)
                  </label>
                  <input
                    type="number"
                    id="width"
                    name="width"
                    value={specs.width}
                    onChange={(e) =>
                      setSpecs({ ...specs, width: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="height"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Chiều cao (m)
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={specs.height}
                    onChange={(e) =>
                      setSpecs({ ...specs, height: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="material"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Chất liệu
                  </label>
                  <select
                    id="material"
                    name="material"
                    value={specs.material}
                    onChange={(e) =>
                      setSpecs({ ...specs, material: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                    required
                  >
                    <option value="">Chọn chất liệu</option>
                    <option value="aluminum">Nhôm</option>
                    <option value="steel">Thép</option>
                    <option value="acrylic">Acrylic</option>
                    <option value="led">LED</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="color"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Màu sắc
                  </label>
                  <select
                    id="color"
                    name="color"
                    value={specs.color}
                    onChange={(e) =>
                      setSpecs({ ...specs, color: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                    required
                  >
                    <option value="">Chọn màu sắc</option>
                    <option value="red">Đỏ</option>
                    <option value="blue">Xanh dương</option>
                    <option value="green">Xanh lá</option>
                    <option value="yellow">Vàng</option>
                    <option value="white">Trắng</option>
                    <option value="black">Đen</option>
                  </select>
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ghi chú
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={specs.notes || ""}
                  onChange={(e) =>
                    setSpecs({ ...specs, notes: e.target.value })
                  }
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                  placeholder="Nhập ghi chú thêm về yêu cầu của bạn..."
                />
              </motion.div>

              <motion.div
                className="flex justify-end space-x-4 pt-4"
                variants={itemVariants}
              >
                <motion.button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3);
                    navigate("/custom-design?step=billboard");
                  }}
                  className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Quay lại
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-custom-primary text-white font-medium rounded-lg hover:bg-custom-secondary transition-all shadow-md hover:shadow-lg flex items-center"
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
                    Thông số kỹ thuật
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
                        {specs.width}m x {specs.height}m
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Chất liệu</p>
                      <p className="font-medium">{specs.material}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Màu sắc</p>
                      <p className="font-medium">{specs.color}</p>
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
