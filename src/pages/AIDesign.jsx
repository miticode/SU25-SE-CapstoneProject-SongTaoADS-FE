import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Grid,
  Box,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  FaCheck,
  FaRedo,
  FaCheckCircle,
  FaRobot,
  FaEdit,
  FaSave,
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
} from "../store/features/ai/aiSlice";
import { fetchImageFromS3, selectS3Image } from "../store/features/s3/s3Slice";
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
  const totalAmount = useSelector(selectTotalAmount);

  const fetchCustomerChoiceStatus = useSelector(
    selectFetchCustomerChoiceStatus
  );
  const previousSubTotalsRef = React.useRef({});
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleSizeUpdate = async (customerChoiceSizeId, sizeId) => {
    try {
      console.log("Updating size with ID:", customerChoiceSizeId);
      console.log("New size value:", editingSizeValue);

      // Đánh dấu trạng thái loading ngay từ đầu
      dispatch({ type: "customers/fetchCustomerChoice/pending" });

      // Lưu lại giá trị subtotal hiện tại trước khi cập nhật
      const currentSubtotals = {};
      Object.entries(customerChoiceDetails).forEach(([attrId, detail]) => {
        if (detail && detail.subTotal !== undefined) {
          currentSubtotals[attrId] = detail.subTotal;
          previousSubTotalsRef.current[attrId] = detail.subTotal;
        }
      });

      // Cập nhật kích thước
      const result = await dispatch(
        updateCustomerChoiceSize({
          customerChoiceSizeId,
          sizeValue: editingSizeValue,
        })
      ).unwrap();

      console.log("Update result:", result);

      // Cập nhật trạng thái local cho UI
      const numericValue = parseFloat(editingSizeValue);
      setCustomerChoiceSizes({
        ...customerChoiceSizes,
        [sizeId]: {
          ...customerChoiceSizes[sizeId],
          sizeValue: numericValue,
        },
      });
      setFormData({
        ...formData,
        [`size_${sizeId}`]: editingSizeValue,
      });

      // Reset trạng thái chỉnh sửa
      setEditingSizeId(null);
      setEditingSizeValue("");

      // Đợi để đảm bảo backend đã xử lý xong
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        // KHÔNG xóa toàn bộ giá trị subtotal
        // KHÔNG dispatch resetCustomerChoiceDetails

        // Fetch lại toàn bộ dữ liệu
        if (currentOrder?.id) {
          // Đầu tiên, fetch chi tiết để cập nhật subtotal cho từng thuộc tính
          await dispatch(fetchCustomerChoiceDetails(currentOrder.id)).unwrap();

          // Sau đó fetch tổng số tiền
          await dispatch(fetchCustomerChoice(currentOrder.id)).unwrap();

          // Cập nhật UI
          setRefreshCounter((prev) => prev + 1);

          // Hiển thị thông báo thành công
          setSnackbar({
            open: true,
            message: "Cập nhật kích thước thành công",
            severity: "success",
          });
        }
      } catch (error) {
        console.error("Error refreshing data after size update:", error);

        // Phục hồi giá trị subtotal trước đó để UI không bị mất giá trị
        // Khôi phục các giá trị subtotal từ biến tạm
        previousSubTotalsRef.current = { ...currentSubtotals };

        // Thử lại lần nữa
        setTimeout(async () => {
          if (currentOrder?.id) {
            try {
              await dispatch(fetchCustomerChoiceDetails(currentOrder.id));
              await dispatch(fetchCustomerChoice(currentOrder.id));
              setRefreshCounter((prev) => prev + 1);
            } catch (retryError) {
              console.error("Retry failed:", retryError);
            }
          }
        }, 1000);

        setSnackbar({
          open: true,
          message: "Đã cập nhật kích thước, đang tải lại dữ liệu...",
          severity: "info",
        });
      }
    } catch (error) {
      console.error("Failed to update size:", error);
      setSizeValidationError(
        "Có lỗi xảy ra khi cập nhật kích thước. Vui lòng thử lại."
      );
      setSnackbar({
        open: true,
        message: "Cập nhật kích thước thất bại",
        severity: "error",
      });
    }
  };
  useEffect(() => {
    if (currentOrder?.id) {
      // Load saved sizes for existing customer choice
      dispatch(fetchCustomerChoiceSizes(currentOrder.id))
        .unwrap()
        .then((sizes) => {
          if (sizes && sizes.length > 0) {
            console.log("Found saved sizes:", sizes);

            // Create a map of the existing sizes
            const existingSizes = {};
            sizes.forEach((size) => {
              // Store by size ID for easy lookup
              existingSizes[size.sizeId] = size;

              // Also update the form data to show the values
              setFormData((prev) => ({
                ...prev,
                [`size_${size.sizeId}`]: size.sizeValue.toString(),
              }));
            });

            // Save the existing sizes to state for editing later
            setCustomerChoiceSizes(existingSizes);

            // If we have all required sizes, auto-confirm them
            if (sizes.length === productTypeSizes.length) {
              setSizesConfirmed(true);
            }
          }
        })
        .catch((error) => {
          console.error("Failed to load customer choice sizes:", error);
        });
    }
  }, [currentOrder?.id, dispatch, productTypeSizes.length]);
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
      const initialData = {};
      attributes.forEach((attr) => {
        initialData[attr.id] = "";
      });
      setFormData(initialData);

      // Fetch attribute values only once per attribute
      attributes.forEach((attr) => {
        if (attributeValuesStatusState[attr.id] === "idle") {
          dispatch(fetchAttributeValuesByAttributeId(attr.id));
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
    // Lưu giá trị subTotal hiện tại vào ref
    Object.entries(customerChoiceDetails).forEach(([attrId, detail]) => {
      if (detail && detail.subTotal !== undefined) {
        previousSubTotalsRef.current[attrId] = detail.subTotal;
      }
    });
  }, [customerChoiceDetails]);
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
      const existingChoiceDetail = customerChoiceDetails[name];

      // Lưu subTotal hiện tại vào ref để tránh hiệu ứng nhấp nháy
      if (existingChoiceDetail?.subTotal !== undefined) {
        previousSubTotalsRef.current[name] = existingChoiceDetail.subTotal;
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
      // Changed from ptSize.size.id to ptSize.sizes.id
      const fieldName = `size_${ptSize.sizes.id}`;
      const value = formData[fieldName];

      if (!value) {
        hasErrors = true;
        setSizeValidationError("Vui lòng nhập đầy đủ thông tin kích thước");
        return;
      } else {
        // Ensure the value is a valid number
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          hasErrors = true;
          setSizeValidationError("Giá trị kích thước không hợp lệ");
          return;
        } else {
          // Changed from ptSize.size.id to ptSize.sizes.id
          sizeInputs[ptSize.sizes.id] = numValue;
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
            // Changed from ptSize.size.name to ptSize.sizes.name
            sizeName:
              productTypeSizes.find((pt) => pt.sizes.id === sizeId)?.sizes
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
              </Typography>

              <Grid container spacing={1.5}>
                {productTypeSizes.map((ptSize) => {
                  const sizeId = ptSize.sizes.id;
                  const fieldName = `size_${sizeId}`;
                  const isEditing = editingSizeId === sizeId;
                  const savedSize = customerChoiceSizes[sizeId];

                  return (
                    <Grid
                      key={ptSize.id}
                      style={{
                        gridColumn: {
                          xs: "span 6",
                          sm: "span 4",
                          md: "span 3",
                        },
                      }}
                    >
                      <div className="relative">
                        <TextField
                          fullWidth
                          size="small"
                          label={ptSize.sizes.name}
                          name={fieldName}
                          type="number"
                          value={
                            isEditing
                              ? editingSizeValue
                              : formData[fieldName] || ""
                          }
                          onChange={
                            isEditing
                              ? (e) => setEditingSizeValue(e.target.value)
                              : handleChange
                          }
                          disabled={sizesConfirmed && !isEditing}
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

                        {sizesConfirmed && savedSize && (
                          <div className="absolute right-0 top-0 flex">
                            <button
                              type="button"
                              onClick={() => {
                                if (isEditing) {
                                  handleSizeUpdate(savedSize.id, sizeId);
                                } else {
                                  setEditingSizeId(sizeId);
                                  setEditingSizeValue(
                                    savedSize.sizeValue.toString()
                                  );
                                }
                              }}
                              className={`p-1 text-white rounded-full transition-colors ${
                                isEditing
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-blue-500 hover:bg-blue-600"
                              }`}
                              title={
                                isEditing
                                  ? "Lưu thay đổi"
                                  : "Chỉnh sửa kích thước"
                              }
                            >
                              {isEditing ? (
                                <FaSave size={12} />
                              ) : (
                                <FaEdit size={12} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
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

              {/* Confirm Size Button */}
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
                        console.log(
                          `Rendering attribute ${attr.id}, details:`,
                          customerChoiceDetails[attr.id]
                        );
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
                                disabled={isLoadingValues}
                                sx={{
                                  display: "block",
                                  width: "100%",
                                  fontSize: "0.8rem",
                                  height: "36px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  "& .MuiSelect-select": {
                                    minWidth: "150px",
                                    paddingRight: "32px",
                                  },
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
                                      whiteSpace: "normal",
                                      wordBreak: "break-word",
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <span>{value.name}</span>
                                    {value.unitPrice !== undefined && (
                                      <span className="ml-4 text-green-600 font-medium">
                                        {value.unitPrice.toLocaleString(
                                          "vi-VN"
                                        )}{" "}
                                        đ
                                      </span>
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
                              {(customerChoiceDetails[attr.id]?.subTotal !==
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
                                      {(customerChoiceDetails[attr.id]
                                        ?.subTotal !== undefined
                                        ? customerChoiceDetails[attr.id]
                                            .subTotal
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
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    tagLine: "",
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
  ];
  const s3Logo = useSelector((state) =>
    businessPresets.logoUrl
      ? selectS3Image(state, businessPresets.logoUrl)
      : null
  );
  useEffect(() => {
    if (currentStep === 6 && user?.id) {
      // Fetch customer detail để lấy business info
      dispatch(fetchCustomerDetailByUserId(user.id))
        .unwrap()
        .then((customerData) => {
          console.log("Customer detail loaded:", customerData);

          // Set business presets
          setBusinessPresets({
            logoUrl: customerData.logoUrl || "",
            companyName: customerData.companyName || "",
            tagLine: customerData.tagLine || "",
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

      case "tagLine":
        text = new fabric.Text(content, {
          left: position.left,
          top: position.top + 50,
          fontFamily: "Arial",
          fontSize: 18,
          fill: "#666666",
          fontStyle: "italic",
          name: "tagLine",
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
  useEffect(() => {
    console.log("Current step:", currentStep);
    console.log("Selected image ID:", selectedImage);
    console.log("Canvas ref:", canvasRef.current);
    console.log("Fabric canvas exists:", !!fabricCanvas);
    console.log("Generated image:", generatedImage);

    // Chỉ khởi tạo canvas khi:
    // 1. Đang ở step 6
    // 2. Canvas ref đã sẵn sàng
    // 3. Chưa có fabricCanvas
    // 4. Có selectedImage hoặc generatedImage
    if (
      currentStep === 6 &&
      canvasRef.current &&
      !fabricCanvas &&
      generatedImage
    ) {
      console.log("INITIALIZING CANVAS with AI-generated image");

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#f8f9fa",
      });

      // Use AI generated image if available, otherwise use sample image
      const imageUrl = generatedImage;

      console.log("Using AI-generated image URL:", imageUrl);

      if (imageUrl) {
        console.log("LOADING IMAGE: Loading image via HTML Image element");

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = function () {
          console.log("IMAGE LOADED SUCCESSFULLY");
          console.log("Image dimensions:", img.width, "x", img.height);

          try {
            const fabricImg = new fabric.Image(img, {
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              name: "backgroundImage",
            });

            console.log("Fabric image created:", fabricImg);

            // Scale image to fit canvas
            const canvasWidth = 800;
            const canvasHeight = 600;

            const scaleX = canvasWidth / fabricImg.width;
            const scaleY = canvasHeight / fabricImg.height;
            const scale = Math.min(scaleX, scaleY);

            fabricImg.set({
              scaleX: scale,
              scaleY: scale,
              left: (canvasWidth - fabricImg.width * scale) / 2,
              top: (canvasHeight - fabricImg.height * scale) / 2,
            });

            canvas.add(fabricImg);
            canvas.sendToBack(fabricImg);
            canvas.renderAll();

            console.log("AI-GENERATED IMAGE ADDED TO CANVAS SUCCESSFULLY");
          } catch (error) {
            console.error("ERROR creating fabric image:", error);
          }
        };

        img.onerror = function (error) {
          console.error("ERROR loading image:", imageUrl, error);
          setSnackbar({
            open: true,
            message: "Lỗi khi tải hình ảnh. Vui lòng thử lại.",
            severity: "error",
          });
        };

        img.src = imageUrl;
      } else {
        console.error("ERROR: No image URL available");
        setSnackbar({
          open: true,
          message: "Không tìm thấy hình ảnh để chỉnh sửa. Vui lòng thử lại.",
          severity: "error",
        });
      }

      // Canvas event handlers
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

      // SET CANVAS CUỐI CÙNG
      setFabricCanvas(canvas);
      console.log("CANVAS SET TO STATE");
    }

    // Cleanup khi rời khỏi step 6 HOẶC khi selectedImage thay đổi
    return () => {
      if (fabricCanvas && currentStep !== 6) {
        console.log("CLEANUP: Disposing canvas");
        fabricCanvas.dispose();
        setFabricCanvas(null);
      }
    };
  }, [currentStep, generatedImage]);

  // Thêm useEffect riêng để handle khi selectedImage thay đổi trong step 6

  useEffect(() => {
    if (currentStep === 6 && generatedImage && fabricCanvas) {
      console.log(
        "GENERATED IMAGE CHANGED: Updating canvas with AI generated image:",
        generatedImage
      );

      // Xóa ảnh cũ
      const objects = fabricCanvas.getObjects();
      const oldImage = objects.find((obj) => obj.name === "backgroundImage");
      if (oldImage) {
        fabricCanvas.remove(oldImage);
      }

      // Load ảnh được tạo bởi AI
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = function () {
        console.log("AI GENERATED IMAGE LOADED SUCCESSFULLY");

        const fabricImg = new fabric.Image(img, {
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          name: "backgroundImage",
        });

        const canvasWidth = 800;
        const canvasHeight = 600;
        const scaleX = canvasWidth / fabricImg.width;
        const scaleY = canvasHeight / fabricImg.height;
        const scale = Math.min(scaleX, scaleY);

        fabricImg.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvasWidth - fabricImg.width * scale) / 2,
          top: (canvasHeight - fabricImg.height * scale) / 2,
        });

        fabricCanvas.add(fabricImg);
        fabricCanvas.sendToBack(fabricImg);
        fabricCanvas.renderAll();

        console.log("AI GENERATED IMAGE ADDED TO CANVAS");
      };

      img.onerror = function (error) {
        console.error("ERROR loading AI generated image:", error);

        // Fallback to first preview image if loading fails
        const fallbackImage = new Image();
        fallbackImage.crossOrigin = "anonymous";
        fallbackImage.src = previewImages[0].url;
        fallbackImage.onload = img.onload;
      };

      img.src = generatedImage;
    }
  }, [generatedImage, fabricCanvas, currentStep]);
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

  const deleteSelectedText = () => {
    if (!selectedText) return;
    fabricCanvas.remove(selectedText);
    setSelectedText(null);
  };

  const exportDesign = async () => {
    if (!fabricCanvas) return;

    try {
      setIsExporting(true); // Use local loading state instead of global

      // 1. Lấy ảnh từ canvas
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
      });

      // 2. Convert dataURL thành File object
      const blobBin = atob(dataURL.split(",")[1]);
      const array = [];
      for (let i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
      }
      const file = new Blob([new Uint8Array(array)], { type: "image/png" });
      const aiImage = new File([file], "canvas-design.png", {
        type: "image/png",
      });

      // 3. Lấy customerDetailId và designTemplateId
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

      // Đảm bảo customerNote không bao giờ là null/undefined
      const note = customerNote || "Thiết kế từ người dùng";

      console.log("Preparing to send AI request with:", {
        customerDetailId,
        designTemplateId,
        customerNote: note,
        hasImage: !!aiImage,
      });

      // 4. Gửi request tạo AI design
      const resultAction = await dispatch(
        createAIDesign({
          customerDetailId,
          designTemplateId,
          customerNote: note, // Sử dụng giá trị mặc định nếu rỗng
          aiImage,
        })
      );

      // 5. Xử lý kết quả
      if (createAIDesign.fulfilled.match(resultAction)) {
        const response = resultAction.payload;
        console.log("AI design created successfully:", response);

        // Tải ảnh về máy người dùng
        const link = document.createElement("a");
        link.download = "edited-design.png";
        link.href = dataURL;
        link.click();

        // Hiển thị thông báo thành công
        setSnackbar({
          open: true,
          message: "Thiết kế của bạn đã được lưu và tải xuống thành công!",
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
            "Có lỗi xảy ra khi lưu thiết kế. Ảnh đã được tải xuống nhưng chưa lưu vào hệ thống.",
          severity: "warning",
        });

        // Vẫn cho phép tải ảnh xuống dù API có lỗi
        const link = document.createElement("a");
        link.download = "edited-design.png";
        link.href = dataURL;
        link.click();
      }
    } catch (error) {
      console.error("Error exporting design:", error);

      // Thử phương pháp thay thế với html2canvas nếu phương pháp chính thất bại
      try {
        const canvasContainer = canvasRef.current.parentElement;
        const canvas = await html2canvas(canvasContainer, {
          allowTaint: true,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = "design-screenshot.png";
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }, "image/png");

        setSnackbar({
          open: true,
          message:
            "Đã tải xuống thiết kế nhưng không thể lưu vào hệ thống. Vui lòng thử lại sau.",
          severity: "warning",
        });
      } catch (html2canvasError) {
        console.error("html2canvas failed:", html2canvasError);
        setSnackbar({
          open: true,
          message:
            "Không thể xuất file. Vui lòng chụp màn hình để lưu thiết kế.",
          severity: "error",
        });
      }
    } finally {
      setIsExporting(false); // Turn off the local loading state instead of global
    }
  };
  useEffect(() => {
    if (currentStep === 4.5 && billboardType) {
      console.log("Fetching design templates for product type:", billboardType);
      dispatch(fetchDesignTemplatesByProductTypeId(billboardType));
    }
  }, [currentStep, billboardType, dispatch]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const step = params.get("step");

    if (step === "business") {
      setCurrentStep(2);
    } else if (step === "billboard") {
      setCurrentStep(3);
      const type = params.get("type");
      if (type) {
        setBillboardType(type);
        setCurrentStep(4);
      }
    }
  }, [location]);

  useEffect(() => {
    if (currentStep === 3 && productTypeStatus === "idle") {
      dispatch(fetchProductTypes());
    }
  }, [currentStep, dispatch, productTypeStatus]);
  useEffect(() => {
    if (currentStep === 4 && billboardType) {
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
              // We found an existing choice, now set it as current order
              console.log("Found existing customer choice:", result);

              // Make sure the existing choice matches our current product type
              if (result.productTypeId === billboardType) {
                // Fetch choice details and update state
                dispatch(fetchCustomerChoiceDetails(result.id));
                dispatch(fetchCustomerChoice(result.id));
              }
            }
          })
          .catch((error) => {
            console.error(
              "Failed to check for existing customer choices:",
              error
            );
          });
      }
    }
  }, [
    currentStep,
    billboardType,
    dispatch,
    attributeStatus,
    currentOrder,
    user?.id,
  ]);
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
        tagLine: customerDetail.tagLine || "",
        contactInfo: customerDetail.contactInfo || "",
        customerDetailLogo: null, // Can't set file directly
        logoPreview: customerDetail.logoUrl || "", // Use existing logo URL for preview
      });
    }
  }, [customerDetail]);

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
    console.log("Current user state:", user);
    if (!user?.id) {
      console.error("No user ID found in user state:", user);
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập để tiếp tục",
        severity: "error",
      });
      return;
    }
    // Validate required fields
    const requiredFields = ["companyName", "tagLine", "contactInfo"];
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

    // If it's a new customer and no logo is uploaded, show a warning
    if (!customerDetail && !businessInfo.customerDetailLogo) {
      setSnackbar({
        open: true,
        message: "Vui lòng tải lên logo công ty",
        severity: "warning",
      });
      return;
    }
    const customerData = {
      companyName: businessInfo.companyName,
      tagLine: businessInfo.tagLine,
      contactInfo: businessInfo.contactInfo,
      customerDetailLogo: businessInfo.customerDetailLogo,
      userId: user.id,
    };

    console.log("Customer data to be sent:", customerData);

    try {
      // First update or create customer details
      if (customerDetail) {
        console.log("Updating existing customer detail:", customerDetail.id);
        const result = await dispatch(
          updateCustomerDetail({
            customerDetailId: customerDetail.id,
            customerData,
          })
        ).unwrap();
        console.log("Customer detail updated successfully:", result);
        if (result.warning) {
          setSnackbar({
            open: true,
            message: `Thông tin đã được cập nhật nhưng ${result.warning}`,
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
        // Otherwise create a new one
        console.log("Creating new customer detail");
        const result = await dispatch(createCustomer(customerData)).unwrap();
        console.log("Customer created successfully:", result);
        setSnackbar({
          open: true,
          message: "Tạo thông tin doanh nghiệp thành công",
          severity: "success",
        });
      }

      // Now check if the user already has any customer choice
      const customerId = user.id;

      try {
        const customerChoicesResponse = await dispatch(
          fetchCustomerChoices(customerId)
        ).unwrap();

        console.log("Customer choices response:", customerChoicesResponse);

        // If we have an existing customer choice with product type
        if (customerChoicesResponse && customerChoicesResponse.productTypeId) {
          // We found an existing choice, skip step 3 and go to step 4
          const existingProductTypeId = customerChoicesResponse.productTypeId;
          console.log("Found existing product type ID:", existingProductTypeId);

          // Update local state
          setBillboardType(existingProductTypeId);
          setCurrentStep(4);

          // Fetch attributes for the selected product type
          dispatch(fetchAttributesByProductTypeId(existingProductTypeId));

          // Navigate to step 4 with the found product type
          navigate(`/ai-design?step=billboard&type=${existingProductTypeId}`);

          // Show a snackbar indicating we're continuing with existing choice
          setSnackbar({
            open: true,
            message: "Tiếp tục với thiết kế hiện tại",
            severity: "info",
          });
        } else {
          // No existing choice or no product type associated, continue to step 3
          console.log("No existing customer choice found, moving to step 3");
          setCurrentStep(3);
          navigate("/ai-design?step=billboard");
        }
      } catch (error) {
        console.error("Error checking for existing customer choices:", error);

        // If we fail to check, just continue to step 3 as a fallback
        setCurrentStep(3);
        navigate("/ai-design?step=billboard");

        // Maybe show a subtle warning
        setSnackbar({
          open: true,
          message:
            "Không thể kiểm tra thiết kế hiện có, tiếp tục với thiết kế mới",
          severity: "warning",
        });
      }
    } catch (error) {
      console.error("Failed to save customer details. Full error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }

      // Show error message to user
      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.",
        severity: "error",
      });
    }
  };

  const handleBillboardSubmit = (e) => {
    e.preventDefault();
    console.log("Billboard form submitted");

    const sizesConfirmed =
      document.querySelector("svg.text-green-500") !== null;

    if (!sizesConfirmed) {
      setError("Vui lòng xác nhận kích thước trước khi tiếp tục.");
      console.log("Sizes not confirmed, showing error");
      return;
    }

    console.log("Sizes confirmed, proceeding to sample products step");

    // Directly change to case 4.5 without showing loading animation
    setCurrentStep(4.5);
    navigate("/ai-design");
    console.log("Navigation complete");
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
        // Move to step 5 after successful generation start
        setCurrentStep(5);
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

  const handleBillboardTypeSelect = async (productTypeId) => {
    // First check if we have the customer details
    if (!user?.id) {
      console.error("No user ID found.");
      setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      // Check if user already has a customer choice for this product type
      const customerChoicesResponse = await dispatch(
        fetchCustomerChoices(user.id)
      ).unwrap();

      if (
        customerChoicesResponse &&
        customerChoicesResponse.productTypeId === productTypeId
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

      // If no existing choice, create a new one
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
          setCurrentStep(3);
          navigate("/ai-design?step=billboard");
        });
    } else {
      // If there's no customer choice to delete, just navigate back
      setBillboardType("");
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
    { number: 4.5, label: "Chọn mẫu thiết kế" },
    { number: 5, label: "Xem trước" },
    { number: 6, label: "Xác nhận đơn hàng" },
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
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-5xl font-bold text-custom-dark mb-8 bg-clip-text text-transparent bg-gradient-to-r from-custom-primary to-custom-secondary"
              variants={itemVariants}
            >
              Thiết kế quảng cáo với AI
            </motion.h1>
            <motion.p
              className="text-xl text-black mb-12 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Tạo biển hiệu đẹp mắt cho bạn trong vài phút với sự hỗ trợ của
              công nghệ AI tiên tiến.
            </motion.p>
            <motion.button
              onClick={() => {
                setCurrentStep(2);
                navigate("/ai-design?step=business");
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

            {customerError && (
              <motion.div
                className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                variants={itemVariants}
              >
                {customerError}
              </motion.div>
            )}

            <motion.form
              onSubmit={handleBusinessSubmit}
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
                  onChange={handleInputChange}
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
                  id="tagLine"
                  name="tagLine"
                  value={businessInfo.tagLine}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="customerDetailLogo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Logo công ty
                </label>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    id="customerDetailLogo"
                    name="customerDetailLogo"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                    required={!customerDetail}
                  />
                  {(businessInfo.logoPreview || customerDetail?.logoUrl) && (
                    <div className="mt-2 relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={
                          businessInfo.logoPreview || customerDetail?.logoUrl
                        }
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="flex justify-end space-x-4 pt-4"
                variants={itemVariants}
              >
                <motion.button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    navigate("/ai-design");
                  }}
                  className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={customerStatus === "loading"}
                >
                  Hủy
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-custom-primary text-white font-medium rounded-lg hover:bg-custom-secondary transition-all shadow-md hover:shadow-lg flex items-center"
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
                      {customerDetail ? "Cập nhật" : "Tiếp tục"}
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
                    </>
                  )}
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
                      Hoàn thành
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
              </motion.div>
            </motion.form>
          </motion.div>
        );
      case 4.5:
        return (
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-3xl font-bold text-custom-dark mb-6 text-center"
              variants={itemVariants}
            >
              Chọn mẫu thiết kế
            </motion.h2>

            <motion.p
              className="text-gray-600 mb-8 text-center"
              variants={itemVariants}
            >
              Chọn một mẫu thiết kế phù hợp với doanh nghiệp của bạn
            </motion.p>

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
                  onClick={() =>
                    dispatch(fetchDesignTemplatesByProductTypeId(billboardType))
                  }
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Tải lại
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {designTemplates && designTemplates.length > 0 ? (
                  designTemplates.map((template) => (
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
                      <img
                        src={template.image}
                        alt={template.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white rounded-full p-2">
                          <FaCheck className="w-6 h-6 text-custom-secondary" />
                        </div>
                      </div>
                      {selectedSampleProduct === template.id && (
                        <div className="absolute top-2 right-2 bg-custom-secondary text-white rounded-full p-2">
                          <FaCheckCircle className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3">
                        <h3 className="font-medium text-lg">{template.name}</h3>
                        <p className="text-sm text-gray-300 truncate">
                          {template.description}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">
                      Không có mẫu thiết kế nào cho loại biển hiệu này
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Display design notes area only after selecting a template */}
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
                      Chi tiết sẽ giúp AI tạo thiết kế phù hợp hơn với nhu cầu
                      của bạn
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
                onClick={handleContinueToPreview}
                className={`px-8 py-3 font-medium rounded-lg transition-all flex items-center ${
                  selectedSampleProduct && customerNote.trim()
                    ? "bg-custom-primary text-white hover:bg-custom-secondary"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                whileHover={
                  selectedSampleProduct && customerNote.trim()
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  selectedSampleProduct && customerNote.trim()
                    ? { scale: 0.98 }
                    : {}
                }
                disabled={!selectedSampleProduct || !customerNote.trim()}
              >
                Tiếp tục
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
                    setCurrentStep(6);
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
      case 6:
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
              Chỉnh sửa thiết kế
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Business Info Panel - Bên trái */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Thông tin doanh nghiệp
                  </h3>

                  <div className="space-y-4">
                    {/* Company Name */}
                    {businessPresets.companyName && (
                      <div
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                        onClick={() =>
                          addBusinessInfoToCanvas(
                            "companyName",
                            businessPresets.companyName
                          )
                        }
                      >
                        <div className="flex items-center mb-2">
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
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all"
                        onClick={() =>
                          addBusinessInfoToCanvas(
                            "tagLine",
                            businessPresets.tagLine
                          )
                        }
                      >
                        <div className="flex items-center mb-2">
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
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all"
                        onClick={() =>
                          addBusinessInfoToCanvas(
                            "contactInfo",
                            businessPresets.contactInfo
                          )
                        }
                      >
                        <div className="flex items-center mb-2">
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
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all"
                        onClick={() =>
                          addBusinessInfoToCanvas(
                            "logoUrl",
                            s3Logo || businessPresets.logoUrl
                          )
                        }
                      >
                        <div className="flex items-center mb-2">
                          <FaPalette className="text-purple-500 mr-2" />
                          <span className="text-sm font-medium text-gray-600">
                            Logo
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <img
                            src={s3Logo || businessPresets.logoUrl}
                            alt="Logo preview"
                            className="w-8 h-8 object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <span className="text-sm text-gray-800">
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
                        <div className="text-center py-6">
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

              {/* Canvas Area */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Canvas</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={addText}
                        className="px-4 py-2 bg-custom-secondary text-white rounded-lg hover:bg-custom-secondary/90 flex items-center"
                      >
                        <FaPlus className="mr-2" />
                        Thêm text
                      </button>
                      <button
                        onClick={deleteSelectedText}
                        disabled={!selectedText}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 flex items-center"
                      >
                        <FaTrash className="mr-2" />
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <canvas ref={canvasRef} />
                  </div>
                </div>
              </div>

              {/* Text Controls - Bên phải */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Tùy chỉnh text</h3>

                  {selectedText ? (
                    <div className="space-y-4">
                      {/* Text Content */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nội dung
                        </label>
                        <textarea
                          value={textSettings.text}
                          onChange={(e) => {
                            updateTextProperty("text", e.target.value);
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                          rows={3}
                        />
                      </div>

                      {/* Font Family */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Font chữ
                        </label>
                        <select
                          value={textSettings.fontFamily}
                          onChange={(e) =>
                            updateTextProperty("fontFamily", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          {fonts.map((font) => (
                            <option key={font} value={font}>
                              {font}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Font Size */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
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
                        <label className="block text-sm font-medium mb-2">
                          Màu chữ
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={textSettings.fill}
                            onChange={(e) =>
                              updateTextProperty("fill", e.target.value)
                            }
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={textSettings.fill}
                            onChange={(e) =>
                              updateTextProperty("fill", e.target.value)
                            }
                            className="flex-1 p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Text Style Controls */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Kiểu chữ
                        </label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              updateTextProperty(
                                "fontWeight",
                                textSettings.fontWeight === "bold"
                                  ? "normal"
                                  : "bold"
                              )
                            }
                            className={`p-2 rounded border ${
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
                            className={`p-2 rounded border ${
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
                            className={`p-2 rounded border ${
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
                        <label className="block text-sm font-medium mb-2">
                          Màu phổ biến
                        </label>
                        <div className="grid grid-cols-4 gap-2">
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
                              className="w-8 h-8 rounded border border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
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
                onClick={() => setCurrentStep(5)}
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
                  <>Xuất và Lưu thiết kế</>
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
                    Xuất thiết kế trước khi đặt hàng
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
    <div className="min-h-screen bg-gradient-animated py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
              {currentStep === 4.5
                ? "Hệ thống AI đang tạo các bản thiết kế dựa trên mẫu bạn đã chọn. Vui lòng đợi trong giây lát..."
                : "Hệ thống AI đang phân tích yêu cầu và tạo ra các mẫu thiết kế phù hợp với thông số kỹ thuật của bạn. Vui lòng chờ trong giây lát..."}
            </p>
          </div>
        </div>
      </Backdrop>

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
