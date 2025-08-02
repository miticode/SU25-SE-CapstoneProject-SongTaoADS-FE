import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  FaCheck,
  FaRedo,
  FaRobot
} from "react-icons/fa";

const DesignPreview = ({
  imageGenerationError,
  imageGenerationStatus,
  generatedImage,
  setSelectedImage,
  handleRegenerate,
  setSnackbar,
  setCurrentStep,
  setIsConfirming,
  isConfirming,
  showSuccess,
  setShowSuccess,
  containerVariants,
  itemVariants,
  pixelValueData,
}) => {
  const navigate = useNavigate();

  // Tính toán kích thước hiển thị ảnh dựa trên pixel value
  const getImageDisplaySize = () => {
    if (pixelValueData && pixelValueData.width && pixelValueData.height) {
      // Giới hạn kích thước tối đa để hiển thị đẹp trên màn hình
      const maxWidth = 600;
      const maxHeight = 500;
      
      const { width, height } = pixelValueData;
      const aspectRatio = width / height;
      
      let displayWidth = width;
      let displayHeight = height;
      
      // Scale down nếu vượt quá kích thước tối đa
      if (displayWidth > maxWidth || displayHeight > maxHeight) {
        if (aspectRatio > 1) {
          // Landscape - chiều rộng lớn hơn
          displayWidth = Math.min(maxWidth, width);
          displayHeight = displayWidth / aspectRatio;
        } else {
          // Portrait - chiều cao lớn hơn
          displayHeight = Math.min(maxHeight, height);
          displayWidth = displayHeight * aspectRatio;
        }
      }
      
      return {
        width: Math.round(displayWidth),
        height: Math.round(displayHeight),
        originalWidth: width,
        originalHeight: height
      };
    }
    
    // Fallback nếu không có pixel data
    return {
      width: 512,
      height: 512,
      originalWidth: 512,
      originalHeight: 512
    };
  };

  const imageSize = getImageDisplaySize();

  const handleConfirmDesign = () => {
    if (!generatedImage) {
      setSnackbar({
        open: true,
        message: "Vui lòng chờ thiết kế được tạo trước khi tiếp tục",
        severity: "warning",
      });
      return;
    }

    // Use the local isConfirming state
    setIsConfirming(true);

    // Use setTimeout to simulate processing time
    setTimeout(() => {
      setCurrentStep(7);
      setIsConfirming(false);
      navigate("/ai-design?step=confirm");
    }, 1000);
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
        Xem trước thiết kế
      </motion.h2>

      {imageGenerationError && (
        <motion.div
          className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center"
          variants={itemVariants}
        >
          Có lỗi xảy ra khi tạo hình ảnh. Vui lòng thử lại.
        </motion.div>
      )}

      <div className="mb-12">
        {imageGenerationStatus === "loading" ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress size={60} color="primary" />
            <p className="ml-4 text-gray-600">Đang tải thiết kế...</p>
          </div>
        ) : imageGenerationStatus === "succeeded" && generatedImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl overflow-hidden shadow-lg mx-auto relative"
            style={{
              width: `${imageSize.width}px`,
              height: `${imageSize.height}px`,
            }}
          >
            <img
              src={generatedImage}
              alt="AI Generated Design"
              className="w-full h-full object-contain"
              style={{
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
              }}
              onClick={() => setSelectedImage(1)}
            />
            {/* Hiển thị thông tin kích thước pixel gốc */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              {imageSize.originalWidth} × {imageSize.originalHeight} px
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <FaRobot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Không có thiết kế nào được tạo. Vui lòng quay lại và thử lại.
            </p>
          </div>
        )}
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
          onClick={handleConfirmDesign}
          disabled={!generatedImage || isConfirming}
          className={`px-8 py-3 font-medium rounded-lg transition-all flex items-center ${
            generatedImage && !isConfirming
              ? "bg-custom-secondary text-white hover:bg-custom-secondary/90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isConfirming ? (
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
              <FaCheck className="mr-2" />
              Xác nhận
            </>
          )}
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
};

export default DesignPreview;
