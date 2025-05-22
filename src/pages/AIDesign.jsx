import React, { useState, useEffect } from "react";
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
      const fieldName = `size_${ptSize.size.id}`;
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
          sizeInputs[ptSize.size.id] = numValue;
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
              productTypeSizes.find((pt) => pt.size.id === sizeId)?.size
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
                  const sizeId = ptSize.size.id;
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
                          label={ptSize.size.name}
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
            <Box mt={2}>
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
            </Box>
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

  const currentOrder = useSelector(selectCurrentOrder);
  const attributes = useSelector(selectAllAttributes);
  const attributeStatus = useSelector(selectAttributeStatus);
  const attributeError = useSelector(selectAttributeError);
  const customerDetail = useSelector(selectCustomerDetail);
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    contactInfo: "",
    logoUrl: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Tạm thời sử dụng 4 ảnh mẫu
  const previewImages = [
    {
      id: 1,
      url: "https://bienhieudep.vn/wp-content/uploads/2022/08/mau-bien-quang-cao-nha-hang-dep-37.jpg",
      title: "Mẫu 1",
    },
    {
      id: 2,
      url: "https://q8laser.com/wp-content/uploads/2021/01/thi-cong-bien-hieu-quang-cao.jpg",
      title: "Mẫu 2",
    },
    {
      id: 3,
      url: "https://bienquangcao247.com/wp-content/uploads/2024/07/lam-bien-quang-cao-01.jpg",
      title: "Mẫu 3",
    },
    {
      id: 4,
      url: "https://bienquangcao247.com/wp-content/uploads/2024/07/bang-hieu-quang-cao-01.jpg",
      title: "Mẫu 4",
    },
  ];

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
    if (currentStep === 4 && billboardType && attributeStatus === "idle") {
      dispatch(fetchAttributesByProductTypeId(billboardType));
    }
  }, [currentStep, billboardType, dispatch, attributeStatus]);
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
        address: customerDetail.tagLine || "",
        contactInfo: customerDetail.contactInfo || "",
        logoUrl: customerDetail.logoUrl || "",
      });
    }
  }, [customerDetail]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    console.log("Current user state:", user);
    if (!user?.id) {
      console.error("No user ID found in user state:", user);
      return;
    }

    const customerData = {
      logoUrl: businessInfo.logoUrl,
      companyName: businessInfo.companyName,
      tagLine: businessInfo.address,
      contactInfo: businessInfo.contactInfo,
      userId: user.id,
    };

    console.log("Customer data to be sent:", customerData);

    try {
      // If we already have a customer detail, update it
      if (customerDetail) {
        console.log("Updating existing customer detail:", customerDetail.id);
        const result = await dispatch(
          updateCustomerDetail({
            customerDetailId: customerDetail.id,
            customerData,
          })
        ).unwrap();
        console.log("Customer detail updated successfully:", result);
      } else {
        // Otherwise create a new one
        console.log("Creating new customer detail");
        const result = await dispatch(createCustomer(customerData)).unwrap();
        console.log("Customer created successfully:", result);
      }

      // Advance to the next step
      setCurrentStep(3);
      navigate("/ai-design?step=billboard");
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
    }
  };

  const handleBillboardSubmit = (e) => {
    e.preventDefault();
    console.log("Billboard form submitted");

    // Use a more specific selector to find the confirmation text
    const confirmationElement = document
      .querySelector(".text-green-500")
      ?.closest("Typography");
    const sizesConfirmed =
      document.querySelector("svg.text-green-500") !== null;

    if (!sizesConfirmed) {
      setError("Vui lòng xác nhận kích thước trước khi tiếp tục.");
      console.log("Sizes not confirmed, showing error");
      return;
    }

    console.log("Sizes confirmed, proceeding to next step");

    // Show the AI generating animation for a better user experience
    setIsGenerating(true);

    // Use setTimeout to ensure the state changes have time to take effect
    setTimeout(() => {
      // Change state first
      setCurrentStep(5);
      setIsGenerating(false);

      // Then navigate (after a small delay to ensure state is updated)
      setTimeout(() => {
        navigate("/ai-design");
        console.log("Navigation complete");
      }, 100);
    }, 1000);
  };

  const handleImageSelect = (imageId) => {
    setSelectedImage(imageId);
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
      const orderData = {
        totalAmount: 500000, // Sẽ được tính toán dựa trên các lựa chọn
        note: "Đơn hàng thiết kế AI",
        isCustomDesign: true,
        histories: [`Đơn hàng được tạo lúc ${new Date().toLocaleString()}`],
        userId: user.id,
        aiDesignId: selectedImage?.toString(), // Chuyển đổi ID ảnh đã chọn thành string
      };

      const response = await createOrderApi(orderData);

      if (response.success) {
        setSnackbar({
          open: true,
          message: "Đơn hàng đã được tạo thành công!",
          severity: "success",
        });

        // Sau 3 giây sẽ đóng popup và chuyển về trang chủ
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/");
        }, 3000);
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Có lỗi xảy ra khi tạo đơn hàng",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
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
      // Find the appropriate customer ID to use
      const userId = user.id;
      console.log(`Linking user ${userId} to product type ${productTypeId}`);
      // Dispatch the action to link customer with product type
      const resultAction = await dispatch(
        linkCustomerToProductType({
          customerId: userId, // Always use the user ID from authentication
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
      // Handle error - maybe show a notification to the user
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
    { number: 5, label: "Xem trước" },
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
                  id="address"
                  name="address"
                  value={businessInfo.address}
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
                  htmlFor="logoUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  URL Logo công ty
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={businessInfo.logoUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                  placeholder="https://example.com/logo.png"
                  required
                />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {previewImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-300 ${
                    selectedImage === image.id
                      ? "ring-4 ring-custom-secondary scale-105"
                      : "hover:scale-105"
                  }`}
                  onClick={() => handleImageSelect(image.id)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white rounded-full p-2">
                      <FaCheck className="w-6 h-6 text-custom-secondary" />
                    </div>
                  </div>
                  {selectedImage === image.id && (
                    <div className="absolute top-2 right-2 bg-custom-secondary text-white rounded-full p-2">
                      <FaCheckCircle className="w-6 h-6" />
                    </div>
                  )}
                </motion.div>
              ))}
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
                onClick={handleConfirm}
                disabled={!selectedImage}
                className={`px-8 py-3 font-medium rounded-lg transition-all flex items-center ${
                  selectedImage
                    ? "bg-custom-secondary text-white hover:bg-custom-secondary/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <FaCheck className="mr-2" />
                Xác nhận
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
              Hệ thống AI đang phân tích yêu cầu và tạo ra các mẫu thiết kế phù
              hợp với thông số kỹ thuật của bạn. Vui lòng chờ trong giây lát...
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
