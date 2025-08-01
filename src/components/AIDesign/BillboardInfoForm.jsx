import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { FaEdit, FaRobot, FaPalette } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectAllProductTypes } from "../../store/features/productType/productTypeSlice";
import { selectCustomerDetail } from "../../store/features/customer/customerSlice";

const BillboardInfoForm = ({
  attributes,
  attributeStatus,
  attributeError,
  billboardType,
  currentOrder,
  customerChoiceDetails,
  customerStatus,
  currentProductType,
  businessInfo,
  handleBillboardSubmit,
  handleBackToTypeSelection,
  setSnackbar,
  // eslint-disable-next-line no-unused-vars
  ModernBillboardForm,
}) => {
  const navigate = useNavigate();
  const productTypes = useSelector(selectAllProductTypes);
  const customerDetail = useSelector(selectCustomerDetail);

  // Đọc orderType từ localStorage để kiểm tra có phải AI_DESIGN không
  const orderTypeFromStorage = localStorage.getItem('orderTypeForNewOrder');
  const isFromAIDesignOrder = orderTypeFromStorage === 'AI_DESIGN';

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Kiểm tra trạng thái đang khôi phục
  const isRestoring =
    currentOrder?.id &&
    Object.keys(customerChoiceDetails).length === 0 &&
    customerStatus === "loading";

  if (isRestoring) {
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

        <div className="flex justify-center items-center py-12">
          <CircularProgress color="primary" />
          <p className="ml-4 text-gray-600">
            Đang khôi phục thông tin đã chọn...
          </p>
        </div>
      </motion.div>
    );
  }

  // Lấy thông tin product type hiện tại để kiểm tra isAiGenerated
  const currentProductTypeInfo =
    productTypes.find((pt) => pt.id === billboardType) || currentProductType;
  const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

  // Xác định text và icon cho nút dựa trên isAiGenerated
  const suggestButtonText = isAiGenerated
    ? "Đề xuất thiết kế bằng AI"
    : "Đề xuất thiết kế bằng Background";
  const suggestButtonIcon = isAiGenerated ? (
    <FaRobot className="w-5 h-5 mr-2" />
  ) : (
    <FaPalette className="w-5 h-5 mr-2" />
  );

  const handleCustomDesign = () => {
    navigate("/custom-design", {
      state: {
        customerChoiceId: currentOrder?.id,
        selectedType: billboardType,
        businessInfo: {
          companyName:
            businessInfo.companyName || customerDetail?.companyName || "",
          address: businessInfo.address || customerDetail?.address || "",
          contactInfo:
            businessInfo.contactInfo || customerDetail?.contactInfo || "",
          logoUrl: businessInfo.logoPreview || customerDetail?.logoUrl || "",
        },
      },
    });
  };

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
          productTypeId={billboardType}
          productTypeName={
            productTypes.find((pt) => pt.id === billboardType)?.name
          }
          setSnackbar={setSnackbar}
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

          {/* 2 nút: Thiết kế thủ công (giữa) và Đề xuất thiết kế (phải) */}
          <div className="flex space-x-4">
            {/* Chỉ hiển thị nút thiết kế thủ công nếu không phải từ AI Design order */}
            {!isFromAIDesignOrder && (
              <motion.button
                type="button"
                onClick={handleCustomDesign}
                className="px-8 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all shadow-md hover:shadow-lg flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaEdit className="w-5 h-5 mr-2" />
                Thiết kế thủ công
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
            )}

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
                  {suggestButtonIcon}
                  {suggestButtonText}
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
          </div>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default BillboardInfoForm;
