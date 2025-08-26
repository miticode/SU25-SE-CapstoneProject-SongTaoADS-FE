import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { CircularProgress } from "@mui/material";

const BusinessInfoForm = ({
  businessInfo,
  customerError,
  customerStatus,
  customerDetail,
  processedLogoUrl,
  onInputChange,
  onSubmit,
  onBack,
  onLogoChange,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const inputFields = [
    {
      id: "companyName",
      label: "Tên công ty",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      ),
      placeholder: "VD: Công ty TNHH ABC",
      color: "blue",
      required: true,
    },
    {
      id: "address",
      label: "Địa chỉ",
      icon: (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </>
      ),
      placeholder: "VD: 123 Đường ABC, Quận 1, TP.HCM",
      color: "emerald",
      required: true,
    },
    {
      id: "contactInfo",
      label: "Thông tin liên hệ",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      ),
      placeholder: "VD: 0123.456.789 | email@company.com",
      color: "purple",
      required: true,
    },
  ];

  const renderLogoUpload = () => {
    if (!processedLogoUrl && !businessInfo.logoPreview) {
      return (
        <div className="relative">
          <input
            type="file"
            id="customerDetailLogo"
            name="customerDetailLogo"
            accept="image/*"
            onChange={onLogoChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            required={!customerDetail}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50 transition-all duration-300">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Tải lên logo công ty
              </h3>
              <p className="text-gray-500 mb-4">
                Kéo thả file hoặc click để chọn
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Chọn file
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
              <svg
                className="w-5 h-5 text-white"
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
            </div>
            <div>
              <h4 className="font-semibold text-green-800">Logo đã sẵn sàng</h4>
              <p className="text-sm text-green-600">
                {businessInfo.logoPreview
                  ? "Logo mới đã được tải lên"
                  : "Sử dụng logo hiện có"}
              </p>
            </div>
          </div>
          <div className="relative ">
            <input
              type="file"
              id="changeLogoInput"
              accept="image/*"
              onChange={onLogoChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium bg-white px-3 py-1 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Thay đổi
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100">
            <img
              src={businessInfo.logoPreview || processedLogoUrl}
              alt="Logo Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Error loading logo:", e);
                if (customerDetail?.logoUrl && !businessInfo.logoPreview) {
                  const directApiUrl = `https://songtaoads.online/api/s3/image?key=${encodeURIComponent(
                    customerDetail.logoUrl
                  )}`;
                  e.target.src = directApiUrl;
                } else {
                  e.target.src = "/placeholder-logo.png";
                }
              }}
            />
          </div>
          {businessInfo.logoPreview && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
              Mới
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="text-center mb-10" variants={itemVariants}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Thông tin doanh nghiệp
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Cung cấp thông tin để AI có thể tạo ra thiết kế phù hợp với thương
          hiệu của bạn
        </p>
      </motion.div>

      {/* Error Display */}
      {customerError && (
        <motion.div
          className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg"
          variants={itemVariants}
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-3"
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
            <p className="text-red-700 font-medium">{customerError}</p>
          </div>
        </motion.div>
      )}

      {/* Main Form */}
      <motion.form
        onSubmit={onSubmit}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        variants={containerVariants}
      >
        <div className="p-8 md:p-10 space-y-8">
          {/* Dynamic Input Fields */}
          {inputFields.map((field) => (
            <motion.div key={field.id} variants={itemVariants}>
              <label
                htmlFor={field.id}
                className="flex items-center text-sm font-semibold text-gray-700 mb-3"
              >
                <div
                  className={`w-2 h-2 bg-${field.color}-500 rounded-full mr-3`}
                ></div>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id={field.id}
                  name={field.id}
                  value={businessInfo[field.id]}
                  onChange={onInputChange}
                  className={`w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-${field.color}-500 focus:border-${field.color}-500 transition-all duration-300 text-gray-800 placeholder-gray-400`}
                  placeholder={field.placeholder}
                  required={field.required}
                />
                <svg
                  className="absolute left-4 top-4 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {field.icon}
                </svg>
              </div>
            </motion.div>
          ))}

          {/* Logo Upload Section */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
              Logo công ty
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-4">{renderLogoUpload()}</div>
          </motion.div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-8 md:px-10 py-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <motion.button
            type="button"
            onClick={onBack}
            className="cursor-pointer w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 flex items-center justify-center"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={customerStatus === "loading"}
          >
            <svg
              className="w-5 h-5 mr-2"
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
            className="cursor-pointer w-full sm:w-auto px-8 py-3 bg-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={customerStatus === "loading"}
          >
            {customerStatus === "loading" ? (
              <>
                <CircularProgress size={20} color="inherit" className="mr-3" />
                Đang xử lý...
              </>
            ) : (
              <>
                Tiếp tục
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
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
      </motion.form>

      {/* Help Section */}
      <motion.div className="mt-8 text-center" variants={itemVariants}>
        <p className="text-sm text-gray-500">
          💡 <strong>Mẹo:</strong> Thông tin chính xác sẽ giúp AI tạo ra thiết
          kế phù hợp với thương hiệu của bạn
        </p>
      </motion.div>
    </motion.div>
  );
};

export default BusinessInfoForm;
