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
  FaArrowLeft,
  FaRobot
} from "react-icons/fa";

const DesignPreview = ({
  imageGenerationError,
  imageGenerationStatus,
  generatedImage,
  stableDiffusionProgress,
  progressCheckStatus,
  progressCheckError,
  isPollingProgress,
  setSelectedImage,
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

  const handleGoBack = () => {
    setCurrentStep(5); // Quay lại step 5 (chọn mẫu thiết kế)
    navigate("/ai-design");
  };

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
      // 🎯 TRACK USER WORKFLOW: Set localStorage và URL params khi confirm AI design
      console.log("🎯 [WORKFLOW TRACKING] User confirmed AI design, navigating to editor");
      localStorage.setItem('lastUserAction', 'ai-confirmed');
      localStorage.setItem('workflowContext', 'ai');
      localStorage.setItem('lastActionStep', '6');
      
      setCurrentStep(7);
      setIsConfirming(false);
      navigate("/ai-design?from=ai&step=confirm");
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

      {/* Hiển thị tiến trình Stable Diffusion */}
      {isPollingProgress && stableDiffusionProgress && (
        <motion.div
          className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center mb-4">
            <FaRobot className="text-blue-500 text-2xl mr-3" />
            <h3 className="text-lg font-semibold text-blue-700">
              AI đang tạo thiết kế của bạn
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-500 flex items-center justify-center"
                style={{ width: `${(stableDiffusionProgress.progress || 0) * 100}%` }}
              >
                <span className="text-white text-xs font-medium">
                  {((stableDiffusionProgress.progress || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Progress info */}
            <div className="flex justify-between text-sm text-gray-600">
              <span className="font-medium">
                Tiến trình: {((stableDiffusionProgress.progress || 0) * 100).toFixed(1)}%
              </span>
              {stableDiffusionProgress.eta && (
                <span className="font-medium">
                  ⏱️ Còn lại: ~{Math.ceil(stableDiffusionProgress.eta)}s
                </span>
              )}
            </div>
            
            {/* Status indicators */}
            <div className="flex justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  stableDiffusionProgress.active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`}></div>
                <span className={stableDiffusionProgress.active ? 'text-green-600 font-medium' : 'text-gray-500'}>
                  {stableDiffusionProgress.active ? '🚀 Đang xử lý' : '⏸️ Tạm dừng'}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  stableDiffusionProgress.queued ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'
                }`}></div>
                <span className={stableDiffusionProgress.queued ? 'text-yellow-600 font-medium' : 'text-gray-500'}>
                  {stableDiffusionProgress.queued ? '⏳ Trong hàng đợi' : '❌ Không trong hàng đợi'}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  stableDiffusionProgress.completed ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
                <span className={stableDiffusionProgress.completed ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                  {stableDiffusionProgress.completed ? '✅ Hoàn thành' : '⏳ Chưa hoàn thành'}
                </span>
              </div>
            </div>
            
            {/* Text info */}
            {stableDiffusionProgress.textinfo && (
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-700 italic font-medium">
                  💬 {stableDiffusionProgress.textinfo}
                </p>
              </div>
            )}
            
            {/* Live preview - nổi bật và chi tiết hơn */}
            {stableDiffusionProgress.live_preview && 
             typeof stableDiffusionProgress.live_preview === 'string' && 
             stableDiffusionProgress.live_preview.trim().length > 0 &&
             stableDiffusionProgress.live_preview.startsWith('data:image/') ? (
              <motion.div 
                className="text-center mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border-2 border-blue-300">
                  <p className="text-xl font-bold text-blue-700 mb-2 flex items-center justify-center">
                    🎨 <span className="ml-2">Live Preview - AI đang tạo ảnh</span>
                  </p>
                  <div className="flex justify-center items-center space-x-4 text-sm">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-medium">
                      Tiến trình: {((stableDiffusionProgress.progress || 0) * 100).toFixed(1)}%
                    </span>
                    {stableDiffusionProgress.eta && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full font-medium">
                        ⏱️ Còn lại: ~{Math.ceil(stableDiffusionProgress.eta)}s
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full font-medium ${
                      stableDiffusionProgress.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {stableDiffusionProgress.active ? '🚀 Đang xử lý' : '⏸️ Tạm dừng'}
                    </span>
                  </div>
                </div>
                <motion.div 
                  className="inline-block border-4 border-blue-400 rounded-xl p-4 bg-white shadow-2xl"
                  animate={{ 
                    borderColor: ['#60a5fa', '#3b82f6', '#8b5cf6', '#60a5fa'],
                    boxShadow: [
                      '0 10px 25px rgba(59, 130, 246, 0.15)',
                      '0 20px 40px rgba(59, 130, 246, 0.25)',
                      '0 25px 50px rgba(139, 92, 246, 0.25)',
                      '0 10px 25px rgba(59, 130, 246, 0.15)'
                    ]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.img
                    key={stableDiffusionProgress.live_preview} // Re-render khi ảnh thay đổi
                    src={stableDiffusionProgress.live_preview}
                    alt="Live Preview - AI đang tạo ảnh"
                    className="max-w-lg mx-auto rounded-lg shadow-lg"
                    style={{ 
                      maxHeight: '450px', 
                      minHeight: '200px',
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    onLoad={() => console.log("🖼️ Live preview loaded:", stableDiffusionProgress.live_preview.substring(0, 50) + "...")}
                    onError={(e) => {
                      console.error("❌ Live preview failed:", e);
                      console.log("Live preview data:", stableDiffusionProgress.live_preview.substring(0, 100));
                    }}
                  />
                </motion.div>
                <div className="mt-4 flex justify-center items-center space-x-3">
                  <motion.div 
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <p className="text-base text-blue-700 font-semibold">
                    🔄 Đang cập nhật liên tục... ({((stableDiffusionProgress.progress || 0) * 100).toFixed(1)}%)
                  </p>
                  <motion.div 
                    className="w-3 h-3 bg-purple-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                  />
                </div>
                {stableDiffusionProgress.textinfo && (
                  <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 italic font-medium">
                      💬 {stableDiffusionProgress.textinfo}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : stableDiffusionProgress.active ? (
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-300 mt-6">
                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-blue-700 font-bold text-lg mb-2">
                  🎯 AI đang khởi tạo quá trình tạo ảnh...
                </p>
                <p className="text-base text-gray-700 mb-3">
                  {stableDiffusionProgress.live_preview === null ? 
                    '🚫 Live preview không khả dụng cho request này' : 
                    '⏳ Live preview sẽ xuất hiện trong giây lát'}
                </p>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="flex justify-center items-center space-x-4 text-sm">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-medium">
                      Tiến trình: {((stableDiffusionProgress.progress || 0) * 100).toFixed(1)}%
                    </span>
                    {stableDiffusionProgress.eta && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full font-medium">
                        ETA: ~{Math.ceil(stableDiffusionProgress.eta)}s
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex justify-center items-center space-x-2">
                  <motion.div 
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                  />
                </div>
              </div>
            ) : stableDiffusionProgress.completed ? (
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-300 mt-6">
                <div className="flex justify-center items-center mb-4">
                  <motion.svg 
                    className="w-10 h-10 text-green-500 mr-3" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                  <span className="text-green-700 font-bold text-xl">🎉 Hoàn thành!</span>
                </div>
                <p className="text-base text-gray-700 mb-3">
                  {stableDiffusionProgress.live_preview === null ? 
                    '⚡ Ảnh được tạo quá nhanh nên không có live preview' : 
                    '✅ Quá trình tạo ảnh đã hoàn tất với live preview'}
                </p>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="flex justify-center items-center space-x-4 text-sm">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full font-medium">
                      ✅ Hoàn thành 100%
                    </span>
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-medium">
                      🖼️ Ảnh cuối cùng đã sẵn sàng
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-sm">
                  ⏸️ Quá trình tạo ảnh đang tạm dừng
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Debug Panel - Hiển thị raw data để debug */}
      {isPollingProgress && stableDiffusionProgress && (
        <motion.div
          className="mb-4 p-4 bg-gray-50 border border-gray-300 rounded-lg"
          variants={itemVariants}
        >
          <details className="cursor-pointer">
            <summary className="text-sm font-bold text-gray-700 hover:text-gray-900 flex items-center">
              🔍 Debug Info - Dữ liệu Progress API (Click để xem chi tiết)
              {stableDiffusionProgress.live_preview && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Live Preview Available
                </span>
              )}
            </summary>
            <div className="mt-3 p-4 bg-white rounded border text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-blue-600">📊 Basic Info:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Active: {stableDiffusionProgress.active ? '✅ Yes' : '❌ No'}</li>
                    <li>Queued: {stableDiffusionProgress.queued ? '✅ Yes' : '❌ No'}</li>
                    <li>Completed: {stableDiffusionProgress.completed ? '✅ Yes' : '❌ No'}</li>
                    <li>Progress: {((stableDiffusionProgress.progress || 0) * 100).toFixed(2)}%</li>
                    <li>ETA: {stableDiffusionProgress.eta || 'N/A'}s</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-purple-600">🖼️ Live Preview:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Has live_preview: {stableDiffusionProgress.live_preview ? '✅ Yes' : '❌ No'}</li>
                    <li>Type: {typeof stableDiffusionProgress.live_preview}</li>
                    {stableDiffusionProgress.live_preview && (
                      <>
                        <li>Length: {stableDiffusionProgress.live_preview.length.toLocaleString()} chars</li>
                        <li>Is Base64: {stableDiffusionProgress.live_preview.startsWith('data:image/') ? '✅ Yes' : '❌ No'}</li>
                        <li>Format: {stableDiffusionProgress.live_preview.substring(0, 30)}...</li>
                        <li className="break-all text-green-600 font-mono">Preview start: {stableDiffusionProgress.live_preview.substring(0, 80)}...</li>
                      </>
                    )}
                    <li>ID live preview: {stableDiffusionProgress.id_live_preview || 'N/A'}</li>
                    <li>Text info: {stableDiffusionProgress.textinfo || 'N/A'}</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <strong className="text-red-600">📋 Raw JSON:</strong>
                <pre className="mt-2 text-xs overflow-x-auto bg-white p-2 rounded border">
                  {JSON.stringify(stableDiffusionProgress, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </motion.div>
      )}

    

      <div className="mb-12">
        {imageGenerationStatus === "loading" && !isPollingProgress ? (
          <div className="flex justify-center items-center py-12">
            <CircularProgress size={60} color="primary" />
            <p className="ml-4 text-gray-600">Đang tải thiết kế...</p>
          </div>
        ) : imageGenerationStatus === "succeeded" && generatedImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
           
            <motion.div
              className="rounded-xl overflow-hidden shadow-2xl mx-auto relative  "
              style={{
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={generatedImage}
                alt="AI Generated Design - Final Result"
                className="w-full h-full object-contain"
                style={{
                  width: `${imageSize.width}px`,
                  height: `${imageSize.height}px`,
                }}
                onClick={() => setSelectedImage(1)}
              />
              {/* Hiển thị thông tin kích thước pixel gốc */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-full">
                📐 {imageSize.originalWidth} × {imageSize.originalHeight} px
              </div>
            
            </motion.div>
          </motion.div>
        ) : isPollingProgress && stableDiffusionProgress?.live_preview && 
             typeof stableDiffusionProgress.live_preview === 'string' && 
             stableDiffusionProgress.live_preview.startsWith('data:image/') ? (
          <motion.div 
            className="text-center py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl border-2 border-purple-300">
              <p className="text-xl font-bold text-purple-700 mb-2">
                🎨 Live Preview Đang Hoạt Động!
              </p>
              <p className="text-sm text-gray-700">
                Đây là ảnh preview trực tiếp từ AI - ảnh cuối cùng sẽ có chất lượng cao hơn
              </p>
            </div>
            <motion.div
              className="inline-block border-4 border-purple-400 rounded-xl p-4 bg-white shadow-2xl"
              animate={{ 
                borderColor: ['#c084fc', '#8b5cf6', '#7c3aed', '#c084fc'],
                boxShadow: [
                  '0 15px 30px rgba(139, 92, 246, 0.2)',
                  '0 25px 50px rgba(124, 58, 237, 0.3)',
                  '0 20px 40px rgba(139, 92, 246, 0.25)',
                  '0 15px 30px rgba(139, 92, 246, 0.2)'
                ]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img
                src={stableDiffusionProgress.live_preview}
                alt="Live Preview - AI đang tạo ảnh"
                className="max-w-lg mx-auto rounded-lg shadow-lg"
                style={{ 
                  maxHeight: '500px',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </motion.div>
            <div className="mt-4 flex justify-center items-center space-x-3">
              <motion.div 
                className="w-3 h-3 bg-purple-500 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p className="text-lg text-purple-700 font-bold">
                🔄 Đang hoàn thiện ảnh cuối cùng... ({((stableDiffusionProgress.progress || 0) * 100).toFixed(1)}%)
              </p>
              <motion.div 
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
              />
            </div>
          </motion.div>
        ) : isPollingProgress && !stableDiffusionProgress?.live_preview ? (
          <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-center items-center mb-4">
              <CircularProgress size={40} color="primary" />
              <FaRobot className="w-12 h-12 text-blue-400 mx-4" />
            </div>
            <p className="text-blue-600 font-medium">
              AI đang khởi tạo quá trình tạo thiết kế...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Vui lòng chờ trong giây lát.
            </p>
          </div>
        ) : isPollingProgress ? (
          <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-600 font-medium mb-2">
              🎨 AI đang tạo thiết kế tùy chỉnh cho bạn
            </p>
            <p className="text-gray-500 text-sm">
              Live preview đang được hiển thị ở trên ↑
            </p>
          </div>
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
          onClick={handleGoBack}
          className="cursor-pointer px-8 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          Quay lại
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirmDesign}
          disabled={!generatedImage || isConfirming}
          className={`cursor-pointer px-8 py-3 font-medium rounded-lg transition-all flex items-center ${
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
