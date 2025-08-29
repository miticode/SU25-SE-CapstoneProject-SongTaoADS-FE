import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import "../styles/fonts.css";
import StepIndicator from "../components/StepIndicator";
import WelcomePage from "../components/AIDesign/WelcomePage";
import BusinessInfoForm from "../components/AIDesign/BusinessInfoForm";
import ProductTypeSelection from "../components/AIDesign/ProductTypeSelection";
import BillboardInfoForm from "../components/AIDesign/BillboardInfoForm";
import TemplateBackgroundSelection from "../components/AIDesign/TemplateBackgroundSelection";
import DesignPreview from "../components/AIDesign/DesignPreview";
import DesignEditor from "../components/AIDesign/DesignEditor";
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
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  FaCheck,
  FaRedo,
  FaCheckCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaRobot,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProductTypes,
  fetchProductTypeSizesByProductTypeId,
  selectAllProductTypes,
  selectProductTypeSizes,
  selectProductTypeSizesError,
  selectProductTypeSizesStatus,
  selectProductTypeStatus,
  selectProductTypePagination,
  resetProductTypeStatus,
} from "../store/features/productType/productTypeSlice";
import {
  createCustomer,
  selectCustomerStatus,
  selectCustomerError,
  linkCustomerToProductType,
  selectCurrentOrder,
  selectSizesStatus,
  selectAttributeValuesStatus,
  linkAttributeValueToCustomerChoice,
  linkSizeToCustomerChoice,
  selectCustomerChoiceDetails,
  deleteCustomerChoice,
  updateCustomerChoiceDetail,
  fetchCustomerDetailByUserId,
  updateCustomerDetail,
  selectCustomerDetail,
  updateCustomerChoiceSize,
  fetchCustomerChoiceDetails,
  selectTotalAmount,
  selectFetchCustomerChoiceStatus,
  fetchCustomerChoice,
  fetchCustomerChoices,
  fetchCustomerChoiceSizes,
  fetchCustomerChoicePixelValue,
  selectPixelValue,
  selectPixelValueStatus,
  clearCustomerDetail,
} from "../store/features/customer/customerSlice";
import { getProfileApi } from "../api/authService";
import {
  fetchAttributesByProductTypeId,
  fetchAttributeValuesByAttributeId,
  selectAllAttributes,
  selectAttributeError,
  selectAttributeStatus,
  clearAttributes,
} from "../store/features/attribute/attributeSlice";
import { createOrderApi } from "../api/orderService";
import { createAiOrder, createOrder } from "../store/features/order/orderSlice";
import * as fabric from "fabric";
import html2canvas from "html2canvas";
import {
  FaFont,
  FaPalette,
  FaPlus,
  FaTrash,
  FaBold,
  FaItalic,
  FaUnderline,
} from "react-icons/fa";
import {
  fetchDesignTemplateSuggestionsByCustomerChoiceId,
  selectAllDesignTemplates,
  selectSuggestedTemplates,
  selectDesignTemplateError,
  selectDesignTemplateStatus,
  selectSuggestionsStatus,
  selectSuggestionsError,
} from "../store/features/designTemplate/designTemplateSlice";
import {
  createAIDesign,
  generateImageFromText,
  checkStableDiffusionProgress,
  selectAIError,
  selectAIStatus,
  selectCurrentAIDesign,
  selectGeneratedImage,
  selectImageGenerationError,
  selectImageGenerationStatus,
  selectStableDiffusionProgress,
  selectProgressCheckStatus,
  selectProgressCheckError,
  resetProgressCheck,
  resetImageGeneration,
  setCurrentAIDesign,
} from "../store/features/ai/aiSlice";
import { fetchImageFromS3, selectS3Image } from "../store/features/s3/s3Slice";
import jsPDF from "jspdf";
import {
  fetchBackgroundSuggestionsByCustomerChoiceId,
  selectAllBackgroundSuggestions,
  selectBackgroundError,
  selectBackgroundStatus,
  selectSelectedBackground,
  setSelectedBackground,
  clearSelectedBackground,
  clearBackgroundSuggestions,
  resetBackgroundStatus,
  selectEditedDesign,
  selectEditedDesignStatus,
  selectEditedDesignError,
  createEditedDesignWithBackgroundThunk,
} from "../store/features/background/backgroundSlice";
import { getImageFromS3, getPresignedUrl } from "../api/s3Service";
import {
  clearSelectedIcon,
  fetchIcons,
  refreshIconPresignedUrls,
  selectAllIcons,
  selectHasNextPage,
  selectHasPreviousPage,
  selectIconError,
  selectIconPagination,
  selectIconStatus,
  selectSelectedIcon,
  setSelectedIcon,
  updateIconUrl,
} from "../store/features/icon/iconSlice";
const ModernBillboardForm = ({
  attributes,
  status,
  productTypeId,
  productTypeName,
  setSnackbar,
  coreAttributesReady,
  setCoreAttributesReady,
  currentStep,
  setFontSizePixelValue, // ✅ Thêm prop để set fontSizePixelValue
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [sizesConfirmed, setSizesConfirmed] = useState(false);
  const [sizeValidationError, setSizeValidationError] = useState("");
  const attributeValuesState = useSelector(
    (state) => state.attribute.attributeValues
  );
  const attributeValuesStatusState = useSelector(
    (state) => state.attribute.attributeValuesStatus
  );
  const hasRestoredSizesRef = useRef(false);
  const hasRestoredAttributesRef = useRef(false);
  const hasRestoredDataRef = useRef(false);

  // Reset restoration flag when navigating back to step 4
  useEffect(() => {
    if (currentStep === 4) {
      hasRestoredAttributesRef.current = false;

      // Clean form nếu có orderTypeForNewOrder trong localStorage
      const orderTypeForNewOrder = localStorage.getItem("orderTypeForNewOrder");

      if (orderTypeForNewOrder) {
        console.log(
          "Found orderTypeForNewOrder in localStorage, cleaning form..."
        );

        // Reset form data
        setFormData({});

        // Reset sizes
        setSizesConfirmed(false);
        setCustomerChoiceSizes({});
        setEditedSizes({});
        setIsEditingSizes(false);

        // Reset validation errors
        setValidationErrors({});
        setSizeValidationError("");

        // Reset attribute prices
        setAttributePrices({});

        // Reset core attributes validation
        setCoreAttributesValidation({});
        setCoreAttributesReady(false);

        // Reset refresh counter
        setRefreshCounter(0);

        // Reset restoration flags
        hasRestoredSizesRef.current = false;
        hasRestoredAttributesRef.current = false;
        hasRestoredDataRef.current = false;

        // Clear attribute values from Redux store
        dispatch(clearAttributes());

        console.log(
          "Form cleaned successfully due to orderTypeForNewOrder in localStorage"
        );
      }
    }
  }, [currentStep, setCoreAttributesReady, dispatch]);

  const productTypeSizes = useSelector(selectProductTypeSizes);
  const productTypeSizesStatus = useSelector(selectProductTypeSizesStatus);
  const productTypeSizesError = useSelector(selectProductTypeSizesError);
  const attributeValuesStatus = useSelector(selectAttributeValuesStatus);
  const sizesStatus = useSelector(selectSizesStatus);
  const customerError = useSelector(selectCustomerError);
  const customerChoiceDetails = useSelector(selectCustomerChoiceDetails);
  const currentOrder = useSelector(selectCurrentOrder);
  const [editingSizeId, setEditingSizeId] = useState(null);
  const [editingSizeValue, setEditingSizeValue] = useState("");
  const [customerChoiceSizes, setCustomerChoiceSizes] = useState({});
  const [editedSizes, setEditedSizes] = useState({});
  const [isEditingSizes, setIsEditingSizes] = useState(false);
  const totalAmount = useSelector(selectTotalAmount);
  const [attributePrices, setAttributePrices] = useState({});

  const fetchCustomerChoiceStatus = useSelector(
    selectFetchCustomerChoiceStatus
  );
  const previousSubTotalsRef = React.useRef({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [coreAttributesValidation, setCoreAttributesValidation] = useState({});

  // Hàm kiểm tra xem tất cả thuộc tính bắt buộc đã được chọn chưa
  const validateCoreAttributes = useCallback(() => {
    const coreAttributes = attributes.filter((attr) => attr.isCore === true);
    const missingCoreAttributes = [];

    coreAttributes.forEach((attr) => {
      if (!formData[attr.id] || formData[attr.id] === "") {
        missingCoreAttributes.push(attr.name);
      }
    });

    setCoreAttributesValidation({
      isValid: missingCoreAttributes.length === 0,
      missingAttributes: missingCoreAttributes,
      coreAttributesCount: coreAttributes.length,
      selectedCoreAttributesCount:
        coreAttributes.length - missingCoreAttributes.length,
    });

    return missingCoreAttributes.length === 0;
  }, [attributes, formData]);

  // Effect để tự động validate khi formData hoặc attributes thay đổi
  useEffect(() => {
    if (sizesConfirmed && attributes.length > 0) {
      const isValid = validateCoreAttributes();
      if (setCoreAttributesReady) {
        setCoreAttributesReady(isValid);
      }
    }
  }, [
    sizesConfirmed,
    attributes,
    formData,
    validateCoreAttributes,
    setCoreAttributesReady,
  ]);

  useEffect(() => {
    // Tạo mapping từ attributeValueId trong customerChoiceDetails về attributeId
    if (
      customerChoiceDetails &&
      Object.keys(customerChoiceDetails).length > 0 &&
      attributes.length > 0 &&
      Object.keys(attributeValuesState).length > 0
    ) {
      const newAttributePrices = {};
      const restoredFormData = {};

      // Duyệt qua tất cả customerChoiceDetails (mapped by attributeValueId)
      Object.entries(customerChoiceDetails).forEach(
        ([attributeValueId, detail]) => {
          if (detail?.subTotal !== undefined) {
            // Tìm attributeId tương ứng với attributeValueId này
            let foundAttributeId = null;

            for (const attribute of attributes) {
              const attributeValues = attributeValuesState[attribute.id] || [];
              const hasThisValue = attributeValues.some(
                (av) => av.id === attributeValueId
              );

              if (hasThisValue) {
                foundAttributeId = attribute.id;
                // Khôi phục formData với attributeValueId đã chọn
                restoredFormData[foundAttributeId] = attributeValueId;
                break;
              }
            }

            if (foundAttributeId) {
              newAttributePrices[foundAttributeId] = {
                subTotal: detail.subTotal,
                attributeValueId: attributeValueId,
                attributeValueName:
                  detail.attributeValueName || detail.attributeValues?.name,
              };
            } else {
              console.warn(
                `❌ Could not find attributeId for value ${attributeValueId}`
              );
            }
          }
        }
      );

      setAttributePrices(newAttributePrices);

      // Khôi phục formData với các lựa chọn đã có
      if (Object.keys(restoredFormData).length > 0) {
        setFormData((prev) => ({
          ...prev,
          ...restoredFormData,
        }));
      }
    } else {
      setAttributePrices({});
    }
  }, [customerChoiceDetails, attributes, attributeValuesState]);
  const handleEditSizes = () => {
    const initialEditValues = {};
    productTypeSizes.forEach((ptSize) => {
      const sizeId = ptSize.sizes?.id; // Thêm optional chaining
      const fieldName = `size_${sizeId}`;
      initialEditValues[sizeId] = formData[fieldName] || "";
    });

    setEditedSizes(initialEditValues);
    setIsEditingSizes(true);
  };

  // Thêm hàm xử lý thay đổi giá trị kích thước đang chỉnh sửa với validation
  const handleSizeEditChange = (sizeId, value) => {
    setEditedSizes((prev) => ({
      ...prev,
      [sizeId]: value,
    }));

    // Real-time validation với đúng thuộc tính từ API
    const ptSize = productTypeSizes.find((size) => size.sizes?.id === sizeId);
    if (ptSize && value) {
      const numValue = parseFloat(value);
      const fieldName = `size_${sizeId}`;
      const minValue = ptSize.minValue; // Đọc trực tiếp từ ptSize
      const maxValue = ptSize.maxValue; // Đọc trực tiếp từ ptSize
      const sizeName = ptSize.sizes?.name || "Kích thước";

      if (!isNaN(numValue)) {
        if (numValue < minValue) {
          setValidationErrors((prev) => ({
            ...prev,
            [fieldName]: `${sizeName} phải ≥ ${minValue}m`,
          }));
        } else if (numValue > maxValue) {
          setValidationErrors((prev) => ({
            ...prev,
            [fieldName]: `${sizeName} phải ≤ ${maxValue}m`,
          }));
        } else {
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      }
    }
  };

  // Thêm hàm xử lý cập nhật tất cả kích thước với validation min/max
  const handleUpdateAllSizes = async () => {
    try {
      // Validate các giá trị đã nhập với min/max từ đúng thuộc tính
      let hasErrors = false;
      const newValidationErrors = {};

      for (const ptSize of productTypeSizes) {
        const sizeId = ptSize.sizes?.id; // Thêm optional chaining
        const value = editedSizes[sizeId];
        const minValue = ptSize.minValue; // Đọc trực tiếp từ ptSize
        const maxValue = ptSize.maxValue; // Đọc trực tiếp từ ptSize
        const sizeName = ptSize.sizes?.name || "Kích thước";
        const fieldName = `size_${sizeId}`;

        if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          hasErrors = true;
          newValidationErrors[fieldName] = `${sizeName} phải lớn hơn 0`;
        } else {
          const numValue = parseFloat(value);
          if (numValue < minValue) {
            hasErrors = true;
            newValidationErrors[fieldName] = `${sizeName} phải ≥ ${minValue}m`;
          } else if (numValue > maxValue) {
            hasErrors = true;
            newValidationErrors[fieldName] = `${sizeName} phải ≤ ${maxValue}m`;
          }
        }
      }

      if (hasErrors) {
        setValidationErrors(newValidationErrors);
        return;
      }

      // Update each size
      const customerChoiceId = currentOrder?.id;
      if (!customerChoiceId) {
        setSizeValidationError("Không tìm thấy đơn hàng hiện tại");
        return;
      }

      // Show loading state
      setSnackbar({
        open: true,
        message: "Đang cập nhật kích thước...",
        severity: "info",
      });

      // Update all sizes
      for (const ptSize of productTypeSizes) {
        const sizeId = ptSize.sizes.id;
        const value = editedSizes[sizeId];

        // Thay đổi tham số truyền vào API để phù hợp với API
        await dispatch(
          updateCustomerChoiceSize({
            customerChoiceSizeId: customerChoiceSizes[sizeId]?.id,
            sizeValue: value, // Sửa lại tham số theo đúng yêu cầu API
          })
        ).unwrap();

        // Update form data
        const fieldName = `size_${sizeId}`;
        setFormData((prev) => ({
          ...prev,
          [fieldName]: value,
        }));
      }

      // Reset editing state
      setIsEditingSizes(false);

      // Refresh data
      setRefreshCounter((prev) => prev + 1);

      setTimeout(async () => {
        try {
          // Fetch lại toàn bộ thông tin chi tiết và tổng tiền
          await dispatch(fetchCustomerChoiceDetails(currentOrder.id)).unwrap();
          await dispatch(fetchCustomerChoice(currentOrder.id)).unwrap();

          // ✅ Tính toán fontSizePixelValue cho size có dimensionType = "FONT_SIZE"
          try {
            console.log(
              "=== TÍNH TOÁN FONT SIZE PIXEL VALUE TRONG UPDATE SIZE ==="
            );
            console.log("🔍 Tìm kiếm size có dimensionType = 'FONT_SIZE'...");

            // Tìm size có dimensionType = "FONT_SIZE"
            const fontSizeData = productTypeSizes.find(
              (ptSize) => ptSize.dimensionType === "FONT_SIZE"
            );

            if (fontSizeData) {
              console.log("✅ Tìm thấy fontSizeData:", fontSizeData);

              const sizeId = fontSizeData.sizes?.id;
              const fieldName = `size_${sizeId}`;
              const sizeValue = parseFloat(editedSizes[sizeId]);
              const minValue = fontSizeData.minValue;
              const maxValue = fontSizeData.maxValue;

              console.log("📊 Thông tin tính toán:");
              console.log(`- sizeId: ${sizeId}`);
              console.log(`- sizeValue: ${sizeValue}`);
              console.log(`- minValue: ${minValue}`);
              console.log(`- maxValue: ${maxValue}`);

              if (
                sizeValue &&
                minValue !== undefined &&
                maxValue !== undefined
              ) {
                // Áp dụng công thức: fontSizePixelValue = 256 + (1024-256) * (sizeValue-minValue) / (maxValue-minValue)
                const rawFontSizePixelValue =
                  256 +
                  ((1024 - 256) * (sizeValue - minValue)) /
                    (maxValue - minValue);
                const fontSizePixelValue = Math.round(rawFontSizePixelValue); // Làm tròn số thập phân

                console.log(
                  `🎯 Kết quả công thức (trước khi làm tròn): ${rawFontSizePixelValue}`
                );
                console.log(
                  `🎯 Kết quả cuối cùng (sau khi làm tròn): ${fontSizePixelValue}`
                );

                // Log chi tiết công thức
                console.log(`📐 Chi tiết công thức:`);
                console.log(
                  `   fontSizePixelValue = 256 + (1024-256) * (${sizeValue}-${minValue}) / (${maxValue}-${minValue})`
                );
                console.log(
                  `   fontSizePixelValue = 256 + 768 * ${
                    sizeValue - minValue
                  } / ${maxValue - minValue}`
                );
                console.log(
                  `   fontSizePixelValue = 256 + 768 * ${
                    (sizeValue - minValue) / (maxValue - minValue)
                  }`
                );
                console.log(
                  `   fontSizePixelValue = 256 + ${
                    (768 * (sizeValue - minValue)) / (maxValue - minValue)
                  }`
                );
                console.log(
                  `   fontSizePixelValue (raw) = ${rawFontSizePixelValue}`
                );
                console.log(
                  `   fontSizePixelValue (rounded) = ${fontSizePixelValue}`
                );

                // Có thể lưu vào state hoặc gửi đến API nếu cần
                // ✅ Lưu fontSizePixelValue vào state để sử dụng trong canvas
                if (
                  setFontSizePixelValue &&
                  typeof setFontSizePixelValue === "function"
                ) {
                  setFontSizePixelValue(fontSizePixelValue);
                  console.log(
                    `💾 Đã lưu fontSizePixelValue vào state: ${fontSizePixelValue}`
                  );
                } else {
                  console.warn(
                    "⚠️ setFontSizePixelValue prop không có sẵn hoặc không phải function"
                  );
                }
              } else {
                console.log(
                  "⚠️ Thiếu thông tin để tính toán fontSizePixelValue"
                );
                console.log(
                  `- sizeValue: ${sizeValue} (valid: ${!!sizeValue})`
                );
                console.log(
                  `- minValue: ${minValue} (valid: ${minValue !== undefined})`
                );
                console.log(
                  `- maxValue: ${maxValue} (valid: ${maxValue !== undefined})`
                );
              }
            } else {
              console.log(
                "❌ Không tìm thấy size có dimensionType = 'FONT_SIZE'"
              );
              console.log("📋 Danh sách productTypeSizes hiện có:");
              productTypeSizes.forEach((ptSize, index) => {
                console.log(
                  `   ${index + 1}. ID: ${ptSize.id}, dimensionType: ${
                    ptSize.dimensionType
                  }, sizeName: ${ptSize.sizes?.name}`
                );
              });
            }
          } catch (fontCalcError) {
            console.error(
              "❌ Lỗi khi tính toán fontSizePixelValue:",
              fontCalcError
            );
          }
          console.log("=== KẾT THÚC TÍNH TOÁN FONT SIZE PIXEL VALUE ===");
          console.log("");

          // Quan trọng: Cập nhật lại giá cho từng thuộc tính đã chọn
          const attributeValues = { ...formData };
          for (const attributeId in attributeValues) {
            if (
              attributes.some((attr) => attr.id === attributeId) &&
              attributeValues[attributeId]
            ) {
              // Nếu là một thuộc tính và có giá trị, gọi API để cập nhật hoặc liên kết lại
              const existingChoiceDetail = customerChoiceDetails[attributeId];

              if (existingChoiceDetail) {
                // Cập nhật lại giá trị thuộc tính đã có - điều này sẽ kích hoạt tính toán lại giá dựa trên kích thước mới
                await dispatch(
                  updateCustomerChoiceDetail({
                    customerChoiceDetailId: existingChoiceDetail.id,
                    attributeValueId: attributeValues[attributeId],
                    attributeId: attributeId,
                  })
                ).unwrap();
              }
            }
          }

          // Sau khi cập nhật tất cả thuộc tính, fetch lại để hiển thị giá mới
          await dispatch(fetchCustomerChoiceDetails(currentOrder.id)).unwrap();
          await dispatch(fetchCustomerChoice(currentOrder.id)).unwrap();

          // Show success message
          setSnackbar({
            open: true,
            message: "Kích thước và giá đã được cập nhật thành công",
            severity: "success",
          });
        } catch (error) {
          console.error("Error refreshing prices after size update:", error);
        }
      }, 800);
    } catch (error) {
      console.error("Error updating sizes:", error);
      setSnackbar({
        open: true,
        message:
          "Có lỗi xảy ra khi cập nhật kích thước: " +
          (error.message || "Lỗi không xác định"),
        severity: "error",
      });
    }
  };

  // Thêm hàm hủy chỉnh sửa kích thước
  const handleCancelEditSizes = () => {
    setIsEditingSizes(false);
    setEditedSizes({});
  };

  useEffect(() => {
    if (
      currentOrder?.id &&
      productTypeSizes.length > 0 &&
      !hasRestoredDataRef.current
    ) {
      hasRestoredDataRef.current = true;

      dispatch(fetchCustomerChoiceSizes(currentOrder.id))
        .unwrap()
        .then((sizes) => {
          if (sizes && sizes.length > 0) {
            const existingSizes = {};
            const sizeFormData = {};

            sizes.forEach((size) => {
              // API trả về sizes với structure: {sizeId, sizeValue, sizes: {id, name}}
              const sizeId = size.sizeId || size.sizes?.id;

              if (sizeId) {
                existingSizes[sizeId] = size;
                const fieldName = `size_${sizeId}`;
                sizeFormData[fieldName] = size.sizeValue.toString();

                console.log(`Mapped size ${sizeId}: ${size.sizeValue}`);
              }
            });

            setCustomerChoiceSizes(existingSizes);

            setFormData((prev) => {
              const newFormData = {
                ...prev,
                ...sizeFormData,
              };

              return newFormData;
            });

            if (sizes.length === productTypeSizes.length) {
              setSizesConfirmed(true);
              console.log("All sizes restored and confirmed");
            }
          }
        })
        .catch((error) => {
          console.error(
            "Failed to load customer choice sizes for restore:",
            error
          );
        });
    }
  }, [currentOrder?.id, productTypeSizes.length, dispatch]);
  useEffect(() => {
    if (currentOrder?.id && sizesConfirmed) {
      dispatch(fetchCustomerChoice(currentOrder.id));
    }
  }, [currentOrder?.id, sizesConfirmed, dispatch]);
  useEffect(() => {
    // When sizes are confirmed and we have a current order, fetch the details
    if (sizesConfirmed && currentOrder?.id) {
      // Make sure we fetch the details periodically until we get them
      const fetchDetails = () => {
        dispatch(fetchCustomerChoiceDetails(currentOrder.id));
      };

      // Call immediately
      fetchDetails();

      // Then set an interval to retry a few times
      const intervalId = setInterval(fetchDetails, 2000);

      // Clear after 10 seconds max (5 attempts)
      setTimeout(() => clearInterval(intervalId), 10000);

      return () => clearInterval(intervalId);
    }
  }, [sizesConfirmed, currentOrder?.id, dispatch]);
  // Reset sizesConfirmed when productTypeId changes
  useEffect(() => {
    setSizesConfirmed(false);
    // Reset attribute restoration flag when product type changes
    hasRestoredAttributesRef.current = false;
  }, [productTypeId]);

  useEffect(() => {
    if (attributes && attributes.length > 0) {
      // Fetch attribute values cho tất cả attributes với size lớn hơn
      attributes.forEach((attr) => {
        const currentStatus = attributeValuesStatusState[attr.id];

        if (currentStatus === "idle" || currentStatus === undefined) {
          // Sử dụng size = 50 để đảm bảo lấy đủ values
          dispatch(fetchAttributeValuesByAttributeId(attr.id, 1, 50));
        }
      });
    }
  }, [attributes, dispatch, attributeValuesStatusState]);

  // Separate effect for fetching product type sizes
  useEffect(() => {
    if (productTypeId) {
      dispatch(fetchProductTypeSizesByProductTypeId(productTypeId))
        .unwrap()
        .then((data) => {
          if (data && data.length > 0) {
            console.log("🔍 First size object structure:", data[0]);
            console.log("🔍 MinValue:", data[0].minValue);
            console.log("🔍 MaxValue:", data[0].maxValue);
          }
        })
        .catch((error) => {
          console.error("❌ Failed to fetch product type sizes:", error);
        });
    }
  }, [productTypeId, dispatch]);

  useEffect(() => {
    // Lưu giá trị subTotal hiện tại vào ref từ attributePrices
    Object.entries(attributePrices).forEach(([attrId, priceInfo]) => {
      if (priceInfo && priceInfo.subTotal !== undefined) {
        previousSubTotalsRef.current[attrId] = priceInfo.subTotal;
      }
    });
  }, [attributePrices]);
  useEffect(() => {
    if (refreshCounter > 0 && currentOrder?.id) {
      // Fetch lại dữ liệu khi refreshCounter thay đổi
      const updatePrices = async () => {
        try {
          await dispatch(fetchCustomerChoiceDetails(currentOrder.id));
          await dispatch(fetchCustomerChoice(currentOrder.id));
        } catch (error) {
          console.error("Failed to refresh data:", error);
        }
      };

      updatePrices();
    }
  }, [refreshCounter, currentOrder?.id, dispatch]);
  useEffect(() => {
    // Cleanup function khi component unmount hoặc productTypeId thay đổi
    return () => {
      hasRestoredDataRef.current = false;
      hasRestoredAttributesRef.current = false;
    };
  }, [productTypeId]);

  // Effect riêng để khôi phục formData từ customerChoiceDetails khi tất cả dữ liệu đã sẵn sàng
  useEffect(() => {
    if (
      sizesConfirmed &&
      customerChoiceDetails &&
      Object.keys(customerChoiceDetails).length > 0 &&
      attributes.length > 0 &&
      Object.keys(attributeValuesState).length > 0 &&
      !hasRestoredAttributesRef.current
    ) {
      hasRestoredAttributesRef.current = true;

      const restoredFormData = {};

      // Duyệt qua customerChoiceDetails để tìm lại các lựa chọn
      Object.entries(customerChoiceDetails).forEach(
        ([attributeValueId, detail]) => {
          // Tìm attributeId tương ứng với attributeValueId này
          for (const attribute of attributes) {
            const attributeValues = attributeValuesState[attribute.id] || [];
            const hasThisValue = attributeValues.some(
              (av) => av.id === attributeValueId
            );

            if (hasThisValue) {
              restoredFormData[attribute.id] = attributeValueId;

              break;
            }
          }
        }
      );

      if (Object.keys(restoredFormData).length > 0) {
        setFormData((prev) => {
          const newFormData = {
            ...prev,
            ...restoredFormData,
          };

          return newFormData;
        });

        // Trigger validation after restoring
        setTimeout(() => {
          if (setCoreAttributesReady) {
            const coreAttributes = attributes.filter(
              (attr) => attr.isCore === true
            );
            const missingCoreAttributes = coreAttributes.filter(
              (attr) =>
                !restoredFormData[attr.id] || restoredFormData[attr.id] === ""
            );
            const isValid = missingCoreAttributes.length === 0;
            setCoreAttributesReady(isValid);
          }
        }, 100);
      }
    }
  }, [
    sizesConfirmed,
    customerChoiceDetails,
    attributes,
    attributeValuesState,
    setCoreAttributesReady,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Cập nhật formData
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi validation nếu có
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    // Thêm real-time validation cho size fields
    if (name.startsWith("size_") && value) {
      const sizeId = name.replace("size_", "");
      const ptSize = productTypeSizes.find((size) => size.sizes?.id === sizeId);

      if (ptSize) {
        const numValue = parseFloat(value);
        const minValue = ptSize.minValue;
        const maxValue = ptSize.maxValue;
        const sizeName = ptSize.sizes?.name || "Kích thước";

        if (!isNaN(numValue)) {
          if (numValue < minValue) {
            setValidationErrors((prev) => ({
              ...prev,
              [name]: `${sizeName} phải ≥ ${minValue}m`,
            }));
          } else if (numValue > maxValue) {
            setValidationErrors((prev) => ({
              ...prev,
              [name]: `${sizeName} phải ≤ ${maxValue}m`,
            }));
          }
        }
      }
    }

    // Xử lý thay đổi thuộc tính nếu có customerChoiceId
    if (
      attributes.some((attr) => attr.id === name) &&
      value &&
      currentOrder?.id
    ) {
      // Tìm existingChoiceDetail từ attributePrices thay vì customerChoiceDetails
      const existingPriceInfo = attributePrices[name];
      let existingChoiceDetail = null;

      if (existingPriceInfo?.attributeValueId) {
        // Tìm detail từ customerChoiceDetails bằng attributeValueId
        existingChoiceDetail =
          customerChoiceDetails[existingPriceInfo.attributeValueId];
      }

      // Lưu subTotal hiện tại vào ref để tránh hiệu ứng nhấp nháy
      if (existingPriceInfo?.subTotal !== undefined) {
        previousSubTotalsRef.current[name] = existingPriceInfo.subTotal;
      }

      // Đánh dấu trạng thái loading sớm để UI phản hồi ngay lập tức
      dispatch({ type: "customers/fetchCustomerChoice/pending" });

      // Xử lý cập nhật hoặc tạo mới dựa vào existingChoiceDetail
      const updateAction = existingChoiceDetail
        ? updateCustomerChoiceDetail({
            customerChoiceDetailId: existingChoiceDetail.id,
            attributeValueId: value,
            attributeId: name,
          })
        : linkAttributeValueToCustomerChoice({
            customerChoiceId: currentOrder.id,
            attributeValueId: value,
            attributeId: name,
          });

      // Thực hiện action và xử lý kết quả
      dispatch(updateAction)
        .unwrap()
        .then(() => {
          // Thêm delay nhỏ để đảm bảo backend đã xử lý
          setTimeout(async () => {
            try {
              // Fetch dữ liệu cập nhật theo thứ tự
              await dispatch(
                fetchCustomerChoiceDetails(currentOrder.id)
              ).unwrap();
              await dispatch(fetchCustomerChoice(currentOrder.id)).unwrap();
              // Cập nhật UI
              setRefreshCounter((prev) => prev + 1);
            } catch (error) {
              console.error("Lỗi khi cập nhật giá:", error);
              setSnackbar({
                open: true,
                message: "Có lỗi xảy ra khi cập nhật giá. Vui lòng thử lại.",
                severity: "error",
              });
            }
          }, 300);
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật thuộc tính:", error);

          // Xử lý trường hợp thuộc tính đã tồn tại
          if (error.message?.includes("Attribute existed")) {
            dispatch(fetchCustomerChoiceDetails(currentOrder.id)).then(() =>
              dispatch(fetchCustomerChoice(currentOrder.id))
            );
          } else {
            setSnackbar({
              open: true,
              message:
                "Có lỗi xảy ra khi cập nhật thuộc tính. Vui lòng thử lại.",
              severity: "error",
            });
          }
        });
    }
  };

  const handleConfirmSizes = async () => {
    // Validate that size values are entered với đúng thuộc tính từ API
    const sizeInputs = {};
    let hasErrors = false;
    const validationErrors = {};

    // Check all size fields with min/max validation
    for (const ptSize of productTypeSizes) {
      const fieldName = `size_${ptSize.sizes?.id}`; // Thêm optional chaining
      const value = formData[fieldName];
      const minValue = ptSize.minValue; // Đọc trực tiếp từ ptSize
      const maxValue = ptSize.maxValue; // Đọc trực tiếp từ ptSize
      const sizeName = ptSize.sizes?.name || "Kích thước";

      if (!value) {
        hasErrors = true;
        validationErrors[fieldName] = "Vui lòng nhập giá trị kích thước";
      } else {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          hasErrors = true;
          validationErrors[fieldName] = "Giá trị kích thước không hợp lệ";
        } else if (numValue < minValue) {
          hasErrors = true;
          validationErrors[fieldName] = `${sizeName} phải ≥ ${minValue}m`;
        } else if (numValue > maxValue) {
          hasErrors = true;
          validationErrors[fieldName] = `${sizeName} phải ≤ ${maxValue}m`;
        } else {
          sizeInputs[ptSize.sizes?.id] = numValue; // Thêm optional chaining
        }
      }
    }

    // Update validation errors state
    setValidationErrors(validationErrors);

    if (hasErrors) {
      setSizeValidationError("Vui lòng kiểm tra lại các giá trị kích thước");
      return;
    }

    if (hasErrors) {
      return;
    }

    // Clear validation error if successful
    setSizeValidationError("");

    // Get the customer choice ID from the state
    const customerChoiceId = currentOrder?.id;

    if (!customerChoiceId) {
      setSizeValidationError(
        "Không tìm thấy thông tin khách hàng. Vui lòng thử lại."
      );
      return;
    }

    try {
      // Process sizes

      const createdSizes = {}; // Store created sizes for edit functionality

      // Thêm đoạn theo dõi số lượng size đã xử lý
      let processedSizes = 0;
      const totalSizes = Object.keys(sizeInputs).length;

      for (const [sizeId, sizeValue] of Object.entries(sizeInputs)) {
        // Convert sizeValue to a number explicitly
        const numericSizeValue = parseFloat(sizeValue);

        // Dispatch the action and store the entire response
        const resultAction = await dispatch(
          linkSizeToCustomerChoice({
            customerChoiceId,
            sizeId,
            sizeValue: numericSizeValue,
          })
        );

        // Extract the result directly from the action payload
        const result = resultAction.payload;
        processedSizes++;

        // Make sure we're accessing the ID correctly
        if (result && result.id) {
          createdSizes[sizeId] = {
            id: result.id,
            sizeValue: numericSizeValue,
            sizeName:
              productTypeSizes.find((pt) => pt.sizes?.id === sizeId)?.sizes
                ?.name || "Size",
          };
        }

        // Nếu là size cuối cùng, thêm delay nhỏ để đảm bảo API đã xử lý xong
        if (processedSizes === totalSizes) {
          console.log("All sizes processed, fetching price information...");
        }
      }

      // Update the customerChoiceSizes state with the newly created sizes
      setCustomerChoiceSizes(createdSizes);

      // Mark sizes as confirmed
      setSizesConfirmed(true);

      if (currentOrder?.id) {
        // Thêm delay nhỏ để đảm bảo backend đã xử lý xong tất cả sizes
        // Thêm theo dõi thành công
        let priceFetched = false;

        // Thử lấy giá 3 lần nếu lần đầu không thành công
        const fetchPriceWithRetry = async (retryCount = 0) => {
          try {
            await dispatch(
              fetchCustomerChoiceDetails(currentOrder.id)
            ).unwrap();

            const result = await dispatch(
              fetchCustomerChoice(currentOrder.id)
            ).unwrap();

            if (result.totalAmount > 0) {
              priceFetched = true;
              console.log("Price fetched successfully:", result.totalAmount);
            } else if (retryCount < 2) {
              setTimeout(() => fetchPriceWithRetry(retryCount + 1), 700);
            }
          } catch (error) {
            console.error("Error fetching price information:", error);
            if (retryCount < 2) {
              // Thử lại nếu có lỗi
              setTimeout(() => fetchPriceWithRetry(retryCount + 1), 700);
            }
          }
        };

        // Đợi 500ms để đảm bảo backend đã xử lý xong tất cả sizes
        setTimeout(() => fetchPriceWithRetry(), 500);
      }

      // Calculate fontSizePixelValue for FONT_SIZE dimension type
      console.log("🔍 DEBUG: Starting fontSizePixelValue calculation");
      console.log("🔍 DEBUG: productTypeSizes:", productTypeSizes);

      // Debug: Log each productTypeSize to see the structure
      productTypeSizes.forEach((ptSize, index) => {
        console.log(`🔍 DEBUG: productTypeSizes[${index}]:`, ptSize);
        console.log(`🔍 DEBUG: dimensionType[${index}]:`, ptSize.dimensionType);
        console.log(`🔍 DEBUG: Full keys[${index}]:`, Object.keys(ptSize));
        console.log(`🔍 DEBUG: Detailed structure[${index}]:`, {
          id: ptSize.id,
          dimensionType: ptSize.dimensionType,
          minValue: ptSize.minValue,
          maxValue: ptSize.maxValue,
          sizes: ptSize.sizes,
          productTypes: ptSize.productTypes,
        });
      });

      console.log("🔍 DEBUG: formData:", formData);

      const fontSizeData = productTypeSizes.find(
        (ptSize) => ptSize.dimensionType === "FONT_SIZE"
      );
      console.log("🔍 DEBUG: fontSizeData found:", fontSizeData);

      if (fontSizeData) {
        const sizeId = fontSizeData.sizes?.id;
        const fieldName = `size_${sizeId}`;
        const sizeValue = parseFloat(formData[fieldName]);
        const minValue = fontSizeData.minValue;
        const maxValue = fontSizeData.maxValue;

        console.log("🔍 DEBUG: sizeId:", sizeId);
        console.log("🔍 DEBUG: fieldName:", fieldName);
        console.log("🔍 DEBUG: sizeValue (raw):", formData[fieldName]);
        console.log("🔍 DEBUG: sizeValue (parsed):", sizeValue);
        console.log("🔍 DEBUG: isNaN(sizeValue):", isNaN(sizeValue));

        if (!isNaN(sizeValue)) {
          const rawFontSizePixelValue =
            256 +
            ((1024 - 256) * (sizeValue - minValue)) / (maxValue - minValue);
          const fontSizePixelValue = Math.round(rawFontSizePixelValue); // Làm tròn số thập phân
          console.log("🔤 Font Size Calculation:");
          console.log("- Size Value (user input):", sizeValue);
          console.log("- Min Value:", minValue);
          console.log("- Max Value:", maxValue);
          console.log(
            "- Formula: 256 + (1024 - 256) * (sizeValue - minValue) / (maxValue - minValue)"
          );
          console.log(
            "- Calculated fontSizePixelValue (raw):",
            rawFontSizePixelValue
          );
          console.log(
            "- Calculated fontSizePixelValue (rounded):",
            fontSizePixelValue
          );

          // ✅ Lưu fontSizePixelValue vào state để sử dụng trong canvas
          if (
            setFontSizePixelValue &&
            typeof setFontSizePixelValue === "function"
          ) {
            setFontSizePixelValue(fontSizePixelValue);
            console.log(
              `💾 Đã lưu fontSizePixelValue vào state: ${fontSizePixelValue}`
            );
          } else {
            console.warn(
              "⚠️ setFontSizePixelValue prop không có sẵn hoặc không phải function"
            );
          }
        } else {
          console.log("🔍 DEBUG: sizeValue is NaN, skipping calculation");
        }
      } else {
        console.log(
          "🔍 DEBUG: No FONT_SIZE dimension type found in productTypeSizes"
        );
        console.log(
          "🔍 DEBUG: Available dimension types:",
          productTypeSizes.map((pts) => pts.dimensionType)
        );
      }
    } catch (error) {
      console.error("Failed to submit sizes:", error);
      setSizeValidationError(
        "Có lỗi xảy ra khi lưu thông tin kích thước. Vui lòng thử lại."
      );
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <CircularProgress color="primary" size={40} />
          <p className="mt-2 text-gray-600 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="text-center py-6 px-4 bg-red-50 rounded-lg border border-red-100">
        <p className="text-red-600 text-sm">
          Không thể tải thông số kỹ thuật. Vui lòng thử lại.
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
    <Box display="flex" flexDirection="column" alignItems="center">
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          maxWidth: 900,
          width: "100%",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Typography
          className="uppercase"
          variant="h6"
          align="center"
          fontWeight={600}
          color="primary"
          mb={2}
          sx={{
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: 1,
            fontSize: "1.1rem",
          }}
        >
          Thông Số {productTypeName || ""}
        </Typography>

        {/* Section: Product Type Sizes (kích thước) */}
        {productTypeSizesStatus === "succeeded" &&
          productTypeSizes.length > 0 && (
            <Box
              mb={2}
              sx={{
                background: "#f8faff",
                borderRadius: 2,
                padding: 1.5,
                border: "1px solid #e0e8ff",
                maxWidth: "100%",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                mb={1}
                sx={{
                  color: "#2c3e50",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.85rem",
                }}
              >
                <span className="inline-block w-1 h-4 bg-blue-500 mr-2 rounded"></span>
                KÍCH THƯỚC
                {sizesConfirmed && !isEditingSizes && (
                  <Button
                    size="small"
                    startIcon={<FaEdit size={12} />}
                    sx={{ ml: 2, fontSize: "0.75rem", textTransform: "none" }}
                    onClick={handleEditSizes}
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </Typography>

              <Grid container spacing={1.5}>
                {productTypeSizes.map((ptSize) => {
                  const sizeId = ptSize.sizes?.id; // Thêm optional chaining
                  const fieldName = `size_${sizeId}`;
                  const savedSize = customerChoiceSizes[sizeId];
                  const isFontSize = ptSize.dimensionType === "FONT_SIZE";

                  return (
                    <Grid item key={ptSize.id} xs={6} sm={4} md={3}>
                      <Box sx={{ position: "relative" }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={ptSize.sizes?.name} // Thêm optional chaining
                          name={fieldName}
                          type="number"
                          value={
                            isEditingSizes
                              ? editedSizes[sizeId] || ""
                              : formData[fieldName] || ""
                          }
                          onChange={
                            isEditingSizes
                              ? (e) =>
                                  handleSizeEditChange(sizeId, e.target.value)
                              : handleChange
                          }
                          disabled={sizesConfirmed && !isEditingSizes}
                          error={!!validationErrors[fieldName]}
                          helperText={
                            validationErrors[fieldName] ||
                            `Khoảng: ${ptSize.minValue || "N/A"}m - ${
                              ptSize.maxValue || "N/A"
                            }m`
                          }
                          InputProps={{
                            inputProps: {
                              min: ptSize.minValue,
                              max: ptSize.maxValue,
                              step: 0.01,
                            },
                            startAdornment: (
                              <span className="text-gray-400 mr-1 text-xs">
                                #
                              </span>
                            ),
                            endAdornment: (
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <span className="text-gray-500 text-xs mr-1">
                                  m
                                </span>
                                {isFontSize && (
                                  <Tooltip
                                    title="Kích thước này chỉ mang tính tham khảo, Sale sẽ báo giá lại sau nếu có thay đổi"
                                    placement="top"
                                    arrow
                                  >
                                    <IconButton
                                      size="small"
                                      sx={{
                                        padding: "2px",
                                        color: "#ff9800",
                                        "&:hover": {
                                          backgroundColor:
                                            "rgba(255, 152, 0, 0.04)",
                                        },
                                      }}
                                    >
                                      <FaExclamationTriangle size={12} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            ),
                            style: { fontSize: "0.8rem", height: "36px" },
                          }}
                          InputLabelProps={{
                            style: { fontSize: "0.8rem" },
                            sx: isFontSize
                              ? {
                                  color: "#ff9800",
                                  "&.Mui-focused": {
                                    color: "#ff9800",
                                  },
                                }
                              : {},
                          }}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "4px",
                              ...(isFontSize && {
                                "& fieldset": {
                                  borderColor: "#ffcc02",
                                  borderWidth: "2px",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#ff9800",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#ff9800",
                                },
                              }),
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Size validation error message */}
              {sizeValidationError && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ display: "block", mt: 1, textAlign: "center" }}
                >
                  {sizeValidationError}
                </Typography>
              )}

              {/* Confirm Size Button or Update All Sizes */}
              {!sizesConfirmed ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <motion.button
                    type="button"
                    onClick={handleConfirmSizes}
                    className="cursor-pointer px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg flex items-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={sizesStatus === "loading"}
                  >
                    {sizesStatus === "loading" ? (
                      <>
                        <CircularProgress
                          size={16}
                          color="inherit"
                          className="mr-2"
                        />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Xác nhận kích thước
                        <svg
                          className="w-4 h-4 ml-1"
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
                </Box>
              ) : isEditingSizes ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 2,
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FaTimes size={12} />}
                    size="small"
                    onClick={handleCancelEditSizes}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FaSave size={12} />}
                    size="small"
                    onClick={handleUpdateAllSizes}
                    disabled={sizesStatus === "loading"}
                  >
                    {sizesStatus === "loading" ? (
                      <>
                        <CircularProgress
                          size={14}
                          color="inherit"
                          sx={{ mr: 1 }}
                        />
                        Đang cập nhật...
                      </>
                    ) : (
                      "Cập nhật kích thước"
                    )}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <svg
                      className="w-4 h-4 mr-1 text-green-500"
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
                    Kích thước đã được xác nhận
                  </Typography>
                </Box>
              )}
            </Box>
          )}

        {/* Section: Attribute Groups - Show only if sizes are confirmed */}
        {sizesConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={2}>
              {Object.entries(attributesByName).map(([name, attrs]) => (
                <Grid key={name} style={{ gridColumn: "span 12" }}>
                  <Box
                    mb={1.5}
                    sx={{
                      background: "#fafafa",
                      borderRadius: 1.5,
                      padding: 1.5,
                      border: "1px solid #eaeaea",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      mb={1}
                      sx={{
                        color: "#2c3e50",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span className="inline-block w-1 h-4 bg-custom-primary mr-2 rounded"></span>
                      {name}
                    </Typography>

                    <Grid container spacing={2}>
                      {attrs.map((attr) => {
                        // Chỉ hiển thị các attribute value có isAvailable = true (yêu cầu case 4)
                        const attributeValuesRaw = attributeValuesState[attr.id] || [];
                        const attributeValues = attributeValuesRaw.filter((v) => v?.isAvailable);
                        const isLoadingValues =
                          attributeValuesStatusState[attr.id] === "loading";
                        // Get price for this attribute if available
                        const attributePrice =
                          customerChoiceDetails[attr.id]?.subTotal;
                        const hasPrice = attributePrice !== undefined;

                        return (
                          <Grid item xs={12} sm={6} md={6} key={attr.id}>
                            <FormControl
                              fullWidth
                              size="small"
                              variant="outlined"
                            >
                              <InputLabel
                                id={`${attr.id}-label`}
                                sx={{ fontSize: "0.8rem" }}
                              >
                                {attr.name}
                              </InputLabel>
                              <Select
                                labelId={`${attr.id}-label`}
                                name={attr.id}
                                value={formData[attr.id] || ""}
                                onChange={handleChange}
                                label={attr.name}
                                disabled={
                                  isLoadingValues ||
                                  fetchCustomerChoiceStatus === "loading"
                                }
                                sx={{
                                  display: "block",
                                  width: "100%",
                                  fontSize: "0.8rem",
                                  height: "36px",
                                  "& .MuiSelect-select": {
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    minWidth: "150px",
                                    paddingRight: "32px",
                                  },
                                }}
                                renderValue={(selected) => {
                                  // Tìm tên của giá trị đã chọn từ attributeValues
                                  const selectedValue = attributeValues.find(
                                    (value) => value.id === selected
                                  );
                                  if (!selectedValue) return "";

                                  // Giới hạn độ dài tên hiển thị khi đã chọn
                                  const displayName = selectedValue.name;
                                  return displayName.length > 25
                                    ? displayName.substring(0, 22) + "..."
                                    : displayName;
                                }}
                                MenuProps={{
                                  PaperProps: {
                                    style: {
                                      maxHeight: 300,
                                      width: "auto",
                                      minWidth: "250px",
                                    },
                                  },
                                  anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left",
                                  },
                                  transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left",
                                  },
                                }}
                              >
                                <MenuItem value="" disabled>
                                  {attr.name}
                                </MenuItem>
                                {attributeValues.map((value) => (
                                  <MenuItem
                                    key={value.id}
                                    value={value.id}
                                    sx={{
                                      fontSize: "0.8rem",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      flexWrap: "nowrap",
                                      padding: "8px",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        maxWidth: "calc(100% - 90px)",
                                        whiteSpace: "normal", // Thay đổi thành normal để hiển thị đầy đủ
                                        lineHeight: "1.4",
                                        wordBreak: "break-word", // Cho phép xuống dòng nếu cần
                                      }}
                                    >
                                      {value.name}
                                    </Typography>
                                    {value.unitPrice !== undefined && (
                                      <Typography
                                        sx={{
                                          ml: 1,
                                          color: value.isMultiplier
                                            ? "primary.main"
                                            : "green.600",
                                          fontWeight: "medium",
                                          flexShrink: 0,
                                          fontSize: "0.8rem",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {value.isMultiplier
                                          ? `×${(
                                              value.unitPrice / 10
                                            ).toLocaleString("vi-VN")}`
                                          : `${value.unitPrice.toLocaleString(
                                              "vi-VN"
                                            )} đ`}
                                      </Typography>
                                    )}
                                  </MenuItem>
                                ))}
                              </Select>
                              {validationErrors[attr.id] && (
                                <Typography color="error" variant="caption">
                                  {validationErrors[attr.id]}
                                </Typography>
                              )}
                              {isLoadingValues && (
                                <Box
                                  display="flex"
                                  justifyContent="center"
                                  mt={0.5}
                                >
                                  <CircularProgress size={14} />
                                </Box>
                              )}

                              {/* Show attribute price or multiplier if available */}
                              {(attributePrices[attr.id]?.subTotal !==
                                undefined ||
                                previousSubTotalsRef.current[attr.id]) && (
                                <Box
                                  mt={0.5}
                                  display="flex"
                                  justifyContent="flex-end"
                                  key={`price-${attr.id}-${refreshCounter}`}
                                  sx={{
                                    transition: "opacity 0.3s ease",
                                    opacity:
                                      fetchCustomerChoiceStatus === "loading"
                                        ? 0.6
                                        : 1,
                                  }}
                                >
                                  {(() => {
                                    // Tìm attributeValue được chọn
                                    const selectedValueId = formData[attr.id];
                                    const selectedValue = attributeValues.find(
                                      (value) => value.id === selectedValueId
                                    );
                                    const isMultiplier =
                                      selectedValue?.isMultiplier;

                                    // Tính hệ số nếu isMultiplier = true
                                    let displayValue, displayLabel;
                                    if (
                                      isMultiplier &&
                                      selectedValue?.unitPrice
                                    ) {
                                      const multiplier =
                                        selectedValue.unitPrice / 10;
                                      displayValue =
                                        multiplier.toLocaleString("vi-VN");
                                      displayLabel = "Hệ số";
                                    } else {
                                      const subTotal =
                                        attributePrices[attr.id]?.subTotal !==
                                        undefined
                                          ? attributePrices[attr.id].subTotal
                                          : previousSubTotalsRef.current[
                                              attr.id
                                            ] || 0;
                                      displayValue =
                                        subTotal.toLocaleString("vi-VN");
                                      displayLabel = "Giá";
                                    }

                                    return (
                                      <Typography
                                        variant="caption"
                                        color="success.main"
                                        fontWeight="medium"
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          bgcolor: isMultiplier
                                            ? "primary.lightest"
                                            : "success.lightest",
                                          py: 0.5,
                                          px: 1,
                                          borderRadius: 1,
                                        }}
                                      >
                                        {fetchCustomerChoiceStatus ===
                                        "loading" ? (
                                          <CircularProgress
                                            size={10}
                                            sx={{ mr: 0.5 }}
                                          />
                                        ) : (
                                          <FaCheckCircle
                                            size={10}
                                            className={`mr-1 text-green-500`}
                                          />
                                        )}
                                        {displayLabel}:{" "}
                                        <span className="font-bold ml-1">
                                          {displayValue}
                                          {isMultiplier ? "" : " đ"}
                                        </span>
                                      </Typography>
                                    );
                                  })()}
                                </Box>
                              )}
                            </FormControl>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box mt={3} mb={2}>
              <Box
                sx={{
                  background: "#f0f7ff",
                  borderRadius: 2,
                  padding: 2,
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

                {fetchCustomerChoiceStatus === "loading" ? (
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
            </Box>

            {coreAttributesValidation.coreAttributesCount > 0 && (
              <Box mt={2}>
                <Box
                  sx={{
                    background: coreAttributesValidation.isValid
                      ? "#f0f7ff"
                      : "#fff3e0",
                    borderRadius: 2,
                    padding: 2,
                    border: `1px solid ${
                      coreAttributesValidation.isValid ? "#cce4ff" : "#ffcc80"
                    }`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    mb={1}
                    sx={{
                      color: coreAttributesValidation.isValid
                        ? "#1565c0"
                        : "#f57c00",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span
                      className={`inline-block w-1 h-4 mr-2 rounded ${
                        coreAttributesValidation.isValid
                          ? "bg-blue-500"
                          : "bg-orange-500"
                      }`}
                    ></span>
                    KIỂM TRA THUỘC TÍNH BẮT BUỘC
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: coreAttributesValidation.isValid
                        ? "#1565c0"
                        : "#f57c00",
                      mb: 1,
                    }}
                    component="div"
                  >
                    {coreAttributesValidation.isValid ? (
                      <Box display="flex" alignItems="center">
                        <FaCheckCircle className="mr-2 text-green-500" />
                        Tất cả thuộc tính bắt buộc đã được chọn (
                        {coreAttributesValidation.selectedCoreAttributesCount}/
                        {coreAttributesValidation.coreAttributesCount})
                      </Box>
                    ) : (
                      <Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <FaTimes className="mr-2 text-orange-500" />
                          Còn thiếu{" "}
                          {
                            coreAttributesValidation.missingAttributes?.length
                          }{" "}
                          thuộc tính bắt buộc (
                          {coreAttributesValidation.selectedCoreAttributesCount}
                          /{coreAttributesValidation.coreAttributesCount})
                        </Box>
                        {coreAttributesValidation.missingAttributes?.length >
                          0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontStyle: "italic",
                              color: "#f57c00",
                              display: "block",
                            }}
                          >
                            Cần chọn:{" "}
                            {coreAttributesValidation.missingAttributes.join(
                              ", "
                            )}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Typography>
                </Box>
              </Box>
            )}
          </motion.div>
        )}

        {/* Display API error messages if any */}
        {customerError && (
          <Box mt={2} p={1} bgcolor="error.light" borderRadius={1}>
            <Typography color="error" variant="body2">
              {customerError}
            </Typography>
          </Box>
        )}

        {/* Show loading indicators */}
        {(attributeValuesStatus === "loading" || sizesStatus === "loading") && (
          <Box mt={2} display="flex" justifyContent="center">
            <CircularProgress size={20} />
            <Typography variant="body2" ml={1}>
              Đang xử lý...
            </Typography>
          </Box>
        )}
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
  const productTypePagination = useSelector(selectProductTypePagination);
  const customerStatus = useSelector(selectCustomerStatus);
  const customerError = useSelector(selectCustomerError);
  const [currentStep, setCurrentStep] = useState(1);
  const [billboardType, setBillboardType] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPollingProgress, setIsPollingProgress] = useState(false);
  const [showingLivePreview, setShowingLivePreview] = useState(false); // State để track khi đang hiển thị live preview
  const [livePreviewUpdateKey, setLivePreviewUpdateKey] = useState(0); // Key để force re-render live preview
  const progressPollingIntervalRef = useRef(null);
  const isPollingProgressRef = useRef(false);
  const lastGeneratedImageRef = useRef(null); // Track last generated image to avoid false positives
  const lastLivePreviewRef = useRef(null); // Track last live preview image to detect changes
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSampleProduct, setSelectedSampleProduct] = useState(null);
  const currentOrder = useSelector(selectCurrentOrder);
  const attributes = useSelector(selectAllAttributes);
  const attributeStatus = useSelector(selectAttributeStatus);
  const attributeError = useSelector(selectAttributeError);
  const customerDetail = useSelector(selectCustomerDetail);

  // Get all design templates data
  const allDesignTemplates = useSelector(selectAllDesignTemplates);
  const suggestedTemplates = useSelector(selectSuggestedTemplates);
  const allDesignTemplateStatus = useSelector(selectDesignTemplateStatus);
  const suggestionsStatus = useSelector(selectSuggestionsStatus);
  const allDesignTemplateError = useSelector(selectDesignTemplateError);
  const suggestionsError = useSelector(selectSuggestionsError);

  // State variables needed early
  const [currentProductType, setCurrentProductType] = useState(null);

  // Determine current product type information
  const currentProductTypeInfo =
    productTypes.find((pt) => pt.id === billboardType) || currentProductType;
  const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

  // Choose appropriate data based on AI generation
  const designTemplates = isAiGenerated
    ? suggestedTemplates
    : allDesignTemplates;
  const designTemplateStatus = isAiGenerated
    ? suggestionsStatus
    : allDesignTemplateStatus;
  const designTemplateError = isAiGenerated
    ? suggestionsError
    : allDesignTemplateError;

  const [customerNote, setCustomerNote] = useState("");
  const aiStatus = useSelector(selectAIStatus);
  const aiError = useSelector(selectAIError);
  const currentAIDesign = useSelector(selectCurrentAIDesign);
  const generatedImage = useSelector(selectGeneratedImage);
  const imageGenerationStatus = useSelector(selectImageGenerationStatus);
  const imageGenerationError = useSelector(selectImageGenerationError);

  // Progress checking selectors
  const stableDiffusionProgress = useSelector(selectStableDiffusionProgress);
  const progressCheckStatus = useSelector(selectProgressCheckStatus);
  const progressCheckError = useSelector(selectProgressCheckError);

  const [isConfirming, setIsConfirming] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // State để track progress history để hiển thị chi tiết
  const [progressHistory, setProgressHistory] = useState([]);
  const [progressDelta, setProgressDelta] = useState(0);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);

  // State để theo dõi việc đã xuất thiết kế trong phiên hiện tại
  const [hasExportedInCurrentSession, setHasExportedInCurrentSession] =
    useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadImagePreview, setUploadImagePreview] = useState("");
  const [processedLogoUrl, setProcessedLogoUrl] = useState("");
  const hasFetchedDataRef = useRef(false);
  const hasRestoredDataRef = useRef(false);
  const [currentSubStep, setCurrentSubStep] = useState("template"); // 'template' hoặc 'background'
  const backgroundSuggestions = useSelector(selectAllBackgroundSuggestions);
  const backgroundStatus = useSelector(selectBackgroundStatus);
  const backgroundError = useSelector(selectBackgroundError);
  const selectedBackground = useSelector(selectSelectedBackground);
  const [selectedBackgroundId, setSelectedBackgroundId] = useState(null);
  const [backgroundPresignedUrls, setBackgroundPresignedUrls] = useState({});
  const [loadingBackgroundUrls, setLoadingBackgroundUrls] = useState({});
  const [imageLoadError, setImageLoadError] = useState(null);
  const [selectedBackgroundForCanvas, setSelectedBackgroundForCanvas] =
    useState(null);
  const editedDesign = useSelector(selectEditedDesign);
  const editedDesignStatus = useSelector(selectEditedDesignStatus);
  const editedDesignError = useSelector(selectEditedDesignError);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPage, setIconPage] = useState(1);
  const icons = useSelector(selectAllIcons);
  const iconStatus = useSelector(selectIconStatus);
  const iconError = useSelector(selectIconError);
  const selectedIcon = useSelector(selectSelectedIcon);
  const iconPagination = useSelector(selectIconPagination);
  const hasNextIconPage = useSelector(selectHasNextPage);
  const hasPreviousIconPage = useSelector(selectHasPreviousPage);
  const [designTemplateImageUrls, setDesignTemplateImageUrls] = useState({}); // Cache blob URLs
  const [loadingDesignTemplateUrls, setLoadingDesignTemplateUrls] = useState(
    {}
  ); // Loading states
  const [backgroundRetryAttempts, setBackgroundRetryAttempts] = useState({});
  const [backgroundFetchTimeouts, setBackgroundFetchTimeouts] = useState({});
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    contactInfo: "",
    customerDetailLogo: null,
    logoPreview: "", // For preview of selected logo
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [coreAttributesReady, setCoreAttributesReady] = useState(false);

  // ✅ State để lưu fontSizePixelValue để sử dụng trong canvas
  const [fontSizePixelValue, setFontSizePixelValue] = useState(256); // Giá trị mặc định

  const customerChoiceDetails = useSelector(selectCustomerChoiceDetails);
  const totalAmount = useSelector(selectTotalAmount);
  const pixelValueData = useSelector(selectPixelValue);
  const pixelValueStatus = useSelector(selectPixelValueStatus);
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [textSettings, setTextSettings] = useState({
    fontFamily: "Arial",
    fontSize: 20,
    fill: "#000000",
    fontWeight: "normal",
    fontStyle: "normal",
    underline: false,
    text: "Sample Text",
  });

  // ✅ Chỉ cập nhật textSettings khi có fontSizePixelValue và khác giá trị mặc định
  useEffect(() => {
    if (fontSizePixelValue && fontSizePixelValue !== 256) {
      const baseFontSize = Math.max(fontSizePixelValue * 0.1, 20); // Tối thiểu 20px
      setTextSettings((prev) => ({
        ...prev,
        fontSize: baseFontSize,
      }));
      console.log(
        `📝 Updated text font size: ${baseFontSize}px (based on fontSizePixelValue: ${fontSizePixelValue})`
      );
    } else {
      // Giữ nguyên fontSize mặc định khi không có fontSizePixelValue
      console.log(`📝 Keeping default text font size (no scaling applied)`);
    }
  }, [fontSizePixelValue]);
  const [businessPresets, setBusinessPresets] = useState({
    logoUrl: "",
    companyName: "",
    address: "",
    contactInfo: "",
  });
  const fonts = [
    "Arial",
    "Times New Roman",
    "Helvetica",
    "Georgia",
    "Verdana",
    "Roboto",
    "Open Sans",
    "Lato",
    // Thêm các font UTM từ file fonts.css
    "UTM A&S Graceland",
    "UTM A&S Heartbeat",
    "UTM A&S Signwriter",
    "UTM Agin",
    "UTM Aircona",
    "UTM Akashi",
    "UTM Alba Matter",
    "UTM Alberta Heavy",
    "UTM Alexander",
    "UTM Alpine KT",
    "UTM Alter Gothic",
    "UTM Ambrose",
    "UTM Ambrosia",
    "UTM American Sans",
    "UTM Americana",
    "UTM AmericanaBT",
    "UTM AmericanaBExt",
    "UTM AmericanaItalic",
    "UTM Amerika Sans",
    "UTM Amherst",
    "UTM Androgyne",
    "UTM Aptima",
    "UTM AptimaBold",
    "UTM AptimaBoldItalic",
    "UTM AptimaItalic",
    "UTM Aristote",
    "UTM Arruba",
    "UTM Atlas_Solid",
    "UTM Atlas",
    "UTM Aurora",
    "UTM Avenda",
    "UTM Avo",
    "UTM AvoBold_Italic",
    "UTM AvoBold",
    "UTM AvoItalic",
    "UTM Azuki",
    "UTM Banquet",
    "UTM BanqueR",
    "UTM Beautiful Caps",
    "UTM Bell",
    "UTM Bienvenue",
    "UTM Billhead 1910",
    "UTM Bitsumishi Pro",
    "UTM Brewers KT",
    "UTM BryantLG_B",
    "UTM BryantLG",
    "UTM Bustamalaka",
    "UTM Cabaret",
    "UTM Cafeta",
    "UTM Camellia",
    "UTM Candombe",
    "UTM Caviar",
    "UTM Centur",
    "UTM CenturBold",
    "UTM CenturBoldItalic",
    "UTM CenturItalic",
    "UTM Charlemagne",
    "UTM Charlotte",
    "UTM Chickenhawk",
    "UTM ClassizismAntiqua",
    "UTM Colossalis",
    "UTM Conetoga",
    "UTM Cookies",
    "UTM Cool Blue",
    "UTM Cooper Black",
    "UTM Cooper BlackItalic",
    "UTM Copperplate",
    "UTM Copperplate2",
    "UTM Dai Co Viet",
    "UTM Davida",
    "UTM Demian KT",
    "UTM Deutsch Gothic",
    "UTM Diana",
    "UTM Dinh Tran",
    "UTM Duepuntozero",
    "UTM DuepuntozeroBold",
    "UTM EdwardianB",
  ];
  const fetchDesignTemplateImage = useCallback(
    async (template) => {
      if (
        designTemplateImageUrls[template.id] ||
        loadingDesignTemplateUrls[template.id]
      ) {
        console.log(
          "⏭️ Template image already loading or loaded:",
          template.id
        );
        return;
      }

      try {
        setLoadingDesignTemplateUrls((prev) => ({
          ...prev,
          [template.id]: true,
        }));

        console.log(
          "🔄 Fetching design template image via getImageFromS3:",
          template.image
        );

        const s3Result = await getImageFromS3(template.image);

        if (s3Result.success) {
          setDesignTemplateImageUrls((prev) => ({
            ...prev,
            [template.id]: s3Result.imageUrl,
          }));
          console.log(
            "✅ Design template image fetched successfully:",
            template.id
          );
          console.log(
            "📋 Blob URL created:",
            s3Result.imageUrl.substring(0, 50) + "..."
          );
        } else {
          console.error(
            "❌ Failed to fetch design template image via S3 API:",
            s3Result.message
          );

          // ✅ THÊM: Mark as failed để có thể retry
          setDesignTemplateImageUrls((prev) => ({
            ...prev,
            [template.id]: null,
          }));
        }
      } catch (error) {
        console.error("💥 Error fetching design template image:", error);

        // Mark as failed
        setDesignTemplateImageUrls((prev) => ({
          ...prev,
          [template.id]: null,
        }));
      } finally {
        setLoadingDesignTemplateUrls((prev) => ({
          ...prev,
          [template.id]: false,
        }));
      }
    },
    [designTemplateImageUrls, loadingDesignTemplateUrls]
  );

  useEffect(() => {
    if (designTemplates && designTemplates.length > 0) {
      designTemplates.forEach((template) => {
        if (template.image && !designTemplateImageUrls[template.id]) {
          fetchDesignTemplateImage(template);
        } else if (!template.image) {
          console.warn("Template missing image URL:", template.id);
        } else {
          console.log("Template image already cached:", template.id);
        }
      });
    }
  }, [designTemplates, designTemplateImageUrls, fetchDesignTemplateImage]);

  // Force refetch design template images when returning to step 5
  useEffect(() => {
    if (
      currentStep === 5 &&
      designTemplates &&
      designTemplates.length > 0 &&
      Object.keys(designTemplateImageUrls).length === 0
    ) {
      console.log(
        "🔄 Force refetching design template images on return to step 5"
      );
      designTemplates.forEach((template) => {
        if (template.image) {
          console.log("📥 Force fetching image for template:", template.id);
          fetchDesignTemplateImage(template);
        }
      });
    }
  }, [
    currentStep,
    designTemplates,
    designTemplateImageUrls,
    fetchDesignTemplateImage,
  ]);

  const handleIconLoadError = async (icon, retryCount = 0) => {
    if (retryCount >= 2) {
      console.log(`Max retries reached for icon ${icon.id}`);
      return null;
    }

    console.log(`Retrying icon ${icon.id}, attempt ${retryCount + 1}`);

    try {
      // Refresh presigned URL
      const result = await getPresignedUrl(icon.imageUrl, 120);
      if (result.success) {
        console.log(`✅ New presigned URL created for icon ${icon.id}`);

        // ✅ USE NEW ACTION TO UPDATE ICON IN STORE
        dispatch(
          updateIconUrl({
            iconId: icon.id,
            presignedUrl: result.url,
          })
        );

        return result.url;
      } else {
        console.error(
          `❌ Failed to create presigned URL for icon ${icon.id}:`,
          result.message
        );
      }
    } catch (error) {
      console.error(`❌ Error refreshing URL for icon ${icon.id}:`, error);
    }

    return null;
  };

  const loadIcons = (page = 1) => {
    setIconPage(page);
    dispatch(fetchIcons({ page, size: 20 }));
  };
  const addIconToCanvas = async (icon) => {
    if (!fabricCanvas || !icon) {
      console.log("Canvas or icon not available:", {
        fabricCanvas: !!fabricCanvas,
        icon,
      });
      return;
    }

    console.log("Adding icon to canvas:", icon);

    // ✅ SỬ DỤNG getImageFromS3 thay vì presigned URL
    try {
      let iconImageUrl = null;

      if (icon.imageUrl) {
        console.log("Fetching icon via getImageFromS3:", icon.imageUrl);

        const s3Result = await getImageFromS3(icon.imageUrl);

        if (s3Result.success) {
          iconImageUrl = s3Result.imageUrl;
          console.log("Icon fetched successfully via S3 API");
        } else {
          console.error("Failed to fetch icon via S3 API:", s3Result.message);
          throw new Error(s3Result.message);
        }
      } else if (icon.presignedUrl) {
        // Fallback nếu có presignedUrl
        iconImageUrl = icon.presignedUrl;
        console.log("Using fallback presigned URL for icon:", iconImageUrl);
      } else if (icon.fullImageUrl) {
        // Fallback cuối cùng
        iconImageUrl = icon.fullImageUrl;
        console.log("Using fallback full image URL for icon:", iconImageUrl);
      }

      if (!iconImageUrl) {
        console.error("No valid image URL found for icon:", icon);
        setSnackbar({
          open: true,
          message: `Không thể tải icon "${icon.name}" - thiếu URL ảnh`,
          severity: "error",
        });
        return;
      }

      const img = new Image();
      // ✅ BỎ crossOrigin cho blob URLs từ getImageFromS3
      // img.crossOrigin = "anonymous"; // KHÔNG CẦN CHO BLOB URL

      // ✅ Thêm flags để tránh multiple event handlers
      let hasLoaded = false;
      let hasErrored = false;

      img.onload = function () {
        if (hasLoaded || hasErrored) {
          console.log("Icon onload called but already handled, skipping...");
          return;
        }

        hasLoaded = true;
        console.log("Icon loaded successfully via S3 API");
        console.log("Icon dimensions:", img.width, "x", img.height);

        // ✅ Hybrid canvas-size-based scaling like text and business info
        const canvasSize = Math.max(fabricCanvas.width, fabricCanvas.height);
        const baseScaleFactor = canvasSize / 1000; // Normalize to 1000px base
        const hasScaling = fontSizePixelValue && fontSizePixelValue !== 256;

        // Combine canvas scaling with fontSizePixelValue scaling
        const iconSize = hasScaling
          ? baseScaleFactor * (fontSizePixelValue / 256) * 100 // Base icon size 100px scaled by both factors
          : baseScaleFactor * 100; // Just canvas scaling, base size 100px

        console.log(`🔥 Icon hybrid scaling:`, {
          canvasSize,
          baseScaleFactor: baseScaleFactor.toFixed(3),
          fontSizePixelValue,
          hasScaling,
          iconSize: iconSize.toFixed(1),
        });

        try {
          const fabricImg = new fabric.Image(img, {
            left: 100,
            top: 100,
            name: `icon-${icon.id}`,
          });

          // Apply hybrid scaling - maintain aspect ratio
          const scale = Math.min(iconSize / img.width, iconSize / img.height);

          fabricImg.set({
            scaleX: scale,
            scaleY: scale,
          });

          fabricCanvas.add(fabricImg);
          fabricCanvas.setActiveObject(fabricImg);
          fabricCanvas.renderAll();

          console.log("Icon added to canvas successfully");

          // Clear selected icon và đóng picker
          dispatch(clearSelectedIcon());
          setShowIconPicker(false);

          setSnackbar({
            open: true,
            message: `Icon "${icon.name}" đã được thêm vào thiết kế`,
            severity: "success",
          });
        } catch (error) {
          console.error("Error creating fabric image:", error);
          setSnackbar({
            open: true,
            message: "Lỗi khi thêm icon vào thiết kế",
            severity: "error",
          });
        }
      };

      img.onerror = function (error) {
        if (hasErrored || hasLoaded) {
          console.log("Icon onerror called but already handled, skipping...");
          return;
        }

        hasErrored = true;
        console.error(
          "Failed to load icon image via S3 API:",
          iconImageUrl,
          error
        );

        // ✅ Cleanup để tránh memory leaks
        img.onload = null;
        img.onerror = null;
        img.src = "";

        // ✅ Hybrid scaling for placeholder too
        const canvasSize = Math.max(fabricCanvas.width, fabricCanvas.height);
        const baseScaleFactor = canvasSize / 1000;
        const hasScaling = fontSizePixelValue && fontSizePixelValue !== 256;
        const placeholderSize = hasScaling
          ? baseScaleFactor * (fontSizePixelValue / 256) * 100
          : baseScaleFactor * 100;

        // Tạo placeholder cho icon
        const placeholder = new fabric.Rect({
          left: 100,
          top: 100,
          width: placeholderSize,
          height: placeholderSize,
          fill: "#f0f0f0",
          stroke: "#ddd",
          strokeWidth: Math.max(2 * baseScaleFactor, 1),
          rx: 10 * baseScaleFactor,
          ry: 10 * baseScaleFactor,
          name: `icon-placeholder-${icon.id}`,
        });

        const placeholderTextSize = Math.max(12 * baseScaleFactor, 8);
        const placeholderText = new fabric.Text("ICON", {
          left: 100 + placeholderSize / 2,
          top: 100 + placeholderSize / 2,
          fontSize: placeholderTextSize,
          fill: "#666",
          fontWeight: "bold",
          textAlign: "center",
          originX: "center",
          originY: "center",
          name: `icon-placeholder-text-${icon.id}`,
        });

        fabricCanvas.add(placeholder);
        fabricCanvas.add(placeholderText);
        fabricCanvas.setActiveObject(placeholder);
        fabricCanvas.renderAll();

        setSnackbar({
          open: true,
          message: `Không thể tải icon "${icon.name}", đã tạo placeholder`,
          severity: "warning",
        });

        console.log("Icon placeholder added successfully");
      };

      img.src = iconImageUrl;
    } catch (error) {
      console.error("Error loading icon:", error);

      // Tạo placeholder khi có lỗi
      try {
        const placeholder = new fabric.Rect({
          left: 100,
          top: 100,
          width: 80,
          height: 80,
          fill: "#f0f0f0",
          stroke: "#ddd",
          strokeWidth: 2,
          rx: 10,
          ry: 10,
          name: `icon-placeholder-${icon.id}`,
        });

        const placeholderText = new fabric.Text("ERROR", {
          left: 140,
          top: 140,
          fontSize: 12,
          fill: "#666",
          fontWeight: "bold",
          textAlign: "center",
          originX: "center",
          originY: "center",
          name: `icon-placeholder-text-${icon.id}`,
        });

        fabricCanvas.add(placeholder);
        fabricCanvas.add(placeholderText);
        fabricCanvas.setActiveObject(placeholder);
        fabricCanvas.renderAll();

        setSnackbar({
          open: true,
          message: `Lỗi khi tải icon "${icon.name}": ${error.message}`,
          severity: "error",
        });

        console.log("Icon error placeholder added successfully");
      } catch (placeholderError) {
        console.error("Error creating icon placeholder:", placeholderError);
      }
    }
  };
  const IconPicker = () => {
    const [iconImageUrls, setIconImageUrls] = useState({}); // Cache blob URLs
    const [loadingIconUrls, setLoadingIconUrls] = useState({}); // Loading states

    // Hàm fetch icon image từ S3
    const fetchIconImage = async (icon) => {
      if (iconImageUrls[icon.id] || loadingIconUrls[icon.id]) {
        return; // Đã có URL hoặc đang loading
      }

      try {
        setLoadingIconUrls((prev) => ({ ...prev, [icon.id]: true }));

        console.log("Fetching icon preview via getImageFromS3:", icon.imageUrl);

        const s3Result = await getImageFromS3(icon.imageUrl);

        if (s3Result.success) {
          setIconImageUrls((prev) => ({
            ...prev,
            [icon.id]: s3Result.imageUrl,
          }));
          console.log("Icon preview fetched successfully:", icon.id);
        } else {
          console.error(
            "Failed to fetch icon preview via S3 API:",
            s3Result.message
          );

          // Fallback: thử presigned URL nếu có
          if (icon.presignedUrl) {
            console.log("Trying fallback presigned URL for icon:", icon.id);
            setIconImageUrls((prev) => ({
              ...prev,
              [icon.id]: icon.presignedUrl,
            }));
          } else if (icon.fullImageUrl) {
            console.log("Trying fallback full image URL for icon:", icon.id);
            setIconImageUrls((prev) => ({
              ...prev,
              [icon.id]: icon.fullImageUrl,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching icon image:", error);
      } finally {
        setLoadingIconUrls((prev) => ({ ...prev, [icon.id]: false }));
      }
    };

    // Fetch icon images khi icons load
    useEffect(() => {
      if (icons && icons.length > 0) {
        icons.forEach((icon) => {
          if (icon.imageUrl && !iconImageUrls[icon.id]) {
            fetchIconImage(icon);
          }
        });
      }
    }, [icons]);

    // Cleanup blob URLs khi component unmount
    useEffect(() => {
      return () => {
        Object.values(iconImageUrls).forEach((url) => {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
      };
    }, [iconImageUrls]);

    const handleIconSelect = (icon) => {
      dispatch(setSelectedIcon(icon));
    };

    const handleAddIcon = () => {
      if (selectedIcon) {
        addIconToCanvas(selectedIcon);
      }
    };

    const handleNextPage = () => {
      if (hasNextIconPage) {
        loadIcons(iconPage + 1);
      }
    };

    const handlePreviousPage = () => {
      if (hasPreviousIconPage) {
        loadIcons(iconPage - 1);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-semibold">Chọn Icon</h3>
            <button
              onClick={() => {
                setShowIconPicker(false);
                dispatch(clearSelectedIcon());
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {iconStatus === "loading" ? (
              <div className="flex justify-center items-center py-12">
                <CircularProgress size={40} />
                <span className="ml-4">Đang tải icons...</span>
              </div>
            ) : iconStatus === "failed" ? (
              <div className="text-center py-8 text-red-500">
                <p>Lỗi: {iconError}</p>
                <button
                  onClick={() => loadIcons(1)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <>
                {/* Icons Grid */}
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-6">
                  {icons.map((icon) => {
                    // ✅ SỬ DỤNG getImageFromS3 cho preview
                    const iconPreviewUrl = iconImageUrls[icon.id];
                    const isLoadingPreview = loadingIconUrls[icon.id];

                    return (
                      <div
                        key={icon.id}
                        className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                          selectedIcon?.id === icon.id
                            ? "border-custom-secondary bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleIconSelect(icon)}
                      >
                        <div className="aspect-square bg-gray-50 rounded flex items-center justify-center mb-2">
                          {isLoadingPreview ? (
                            <div className="flex flex-col items-center">
                              <CircularProgress size={20} />
                              <span className="text-xs text-gray-500 mt-1">
                                Đang tải...
                              </span>
                            </div>
                          ) : iconPreviewUrl ? (
                            <img
                              src={iconPreviewUrl}
                              alt={icon.name}
                              className="max-w-full max-h-full object-contain"
                              onLoad={() => {
                                console.log(
                                  `✅ Icon ${icon.id} preview loaded successfully via S3 API`
                                );
                              }}
                              onError={(e) => {
                                console.error(
                                  `❌ Error loading icon ${icon.id} preview via S3 API:`,
                                  e
                                );
                                // Hiển thị placeholder
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col">
                              <FaPalette className="w-6 h-6 mb-1" />
                              <span className="text-xs text-center">
                                Không thể tải
                              </span>
                            </div>
                          )}

                          {/* Placeholder khi lỗi */}
                          <div className="hidden w-full h-full items-center justify-center text-gray-400 flex-col">
                            <FaPalette className="w-6 h-6 mb-1" />
                            <span className="text-xs text-center">
                              Không thể tải
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(`Manual retry for icon ${icon.id}`);
                                fetchIconImage(icon);
                              }}
                              className="text-xs text-blue-500 hover:text-blue-700 mt-1 px-2 py-1 bg-white rounded border"
                            >
                              Thử lại
                            </button>
                          </div>
                        </div>

                        <p
                          className="text-xs text-center text-gray-600 truncate"
                          title={icon.name}
                        >
                          {icon.name}
                        </p>

                        {selectedIcon?.id === icon.id && (
                          <div className="absolute top-1 right-1 bg-custom-secondary text-white rounded-full p-1">
                            <FaCheck className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {iconPagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 py-4 border-t">
                    <button
                      onClick={handlePreviousPage}
                      disabled={!hasPreviousIconPage}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>

                    <span className="text-sm text-gray-600">
                      Trang {iconPagination.currentPage} /{" "}
                      {iconPagination.totalPages}({iconPagination.totalElements}{" "}
                      icons)
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextIconPage}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              {selectedIcon
                ? `Đã chọn: ${selectedIcon.name}`
                : "Chưa chọn icon nào"}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowIconPicker(false);
                  dispatch(clearSelectedIcon());
                }}
                className="cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddIcon}
                disabled={!selectedIcon}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedIcon
                    ? "bg-custom-primary text-white hover:bg-custom-secondary cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Thêm Icon
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const s3Logo = useSelector((state) =>
    businessPresets.logoUrl
      ? selectS3Image(state, businessPresets.logoUrl)
      : null
  );
  const fetchBackgroundPresignedUrl = useCallback(
    async (backgroundId, backgroundUrl) => {
      // ✅ KIỂM TRA TRÙNG LẶP REQUEST
      if (
        backgroundPresignedUrls[backgroundId] ||
        loadingBackgroundUrls[backgroundId]
      ) {
        console.log(`⏭️ Background ${backgroundId} already loading or loaded`);
        return;
      }

      const currentRetries = backgroundRetryAttempts[backgroundId] || 0;
      if (currentRetries >= 3) {
        console.warn(`❌ Max retries reached for background ${backgroundId}`);
        setBackgroundPresignedUrls((prev) => ({
          ...prev,
          [backgroundId]: null,
        }));
        return;
      }

      try {
        setLoadingBackgroundUrls((prev) => ({ ...prev, [backgroundId]: true }));

        console.log(
          `🔄 Fetching background ${backgroundId} via getImageFromS3 (attempt ${
            currentRetries + 1
          }):`,
          backgroundUrl
        );

        // ✅ THÊM TIMEOUT CHO REQUEST
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
          const s3Result = await getImageFromS3(
            backgroundUrl,
            controller.signal
          );
          clearTimeout(timeoutId);

          if (s3Result.success && s3Result.imageUrl) {
            // ✅ CẢI THIỆN VALIDATION
            if (s3Result.imageUrl.startsWith("blob:")) {
              try {
                // Thử tạo Image object để test blob URL
                const testImg = new Image();
                const validationPromise = new Promise((resolve, reject) => {
                  testImg.onload = () => resolve(true);
                  testImg.onerror = () => reject(new Error("Invalid blob URL"));
                  setTimeout(
                    () => reject(new Error("Blob validation timeout")),
                    5000
                  );
                });

                testImg.src = s3Result.imageUrl;
                await validationPromise;

                console.log(
                  `✅ Blob URL validated successfully for background ${backgroundId}`
                );
              } catch (validationError) {
                console.error(
                  `❌ Blob URL validation failed for background ${backgroundId}:`,
                  validationError
                );
                throw new Error("Blob URL validation failed");
              }
            }

            setBackgroundPresignedUrls((prev) => ({
              ...prev,
              [backgroundId]: s3Result.imageUrl,
            }));

            console.log(
              `✅ Background ${backgroundId} fetched and validated successfully`
            );

            // Reset retry count on success
            setBackgroundRetryAttempts((prev) => ({
              ...prev,
              [backgroundId]: 0,
            }));
          } else {
            throw new Error(s3Result.message || "S3 API failed");
          }
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } catch (error) {
        console.error(`💥 Error fetching background ${backgroundId}:`, error);

        // ✅ TĂNG retry count
        const newRetryCount = currentRetries + 1;
        setBackgroundRetryAttempts((prev) => ({
          ...prev,
          [backgroundId]: newRetryCount,
        }));

        // ✅ CHỈ THỬ FALLBACK NẾU CHƯA QUÁ 2 LẦN
        if (newRetryCount <= 2) {
          console.log(
            `🔄 Trying fallback presigned URL (attempt ${newRetryCount})...`
          );

          try {
            const presignedResult = await getPresignedUrl(backgroundUrl, 60);

            if (presignedResult.success && presignedResult.url) {
              setBackgroundPresignedUrls((prev) => ({
                ...prev,
                [backgroundId]: presignedResult.url,
              }));
              console.log(
                `✅ Fallback presigned URL successful for background ${backgroundId}`
              );

              // Reset retry count on success
              setBackgroundRetryAttempts((prev) => ({
                ...prev,
                [backgroundId]: 0,
              }));
            } else {
              throw new Error("Presigned URL failed");
            }
          } catch (presignedError) {
            console.error(
              `❌ Both S3 and presigned URL failed for background ${backgroundId}:`,
              presignedError
            );

            // Mark as failed if this is the last attempt
            if (newRetryCount >= 2) {
              setBackgroundPresignedUrls((prev) => ({
                ...prev,
                [backgroundId]: null,
              }));
            }
          }
        } else {
          // Mark as failed after max retries
          setBackgroundPresignedUrls((prev) => ({
            ...prev,
            [backgroundId]: null,
          }));
        }
      } finally {
        setLoadingBackgroundUrls((prev) => ({
          ...prev,
          [backgroundId]: false,
        }));
      }
    },
    [backgroundPresignedUrls, loadingBackgroundUrls, backgroundRetryAttempts]
  );
  useEffect(() => {
    if (backgroundSuggestions && backgroundSuggestions.length > 0) {
      backgroundSuggestions.forEach((background) => {
        if (
          background.backgroundUrl &&
          !backgroundPresignedUrls[background.id] &&
          !loadingBackgroundUrls[background.id]
        ) {
          console.log(
            "🔄 Fetching presigned URL for background:",
            background.id
          );
          fetchBackgroundPresignedUrl(background.id, background.backgroundUrl);
        }
      });
    }
  }, [backgroundSuggestions, backgroundPresignedUrls, loadingBackgroundUrls]);

  // Force refetch presigned URLs when returning to step 5
  useEffect(() => {
    if (
      currentStep === 5 &&
      backgroundSuggestions &&
      backgroundSuggestions.length > 0
    ) {
      // Check if we need to refetch any URLs
      const needsRefetch = backgroundSuggestions.some(
        (background) =>
          background.backgroundUrl &&
          !backgroundPresignedUrls[background.id] &&
          !loadingBackgroundUrls[background.id]
      );

      if (needsRefetch) {
        console.log("🔄 Force refetching background URLs for step 5");
        backgroundSuggestions.forEach((background) => {
          if (
            background.backgroundUrl &&
            !backgroundPresignedUrls[background.id] &&
            !loadingBackgroundUrls[background.id]
          ) {
            fetchBackgroundPresignedUrl(
              background.id,
              background.backgroundUrl
            );
          }
        });
      }
    }
  }, [
    currentStep,
    backgroundSuggestions,
    backgroundPresignedUrls,
    loadingBackgroundUrls,
  ]);
  // ✅ Use refs to track blob URLs for cleanup
  const backgroundUrlsRef = useRef({});
  const designTemplateUrlsRef = useRef({});

  // Update refs when URLs change
  useEffect(() => {
    backgroundUrlsRef.current = backgroundPresignedUrls;
  }, [backgroundPresignedUrls]);

  useEffect(() => {
    designTemplateUrlsRef.current = designTemplateImageUrls;
  }, [designTemplateImageUrls]);

  useEffect(() => {
    return () => {
      // ✅ Only cleanup on component unmount - revoke all blob URLs
      console.log("🧹 Component unmounting, cleaning up all blob URLs");

      Object.values(backgroundUrlsRef.current).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          console.log("🧹 Revoking background blob URL:", url);
          URL.revokeObjectURL(url);
        }
      });

      Object.values(designTemplateUrlsRef.current).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          console.log("🧹 Revoking design template blob URL:", url);
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []); // Empty dependency array = only run on unmount
  // Effect để clear và fetch lại customerDetail khi ở step 2
  useEffect(() => {
    if (currentStep === 2) {
      // Clear customerDetail từ Redux để buộc fetch lại từ server
      dispatch(clearCustomerDetail());
      console.log("🔄 Cleared customerDetail from Redux at step 2");
      
      // Fetch lại customerDetail nếu có user.id
      if (user?.id) {
        console.log("🔄 Fetching customerDetail at step 2 for user:", user.id);
        dispatch(fetchCustomerDetailByUserId(user.id))
          .unwrap()
          .then((customerData) => {
            console.log("✅ Successfully fetched customerDetail at step 2:", customerData);
          })
          .catch((error) => {
            console.log("ℹ️ No existing customerDetail found at step 2:", error);
          });
      }
    }
  }, [currentStep, user?.id, dispatch]);

  // Use ref to track previous step to avoid infinite loops
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    if (prevStepRef.current === 5 && currentStep !== 5) {
      // ✅ ONLY reset retry attempts when leaving step 5, but keep URLs cached
      setBackgroundRetryAttempts({});
    }

    // Reset attribute restoration flag when navigating to step 4 (case 4)
    if (currentStep === 4 && prevStepRef.current !== 4) {
      console.log(
        "🔄 Navigated to step 4, resetting attribute restoration flag"
      );
      // This will be passed down to ModernBillboardForm via props, but we need to reset it here
      // The flag will be reset in the ModernBillboardForm component itself
    }

    prevStepRef.current = currentStep;
  }, [currentStep]);
  useEffect(() => {
    if (currentStep === 7 && user?.id) {
      // Fetch customer detail để lấy business info
      dispatch(fetchCustomerDetailByUserId(user.id))
        .unwrap()
        .then((customerData) => {
          // Set business presets
          setBusinessPresets({
            logoUrl: customerData.logoUrl || "",
            companyName: customerData.companyName || "",
            address: customerData.address || "",
            contactInfo: customerData.contactInfo || "",
          });

          // Fetch logo from S3 if logoUrl exists
          if (customerData.logoUrl) {
            console.log("Fetching logo from S3:", customerData.logoUrl);
            dispatch(fetchImageFromS3(customerData.logoUrl));
          }
        })
        .catch((error) => {
          console.error("Failed to load customer detail:", error);
        });
    }
  }, [currentStep, user?.id, dispatch]);
  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setUploadedImage(file);
      setUploadImagePreview(reader.result);

      // Thêm ảnh vào canvas
      addImageToCanvas(reader.result);

      setSnackbar({
        open: true,
        message: "Ảnh đã được thêm vào thiết kế",
        severity: "success",
      });
    };

    reader.readAsDataURL(file);
  };
  const addImageToCanvas = (imageUrl) => {
    if (!fabricCanvas) return;

    console.log(`🖼️ Adding image`, {
      fontSizePixelValue,
      hasScaling: fontSizePixelValue && fontSizePixelValue !== 256,
    });

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      // ✅ Hybrid canvas-size-based scaling like text and business info
      const canvasSize = Math.max(fabricCanvas.width, fabricCanvas.height);
      const baseScaleFactor = canvasSize / 1000; // Normalize to 1000px base
      const hasScaling = fontSizePixelValue && fontSizePixelValue !== 256;

      // Combine canvas scaling with fontSizePixelValue scaling
      const imageSize = hasScaling
        ? baseScaleFactor * (fontSizePixelValue / 256) * 250 // Base image size 250px scaled by both factors
        : baseScaleFactor * 250; // Just canvas scaling, base size 250px

      console.log(`🖼️ Image hybrid scaling:`, {
        canvasSize,
        baseScaleFactor: baseScaleFactor.toFixed(3),
        fontSizePixelValue,
        hasScaling,
        imageSize: imageSize.toFixed(1),
      });

      const fabricImg = new fabric.Image(img, {
        left: 100,
        top: 100,
        name: "userUploadedImage",
      });

      // Apply hybrid scaling - maintain aspect ratio
      const scale = Math.min(imageSize / img.width, imageSize / img.height);

      fabricImg.set({
        scaleX: scale,
        scaleY: scale,
      });

      fabricCanvas.add(fabricImg);
      fabricCanvas.setActiveObject(fabricImg);
      fabricCanvas.renderAll();
    };

    img.onerror = function (error) {
      console.error("Lỗi khi tải ảnh:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải ảnh. Vui lòng thử lại.",
        severity: "error",
      });
    };

    img.src = imageUrl;
  };
  const addBusinessInfoToCanvas = (type, content) => {
    if (!fabricCanvas || !content) {
      console.log("Canvas or content not available:", {
        fabricCanvas: !!fabricCanvas,
        content,
      });
      return;
    }

    console.log("Adding to canvas:", type, content);

    // ✅ Scale dựa trên canvas size
    const canvasSize = Math.max(fabricCanvas.width, fabricCanvas.height);
    const baseScaleFactor = canvasSize / 1000; // Normalize to 1000px base

    console.log(`🎯 Canvas scaling info:`, {
      canvasWidth: fabricCanvas.width,
      canvasHeight: fabricCanvas.height,
      canvasSize,
      baseScaleFactor: baseScaleFactor.toFixed(3),
      fontSizePixelValue,
      hasScaling: fontSizePixelValue && fontSizePixelValue !== 256,
    });

    let text;
    const leftMargin = fabricCanvas.width * 0.05; // 5% margin from left
    const topBase = fabricCanvas.height * 0.05; // 5% margin from top

    // ✅ Scale sizes based on both fontSizePixelValue and canvas dimensions
    let companyNameSize, addressSize, contactSize, logoSize;

    if (fontSizePixelValue && fontSizePixelValue !== 256) {
      // Có fontSizePixelValue: kết hợp cả fontSizePixelValue và canvas scaling
      const fontScaleFactor = fontSizePixelValue / 256; // Normalize to base 256
      companyNameSize = Math.max(24 * baseScaleFactor * fontScaleFactor, 16);
      addressSize = Math.max(16 * baseScaleFactor * fontScaleFactor, 12);
      contactSize = Math.max(14 * baseScaleFactor * fontScaleFactor, 10);
      logoSize = Math.max(100 * baseScaleFactor * fontScaleFactor, 60);
    } else {
      // Không có fontSizePixelValue: chỉ dùng canvas scaling
      companyNameSize = Math.max(24 * baseScaleFactor, 16);
      addressSize = Math.max(16 * baseScaleFactor, 12);
      contactSize = Math.max(14 * baseScaleFactor, 10);
      logoSize = Math.max(100 * baseScaleFactor, 60);
    }

    // Apply maximum constraints based on canvas size
    companyNameSize = Math.min(companyNameSize, canvasSize * 0.08); // Max 8% of canvas
    addressSize = Math.min(addressSize, canvasSize * 0.05); // Max 5% of canvas
    contactSize = Math.min(contactSize, canvasSize * 0.04); // Max 4% of canvas
    logoSize = Math.min(logoSize, canvasSize * 0.3); // Max 30% of canvas

    switch (type) {
      case "companyName":
        text = new fabric.Text(content, {
          left: leftMargin,
          top: topBase,
          fontFamily: "Arial",
          fontSize: Math.round(companyNameSize),
          fill: "#000000",
          fontWeight: "bold",
          name: "companyName",
        });
        console.log(
          `📊 Company name: ${Math.round(companyNameSize)}px (canvas-scaled)`
        );
        break;

      case "address":
        text = new fabric.Text(content, {
          left: leftMargin,
          top: topBase + companyNameSize * 1.8,
          fontFamily: "Arial",
          fontSize: Math.round(addressSize),
          fill: "#666666",
          fontStyle: "italic",
          name: "address",
        });
        console.log(`📊 Address: ${Math.round(addressSize)}px (canvas-scaled)`);
        break;

      case "contactInfo":
        text = new fabric.Text(content, {
          left: leftMargin,
          top: topBase + companyNameSize * 1.8 + addressSize * 1.8,
          fontFamily: "Arial",
          fontSize: Math.round(contactSize),
          fill: "#333333",
          name: "contactInfo",
        });
        console.log(
          `📊 Contact info: ${Math.round(contactSize)}px (canvas-scaled)`
        );
        break;

      case "logoUrl": {
        console.log("Processing logo URL:", content);
        const logoSource = s3Logo || content;
        console.log("Using logo source:", logoSource);

        console.log(`📊 Logo size: ${Math.round(logoSize)}px (canvas-scaled)`);

        // CÁCH 1: Sử dụng HTML Image element (BỎ crossOrigin)
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = function () {
          console.log("Logo loaded successfully");
          console.log("Image dimensions:", img.width, "x", img.height);

          try {
            const fabricImg = new fabric.Image(img, {
              left: leftMargin,
              top:
                topBase +
                companyNameSize * 1.8 +
                addressSize * 1.8 +
                contactSize * 1.8,
              name: "logo",
            });

            const maxWidth = logoSize;
            const maxHeight = logoSize;
            const scale = Math.min(
              maxWidth / img.width,
              maxHeight / img.height
            );

            fabricImg.set({
              scaleX: scale,
              scaleY: scale,
            });

            fabricCanvas.add(fabricImg);
            fabricCanvas.setActiveObject(fabricImg);
            fabricCanvas.renderAll();

            console.log("Logo added to canvas successfully");
          } catch (error) {
            console.error("Error creating fabric image:", error);
          }
        };

        img.onerror = function (error) {
          console.error("Failed to load logo image:", logoSource, error);

          // FALLBACK: Tạo placeholder cho logo
          console.log("Creating logo placeholder due to CORS error");

          const placeholder = new fabric.Rect({
            left: leftMargin,
            top:
              topBase +
              companyNameSize * 1.8 +
              addressSize * 1.8 +
              contactSize * 1.8,
            width: logoSize,
            height: logoSize * 0.67, // Tỉ lệ 3:2 cho placeholder
            fill: "#f0f0f0",
            stroke: "#ddd",
            strokeWidth: 2,
            rx: 10,
            ry: 10,
            name: "logoPlaceholder",
          });

          const placeholderTextSize = Math.max(fontSizePixelValue * 0.07, 16);
          const placeholderText = new fabric.Text("LOGO", {
            left: leftMargin + logoSize / 2,
            top:
              topBase +
              companyNameSize * 1.8 +
              addressSize * 1.8 +
              contactSize * 1.8 +
              logoSize * 0.335, // Center vertically in placeholder
            fontSize: placeholderTextSize, // Sử dụng kích thước tính từ fontSizePixelValue
            fill: "#666",
            fontWeight: "bold",
            textAlign: "center",
            originX: "center",
            originY: "center",
            name: "logoPlaceholderText",
          });

          const urlTextSize = Math.max(fontSizePixelValue * 0.04, 10);
          const urlText = new fabric.Text("Không thể tải logo", {
            left: leftMargin + logoSize / 2,
            top:
              topBase +
              companyNameSize * 1.8 +
              addressSize * 1.8 +
              contactSize * 1.8 +
              logoSize * 0.5, // Below center of placeholder
            fontSize: urlTextSize, // Sử dụng kích thước tính từ fontSizePixelValue
            fill: "#999",
            textAlign: "center",
            originX: "center",
            originY: "center",
            name: "logoErrorText",
          });

          fabricCanvas.add(placeholder);
          fabricCanvas.add(placeholderText);
          fabricCanvas.add(urlText);
          fabricCanvas.setActiveObject(placeholder);
          fabricCanvas.renderAll();

          console.log("Logo placeholder added successfully");
        };

        img.src = logoSource;
        return;
      }

      default:
        console.log("Unknown type:", type);
        return;
    }

    if (text) {
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      setSelectedText(text);
      fabricCanvas.renderAll();
      console.log("Text added to canvas:", type);
    }
  };

  // === Orientation helpers ===
  const getSimpleOrientation = () => {
    if (!fabricCanvas) return 'landscape';
    const w = fabricCanvas.width;
    const h = fabricCanvas.height;
    const r = w / h;
    if (r > 1.15) return 'landscape';
    if (r < 0.85) return 'portrait';
    return 'square';
  };

  // ================= LANDSCAPE VARIANTS (base: previous adaptive version) =================
  const applyLayoutLandscape1 = () => {
    if (!fabricCanvas) {
      console.log("Canvas not available");
      return;
    }

    // Clear existing business info objects
    clearBusinessInfo();
  const cw = fabricCanvas.width; const ch = fabricCanvas.height; const canvasSize = Math.max(cw, ch);
  const fontScaleFactor = fontSizePixelValue ? fontSizePixelValue / 256 : 1;
  const companyNameSize = Math.min(Math.max(60 * (canvasSize/1000) * fontScaleFactor, 34), canvasSize * 0.11);
  // Fixed secondary size per request
  const secondarySize = 18;
  const gapHorizontal = Math.max(24, cw * 0.02);
  const gapRow = Math.max(30, ch * 0.05);
  const topRowY = ch * 0.15;
  const logoSizeBase = Math.min(cw * 0.22, ch * 0.30);
  const createTb = (text, opts, maxWidth) => { const tb=new fabric.Textbox(text,{width:maxWidth,...opts}); if(tb.getScaledWidth()>maxWidth+2){ const ratio=maxWidth/tb.getScaledWidth(); tb.set({fontSize:Math.round(tb.fontSize*ratio)});} tb.set({width:maxWidth}); return tb; };
  let logoW=0, logoH=0; if (businessPresets.logoUrl){ logoW=logoSizeBase; logoH=logoSizeBase; }
  let companyObj=null; if (businessPresets.companyName){ companyObj=createTb(businessPresets.companyName,{left:0,top:topRowY,fontFamily:'UTM Ambrose',fontSize:companyNameSize,fill:'#000',fontWeight:'bold',name:'layout1-companyName'}, cw*0.6); fabricCanvas.add(companyObj); companyObj.setCoords(); }
  const companyW=companyObj?companyObj.getScaledWidth():0; const companyH=companyObj?companyObj.getScaledHeight():0; const totalTopW=logoW + (logoW && companyW ? gapHorizontal:0) + companyW; let startX=(cw-totalTopW)/2; if(logoW){ addLogoAtPosition(startX, topRowY - (logoH*0.05), logoW, 'layout1-logo'); startX += logoW + (companyW?gapHorizontal:0);} if(companyObj){ companyObj.set({ left:startX, top: topRowY + (logoH ? (logoH-companyH)/2 : 0) }); }
  // Title & Description stacked under company name, aligned with its left edge (or centered similarly if company missing)
  const titleSize = Math.max(24, companyNameSize * 0.55);
  const descSize = Math.max(18, Math.round(titleSize * 0.7));
  let titleObj=null, descObj=null; const verticalGapTD = Math.max(12, gapRow * 0.25);
  const columnLeft = companyObj ? companyObj.left : (cw - cw*0.5)/2; const maxColWidth = companyObj ? companyObj.width : cw*0.5;
  titleObj = createTb('TIÊU ĐỀ CỦA BẠN', { left: columnLeft, top: (companyObj? companyObj.top + companyH + verticalGapTD : topRowY), fontFamily:'UTM Conestoga', fontSize:titleSize, fill:'#000', fontWeight:'bold', name:'layout1-title', textAlign:'left' }, maxColWidth);
  fabricCanvas.add(titleObj); titleObj.setCoords();
  descObj = createTb('MÔ TẢ CỦA BẠN', { left: columnLeft, top: titleObj.top + titleObj.getScaledHeight() + verticalGapTD, fontFamily:'UTM Conestoga', fontSize:descSize, fill:'#000', name:'layout1-description', textAlign:'left' }, maxColWidth);
  fabricCanvas.add(descObj); descObj.setCoords();
  // Create address & contact objects (initial top temp, will reposition to bottom)
  const row2Y = descObj.top + descObj.getScaledHeight() + gapRow; let addressObj=null, contactObj=null; const maxSecondaryWidth=cw*0.42; if(businessPresets.address){ addressObj=createTb(`Địa chỉ: ${businessPresets.address}`, {left:0, top:row2Y, fontFamily:'UTM Amerika Sans', fontSize:secondarySize, fill:'#000', name:'layout1-address'}, maxSecondaryWidth); fabricCanvas.add(addressObj); addressObj.setCoords(); } if(businessPresets.contactInfo){ contactObj=createTb(`ĐT : ${businessPresets.contactInfo}`, {left:0, top:row2Y, fontFamily:'UTM Amerika Sans', fontSize:secondarySize, fill:'#000', name:'layout1-contactInfo'}, maxSecondaryWidth); fabricCanvas.add(contactObj); contactObj.setCoords(); }
  // Reposition address/contact to bottom horizontal line for consistency across layouts
  positionAddressContactBottom(addressObj, contactObj, gapHorizontal, 'layout1', 18);
  fabricCanvas.requestRenderAll(); console.log('Applied Landscape Layout 1 (bottom address/contact)');
  };

  // ✅ Landscape Layout 2: Thông tin ở góc phải dưới
  const applyLayoutLandscape2 = () => {
    if (!fabricCanvas) {
      console.log("Canvas not available");
      return;
    }
    // Clear existing business info objects
    clearBusinessInfo();
    // Yêu cầu mới: Logo và tên công ty thẳng hàng theo chiều dọc (logo trên, tên dưới) và CĂN GIỮA.
    const cw = fabricCanvas.width; const ch = fabricCanvas.height; const canvasSize = Math.max(cw, ch);
    const fontScaleFactor = fontSizePixelValue ? fontSizePixelValue / 256 : 1;
    const baseScale = canvasSize / 1000;
  const companyNameSize = Math.min(Math.max(56 * baseScale * fontScaleFactor, 32), canvasSize * 0.11);
  // secondarySize gốc bỏ, dùng fixed 18 theo yêu cầu
  const secondarySize = 18;
    const gapVertical = Math.max(20, ch * 0.03);
    const createTb = (text, opts, maxW) => { const tb=new fabric.Textbox(text,{width:maxW,...opts}); if(tb.getScaledWidth()>maxW+2){ const ratio=maxW/tb.getScaledWidth(); tb.set({fontSize:Math.round(tb.fontSize*ratio)});} tb.set({width:maxW}); return tb; };

    const topObjects = [];
    let logoObj = null;
    if (businessPresets.logoUrl){
      const logoSize = Math.min(cw * 0.25, ch * 0.30);
      addLogoAtPosition((cw - logoSize)/2, 0, logoSize, 'layout2-logo');
      logoObj = fabricCanvas.getObjects().find(o=>o.name==='layout2-logo');
      if (logoObj) topObjects.push(logoObj);
    }
    let companyTb = null;
    if (businessPresets.companyName){
      companyTb = createTb(businessPresets.companyName, { left:0, top:0, fontFamily:'UTM Ambrose', fontSize: companyNameSize, fill:'#000', fontWeight:'bold', textAlign:'center', name:'layout2-companyName' }, cw * 0.7);
      fabricCanvas.add(companyTb); companyTb.setCoords(); topObjects.push(companyTb);
    }
    // Add title & description placeholders below company name in same vertical stack
    const titleSize2 = Math.max(24, companyNameSize * 0.55);
    const descSize2 = Math.max(18, Math.round(titleSize2 * 0.7));
  const titleTb = createTb('TIÊU ĐỀ CỦA BẠN', { left:0, top:0, fontFamily:'UTM Conestoga', fontSize:titleSize2, fill:'#000', fontWeight:'bold', textAlign:'center', name:'layout2-title' }, cw*0.7);
    fabricCanvas.add(titleTb); titleTb.setCoords(); topObjects.push(titleTb);
  const descTb = createTb('MÔ TẢ CỦA BẠN', { left:0, top:0, fontFamily:'UTM Conestoga', fontSize:descSize2, fill:'#000', textAlign:'center', name:'layout2-description' }, cw*0.7);
    fabricCanvas.add(descTb); descTb.setCoords(); topObjects.push(descTb);

    // Recompute total height with title/description
    const totalTopHeight = topObjects.reduce((s,o)=> s + o.getScaledHeight(),0) + (topObjects.length>1? gapVertical*(topObjects.length-1):0);
    let currentY = (ch - totalTopHeight)/2;
    topObjects.forEach(o => { const w = o.getScaledWidth(); o.set({ top: currentY, left: (cw - w)/2 }); o.setCoords(); currentY += o.getScaledHeight() + gapVertical; });

    // Địa chỉ + liên hệ vẫn đặt 1 dòng dưới đáy, căn giữa (dùng helper có sẵn)
    let addressObj=null, contactObj=null;
    if (businessPresets.address){
      addressObj = createTb(`Địa chỉ: ${businessPresets.address}`, { left:0, top:0, fontFamily:'UTM Amerika Sans', fontSize: secondarySize, fill:'#000', name:'layout2-address', textAlign:'left' }, cw*0.9);
      fabricCanvas.add(addressObj); addressObj.setCoords();
    }
    if (businessPresets.contactInfo){
      contactObj = createTb(`ĐT : ${businessPresets.contactInfo}`, { left:0, top:0, fontFamily:'UTM Amerika Sans', fontSize: secondarySize, fill:'#000', name:'layout2-contactInfo', textAlign:'left' }, cw*0.9);
      fabricCanvas.add(contactObj); contactObj.setCoords();
    }
    positionAddressContactBottom(addressObj, contactObj, Math.max(30, cw*0.02), 'layout2', 18);
    fabricCanvas.requestRenderAll();
    console.log('Applied Landscape Layout 2 (center stacked logo/company, bottom address/contact)');
  };


  // ================= PORTRAIT VARIANTS =================
  const applyLayoutPortrait1 = () => {
    if (!fabricCanvas) return;
    clearBusinessInfo();
    const cw = fabricCanvas.width; const ch = fabricCanvas.height; const canvasSize = Math.max(cw, ch);
    const fontScaleFactor = fontSizePixelValue ? fontSizePixelValue / 256 : 1;
    const companyNameSize = Math.min(Math.max(64 * (canvasSize/1000) * fontScaleFactor, 34), canvasSize * 0.125);
  // Fixed secondary size per request
  const secondarySize = 18;
    const topRowY = ch * 0.18;
    const gapHorizontal = Math.max(20, cw * 0.04);
    const gapRow = Math.max(28, ch * 0.05);
    const logoSizeBase = Math.min(cw * 0.35, ch * 0.18);

    const createTb = (text, opts, maxWidth) => {
      const tb = new fabric.Textbox(text, { width: maxWidth, ...opts });
      if (tb.getScaledWidth() > maxWidth + 2) {
        const ratio = maxWidth / tb.getScaledWidth();
        tb.set({ fontSize: Math.round(tb.fontSize * ratio) });
      }
      tb.set({ width: maxWidth });
      return tb;
    };

    let logoWidth = 0; let logoHeight = 0; if (businessPresets.logoUrl) { logoWidth = logoSizeBase; logoHeight = logoSizeBase; }
    let companyObj = null;
    if (businessPresets.companyName) {
      companyObj = createTb(businessPresets.companyName, { left:0, top: topRowY, fontFamily:'UTM Ambrose', fontSize: companyNameSize, fill:'#000', fontWeight:'bold', name:'portrait1-companyName' }, cw*0.6);
      fabricCanvas.add(companyObj); companyObj.setCoords();
    }
    const companyWidth = companyObj ? companyObj.getScaledWidth() : 0; const companyHeight = companyObj ? companyObj.getScaledHeight() : 0;
    const totalTopWidth = logoWidth + (logoWidth && companyWidth ? gapHorizontal : 0) + companyWidth;
    let startX = (cw - totalTopWidth)/2;
    if (logoWidth) { addLogoAtPosition(startX, topRowY - (logoHeight*0.05), logoWidth, 'portrait1-logo'); startX += logoWidth + (companyWidth ? gapHorizontal : 0); }
    if (companyObj) { companyObj.set({ left: startX, top: topRowY + (logoHeight ? (logoHeight - companyHeight)/2 : 0) }); }
    // Title & description below company name (aligned left with company)
    const titleSizeP1 = Math.max(24, companyNameSize * 0.55);
    const descSizeP1 = Math.max(18, Math.round(titleSizeP1 * 0.7));
    const colLeft1 = companyObj ? companyObj.left : startX; const maxColWidth1 = companyObj ? companyObj.width : cw*0.5;
  const titleP1 = createTb('TIÊU ĐỀ CỦA BẠN', { left: colLeft1, top: (companyObj? companyObj.top + companyHeight + gapRow*0.3 : topRowY), fontFamily:'UTM Conestoga', fontSize:titleSizeP1, fill:'#000', fontWeight:'bold', name:'portrait1-title' }, maxColWidth1);
    fabricCanvas.add(titleP1); titleP1.setCoords();
  const descP1 = createTb('MÔ TẢ CỦA BẠN', { left: colLeft1, top: titleP1.top + titleP1.getScaledHeight() + gapRow*0.25, fontFamily:'UTM Conestoga', fontSize:descSizeP1, fill:'#000', name:'portrait1-description' }, maxColWidth1);
    fabricCanvas.add(descP1); descP1.setCoords();

    const row2Y = descP1.top + descP1.getScaledHeight() + gapRow; // temp top for address/contact
    let addressObj=null, contactObj=null; const maxSecondaryWidth = cw*0.8 * 0.5;
    if (businessPresets.address) { addressObj = createTb(`Địa chỉ: ${businessPresets.address}`, { left:0, top:row2Y, fontFamily:'UTM Amerika Sans', fontSize: secondarySize, fill:'#000', name:'portrait1-address' }, maxSecondaryWidth); fabricCanvas.add(addressObj); addressObj.setCoords(); }
    if (businessPresets.contactInfo) { contactObj = createTb(`ĐT : ${businessPresets.contactInfo}`, { left:0, top:row2Y, fontFamily:'UTM Amerika Sans', fontSize: secondarySize, fill:'#000', name:'portrait1-contactInfo' }, maxSecondaryWidth); fabricCanvas.add(contactObj); contactObj.setCoords(); }
  positionAddressContactBottom(addressObj, contactObj, gapHorizontal, 'portrait1', 18);
  fabricCanvas.requestRenderAll();
  console.log('Applied Portrait Layout 1 (bottom address/contact)');
  };

  const applyLayoutPortrait2 = () => {
    if (!fabricCanvas) return;
    clearBusinessInfo();
    // Yêu cầu mới: logo + tên công ty xếp dọc & căn giữa.
    const cw = fabricCanvas.width; const ch = fabricCanvas.height; const canvasSize = Math.max(cw, ch); const baseScale = canvasSize/1000;
    const fontScaleFactor = fontSizePixelValue ? fontSizePixelValue / 256 : 1;
  const companyNameSize = Math.min(Math.max(58 * baseScale * fontScaleFactor, 30), canvasSize * 0.13);
  // secondarySize fixed 18 theo yêu cầu
  const secondarySize = 18;
    const gapVertical = Math.max(24, ch * 0.035);
    const createTb = (text, opts, maxW) => { const tb=new fabric.Textbox(text,{width:maxW,...opts}); if(tb.getScaledWidth()>maxW+2){ const ratio=maxW/tb.getScaledWidth(); tb.set({fontSize:Math.round(tb.fontSize*ratio)});} tb.set({width:maxW}); return tb; };
    const stacked = [];
    let logoObj=null;
    if (businessPresets.logoUrl){
      const logoSize = Math.min(cw*0.45, ch*0.25);
      addLogoAtPosition((cw - logoSize)/2, 0, logoSize, 'portrait2-logo');
      logoObj = fabricCanvas.getObjects().find(o=>o.name==='portrait2-logo');
      if (logoObj) stacked.push(logoObj);
    }
    let companyTb=null;
    if (businessPresets.companyName){
      companyTb = createTb(businessPresets.companyName, { left:0, top:0, fontFamily:'UTM Ambrose', fontSize:companyNameSize, fill:'#000', fontWeight:'bold', textAlign:'center', name:'portrait2-companyName' }, cw*0.8);
      fabricCanvas.add(companyTb); companyTb.setCoords(); stacked.push(companyTb);
    }
    const titleSizeP2 = Math.max(24, companyNameSize * 0.55);
    const descSizeP2 = Math.max(18, Math.round(titleSizeP2 * 0.7));
  const titleP2 = createTb('TIÊU ĐỀ CỦA BẠN', { left:0, top:0, fontFamily:'UTM Conestoga', fontSize:titleSizeP2, fill:'#000', fontWeight:'bold', textAlign:'center', name:'portrait2-title' }, cw*0.8); fabricCanvas.add(titleP2); titleP2.setCoords(); stacked.push(titleP2);
  const descP2 = createTb('MÔ TẢ CỦA BẠN', { left:0, top:0, fontFamily:'UTM Conestoga', fontSize:descSizeP2, fill:'#000', textAlign:'center', name:'portrait2-description' }, cw*0.8); fabricCanvas.add(descP2); descP2.setCoords(); stacked.push(descP2);
    const totalH = stacked.reduce((s,o)=>s+o.getScaledHeight(),0) + (stacked.length>1? gapVertical*(stacked.length-1):0);
    let curY = (ch - totalH)/2; stacked.forEach(o=>{ const w=o.getScaledWidth(); o.set({ top: curY, left: (cw - w)/2 }); o.setCoords(); curY += o.getScaledHeight() + gapVertical; });

    // Địa chỉ + liên hệ dưới đáy
    let addressTb=null, contactTb=null;
  if (businessPresets.address){ addressTb = createTb(`Địa chỉ: ${businessPresets.address}`, { left:0, top:0, fontFamily:'UTM Amerika Sans', fontSize: secondarySize, fill:'#000', name:'portrait2-address'}, cw*0.9); fabricCanvas.add(addressTb); addressTb.setCoords(); }
  if (businessPresets.contactInfo){ contactTb = createTb(`ĐT : ${businessPresets.contactInfo}`, { left:0, top:0, fontFamily:'UTM Amerika Sans', fontSize: secondarySize, fill:'#000', name:'portrait2-contactInfo'}, cw*0.9); fabricCanvas.add(contactTb); contactTb.setCoords(); }
  positionAddressContactBottom(addressTb, contactTb, Math.max(30, cw*0.05), 'portrait2', 18);
    fabricCanvas.requestRenderAll();
    console.log('Applied Portrait Layout 2 (center stacked logo/company, bottom address/contact)');
  };


  // ================= SQUARE VARIANTS =================
  const applyLayoutSquare1 = () => {
    if (!fabricCanvas) return;
  clearBusinessInfo();
  const cw=fabricCanvas.width; const ch=fabricCanvas.height; const canvasSize=Math.max(cw,ch);
  const fontScaleFactor = fontSizePixelValue ? fontSizePixelValue / 256 : 1;
  const companyNameSize = Math.min(Math.max(58*(canvasSize/1000)*fontScaleFactor, 32), canvasSize*0.12);
  // Fixed secondary size per request
  const secondarySize = 18;
  const topRowY = ch*0.18; const gapHorizontal = Math.max(20, cw*0.03); const gapRow = Math.max(26, ch*0.06); const logoSizeBase = Math.min(cw*0.30, ch*0.30);
  const createTb=(text,opts,maxWidth)=>{ const tb=new fabric.Textbox(text,{width:maxWidth,...opts}); if(tb.getScaledWidth()>maxWidth+2){ const ratio=maxWidth/tb.getScaledWidth(); tb.set({fontSize:Math.round(tb.fontSize*ratio)});} tb.set({width:maxWidth}); return tb; };
  let logoW=0, logoH=0; if (businessPresets.logoUrl){ logoW=logoSizeBase; logoH=logoSizeBase; }
  let companyObj=null; if (businessPresets.companyName){ companyObj=createTb(businessPresets.companyName,{left:0,top:topRowY,fontFamily:'UTM Ambrose',fontSize:companyNameSize,fill:'#000',fontWeight:'bold',name:'square1-companyName'}, cw*0.6); fabricCanvas.add(companyObj); companyObj.setCoords(); }
  const companyW=companyObj?companyObj.getScaledWidth():0; const companyH=companyObj?companyObj.getScaledHeight():0; const totalTopW=logoW + (logoW && companyW ? gapHorizontal:0) + companyW; let startX=(cw-totalTopW)/2; if(logoW){ addLogoAtPosition(startX, topRowY - (logoH*0.05), logoW, 'square1-logo'); startX += logoW + (companyW?gapHorizontal:0);} if(companyObj){ companyObj.set({ left:startX, top: topRowY + (logoH ? (logoH-companyH)/2 : 0) }); }
  const titleSizeS1 = Math.max(24, companyNameSize * 0.55); const descSizeS1 = Math.max(18, Math.round(titleSizeS1*0.7));
  const colLeftS1 = companyObj ? companyObj.left : startX; const maxColWidthS1 = companyObj ? companyObj.width : cw*0.5;
  const titleS1 = createTb('TIÊU ĐỀ CỦA BẠN', { left:colLeftS1, top:(companyObj? companyObj.top+companyH+gapRow*0.3 : topRowY), fontFamily:'UTM Conestoga', fontSize:titleSizeS1, fill:'#000', fontWeight:'bold', name:'square1-title' }, maxColWidthS1); fabricCanvas.add(titleS1); titleS1.setCoords();
  const descS1 = createTb('MÔ TẢ CỦA BẠN', { left:colLeftS1, top:titleS1.top + titleS1.getScaledHeight() + gapRow*0.25, fontFamily:'UTM Conestoga', fontSize:descSizeS1, fill:'#000', name:'square1-description' }, maxColWidthS1); fabricCanvas.add(descS1); descS1.setCoords();
  const row2Y = descS1.top + descS1.getScaledHeight() + gapRow; let addressObj=null, contactObj=null; const maxSecondaryWidth=cw*0.42; if(businessPresets.address){ addressObj=createTb(`Địa chỉ: ${businessPresets.address}`, {left:0, top:row2Y, fontFamily:'UTM Amerika Sans', fontSize:secondarySize, fill:'#000', name:'square1-address'}, maxSecondaryWidth); fabricCanvas.add(addressObj); addressObj.setCoords(); } if(businessPresets.contactInfo){ contactObj=createTb(`ĐT : ${businessPresets.contactInfo}`, {left:0, top:row2Y, fontFamily:'UTM Amerika Sans', fontSize:secondarySize, fill:'#000', name:'square1-contactInfo'}, maxSecondaryWidth); fabricCanvas.add(contactObj); contactObj.setCoords(); }
  positionAddressContactBottom(addressObj, contactObj, gapHorizontal, 'square1', 18);
  fabricCanvas.requestRenderAll(); console.log('Applied Square Layout 1 (bottom address/contact)');
  };

  const applyLayoutSquare2 = () => {
    if (!fabricCanvas) return; clearBusinessInfo();
  // Yêu cầu mới: giống các layout2 khác – logo + tên công ty xếp dọc, căn giữa; địa chỉ + liên hệ dưới cùng.
  const cw = fabricCanvas.width; const ch = fabricCanvas.height; const canvasSize = Math.max(cw,ch); const baseScale = canvasSize/1000;
  const fontScaleFactor = fontSizePixelValue ? fontSizePixelValue / 256 : 1;
  const companyNameSize = Math.min(Math.max(54 * baseScale * fontScaleFactor, 30), canvasSize * 0.12);
  // secondarySize fixed 18 theo yêu cầu
  const secondarySize = 18;
  const gapVertical = Math.max(20, ch*0.03);
  const createTb=(text,opts,maxW)=>{ const tb=new fabric.Textbox(text,{width:maxW,...opts}); if(tb.getScaledWidth()>maxW+2){ const ratio=maxW/tb.getScaledWidth(); tb.set({fontSize:Math.round(tb.fontSize*ratio)});} tb.set({width:maxW}); return tb; };

  const centerObjs=[]; let logoObj=null;
  if (businessPresets.logoUrl){ const logoSize=Math.min(cw*0.40, ch*0.40); addLogoAtPosition((cw-logoSize)/2, 0, logoSize, 'square2-logo'); logoObj=fabricCanvas.getObjects().find(o=>o.name==='square2-logo'); if(logoObj) centerObjs.push(logoObj); }
  let companyTb=null; if (businessPresets.companyName){ companyTb=createTb(businessPresets.companyName,{ left:0, top:0, fontFamily:'UTM Ambrose', fontSize:companyNameSize, fill:'#000', fontWeight:'bold', name:'square2-companyName', textAlign:'center' }, cw*0.8); fabricCanvas.add(companyTb); companyTb.setCoords(); centerObjs.push(companyTb); }
  const titleSizeSq2 = Math.max(24, companyNameSize * 0.55); const descSizeSq2 = Math.max(18, Math.round(titleSizeSq2*0.7));
  const titleSq2 = createTb('TIÊU ĐỀ CỦA BẠN', { left:0, top:0, fontFamily:'UTM Conestoga', fontSize:titleSizeSq2, fill:'#000', fontWeight:'bold', name:'square2-title', textAlign:'center' }, cw*0.8); fabricCanvas.add(titleSq2); titleSq2.setCoords(); centerObjs.push(titleSq2);
  const descSq2 = createTb('MÔ TẢ CỦA BẠN', { left:0, top:0, fontFamily:'UTM Conestoga', fontSize:descSizeSq2, fill:'#000', name:'square2-description', textAlign:'center' }, cw*0.8); fabricCanvas.add(descSq2); descSq2.setCoords(); centerObjs.push(descSq2);
  const totalH=centerObjs.reduce((s,o)=>s+o.getScaledHeight(),0)+(centerObjs.length>1? gapVertical*(centerObjs.length-1):0);
  let curY=(ch-totalH)/2; centerObjs.forEach(o=>{ const w=o.getScaledWidth(); o.set({ top:curY, left:(cw - w)/2 }); o.setCoords(); curY += o.getScaledHeight()+gapVertical; });

  let addr=null, contact=null; if (businessPresets.address){ addr=createTb(`Địa chỉ: ${businessPresets.address}`, { left:0, top:0, fontFamily:'UTM Amerika Sans', fontSize:secondarySize, fill:'#000', name:'square2-address', textAlign:'left' }, cw*0.9); fabricCanvas.add(addr); addr.setCoords(); }
  if (businessPresets.contactInfo){ contact=createTb(`ĐT : ${businessPresets.contactInfo}`, { left:0, top:0, fontFamily:'UTM Amerika Sans', fontSize:secondarySize, fill:'#000', name:'square2-contactInfo', textAlign:'left' }, cw*0.9); fabricCanvas.add(contact); contact.setCoords(); }
  positionAddressContactBottom(addr, contact, Math.max(28, cw*0.025), 'square2', 18);
  fabricCanvas.requestRenderAll();
  console.log('Applied Square Layout 2 (center stacked logo/company, bottom address/contact)');
  };


  // ================= DISPATCHERS (public applyLayout1/2/3) =================
  const applyLayout1 = () => {
    const o = getSimpleOrientation();
    if (o === 'portrait') return applyLayoutPortrait1();
    if (o === 'square') return applyLayoutSquare1();
    return applyLayoutLandscape1();
  };
  const applyLayout2 = () => {
    const o = getSimpleOrientation();
    if (o === 'portrait') return applyLayoutPortrait2();
    if (o === 'square') return applyLayoutSquare2();
    return applyLayoutLandscape2();
  };

  // ================= COMMON BOTTOM POSITIONING FOR ADDRESS & CONTACT =================
  const positionAddressContactBottom = (addressObj, contactObj, gapHorizontal = 30, layoutTag='', minFont=8) => {
    if (!fabricCanvas) return;
    if (!addressObj && !contactObj) return;
    const cw = fabricCanvas.width; const ch = fabricCanvas.height;
    const bottomMargin = Math.max(20, ch * 0.06); // distance from bottom edge
    const gap = (addressObj && contactObj) ? gapHorizontal : 0;
    // Compute widths
    const addrW = addressObj ? addressObj.getScaledWidth() : 0;
    const contactW = contactObj ? contactObj.getScaledWidth() : 0;
    // Try single line, if overflow shrink font a bit proportionally
    const maxAllowableWidth = cw * 0.94; // leave small side margins
    let totalW = addrW + gap + contactW;
  const shrinkIfNeeded = (obj, ratio) => { if (!obj) return; obj.set({ fontSize: Math.max(minFont, Math.round(obj.fontSize * ratio)) }); obj.setCoords(); };
    if (totalW > maxAllowableWidth && addressObj && contactObj){
      // compute ratio
      const ratio = maxAllowableWidth / totalW;
      shrinkIfNeeded(addressObj, ratio);
      shrinkIfNeeded(contactObj, ratio);
      // Recompute widths
      const newAddrW = addressObj.getScaledWidth();
      const newContactW = contactObj.getScaledWidth();
      totalW = newAddrW + gap + newContactW;
    }
    // If still too wide place each 2-line wrap inside narrower boxes
    if (totalW > maxAllowableWidth && addressObj && contactObj){
      const half = maxAllowableWidth / 2 - gap/2;
      addressObj.set({ width: half }); addressObj._splitText(); addressObj.setCoords();
      contactObj.set({ width: half }); contactObj._splitText(); contactObj.setCoords();
      // Recompute widths after wrap
      totalW = addressObj.getScaledWidth() + gap + contactObj.getScaledWidth();
    }
    // Center horizontally
    let startX = (cw - totalW)/2;
    const maxH = Math.max(addressObj?addressObj.getScaledHeight():0, contactObj?contactObj.getScaledHeight():0);
    const topY = ch - bottomMargin - maxH; // keep bottom margin
    if (addressObj){ addressObj.set({ left:startX, top: topY }); startX += addressObj.getScaledWidth() + gap; }
    if (contactObj){ contactObj.set({ left:startX, top: topY }); }
    if (addressObj) addressObj.setCoords(); if (contactObj) contactObj.setCoords();
    console.log(`Repositioned address/contact to bottom for ${layoutTag}`);
  };

  // ✅ Helper function to clear existing business info objects
  const clearBusinessInfo = () => {
    if (!fabricCanvas) return;
    
    const objectsToRemove = fabricCanvas.getObjects().filter(obj => 
      obj.name && (
        obj.name.includes('companyName') || 
        obj.name.includes('address') || 
        obj.name.includes('contactInfo') || 
        obj.name.includes('logo') ||
  obj.name.includes('logoPlaceholder') ||
        obj.name.includes('logoPlaceholderText') ||
  obj.name.includes('logoErrorText') ||
  obj.name.includes('title') ||
  obj.name.includes('description')
      )
    );
    
    objectsToRemove.forEach(obj => fabricCanvas.remove(obj));
  };

  // ✅ Helper function to add logo at specific position
  const addLogoAtPosition = (left, top, size, name) => {
    const logoSource = s3Logo || businessPresets.logoUrl;
    
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      try {
        const fabricImg = new fabric.Image(img, {
          left: left,
          top: top,
          name: name,
        });

        const scale = Math.min(size / img.width, size / img.height);
        fabricImg.set({
          scaleX: scale,
          scaleY: scale,
        });

        fabricCanvas.add(fabricImg);
        fabricCanvas.renderAll();
      } catch (error) {
        console.error("Error creating fabric image:", error);
        // Add placeholder if logo fails
        addLogoPlaceholder(left, top, size, name);
      }
    };

    img.onerror = function (error) {
      console.error("Failed to load logo image:", logoSource, error);
      addLogoPlaceholder(left, top, size, name);
    };

    img.src = logoSource;
  };

  // ✅ Helper function to add logo placeholder
  const addLogoPlaceholder = (left, top, size, name) => {
    const placeholder = new fabric.Rect({
      left: left,
      top: top,
      width: size,
      height: size * 0.67,
      fill: "#f0f0f0",
      stroke: "#ddd",
      strokeWidth: 2,
      rx: 10,
      ry: 10,
      name: name + "-placeholder",
    });

    const placeholderText = new fabric.Text("LOGO", {
      left: left + size / 2,
      top: top + (size * 0.67) / 2,
      fontSize: Math.max(size * 0.15, 12),
      fill: "#666",
      fontWeight: "bold",
      textAlign: "center",
      originX: "center",
      originY: "center",
      name: name + "-text",
    });

    fabricCanvas.add(placeholder);
    fabricCanvas.add(placeholderText);
    fabricCanvas.renderAll();
  };

  // Điều chỉnh cài đặt canvas để có chất lượng tốt hơn
  useEffect(() => {
    // ✅ Chỉ khởi tạo canvas cho step 7
    if (
      currentStep === 7 &&
      canvasRef.current &&
      !fabricCanvas &&
      (generatedImage || selectedBackgroundForCanvas)
    ) {
      const canvasContainer = canvasRef.current.parentElement;
      const containerWidth = canvasContainer.clientWidth;

      // 🎯 Khởi tạo canvas với kích thước tạm thời - sẽ được điều chỉnh lại khi tải ảnh
      let canvasWidth, canvasHeight;

      // Sử dụng kích thước tạm thời để khởi tạo canvas
      canvasWidth = Math.min(containerWidth - 40, 800); // Max 800px width
      canvasHeight = Math.round(canvasWidth / 1.5); // Tỷ lệ 3:2 tạm thời

      console.log("🎯 [CANVAS] Khởi tạo canvas với kích thước tạm thời:");
      console.log(
        "🎯 [CANVAS] Temporary canvas size:",
        canvasWidth,
        "x",
        canvasHeight
      );
      console.log(
        "🎯 [CANVAS] Canvas sẽ tự động điều chỉnh theo ảnh được tải!"
      );

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: Math.round(canvasWidth),
        height: Math.round(canvasHeight),
        backgroundColor: "#f8f9fa",
        preserveObjectStacking: true,
      });

      // Xác định nguồn ảnh để sử dụng dựa trên product type
      let imageUrl = null;
      let imageSource = null;

      // Determine current product type
      const currentProductTypeInfo =
        productTypes.find((pt) => pt.id === billboardType) ||
        currentProductType;
      const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

      console.log("🎯 [CANVAS] Determining image source:");
      console.log("🎯 [CANVAS] isAiGenerated:", isAiGenerated);
      console.log("🎯 [CANVAS] has generatedImage:", !!generatedImage);
      console.log(
        "🎯 [CANVAS] has selectedBackgroundForCanvas:",
        !!selectedBackgroundForCanvas
      );

      // Priority logic based on product type
      if (isAiGenerated && generatedImage) {
        // AI product type: prioritize AI generated image
        imageUrl = generatedImage;
        imageSource = "ai-generated";
        console.log(
          "🤖 [CANVAS] Using AI-generated image for AI product type:",
          imageUrl
        );
      } else if (!isAiGenerated && selectedBackgroundForCanvas) {
        // Non-AI product type: prioritize background
        console.log(
          "🔍 [CANVAS DEBUG] selectedBackgroundForCanvas:",
          selectedBackgroundForCanvas
        );
        console.log(
          "🔍 [CANVAS DEBUG] extrasImageUrl:",
          selectedBackgroundForCanvas.extrasImageUrl
        );
        console.log(
          "🔍 [CANVAS DEBUG] backgroundUrl:",
          selectedBackgroundForCanvas.backgroundUrl
        );
        console.log(
          "🔍 [CANVAS DEBUG] presignedUrl:",
          selectedBackgroundForCanvas.presignedUrl
        );

        // 🎨 CHỈ SỬ DỤNG extrasImageUrl - TEMPORARY FALLBACK cho debugging
        if (selectedBackgroundForCanvas.extrasImageUrl) {
          imageUrl = selectedBackgroundForCanvas.extrasImageUrl;
          imageSource = "background-extras";
          console.log(
            "🎨 [CANVAS] Using background extras image for non-AI product:",
            imageUrl
          );
        } else {
          console.warn(
            "⚠️ [CANVAS] No extrasImageUrl available, using TEMPORARY fallback"
          );
          console.warn(
            "⚠️ [CANVAS] Available properties:",
            Object.keys(selectedBackgroundForCanvas)
          );

          // TEMPORARY: Fallback to presignedUrl for debugging
          if (selectedBackgroundForCanvas.presignedUrl) {
            imageUrl = selectedBackgroundForCanvas.presignedUrl;
            imageSource = "background-fallback";
            console.log(
              "🔧 [CANVAS TEMP] Using fallback presignedUrl:",
              imageUrl
            );
          } else {
            imageSource = "no-extras";
          }
        }
      }

      // ✅ CHỈ LOAD IMAGE KHI CÓ VALID IMAGE URL
      if (
        imageUrl &&
        (imageSource === "ai-generated" ||
          imageSource === "background-extras" ||
          imageSource === "background-fallback")
      ) {
        console.log(`LOADING IMAGE: Loading ${imageSource} image`);

        // ✅ THÊM FLAG ĐỂ TRÁNH VÒNG LẶP VÔ HẠN
        let hasErrored = false;

        const loadImageToCanvas = async () => {
          try {
            let finalImageUrl = null;

            if (imageSource === "ai-generated") {
              // AI Generated Image - sử dụng trực tiếp URL
              finalImageUrl = imageUrl;
            } else if (imageSource === "background-extras") {
              // Background Extras Image - sử dụng trực tiếp URL từ extras API
              finalImageUrl = imageUrl;
              console.log(
                "🎨 Using background extras image URL directly:",
                finalImageUrl
              );
            } else if (imageSource === "background-fallback") {
              // TEMPORARY: Background fallback - sử dụng presigned URL
              finalImageUrl = imageUrl;
              console.log(
                "🔧 Using background fallback URL directly:",
                finalImageUrl
              );
            }

            if (!finalImageUrl) {
              throw new Error("No valid image URL available");
            }

            // Tạo HTML Image element
            const img = new Image();

            // ✅ Thử không dùng crossOrigin trước, nếu lỗi sẽ thử lại với crossOrigin
            if (
              imageSource === "ai-generated" ||
              imageSource === "background-extras" ||
              imageSource === "background-fallback"
            ) {
              // Không set crossOrigin ban đầu để tránh CORS issues
              console.log(
                `🎯 [CANVAS] Loading ${imageSource} image without crossOrigin first`
              );
            }

            img.onload = function () {
              console.log(
                `${imageSource.toUpperCase()} IMAGE LOADED SUCCESSFULLY`
              );
              console.log("🎯 [CANVAS] Image URL:", finalImageUrl);
              console.log(
                "🎯 [CANVAS] Original Image dimensions:",
                img.width,
                "x",
                img.height
              );

              // 🎯 ĐIỀU CHỈNH CANVAS THEO KÍCH THƯỚC ẢNH
              const canvasContainer = canvasRef.current.parentElement;
              const containerWidth = canvasContainer.clientWidth - 40; // Trừ padding
              const maxCanvasHeight = window.innerHeight * 0.6; // 60% viewport height

              // Tính tỷ lệ để canvas vừa với container nhưng giữ đúng aspect ratio ảnh
              const imageAspectRatio = img.width / img.height;

              let newCanvasWidth, newCanvasHeight;

              // Tính kích thước canvas dựa trên ảnh
              if (containerWidth / imageAspectRatio <= maxCanvasHeight) {
                // Ảnh có thể hiển thị toàn bộ chiều rộng container
                newCanvasWidth = containerWidth;
                newCanvasHeight = containerWidth / imageAspectRatio;
              } else {
                // Ảnh cao, giới hạn theo chiều cao
                newCanvasHeight = maxCanvasHeight;
                newCanvasWidth = maxCanvasHeight * imageAspectRatio;
              }

              newCanvasWidth = Math.round(newCanvasWidth);
              newCanvasHeight = Math.round(newCanvasHeight);

              console.log("🎯 [CANVAS] Resizing canvas to match image:");
              console.log(
                "🎯 [CANVAS] Original canvas size:",
                canvasWidth,
                "x",
                canvasHeight
              );
              console.log(
                "🎯 [CANVAS] New canvas size:",
                newCanvasWidth,
                "x",
                newCanvasHeight
              );
              console.log(
                "🎯 [CANVAS] Image aspect ratio:",
                imageAspectRatio.toFixed(2)
              );

              // 🎯 RESIZE CANVAS THEO ẢNH
              canvas.setDimensions({
                width: newCanvasWidth,
                height: newCanvasHeight,
              });

              // 🎯 QUAN TRỌNG: Cập nhật cả canvas element để tránh mismatch
              const canvasElement = canvas.getElement();
              canvasElement.width = newCanvasWidth;
              canvasElement.height = newCanvasHeight;
              canvasElement.style.width = newCanvasWidth + "px";
              canvasElement.style.height = newCanvasHeight + "px";

              console.log("🎯 [CANVAS] Canvas element after resize:");
              console.log(
                "🎯 [CANVAS] Element dimensions:",
                canvasElement.width,
                "x",
                canvasElement.height
              );
              console.log(
                "🎯 [CANVAS] Element style:",
                canvasElement.style.width,
                "x",
                canvasElement.style.height
              );

              // Cập nhật biến kích thước cho các thao tác sau này
              canvasWidth = newCanvasWidth;
              canvasHeight = newCanvasHeight;
              try {
                const fabricImg = new fabric.Image(img, {
                  left: 0,
                  top: 0,
                  selectable: false,
                  evented: false,
                  name: `backgroundImage-${imageSource}`,
                  opacity: 1, // Đảm bảo ảnh không trong suốt
                  visible: true, // Đảm bảo ảnh hiển thị
                });

                console.log("🎯 [CANVAS] Fabric image created:", fabricImg);
                console.log("🎯 [CANVAS] Fabric image width:", fabricImg.width);
                console.log(
                  "🎯 [CANVAS] Fabric image height:",
                  fabricImg.height
                );
                console.log(
                  "🎯 [CANVAS] Fabric image opacity:",
                  fabricImg.opacity
                );
                console.log(
                  "🎯 [CANVAS] Fabric image visible:",
                  fabricImg.visible
                );

                // 🎯 Scale ảnh để fill toàn bộ canvas (không có khoảng trống)
                const scaleX = canvasWidth / fabricImg.width;
                const scaleY = canvasHeight / fabricImg.height;

                // 🎯 IMPROVED: Đảm bảo scale không quá nhỏ và ảnh luôn hiển thị
                let scale = Math.max(scaleX, scaleY);

                // Đảm bảo scale tối thiểu để ảnh có thể nhìn thấy được
                const minScale = 0.1; // Scale tối thiểu 10%
                if (scale < minScale) {
                  console.warn(
                    "🎯 [CANVAS] Scale quá nhỏ, sử dụng scale tối thiểu:",
                    minScale
                  );
                  scale = minScale;
                }

                // 🎯 Tính toán vị trí center cho ảnh
                const scaledWidth = fabricImg.width * scale;
                const scaledHeight = fabricImg.height * scale;
                const centerX = (canvasWidth - scaledWidth) / 2;
                const centerY = (canvasHeight - scaledHeight) / 2;

                fabricImg.set({
                  scaleX: scale,
                  scaleY: scale,
                  left: centerX,
                  top: centerY,
                  originX: "left",
                  originY: "top",
                });

                console.log("🎯 [CANVAS] Image scaling:");
                console.log("🎯 [CANVAS] Scale X:", scaleX.toFixed(3));
                console.log("🎯 [CANVAS] Scale Y:", scaleY.toFixed(3));
                console.log(
                  "🎯 [CANVAS] Final scale (cover):",
                  scale.toFixed(3)
                );
                console.log(
                  "🎯 [CANVAS] Scaled dimensions:",
                  scaledWidth.toFixed(1),
                  "x",
                  scaledHeight.toFixed(1)
                );
                console.log(
                  "🎯 [CANVAS] Position:",
                  centerX.toFixed(1),
                  ",",
                  centerY.toFixed(1)
                );
                console.log(
                  "🎯 [CANVAS] ✅ Canvas đã được điều chỉnh theo ảnh - không còn khoảng trống!"
                );

                canvas.add(fabricImg);

                // 🎯 Clear canvas background color để ảnh có thể hiển thị
                canvas.backgroundColor = null;
                console.log("🎯 [CANVAS] Canvas background color cleared for image visibility");

                // 🎯 IMPROVED: Safe sendToBack with better fallback methods
                try {
                  if (typeof canvas.sendToBack === "function") {
                    canvas.sendToBack(fabricImg);
                    console.log("🎯 [CANVAS] Used sendToBack successfully");
                  } else {
                    throw new Error("sendToBack not available");
                  }
                } catch (error) {
                  console.warn(
                    "🎯 [CANVAS] sendToBack failed, using sendBackwards fallback:",
                    error.message
                  );
                  try {
                    // Try sendBackwards multiple times
                    const objects = canvas.getObjects();
                    let currentIndex = objects.indexOf(fabricImg);
                    while (
                      currentIndex > 0 &&
                      typeof canvas.sendBackwards === "function"
                    ) {
                      canvas.sendBackwards(fabricImg);
                      currentIndex--;
                    }
                    console.log("🎯 [CANVAS] Used sendBackwards successfully");
                  } catch (sendBackwardsError) {
                    console.warn(
                      "🎯 [CANVAS] sendBackwards failed, using manual reordering:",
                      sendBackwardsError.message
                    );
                    try {
                      // Manual reordering: collect all objects except background, clear canvas, add background first
                      const allObjects = canvas
                        .getObjects()
                        .filter((obj) => obj !== fabricImg);
                      canvas.clear();
                      canvas.add(fabricImg); // Background first
                      allObjects.forEach((obj) => {
                        try {
                          canvas.add(obj);
                        } catch (addError) {
                          console.warn(
                            "🎯 [CANVAS] Could not re-add object:",
                            addError
                          );
                        }
                      });
                      console.log(
                        "🎯 [CANVAS] Used manual reordering successfully"
                      );
                    } catch (manualError) {
                      console.error(
                        "🎯 [CANVAS] All sendToBack methods failed:",
                        manualError
                      );
                      // At least the image is still on canvas, just not in back
                    }
                  }
                }

                canvas.renderAll();

                // 🎯 DEBUG: Kiểm tra trạng thái canvas sau khi add image
                console.log("🎯 [CANVAS] Post-add debugging:");
                console.log(
                  "🎯 [CANVAS] Total objects on canvas:",
                  canvas.getObjects().length
                );
                console.log(
                  "🎯 [CANVAS] Canvas dimensions:",
                  canvas.getWidth(),
                  "x",
                  canvas.getHeight()
                );
                console.log(
                  "🎯 [CANVAS] Background image position:",
                  fabricImg.left,
                  ",",
                  fabricImg.top
                );
                console.log(
                  "🎯 [CANVAS] Background image scale:",
                  fabricImg.scaleX,
                  ",",
                  fabricImg.scaleY
                );
                console.log(
                  "🎯 [CANVAS] Background image visible:",
                  fabricImg.visible
                );
                console.log(
                  "🎯 [CANVAS] Canvas background color:",
                  canvas.backgroundColor
                );

                // Đảm bảo canvas element cũng được cập nhật
                const canvasElement = canvas.getElement();
                console.log(
                  "🎯 [CANVAS] Canvas element dimensions:",
                  canvasElement.width,
                  "x",
                  canvasElement.height
                );
                console.log(
                  "🎯 [CANVAS] Canvas element style:",
                  canvasElement.style.width,
                  "x",
                  canvasElement.style.height
                );

                console.log(
                  `🎯 [CANVAS] ${imageSource.toUpperCase()} IMAGE ADDED TO CANVAS SUCCESSFULLY`
                );

                // 🎯 BACKUP METHOD: Set image as canvas background để đảm bảo hiển thị
                try {
                  console.log("🎯 [CANVAS] Setting image as canvas background for better visibility...");
                  
                  // Create a pattern from the image để làm background
                  const pattern = new fabric.Pattern({
                    source: fabricImg.getElement(),
                    repeat: 'no-repeat'
                  });
                  
                  canvas.setBackgroundColor(pattern, canvas.renderAll.bind(canvas));
                  console.log("🎯 [CANVAS] ✅ Image set as canvas background pattern");
                } catch (patternError) {
                  console.warn("🎯 [CANVAS] Pattern background failed, trying setBackgroundImage:", patternError);
                  
                  try {
                    // Fallback: Use setBackgroundImage
                    canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas), {
                      originX: 'left',
                      originY: 'top',
                      left: 0,
                      top: 0,
                      scaleX: fabricImg.scaleX,
                      scaleY: fabricImg.scaleY
                    });
                    console.log("🎯 [CANVAS] ✅ Image set as background image");
                  } catch (bgImageError) {
                    console.warn("🎯 [CANVAS] setBackgroundImage also failed:", bgImageError);
                  }
                }

                // Force refresh canvas với delay và kiểm tra hiển thị
                setTimeout(() => {
                  canvas.renderAll();
                  console.log("🎯 [CANVAS] Force refresh canvas completed");

                  // 🎯 ENHANCED DEBUG: Kiểm tra toàn bộ trạng thái canvas
                  console.log("🎯 [CANVAS] === COMPLETE CANVAS DEBUG ===");
                  console.log("🎯 [CANVAS] Canvas size:", canvas.getWidth(), "x", canvas.getHeight());
                  console.log("🎯 [CANVAS] Canvas background color:", canvas.backgroundColor);
                  console.log("🎯 [CANVAS] Canvas background image:", canvas.backgroundImage);
                  console.log("🎯 [CANVAS] Total objects:", canvas.getObjects().length);
                  
                  // List all objects với chi tiết
                  canvas.getObjects().forEach((obj, index) => {
                    console.log(`🎯 [CANVAS] Object ${index}:`, {
                      type: obj.type || 'unknown',
                      name: obj.name || 'unnamed',
                      visible: obj.visible,
                      opacity: obj.opacity,
                      left: obj.left,
                      top: obj.top,
                      width: obj.width,
                      height: obj.height,
                      scaleX: obj.scaleX,
                      scaleY: obj.scaleY,
                      angle: obj.angle,
                      fill: obj.fill,
                      stroke: obj.stroke
                    });
                  });

                  // Check canvas element
                  const canvasElement = canvas.getElement();
                  console.log("🎯 [CANVAS] Canvas element:", {
                    width: canvasElement.width,
                    height: canvasElement.height,
                    styleWidth: canvasElement.style.width,
                    styleHeight: canvasElement.style.height,
                    display: window.getComputedStyle(canvasElement).display,
                    visibility: window.getComputedStyle(canvasElement).visibility,
                    opacity: window.getComputedStyle(canvasElement).opacity,
                    zIndex: window.getComputedStyle(canvasElement).zIndex
                  });

                  // Double check image is still there and visible
                  const objects = canvas.getObjects();
                  const backgroundImg = objects.find((obj) =>
                    obj.name?.includes("backgroundImage")
                  );
                  if (backgroundImg) {
                    console.log(
                      "🎯 [CANVAS] ✅ Background image confirmed present on canvas"
                    );
                    console.log("🎯 [CANVAS] Background image details:");
                    console.log(
                      "  - Position:",
                      backgroundImg.left,
                      ",",
                      backgroundImg.top
                    );
                    console.log(
                      "  - Scale:",
                      backgroundImg.scaleX,
                      ",",
                      backgroundImg.scaleY
                    );
                    console.log("  - Visible:", backgroundImg.visible);
                    console.log("  - Opacity:", backgroundImg.opacity);

                    // 🎯 Force another render nếu ảnh vẫn không hiển thị
                    if (backgroundImg.visible && backgroundImg.opacity > 0) {
                      try {
                        // Sử dụng canvas.bringToFront thay vì object.bringToFront
                        if (typeof canvas.bringToFront === "function") {
                          canvas.bringToFront(backgroundImg);
                          console.log("🎯 [CANVAS] Used canvas.bringToFront successfully");
                        } else if (typeof backgroundImg.bringForward === "function") {
                          backgroundImg.bringForward();
                          console.log("🎯 [CANVAS] Used bringForward successfully");
                        } else {
                          // Fallback: move to front manually
                          canvas.remove(backgroundImg);
                          canvas.add(backgroundImg);
                          console.log("🎯 [CANVAS] Manually moved to front");
                        }
                      } catch (bringError) {
                        console.warn("🎯 [CANVAS] All bring methods failed:", bringError);
                      }
                      canvas.renderAll();
                      console.log(
                        "🎯 [CANVAS] Force render completed for visible image"
                      );
                    }

                    // 🎯 EMERGENCY FALLBACK: Recreate image if still not visible
                    setTimeout(() => {
                      const canvasData = canvas.toDataURL();
                      if (canvasData === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' ||
                          canvasData.length < 1000) {
                        console.warn("🎯 [CANVAS] Canvas appears empty, trying emergency reconstruction...");
                        
                        try {
                          // Clear và recreate
                          canvas.clear();
                          canvas.backgroundColor = null;
                          
                          // Recreate the fabric image
                          const emergencyImg = new fabric.Image(img, {
                            left: 0,
                            top: 0,
                            scaleX: fabricImg.scaleX,
                            scaleY: fabricImg.scaleY,
                            selectable: false,
                            evented: false,
                            name: `emergency-backgroundImage-${imageSource}`,
                            opacity: 1,
                            visible: true,
                          });
                          
                          canvas.add(emergencyImg);
                          canvas.renderAll();
                          console.log("🎯 [CANVAS] ✅ Emergency image reconstruction completed");
                        } catch (emergencyError) {
                          console.error("🎯 [CANVAS] Emergency reconstruction failed:", emergencyError);
                        }
                      } else {
                        console.log("🎯 [CANVAS] ✅ Canvas contains image data, should be visible now");
                      }
                    }, 500);
                  } else {
                    console.error(
                      "🎯 [CANVAS] ❌ Background image missing from canvas!"
                    );

                    // 🎯 ULTIMATE FALLBACK: Try setBackgroundImage
                    console.log(
                      "🎯 [CANVAS] Trying setBackgroundImage as ultimate fallback..."
                    );
                    try {
                      if (typeof canvas.setBackgroundImage === "function") {
                        canvas.setBackgroundImage(
                          finalImageUrl,
                          canvas.renderAll.bind(canvas),
                          {
                            scaleX: canvasWidth / img.width,
                            scaleY: canvasHeight / img.height,
                          }
                        );
                        console.log(
                          "🎯 [CANVAS] ✅ setBackgroundImage fallback successful"
                        );
                      }
                    } catch (bgError) {
                      console.error(
                        "🎯 [CANVAS] setBackgroundImage fallback failed:",
                        bgError
                      );
                    }
                  }
                }, 200); // Increased delay to 200ms

                setSnackbar({
                  open: true,
                  message:
                    imageSource === "ai-generated"
                      ? "Đã tải thiết kế AI thành công!"
                      : "Đã tải background thành công!",
                  severity: "success",
                });
              } catch (error) {
                console.error(
                  "🎯 [CANVAS] ERROR creating fabric image:",
                  error
                );

                // 🎯 FALLBACK: Try using setBackgroundImage instead
                try {
                  console.log(
                    "🎯 [CANVAS] Trying setBackgroundImage fallback..."
                  );
                  if (typeof canvas.setBackgroundImage === "function") {
                    canvas.setBackgroundImage(
                      finalImageUrl,
                      canvas.renderAll.bind(canvas),
                      {
                        scaleX: canvasWidth / img.width,
                        scaleY: canvasHeight / img.height,
                      }
                    );
                    console.log(
                      "🎯 [CANVAS] ✅ Used setBackgroundImage successfully"
                    );
                  } else {
                    console.error(
                      "🎯 [CANVAS] setBackgroundImage also not available"
                    );
                  }
                } catch (bgError) {
                  console.error(
                    "🎯 [CANVAS] setBackgroundImage fallback also failed:",
                    bgError
                  );
                }
              }
            };

            img.onerror = function (error) {
              // ✅ KIỂM TRA FLAG ĐỂ TRÁNH VÒNG LẶP
              if (hasErrored) {
                console.log("Already handled error, skipping...");
                return;
              }

              hasErrored = true;
              console.error(
                `🎯 [CANVAS] ERROR loading ${imageSource} image:`,
                finalImageUrl,
                error
              );

              // Thử lại với crossOrigin nếu là AI image và chưa set
              if (imageSource === "ai-generated" && !img.crossOrigin) {
                console.log("🎯 [CANVAS] Retrying with crossOrigin=anonymous");
                hasErrored = false; // Reset flag để thử lại
                img.crossOrigin = "anonymous";
                img.src = finalImageUrl; // Load lại
                return;
              }

              console.error(`🎯 [CANVAS] Final error - creating placeholder`);

              // ✅ TẠO PLACEHOLDER THAY VÌ THỬ LẠI
              try {
                const placeholderRect = new fabric.Rect({
                  left: 0,
                  top: 0,
                  width: canvasWidth,
                  height: canvasHeight,
                  fill: "#f0f0f0",
                  selectable: false,
                  evented: false,
                  name: `placeholder-${imageSource}`,
                });

                const placeholderText = new fabric.Text(
                  imageSource === "ai-generated"
                    ? "Thiết kế AI không tải được"
                    : "Background không tải được",
                  {
                    left: canvasWidth / 2,
                    top: canvasHeight / 2,
                    fontSize: 24,
                    fill: "#999",
                    textAlign: "center",
                    originX: "center",
                    originY: "center",
                    selectable: false,
                    evented: false,
                    name: `placeholder-text-${imageSource}`,
                  }
                );

                canvas.add(placeholderRect);
                canvas.add(placeholderText);
                canvas.renderAll();

                console.log(`${imageSource.toUpperCase()} PLACEHOLDER ADDED`);
              } catch (placeholderError) {
                console.error("Error creating placeholder:", placeholderError);
              }
            };

            console.log("🎯 [CANVAS] Setting image src:", finalImageUrl);
            img.src = finalImageUrl;
          } catch (error) {
            console.error(`Error loading ${imageSource} image:`, error);

            if (hasErrored) return;
            hasErrored = true;

            // Tạo placeholder khi có lỗi
            try {
              const placeholderRect = new fabric.Rect({
                left: 0,
                top: 0,
                width: canvasWidth,
                height: canvasHeight,
                fill: "#f0f0f0",
                selectable: false,
                evented: false,
                name: `placeholder-${imageSource}`,
              });

              const placeholderText = new fabric.Text(
                imageSource === "ai-generated"
                  ? "Thiết kế AI không tải được"
                  : "Lỗi tải background từ S3",
                {
                  left: canvasWidth / 2,
                  top: canvasHeight / 2,
                  fontSize: 24,
                  fill: "#999",
                  textAlign: "center",
                  originX: "center",
                  originY: "center",
                  selectable: false,
                  evented: false,
                  name: `placeholder-text-${imageSource}`,
                }
              );

              canvas.add(placeholderRect);
              canvas.add(placeholderText);
              canvas.renderAll();

              console.log(
                `${imageSource.toUpperCase()} ERROR PLACEHOLDER ADDED`
              );
            } catch (placeholderError) {
              console.error(
                "Error creating error placeholder:",
                placeholderError
              );
            }
          }
        };

        // Gọi hàm load image
        loadImageToCanvas();
      } else {
        // Không có image hợp lệ để hiển thị
        console.warn("⚠️ [CANVAS] No valid image to display");

        if (imageSource === "no-extras") {
          // Tạo placeholder thông báo cần chờ extras API
          const placeholderRect = new fabric.Rect({
            left: 0,
            top: 0,
            width: canvasWidth,
            height: canvasHeight,
            fill: "#f8f9fa",
            stroke: "#ddd",
            strokeWidth: 2,
            selectable: false,
            evented: false,
            name: "waiting-extras-placeholder",
          });

          const placeholderText = new fabric.Text(
            "Đang xử lý ảnh background...",
            {
              left: canvasWidth / 2,
              top: canvasHeight / 2 - 20,
              fontSize: 24,
              fill: "#666",
              textAlign: "center",
              originX: "center",
              originY: "center",
              selectable: false,
              evented: false,
              name: "waiting-extras-text",
            }
          );

          const subText = new fabric.Text(
            "Vui lòng quay lại Case 5 để tạo lại background",
            {
              left: canvasWidth / 2,
              top: canvasHeight / 2 + 20,
              fontSize: 16,
              fill: "#999",
              textAlign: "center",
              originX: "center",
              originY: "center",
              selectable: false,
              evented: false,
              name: "waiting-extras-subtext",
            }
          );

          canvas.add(placeholderRect);
          canvas.add(placeholderText);
          canvas.add(subText);
          canvas.renderAll();

          console.log("🎨 [CANVAS] Waiting for extras placeholder added");
        } else {
          console.error("ERROR: No image URL available");
        }
      }

      // Canvas event handlers (giữ nguyên)
      canvas.on("selection:created", (e) => {
        const obj = e.selected && e.selected[0];
        if (obj && (obj.type === "text" || obj.type === "textbox")) {
          setSelectedText(obj);
          setTextSettings({
            fontFamily: obj.fontFamily,
            fontSize: obj.fontSize,
            fill: obj.fill,
            fontWeight: obj.fontWeight,
            fontStyle: obj.fontStyle,
            underline: obj.underline,
            text: obj.text,
          });
        }
      });

      canvas.on("selection:cleared", () => {
        setSelectedText(null);
      });

      canvas.on("selection:updated", (e) => {
        const obj = e.selected && e.selected[0];
        if (obj && (obj.type === "text" || obj.type === "textbox")) {
          setSelectedText(obj);
          setTextSettings({
            fontFamily: obj.fontFamily,
            fontSize: obj.fontSize,
            fill: obj.fill,
            fontWeight: obj.fontWeight,
            fontStyle: obj.fontStyle,
            underline: obj.underline,
            text: obj.text,
          });
        }
      });

      // Ràng buộc kéo đối tượng không vượt ra ngoài phạm vi ảnh nền
      const clampObjectWithinBackground = (obj) => {
        if (!obj) return;
        // Bỏ qua background
        if (obj.name && String(obj.name).startsWith("backgroundImage-")) {
          return;
        }

        obj.setCoords();

        // Tìm ảnh nền (ưu tiên object có name bắt đầu bằng backgroundImage-)
        const bg = canvas
          .getObjects()
          .find((o) => o.name && String(o.name).startsWith("backgroundImage-"));

        // Tính bounding cho vùng ràng buộc
        let bounds;
        if (bg) {
          bg.setCoords();
          const bgRect = bg.getBoundingRect(true, true);
          bounds = {
            left: bgRect.left,
            top: bgRect.top,
            width: bgRect.width,
            height: bgRect.height,
          };
        } else {
          // Fallback: ràng trong toàn bộ canvas nếu không có ảnh nền
          bounds = {
            left: 0,
            top: 0,
            width: canvas.getWidth(),
            height: canvas.getHeight(),
          };
        }

        const objRect = obj.getBoundingRect(true, true);

        let dx = 0;
        let dy = 0;

        // Giữ mép trái/phải trong bounds
        if (objRect.left < bounds.left) {
          dx = bounds.left - objRect.left;
        } else if (objRect.left + objRect.width > bounds.left + bounds.width) {
          dx = bounds.left + bounds.width - (objRect.left + objRect.width);
        }

        // Giữ mép trên/dưới trong bounds
        if (objRect.top < bounds.top) {
          dy = bounds.top - objRect.top;
        } else if (objRect.top + objRect.height > bounds.top + bounds.height) {
          dy = bounds.top + bounds.height - (objRect.top + objRect.height);
        }

        if (dx !== 0 || dy !== 0) {
          obj.left += dx;
          obj.top += dy;
          obj.setCoords();
          canvas.requestRenderAll();
        }
      };

      // Áp dụng khi kéo đối tượng
      canvas.on("object:moving", (e) => {
        clampObjectWithinBackground(e.target);
      });

      setFabricCanvas(canvas);
      console.log("CANVAS SET TO STATE");
    }

    return () => {
      if (fabricCanvas && currentStep !== 7) {
        console.log("CLEANUP: Disposing canvas");
        fabricCanvas.dispose();
        setFabricCanvas(null);
      }
    };
  }, [
    currentStep,
    generatedImage,
    selectedBackgroundForCanvas,
    fabricCanvas,
    pixelValueData,
    billboardType,
    currentProductType,
    productTypes,
  ]);

  // Canvas chỉ được khởi tạo cho step 7, không cần xử lý step 6 nữa
  // vì từ step 7 sẽ luôn quay về step 5

  const addText = () => {
    if (!fabricCanvas) return;

    // ✅ Scale dựa trên canvas size thay vì chỉ fontSizePixelValue
    const canvasSize = Math.max(fabricCanvas.width, fabricCanvas.height);
    const baseScaleFactor = canvasSize / 1000; // Normalize to 1000px base

    // Combine fontSizePixelValue scaling with canvas scaling
    let finalFontSize;
    if (fontSizePixelValue && fontSizePixelValue !== 256) {
      // Có fontSizePixelValue: kết hợp cả 2 scaling factors
      const fontBasedSize = fontSizePixelValue * 0.1;
      const canvasBasedSize = 20 * baseScaleFactor;
      finalFontSize = Math.max(
        fontBasedSize * baseScaleFactor,
        canvasBasedSize
      );
    } else {
      // Không có fontSizePixelValue: chỉ dùng canvas scaling
      finalFontSize = 20 * baseScaleFactor;
    }

    // Minimum và maximum constraints
    finalFontSize = Math.max(finalFontSize, 12); // Minimum 12px
    finalFontSize = Math.min(finalFontSize, canvasSize * 0.1); // Maximum 10% of canvas

    console.log(`📝 Adding text:`, {
      canvasSize,
      baseScaleFactor: baseScaleFactor.toFixed(3),
      fontSizePixelValue,
      hasScaling: fontSizePixelValue && fontSizePixelValue !== 256,
      finalFontSize: Math.round(finalFontSize),
      originalFontSize: textSettings.fontSize,
    });

    const maxWidth = fabricCanvas.width * 0.6;
    const textbox = new fabric.Textbox("Your Text Here", {
      left: fabricCanvas.width * 0.1,
      top: fabricCanvas.height * 0.1,
      fontFamily: textSettings.fontFamily,
      fontSize: Math.round(finalFontSize),
      fill: textSettings.fill,
      fontWeight: textSettings.fontWeight,
      fontStyle: textSettings.fontStyle,
      underline: textSettings.underline,
      width: maxWidth,
      name: 'user-text',
    });
    fabricCanvas.add(textbox);
    fabricCanvas.setActiveObject(textbox);
    setSelectedText(textbox);
  };

  const updateTextProperty = (property, value) => {
    if (!selectedText) return;

    selectedText.set(property, value);
    fabricCanvas.renderAll();

    setTextSettings((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  const deleteSelectedObject = () => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (!activeObject) return;

    fabricCanvas.remove(activeObject);

    // Reset selected text nếu object bị xóa là text/textbox
    if (activeObject.type === "text" || activeObject.type === "textbox") {
      setSelectedText(null);
    }

    // Log để debug
    if (activeObject.name && activeObject.name.startsWith("icon-")) {
      console.log("Deleted icon:", activeObject.name);
    }

    fabricCanvas.renderAll();
  };
  const exportDesignWithBackground = async () => {
    console.log("🎯 [EXPORT BACKGROUND] Starting export...");
    console.log("🎯 [EXPORT BACKGROUND] fabricCanvas:", !!fabricCanvas);
    console.log(
      "🎯 [EXPORT BACKGROUND] selectedBackgroundForCanvas:",
      selectedBackgroundForCanvas
    );
    console.log("🎯 [EXPORT BACKGROUND] customerDetail:", customerDetail);
    console.log(
      "🎯 [EXPORT BACKGROUND] selectedSampleProduct:",
      selectedSampleProduct
    );

    if (!fabricCanvas || !selectedBackgroundForCanvas || !customerDetail?.id) {
      setSnackbar({
        open: true,
        message: "Thiếu thông tin cần thiết để xuất thiết kế",
        severity: "error",
      });
      return;
    }

    setIsExporting(true);

    try {
      // 🎯 EXPORT VỚI KÍCH THƯỚC PIXEL GỐC
      let exportMultiplier = 1;

      if (pixelValueData && pixelValueData.width && pixelValueData.height) {
        // Tính multiplier để export về kích thước gốc
        const currentCanvasWidth = fabricCanvas.width;
        const originalWidth = pixelValueData.width;
        exportMultiplier = originalWidth / currentCanvasWidth;

        console.log(
          "🎯 [EXPORT] Canvas hiện tại:",
          currentCanvasWidth,
          "x",
          fabricCanvas.height
        );
        console.log(
          "🎯 [EXPORT] Kích thước gốc:",
          originalWidth,
          "x",
          pixelValueData.height
        );
        console.log("🎯 [EXPORT] Export multiplier:", exportMultiplier);
      }

      // 1. Export canvas với multiplier để có kích thước gốc
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: exportMultiplier, // Scale về kích thước gốc
      });

      console.log("🎯 [EXPORT] Đã export với multiplier:", exportMultiplier);

      // 2. Convert dataURL to File object
      const response = await fetch(dataURL);
      const blob = await response.blob();

      const file = new File([blob], `edited-design-${Date.now()}.png`, {
        type: "image/png",
      });

      // 3. Call API to save edited design with background
      console.log(
        "🎯 [EXPORT BACKGROUND] Saving edited design with background:",
        {
          customerDetailId: customerDetail.id,
          backgroundId: selectedBackgroundForCanvas.id,
          customerNote: customerNote || "",
          fileSize: file.size,
          selectedBackgroundForCanvas: selectedBackgroundForCanvas,
          selectedSampleProduct: selectedSampleProduct,
          backgroundObject: {
            id: selectedBackgroundForCanvas.id,
            name: selectedBackgroundForCanvas.name,
            backgroundUrl: selectedBackgroundForCanvas.backgroundUrl,
            extrasImageUrl: selectedBackgroundForCanvas.extrasImageUrl,
          },
        }
      );

      const result = await dispatch(
        createEditedDesignWithBackgroundThunk({
          customerDetailId: customerDetail.id,
          backgroundId: selectedBackgroundForCanvas.id,
          customerNote: customerNote || "Thiết kế với background",
          editedImageFile: file,
        })
      ).unwrap();

      console.log("Edited design saved successfully:", result);

      // 4. Create PDF với kích thước gốc
      let pdfCanvasWidth = fabricCanvas.width;
      let pdfCanvasHeight = fabricCanvas.height;

      // 🎯 Sử dụng kích thước gốc cho PDF nếu có
      if (pixelValueData && pixelValueData.width && pixelValueData.height) {
        pdfCanvasWidth = pixelValueData.width;
        pdfCanvasHeight = pixelValueData.height;
        console.log(
          "🎯 [PDF] Sử dụng kích thước gốc cho PDF:",
          pdfCanvasWidth,
          "x",
          pdfCanvasHeight
        );
      }

      const pdf = new jsPDF({
        orientation:
          pdfCanvasWidth > pdfCanvasHeight ? "landscape" : "portrait",
        unit: "mm",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const ratio = pdfCanvasWidth / pdfCanvasHeight;
      let imgWidth = pdfWidth - 10;
      let imgHeight = imgWidth / ratio;

      if (imgHeight > pdfHeight - 10) {
        imgHeight = pdfHeight - 10;
        imgWidth = imgHeight * ratio;
      }

      const xPos = (pdfWidth - imgWidth) / 2;
      const yPos = (pdfHeight - imgHeight) / 2;

      pdf.addImage(dataURL, "PNG", xPos, yPos, imgWidth, imgHeight);

      // 5. Generate file names with timestamp
      const timestamp = new Date().getTime();
      const imageName = `background-design-${timestamp}.png`;
      const pdfName = `background-design-${timestamp}.pdf`;

      // 6. Download files
      const imgLink = document.createElement("a");
      imgLink.download = imageName;
      imgLink.href = dataURL;
      imgLink.click();

      pdf.save(pdfName);

      // 7. Set current design for order functionality
      dispatch(setCurrentAIDesign(result));

      setSnackbar({
        open: true,
        message: "Thiết kế với background đã được xuất và lưu thành công!",
        severity: "success",
      });

      // Highlight order button
      const orderButton = document.querySelector(".order-button");
      if (orderButton) {
        orderButton.classList.add("animate-pulse");
        setTimeout(() => {
          orderButton.classList.remove("animate-pulse");
        }, 3000);
      }

      // Đánh dấu đã xuất thiết kế trong phiên hiện tại
      setHasExportedInCurrentSession(true);
    } catch (error) {
      console.error(
        "🎯 [EXPORT BACKGROUND] Error exporting background design:",
        error
      );
      console.error("🎯 [EXPORT BACKGROUND] Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
        fullError: error,
      });

      let errorMessage =
        "Lỗi khi xuất thiết kế với background. Vui lòng thử lại.";

      if (error.message && error.message.includes("mẫu thiết kế")) {
        errorMessage =
          "Không tìm thấy mẫu thiết kế đã chọn. Vui lòng chọn lại background và thử lại.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };
  const exportAIDesign = async () => {
    if (!fabricCanvas) return;

    try {
      setIsExporting(true);

      // 🎯 EXPORT VỚI KÍCH THƯỚC PIXEL GỐC
      let exportMultiplier = 1;

      if (pixelValueData && pixelValueData.width && pixelValueData.height) {
        // Tính multiplier để export về kích thước gốc
        const currentCanvasWidth = fabricCanvas.width;
        const originalWidth = pixelValueData.width;
        exportMultiplier = originalWidth / currentCanvasWidth;

        console.log(
          "🎯 [EXPORT AI] Canvas hiện tại:",
          currentCanvasWidth,
          "x",
          fabricCanvas.height
        );
        console.log(
          "🎯 [EXPORT AI] Kích thước gốc:",
          originalWidth,
          "x",
          pixelValueData.height
        );
        console.log("🎯 [EXPORT AI] Export multiplier:", exportMultiplier);
      }

      // Export canvas với multiplier để có kích thước gốc
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: exportMultiplier, // Scale về kích thước gốc
      });

      console.log("🎯 [EXPORT AI] Đã export với multiplier:", exportMultiplier);

      const blobBin = atob(dataURL.split(",")[1]);
      const array = [];
      for (let i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
      }
      const file = new Blob([new Uint8Array(array)], { type: "image/png" });
      const editedImage = new File([file], "canvas-design.png", {
        type: "image/png",
      });

      // Create PDF với kích thước gốc
      let pdfCanvasWidth = fabricCanvas.width;
      let pdfCanvasHeight = fabricCanvas.height;

      // 🎯 Sử dụng kích thước gốc cho PDF nếu có
      if (pixelValueData && pixelValueData.width && pixelValueData.height) {
        pdfCanvasWidth = pixelValueData.width;
        pdfCanvasHeight = pixelValueData.height;
        console.log(
          "🎯 [PDF AI] Sử dụng kích thước gốc cho PDF:",
          pdfCanvasWidth,
          "x",
          pdfCanvasHeight
        );
      }

      const pdf = new jsPDF({
        orientation:
          pdfCanvasWidth > pdfCanvasHeight ? "landscape" : "portrait",
        unit: "mm",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const ratio = pdfCanvasWidth / pdfCanvasHeight;
      let imgWidth = pdfWidth - 10;
      let imgHeight = imgWidth / ratio;

      if (imgHeight > pdfHeight - 10) {
        imgHeight = pdfHeight - 10;
        imgWidth = imgHeight * ratio;
      }

      const xPos = (pdfWidth - imgWidth) / 2;
      const yPos = (pdfHeight - imgHeight) / 2;

      pdf.addImage(dataURL, "PNG", xPos, yPos, imgWidth, imgHeight);

      // API call for AI design
      if (!customerDetail?.id) {
        setSnackbar({
          open: true,
          message: "Không tìm thấy thông tin khách hàng. Vui lòng thử lại.",
          severity: "error",
        });
        setIsExporting(false);
        return;
      }

      const customerDetailId = customerDetail.id;
      const designTemplateId = selectedSampleProduct;

      if (!designTemplateId) {
        setSnackbar({
          open: true,
          message: "Không tìm thấy mẫu thiết kế đã chọn. Vui lòng thử lại.",
          severity: "error",
        });
        setIsExporting(false);
        return;
      }

      const note = customerNote || "Thiết kế từ người dùng";

      console.log("Preparing to send AI request with:", {
        customerDetailId,
        designTemplateId,
        customerNote: note,
        hasEditedImage: !!editedImage,
      });

      const resultAction = await dispatch(
        createAIDesign({
          customerDetailId,
          designTemplateId,
          customerNote: note,
          editedImage,
        })
      );

      if (createAIDesign.fulfilled.match(resultAction)) {
        const response = resultAction.payload;
        console.log("AI design created successfully:", response);

        const timestamp = new Date().getTime();
        const imageName = `ai-design-${timestamp}.png`;
        const pdfName = `ai-design-${timestamp}.pdf`;

        const imgLink = document.createElement("a");
        imgLink.download = imageName;
        imgLink.href = dataURL;
        imgLink.click();

        pdf.save(pdfName);

        setSnackbar({
          open: true,
          message:
            "Thiết kế AI đã được xuất thành công dưới dạng ảnh PNG và PDF!",
          severity: "success",
        });

        const orderButton = document.querySelector(".order-button");
        if (orderButton) {
          orderButton.classList.add("animate-pulse");
          setTimeout(() => {
            orderButton.classList.remove("animate-pulse");
          }, 3000);
        }

        // Đánh dấu đã xuất thiết kế trong phiên hiện tại
        setHasExportedInCurrentSession(true);
      } else {
        console.error("Failed to create AI design:", resultAction.error);
        setSnackbar({
          open: true,
          message:
            "Có lỗi xảy ra khi lưu thiết kế. Tệp vẫn được tải xuống nhưng chưa lưu vào hệ thống.",
          severity: "warning",
        });

        const imgLink = document.createElement("a");
        imgLink.download = "ai-design.png";
        imgLink.href = dataURL;
        imgLink.click();

        pdf.save("ai-design.pdf");
      }
    } catch (error) {
      console.error("Error exporting AI design:", error);
      setSnackbar({
        open: true,
        message: "Không thể xuất thiết kế AI. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };
  const exportDesign = async () => {
    if (!fabricCanvas) {
      setSnackbar({
        open: true,
        message: "Canvas không khả dụng",
        severity: "error",
      });
      return;
    }

    // Determine current product type to decide export method
    const currentProductTypeInfo =
      productTypes.find((pt) => pt.id === billboardType) || currentProductType;
    const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

    console.log("🎯 [EXPORT] Determining export method:");
    console.log("🎯 [EXPORT] isAiGenerated:", isAiGenerated);
    console.log("🎯 [EXPORT] has generatedImage:", !!generatedImage);
    console.log(
      "🎯 [EXPORT] has selectedBackgroundForCanvas:",
      !!selectedBackgroundForCanvas
    );

    // Export logic based on product type
    if (isAiGenerated && generatedImage) {
      // AI product type with generated image
      console.log("Exporting AI generated design");
      await exportAIDesign();
    } else if (!isAiGenerated && selectedBackgroundForCanvas) {
      // Non-AI product type with background selection
      console.log("Exporting background design");
      await exportDesignWithBackground();
    } else if (generatedImage && !selectedBackgroundForCanvas) {
      // Fallback: has AI image but no background (mixed case)
      console.log("Exporting AI generated design (fallback)");
      await exportAIDesign();
    } else if (selectedBackgroundForCanvas && !generatedImage) {
      // Fallback: has background but no AI image (mixed case)
      console.log("Exporting background design (fallback)");
      await exportDesignWithBackground();
    } else {
      setSnackbar({
        open: true,
        message: "Không có thiết kế để xuất",
        severity: "warning",
      });
    }
  };
  useEffect(() => {
    if (currentStep === 5 && billboardType) {
      const currentProductTypeInfo =
        productTypes.find((pt) => pt.id === billboardType) ||
        currentProductType;
      const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

      if (isAiGenerated) {
        if (currentOrder?.id) {
          dispatch(
            fetchDesignTemplateSuggestionsByCustomerChoiceId({
              customerChoiceId: currentOrder.id,
              page: 1,
              size: 10,
            })
          );
        } else {
          console.warn(
            "No currentOrder.id available for fetching design template suggestions"
          );
        }
      } else {
        console.log("Fetching background suggestions for non-AI product type");
        if (currentOrder?.id) {
          dispatch(
            fetchBackgroundSuggestionsByCustomerChoiceId(currentOrder.id)
          );
        }
      }
    }
  }, [
    currentStep,
    billboardType,
    dispatch,
    productTypes,
    currentProductType,
    currentOrder?.id,
  ]);
  useEffect(() => {
    if (currentStep === 5) {
      const currentProductTypeInfo =
        productTypes.find((pt) => pt.id === billboardType) ||
        currentProductType;
      const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

      if (isAiGenerated) {
        setCurrentSubStep("template");
      } else {
        setCurrentSubStep("background");
        if (currentOrder?.id && backgroundSuggestions.length === 0) {
          dispatch(
            fetchBackgroundSuggestionsByCustomerChoiceId(currentOrder.id)
          );
        }
      }
    }
  }, [
    currentStep,
    billboardType,
    productTypes,
    currentProductType,
    currentOrder?.id,
    backgroundSuggestions.length,
    dispatch,
  ]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const step = params.get("step");

    if (step === "business") {
      setCurrentStep(2);
    } else if (step === "billboard") {
      const type = params.get("type");
      if (type) {
        setBillboardType(type);

        // Khôi phục currentProductType nếu có productTypes
        if (productTypes.length > 0) {
          const foundProductType = productTypes.find((pt) => pt.id === type);
          if (foundProductType) {
            setCurrentProductType(foundProductType);
            localStorage.setItem(
              "currentProductType",
              JSON.stringify(foundProductType)
            );
          }
        }

        setCurrentStep(4);

        // LOẠI BỎ phần này để tránh duplicate API calls
        // Chỉ set billboardType và currentStep, để useEffect khác xử lý việc fetch data
      } else {
        setCurrentStep(3);
      }
    }
  }, [location, productTypes]);

  useEffect(() => {
    if (currentStep === 3 && productTypeStatus === "idle") {
      // Clear state cũ trước khi fetch mới để tránh hiển thị data cũ
      dispatch(resetProductTypeStatus());
      console.log(
        "🔄 Fetching product types with isAvailable: true for step 3"
      );
      // Cập nhật cách gọi với pagination parameters và chỉ lấy product types có sẵn
      dispatch(fetchProductTypes({ page: 1, size: 10, isAvailable: true })); // Lấy 6 items mỗi trang cho phân trang
    }
  }, [currentStep, dispatch, productTypeStatus]);
  useEffect(() => {
    const restoreFormData = async () => {
      // THÊM ĐIỀU KIỆN KIỂM TRA currentOrder?.id
      if (currentStep === 4 && billboardType && currentOrder?.id) {
        try {
          // 1. Fetch customer choice details để lấy attribute values đã chọn
          const choiceDetailsResult = await dispatch(
            fetchCustomerChoiceDetails(currentOrder.id)
          ).unwrap();

          // 2. Fetch customer choice sizes để lấy sizes đã chọn
          const existingSizes = await dispatch(
            fetchCustomerChoiceSizes(currentOrder.id)
          ).unwrap();

          // 3. Fetch total amount
          await dispatch(fetchCustomerChoice(currentOrder.id)).unwrap();

          // CHỈ HIỂN thị thông báo nếu thực sự có dữ liệu để khôi phục
          const hasChoiceDetails =
            choiceDetailsResult && Object.keys(choiceDetailsResult).length > 0;
          const hasSizes = existingSizes && existingSizes.length > 0;

          if (hasChoiceDetails || hasSizes) {
            setSnackbar({
              open: true,
              message: "Đã khôi phục thông tin đã chọn",
              severity: "info",
            });
          } else {
            console.log("No existing data found to restore");
          }
        } catch (error) {
          console.error("Failed to restore form data:", error);
          // KHÔNG hiển thị lỗi nếu chỉ là do chưa có dữ liệu
          if (!error.message?.includes("not found")) {
            setSnackbar({
              open: true,
              message: "Có lỗi khi tải thông tin đã chọn",
              severity: "warning",
            });
          }
        }
      } else if (currentStep === 4 && billboardType && !currentOrder?.id) {
        console.log("Step 4 but no current order - this is a new choice");
      }
    };

    restoreFormData();
  }, [currentStep, billboardType, currentOrder?.id, dispatch]);
  useEffect(() => {
    if (currentStep === 4 && billboardType && !hasFetchedDataRef.current) {
      hasFetchedDataRef.current = true;

      // Fetch attributes for the product type
      if (attributeStatus === "idle") {
        dispatch(fetchAttributesByProductTypeId(billboardType));
      }

      // If we have a customer ID but no current order, try to fetch existing choice
      if (!currentOrder && user?.id) {
        dispatch(fetchCustomerChoices(user.id))
          .unwrap()
          .then((result) => {
            if (result) {
              console.log("Found existing customer choice:", result);

              if (result.productTypes?.id === billboardType) {
                dispatch(fetchCustomerChoiceDetails(result.id));
                dispatch(fetchCustomerChoice(result.id));
                dispatch(fetchCustomerChoiceSizes(result.id));
              }
            }
          })
          .catch((error) => {
            console.error(
              "Failed to check for existing customer choices:",
              error
            );
          });
      } else if (currentOrder?.id && !hasRestoredDataRef.current) {
        hasRestoredDataRef.current = true;

        dispatch(fetchCustomerChoiceDetails(currentOrder.id));
        dispatch(fetchCustomerChoice(currentOrder.id));
        dispatch(fetchCustomerChoiceSizes(currentOrder.id));
      }
    }

    // Reset flag khi rời khỏi step 4
    if (currentStep !== 4) {
      hasFetchedDataRef.current = false;
      hasRestoredDataRef.current = false;
    }
  }, [
    currentStep,
    billboardType,
    dispatch,
    attributeStatus,
    user?.id,
    currentOrder,
  ]);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileApi();

        if (res.success && res.data) {
          setUser(res.data);

          // After getting the user, fetch their customer detail
          if (res.data.id) {
            dispatch(fetchCustomerDetailByUserId(res.data.id));
          }
        } else {
          console.error("Profile API response missing data:", res);
          setError(
            "Không thể tải thông tin người dùng. Vui lòng đăng nhập lại."
          );
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError(
          "Có lỗi xảy ra khi tải thông tin người dùng. Vui lòng thử lại."
        );
      }
    };

    fetchProfile();
  }, [dispatch]);
  useEffect(() => {
    if (customerDetail) {
      console.log("📋 Populating businessInfo from customerDetail:", customerDetail);
      setBusinessInfo({
        companyName: customerDetail.companyName || "",
        address: customerDetail.address || "",
        contactInfo: customerDetail.contactInfo || "",
        customerDetailLogo: null, // Can't set file directly
        logoPreview: null, // Will be set via processedLogoUrl when S3 image loads
      });

      // Nếu có logoUrl, gọi fetchImageFromS3
      if (customerDetail.logoUrl) {
        console.log("🖼️ Fetching existing logo from S3:", customerDetail.logoUrl);
        dispatch(fetchImageFromS3(customerDetail.logoUrl));
      }
    }
  }, [customerDetail, dispatch]);
  const s3CustomerLogo = useSelector((state) =>
    customerDetail?.logoUrl
      ? selectS3Image(state, customerDetail.logoUrl)
      : null
  );
  useEffect(() => {
    if (s3CustomerLogo) {
      console.log("✅ S3 customer logo loaded:", s3CustomerLogo);
      setProcessedLogoUrl(s3CustomerLogo);
      
      // Cập nhật logoPreview trong businessInfo để hiển thị logo hiện tại
      setBusinessInfo((prev) => ({
        ...prev,
        logoPreview: s3CustomerLogo,
      }));
    } else if (customerDetail?.logoUrl) {
      // Fallback: Tạo URL từ API endpoint nếu không có trong state
      const apiUrl = `https://songtaoads.online/api/s3/image?key=${encodeURIComponent(
        customerDetail.logoUrl
      )}`;
      console.log("📐 Using fallback logo URL:", apiUrl);
      setProcessedLogoUrl(apiUrl);
      
      // Cập nhật logoPreview với fallback URL
      setBusinessInfo((prev) => ({
        ...prev,
        logoPreview: apiUrl,
      }));
    }
  }, [s3CustomerLogo, customerDetail?.logoUrl]);
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "customerDetailLogo" && files && files[0]) {
      // For file input
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setBusinessInfo((prev) => ({
          ...prev,
          customerDetailLogo: file,
          logoPreview: reader.result, // Store preview URL
        }));
      };

      reader.readAsDataURL(file);
    } else {
      // For text inputs
      setBusinessInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập để tiếp tục",
        severity: "error",
      });
      return;
    }

    // Validate required fields
    const requiredFields = ["companyName", "address", "contactInfo"];
    const missingFields = requiredFields.filter(
      (field) => !businessInfo[field]
    );

    if (missingFields.length > 0) {
      setSnackbar({
        open: true,
        message: `Vui lòng điền đầy đủ thông tin: ${missingFields.join(", ")}`,
        severity: "warning",
      });
      return;
    }

    const hasExistingLogo = processedLogoUrl || customerDetail?.logoUrl;
    const hasNewLogo = businessInfo.customerDetailLogo;

    if (!customerDetail && !hasNewLogo && !hasExistingLogo) {
      setSnackbar({
        open: true,
        message: "Vui lòng tải lên logo công ty",
        severity: "warning",
      });
      return;
    }

    const customerData = {
      companyName: businessInfo.companyName,
      address: businessInfo.address,
      contactInfo: businessInfo.contactInfo,
      customerDetailLogo: businessInfo.customerDetailLogo,
      userId: user.id,
    };

    try {
      let resultCustomerDetail = null;

      // KIỂM TRA CHI TIẾT: Fetch customer detail từ server để đảm bảo tính chính xác
      console.log("Checking existing customer detail for user:", user.id);

      try {
        // Luôn fetch customer detail mới nhất từ server trước khi quyết định tạo/update
        const existingCustomerDetail = await dispatch(
          fetchCustomerDetailByUserId(user.id)
        ).unwrap();

        if (existingCustomerDetail && existingCustomerDetail.id) {
          console.log(
            "Found existing customer detail, updating...",
            existingCustomerDetail.id
          );
          // Đã có customer detail → UPDATE
          resultCustomerDetail = await dispatch(
            updateCustomerDetail({
              customerDetailId: existingCustomerDetail.id,
              customerData,
            })
          ).unwrap();

          if (resultCustomerDetail.warning) {
            setSnackbar({
              open: true,
              message: `Thông tin đã được cập nhật nhưng ${resultCustomerDetail.warning}`,
              severity: "warning",
            });
          } else {
            setSnackbar({
              open: true,
              message: "Cập nhật thông tin doanh nghiệp thành công",
              severity: "success",
            });
          }
        } else {
          // Không tìm thấy customer detail → TẠO MỚI
          throw new Error("No existing customer detail found");
        }
      } catch (fetchError) {
        // Không tìm thấy customer detail hoặc lỗi fetch → TẠO MỚI
        console.log(
          "No existing customer detail found, creating new one",
          fetchError.message || fetchError
        );
        resultCustomerDetail = await dispatch(
          createCustomer(customerData)
        ).unwrap();
        console.log("Customer created successfully:", resultCustomerDetail);

        setSnackbar({
          open: true,
          message: "Tạo thông tin doanh nghiệp thành công",
          severity: "success",
        });
      }

      // Tiếp tục với logic kiểm tra customer choices
      const customerId = user.id;

      try {
        const customerChoicesResponse = await dispatch(
          fetchCustomerChoices(customerId)
        ).unwrap();

        if (
          customerChoicesResponse &&
          customerChoicesResponse.productTypes?.id
        ) {
          const existingProductTypeId = customerChoicesResponse.productTypes.id;
          console.log("Found existing product type ID:", existingProductTypeId);

          setBillboardType(existingProductTypeId);
          setCurrentStep(4);
          dispatch(fetchAttributesByProductTypeId(existingProductTypeId));
          navigate(`/ai-design?step=billboard&type=${existingProductTypeId}`);

          setSnackbar({
            open: true,
            message: "Tiếp tục với thiết kế hiện tại",
            severity: "info",
          });
        } else {
          setCurrentStep(3);
          navigate("/ai-design?step=billboard");
        }
      } catch (error) {
        console.error("Error checking for existing customer choices:", error);
        setCurrentStep(3);
        navigate("/ai-design?step=billboard");

        setSnackbar({
          open: true,
          message:
            "Không thể kiểm tra thiết kế hiện có, tiếp tục với thiết kế mới",
          severity: "warning",
        });
      }
    } catch (error) {
      console.error("Failed to save customer details. Full error:", error);

      // XỬ LÝ CỤ THỂ CÁC LOẠI LỖI
      if (
        error?.message?.includes("duplicate key") ||
        error?.message?.includes("Database Error") ||
        error?.message?.includes("409") ||
        error?.response?.status === 409
      ) {
        console.log(
          "Conflict error detected (duplicate/409), trying to fetch and update existing customer detail..."
        );

        try {
          // Thử fetch customer detail hiện có và cập nhật
          const existingCustomerDetail = await dispatch(
            fetchCustomerDetailByUserId(user.id)
          ).unwrap();

          if (existingCustomerDetail && existingCustomerDetail.id) {
            console.log(
              "Found existing customer detail after conflict error, updating:",
              existingCustomerDetail.id
            );

            // Cập nhật thay vì tạo mới
            await dispatch(
              updateCustomerDetail({
                customerDetailId: existingCustomerDetail.id,
                customerData,
              })
            ).unwrap();

            setSnackbar({
              open: true,
              message: "Đã cập nhật thông tin doanh nghiệp thành công",
              severity: "success",
            });

            // Tiếp tục với logic kiểm tra customer choices
            const customerId = user.id;
            try {
              const customerChoicesResponse = await dispatch(
                fetchCustomerChoices(customerId)
              ).unwrap();

              if (
                customerChoicesResponse &&
                customerChoicesResponse.productTypes?.id
              ) {
                const existingProductTypeId =
                  customerChoicesResponse.productTypes.id;
                console.log(
                  "Found existing product type ID:",
                  existingProductTypeId
                );

                setBillboardType(existingProductTypeId);
                setCurrentStep(4);
                dispatch(fetchAttributesByProductTypeId(existingProductTypeId));
                navigate(
                  `/ai-design?step=billboard&type=${existingProductTypeId}`
                );

                setSnackbar({
                  open: true,
                  message: "Tiếp tục với thiết kế hiện tại",
                  severity: "info",
                });
              } else {
                setCurrentStep(3);
                navigate("/ai-design?step=billboard");
              }
            } catch (choiceError) {
              console.error(
                "Error checking for existing customer choices:",
                choiceError
              );
              setCurrentStep(3);
              navigate("/ai-design?step=billboard");
            }
            return;
          }
        } catch (fetchError) {
          console.error(
            "Failed to fetch existing customer detail after conflict:",
            fetchError
          );
        }

        setSnackbar({
          open: true,
          message: "Thông tin doanh nghiệp đã tồn tại. Đã cập nhật thành công.",
          severity: "success",
        });

        // Vẫn tiếp tục flow để không làm gián đoạn trải nghiệm user
        setCurrentStep(3);
        navigate("/ai-design?step=billboard");
      } else if (error?.message?.includes("User not found")) {
        setSnackbar({
          open: true,
          message:
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
          severity: "error",
        });
      } else {
        console.log("Unknown error:", error);
        setSnackbar({
          open: true,
          message: "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.",
          severity: "error",
        });
      }
    }
  };

  const handleBillboardSubmit = async (e) => {
    e.preventDefault();

    const sizesConfirmed =
      document.querySelector("svg.text-green-500") !== null;

    if (!sizesConfirmed) {
      setError("Vui lòng xác nhận kích thước trước khi tiếp tục.");
      console.log("Sizes not confirmed, showing error");
      return;
    }

    // Lấy thông tin product type hiện tại để kiểm tra isAiGenerated
    const currentProductTypeInfo =
      productTypes.find((pt) => pt.id === billboardType) || currentProductType;
    const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

    if (isAiGenerated) {
      // Nếu là AI Generated -> hiển thị Design Templates
      setCurrentSubStep("template");
    } else {
      // Nếu không phải AI Generated -> hiển thị Background Suggestions
      setCurrentSubStep("background");
      console.log("Showing background suggestions for non-AI product");

      // Fetch background suggestions
      if (currentOrder?.id) {
        console.log(
          "Fetching background suggestions for customer choice:",
          currentOrder.id
        );
        try {
          await dispatch(
            fetchBackgroundSuggestionsByCustomerChoiceId(currentOrder.id)
          ).unwrap();
          console.log("Background suggestions fetched successfully");
        } catch (error) {
          console.error("Failed to fetch background suggestions:", error);
          setSnackbar({
            open: true,
            message: "Không thể tải đề xuất background. Vui lòng thử lại.",
            severity: "error",
          });
        }
      }
    }

    // Move to step 4.5
    setCurrentStep(5);
    navigate("/ai-design");
  };
  const handleSelectSampleProduct = (productId) => {
    setSelectedSampleProduct(productId);
  };

  const handleContinueToPreview = async () => {
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

    // Show the loading animation for AI generating images
    setIsGenerating(true);

    try {
      // Lấy pixel values trước khi generate image
      let width = 512; // default value
      let height = 512; // default value

      console.log("🎯 [PIXEL API] Bắt đầu lấy pixel values...");
      console.log("🎯 [PIXEL API] currentOrder object:", currentOrder);
      console.log("🎯 [PIXEL API] currentOrder?.id:", currentOrder?.id);
      console.log(
        "🎯 [PIXEL API] Type of currentOrder?.id:",
        typeof currentOrder?.id
      );
      console.log("🎯 [PIXEL API] pixelValueData từ Redux:", pixelValueData);
      console.log(
        "🎯 [PIXEL API] pixelValueStatus từ Redux:",
        pixelValueStatus
      );

      if (currentOrder?.id) {
        console.log(
          "🎯 [PIXEL API] Gọi fetchCustomerChoicePixelValue với customerChoiceId:",
          currentOrder.id
        );

        try {
          const pixelResult = await dispatch(
            fetchCustomerChoicePixelValue(currentOrder.id)
          ).unwrap();
          console.log("🎯 [PIXEL API] Kết quả API trả về:", pixelResult);

          if (pixelResult && pixelResult.width && pixelResult.height) {
            width = pixelResult.width;
            height = pixelResult.height;
            console.log("✅ [PIXEL API] Đã lấy được pixel values từ API:");
            console.log("✅ [PIXEL API] Width:", width, "pixels");
            console.log("✅ [PIXEL API] Height:", height, "pixels");
          } else {
            console.log(
              "⚠️ [PIXEL API] API trả về nhưng không có width/height hợp lệ"
            );
            console.log(
              "⚠️ [PIXEL API] Sử dụng giá trị mặc định: width=512, height=512"
            );
          }
        } catch (pixelApiError) {
          console.error("❌ [PIXEL API] Lỗi khi gọi API:", pixelApiError);
          console.log(
            "❌ [PIXEL API] Sử dụng giá trị mặc định: width=512, height=512"
          );
        }
      } else {
        console.log(
          "⚠️ [PIXEL API] Không có currentOrder.id, sử dụng giá trị mặc định"
        );
      }

      console.log("🎯 [PIXEL API] Giá trị cuối cùng sẽ sử dụng:");
      console.log("🎯 [PIXEL API] Final Width:", width);
      console.log("🎯 [PIXEL API] Final Height:", height);

      // Make the API call to generate image from text with pixel values
      console.log(
        "🚀 [IMAGE GENERATION] Bắt đầu gọi generateImageFromText API với:"
      );
      console.log(
        "🚀 [IMAGE GENERATION] designTemplateId:",
        selectedSampleProduct
      );
      console.log("🚀 [IMAGE GENERATION] prompt:", customerNote.trim());
      console.log("🚀 [IMAGE GENERATION] width:", width);
      console.log("🚀 [IMAGE GENERATION] height:", height);

      // Bắt đầu polling ngay khi gọi API tạo ảnh
      console.log(
        "🔄 [PROGRESS] Bắt đầu polling progress ngay khi gọi API tạo ảnh"
      );
      startProgressPolling();

      console.log(
        "🚀 [API CALL] Đang gửi request tạo ảnh AI với Stable Diffusion..."
      );
      dispatch(
        generateImageFromText({
          designTemplateId: selectedSampleProduct,
          prompt: customerNote.trim(),
          width: width,
          height: height,
        })
      )
        .unwrap()
        .then(() => {
          console.log(
            "✅ [IMAGE GENERATION] Image generation started successfully"
          );

          // Move to step 6 after successful generation start
          setCurrentStep(6);
          setIsGenerating(false);
          navigate("/ai-design");
        })
        .catch((error) => {
          console.error("❌ [IMAGE GENERATION] Error generating image:", error);

          // Dừng polling nếu API tạo ảnh thất bại
          console.log("❌ [PROGRESS] Dừng polling do API tạo ảnh thất bại");
          stopProgressPolling();

          setIsGenerating(false);
          setSnackbar({
            open: true,
            message: `Lỗi khi tạo hình ảnh: ${error || "Vui lòng thử lại sau"}`,
            severity: "error",
          });
        });
    } catch (pixelError) {
      console.error("❌ [PIXEL API] Error fetching pixel values:", pixelError);
      console.log(
        "🔄 [FALLBACK] Tiếp tục với giá trị mặc định width=512, height=512"
      );

      // Bắt đầu polling ngay cho fallback case
      console.log(
        "🔄 [PROGRESS FALLBACK] Bắt đầu polling progress cho fallback case"
      );
      startProgressPolling();

      console.log(
        "🚀 [API CALL FALLBACK] Đang gửi request tạo ảnh AI với default size..."
      );
      // Nếu không lấy được pixel values, vẫn tiếp tục với default values
      dispatch(
        generateImageFromText({
          designTemplateId: selectedSampleProduct,
          prompt: customerNote.trim(),
          width: 512,
          height: 512,
        })
      )
        .unwrap()
        .then(() => {
          console.log(
            "✅ [FALLBACK] Image generation started successfully with default values"
          );

          setCurrentStep(6);
          setIsGenerating(false);
          navigate("/ai-design");
        })
        .catch((error) => {
          console.error(
            "❌ [FALLBACK] Error generating image with default values:",
            error
          );

          // Dừng polling nếu API fallback thất bại
          console.log(
            "❌ [PROGRESS FALLBACK] Dừng polling do API fallback thất bại"
          );
          stopProgressPolling();

          setIsGenerating(false);
          setSnackbar({
            open: true,
            message: `Lỗi khi tạo hình ảnh: ${error || "Vui lòng thử lại sau"}`,
            severity: "error",
          });
        });
    }
  };

  const handleConfirm = async () => {
    console.log("AIDesign - handleConfirm được gọi");
    console.log("AIDesign - editedDesign data:", editedDesign);
    console.log("AIDesign - currentAIDesign:", currentAIDesign);
    console.log("AIDesign - currentOrder:", currentOrder);

    // Chỉ truyền ảnh nếu đã có editedDesign (đã xuất thiết kế)
    let editedImageFromResponse = null;
    if (editedDesign && editedDesign.editedImage) {
      editedImageFromResponse = editedDesign.editedImage;
      console.log(
        "AIDesign - Có ảnh đã xuất từ editedDesign:",
        editedImageFromResponse
      );
    } else {
      console.log(
        "AIDesign - Chưa có ảnh đã xuất, editedDesign:",
        editedDesign
      );
    }

    // Kiểm tra localStorage để xem có orderId từ trang Order không
    const orderIdFromStorage = localStorage.getItem("orderIdForNewOrder");
    const orderTypeFromStorage = localStorage.getItem("orderTypeForNewOrder");

    if (orderIdFromStorage && orderTypeFromStorage === "AI_DESIGN") {
      console.log(
        "AIDesign - Có orderIdFromStorage, chuyển đến step 2 của Order:",
        orderIdFromStorage
      );

      // Lưu thông tin AI Design để sử dụng trong Order page
      const aiDesignInfo = {
        isFromAIDesign: true,
        editedDesignId: currentAIDesign?.id,
        customerChoiceId: currentOrder?.id,
        orderIdFromStorage: orderIdFromStorage, // Lưu orderId để tạo order detail
      };
      localStorage.setItem("orderAIDesignInfo", JSON.stringify(aiDesignInfo));

      // Chuyển đến step 2 của trang Order với orderId trong localStorage
      navigate("/order", {
        state: {
          fromAIDesign: true,
          editedDesignId: currentAIDesign?.id,
          customerChoiceId: currentOrder?.id,
          editedDesignImage: editedImageFromResponse,
          editedDesignData: editedDesign || null,
          hasExportedDesign: !!editedDesign,
          useExistingOrder: true, // Đánh dấu sử dụng order có sẵn
          existingOrderId: orderIdFromStorage,
        },
      });
    } else {
      // Logic cũ: tạo order mới
      console.log("AIDesign - Không có orderIdFromStorage, tạo order mới");

      navigate("/order", {
        state: {
          fromAIDesign: true,
          editedDesignId: currentAIDesign?.id,
          customerChoiceId: currentOrder?.id,
          editedDesignImage: editedImageFromResponse, // Chỉ truyền nếu đã xuất
          editedDesignData: editedDesign || null,
          hasExportedDesign: !!editedDesign, // Đánh dấu đã xuất hay chưa
        },
      });
    }
  };
  useEffect(() => {
    setImageLoadError(null);
  }, [currentStep]);

  // Clear generatedImage when user selects background (not AI-generated product type)
  useEffect(() => {
    if (selectedBackgroundForCanvas && currentStep === 5) {
      const currentProductTypeInfo =
        productTypes.find((pt) => pt.id === billboardType) ||
        currentProductType;
      const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

      // If it's not AI-generated and user selects background, clear any existing AI image and sample product
      if (!isAiGenerated) {
        if (generatedImage) {
          console.log(
            "🧹 Clearing AI image because user selected background for non-AI product"
          );
          dispatch(resetImageGeneration());
        }
        if (selectedSampleProduct) {
          console.log(
            "🧹 Clearing selectedSampleProduct because user selected background for non-AI product"
          );
          setSelectedSampleProduct(null);
        }
      }
    }
  }, [
    selectedBackgroundForCanvas,
    currentStep,
    billboardType,
    productTypes,
    currentProductType,
    generatedImage,
    selectedSampleProduct,
    dispatch,
  ]);

  // Clear selectedBackgroundForCanvas when user generates AI image
  useEffect(() => {
    if (generatedImage && selectedBackgroundForCanvas) {
      const currentProductTypeInfo =
        productTypes.find((pt) => pt.id === billboardType) ||
        currentProductType;
      const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

      // If it's AI-generated and user has AI image, clear background selection
      if (isAiGenerated) {
        console.log(
          "🧹 Clearing background selection because user generated AI image"
        );
        setSelectedBackgroundForCanvas(null);
      }
    }
  }, [
    generatedImage,
    selectedBackgroundForCanvas,
    billboardType,
    productTypes,
    currentProductType,
  ]);
  useEffect(() => {
    // Khôi phục currentProductType từ localStorage nếu chưa có
    if (!currentProductType && billboardType) {
      const savedProductType = localStorage.getItem("currentProductType");
      if (savedProductType) {
        try {
          const parsedProductType = JSON.parse(savedProductType);
          // Kiểm tra xem saved product type có khớp với billboardType hiện tại không
          if (parsedProductType.id === billboardType) {
            setCurrentProductType(parsedProductType);
            console.log(
              "Restored product type from localStorage:",
              parsedProductType
            );
          } else {
            // Nếu không khớp, xóa localStorage và fetch lại từ productTypes
            localStorage.removeItem("currentProductType");
            if (productTypes.length > 0) {
              const foundProductType = productTypes.find(
                (pt) => pt.id === billboardType
              );
              if (foundProductType) {
                setCurrentProductType(foundProductType);
                localStorage.setItem(
                  "currentProductType",
                  JSON.stringify(foundProductType)
                );
              }
            }
          }
        } catch (error) {
          console.error("Error parsing saved product type:", error);
          localStorage.removeItem("currentProductType");
        }
      } else if (productTypes.length > 0 && billboardType) {
        // Nếu không có trong localStorage, tìm từ productTypes
        const foundProductType = productTypes.find(
          (pt) => pt.id === billboardType
        );
        if (foundProductType) {
          setCurrentProductType(foundProductType);
          localStorage.setItem(
            "currentProductType",
            JSON.stringify(foundProductType)
          );
        }
      }
    }
  }, [currentProductType, billboardType, productTypes]);

  // Handler for product type pagination
  const handleProductTypePageChange = (page) => {
    console.log(`🔄 Changing to page ${page} for product types`);
    dispatch(
      fetchProductTypes({
        page,
        size: 6, // Consistent với initial fetch
        isAvailable: true,
      })
    );
  };

  const handleBillboardTypeSelect = async (productTypeId) => {
    // First check if we have the customer details
    if (!user?.id) {
      console.error("No user ID found.");
      setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      // Tìm và lưu thông tin product type hiện tại
      const selectedProductType = productTypes.find(
        (pt) => pt.id === productTypeId
      );
      setCurrentProductType(selectedProductType);
      if (selectedProductType) {
        localStorage.setItem(
          "currentProductType",
          JSON.stringify(selectedProductType)
        );
      }

      // Check if user already has a customer choice for this product type
      const customerChoicesResponse = await dispatch(
        fetchCustomerChoices(user.id)
      ).unwrap();

      // CẬP NHẬT: Kiểm tra productTypes.id thay vì productTypeId
      if (
        customerChoicesResponse &&
        customerChoicesResponse.productTypes?.id === productTypeId
      ) {
        // Set the existing choice as current order
        setBillboardType(productTypeId);

        // Fetch attributes and details for the existing choice
        dispatch(fetchAttributesByProductTypeId(productTypeId));
        dispatch(fetchCustomerChoiceDetails(customerChoicesResponse.id));
        dispatch(fetchCustomerChoice(customerChoicesResponse.id));

        // Navigate to step 4
        setCurrentStep(4);
        navigate(`/ai-design?step=billboard&type=${productTypeId}`);

        // Show notification
        setSnackbar({
          open: true,
          message: "Tiếp tục với thiết kế hiện tại",
          severity: "info",
        });

        return;
      }

      // If no existing choice or different product type, create/update
      const userId = user.id;

      // Dispatch the action to link customer with product type
      await dispatch(
        linkCustomerToProductType({
          customerId: userId,
          productTypeId,
        })
      ).unwrap();

      // After successful API call, update UI and navigate
      setBillboardType(productTypeId);

      // Fetch attributes for the selected product type
      dispatch(fetchAttributesByProductTypeId(productTypeId));

      setCurrentStep(4);
      navigate(`/ai-design?step=billboard&type=${productTypeId}`);
    } catch (error) {
      console.error("Failed to link customer to product type:", error);
      // Handle error
      if (error?.message?.includes("User not found")) {
        setError(
          "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
        );
      } else if (error?.message?.includes("duplicate key")) {
        // Xử lý trường hợp duplicate key - thử fetch lại existing choice
        setSnackbar({
          open: true,
          message: "Đang tải thiết kế hiện tại...",
          severity: "info",
        });

        try {
          const existingChoice = await dispatch(
            fetchCustomerChoices(user.id)
          ).unwrap();
          if (existingChoice) {
            setBillboardType(productTypeId);
            dispatch(fetchAttributesByProductTypeId(productTypeId));
            dispatch(fetchCustomerChoiceDetails(existingChoice.id));
            dispatch(fetchCustomerChoice(existingChoice.id));
            setCurrentStep(4);
            navigate(`/ai-design?step=billboard&type=${productTypeId}`);
          }
        } catch (fetchError) {
          console.log("Error loading existing design:", fetchError);
          setError(
            "Có lỗi xảy ra khi tải thiết kế hiện tại. Vui lòng thử lại."
          );
        }
      } else {
        setError(
          error?.message ||
            "Có lỗi xảy ra khi chọn loại biển hiệu. Vui lòng thử lại."
        );
      }
    }
  };

  const handleBackToTypeSelection = () => {
    // Check if we have a customerChoiceId to delete
    if (currentOrder?.id) {
      // First try to delete the customer choice
      dispatch(deleteCustomerChoice(currentOrder.id))
        .unwrap()
        .then(() => {
          // Navigate back after successful deletion
          setBillboardType("");
          setCurrentProductType(null); // Reset current product type
          localStorage.removeItem("currentProductType"); // Xóa khỏi localStorage
          setCurrentStep(3);
          navigate("/ai-design?step=billboard");
        })
        .catch((error) => {
          console.error("Failed to delete customer choice:", error);
          // Show an error notification if the deletion fails
          setSnackbar({
            open: true,
            message: "Không thể xóa lựa chọn hiện tại. Vui lòng thử lại.",
            severity: "error",
          });
          // Navigate back anyway
          setBillboardType("");
          setCurrentProductType(null); // Reset current product type
          localStorage.removeItem("currentProductType"); // Xóa khỏi localStorage
          setCurrentStep(3);
          navigate("/ai-design?step=billboard");
        });
    } else {
      // If there's no customer choice to delete, just navigate back
      setBillboardType("");
      setCurrentProductType(null); // Reset current product type
      localStorage.removeItem("currentProductType"); // Xóa khỏi localStorage
      setCurrentStep(3);
      navigate("/ai-design?step=billboard");
    }
  };

  // Hàm bắt đầu polling tiến trình Stable Diffusion
  const startProgressPolling = () => {
    // Dừng polling hiện tại nếu có
    if (progressPollingIntervalRef.current) {
      clearInterval(progressPollingIntervalRef.current);
      progressPollingIntervalRef.current = null;
    }

    setIsPollingProgress(true);
    isPollingProgressRef.current = true;

    // Reset trạng thái live preview khi bắt đầu polling mới
    setShowingLivePreview(false);
    setLivePreviewUpdateKey(0);
    console.log("🔄 Reset showingLivePreview = false");

    // Lưu ảnh hiện tại để không bị dừng polling bởi ảnh cũ
    lastGeneratedImageRef.current = generatedImage;
    lastLivePreviewRef.current = null; // Reset live preview ref
    console.log(
      "💾 Lưu ảnh hiện tại để tránh false positive:",
      lastGeneratedImageRef.current ? "Có ảnh cũ" : "Không có ảnh cũ"
    );
    console.log("💾 Reset live preview ref để tracking ảnh mới");

    // Reset progress state trước khi bắt đầu
    dispatch(resetProgressCheck());

    let pollCount = 0;
    const maxPolls = 150; // Tăng từ 100 lên 150 (5 phút) để đảm bảo đủ thời gian

    console.log("⏳ Chờ 3 giây để đảm bảo API tạo ảnh đã được submit...");
    console.log(
      `⏰ Timeout setting: ${maxPolls} polls x 2s = ${maxPolls * 2} giây`
    );

    // Delay 3 giây đầu tiên để đảm bảo API tạo ảnh đã được submit
    setTimeout(() => {
      console.log("✅ Bắt đầu polling sau 3 giây delay");
      console.log("🎯 Polling sẽ chạy liên tục và chỉ dừng khi:");
      console.log("   1️⃣ Có generatedImage hoàn chỉnh trong Redux store");
      console.log("   2️⃣ Có lỗi thực sự (!active && !completed && !queued)");
      console.log(`   3️⃣ Timeout sau ${maxPolls * 2} giây`);
      console.log(
        "   📌 KHÔNG dừng khi có live_preview - tiếp tục polling để chờ ảnh cuối!"
      );

      // Hàm thực hiện progress check
      const performProgressCheck = async () => {
        try {
          pollCount++;
          console.log(
            `📊 Polling lần ${pollCount}/${maxPolls} - Tiếp tục kiểm tra progress...`
          );

          // Kiểm tra timeout
          if (pollCount >= maxPolls) {
            console.log(
              `⏰ Timeout sau ${maxPolls * 2} giây (${Math.round(
                (maxPolls * 2) / 60
              )} phút), dừng polling`
            );
            stopProgressPolling();
            setSnackbar({
              open: true,
              message: `Quá trình tạo ảnh mất nhiều thời gian (>${Math.round(
                (maxPolls * 2) / 60
              )} phút). Vui lòng kiểm tra lại sau.`,
              severity: "warning",
            });
            return;
          }

          const result = await dispatch(
            checkStableDiffusionProgress()
          ).unwrap();
          console.log("📊 Progress result:", result);
          console.log("🔍 Detailed field check:");
          console.log("   - active:", result.active);
          console.log("   - completed:", result.completed);
          console.log("   - queued:", result.queued);
          console.log("   - progress:", result.progress);
          console.log("🖼️ Live preview available:", !!result.live_preview);
          console.log(
            "   - live_preview length:",
            result.live_preview ? result.live_preview.length : 0
          );
          console.log(
            "🎯 Progress percentage:",
            (result.progress * 100).toFixed(4) + "%"
          );
          console.log(
            "🎯 Detailed progress:",
            (result.progress * 100).toFixed(8) + "%"
          );
          console.log("🎯 Raw progress value:", result.progress);

          // Xử lý live_preview - luôn cập nhật khi có ảnh mới
          if (result.live_preview) {
            // Kiểm tra xem live preview có thay đổi không
            const isNewLivePreview =
              lastLivePreviewRef.current !== result.live_preview;

            if (!showingLivePreview) {
              console.log(
                "🎨 Có live_preview lần đầu! Chuyển sang step 5.5 để hiển thị live preview cho user"
              );
              setShowingLivePreview(true);
              lastLivePreviewRef.current = result.live_preview;

              setSnackbar({
                open: true,
                message:
                  "🎨 Live preview đã sẵn sàng! Đang hoàn thiện ảnh cuối cùng...",
                severity: "info",
              });
            } else if (isNewLivePreview) {
              console.log(
                "🔄 Cập nhật live_preview mới! Ảnh preview đang được làm mới..."
              );
              console.log(
                "🔄 Ảnh cũ:",
                lastLivePreviewRef.current
                  ? lastLivePreviewRef.current.substring(0, 50) + "..."
                  : "Không có"
              );
              console.log(
                "🔄 Ảnh mới:",
                result.live_preview.substring(0, 50) + "..."
              );

              // Cập nhật ref để track ảnh mới
              lastLivePreviewRef.current = result.live_preview;

              // Force update key để trigger re-render component
              setLivePreviewUpdateKey((prev) => prev + 1);

              // Hiển thị thông báo cập nhật
              setSnackbar({
                open: true,
                message: "🔄 Live preview đã được cập nhật với ảnh mới!",
                severity: "info",
              });
            } else {
              console.log(
                "🔄 Live preview không thay đổi, tiếp tục polling..."
              );
            }

            // KHÔNG dừng polling - tiếp tục để chờ ảnh cuối cùng và cập nhật live preview
            console.log(
              "🔄 Tiếp tục polling để chờ ảnh cuối cùng và cập nhật live preview..."
            );
          }

          // Log trạng thái nhưng KHÔNG dừng polling khi completed (vẫn chờ ảnh cuối)
          if (result.completed && !result.active) {
            console.log(
              "✅ Progress API báo completed, tiếp tục chờ ảnh cuối cùng..."
            );
          }

          // Chỉ dừng polling khi có lỗi thực sự
          if (!result.active && !result.completed && !result.queued) {
            console.log("❌ Có lỗi trong quá trình tạo ảnh - dừng polling");
            stopProgressPolling();

            setSnackbar({
              open: true,
              message:
                "Có lỗi xảy ra trong quá trình tạo ảnh. Vui lòng thử lại.",
              severity: "error",
            });
            return;
          }

          console.log("🔄 Tiếp tục polling sau 2 giây...");
        } catch (error) {
          console.error("❌ Lỗi khi check progress:", error);
          console.log(
            "🔄 Có lỗi nhưng tiếp tục polling (có thể là lỗi tạm thời)"
          );
          // Không dừng polling ngay, có thể là lỗi tạm thời
        }
      };

      // Chạy check đầu tiên ngay lập tức
      performProgressCheck();

      // Thiết lập interval để polling mỗi 2 giây
      const intervalId = setInterval(() => {
        // Kiểm tra nếu polling vẫn đang active trước khi chạy
        if (isPollingProgressRef.current) {
          performProgressCheck();
        } else {
          console.log("🛑 isPollingProgressRef = false, dừng interval");
          clearInterval(intervalId);
        }
      }, 2000);

      progressPollingIntervalRef.current = intervalId;
      console.log("⏰ Đã thiết lập interval ID:", intervalId);

      // Tự động dừng sau thời gian quy định để tránh polling vô hạn
      setTimeout(() => {
        console.log(
          `⏰ Timeout fallback - Dừng polling sau ${maxPolls * 2} giây`
        );
        stopProgressPolling();
      }, maxPolls * 2000); // Thời gian tương ứng với maxPolls
    }, 3000); // Delay 3 giây trước khi bắt đầu polling
  };

  // Hàm dừng polling
  const stopProgressPolling = useCallback(() => {
    console.log("🛑 Dừng polling tiến trình");
    setIsPollingProgress(false);
    isPollingProgressRef.current = false;

    // Reset trạng thái live preview khi dừng polling
    setShowingLivePreview(false);
    setLivePreviewUpdateKey(0);
    console.log("🛑 Reset showingLivePreview = false khi dừng polling");

    // Reset reference để chuẩn bị cho lần polling tiếp theo
    lastGeneratedImageRef.current = null;
    lastLivePreviewRef.current = null;

    if (progressPollingIntervalRef.current) {
      clearInterval(progressPollingIntervalRef.current);
      progressPollingIntervalRef.current = null;
    }
  }, []);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (progressPollingIntervalRef.current) {
        clearInterval(progressPollingIntervalRef.current);
      }
    };
  }, []);

  // Theo dõi khi có lỗi nghiêm trọng thì dừng polling (KHÔNG dừng khi có live_preview)
  useEffect(() => {
    // CHỈ dừng polling khi có lỗi nghiêm trọng, KHÔNG dừng khi có live_preview
    if (
      stableDiffusionProgress &&
      !stableDiffusionProgress.active &&
      !stableDiffusionProgress.completed &&
      !stableDiffusionProgress.queued &&
      isPollingProgress
    ) {
      console.log("❌ API báo lỗi nghiêm trọng, dừng polling");
      stopProgressPolling();

      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra trong quá trình tạo ảnh. Vui lòng thử lại.",
        severity: "error",
      });
    }

    // Log khi có live_preview nhưng KHÔNG dừng polling
    if (stableDiffusionProgress?.live_preview && isPollingProgress) {
      console.log(
        "🎯 Có live_preview! Tiếp tục polling để chờ ảnh cuối cùng..."
      );
      console.log(
        "🖼️ Live preview length:",
        stableDiffusionProgress.live_preview.length
      );
      // KHÔNG gọi stopProgressPolling() ở đây
    }
  }, [stableDiffusionProgress, isPollingProgress, stopProgressPolling]);

  // useEffect để theo dõi khi generatedImage có giá trị mới thì dừng progress polling và chuyển sang step 6
  useEffect(() => {
    // Chỉ dừng polling nếu có ảnh mới (khác với ảnh đã lưu khi bắt đầu polling)
    if (
      generatedImage &&
      isPollingProgress &&
      generatedImage !== lastGeneratedImageRef.current
    ) {
      console.log(
        "🎉 Ảnh cuối cùng đã hoàn thành! Chuyển sang step 6 để user xem ảnh hoàn chỉnh"
      );
      console.log(
        "🖼️ Generated image URL:",
        generatedImage.substring(0, 50) + "..."
      );
      console.log(
        "🔄 Ảnh cũ:",
        lastGeneratedImageRef.current
          ? lastGeneratedImageRef.current.substring(0, 50) + "..."
          : "Không có"
      );

      // Dừng polling vì đã có ảnh cuối cùng
      stopProgressPolling();

      // Chuyển sang step 6 để hiển thị ảnh cuối cùng cho user
      setCurrentStep(6);
      setShowingLivePreview(false); // Reset state

      setSnackbar({
        open: true,
        message: "🎉 Tạo ảnh AI hoàn thành! Ảnh cuối cùng đã sẵn sàng.",
        severity: "success",
      });
    }
  }, [generatedImage, isPollingProgress, stopProgressPolling]);

  // useEffect để theo dõi sự thay đổi của live preview
  useEffect(() => {
    if (stableDiffusionProgress?.live_preview && showingLivePreview) {
      console.log(
        "🖼️ Live preview trong Redux store đã thay đổi:",
        stableDiffusionProgress.live_preview.substring(0, 50) + "..."
      );
      console.log(
        "🖼️ Progress:",
        ((stableDiffusionProgress.progress || 0) * 100).toFixed(2) + "%"
      );
      console.log("🖼️ Current update key:", livePreviewUpdateKey);
    }
  }, [
    stableDiffusionProgress?.live_preview,
    stableDiffusionProgress?.progress,
    showingLivePreview,
    livePreviewUpdateKey,
  ]);

  const steps = [
    { number: 1, label: "Bắt đầu" },
    { number: 2, label: "Thông tin doanh nghiệp" },
    { number: 3, label: "Chọn loại biển hiệu" },
    { number: 4, label: "Thông tin biển hiệu" },
    { number: 5, label: "Chọn mẫu thiết kế" },
    { number: 6, label: "Xem trước" },
    { number: 7, label: "Xác nhận đơn hàng" },
  ];

  // useEffect để track progress changes và tính delta
  useEffect(() => {
    if (stableDiffusionProgress?.progress !== undefined) {
      const currentProgress = stableDiffusionProgress.progress * 100;
      const timestamp = new Date().toISOString();

      // Tính delta từ lần cập nhật trước
      if (lastProgressUpdate !== null) {
        const delta = currentProgress - lastProgressUpdate;
        setProgressDelta(delta);
        console.log(`📊 Progress Delta: ${delta.toFixed(6)}%`);
      }

      // Update history (chỉ giữ 10 entries gần nhất)
      setProgressHistory((prev) => {
        const newEntry = {
          progress: currentProgress,
          timestamp,
          delta:
            lastProgressUpdate !== null
              ? currentProgress - lastProgressUpdate
              : 0,
        };
        const updated = [...prev, newEntry].slice(-10);
        return updated;
      });

      setLastProgressUpdate(currentProgress);

      console.log(`📈 Progress updated: ${currentProgress.toFixed(6)}%`);
      console.log(`⏰ Timestamp: ${timestamp}`);
    }
  }, [stableDiffusionProgress?.progress, lastProgressUpdate]);

  // useEffect để cuộn lên đầu trang khi chuyển step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Reset trạng thái xuất thiết kế khi chuyển step (trừ step 7)
    if (currentStep !== 7) {
      setHasExportedInCurrentSession(false);
    }
  }, [currentStep]);

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

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomePage
            onGetStarted={() => {
              setCurrentStep(2);
              navigate("/ai-design?step=business");
            }}
          />
        );

      case 2:
        return (
          <BusinessInfoForm
            businessInfo={businessInfo}
            customerError={customerError}
            customerStatus={customerStatus}
            customerDetail={customerDetail}
            processedLogoUrl={processedLogoUrl}
            onInputChange={handleInputChange}
            onSubmit={handleBusinessSubmit}
            onBack={() => {
              setCurrentStep(1);
              navigate("/ai-design");
            }}
            onLogoChange={async (event) => {
              if (event?.target?.files?.length > 0) {
                const file = event.target.files[0];
                console.log("📂 Logo file selected:", file.name);

                // Nếu đã có customerDetail, cập nhật logo ngay lập tức qua API
                if (customerDetail?.id) {
                  console.log("🔄 Updating existing customerDetail logo, ID:", customerDetail.id);
                  try {
                    setSnackbar({
                      open: true,
                      message: "Đang cập nhật logo...",
                      severity: "info",
                    });

                    // Gọi API cập nhật logo
                    const result = await dispatch(
                      updateCustomerDetail({
                        customerDetailId: customerDetail.id,
                        customerData: {
                          companyName: businessInfo.companyName,
                          address: businessInfo.address,
                          contactInfo: businessInfo.contactInfo,
                          customerDetailLogo: file, // File logo mới
                          userId: user.id,
                        },
                      })
                    ).unwrap();

                    console.log("✅ Logo update result:", result);

                    // Cập nhật preview trong state local
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setBusinessInfo((prev) => ({
                        ...prev,
                        customerDetailLogo: file,
                        logoPreview: reader.result,
                      }));
                    };
                    reader.readAsDataURL(file);

                    // Fetch lại customer detail để lấy logoUrl mới
                    if (result?.logoUrl) {
                      console.log("🖼️ Fetching new logo from S3:", result.logoUrl);
                      dispatch(fetchImageFromS3(result.logoUrl));
                    }

                    setSnackbar({
                      open: true,
                      message: "Logo đã được cập nhật thành công!",
                      severity: "success",
                    });

                    // Reset input file để cho phép chọn lại cùng file
                    event.target.value = "";
                  } catch (error) {
                    console.error("❌ Error updating logo:", error);
                    setSnackbar({
                      open: true,
                      message:
                        "Có lỗi xảy ra khi cập nhật logo. Vui lòng thử lại.",
                      severity: "error",
                    });
                    // Reset input file khi có lỗi
                    event.target.value = "";
                  }
                } else {
                  console.log("📋 No existing customerDetail, handling as new logo preview");
                  // Nếu chưa có customerDetail, chỉ xử lý preview như bình thường
                  handleInputChange(event);
                }
              } else {
                console.log("🗑️ Resetting logo");
                // Nếu là reset logo
                setBusinessInfo((prev) => ({
                  ...prev,
                  logoPreview: "",
                  customerDetailLogo: null,
                }));
                setProcessedLogoUrl("");
              }
            }}
          />
        );

      case 3:
        return (
          <ProductTypeSelection
            productTypes={productTypes}
            productTypeStatus={productTypeStatus}
            customerStatus={customerStatus}
            error={error}
            onProductTypeSelect={handleBillboardTypeSelect}
            pagination={productTypePagination}
            onPageChange={handleProductTypePageChange}
            onBack={() => {
              setCurrentStep(2);
              navigate("/ai-design?step=business");
            }}
          />
        );

      case 4:
        return (
          <BillboardInfoForm
            attributes={attributes}
            attributeStatus={attributeStatus}
            attributeError={attributeError}
            billboardType={billboardType}
            currentOrder={currentOrder}
            customerChoiceDetails={customerChoiceDetails}
            customerStatus={customerStatus}
            currentProductType={currentProductType}
            businessInfo={businessInfo}
            handleBillboardSubmit={handleBillboardSubmit}
            handleBackToTypeSelection={handleBackToTypeSelection}
            setSnackbar={setSnackbar}
            ModernBillboardForm={ModernBillboardForm}
            coreAttributesReady={coreAttributesReady}
            setCoreAttributesReady={setCoreAttributesReady}
            currentStep={currentStep}
            setFontSizePixelValue={setFontSizePixelValue}
          />
        );
      case 5:
        return (
          <TemplateBackgroundSelection
            billboardType={billboardType}
            currentProductType={currentProductType}
            currentOrder={currentOrder}
            selectedSampleProduct={selectedSampleProduct}
            selectedBackgroundId={selectedBackgroundId}
            customerNote={customerNote}
            designTemplateImageUrls={designTemplateImageUrls}
            loadingDesignTemplateUrls={loadingDesignTemplateUrls}
            backgroundPresignedUrls={backgroundPresignedUrls}
            loadingBackgroundUrls={loadingBackgroundUrls}
            backgroundRetryAttempts={backgroundRetryAttempts}
            handleSelectSampleProduct={handleSelectSampleProduct}
            setSelectedBackgroundId={setSelectedBackgroundId}
            setCustomerNote={setCustomerNote}
            fetchDesignTemplateImage={fetchDesignTemplateImage}
            fetchBackgroundPresignedUrl={fetchBackgroundPresignedUrl}
            setBackgroundRetryAttempts={setBackgroundRetryAttempts}
            setBackgroundPresignedUrls={setBackgroundPresignedUrls}
            setSelectedBackgroundForCanvas={setSelectedBackgroundForCanvas}
            setCurrentStep={setCurrentStep}
            setSnackbar={setSnackbar}
            handleContinueToPreview={handleContinueToPreview}
          />
        );
      case 6:
        return (
          <DesignPreview
            imageGenerationError={imageGenerationError}
            imageGenerationStatus={imageGenerationStatus}
            generatedImage={generatedImage}
            stableDiffusionProgress={stableDiffusionProgress}
            progressCheckStatus={progressCheckStatus}
            progressCheckError={progressCheckError}
            isPollingProgress={isPollingProgress}
            setSelectedImage={setSelectedImage}
            setSnackbar={setSnackbar}
            setCurrentStep={setCurrentStep}
            setIsConfirming={setIsConfirming}
            isConfirming={isConfirming}
            showSuccess={showSuccess}
            setShowSuccess={setShowSuccess}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
            pixelValueData={pixelValueData}
          />
        );
      case 7:
        return (
          <DesignEditor
            selectedBackgroundForCanvas={selectedBackgroundForCanvas}
            businessPresets={businessPresets}
            s3Logo={s3Logo}
            addBusinessInfoToCanvas={addBusinessInfoToCanvas}
            applyLayout1={applyLayout1}
            applyLayout2={applyLayout2}
            addText={addText}
            setShowIconPicker={setShowIconPicker}
            icons={icons}
            loadIcons={loadIcons}
            handleImageUpload={handleImageUpload}
            deleteSelectedObject={deleteSelectedObject}
            fabricCanvas={fabricCanvas}
            canvasRef={canvasRef}
            selectedText={selectedText}
            textSettings={textSettings}
            updateTextProperty={updateTextProperty}
            fonts={fonts}
            customerNote={customerNote}
            setCustomerNote={setCustomerNote}
            setCurrentStep={setCurrentStep}
            generatedImage={generatedImage}
            setFabricCanvas={setFabricCanvas}
            exportDesign={exportDesign}
            isExporting={isExporting}
            handleConfirm={handleConfirm}
            currentAIDesign={currentAIDesign}
            isOrdering={isOrdering}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
            pixelValueData={pixelValueData}
            hasExportedInCurrentSession={hasExportedInCurrentSession}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto py-8">
        <StepIndicator steps={steps} currentStep={currentStep} />
        {renderContent()}
      </div>

      {/* AI Generation Loading Backdrop - Enhanced UI */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(51, 65, 85, 0.95) 100%)",
          backdropFilter: "blur(12px)",
        }}
        open={isGenerating}
      >
        <div className="flex flex-col items-center max-w-4xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin">
                  <div
                    className="absolute inset-2 border-4 border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "1s",
                    }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaRobot className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              AI đang tạo thiết kế của bạn
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Hệ thống AI đang phân tích và tạo ra thiết kế độc đáo dựa trên yêu
              cầu của bạn. Quá trình này có thể mất vài phút để đảm bảo chất
              lượng tốt nhất.
            </p>
          </div>

          {/* Hiển thị tiến độ chi tiết - Cả khi có và không có live preview (không hiển thị ở step 6) */}
          {(stableDiffusionProgress?.progress !== undefined ||
            isPollingProgress) &&
            currentStep !== 6 && (
              <div className="w-full max-w-2xl mb-8">
                {/* Detailed Progress Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-400/30 backdrop-blur-sm shadow-2xl">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse mr-4 shadow-lg"></div>
                    <span className="text-blue-200 font-bold text-xl mr-4">
                      {stableDiffusionProgress?.live_preview
                        ? " Ảnh tạm thời"
                        : " Đang xử lý"}
                    </span>

                    {/* Large Progress Percentage */}
                    <div className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-black text-2xl tracking-wider">
                      {stableDiffusionProgress?.progress
                        ? `${(stableDiffusionProgress.progress * 100).toFixed(
                            2
                          )}%`
                        : "0.00%"}
                    </div>
                  </div>

                  {/* Enhanced Progress Bar with Multiple Indicators */}
                  <div className="mt-6 w-full max-w-lg mx-auto space-y-4">
                    {/* Main Progress Bar */}
                    <div className="relative">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-300">
                          Tiến độ chi tiết
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-blue-300 tabular-nums">
                            {stableDiffusionProgress?.progress
                              ? `${(
                                  stableDiffusionProgress.progress * 100
                                ).toFixed(3)}%`
                              : "0.000%"}
                          </span>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                        </div>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="relative w-full bg-gray-700/50 rounded-full h-4 backdrop-blur-sm border-2 border-gray-600/30 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden shadow-lg"
                          style={{
                            width: `${
                              stableDiffusionProgress?.progress
                                ? (
                                    stableDiffusionProgress.progress * 100
                                  ).toFixed(3)
                                : 0
                            }%`,
                          }}
                        >
                          {/* Animated shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-ping"
                            style={{ animationDuration: "2s" }}
                          ></div>
                        </div>

                        {/* Progress markers */}
                        <div className="absolute inset-0 flex justify-between items-center px-2">
                          {[0, 25, 50, 75, 100].map((marker) => (
                            <div
                              key={marker}
                              className={`w-0.5 h-2 rounded-full transition-colors duration-300 ${
                                (stableDiffusionProgress?.progress * 100 ||
                                  0) >= marker
                                  ? "bg-white/60"
                                  : "bg-gray-500/40"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Progress Numbers */}
                      <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                        <div className="text-xs text-gray-400 mb-1">
                          Trạng thái
                        </div>
                        <div className="text-sm font-semibold text-green-300">
                          {stableDiffusionProgress?.active
                            ? "🟢 Đang chạy"
                            : stableDiffusionProgress?.queued
                            ? "🟡 Đang chờ"
                            : stableDiffusionProgress?.completed
                            ? "✅ Hoàn thành"
                            : "⚪ Khởi tạo"}
                        </div>
                      </div>
                      <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                        <div className="text-xs text-gray-400 mb-1">
                          Tiến độ
                        </div>
                        <div className="text-sm font-semibold text-blue-300 tabular-nums">
                          {stableDiffusionProgress?.progress
                            ? (stableDiffusionProgress.progress * 100).toFixed(
                                4
                              )
                            : "0.0000"}
                          %
                        </div>
                      </div>
                      <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                        <div className="text-xs text-gray-400 mb-1">
                          Live Preview
                        </div>
                        <div className="text-sm font-semibold text-purple-300">
                          {stableDiffusionProgress?.live_preview
                            ? "📸 Có"
                            : "⏳ Chờ"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Live Preview Image (chỉ hiển thị khi có live_preview) */}
          {stableDiffusionProgress?.live_preview && (
            <div className="w-full max-w-lg mb-8">
              {/* Image Container */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm">
                  <div className="flex justify-center">
                    {/* Live preview với validation và xử lý nhiều format */}
                    {(() => {
                      let rawData = stableDiffusionProgress.live_preview;

                      // Validate dữ liệu ban đầu
                      if (!rawData || typeof rawData !== "string") {
                        console.error(
                          "❌ Invalid live_preview data:",
                          typeof rawData,
                          rawData?.length
                        );
                        return (
                          <div className="text-center">
                            <div className="w-80 h-48 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-xl border border-gray-600/30 flex flex-col items-center justify-center">
                              <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mb-4"></div>
                              <div className="text-gray-300 text-lg font-medium mb-2">
                                🔄 Đang khởi tạo preview...
                              </div>
                              <div className="w-48 bg-gray-600/30 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${(
                                      stableDiffusionProgress.progress * 100
                                    ).toFixed(1)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      let imageSrc = "";

                      // Kiểm tra xem dữ liệu đã có header data URL chưa
                      if (rawData.startsWith("data:image/")) {
                        imageSrc = rawData;
                        console.log("🖼️ Using existing data URL format");
                      } else {
                        console.log("🖼️ Raw base64 data, adding header");

                        // Clean base64 data
                        let base64Data = rawData
                          .trim()
                          .replace(/[^A-Za-z0-9+/=]/g, "");

                        // Validate base64 format
                        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
                        if (!base64Regex.test(base64Data)) {
                          console.error(
                            "❌ Invalid base64 format:",
                            base64Data.substring(0, 50)
                          );
                          return (
                            <div className="text-center">
                              <div className="w-80 h-48 bg-gradient-to-br from-orange-700/30 to-red-700/30 rounded-xl border border-orange-500/30 flex flex-col items-center justify-center">
                                <div className="text-4xl mb-3">⚠️</div>
                                <div className="text-orange-200 text-lg font-medium mb-2">
                                  Format đang được xử lý
                                </div>
                                <div className="text-xs text-orange-300 tabular-nums">
                                  Tiến độ:{" "}
                                  {(
                                    stableDiffusionProgress.progress * 100
                                  ).toFixed(3)}
                                  %
                                </div>
                                <div className="text-xs text-orange-400 mt-1 tabular-nums">
                                  Chi tiết:{" "}
                                  {(
                                    stableDiffusionProgress.progress * 100
                                  ).toFixed(6)}
                                  %
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Check minimum length
                        if (base64Data.length < 100) {
                          console.error(
                            "❌ Base64 data too short:",
                            base64Data.length
                          );
                          return (
                            <div className="text-center">
                              <div className="w-80 h-48 bg-gradient-to-br from-yellow-700/30 to-orange-700/30 rounded-xl border border-yellow-500/30 flex flex-col items-center justify-center">
                                <div className="text-4xl mb-3">📏</div>
                                <div className="text-yellow-200 text-lg font-medium mb-2">
                                  Đang tạo dữ liệu ảnh...
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Detect image format từ base64 header
                        let imageFormat = "jpeg"; // default
                        if (base64Data.startsWith("/9j")) {
                          imageFormat = "jpeg";
                        } else if (base64Data.startsWith("iVBORw0KGgo")) {
                          imageFormat = "png";
                        } else if (base64Data.startsWith("UklGR")) {
                          imageFormat = "webp";
                        }

                        imageSrc = `data:image/${imageFormat};base64,${base64Data}`;
                      }

                      console.log("🖼️ Live preview debug info:");
                      console.log(
                        "   - Original data length:",
                        rawData?.length
                      );
                      console.log(
                        "   - Final image src length:",
                        imageSrc.length
                      );
                      console.log(
                        "   - Image src start:",
                        imageSrc.substring(0, 80)
                      );
                      console.log(
                        "   - Contains data URL:",
                        imageSrc.includes("data:image/")
                      );

                      return (
                        <div className="relative">
                          <img
                            key={`live-preview-${livePreviewUpdateKey}-${
                              stableDiffusionProgress.progress || 0
                            }`}
                            src={imageSrc}
                            alt="Live Preview"
                            className="max-w-sm rounded-xl shadow-2xl border-2 border-gray-500/30 transition-all duration-300 hover:scale-105"
                            style={{
                              maxWidth: "400px",
                              maxHeight: "300px",
                              filter: "brightness(0.95) contrast(1.05)",
                            }}
                            onLoad={(event) => {
                              console.log(
                                "✅ Live preview image loaded successfully!"
                              );
                              console.log(
                                "✅ Final image dimensions:",
                                event.target.naturalWidth,
                                "x",
                                event.target.naturalHeight
                              );
                              console.log(
                                "✅ Live preview update key:",
                                livePreviewUpdateKey
                              );
                            }}
                            onError={(e) => {
                              console.error(
                                "❌ Live preview image failed to load:",
                                e
                              );
                              console.error(
                                "❌ Failed src length:",
                                e.target.src.length
                              );
                              console.error(
                                "❌ Failed src start:",
                                e.target.src.substring(0, 100)
                              );
                              console.error("❌ Image element:", e.target);

                              // Fallback: hide image and show text
                              e.target.style.display = "none";
                              if (
                                !e.target.parentNode.querySelector(
                                  ".fallback-div"
                                )
                              ) {
                                const fallbackDiv =
                                  document.createElement("div");
                                fallbackDiv.className =
                                  "fallback-div w-80 h-48 bg-gradient-to-br from-red-700/30 to-pink-700/30 rounded-xl border border-red-500/30 flex flex-col items-center justify-center";
                                fallbackDiv.innerHTML = `
                                  <div class="text-4xl mb-3">❌</div>
                                  <div class="text-red-200 text-lg font-medium mb-2">Không thể hiển thị preview</div>
                                  <div class="text-xs text-red-300 tabular-nums">Tiến độ: ${(
                                    stableDiffusionProgress.progress * 100
                                  ).toFixed(3)}%</div>
                                  <div class="text-xs text-red-400 mt-2">Đang tiếp tục xử lý...</div>
                                  <div class="text-xs text-red-500 mt-1 tabular-nums">Chi tiết: ${(
                                    stableDiffusionProgress.progress * 100
                                  ).toFixed(6)}%</div>
                                `;
                                e.target.parentNode.appendChild(fallbackDiv);
                              }
                            }}
                          />
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-gray-400 text-sm">
                      ✨ Hình ảnh cuối cùng sẽ có độ phân giải cao và chất lượng
                      tối ưu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Section */}
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gray-800/50 rounded-full border border-gray-600/30 backdrop-blur-sm mb-6">
              <div className="flex space-x-2 mr-4">
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <span className="text-gray-300 font-medium">
                {currentStep === 5
                  ? "Đang tạo thiết kế dựa trên mẫu được chọn..."
                  : "Đang phân tích yêu cầu và tạo mẫu thiết kế..."}
              </span>
            </div>
          </div>
        </div>
      </Backdrop>
      {showIconPicker && <IconPicker />}
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

export default AIDesign;
