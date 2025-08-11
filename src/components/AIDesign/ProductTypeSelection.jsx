import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { CircularProgress } from "@mui/material";
import { getImageFromS3 } from "../../api/s3Service";

const ProductTypeSelection = ({
  productTypes,
  productTypeStatus,
  customerStatus,
  error,
  onProductTypeSelect,
  onBack,
}) => {
  

  // State để quản lý việc load ảnh từ S3
  const [loadedImages, setLoadedImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  // Effect để load ảnh khi productTypes thay đổi
  useEffect(() => {
    const loadProductTypeImages = async () => {
      if (!productTypes || productTypes.length === 0) return;

      for (const productType of productTypes) {
        if (productType.image && !loadedImages[productType.id] && !loadingImages[productType.id]) {
          setLoadingImages(prev => ({ ...prev, [productType.id]: true }));
          
          try {
            const result = await getImageFromS3(productType.image);
            if (result.success) {
              setLoadedImages(prev => ({ 
                ...prev, 
                [productType.id]: result.imageUrl 
              }));
            } else {
              console.error(`Failed to load image for ${productType.name}:`, result.message);
              // Set fallback image
              setLoadedImages(prev => ({ 
                ...prev, 
                [productType.id]: null // null sẽ trigger fallback
              }));
            }
          } catch (error) {
            console.error(`Error loading image for ${productType.name}:`, error);
            setLoadedImages(prev => ({ 
              ...prev, 
              [productType.id]: null 
            }));
          } finally {
            setLoadingImages(prev => ({ ...prev, [productType.id]: false }));
          }
        }
      }
    };

    loadProductTypeImages();
  }, [productTypes, loadedImages, loadingImages]);

  // Cleanup effect để giải phóng URL objects khi component unmount
  useEffect(() => {
    return () => {
      // Revoke all created object URLs to prevent memory leaks
      Object.values(loadedImages).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [loadedImages]);
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

  // Sử dụng image từ S3 service thay vì URL trực tiếp
  const getProductTypeImage = (productTypeId) => {
    const loadedImageUrl = loadedImages[productTypeId];
    const isLoading = loadingImages[productTypeId];
    
    if (isLoading) {
      return null; // Sẽ hiển thị loading spinner
    }
    
    if (loadedImageUrl) {
      return loadedImageUrl;
    }
    
    // Fallback image - sử dụng ảnh local hoặc solid color
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dominant-baseline='middle' fill='%236b7280' font-family='Arial, sans-serif' font-size='18'%3EProduct Type%3C/text%3E%3C/svg%3E";
  };

  // Tạo mô tả mẫu cho từng loại biển hiệu
  const getProductTypeDescription = (name, isAiGenerated) => {
    // Mô tả dựa trên tên thực tế từ API
    if (name.includes("HIỆN ĐẠI")) {
      return `Thiết kế biển hiệu hiện đại, thanh lịch và nổi bật${isAiGenerated ? " với hỗ trợ AI" : ""}.`;
    } else if (name.includes("TRUYỀN THỐNG")) {
      return `Thiết kế biển hiệu mang phong cách truyền thống, trang nhã${isAiGenerated ? " với hỗ trợ AI" : ""}.`;
    }
    
    return `Thiết kế biển hiệu chuyên nghiệp cho doanh nghiệp của bạn${isAiGenerated ? " với hỗ trợ AI" : ""}.`;
  };

  const renderContent = () => {
    if (productTypeStatus === "loading" || customerStatus === "loading") {
      return (
        <div className="flex justify-center items-center py-12">
          <CircularProgress color="primary" />
        </div>
      );
    }

    if (productTypes.length === 0) {
      return (
        <div className="text-center py-8">
          <p>Không tìm thấy loại biển hiệu nào. Vui lòng thử lại sau.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {productTypes.map((productType) => (
          <motion.div
            key={productType.id}
            variants={cardVariants}
            whileHover="hover"
            className="rounded-xl overflow-hidden shadow-md bg-white border border-gray-100"
          >
            <div className="h-48 bg-gradient-to-r from-custom-primary to-custom-secondary flex items-center justify-center relative">
              {loadingImages[productType.id] ? (
                // Hiển thị loading spinner khi đang load ảnh
                <div className="flex items-center justify-center">
                  <CircularProgress size={40} sx={{ color: 'white' }} />
                </div>
              ) : (
                <img
                  src={getProductTypeImage(productType.id)}
                  alt={productType.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback nếu không load được ảnh - sử dụng SVG fallback
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dominant-baseline='middle' fill='%236b7280' font-family='Arial, sans-serif' font-size='18'%3EProduct Type%3C/text%3E%3C/svg%3E";
                  }}
                />
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-custom-dark">
                  {productType.name}
                </h3>
                {productType.isAiGenerated && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                    AI
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-6">
                {getProductTypeDescription(productType.name, productType.isAiGenerated)}
              </p>
              <motion.button
                onClick={() => onProductTypeSelect(productType.id)}
                className="cursor-pointer w-full py-3 px-4 bg-custom-light text-custom-primary font-medium rounded-lg hover:bg-custom-tertiary hover:text-white transition-all flex items-center justify-center"
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
        ))}
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

      {renderContent()}

      <div className="mt-8 flex justify-center">
        <motion.button
          type="button"
          onClick={onBack}
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
};

export default ProductTypeSelection;
