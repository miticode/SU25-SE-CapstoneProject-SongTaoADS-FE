import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { FaCheck, FaCheckCircle, FaPalette } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { selectAllProductTypes } from "../../store/features/productType/productTypeSlice";
import {
  selectAllDesignTemplates,
  selectSuggestedTemplates,
  selectDesignTemplateStatus,
  selectSuggestionsStatus,
  selectDesignTemplateError,
  selectSuggestionsError,
  fetchDesignTemplatesByProductTypeId,
  fetchDesignTemplateSuggestionsByCustomerChoiceId,
} from "../../store/features/designTemplate/designTemplateSlice";
import {
  selectAllBackgroundSuggestions,
  selectBackgroundStatus,
  selectBackgroundError,
  setSelectedBackground,
  fetchBackgroundSuggestionsByCustomerChoiceId,
} from "../../store/features/background/backgroundSlice";
import { fetchCustomerChoicePixelValue } from "../../store/features/customer/customerSlice";
import { createBackgroundExtras } from "../../store/features/background/backgroundSlice";

const TemplateBackgroundSelection = ({
  billboardType,
  currentProductType,
  currentOrder,
  selectedSampleProduct,
  selectedBackgroundId,
  customerNote,
  designTemplateImageUrls,
  loadingDesignTemplateUrls,
  backgroundPresignedUrls,
  loadingBackgroundUrls,
  backgroundRetryAttempts,
  handleSelectSampleProduct,
  setSelectedBackgroundId,
  setCustomerNote,
  fetchDesignTemplateImage,
  fetchBackgroundPresignedUrl,
  setBackgroundRetryAttempts,
  setBackgroundPresignedUrls,
  setSelectedBackgroundForCanvas,
  setCurrentStep,
  setSnackbar,
  handleContinueToPreview,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const productTypes = useSelector(selectAllProductTypes);
  
  // Use appropriate selectors based on AI generation  
  const allDesignTemplates = useSelector(selectAllDesignTemplates);
  const suggestedTemplates = useSelector(selectSuggestedTemplates);
  const allDesignTemplateStatus = useSelector(selectDesignTemplateStatus);
  const suggestionsStatus = useSelector(selectSuggestionsStatus);
  const allDesignTemplateError = useSelector(selectDesignTemplateError);
  const suggestionsError = useSelector(selectSuggestionsError);
  
  const backgroundSuggestions = useSelector(selectAllBackgroundSuggestions);
  const backgroundStatus = useSelector(selectBackgroundStatus);
  const backgroundError = useSelector(selectBackgroundError);

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, transition: { duration: 0.2 } },
  };

  // Lấy thông tin product type hiện tại để kiểm tra isAiGenerated
  const currentProductTypeInfo =
    productTypes.find((pt) => pt.id === billboardType) || currentProductType;
  const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

  // Choose appropriate data based on AI generation
  const designTemplates = isAiGenerated ? suggestedTemplates : allDesignTemplates;
  const designTemplateStatus = isAiGenerated ? suggestionsStatus : allDesignTemplateStatus;
  const designTemplateError = isAiGenerated ? suggestionsError : allDesignTemplateError;

  const handleContinue = async () => {
    if (isAiGenerated) {
      // Logic cho Design Template
      if (!selectedSampleProduct) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn một mẫu thiết kế trước khi tiếp tục",
          severity: "warning",
        });
        return;
      }
      if (!customerNote.trim()) {
        setSnackbar({
          open: true,
          message: "Vui lòng nhập ghi chú thiết kế trước khi tiếp tục",
          severity: "warning",
        });
        return;
      }
      // Proceed với AI generation
      handleContinueToPreview();
    } else {
      // Logic cho Background - Thêm pixel value API integration
      if (!selectedBackgroundId) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn một background trước khi tiếp tục",
          severity: "warning",
        });
        return;
      }

      console.log(
        "🔵 [Background Selection] Starting background continue process"
      );
      console.log(
        "🔵 [Background Selection] Selected Background ID:",
        selectedBackgroundId
      );
      console.log(
        "🔵 [Background Selection] Customer Choice ID:",
        currentOrder?.id
      );

      // 🎯 TRACK USER WORKFLOW: Set localStorage để track là background workflow
      console.log("🎯 [WORKFLOW TRACKING] Setting background workflow context");
      localStorage.setItem('lastUserAction', 'background-selection');
      localStorage.setItem('workflowContext', 'background');

      try {
        // Lấy pixel values từ API
        console.log(
          "🔵 [Background Selection] Fetching pixel values for customer choice:",
          currentOrder?.id
        );
        const pixelResult = await dispatch(
          fetchCustomerChoicePixelValue(currentOrder?.id)
        );

        if (fetchCustomerChoicePixelValue.fulfilled.match(pixelResult)) {
          const pixelData = pixelResult.payload;
          console.log(
            "✅ [Background Selection] Pixel values retrieved successfully:",
            pixelData
          );
          console.log("📐 [Background Selection] Canvas dimensions will be:", {
            width: pixelData.width,
            height: pixelData.height,
            ratio: pixelData.width / pixelData.height,
          });

          // 🎨 Gọi API createBackgroundExtras với pixel dimensions
          console.log(
            "🎨 [Background Selection] Creating background extras with pixel dimensions..."
          );
          const extrasResult = await dispatch(
            createBackgroundExtras({
              backgroundId: selectedBackgroundId,
              width: pixelData.width,
              height: pixelData.height,
            })
          );

          if (createBackgroundExtras.fulfilled.match(extrasResult)) {
            const extrasData = extrasResult.payload;
            console.log(
              "✅ [Background Selection] Background extras created successfully:",
              extrasData
            );
            console.log(
              "🖼️ [Background Selection] Generated image URL:",
              extrasData.imageUrl
            );
            console.log(
              "🔍 [Background Selection] Extras data keys:",
              Object.keys(extrasData)
            );
            console.log(
              "🔍 [Background Selection] Full extras response:",
              JSON.stringify(extrasData, null, 2)
            );

            // Lưu thông tin background đã chọn cùng với extras data
            const selectedBg = backgroundSuggestions.find(
              (bg) => bg.id === selectedBackgroundId
            );
            const backgroundUrl =
              backgroundPresignedUrls[selectedBackgroundId] ||
              selectedBg?.backgroundUrl;

            console.log(
              "🔵 [Background Selection] Selected background info:",
              selectedBg
            );
            console.log(
              "🔵 [Background Selection] Original background URL:",
              backgroundUrl
            );

            const backgroundForCanvas = {
              ...selectedBg,
              presignedUrl: backgroundUrl,
              extrasImageUrl: extrasData.imageUrl, // Thêm URL ảnh được tạo từ extras
              pixelData: pixelData, // Thêm pixel data
            };

            console.log(
              "🎨 [Background Selection] Setting background for canvas:",
              backgroundForCanvas
            );
            console.log(
              "🔍 [Background Selection] extrasImageUrl value:",
              backgroundForCanvas.extrasImageUrl
            );

            setSelectedBackgroundForCanvas(backgroundForCanvas);

            console.log(
              "🎨 [Background Selection] Background with extras set for canvas"
            );
          } else {
            console.warn(
              "⚠️ [Background Selection] Background extras creation failed:",
              extrasResult.error
            );
            // Vẫn tiếp tục với background gốc nếu extras fail
            const selectedBg = backgroundSuggestions.find(
              (bg) => bg.id === selectedBackgroundId
            );
            const backgroundUrl =
              backgroundPresignedUrls[selectedBackgroundId] ||
              selectedBg?.backgroundUrl;

            setSelectedBackgroundForCanvas({
              ...selectedBg,
              presignedUrl: backgroundUrl,
              pixelData: pixelData,
            });
          }
        } else {
          console.warn(
            "⚠️ [Background Selection] Pixel value fetch failed, using fallback"
          );
          console.warn("⚠️ [Background Selection] Error:", pixelResult.error);

          // Fallback: sử dụng background gốc
          const selectedBg = backgroundSuggestions.find(
            (bg) => bg.id === selectedBackgroundId
          );
          const backgroundUrl =
            backgroundPresignedUrls[selectedBackgroundId] ||
            selectedBg?.backgroundUrl;

          setSelectedBackgroundForCanvas({
            ...selectedBg,
            presignedUrl: backgroundUrl,
          });
        }

        // 🎯 TRACK USER WORKFLOW: Set localStorage và URL params để track là background workflow  
        console.log("🎯 [WORKFLOW TRACKING] Setting background workflow context for navigation");
        localStorage.setItem('lastUserAction', 'background-selection');
        localStorage.setItem('workflowContext', 'background');
        localStorage.setItem('lastActionStep', '5');

        // Chuyển thẳng đến case 7 (canvas editor)
        console.log(
          "🔵 [Background Selection] Navigating to canvas editor (step 7)"
        );
        setCurrentStep(7);
        navigate("/ai-design?from=background&step=edit");

        setSnackbar({
          open: true,
          message: "Đang tải editor với background đã chọn...",
          severity: "info",
        });
      } catch (error) {
        console.error(
          "❌ [Background Selection] Error in background continue process:",
          error
        );
        setSnackbar({
          open: true,
          message: "Có lỗi xảy ra khi xử lý background. Vui lòng thử lại.",
          severity: "error",
        });
      }
    }
  };

  const isButtonEnabled =
    (isAiGenerated && selectedSampleProduct && customerNote.trim()) ||
    (!isAiGenerated && selectedBackgroundId);

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="text-center mb-6" variants={itemVariants}>
        <h2 className="text-3xl font-bold text-custom-dark mb-4">
          {isAiGenerated ? "Chọn mẫu thiết kế" : "Chọn background phù hợp"}
        </h2>

        <p className="text-gray-600">
          {isAiGenerated
            ? "Chọn một mẫu thiết kế AI phù hợp với doanh nghiệp của bạn"
            : "Chọn một background phù hợp dựa trên thông số bạn đã chọn"}
        </p>
      </motion.div>

      {/* Design Templates Section - Chỉ hiển thị khi isAiGenerated = true */}
      {isAiGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {designTemplateStatus === "loading" ? (
            <div className="flex justify-center items-center py-12">
              <CircularProgress size={60} color="primary" />
              <p className="ml-4 text-gray-600">Đang tải mẫu thiết kế...</p>
            </div>
          ) : designTemplateStatus === "failed" ? (
            <div className="text-center py-8 bg-red-50 rounded-lg">
              <p className="text-red-500">
                {designTemplateError ||
                  "Không thể tải mẫu thiết kế. Vui lòng thử lại."}
              </p>
              <button
                onClick={() => {
                  if (isAiGenerated) {
                    if (currentOrder?.id) {
                      dispatch(
                        fetchDesignTemplateSuggestionsByCustomerChoiceId({
                          customerChoiceId: currentOrder.id,
                          page: 1,
                          size: 10
                        })
                      );
                    }
                  } else {
                    dispatch(fetchDesignTemplatesByProductTypeId(billboardType));
                  }
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Tải lại
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {designTemplates && designTemplates.length > 0 ? (
                designTemplates.map((template) => {
                  const templateImageUrl = designTemplateImageUrls[template.id];
                  const isLoadingTemplateImage =
                    loadingDesignTemplateUrls[template.id];

                  return (
                    <motion.div
                      key={template.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${
                        selectedSampleProduct === template.id
                          ? "ring-4 ring-custom-secondary scale-105"
                          : "hover:scale-105"
                      }`}
                      onClick={() => handleSelectSampleProduct(template.id)}
                    >
                      {/* Template Image */}
                      <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                        {isLoadingTemplateImage ? (
                          <div className="flex flex-col items-center">
                            <CircularProgress size={24} />
                            <p className="text-xs text-gray-500 mt-2">
                              Đang tải ảnh...
                            </p>
                          </div>
                        ) : templateImageUrl ? (
                          <img
                            src={templateImageUrl}
                            alt={template.name}
                            className="w-full h-64 object-cover"
                            onLoad={() => {
                              console.log(
                                `✅ Design template ${template.id} image loaded successfully via S3 API`
                              );
                            }}
                            onError={(e) => {
                              console.error(
                                `❌ Error loading design template ${template.id} image via S3 API:`,
                                e
                              );
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <FaPalette className="w-8 h-8 mb-2" />
                            <p className="text-xs">Không thể tải ảnh</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  `Manual retry for template ${template.id}`
                                );
                                fetchDesignTemplateImage(template);
                              }}
                              className="text-xs text-blue-500 hover:text-blue-700 mt-1 px-2 py-1 bg-white rounded border"
                            >
                              Thử lại
                            </button>
                          </div>
                        )}

                        {/* Placeholder khi lỗi */}
                        <div className="hidden w-full h-full items-center justify-center text-gray-400 flex-col">
                          <FaPalette className="w-8 h-8 mb-2" />
                          <p className="text-xs text-center">
                            Không thể tải mẫu thiết kế
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchDesignTemplateImage(template);
                            }}
                            className="text-xs text-blue-500 hover:text-blue-700 mt-1 px-2 py-1 bg-white rounded border"
                          >
                            Thử lại
                          </button>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white rounded-full p-2">
                          <FaCheck className="w-6 h-6 text-custom-secondary" />
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {selectedSampleProduct === template.id && (
                        <div className="absolute top-2 right-2 bg-custom-secondary text-white rounded-full p-2">
                          <FaCheckCircle className="w-6 h-6" />
                        </div>
                      )}

                      {/* Template info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3">
                        <h3 className="font-medium text-lg">{template.name}</h3>
                        <p className="text-sm text-gray-300 truncate">
                          {template.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">
                    Không có mẫu thiết kế nào cho loại biển hiệu này
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Customer Note cho Design Template */}
          {selectedSampleProduct && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="inline-block w-1 h-4 bg-green-500 mr-2 rounded"></span>
                  Ghi chú thiết kế <span className="text-red-500 ml-1">*</span>
                </h3>
                <textarea
                  className={`w-full px-4 py-3 border ${
                    selectedSampleProduct && !customerNote.trim()
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-custom-primary focus:border-custom-primary"
                  } rounded-lg focus:ring-2 transition-all`}
                  rows="3"
                  name="designNotes"
                  placeholder="Mô tả yêu cầu thiết kế chi tiết của bạn..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                ></textarea>
                <div className="flex justify-between mt-2">
                  <p className="text-gray-500 text-sm italic">
                    Chi tiết sẽ giúp AI tạo thiết kế phù hợp hơn với nhu cầu của
                    bạn
                  </p>
                  <p className="text-red-500 text-sm">
                    {selectedSampleProduct && !customerNote.trim()
                      ? "Vui lòng nhập ghi chú thiết kế"
                      : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Background Suggestions Section - Chỉ hiển thị khi isAiGenerated = false */}
      {!isAiGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {backgroundStatus === "loading" ? (
            <div className="flex justify-center items-center py-12">
              <CircularProgress size={60} color="primary" />
              <p className="ml-4 text-gray-600">
                Đang tải đề xuất background...
              </p>
            </div>
          ) : backgroundStatus === "failed" ? (
            <div className="text-center py-8 bg-red-50 rounded-lg">
              <p className="text-red-500">
                {backgroundError ||
                  "Không thể tải đề xuất background. Vui lòng thử lại."}
              </p>
              <button
                onClick={() => {
                  if (currentOrder?.id) {
                    dispatch(
                      fetchBackgroundSuggestionsByCustomerChoiceId(
                        currentOrder.id
                      )
                    );
                  }
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Tải lại
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {backgroundSuggestions && backgroundSuggestions.length > 0 ? (
                backgroundSuggestions.map((background) => {
                  const presignedUrl = backgroundPresignedUrls[background.id];
                  const isLoadingUrl = loadingBackgroundUrls[background.id];
                  const retryCount =
                    backgroundRetryAttempts[background.id] || 0;
                  const hasFailed = presignedUrl === null;

                  return (
                    <motion.div
                      key={background.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${
                        selectedBackgroundId === background.id
                          ? "ring-4 ring-custom-secondary scale-105"
                          : "hover:scale-105"
                      } ${hasFailed ? "opacity-75" : ""}`}
                      onClick={() => {
                        if (!hasFailed) {
                          setSelectedBackgroundId(background.id);
                          dispatch(setSelectedBackground(background));
                        }
                      }}
                    >
                      {/* Background Image */}
                      <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                        {isLoadingUrl ? (
                          <div className="flex flex-col items-center">
                            <CircularProgress size={24} />
                            <p className="text-xs text-gray-500 mt-2">
                              Đang tải ảnh... (Lần {retryCount + 1})
                            </p>
                          </div>
                        ) : hasFailed ? (
                          <div className="flex flex-col items-center text-red-400">
                            <FaPalette className="w-8 h-8 mb-2" />
                            <p className="text-xs text-center">
                              Không thể tải ảnh
                            </p>
                            <p className="text-xs text-center text-gray-400">
                              Đã thử {retryCount} lần
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBackgroundRetryAttempts((prev) => ({
                                  ...prev,
                                  [background.id]: 0,
                                }));
                                setBackgroundPresignedUrls((prev) => ({
                                  ...prev,
                                  [background.id]: undefined,
                                }));
                                fetchBackgroundPresignedUrl(
                                  background.id,
                                  background.backgroundUrl
                                );
                              }}
                              className="text-xs text-blue-500 hover:text-blue-700 mt-1 px-2 py-1 bg-white rounded border"
                            >
                              Thử lại
                            </button>
                          </div>
                        ) : presignedUrl ? (
                          <img
                            src={presignedUrl}
                            alt={background.name}
                            className="w-full h-64 object-cover"
                            onLoad={() => {
                              console.log(
                                "✅ Background image loaded successfully:",
                                background.id
                              );
                            }}
                            onError={(e) => {
                              console.error(
                                `❌ Error displaying background ${background.id}:`,
                                e
                              );

                              const currentRetries =
                                backgroundRetryAttempts[background.id] || 0;

                              if (currentRetries < 2) {
                                console.log(
                                  `🔄 Retrying display for background ${
                                    background.id
                                  } (attempt ${currentRetries + 1})`
                                );

                                setBackgroundRetryAttempts((prev) => ({
                                  ...prev,
                                  [background.id]: currentRetries + 1,
                                }));

                                setTimeout(() => {
                                  fetchBackgroundPresignedUrl(
                                    background.id,
                                    background.backgroundUrl
                                  );
                                }, 1000 * (currentRetries + 1));
                              } else {
                                e.target.style.display = "none";
                                const placeholder =
                                  e.target.parentElement.querySelector(
                                    ".error-placeholder"
                                  );
                                if (placeholder) {
                                  placeholder.style.display = "flex";
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <FaPalette className="w-8 h-8 mb-2" />
                            <p className="text-xs text-center">
                              Chờ tải ảnh...
                            </p>
                          </div>
                        )}

                        {/* Error placeholder */}
                        <div className="hidden w-full h-full items-center justify-center text-gray-400 flex-col error-placeholder">
                          <FaPalette className="w-8 h-8 mb-2" />
                          <p className="text-xs text-center">
                            Không thể hiển thị ảnh
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBackgroundRetryAttempts((prev) => ({
                                ...prev,
                                [background.id]: 0,
                              }));
                              setBackgroundPresignedUrls((prev) => ({
                                ...prev,
                                [background.id]: undefined,
                              }));
                              fetchBackgroundPresignedUrl(
                                background.id,
                                background.backgroundUrl
                              );
                            }}
                            className="text-xs text-blue-500 hover:text-blue-700 mt-1 px-2 py-1 bg-white rounded border"
                          >
                            Thử lại
                          </button>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white rounded-full p-2">
                          <FaCheck className="w-6 h-6 text-custom-secondary" />
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {selectedBackgroundId === background.id && (
                        <div className="absolute top-2 right-2 bg-custom-secondary text-white rounded-full p-2">
                          <FaCheckCircle className="w-6 h-6" />
                        </div>
                      )}

                      {/* Background info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white p-3">
                        <h3 className="font-medium text-base mb-1 leading-tight">
                          {background.name}
                        </h3>

                        <div className="group/tooltip relative">
                          <p className="text-sm text-gray-200 truncate cursor-help">
                            {background.description}
                          </p>

                          <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-black/95 text-white text-xs rounded opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-10">
                            {background.description}
                          </div>
                        </div>

                        {background.attributeValues && (
                          <p className="text-xs text-blue-200 mt-1">
                            🏷️ {background.attributeValues.name}
                          </p>
                        )}
                      </div>

                      {/* Unavailable/Failed overlays */}
                      {!background.isAvailable && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Không khả dụng
                          </span>
                        </div>
                      )}
                      {hasFailed && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Lỗi tải ảnh
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-8">
                  <FaPalette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Không có đề xuất background nào phù hợp
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Thử thay đổi các thông số kỹ thuật để có thêm đề xuất
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <motion.div className="flex justify-between mt-8" variants={itemVariants}>
        <motion.button
          type="button"
          onClick={() => setCurrentStep(4)}
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
          type="button"
          onClick={handleContinue}
          className={`px-8 py-3 font-medium rounded-lg transition-all flex items-center ${
            isButtonEnabled
              ? "bg-custom-primary text-white hover:bg-custom-secondary"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          whileHover={isButtonEnabled ? { scale: 1.02 } : {}}
          whileTap={isButtonEnabled ? { scale: 0.98 } : {}}
          disabled={!isButtonEnabled}
        >
          {isAiGenerated ? "Tạo thiết kế AI" : "Thiết kế với Background"}
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
      </motion.div>
    </motion.div>
  );
};

export default TemplateBackgroundSelection;
