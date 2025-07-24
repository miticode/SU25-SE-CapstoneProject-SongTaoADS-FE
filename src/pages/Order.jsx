import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  CardMedia,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  ShoppingCart,
  LocationOn,
  Category,
  CheckCircle,
  Edit,
  Inventory,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import {
  createNewOrder,
  addOrderDetail,
  ORDER_TYPE_MAP,
  selectOrderStatus,
  selectCurrentOrder,
} from "../store/features/order/orderSlice";
import { 
  fetchEditedDesignById,
  selectEditedDesignDetail,
  selectEditedDesignDetailStatus,
  selectEditedDesignDetailError,
  clearEditedDesignDetail
} from "../store/features/background/backgroundSlice";
import { getImageFromS3 } from "../api/s3Service";

const Order = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const orderStatus = useSelector(selectOrderStatus);
  const currentOrder = useSelector(selectCurrentOrder);

  // Selectors cho edited design detail
  const editedDesignDetail = useSelector(selectEditedDesignDetail);
  const editedDesignDetailStatus = useSelector(selectEditedDesignDetailStatus);
  const editedDesignDetailError = useSelector(selectEditedDesignDetailError);

  // Kiểm tra xem có phải đến từ trang AI Design không
  const isFromAIDesign = location.state?.fromAIDesign || false;
  const editedDesignId = location.state?.editedDesignId || null;
  const customerChoiceId = location.state?.customerChoiceId || null;

  const [formData, setFormData] = useState({
    address: "",
    orderType: isFromAIDesign ? "AI_DESIGN" : "",
    quantity: 1,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState(null);
  const [loadingEditedImage, setLoadingEditedImage] = useState(false);

  // Cập nhật orderType khi component mount nếu từ AI Design
  useEffect(() => {
    if (isFromAIDesign) {
      setFormData((prev) => ({
        ...prev,
        orderType: "AI_DESIGN",
      }));
    }
  }, [isFromAIDesign]);

  // Fetch edited design detail khi ở step 2 và có editedDesignId
  useEffect(() => {
    if (currentStep === 2 && isFromAIDesign && editedDesignId) {
      console.log("Order - Fetching edited design detail for step 2:", editedDesignId);
      dispatch(fetchEditedDesignById(editedDesignId));
    }

    // Cleanup khi component unmount hoặc không còn cần thiết
    return () => {
      if (currentStep !== 2) {
        dispatch(clearEditedDesignDetail());
        setEditedImageUrl(null);
        setLoadingEditedImage(false);
      }
    };
  }, [currentStep, isFromAIDesign, editedDesignId, dispatch]);

  // Fetch S3 image when editedDesignDetail.editedImage is available
  useEffect(() => {
    const fetchEditedImage = async () => {
      if (editedDesignDetail?.editedImage) {
        setLoadingEditedImage(true);
        try {
          console.log("Order - Fetching S3 image:", editedDesignDetail.editedImage);
          const response = await getImageFromS3(editedDesignDetail.editedImage);
          console.log("Order - S3 response:", response);
          
          // Kiểm tra response có imageUrl không
          if (response && response.imageUrl) {
            setEditedImageUrl(response.imageUrl);
            console.log("Order - S3 image loaded successfully:", response.imageUrl);
          } else {
            console.error("Order - S3 response không có imageUrl:", response);
            setEditedImageUrl(null);
          }
        } catch (error) {
          console.error("Lỗi khi tải ảnh từ S3:", error);
          setEditedImageUrl(null);
        } finally {
          setLoadingEditedImage(false);
        }
      } else {
        // Reset state khi không có editedImage
        setEditedImageUrl(null);
        setLoadingEditedImage(false);
      }
    };

    fetchEditedImage();
  }, [editedDesignDetail?.editedImage]);

  // Cleanup blob URL khi component unmount
  useEffect(() => {
    return () => {
      if (editedImageUrl && editedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editedImageUrl);
      }
    };
  }, [editedImageUrl]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0) {
      setFormData((prev) => ({
        ...prev,
        quantity: value,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (currentStep === 1) {
      // Bước 1: Validation và gọi API createNewOrder
      if (!formData.address.trim()) {
        setErrorMessage("Vui lòng nhập địa chỉ");
        setSuccessMessage("");
        return;
      }

      if (!formData.orderType && !isFromAIDesign) {
        setErrorMessage("Vui lòng chọn loại đơn hàng");
        setSuccessMessage("");
        return;
      }

      if (!formData.quantity || formData.quantity < 1) {
        setErrorMessage("Số lượng phải lớn hơn 0");
        setSuccessMessage("");
        return;
      }

      if (isFromAIDesign && (!editedDesignId || !customerChoiceId)) {
        setErrorMessage(
          "Thiếu thông tin thiết kế AI. Vui lòng quay lại trang thiết kế và thử lại."
        );
        setSuccessMessage("");
        return;
      }

      try {
        setErrorMessage("");
        setSuccessMessage("");

        const result = await dispatch(
          createNewOrder({
            address: formData.address.trim(),
            orderType: isFromAIDesign ? "AI_DESIGN" : formData.orderType,
            quantity: formData.quantity,
          })
        ).unwrap();

        console.log("Đơn hàng được tạo thành công:", result);
        setCurrentStep(2);
      } catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);

        if (error.includes("Phiên đăng nhập đã hết hạn")) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setErrorMessage("Phiên đăng nhập đã hết hạn. Đang chuyển hướng...");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }

        setErrorMessage(error || "Tạo đơn hàng thất bại");
      }
      return;
    }

    // Bước 2: Xác nhận đơn hàng và tạo order detail
    if (currentStep === 2) {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        if (isFromAIDesign) {
          if (!customerChoiceId) {
            setErrorMessage(
              "Thiếu customerChoiceId. Vui lòng quay lại trang thiết kế AI."
            );
            return;
          }

          if (!editedDesignId) {
            setErrorMessage(
              "Thiếu editedDesignId. Vui lòng quay lại trang thiết kế AI."
            );
            return;
          }

          if (!currentOrder?.id) {
            setErrorMessage(
              "Không tìm thấy thông tin đơn hàng. Vui lòng thử lại."
            );
            return;
          }

          if (!formData.quantity || formData.quantity < 1) {
            setErrorMessage("Số lượng phải lớn hơn 0.");
            return;
          }

          console.log("Thông tin trước khi gọi addOrderDetail:", {
            orderId: currentOrder.id,
            orderDetailData: {
              customerChoiceId: customerChoiceId,
              quantity: formData.quantity,
              editedDesignId: editedDesignId,
            },
          });

          const result = await dispatch(
            addOrderDetail({
              orderId: currentOrder.id,
              orderDetailData: {
                customerChoiceId: customerChoiceId,
                quantity: formData.quantity,
                editedDesignId: editedDesignId,
              },
            })
          ).unwrap();

          console.log("Order detail được tạo thành công:", {
            orderId: currentOrder.id,
            customerChoiceId,
            quantity: formData.quantity,
            editedDesignId,
            result,
          });
        } else {
          console.log("Xử lý đơn hàng thông thường (không từ AI Design)");
        }

        setSuccessMessage("Đơn hàng đã được xác nhận thành công! Đang chuyển đến lịch sử đơn hàng...");

        setTimeout(() => {
          navigate("/order-history");
        }, 2000);
      } catch (error) {
        console.error("Lỗi xác nhận đơn hàng:", error);
        setErrorMessage(error || "Xác nhận đơn hàng thất bại");
      }
      return;
    }
  };

  const handleBackToEdit = () => {
    setCurrentStep(1);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const steps = ["Thông tin đơn hàng", "Xác nhận đơn hàng"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header với animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
            <ShoppingCart className="text-white text-3xl" />
          </div>
          <Typography
            variant="h3"
            component="h1"
            className="font-bold text-gray-800 mb-2 text-2xl sm:text-3xl lg:text-4xl"
          >
            {currentStep === 1
              ? isFromAIDesign
                ? "Đặt Hàng Thiết Kế AI"
                : "Tạo Đơn Hàng Mới"
              : "Xác Nhận Đơn Hàng"}
          </Typography>
          <Typography
            variant="subtitle1"
            className="text-gray-600 max-w-2xl mx-auto"
          >
            {currentStep === 1
              ? "Vui lòng điền thông tin để tạo đơn hàng của bạn"
              : "Kiểm tra lại thông tin trước khi xác nhận"}
          </Typography>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <Paper
            elevation={0}
            className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200"
          >
            <Stepper activeStep={currentStep - 1} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                          completed || active
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <span className="text-sm font-semibold">
                            {index + 1}
                          </span>
                        )}
                      </div>
                    )}
                  >
                    <Typography className="text-sm font-medium text-gray-700 mt-2">
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </div>

        {/* AI Design Information Alert */}

        {/* Main Content Card */}
        <Paper
          elevation={0}
          className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden"
        >
          <div
            className={`p-6 sm:p-8 lg:p-10 ${
              currentStep === 1
                ? "bg-gradient-to-r from-gray-50 to-blue-50"
                : "bg-gradient-to-r from-green-50 to-emerald-50"
            }`}
          >
            {currentStep === 1 ? (
              // Bước 1: Form nhập thông tin
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Address Input */}
                <div className="space-y-3">
                  <label className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                    <LocationOn className="w-5 h-5 mr-2 text-blue-500" />
                    Địa chỉ giao hàng
                  </label>
                  <TextField
                    fullWidth
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ giao hàng chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)..."
                    variant="outlined"
                    required
                    multiline
                    rows={3}
                    className="bg-white"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        fontSize: "1rem",
                        "&:hover fieldset": {
                          borderColor: "#3B82F6",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#3B82F6",
                          borderWidth: "2px",
                        },
                      },
                    }}
                  />
                </div>

                {/* Order Type Select - Chỉ hiển thị nếu không phải từ AI Design */}
                {!isFromAIDesign && (
                  <div className="space-y-3">
                    <label className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                      <Category className="w-5 h-5 mr-2 text-purple-500" />
                      Loại đơn hàng
                    </label>
                    <FormControl fullWidth required>
                      <Select
                        name="orderType"
                        value={formData.orderType}
                        onChange={handleInputChange}
                        displayEmpty
                        className="bg-white"
                        sx={{
                          borderRadius: "16px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderRadius: "16px",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3B82F6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3B82F6",
                            borderWidth: "2px",
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          <Typography className="text-gray-500">
                            Chọn loại đơn hàng
                          </Typography>
                        </MenuItem>
                        {Object.entries(ORDER_TYPE_MAP).map(([key, value]) => (
                          <MenuItem key={key} value={key} className="py-3">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-4 h-4 rounded-full`}
                                style={{
                                  backgroundColor: `var(--${value.color}-500, #3B82F6)`,
                                }}
                              />
                              <Typography className="font-medium">
                                {value.label}
                              </Typography>
                            </div>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                )}

                {/* AI Design Order Type Display */}
                {isFromAIDesign && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <Typography
                          variant="h6"
                          className="text-green-800 font-semibold"
                        >
                          Loại đơn hàng:{" "}
                          {ORDER_TYPE_MAP.AI_DESIGN?.label || "Thiết kế AI"}
                        </Typography>
                        <Typography variant="body2" className="text-green-600">
                          Đã được thiết lập tự động cho đơn hàng thiết kế AI
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error and Success Messages */}
                {errorMessage && (
                  <Alert
                    severity="error"
                    className="rounded-xl border-l-4 border-red-400"
                    sx={{ "& .MuiAlert-message": { fontSize: "1rem" } }}
                  >
                    {errorMessage}
                  </Alert>
                )}

                {successMessage && (
                  <Alert
                    severity="success"
                    className="rounded-xl border-l-4 border-green-400"
                    sx={{ "& .MuiAlert-message": { fontSize: "1rem" } }}
                  >
                    {successMessage}
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={orderStatus === "loading"}
                    className="py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                    sx={{
                      background:
                        "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                      },
                      "&:disabled": {
                        background:
                          "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)",
                      },
                    }}
                    startIcon={
                      orderStatus === "loading" ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <ArrowForward />
                      )
                    }
                  >
                    {orderStatus === "loading"
                      ? "Đang tạo đơn hàng..."
                      : "Tiếp tục"}
                  </Button>
                </div>
              </form>
            ) : (
              // Bước 2: Xác nhận đơn hàng
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <Typography
                    variant="h5"
                    className="text-gray-800 font-bold mb-2"
                  >
                    Kiểm tra thông tin đơn hàng
                  </Typography>
                  <Typography variant="body1" className="text-gray-600">
                    Vui lòng xác nhận lại thông tin trước khi hoàn tất đơn hàng
                  </Typography>
                </div>

                {/* Order Information Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                    <Typography
                      variant="h6"
                      className="text-white font-semibold"
                    >
                      Chi tiết đơn hàng
                    </Typography>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Address */}
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <LocationOn className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500 uppercase tracking-wide text-xs font-semibold mb-1"
                        >
                          Địa chỉ giao hàng
                        </Typography>
                        <Typography
                          variant="body1"
                          className="text-gray-800 font-medium"
                        >
                          {formData.address}
                        </Typography>
                      </div>
                    </div>

                    {/* Order Type */}
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Category className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500 uppercase tracking-wide text-xs font-semibold mb-1"
                        >
                          Loại đơn hàng
                        </Typography>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: `var(--${
                                ORDER_TYPE_MAP[
                                  isFromAIDesign
                                    ? "AI_DESIGN"
                                    : formData.orderType
                                ]?.color || "blue"
                              }-500, #3B82F6)`,
                            }}
                          />
                          <Typography
                            variant="body1"
                            className="text-gray-800 font-medium"
                          >
                            {ORDER_TYPE_MAP[
                              isFromAIDesign ? "AI_DESIGN" : formData.orderType
                            ]?.label || "Không xác định"}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Inventory className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500 uppercase tracking-wide text-xs font-semibold mb-1"
                        >
                          Số lượng
                        </Typography>
                        <div className="flex items-center space-x-3">
                          <TextField
                            type="number"
                            value={formData.quantity}
                            onChange={handleQuantityChange}
                            inputProps={{
                              min: 1,
                              max: 999,
                              style: {
                                textAlign: "center",
                                fontSize: "1.1rem",
                                fontWeight: "600",
                              },
                            }}
                            sx={{
                              width: 120,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                "& fieldset": {
                                  borderColor: "#10B981",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#059669",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#059669",
                                  borderWidth: "2px",
                                },
                              },
                            }}
                          />
                          <Typography variant="body2" className="text-gray-600">
                            sản phẩm
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* AI Design Information */}
                    {isFromAIDesign && (
                      <>
                        <div className="border-t border-gray-200 pt-6">
                     
                          

                          {/* Design Image từ API */}
                          {editedDesignId && (
                            <div className="space-y-3">
                              <Typography
                                variant="subtitle2"
                                className="text-gray-700 font-semibold"
                              >
                                Ảnh thiết kế đã chỉnh sửa
                              </Typography>

                              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                {editedDesignDetailStatus === 'loading' ? (
                                  <div className="h-64 flex items-center justify-center">
                                    <div className="text-center">
                                      <CircularProgress size={40} className="mb-4" />
                                      <Typography variant="body2" className="text-gray-600">
                                        Đang tải thông tin thiết kế...
                                      </Typography>
                                    </div>
                                  </div>
                                ) : editedDesignDetailError ? (
                                  <div className="h-64 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
                                    <div className="text-center">
                                      <Typography variant="body2" className="text-red-600 mb-2">
                                        Lỗi khi tải thông tin thiết kế
                                      </Typography>
                                      <Typography variant="caption" className="text-red-500">
                                        {editedDesignDetailError}
                                      </Typography>
                                    </div>
                                  </div>
                                ) : loadingEditedImage ? (
                                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border">
                                    <div className="text-center">
                                      <CircularProgress size={40} className="mb-3" />
                                      <Typography variant="body2" className="text-gray-600">
                                        Đang tải ảnh từ S3...
                                      </Typography>
                                    </div>
                                  </div>
                                ) : editedImageUrl ? (
                                  <CardMedia
                                    component="img"
                                    image={editedImageUrl}
                                    alt="Ảnh thiết kế đã chỉnh sửa từ S3"
                                    className="w-full max-h-80 object-contain rounded-lg shadow-sm"
                                    onLoad={() => {
                                      console.log("Order - Ảnh từ S3 đã load thành công:", editedImageUrl);
                                    }}
                                    onError={(e) => {
                                      console.error("Order - Lỗi tải ảnh từ S3:", e, editedImageUrl);
                                    }}
                                  />
                                ) : editedDesignDetail?.editedImage ? (
                                  <div className="h-64 flex items-center justify-center bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="text-center">
                                      <Typography variant="body2" className="text-yellow-700 mb-2">
                                        Lỗi tải ảnh từ S3
                                      </Typography>
                                      <Typography variant="caption" className="text-yellow-600">
                                        Key: {editedDesignDetail.editedImage}
                                      </Typography>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                                    <Typography variant="body2" className="text-gray-500">
                                      {editedDesignDetailStatus === 'succeeded' 
                                        ? "Không có ảnh thiết kế" 
                                        : "Đang tải thông tin thiết kế..."}
                                    </Typography>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Customer Note từ API */}
                          {editedDesignDetail?.customerNote && (
                            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                              <Typography variant="subtitle2" className="text-yellow-700 font-semibold mb-2">
                                Ghi chú từ khách hàng
                              </Typography>
                              <Typography variant="body2" className="text-yellow-800">
                                {editedDesignDetail.customerNote}
                              </Typography>
                            </div>
                          )}

                          {/* Thông tin bổ sung từ API */}
                          {editedDesignDetail && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Template thông tin */}
                              {editedDesignDetail.designTemplates && (
                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                                  <Typography variant="subtitle2" className="text-orange-600 font-semibold mb-2">
                                    Mẫu thiết kế
                                  </Typography>
                                  <Typography variant="body2" className="text-orange-800 font-medium">
                                    {editedDesignDetail.designTemplates.name}
                                  </Typography>
                                  {editedDesignDetail.designTemplates.description && (
                                    <Typography variant="caption" className="text-orange-700 block mt-1">
                                      {editedDesignDetail.designTemplates.description}
                                    </Typography>
                                  )}
                                </div>
                              )}

                              {/* Background thông tin */}
                              {editedDesignDetail.backgrounds && (
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                                  <Typography variant="subtitle2" className="text-indigo-600 font-semibold mb-2">
                                    Background sử dụng
                                  </Typography>
                                  <Typography variant="body2" className="text-indigo-800 font-medium">
                                    {editedDesignDetail.backgrounds.name}
                                  </Typography>
                                  {editedDesignDetail.backgrounds.description && (
                                    <Typography variant="caption" className="text-indigo-700 block mt-1">
                                      {editedDesignDetail.backgrounds.description}
                                    </Typography>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Thời gian tạo và cập nhật */}
                          {editedDesignDetail && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <Typography variant="subtitle2" className="text-blue-600 font-semibold mb-2">
                                  Ngày tạo thiết kế
                                </Typography>
                                <Typography variant="body2" className="text-blue-800 font-mono">
                                  {editedDesignDetail.createdAt 
                                    ? new Date(editedDesignDetail.createdAt).toLocaleString('vi-VN')
                                    : 'N/A'}
                                </Typography>
                              </div>

                              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                <Typography variant="subtitle2" className="text-green-600 font-semibold mb-2">
                                  Ngày cập nhật
                                </Typography>
                                <Typography variant="body2" className="text-green-800 font-mono">
                                  {editedDesignDetail.updatedAt 
                                    ? new Date(editedDesignDetail.updatedAt).toLocaleString('vi-VN')
                                    : 'N/A'}
                                </Typography>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Error and Success Messages */}
                {errorMessage && (
                  <Alert
                    severity="error"
                    className="rounded-xl border-l-4 border-red-400"
                    sx={{ "& .MuiAlert-message": { fontSize: "1rem" } }}
                  >
                    {errorMessage}
                  </Alert>
                )}

                {successMessage && (
                  <Alert
                    severity="success"
                    className="rounded-xl border-l-4 border-green-400"
                    sx={{ "& .MuiAlert-message": { fontSize: "1rem" } }}
                  >
                    {successMessage}
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={handleBackToEdit}
                    className="py-4 text-lg font-semibold rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
                    sx={{
                      borderColor: "#6B7280",
                      color: "#6B7280",
                      "&:hover": {
                        borderColor: "#374151",
                        color: "#374151",
                        backgroundColor: "#F9FAFB",
                      },
                    }}
                    startIcon={<ArrowBack />}
                  >
                    Quay lại chỉnh sửa
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={orderStatus === "loading"}
                    className="py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                    sx={{
                      background:
                        "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      },
                      "&:disabled": {
                        background:
                          "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)",
                      },
                    }}
                    startIcon={
                      orderStatus === "loading" ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <CheckCircle />
                      )
                    }
                  >
                    {orderStatus === "loading"
                      ? "Đang xác nhận..."
                      : "Xác nhận đơn hàng"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Paper>

        {/* Information Box - Chỉ hiển thị ở bước 1 */}
        {currentStep === 1 && (
          <div className="mt-8">
            <Paper
              elevation={0}
              className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <Typography variant="h6" className="text-white font-semibold">
                  💡 Thông tin về các loại đơn hàng
                </Typography>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold text-blue-800"
                      >
                        Thiết kế AI
                      </Typography>
                    </div>
                    <Typography variant="body2" className="text-blue-700">
                      Đơn hàng sử dụng thiết kế được tạo bởi trí tuệ nhân tạo
                      với độ chính xác cao
                    </Typography>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold text-green-800"
                      >
                        Thiết kế tùy chỉnh có thi công
                      </Typography>
                    </div>
                    <Typography variant="body2" className="text-green-700">
                      Đơn hàng thiết kế theo yêu cầu riêng và bao gồm dịch vụ
                      thi công chuyên nghiệp
                    </Typography>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold text-purple-800"
                      >
                        Thiết kế tùy chỉnh không thi công
                      </Typography>
                    </div>
                    <Typography variant="body2" className="text-purple-700">
                      Đơn hàng chỉ thiết kế theo yêu cầu, không bao gồm dịch vụ
                      thi công
                    </Typography>
                  </div>
                </div>
              </div>
            </Paper>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
