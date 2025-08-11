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
  coreAttributesReady,
  setCoreAttributesReady,
  currentStep,
  setFontSizePixelValue, // ✅ Thêm prop setFontSizePixelValue
}) => {
  const navigate = useNavigate();
  const productTypes = useSelector(selectAllProductTypes);
  const customerDetail = useSelector(selectCustomerDetail);

  // Đọc orderType từ localStorage để kiểm tra có phải AI_DESIGN không
  const orderTypeFromStorage = localStorage.getItem('orderTypeForNewOrder');
  const isFromAIDesignOrder = orderTypeFromStorage === 'AI_DESIGN';
  const isFromCustomDesignOrder = orderTypeFromStorage === 'CUSTOM_DESIGN_WITH_CONSTRUCTION' || orderTypeFromStorage === 'CUSTOM_DESIGN_WITHOUT_CONSTRUCTION';

  // Logic ẩn/hiện nút:
  // - Nếu từ AI Design order: Ẩn nút "Thiết kế thủ công"
  // - Nếu từ Custom Design order: Ẩn nút "Đề xuất thiết kế bằng AI"
  // - Nếu không có orderType (tạo mới): Hiển thị cả 2 nút
  const shouldShowCustomDesignButton = !isFromAIDesignOrder;
  const shouldShowAIDesignButton = !isFromCustomDesignOrder;

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
    // Kiểm tra validation trước khi chuyển trang
    if (!coreAttributesReady) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn đầy đủ các thuộc tính bắt buộc trước khi thiết kế thủ công",
        severity: "warning",
      });
      return;
    }

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

  const handleSubmitWithValidation = (e) => {
    e.preventDefault();
    
    // Kiểm tra validation trước khi submit
    if (!coreAttributesReady) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn đầy đủ các thuộc tính bắt buộc trước khi tiếp tục",
        severity: "warning",
      });
      return;
    }

    // Nếu đã đủ điều kiện thì gọi handleBillboardSubmit
    handleBillboardSubmit(e);
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

      {/* Thông báo khi đang tạo đơn hàng mới từ loại đơn hàng cụ thể */}
      {(isFromAIDesignOrder || isFromCustomDesignOrder) && (
        <motion.div
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 font-medium">
                🎯 {isFromAIDesignOrder 
                  ? "Đang tạo thêm thiết kế AI cho đơn hàng hiện có"
                  : "Đang tạo thêm thiết kế tùy chỉnh cho đơn hàng hiện có"
                }
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {isFromAIDesignOrder 
                  ? "Chỉ có thể thêm thiết kế AI vào đơn hàng này"
                  : "Chỉ có thể thêm thiết kế tùy chỉnh vào đơn hàng này"
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.form
        onSubmit={handleSubmitWithValidation}
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
          coreAttributesReady={coreAttributesReady}
          setCoreAttributesReady={setCoreAttributesReady}
          currentStep={currentStep}
          setFontSizePixelValue={setFontSizePixelValue} // ✅ Truyền prop xuống ModernBillboardForm
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
            {shouldShowCustomDesignButton && (
              <motion.button
                type="button"
                onClick={handleCustomDesign}
                disabled={!coreAttributesReady}
                className={`px-8 py-3 font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center ${
                  coreAttributesReady
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                whileHover={coreAttributesReady ? { scale: 1.02 } : {}}
                whileTap={coreAttributesReady ? { scale: 0.98 } : {}}
                title={
                  !coreAttributesReady
                    ? "Vui lòng chọn đầy đủ các thuộc tính bắt buộc"
                    : ""
                }
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

            {shouldShowAIDesignButton && (
              <motion.button
                type="submit"
                disabled={!coreAttributesReady || attributeStatus === "loading"}
                className={`px-8 py-3 font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center ${
                  coreAttributesReady && attributeStatus !== "loading"
                    ? "bg-custom-primary text-white hover:bg-custom-secondary"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                whileHover={
                  coreAttributesReady && attributeStatus !== "loading" 
                    ? { scale: 1.02 } 
                    : {}
                }
                whileTap={
                  coreAttributesReady && attributeStatus !== "loading" 
                    ? { scale: 0.98 } 
                    : {}
                }
                title={
                  !coreAttributesReady
                    ? "Vui lòng chọn đầy đủ các thuộc tính bắt buộc"
                    : ""
                }
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
            )}
          </div>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default BillboardInfoForm;
