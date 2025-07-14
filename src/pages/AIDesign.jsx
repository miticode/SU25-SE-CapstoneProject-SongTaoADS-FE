import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import "../styles/fonts.css";
import StepIndicator from "../components/StepIndicator";
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
} from "@mui/material";
import {
  FaCheck,
  FaRedo,
  FaCheckCircle,
  FaRobot,
  FaEdit,
  FaSave,
  FaTimes,
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
} from "../store/features/customer/customerSlice";
import { getProfileApi } from "../api/authService";
import {
  fetchAttributesByProductTypeId,
  fetchAttributeValuesByAttributeId,
  selectAllAttributes,
  selectAttributeError,
  selectAttributeStatus,
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
  fetchDesignTemplatesByProductTypeId,
  selectAllDesignTemplates,
  selectDesignTemplateError,
  selectDesignTemplateStatus,
} from "../store/features/designTemplate/designTemplateSlice";
import {
  createAIDesign,
  generateImageFromText,
  selectAIError,
  selectAIStatus,
  selectCurrentAIDesign,
  selectGeneratedImage,
  selectImageGenerationError,
  selectImageGenerationStatus,
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
  useEffect(() => {
    // Tạo mapping từ attributeValueId trong customerChoiceDetails về attributeId
    if (
      customerChoiceDetails &&
      Object.keys(customerChoiceDetails).length > 0 &&
      attributes.length > 0 &&
      Object.keys(attributeValuesState).length > 0
    ) {
      const newAttributePrices = {};

      // Duyệt qua tất cả customerChoiceDetails (mapped by attributeValueId)
      Object.entries(customerChoiceDetails).forEach(
        ([attributeValueId, detail]) => {
          console.log(
            `Processing attributeValueId: ${attributeValueId}`,
            detail
          );

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

      console.log("New attribute prices mapping:", newAttributePrices);
      setAttributePrices(newAttributePrices);
    } else {
      console.log("Clearing attribute prices - insufficient data");
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

  // Thêm hàm xử lý thay đổi giá trị kích thước đang chỉnh sửa
  const handleSizeEditChange = (sizeId, value) => {
    setEditedSizes((prev) => ({
      ...prev,
      [sizeId]: value,
    }));
  };

  // Thêm hàm xử lý cập nhật tất cả kích thước
  const handleUpdateAllSizes = async () => {
    try {
      // Validate các giá trị đã nhập
      let hasErrors = false;
      const newValidationErrors = {};

      for (const ptSize of productTypeSizes) {
        const sizeId = ptSize.sizes?.id; // Thêm optional chaining
        if (
          !editedSizes[sizeId] ||
          isNaN(editedSizes[sizeId]) ||
          parseFloat(editedSizes[sizeId]) <= 0
        ) {
          hasErrors = true;
          const fieldName = `size_${sizeId}`;
          newValidationErrors[
            fieldName
          ] = `Kích thước "${ptSize.sizes?.name}" phải lớn hơn 0`;
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
      console.log("Fetching customer choice sizes for restore...");
      console.log("Available productTypeSizes:", productTypeSizes);

      hasRestoredDataRef.current = true;

      dispatch(fetchCustomerChoiceSizes(currentOrder.id))
        .unwrap()
        .then((sizes) => {
          if (sizes && sizes.length > 0) {
            console.log("Found saved sizes for restore:", sizes);

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
              console.log("Updated form data with sizes:", newFormData);
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
  }, [productTypeId]);

  useEffect(() => {
    if (attributes && attributes.length > 0) {
      // Fetch attribute values cho tất cả attributes với size lớn hơn
      attributes.forEach((attr) => {
        const currentStatus = attributeValuesStatusState[attr.id];

        if (currentStatus === "idle" || currentStatus === undefined) {
          console.log(
            `📥 Fetching values for attribute: ${attr.id} (${attr.name})`
          );
          // Sử dụng size = 50 để đảm bảo lấy đủ values
          dispatch(fetchAttributeValuesByAttributeId(attr.id, 1, 50));
        }
      });
    }
  }, [attributes, dispatch, attributeValuesStatusState]);

  // Separate effect for fetching product type sizes
  useEffect(() => {
    if (productTypeId) {
      dispatch(fetchProductTypeSizesByProductTypeId(productTypeId));
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
      console.log(
        `RefreshCounter changed to ${refreshCounter}, re-fetching data`
      );

      // Fetch lại dữ liệu khi refreshCounter thay đổi
      const updatePrices = async () => {
        try {
          await dispatch(fetchCustomerChoiceDetails(currentOrder.id));
          await dispatch(fetchCustomerChoice(currentOrder.id));
          console.log("Data refreshed due to refreshCounter change");
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
    // Validate that size values are entered
    const sizeInputs = {};
    let hasErrors = false;

    // Check all size fields
    for (const ptSize of productTypeSizes) {
      const fieldName = `size_${ptSize.sizes?.id}`; // Thêm optional chaining
      const value = formData[fieldName];

      if (!value) {
        hasErrors = true;
        setSizeValidationError("Vui lòng nhập đầy đủ thông tin kích thước");
        return;
      } else {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          hasErrors = true;
          setSizeValidationError("Giá trị kích thước không hợp lệ");
          return;
        } else {
          sizeInputs[ptSize.sizes?.id] = numValue; // Thêm optional chaining
        }
      }
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
      console.log("Calling API for sizes:", sizeInputs);
      const createdSizes = {}; // Store created sizes for edit functionality

      // Thêm đoạn theo dõi số lượng size đã xử lý
      let processedSizes = 0;
      const totalSizes = Object.keys(sizeInputs).length;

      for (const [sizeId, sizeValue] of Object.entries(sizeInputs)) {
        console.log(
          `Linking size ${sizeId} with value ${sizeValue} (type: ${typeof sizeValue})`
        );
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

        console.log("Complete API response:", resultAction);
        console.log("Result payload:", result);

        // Make sure we're accessing the ID correctly
        if (result && result.id) {
          console.log("Created size with ID:", result.id);
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
      console.log("Created sizes with IDs:", createdSizes);

      // Mark sizes as confirmed
      setSizesConfirmed(true);

      if (currentOrder?.id) {
        console.log("Fetching initial prices after confirming sizes");

        // Thêm delay nhỏ để đảm bảo backend đã xử lý xong tất cả sizes
        // Thêm theo dõi thành công
        let priceFetched = false;

        // Thử lấy giá 3 lần nếu lần đầu không thành công
        const fetchPriceWithRetry = async (retryCount = 0) => {
          try {
            // Đầu tiên fetch customerChoiceDetails
            console.log(
              `Attempt ${retryCount + 1} to fetch customer choice details`
            );
            await dispatch(
              fetchCustomerChoiceDetails(currentOrder.id)
            ).unwrap();

            // Sau đó fetch totalAmount
            console.log(`Attempt ${retryCount + 1} to fetch total amount`);
            const result = await dispatch(
              fetchCustomerChoice(currentOrder.id)
            ).unwrap();
            console.log(`Total amount fetched: ${result.totalAmount}`);

            if (result.totalAmount > 0) {
              priceFetched = true;
              console.log("Price fetched successfully:", result.totalAmount);
            } else if (retryCount < 2) {
              // Nếu totalAmount vẫn là 0 và chưa thử đủ 3 lần, thử lại sau 700ms
              console.log("Total amount is still 0, retrying...");
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

                  return (
                    <Grid item key={ptSize.id} xs={6} sm={4} md={3}>
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
                        helperText={validationErrors[fieldName]}
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 },
                          startAdornment: (
                            <span className="text-gray-400 mr-1 text-xs">
                              #
                            </span>
                          ),
                          endAdornment: (
                            <span className="text-gray-500 text-xs">m</span>
                          ),
                          style: { fontSize: "0.8rem", height: "36px" },
                        }}
                        InputLabelProps={{ style: { fontSize: "0.8rem" } }}
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "4px",
                          },
                        }}
                      />
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
                    className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg flex items-center"
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
                        const attributeValues =
                          attributeValuesState[attr.id] || [];
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
                                          color: "green.600",
                                          fontWeight: "medium",
                                          flexShrink: 0,
                                          fontSize: "0.8rem",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {value.unitPrice.toLocaleString(
                                          "vi-VN"
                                        )}{" "}
                                        đ
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

                              {/* Show attribute price if available */}
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
                                  <Typography
                                    variant="caption"
                                    color="success.main"
                                    fontWeight="medium"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      bgcolor: "success.lightest",
                                      py: 0.5,
                                      px: 1,
                                      borderRadius: 1,
                                    }}
                                  >
                                    {fetchCustomerChoiceStatus === "loading" ? (
                                      <CircularProgress
                                        size={10}
                                        sx={{ mr: 0.5 }}
                                      />
                                    ) : (
                                      <FaCheckCircle
                                        size={10}
                                        className="mr-1 text-green-500"
                                      />
                                    )}
                                    Giá:{" "}
                                    <span className="font-bold ml-1">
                                      {(attributePrices[attr.id]?.subTotal !==
                                      undefined
                                        ? attributePrices[attr.id].subTotal
                                        : previousSubTotalsRef.current[
                                            attr.id
                                          ] || 0
                                      ).toLocaleString("vi-VN")}{" "}
                                      đ
                                    </span>
                                  </Typography>
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
            {/* Ghi chú thiết kế */}
            {/* <Box mt={2}>
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
                <span className="inline-block w-1 h-4 bg-green-500 mr-2 rounded"></span>
                GHI CHÚ THIẾT KẾ
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={2}
                name="designNotes"
                placeholder="Mô tả yêu cầu thiết kế chi tiết của bạn..."
                variant="outlined"
                value={formData.designNotes || ""}
                onChange={handleChange}
                size="small"
                InputProps={{
                  style: { fontSize: "0.8rem" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "4px",
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic", display: "block", mt: 0.5 }}
              >
                Chi tiết sẽ giúp AI tạo thiết kế phù hợp hơn với nhu cầu của bạn
              </Typography>
            </Box> */}
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
  const customerStatus = useSelector(selectCustomerStatus);
  const customerError = useSelector(selectCustomerError);
  const [currentStep, setCurrentStep] = useState(1);
  const [billboardType, setBillboardType] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSampleProduct, setSelectedSampleProduct] = useState(null);
  const currentOrder = useSelector(selectCurrentOrder);
  const attributes = useSelector(selectAllAttributes);
  const attributeStatus = useSelector(selectAttributeStatus);
  const attributeError = useSelector(selectAttributeError);
  const customerDetail = useSelector(selectCustomerDetail);
  const designTemplates = useSelector(selectAllDesignTemplates);
  const designTemplateStatus = useSelector(selectDesignTemplateStatus);
  const designTemplateError = useSelector(selectDesignTemplateError);
  const [customerNote, setCustomerNote] = useState("");
  const aiStatus = useSelector(selectAIStatus);
  const aiError = useSelector(selectAIError);
  const currentAIDesign = useSelector(selectCurrentAIDesign);
  const generatedImage = useSelector(selectGeneratedImage);
  const imageGenerationStatus = useSelector(selectImageGenerationStatus);
  const imageGenerationError = useSelector(selectImageGenerationError);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadImagePreview, setUploadImagePreview] = useState("");
  const [processedLogoUrl, setProcessedLogoUrl] = useState("");
  const [currentProductType, setCurrentProductType] = useState(null);
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

  const customerChoiceDetails = useSelector(selectCustomerChoiceDetails);
  const totalAmount = useSelector(selectTotalAmount);
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
  const [businessPresets, setBusinessPresets] = useState({
    logoUrl: "",
    companyName: "",
    tagLine: "",
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
  const fetchDesignTemplateImage = async (template) => {
    if (
      designTemplateImageUrls[template.id] ||
      loadingDesignTemplateUrls[template.id]
    ) {
      console.log("⏭️ Template image already loading or loaded:", template.id);
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
  };

  useEffect(() => {
    if (designTemplates && designTemplates.length > 0) {
      console.log(
        "🔄 Design templates loaded, fetching images:",
        designTemplates.length
      );
      designTemplates.forEach((template) => {
        if (template.image && !designTemplateImageUrls[template.id]) {
          console.log(
            "📥 Fetching image for template:",
            template.id,
            template.image
          );
          fetchDesignTemplateImage(template);
        } else if (!template.image) {
          console.warn("⚠️ Template missing image URL:", template.id);
        } else {
          console.log("✅ Template image already cached:", template.id);
        }
      });
    }
  }, [designTemplates, designTemplateImageUrls]);

  // ✅ THÊM cleanup useEffect
  useEffect(() => {
    return () => {
      Object.values(designTemplateImageUrls).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [designTemplateImageUrls]);
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

        try {
          const fabricImg = new fabric.Image(img, {
            left: 100,
            top: 100,
            name: `icon-${icon.id}`,
          });

          // Giới hạn kích thước icon
          const maxWidth = 100;
          const maxHeight = 100;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

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

        // Tạo placeholder cho icon
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

        const placeholderText = new fabric.Text("ICON", {
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
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddIcon}
                disabled={!selectedIcon}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedIcon
                    ? "bg-custom-primary text-white hover:bg-custom-secondary"
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
  const fetchBackgroundPresignedUrl = async (backgroundId, backgroundUrl) => {
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
        const s3Result = await getImageFromS3(backgroundUrl, controller.signal);
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
        throw fetchError;
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
      setLoadingBackgroundUrls((prev) => ({ ...prev, [backgroundId]: false }));
    }
  };
  useEffect(() => {
    if (backgroundSuggestions && backgroundSuggestions.length > 0) {
      backgroundSuggestions.forEach((background) => {
        if (
          background.backgroundUrl &&
          !backgroundPresignedUrls[background.id]
        ) {
          fetchBackgroundPresignedUrl(background.id, background.backgroundUrl);
        }
      });
    }
  }, [backgroundSuggestions, backgroundPresignedUrls]);
  useEffect(() => {
    return () => {
      // Cleanup presigned URLs khi component unmount
      Object.values(backgroundPresignedUrls).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      setBackgroundRetryAttempts({});
    };
  }, [backgroundPresignedUrls]);
  useEffect(() => {
    if (currentStep !== 5) {
      setBackgroundRetryAttempts({});
    }
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

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      const fabricImg = new fabric.Image(img, {
        left: 100,
        top: 100,
        name: "userUploadedImage",
      });

      // Giới hạn kích thước ảnh để vừa với canvas
      const canvasWidth = fabricCanvas.width;
      const canvasHeight = fabricCanvas.height;
      const maxWidth = canvasWidth / 2;
      const maxHeight = canvasHeight / 2;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

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

    let text;
    let position = { left: 50, top: 50 };

    switch (type) {
      case "companyName":
        text = new fabric.Text(content, {
          left: position.left,
          top: position.top,
          fontFamily: "Arial",
          fontSize: 32,
          fill: "#000000",
          fontWeight: "bold",
          name: "companyName",
        });
        break;

      case "address":
        text = new fabric.Text(content, {
          left: position.left,
          top: position.top + 50,
          fontFamily: "Arial",
          fontSize: 18,
          fill: "#666666",
          fontStyle: "italic",
          name: "address",
        });
        break;

      case "contactInfo":
        text = new fabric.Text(content, {
          left: position.left,
          top: position.top + 100,
          fontFamily: "Arial",
          fontSize: 16,
          fill: "#333333",
          name: "contactInfo",
        });
        break;

      case "logoUrl":
        console.log("Processing logo URL:", content);
        const logoSource = s3Logo || content;
        console.log("Using logo source:", logoSource);
        // CÁCH 1: Sử dụng HTML Image element (BỎ crossOrigin)
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = function () {
          console.log("Logo loaded successfully");
          console.log("Image dimensions:", img.width, "x", img.height);

          try {
            const fabricImg = new fabric.Image(img, {
              left: position.left,
              top: position.top + 150,
              name: "logo",
            });

            const maxWidth = 150;
            const maxHeight = 150;
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
            left: position.left,
            top: position.top + 150,
            width: 150,
            height: 100,
            fill: "#f0f0f0",
            stroke: "#ddd",
            strokeWidth: 2,
            rx: 10,
            ry: 10,
            name: "logoPlaceholder",
          });

          const placeholderText = new fabric.Text("LOGO", {
            left: position.left + 75,
            top: position.top + 200,
            fontSize: 18,
            fill: "#666",
            fontWeight: "bold",
            textAlign: "center",
            originX: "center",
            originY: "center",
            name: "logoPlaceholderText",
          });

          const urlText = new fabric.Text("Không thể tải logo", {
            left: position.left + 75,
            top: position.top + 220,
            fontSize: 10,
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
  // Điều chỉnh cài đặt canvas để có chất lượng tốt hơn
  useEffect(() => {
    if (
      currentStep === 7 &&
      canvasRef.current &&
      !fabricCanvas &&
      (generatedImage || selectedBackgroundForCanvas)
    ) {
      console.log("INITIALIZING CANVAS");

      const canvasContainer = canvasRef.current.parentElement;
      const containerWidth = canvasContainer.clientWidth;

      const canvasWidth = containerWidth;
      const canvasHeight = Math.round(containerWidth / 2);

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: "#f8f9fa",
        preserveObjectStacking: true,
      });

      // Xác định nguồn ảnh để sử dụng
      let imageUrl = null;
      let imageSource = null;

      if (generatedImage) {
        imageUrl = generatedImage;
        imageSource = "ai-generated";
        console.log("Using AI-generated image URL:", imageUrl);
      } else if (selectedBackgroundForCanvas) {
        imageSource = "background";
        console.log("Using selected background:", selectedBackgroundForCanvas);
      }

      // ✅ SỬA CHÍNH TẠI ĐÂY - Xử lý khác nhau cho AI image và background
      if (imageUrl || selectedBackgroundForCanvas) {
        console.log(`LOADING IMAGE: Loading ${imageSource} image`);

        // ✅ THÊM FLAG ĐỂ TRÁNH VÒNG LẶP VÔ HẠN
        let hasErrored = false;

        const loadImageToCanvas = async () => {
          try {
            let finalImageUrl = null;

            if (imageSource === "ai-generated") {
              // AI Generated Image - sử dụng trực tiếp URL
              finalImageUrl = imageUrl;
            } else if (imageSource === "background") {
              // Background Image - sử dụng getImageFromS3
              console.log(
                "Fetching background via getImageFromS3:",
                selectedBackgroundForCanvas.backgroundUrl
              );

              const s3Result = await getImageFromS3(
                selectedBackgroundForCanvas.backgroundUrl
              );

              if (s3Result.success) {
                finalImageUrl = s3Result.imageUrl;
                console.log("Background fetched successfully via S3 API");
              } else {
                console.error(
                  "Failed to fetch background via S3 API:",
                  s3Result.message
                );
                throw new Error(s3Result.message);
              }
            }

            if (!finalImageUrl) {
              throw new Error("No valid image URL available");
            }

            // Tạo HTML Image element
            const img = new Image();

            // ✅ CHỈ SET crossOrigin cho AI-generated images
            if (imageSource === "ai-generated") {
              img.crossOrigin = "anonymous";
            }
            // Không cần crossOrigin cho S3 blob URLs

            img.onload = function () {
              console.log(
                `${imageSource.toUpperCase()} IMAGE LOADED SUCCESSFULLY`
              );
              console.log("Image dimensions:", img.width, "x", img.height);

              try {
                const fabricImg = new fabric.Image(img, {
                  left: 0,
                  top: 0,
                  selectable: false,
                  evented: false,
                  name: `backgroundImage-${imageSource}`,
                });

                console.log("Fabric image created:", fabricImg);

                const scaleX = canvasWidth / fabricImg.width;
                const scaleY = canvasHeight / fabricImg.height;
                const scale = Math.max(scaleX, scaleY);

                fabricImg.set({
                  scaleX: scale,
                  scaleY: scale,
                  left: (canvasWidth - fabricImg.width * scale) / 2,
                  top: (canvasHeight - fabricImg.height * scale) / 2,
                });

                canvas.add(fabricImg);
                canvas.sendToBack(fabricImg);
                canvas.renderAll();

                console.log(
                  `${imageSource.toUpperCase()} IMAGE ADDED TO CANVAS SUCCESSFULLY`
                );

                setSnackbar({
                  open: true,
                  message:
                    imageSource === "ai-generated"
                      ? "Đã tải thiết kế AI thành công!"
                      : "Đã tải background thành công!",
                  severity: "success",
                });
              } catch (error) {
                console.error("ERROR creating fabric image:", error);
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
                `ERROR loading ${imageSource} image:`,
                finalImageUrl,
                error
              );

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
        console.error("ERROR: No image URL available");
      }

      // Canvas event handlers (giữ nguyên)
      canvas.on("selection:created", (e) => {
        if (e.selected[0] && e.selected[0].type === "text") {
          setSelectedText(e.selected[0]);
          setTextSettings({
            fontFamily: e.selected[0].fontFamily,
            fontSize: e.selected[0].fontSize,
            fill: e.selected[0].fill,
            fontWeight: e.selected[0].fontWeight,
            fontStyle: e.selected[0].fontStyle,
            underline: e.selected[0].underline,
            text: e.selected[0].text,
          });
        }
      });

      canvas.on("selection:cleared", () => {
        setSelectedText(null);
      });

      canvas.on("selection:updated", (e) => {
        if (e.selected[0] && e.selected[0].type === "text") {
          setSelectedText(e.selected[0]);
          setTextSettings({
            fontFamily: e.selected[0].fontFamily,
            fontSize: e.selected[0].fontSize,
            fill: e.selected[0].fill,
            fontWeight: e.selected[0].fontWeight,
            fontStyle: e.selected[0].fontStyle,
            underline: e.selected[0].underline,
            text: e.selected[0].text,
          });
        }
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
  }, [currentStep, generatedImage, selectedBackgroundForCanvas]);

  // Thêm useEffect riêng để handle khi selectedImage thay đổi trong step 6

  useEffect(() => {
    if (currentStep === 6 && fabricCanvas) {
      let imageToLoad = null;
      let imageSource = null;

      if (generatedImage) {
        imageToLoad = generatedImage;
        imageSource = "ai-generated";
        console.log(
          "GENERATED IMAGE CHANGED: Updating canvas with AI generated image:",
          generatedImage
        );
      } else if (selectedBackgroundForCanvas) {
        imageSource = "background";
        console.log(
          "BACKGROUND CHANGED: Updating canvas with selected background:",
          selectedBackgroundForCanvas
        );
      }

      if (imageToLoad || selectedBackgroundForCanvas) {
        // Xóa ảnh cũ
        const objects = fabricCanvas.getObjects();
        const oldImages = objects.filter(
          (obj) =>
            obj.name === "backgroundImage" ||
            obj.name === "backgroundImage-ai-generated" ||
            obj.name === "backgroundImage-background" ||
            obj.name === "placeholder-ai-generated" ||
            obj.name === "placeholder-background" ||
            obj.name === "placeholder-text-ai-generated" ||
            obj.name === "placeholder-text-background"
        );

        oldImages.forEach((img) => fabricCanvas.remove(img));

        // ✅ THÊM FLAG ĐỂ TRÁNH VÒNG LẶP VÔ HẠN
        let hasErrored = false;

        const updateCanvasImage = async () => {
          try {
            let finalImageUrl = null;

            if (imageSource === "ai-generated") {
              finalImageUrl = imageToLoad;
            } else if (imageSource === "background") {
              console.log(
                "Updating background via getImageFromS3:",
                selectedBackgroundForCanvas.backgroundUrl
              );

              const s3Result = await getImageFromS3(
                selectedBackgroundForCanvas.backgroundUrl
              );

              if (s3Result.success) {
                finalImageUrl = s3Result.imageUrl;
                console.log("Background updated successfully via S3 API");
              } else {
                console.error(
                  "Failed to update background via S3 API:",
                  s3Result.message
                );
                throw new Error(s3Result.message);
              }
            }

            if (!finalImageUrl) {
              throw new Error("No valid image URL available for update");
            }

            // Load ảnh mới
            const img = new Image();

            // ✅ CHỈ SET crossOrigin cho AI-generated images
            if (imageSource === "ai-generated") {
              img.crossOrigin = "anonymous";
            }

            img.onload = function () {
              console.log(
                `${imageSource.toUpperCase()} IMAGE LOADED SUCCESSFULLY`
              );

              const fabricImg = new fabric.Image(img, {
                left: 0,
                top: 0,
                selectable: false,
                evented: false,
                name: `backgroundImage-${imageSource}`,
              });

              const canvasWidth = fabricCanvas.width;
              const canvasHeight = fabricCanvas.height;

              const scaleX = canvasWidth / fabricImg.width;
              const scaleY = canvasHeight / fabricImg.height;
              const scale = Math.max(scaleX, scaleY);

              fabricImg.set({
                scaleX: scale,
                scaleY: scale,
                left: (canvasWidth - fabricImg.width * scale) / 2,
                top: (canvasHeight - fabricImg.height * scale) / 2,
              });

              fabricCanvas.add(fabricImg);
              fabricCanvas.sendToBack(fabricImg);
              fabricCanvas.renderAll();

              console.log(
                `${imageSource.toUpperCase()} IMAGE UPDATED IN CANVAS`
              );
            };

            img.onerror = function (error) {
              // ✅ KIỂM TRA FLAG ĐỂ TRÁNH VÒNG LẶP
              if (hasErrored) {
                console.log(
                  "Already handled error in image update, skipping..."
                );
                return;
              }

              hasErrored = true;
              console.error(`ERROR updating ${imageSource} image:`, error);

              setSnackbar({
                open: true,
                message: `Lỗi khi cập nhật ${
                  imageSource === "ai-generated" ? "thiết kế" : "background"
                }`,
                severity: "warning",
              });
            };

            img.src = finalImageUrl;
          } catch (error) {
            console.error(`Error updating ${imageSource} image:`, error);

            if (hasErrored) return;
            hasErrored = true;

            setSnackbar({
              open: true,
              message: `Lỗi khi cập nhật ${
                imageSource === "ai-generated" ? "thiết kế" : "background"
              }: ${error.message}`,
              severity: "warning",
            });
          }
        };

        updateCanvasImage();
      }
    }
  }, [generatedImage, selectedBackgroundForCanvas, fabricCanvas, currentStep]);
  const addText = () => {
    if (!fabricCanvas) return;

    const text = new fabric.Text("Your Text Here", {
      left: 100,
      top: 100,
      fontFamily: textSettings.fontFamily,
      fontSize: textSettings.fontSize,
      fill: textSettings.fill,
      fontWeight: textSettings.fontWeight,
      fontStyle: textSettings.fontStyle,
      underline: textSettings.underline,
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    setSelectedText(text);
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

    // Reset selected text nếu object bị xóa là text
    if (activeObject.type === "text") {
      setSelectedText(null);
    }

    // Log để debug
    if (activeObject.name && activeObject.name.startsWith("icon-")) {
      console.log("Deleted icon:", activeObject.name);
    }

    fabricCanvas.renderAll();
  };
  const exportDesignWithBackground = async () => {
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
      // 1. Export canvas to high quality PNG
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2, // Higher quality
      });

      // 2. Convert dataURL to File object
      const response = await fetch(dataURL);
      const blob = await response.blob();

      const file = new File([blob], `edited-design-${Date.now()}.png`, {
        type: "image/png",
      });

      // 3. Call API to save edited design with background
      console.log("Saving edited design with background:", {
        customerDetailId: customerDetail.id,
        backgroundId: selectedBackgroundForCanvas.id,
        customerNote: customerNote || "",
        fileSize: file.size,
      });

      const result = await dispatch(
        createEditedDesignWithBackgroundThunk({
          customerDetailId: customerDetail.id,
          backgroundId: selectedBackgroundForCanvas.id,
          customerNote: customerNote || "Thiết kế với background",
          editedImageFile: file,
        })
      ).unwrap();

      console.log("Edited design saved successfully:", result);

      // 4. Create PDF
      const canvasWidth = fabricCanvas.width;
      const canvasHeight = fabricCanvas.height;

      const pdf = new jsPDF({
        orientation: canvasWidth > canvasHeight ? "landscape" : "portrait",
        unit: "mm",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const ratio = canvasWidth / canvasHeight;
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
    } catch (error) {
      console.error("Error exporting background design:", error);
      setSnackbar({
        open: true,
        message:
          error.message ||
          "Lỗi khi xuất thiết kế với background. Vui lòng thử lại.",
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

      // Export logic cho AI design (giữ nguyên logic cũ)
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });

      const blobBin = atob(dataURL.split(",")[1]);
      const array = [];
      for (let i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
      }
      const file = new Blob([new Uint8Array(array)], { type: "image/png" });
      const editedImage = new File([file], "canvas-design.png", {
        type: "image/png",
      });

      // Create PDF
      const canvasWidth = fabricCanvas.width;
      const canvasHeight = fabricCanvas.height;

      const pdf = new jsPDF({
        orientation: canvasWidth > canvasHeight ? "landscape" : "portrait",
        unit: "mm",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const ratio = canvasWidth / canvasHeight;
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

    // Kiểm tra loại thiết kế dựa trên nguồn gốc
    if (generatedImage) {
      // Đây là AI generated design - sử dụng logic cũ
      console.log("Exporting AI generated design");
      await exportAIDesign();
    } else if (selectedBackgroundForCanvas) {
      // Đây là background design - sử dụng logic mới
      console.log("Exporting background design");
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

      console.log("Step 5 - isAiGenerated:", isAiGenerated);
      if (isAiGenerated) {
        console.log(
          "Fetching design templates for AI product type:",
          billboardType
        );
        dispatch(fetchDesignTemplatesByProductTypeId(billboardType));
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
      // Cập nhật cách gọi với pagination parameters
      dispatch(fetchProductTypes({ page: 1, size: 20 })); // Lấy 20 items để hiển thị đủ product types
    }
  }, [currentStep, dispatch, productTypeStatus]);
  useEffect(() => {
    const restoreFormData = async () => {
      // THÊM ĐIỀU KIỆN KIỂM TRA currentOrder?.id
      if (currentStep === 4 && billboardType && currentOrder?.id) {
        console.log("Restoring form data for step 4");
        console.log("Current order ID:", currentOrder.id);

        try {
          // 1. Fetch customer choice details để lấy attribute values đã chọn
          const choiceDetailsResult = await dispatch(
            fetchCustomerChoiceDetails(currentOrder.id)
          ).unwrap();
          console.log("Choice details fetched:", choiceDetailsResult);

          // 2. Fetch customer choice sizes để lấy sizes đã chọn
          const existingSizes = await dispatch(
            fetchCustomerChoiceSizes(currentOrder.id)
          ).unwrap();
          console.log("Existing sizes fetched:", existingSizes);

          // 3. Fetch total amount
          const choiceResult = await dispatch(
            fetchCustomerChoice(currentOrder.id)
          ).unwrap();
          console.log("Choice result fetched:", choiceResult);

          console.log("Form data restored successfully");

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
        console.log("Restoring data for existing order:", currentOrder.id);

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
  }, [currentStep, billboardType, dispatch, attributeStatus, user?.id]);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileApi();
        console.log("Profile API Response:", res);
        if (res.success && res.data) {
          console.log("User data from API:", res.data);
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
      setBusinessInfo({
        companyName: customerDetail.companyName || "",
        address: customerDetail.address || "",
        contactInfo: customerDetail.contactInfo || "",
        customerDetailLogo: null, // Can't set file directly
        logoPreview: null, // Không đặt logoPreview ở đây nữa
      });

      // Nếu có logoUrl, gọi fetchImageFromS3
      if (customerDetail.logoUrl) {
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
      setProcessedLogoUrl(s3CustomerLogo);
      console.log("Processed S3 logo URL:", s3CustomerLogo);
    } else if (customerDetail?.logoUrl) {
      // Fallback: Tạo URL từ API endpoint nếu không có trong state
      const apiUrl = `https://songtaoads.online/api/s3/image?key=${encodeURIComponent(
        customerDetail.logoUrl
      )}`;
      setProcessedLogoUrl(apiUrl);
      console.log("Fallback logo URL:", apiUrl);
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

    console.log("Customer data to be sent:", customerData);

    try {
      let resultCustomerDetail = null;

      // KIỂM TRA customerDetail từ Redux state trước
      if (customerDetail) {
        console.log("Updating existing customer detail:", customerDetail.id);
        resultCustomerDetail = await dispatch(
          updateCustomerDetail({
            customerDetailId: customerDetail.id,
            customerData,
          })
        ).unwrap();

        console.log(
          "Customer detail updated successfully:",
          resultCustomerDetail
        );

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
        // Nếu chưa có customerDetail, kiểm tra từ API trước khi tạo mới
        console.log("Checking for existing customer detail via API...");

        try {
          const existingCustomerDetail = await dispatch(
            fetchCustomerDetailByUserId(user.id)
          ).unwrap();

          if (existingCustomerDetail && existingCustomerDetail.id) {
            console.log(
              "Found existing customer detail, updating instead:",
              existingCustomerDetail.id
            );

            resultCustomerDetail = await dispatch(
              updateCustomerDetail({
                customerDetailId: existingCustomerDetail.id,
                customerData,
              })
            ).unwrap();

            setSnackbar({
              open: true,
              message: "Cập nhật thông tin doanh nghiệp thành công",
              severity: "success",
            });
          }
        } catch (fetchError) {
          // Nếu không tìm thấy customer detail existing, tạo mới
          if (fetchError?.message?.includes("not found")) {
            console.log("No existing customer detail found, creating new one");

            resultCustomerDetail = await dispatch(
              createCustomer(customerData)
            ).unwrap();
            console.log("Customer created successfully:", resultCustomerDetail);

            setSnackbar({
              open: true,
              message: "Tạo thông tin doanh nghiệp thành công",
              severity: "success",
            });
          } else {
            throw fetchError; // Re-throw other errors
          }
        }
      }

      // Tiếp tục với logic kiểm tra customer choices
      const customerId = user.id;

      try {
        const customerChoicesResponse = await dispatch(
          fetchCustomerChoices(customerId)
        ).unwrap();

        console.log("Customer choices response:", customerChoicesResponse);

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
          console.log("No existing customer choice found, moving to step 3");
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
        error?.message?.includes("Database Error")
      ) {
        console.log(
          "Duplicate key error detected, trying to fetch existing customer detail..."
        );

        try {
          // Thử fetch customer detail hiện có
          const existingCustomerDetail = await dispatch(
            fetchCustomerDetailByUserId(user.id)
          ).unwrap();

          if (existingCustomerDetail) {
            console.log(
              "Found existing customer detail after duplicate error:",
              existingCustomerDetail
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

            // Tiếp tục với flow bình thường
            setCurrentStep(3);
            navigate("/ai-design?step=billboard");
            return;
          }
        } catch (fetchError) {
          console.error(
            "Failed to fetch existing customer detail:",
            fetchError
          );
        }

        setSnackbar({
          open: true,
          message: "Thông tin doanh nghiệp đã tồn tại. Vui lòng kiểm tra lại.",
          severity: "warning",
        });
      } else if (error?.message?.includes("User not found")) {
        setSnackbar({
          open: true,
          message:
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
          severity: "error",
        });
      } else {
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
    console.log("Billboard form submitted");

    const sizesConfirmed =
      document.querySelector("svg.text-green-500") !== null;

    if (!sizesConfirmed) {
      setError("Vui lòng xác nhận kích thước trước khi tiếp tục.");
      console.log("Sizes not confirmed, showing error");
      return;
    }

    console.log("Sizes confirmed, proceeding to step 5");

    // Lấy thông tin product type hiện tại để kiểm tra isAiGenerated
    const currentProductTypeInfo =
      productTypes.find((pt) => pt.id === billboardType) || currentProductType;
    const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

    console.log("Product type isAiGenerated:", isAiGenerated);

    if (isAiGenerated) {
      // Nếu là AI Generated -> hiển thị Design Templates
      setCurrentSubStep("template");
      console.log("Showing design templates for AI generated product");
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
  const handleContinueToPreview = () => {
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

    // Make the API call to generate image from text
    dispatch(
      generateImageFromText({
        designTemplateId: selectedSampleProduct,
        prompt: customerNote.trim(),
      })
    )
      .unwrap()
      .then(() => {
        console.log("Image generation started successfully");
        // Move to step 7 after successful generation start
        setCurrentStep(6);
        setIsGenerating(false);
        navigate("/ai-design");
      })
      .catch((error) => {
        console.error("Error generating image:", error);
        setIsGenerating(false);
        setSnackbar({
          open: true,
          message: `Lỗi khi tạo hình ảnh: ${error || "Vui lòng thử lại sau"}`,
          severity: "error",
        });
      });
  };

  const handleRegenerate = () => {
    setCurrentStep(3); // Quay lại bước chọn loại biển hiệu
    navigate("/ai-design?step=billboard");
  };

  const handleConfirm = async () => {
    if (!user?.id) {
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập để tạo đơn hàng",
        severity: "error",
      });
      return;
    }

    try {
      // Kiểm tra currentAIDesign đã được tạo chưa (từ hàm exportDesign)
      if (!currentAIDesign?.id) {
        setSnackbar({
          open: true,
          message: "Vui lòng xuất và lưu thiết kế trước khi đặt hàng",
          severity: "warning",
        });
        return;
      }

      // Lấy customerChoiceId từ currentOrder
      const customerChoiceId = currentOrder?.id;
      if (!customerChoiceId) {
        setSnackbar({
          open: true,
          message: "Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.",
          severity: "error",
        });
        return;
      }

      // Lấy aiDesignId từ currentAIDesign
      const aiDesignId = currentAIDesign.id;

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        totalAmount: totalAmount,
        note: customerNote || "Đơn hàng thiết kế AI",
        isCustomDesign: true,
        histories: [`Đơn hàng được tạo lúc ${new Date().toLocaleString()}`],
        userId: user.id,
      };

      // Use local loading state instead of global
      setIsOrdering(true);

      // Gọi API createAiOrder
      const resultAction = await dispatch(
        createAiOrder({
          aiDesignId,
          customerChoiceId,
          orderData,
        })
      );

      // Turn off loading
      setIsOrdering(false);

      // Kiểm tra kết quả
      if (createAiOrder.fulfilled.match(resultAction)) {
        // Thành công
        setSnackbar({
          open: true,
          message: "Đơn hàng đã được tạo thành công!",
          severity: "success",
        });

        // Hiển thị thông báo thành công
        setShowSuccess(true);

        // Sau 3 giây sẽ đóng popup và chuyển về trang chủ
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/");
        }, 3000);
      } else {
        // Thất bại
        setSnackbar({
          open: true,
          message:
            resultAction.error?.message || "Có lỗi xảy ra khi tạo đơn hàng",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setIsOrdering(false);
      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra khi tạo đơn hàng",
        severity: "error",
      });
    }
  };
  useEffect(() => {
    setImageLoadError(null);
  }, [currentStep]);
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

      console.log("Selected product type:", selectedProductType);

      // Check if user already has a customer choice for this product type
      const customerChoicesResponse = await dispatch(
        fetchCustomerChoices(user.id)
      ).unwrap();

      // CẬP NHẬT: Kiểm tra productTypes.id thay vì productTypeId
      if (
        customerChoicesResponse &&
        customerChoicesResponse.productTypes?.id === productTypeId
      ) {
        console.log(
          "User already has a customer choice for this product type:",
          customerChoicesResponse
        );

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
      console.log(`Linking user ${userId} to product type ${productTypeId}`);

      // Dispatch the action to link customer with product type
      const resultAction = await dispatch(
        linkCustomerToProductType({
          customerId: userId,
          productTypeId,
        })
      ).unwrap();

      console.log("Customer linked to product type:", resultAction);

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
          console.log(
            `Successfully deleted customer choice ${currentOrder.id}`
          );
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

  const handleStepClick = (step) => {
    if (step < currentStep) {
      switch (step) {
        case 1:
          setCurrentStep(1);
          navigate("/ai-design");
          break;
        case 2:
          setCurrentStep(2);
          navigate("/ai-design?step=business");
          break;
        case 3:
          setCurrentStep(3);
          navigate("/ai-design?step=billboard");
          break;
        default:
          break;
      }
    }
  };

  const steps = [
    { number: 1, label: "Bắt đầu" },
    { number: 2, label: "Thông tin doanh nghiệp" },
    { number: 3, label: "Chọn loại biển hiệu" },
    { number: 4, label: "Thông tin biển hiệu" },
    { number: 5, label: "Chọn mẫu thiết kế" },
    { number: 6, label: "Xem trước" },
    { number: 7, label: "Xác nhận đơn hàng" },
  ];

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
            className="relative flex items-center justify-center bg-gradient-to-br from-gray-50 to-white overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-custom-primary/10 to-custom-secondary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-custom-secondary/5 to-custom-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* AI Icon */}
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-8 shadow-2xl"
                variants={itemVariants}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <FaRobot className="w-10 h-10 text-white" />
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
                variants={itemVariants}
              >
                <span className="bg-clip-text  bg-gradient-to-r from-custom-primary via-custom-secondary to-custom-primary bg-size-200 animate-gradient">
                  Thiết kế quảng cáo
                </span>
                <br />
                <span className="text-gray-800">với sức mạnh AI</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed"
                variants={itemVariants}
              >
                Tạo ra những biển hiệu{" "}
                <span className="text-custom-primary font-semibold">
                  đẹp mắt
                </span>
                ,{" "}
                <span className="text-custom-secondary font-semibold">
                  chuyên nghiệp
                </span>{" "}
                chỉ trong{" "}
                <span className="text-custom-primary font-semibold">
                  vài phút
                </span>{" "}
                với công nghệ AI tiên tiến
              </motion.p>

              {/* Features Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
                variants={containerVariants}
              >
                <motion.div
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Nhanh chóng
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Thiết kế hoàn thành trong vài phút
                  </p>
                </motion.div>

                <motion.div
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Thông minh
                  </h3>
                  <p className="text-gray-600 text-sm">
                    AI hiểu được ý tưởng của bạn
                  </p>
                </motion.div>

                <motion.div
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Chuyên nghiệp
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Chất lượng thiết kế cao cấp
                  </p>
                </motion.div>
              </motion.div>

              {/* CTA Section */}
              <motion.div className="space-y-6" variants={itemVariants}>
                <motion.button
                  onClick={() => {
                    setCurrentStep(2);
                    navigate("/ai-design?step=business");
                  }}
                  className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white bg-black rounded-2xl shadow-2xl hover:shadow-custom-primary/25 transition-all duration-300 overflow-hidden"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-custom-secondary to-custom-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    Bắt đầu thiết kế ngay
                    <svg
                      className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300"
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
                  </span>
                </motion.button>

                <motion.p
                  className="text-sm text-gray-500"
                  variants={itemVariants}
                >
                  ✨ Miễn phí tạo và xem trước thiết kế
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        );

      case 2:
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
                Cung cấp thông tin để AI có thể tạo ra thiết kế phù hợp với
                thương hiệu của bạn
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
              onSubmit={handleBusinessSubmit}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
              variants={containerVariants}
            >
              <div className="p-8 md:p-10 space-y-8">
                {/* Company Name */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="companyName"
                    className="flex items-center text-sm font-semibold text-gray-700 mb-3"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Tên công ty
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={businessInfo.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="VD: Công ty TNHH ABC"
                      required
                    />
                    <svg
                      className="absolute left-4 top-4 w-5 h-5 text-gray-400"
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
                </motion.div>

                {/* Address */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="address"
                    className="flex items-center text-sm font-semibold text-gray-700 mb-3"
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    Địa chỉ
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={businessInfo.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                      required
                    />
                    <svg
                      className="absolute left-4 top-4 w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
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
                    </svg>
                  </div>
                </motion.div>

                {/* Contact Info */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="contactInfo"
                    className="flex items-center text-sm font-semibold text-gray-700 mb-3"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Thông tin liên hệ
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="contactInfo"
                      name="contactInfo"
                      value={businessInfo.contactInfo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-800 placeholder-gray-400"
                      placeholder="VD: 0123.456.789 | email@company.com"
                      required
                    />
                    <svg
                      className="absolute left-4 top-4 w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* Logo Upload Section */}
                <motion.div variants={itemVariants}>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Logo công ty
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="space-y-4">
                    {/* Upload Area or Current Logo Display */}
                    {!processedLogoUrl && !businessInfo.logoPreview ? (
                      <div className="relative">
                        <input
                          type="file"
                          id="customerDetailLogo"
                          name="customerDetailLogo"
                          accept="image/*"
                          onChange={handleInputChange}
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
                    ) : (
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
                              <h4 className="font-semibold text-green-800">
                                Logo đã sẵn sàng
                              </h4>
                              <p className="text-sm text-green-600">
                                {businessInfo.logoPreview
                                  ? "Logo mới đã được tải lên"
                                  : "Sử dụng logo hiện có"}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setBusinessInfo((prev) => ({
                                ...prev,
                                logoPreview: "",
                                customerDetailLogo: null,
                              }));
                              setProcessedLogoUrl("");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium bg-white px-3 py-1 rounded-lg shadow-sm hover:shadow-md transition-all"
                          >
                            Thay đổi
                          </button>
                        </div>

                        {/* Logo Preview */}
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100">
                            <img
                              src={businessInfo.logoPreview || processedLogoUrl}
                              alt="Logo Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error("Error loading logo:", e);
                                if (
                                  customerDetail?.logoUrl &&
                                  !businessInfo.logoPreview
                                ) {
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
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Form Actions */}
              <div className="bg-gray-50 px-8 md:px-10 py-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    navigate("/ai-design");
                  }}
                  className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 flex items-center justify-center"
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
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={customerStatus === "loading"}
                >
                  {customerStatus === "loading" ? (
                    <>
                      <CircularProgress
                        size={20}
                        color="inherit"
                        className="mr-3"
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      {customerDetail ? "Cập nhật thông tin" : "Tiếp tục"}
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
                💡 <strong>Mẹo:</strong> Thông tin chính xác sẽ giúp AI tạo ra
                thiết kế phù hợp với thương hiệu của bạn
              </p>
            </motion.div>
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
            {error && (
              <motion.div
                className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center"
                variants={itemVariants}
              >
                {error}
              </motion.div>
            )}
            {productTypeStatus === "loading" || customerStatus === "loading" ? (
              <div className="flex justify-center items-center py-12">
                <CircularProgress color="primary" />
              </div>
            ) : productTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {productTypes.map((productType, index) => {
                  // Tạo mapping để mỗi product type có một ảnh khác nhau
                  const getProductTypeImage = (id, index) => {
                    const imageUrls = [
                      "https://bienhieudep.vn/wp-content/uploads/2022/08/mau-bien-quang-cao-nha-hang-dep-37.jpg",
                      "https://q8laser.com/wp-content/uploads/2021/01/thi-cong-bien-hieu-quang-cao.jpg",
                      "https://www.denledday.vn/wp-content/uploads/2016/12/Den-gan-vien-bien-quang-cao.jpg",
                      "https://appro.com.vn/wp-content/uploads/2020/09/den-pha-led-cho-bang-hieu-3.jpg",
                      "https://www.denledday.vn/wp-content/uploads/2016/12/Den-gan-vien-bien-quang-cao.jpg",
                      // Thêm nhiều ảnh nếu muốn
                    ];

                    // Sử dụng index để đảm bảo mỗi sản phẩm có một ảnh riêng
                    return imageUrls[index % imageUrls.length];
                  };

                  // Tạo mô tả mẫu cho từng loại biển hiệu
                  const getProductTypeDescription = (name) => {
                    const descriptions = {
                      "Biển hiệu hiện đại":
                        "Thiết kế biển hiệu hiện đại, thanh lịch và nổi bật.",
                      "Biển hiệu truyền thống":
                        "Thiết kế biển hiệu mang phong cách truyền thống, trang nhã.",
                    };

                    return (
                      descriptions[name] ||
                      "Thiết kế biển hiệu chuyên nghiệp cho doanh nghiệp của bạn."
                    );
                  };

                  return (
                    <motion.div
                      key={productType.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className="rounded-xl overflow-hidden shadow-md bg-white border border-gray-100"
                    >
                      <div className="h-48 bg-gradient-to-r from-custom-primary to-custom-secondary flex items-center justify-center">
                        <img
                          src={getProductTypeImage(productType.id, index)}
                          alt={productType.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-custom-dark mb-2">
                          {productType.name}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {getProductTypeDescription(productType.name)}
                        </p>
                        <motion.button
                          onClick={() =>
                            handleBillboardTypeSelect(productType.id)
                          }
                          className="w-full py-3 px-4 bg-custom-light text-custom-primary font-medium rounded-lg hover:bg-custom-tertiary hover:text-white transition-all flex items-center justify-center"
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
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Không tìm thấy loại biển hiệu nào. Vui lòng thử lại sau.</p>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <motion.button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  navigate("/ai-design?step=business");
                }}
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

      case 4: {
        // Thêm dấu ngoặc nhọn mở ở đây
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
          productTypes.find((pt) => pt.id === billboardType) ||
          currentProductType;
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
                  <motion.button
                    type="button"
                    onClick={() => {
                      navigate("/custom-design", {
                        state: {
                          customerChoiceId: currentOrder?.id,
                          selectedType: billboardType,
                          businessInfo: {
                            companyName:
                              businessInfo.companyName ||
                              customerDetail?.companyName ||
                              "",
                            address:
                              businessInfo.address ||
                              customerDetail?.address ||
                              "",
                            contactInfo:
                              businessInfo.contactInfo ||
                              customerDetail?.contactInfo ||
                              "",
                            logoUrl:
                              businessInfo.logoPreview ||
                              customerDetail?.logoUrl ||
                              "",
                          },
                        },
                      });
                    }}
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
      }
      case 5: {
        // Thêm dấu ngoặc nhọn để tạo block scope
        const currentProductTypeInfo =
          productTypes.find((pt) => pt.id === billboardType) ||
          currentProductType;
        const isAiGenerated = currentProductTypeInfo?.isAiGenerated;

        // Tự động set currentSubStep dựa trên isAiGenerated

        return (
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header không có tabs */}
            <motion.div className="text-center mb-6" variants={itemVariants}>
              <h2 className="text-3xl font-bold text-custom-dark mb-4">
                {isAiGenerated
                  ? "Chọn mẫu thiết kế"
                  : "Chọn background phù hợp"}
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
                    <p className="ml-4 text-gray-600">
                      Đang tải mẫu thiết kế...
                    </p>
                  </div>
                ) : designTemplateStatus === "failed" ? (
                  <div className="text-center py-8 bg-red-50 rounded-lg">
                    <p className="text-red-500">
                      {designTemplateError ||
                        "Không thể tải mẫu thiết kế. Vui lòng thử lại."}
                    </p>
                    <button
                      onClick={() =>
                        dispatch(
                          fetchDesignTemplatesByProductTypeId(billboardType)
                        )
                      }
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Tải lại
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {designTemplates && designTemplates.length > 0 ? (
                      designTemplates.map((template) => {
                        // ✅ SỬ DỤNG STATE ĐÃ ĐƯỢC KHAI BÁO Ở NGOÀI
                        const templateImageUrl =
                          designTemplateImageUrls[template.id];
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
                            onClick={() =>
                              handleSelectSampleProduct(template.id)
                            }
                          >
                            {/* ✅ TEMPLATE IMAGE - SỬ DỤNG getImageFromS3 */}
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
                                    // Hiển thị placeholder
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
                              <h3 className="font-medium text-lg">
                                {template.name}
                              </h3>
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
                        Ghi chú thiết kế{" "}
                        <span className="text-red-500 ml-1">*</span>
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
                          Chi tiết sẽ giúp AI tạo thiết kế phù hợp hơn với nhu
                          cầu của bạn
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
                    {backgroundSuggestions &&
                    backgroundSuggestions.length > 0 ? (
                      backgroundSuggestions.map((background) => {
                        const presignedUrl =
                          backgroundPresignedUrls[background.id];
                        const isLoadingUrl =
                          loadingBackgroundUrls[background.id];
                        const retryCount =
                          backgroundRetryAttempts[background.id] || 0;
                        const hasFailed = presignedUrl === null; // null means permanently failed

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
                            {/* Background Image - Tăng kích thước từ h-48 lên h-64 */}
                            <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                              {isLoadingUrl ? (
                                <div className="flex flex-col items-center">
                                  <CircularProgress size={24} />
                                  <p className="text-xs text-gray-500 mt-2">
                                    Đang tải ảnh... (Lần {retryCount + 1})
                                  </p>
                                </div>
                              ) : hasFailed ? (
                                // ✅ HIỂN THỊ LỖI PERMANENT
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
                                      // Reset retry count và thử lại
                                      setBackgroundRetryAttempts((prev) => ({
                                        ...prev,
                                        [background.id]: 0,
                                      }));
                                      setBackgroundPresignedUrls((prev) => ({
                                        ...prev,
                                        [background.id]: undefined, // Reset để trigger fetch lại
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

                                    // ✅ THÊM RETRY LOGIC CHO DISPLAY ERROR
                                    const currentRetries =
                                      backgroundRetryAttempts[background.id] ||
                                      0;

                                    if (currentRetries < 2) {
                                      console.log(
                                        `🔄 Retrying display for background ${
                                          background.id
                                        } (attempt ${currentRetries + 1})`
                                      );

                                      // Tăng retry count
                                      setBackgroundRetryAttempts((prev) => ({
                                        ...prev,
                                        [background.id]: currentRetries + 1,
                                      }));

                                      // Fetch lại URL
                                      setTimeout(() => {
                                        fetchBackgroundPresignedUrl(
                                          background.id,
                                          background.backgroundUrl
                                        );
                                      }, 1000 * (currentRetries + 1)); // Delay tăng dần
                                    } else {
                                      // Sau 2 lần thử, hiển thị placeholder
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
                                // Waiting state
                                <div className="flex flex-col items-center text-gray-400">
                                  <FaPalette className="w-8 h-8 mb-2" />
                                  <p className="text-xs text-center">
                                    Chờ tải ảnh...
                                  </p>
                                </div>
                              )}

                              {/* ✅ ERROR PLACEHOLDER - không tự động retry */}
                              <div className="hidden w-full h-full items-center justify-center text-gray-400 flex-col">
                                <FaPalette className="w-8 h-8 mb-2" />
                                <p className="text-xs text-center">
                                  Không thể hiển thị ảnh
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Manual retry with reset
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

                            {/* Background info - Tăng chiều cao và hiển thị đầy đủ description */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white p-3">
                              <h3 className="font-medium text-base mb-1 leading-tight">
                                {background.name}
                              </h3>

                              {/* Tooltip cho description */}
                              <div className="group/tooltip relative">
                                <p className="text-sm text-gray-200 truncate cursor-help">
                                  {background.description}
                                </p>

                                {/* Tooltip hiển thị full description */}
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

                            {/* Unavailable overlay */}
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

                {/* Customer Note cho Background */}
                {selectedBackgroundId && (
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="inline-block w-1 h-4 bg-purple-500 mr-2 rounded"></span>
                        Ghi chú thiết kế với background{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </h3>
                      <textarea
                        className={`w-full px-4 py-3 border ${
                          selectedBackgroundId && !customerNote.trim()
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-200 focus:ring-custom-primary focus:border-custom-primary"
                        } rounded-lg focus:ring-2 transition-all`}
                        rows="3"
                        name="backgroundNotes"
                        placeholder="Mô tả cách bạn muốn sử dụng background này cho thiết kế..."
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                      ></textarea>
                      <div className="flex justify-between mt-2">
                        <p className="text-gray-500 text-sm italic">
                          Mô tả chi tiết sẽ giúp chúng tôi thiết kế phù hợp hơn
                          với background đã chọn
                        </p>
                        <p className="text-red-500 text-sm">
                          {selectedBackgroundId && !customerNote.trim()
                            ? "Vui lòng nhập ghi chú thiết kế"
                            : ""}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <motion.div
              className="flex justify-between mt-8"
              variants={itemVariants}
            >
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
                onClick={() => {
                  if (isAiGenerated) {
                    // Logic cho Design Template (giữ nguyên)
                    if (!selectedSampleProduct) {
                      setSnackbar({
                        open: true,
                        message:
                          "Vui lòng chọn một mẫu thiết kế trước khi tiếp tục",
                        severity: "warning",
                      });
                      return;
                    }
                    if (!customerNote.trim()) {
                      setSnackbar({
                        open: true,
                        message:
                          "Vui lòng nhập ghi chú thiết kế trước khi tiếp tục",
                        severity: "warning",
                      });
                      return;
                    }
                    // Proceed với AI generation
                    handleContinueToPreview();
                  } else {
                    // Logic cho Background - THAY ĐỔI Ở ĐÂY
                    if (!selectedBackgroundId) {
                      setSnackbar({
                        open: true,
                        message:
                          "Vui lòng chọn một background trước khi tiếp tục",
                        severity: "warning",
                      });
                      return;
                    }
                    if (!customerNote.trim()) {
                      setSnackbar({
                        open: true,
                        message:
                          "Vui lòng nhập ghi chú thiết kế trước khi tiếp tục",
                        severity: "warning",
                      });
                      return;
                    }

                    // Lưu thông tin background đã chọn để sử dụng trong canvas
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

                    // Chuyển thẳng đến case 6 thay vì navigate đến custom-design
                    setCurrentStep(7);
                    navigate("/ai-design?step=edit");

                    setSnackbar({
                      open: true,
                      message: "Đang tải editor với background đã chọn...",
                      severity: "info",
                    });
                  }
                }}
                className={`px-8 py-3 font-medium rounded-lg transition-all flex items-center ${
                  (isAiGenerated &&
                    selectedSampleProduct &&
                    customerNote.trim()) ||
                  (!isAiGenerated &&
                    selectedBackgroundId &&
                    customerNote.trim())
                    ? "bg-custom-primary text-white hover:bg-custom-secondary"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                whileHover={
                  (isAiGenerated &&
                    selectedSampleProduct &&
                    customerNote.trim()) ||
                  (!isAiGenerated &&
                    selectedBackgroundId &&
                    customerNote.trim())
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  (isAiGenerated &&
                    selectedSampleProduct &&
                    customerNote.trim()) ||
                  (!isAiGenerated &&
                    selectedBackgroundId &&
                    customerNote.trim())
                    ? { scale: 0.98 }
                    : {}
                }
                disabled={
                  (isAiGenerated &&
                    (!selectedSampleProduct || !customerNote.trim())) ||
                  (!isAiGenerated &&
                    (!selectedBackgroundId || !customerNote.trim()))
                }
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
      } // Đóng dấu ngoặc nhọn cho case 5
      case 6:
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
                  className="rounded-xl overflow-hidden shadow-lg w-full mx-auto max-w-2xl"
                >
                  <img
                    src={generatedImage}
                    alt="AI Generated Design"
                    className="w-full object-cover"
                    onClick={() => setSelectedImage(1)}
                  />
                </motion.div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <FaRobot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Không có thiết kế nào được tạo. Vui lòng quay lại và thử
                    lại.
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
                onClick={() => {
                  if (!generatedImage) {
                    setSnackbar({
                      open: true,
                      message:
                        "Vui lòng chờ thiết kế được tạo trước khi tiếp tục",
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
                }}
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
      case 7:
        return (
          <motion.div
            className="max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-3xl font-bold text-custom-dark mb-8 text-center"
              variants={itemVariants}
            >
              {selectedBackgroundForCanvas
                ? "Chỉnh sửa thiết kế với Background"
                : "Chỉnh sửa thiết kế AI"}
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Business Info Panel - Bên trái - giảm xuống còn 2 cột */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <h3 className="text-xl font-semibold mb-4">
                    Thông tin doanh nghiệp
                  </h3>

                  <div className="space-y-4">
                    {/* Company Name */}
                    {businessPresets.companyName && (
                      <div
                        className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                        onClick={() =>
                          addBusinessInfoToCanvas(
                            "companyName",
                            businessPresets.companyName
                          )
                        }
                      >
                        <div className="flex items-center mb-1">
                          <FaFont className="text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-gray-600">
                            Tên công ty
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {businessPresets.companyName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Nhấn để thêm vào thiết kế
                        </p>
                      </div>
                    )}

                    {/* Tag Line */}
                    {businessPresets.tagLine && (
                      <div
                        className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all"
                        onClick={() =>
                          addBusinessInfoToCanvas(
                            "tagLine",
                            businessPresets.tagLine
                          )
                        }
                      >
                        <div className="flex items-center mb-1">
                          <FaFont className="text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-600">
                            Address
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 truncate">
                          {businessPresets.tagLine}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Nhấn để thêm vào thiết kế
                        </p>
                      </div>
                    )}

                    {/* Contact Info */}
                    {businessPresets.contactInfo && (
                      <div
                        className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all"
                        onClick={() =>
                          addBusinessInfoToCanvas(
                            "contactInfo",
                            businessPresets.contactInfo
                          )
                        }
                      >
                        <div className="flex items-center mb-1">
                          <FaFont className="text-orange-500 mr-2" />
                          <span className="text-sm font-medium text-gray-600">
                            Liên hệ
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 truncate">
                          {businessPresets.contactInfo}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Nhấn để thêm vào thiết kế
                        </p>
                      </div>
                    )}

                    {/* Logo */}
                    {businessPresets.logoUrl && (
                      <div
                        className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all"
                        onClick={() =>
                          addBusinessInfoToCanvas(
                            "logoUrl",
                            s3Logo || businessPresets.logoUrl
                          )
                        }
                      >
                        <div className="flex items-center mb-1">
                          <FaPalette className="text-purple-500 mr-2" />
                          <span className="text-sm font-medium text-gray-600">
                            Logo
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <img
                            src={s3Logo || businessPresets.logoUrl}
                            alt="Logo preview"
                            className="w-6 h-6 object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <span className="text-xs text-gray-800">
                            Logo công ty
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Nhấn để thêm vào thiết kế
                        </p>
                      </div>
                    )}

                    {/* Nếu không có thông tin */}
                    {!businessPresets.companyName &&
                      !businessPresets.tagLine &&
                      !businessPresets.contactInfo &&
                      !businessPresets.logoUrl && (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm">
                            Không có thông tin doanh nghiệp
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Hãy cập nhật thông tin ở bước 2
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Canvas Area - Tăng lên 8 cột để canvas lớn hơn */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Thiết kế</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={addText}
                        className="px-3 py-2 bg-custom-secondary text-white rounded-lg hover:bg-custom-secondary/90 flex items-center text-sm"
                      >
                        <FaPlus className="mr-1" />
                        Thêm text
                      </button>

                      {/* NÚT THÊM ICON MỚI */}
                      <button
                        onClick={() => {
                          setShowIconPicker(true);
                          if (icons.length === 0) {
                            loadIcons(1);
                          }
                        }}
                        className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center text-sm"
                      >
                        <FaPalette className="mr-1" />
                        Thêm icon
                      </button>

                      <label className="px-3 py-2 bg-custom-primary text-white rounded-lg hover:bg-custom-primary/90 flex items-center text-sm cursor-pointer">
                        <FaPlus className="mr-1" />
                        Thêm ảnh
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <button
                        onClick={deleteSelectedObject}
                        disabled={!fabricCanvas?.getActiveObject()}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 flex items-center text-sm"
                      >
                        <FaTrash className="mr-1" />
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div
                    className="border-2 border-gray-200 rounded-lg overflow-hidden"
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingTop: "50%", // Giữ tỷ lệ 2:1
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    >
                      <canvas
                        ref={canvasRef}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Controls - Bên phải - giảm xuống còn 2 cột */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Tùy chỉnh text</h3>

                  {selectedText ? (
                    <div className="space-y-3">
                      {/* Text Content */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Nội dung
                        </label>
                        <textarea
                          value={textSettings.text}
                          onChange={(e) => {
                            updateTextProperty("text", e.target.value);
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm"
                          rows={2}
                        />
                      </div>

                      {/* Font Family */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Font chữ
                        </label>
                        <select
                          value={textSettings.fontFamily}
                          onChange={(e) =>
                            updateTextProperty("fontFamily", e.target.value)
                          }
                          className="w-full p-1.5 border border-gray-300 rounded-lg text-sm"
                        >
                          {fonts.map((font) => (
                            <option
                              key={font}
                              value={font}
                              style={{ fontFamily: font }}
                            >
                              {font}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Font Size */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Kích thước: {textSettings.fontSize}px
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="100"
                          value={textSettings.fontSize}
                          onChange={(e) =>
                            updateTextProperty(
                              "fontSize",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Text Color */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Màu chữ
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="color"
                            value={textSettings.fill}
                            onChange={(e) =>
                              updateTextProperty("fill", e.target.value)
                            }
                            className="w-8 h-8 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={textSettings.fill}
                            onChange={(e) =>
                              updateTextProperty("fill", e.target.value)
                            }
                            className="flex-1 p-1.5 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {/* Text Style Controls */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Kiểu chữ
                        </label>
                        <div className="flex space-x-1">
                          <button
                            onClick={() =>
                              updateTextProperty(
                                "fontWeight",
                                textSettings.fontWeight === "bold"
                                  ? "normal"
                                  : "bold"
                              )
                            }
                            className={`p-1.5 rounded border ${
                              textSettings.fontWeight === "bold"
                                ? "bg-custom-secondary text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            <FaBold />
                          </button>

                          <button
                            onClick={() =>
                              updateTextProperty(
                                "fontStyle",
                                textSettings.fontStyle === "italic"
                                  ? "normal"
                                  : "italic"
                              )
                            }
                            className={`p-1.5 rounded border ${
                              textSettings.fontStyle === "italic"
                                ? "bg-custom-secondary text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            <FaItalic />
                          </button>

                          <button
                            onClick={() =>
                              updateTextProperty(
                                "underline",
                                !textSettings.underline
                              )
                            }
                            className={`p-1.5 rounded border ${
                              textSettings.underline
                                ? "bg-custom-secondary text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            <FaUnderline />
                          </button>
                        </div>
                      </div>

                      {/* Common Colors */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Màu phổ biến
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            "#000000",
                            "#ffffff",
                            "#ff0000",
                            "#00ff00",
                            "#0000ff",
                            "#ffff00",
                            "#ff00ff",
                            "#00ffff",
                            "#ffa500",
                            "#800080",
                            "#ffc0cb",
                            "#a52a2a",
                          ].map((color) => (
                            <button
                              key={color}
                              onClick={() => updateTextProperty("fill", color)}
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-6 text-sm">
                      Chọn một text để chỉnh sửa hoặc thêm text mới
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Ghi chú đơn hàng</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhập ghi chú hoặc yêu cầu đặc biệt
                    </label>
                    <textarea
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                      rows={4}
                      placeholder="Nhập yêu cầu đặc biệt hoặc ghi chú cho đơn hàng của bạn..."
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-center space-x-6 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Reset canvas trước khi quay lại
                  if (fabricCanvas) {
                    fabricCanvas.dispose();
                    setFabricCanvas(null);
                  }

                  if (generatedImage) {
                    setCurrentStep(6);
                  } else {
                    setCurrentStep(5);
                  }
                }}
                className="px-8 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
              >
                Quay lại
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportDesign}
                disabled={isExporting}
                className="px-8 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-all flex items-center"
              >
                {isExporting ? (
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
                    {selectedBackgroundForCanvas
                      ? "Xuất thiết kế Background"
                      : "Xuất thiết kế AI"}
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{
                  scale: currentAIDesign && !isOrdering ? 1.05 : 1,
                }}
                whileTap={{ scale: currentAIDesign && !isOrdering ? 0.95 : 1 }}
                onClick={handleConfirm}
                disabled={!currentAIDesign || isOrdering}
                className={`order-button px-8 py-3 font-medium rounded-lg transition-all flex items-center ${
                  currentAIDesign && !isOrdering
                    ? "bg-custom-secondary text-white hover:bg-custom-secondary/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isOrdering ? (
                  <>
                    <CircularProgress
                      size={20}
                      color="inherit"
                      className="mr-2"
                    />
                    Đang xử lý...
                  </>
                ) : !currentAIDesign ? (
                  <>
                    <FaCheck className="mr-2" />
                    {selectedBackgroundForCanvas
                      ? "Xuất thiết kế Background trước khi đặt hàng"
                      : "Xuất thiết kế AI trước khi đặt hàng"}
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Đặt hàng
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto py-8">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
        {renderContent()}
      </div>

      {/* AI Generation Loading Backdrop */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        }}
        open={isGenerating}
      >
        <div className="flex flex-col items-center">
          <CircularProgress color="secondary" size={60} />
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <FaRobot className="w-8 h-8 text-custom-secondary mr-3 animate-bounce" />
              <h3 className="text-2xl font-bold text-white">
                AI đang tạo hình ảnh
              </h3>
            </div>
            <p className="text-gray-300 max-w-md">
              {currentStep === 5
                ? "Hệ thống AI đang tạo các bản thiết kế dựa trên mẫu bạn đã chọn. Vui lòng đợi trong giây lát..."
                : "Hệ thống AI đang phân tích yêu cầu và tạo ra các mẫu thiết kế phù hợp với thông số kỹ thuật của bạn. Vui lòng chờ trong giây lát..."}
            </p>
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
