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
  deleteOrder,
  setCurrentOrder,
  ORDER_TYPE_MAP,
  selectOrderStatus,
  selectCurrentOrder,
  fetchOrderDetails,
  selectOrderDetails,
  selectOrderDetailsStatus,
  selectOrderDetailsError,
} from "../store/features/order/orderSlice";
import { 
  fetchEditedDesignById,
  selectEditedDesignDetail,
  selectEditedDesignDetailStatus,
  selectEditedDesignDetailError,
  clearEditedDesignDetail
} from "../store/features/background/backgroundSlice";
import { getImageFromS3 } from "../api/s3Service";

// Component để load ảnh từ S3
const S3Image = ({ imageKey, alt, className }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!imageKey) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getImageFromS3(imageKey);
        if (response && response.imageUrl) {
          setImageUrl(response.imageUrl);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Lỗi tải ảnh từ S3:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    // Cleanup blob URL
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
        <CircularProgress size={30} />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
        <Typography variant="caption" className="text-gray-500">
          Không thể tải ảnh
        </Typography>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

const Order = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const orderStatus = useSelector(selectOrderStatus);
  const currentOrder = useSelector(selectCurrentOrder);

  // Selectors cho order details (step 3)
  const orderDetails = useSelector(selectOrderDetails);
  const orderDetailsStatus = useSelector(selectOrderDetailsStatus);
  const orderDetailsError = useSelector(selectOrderDetailsError);

  // Selectors cho edited design detail
  const editedDesignDetail = useSelector(selectEditedDesignDetail);
  const editedDesignDetailStatus = useSelector(selectEditedDesignDetailStatus);
  const editedDesignDetailError = useSelector(selectEditedDesignDetailError);

  // Kiểm tra xem có phải đến từ trang AI Design không
  const isFromAIDesign = location.state?.fromAIDesign || false;
  const editedDesignId = location.state?.editedDesignId || null;
  const customerChoiceId = location.state?.customerChoiceId || null;
  
  // Kiểm tra có sử dụng order có sẵn không (từ localStorage hoặc location.state)
  const localStorageOrderId = localStorage.getItem('orderIdForNewOrder');
  const useExistingOrder = location.state?.useExistingOrder || !!localStorageOrderId;
  const existingOrderId = location.state?.existingOrderId || localStorageOrderId;

  console.log("Order - Debug localStorage and existingOrderId:", {
    localStorageOrderId,
    locationStateOrderId: location.state?.existingOrderId,
    useExistingOrder,
    existingOrderId,
    typeOfExistingOrderId: typeof existingOrderId,
    shouldHideBackButton: !!existingOrderId
  });

  // Khôi phục AI design info từ localStorage nếu không có trong location.state
  const [aiDesignInfo] = useState(() => {
    const savedAIInfo = localStorage.getItem('orderAIDesignInfo');
    if (savedAIInfo) {
      try {
        return JSON.parse(savedAIInfo);
      } catch (error) {
        console.error("Lỗi parse AI design info từ localStorage:", error);
        return null;
      }
    }
    return null;
  });

  // Sử dụng giá trị từ location.state hoặc localStorage
  const finalIsFromAIDesign = isFromAIDesign || aiDesignInfo?.isFromAIDesign || false;
  const finalEditedDesignId = editedDesignId || aiDesignInfo?.editedDesignId || null;
  const finalCustomerChoiceId = customerChoiceId || aiDesignInfo?.customerChoiceId || null;

  // Lưu AI design info vào localStorage khi có
  useEffect(() => {
    if (finalIsFromAIDesign && finalEditedDesignId && finalCustomerChoiceId) {
      const aiDesignInfo = {
        isFromAIDesign: true,
        editedDesignId: finalEditedDesignId,
        customerChoiceId: finalCustomerChoiceId
      };
      localStorage.setItem('orderAIDesignInfo', JSON.stringify(aiDesignInfo));
    }
  }, [finalIsFromAIDesign, finalEditedDesignId, finalCustomerChoiceId]);

  const [formData, setFormData] = useState(() => {
    // Khôi phục formData từ localStorage khi component mount
    const savedFormData = localStorage.getItem('orderFormData');
    const defaultFormData = {
      address: "",
      orderType: finalIsFromAIDesign ? "AI_DESIGN" : "",
      quantity: 1,
    };
    
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        return {
          ...defaultFormData,
          ...parsedData,
          // Đảm bảo orderType được set đúng nếu từ AI Design
          orderType: finalIsFromAIDesign ? "AI_DESIGN" : parsedData.orderType || "",
        };
      } catch (error) {
        console.error("Lỗi parse formData từ localStorage:", error);
        return defaultFormData;
      }
    }
    
    return defaultFormData;
  });

  const [currentStep, setCurrentStep] = useState(() => {
    // Khôi phục step từ localStorage khi component mount
    const savedStep = localStorage.getItem('orderCurrentStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState(null);
  const [loadingEditedImage, setLoadingEditedImage] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(false);

  // Cập nhật orderType khi component mount nếu từ AI Design
  useEffect(() => {
    if (finalIsFromAIDesign) {
      setFormData((prev) => ({
        ...prev,
        orderType: "AI_DESIGN",
      }));
    }
  }, [finalIsFromAIDesign]);

  // Lưu currentStep vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('orderCurrentStep', currentStep.toString());
  }, [currentStep]);

  // Lưu formData vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('orderFormData', JSON.stringify(formData));
  }, [formData]);

  // Validate step khi component mount
  useEffect(() => {
    const savedStep = parseInt(localStorage.getItem('orderCurrentStep') || '1', 10);
    
    // Nếu step > 1 nhưng không có currentOrder, reset về step 1
    if (savedStep > 1 && !currentOrder) {
      console.log("Reset to step 1: No current order found");
      setCurrentStep(1);
      localStorage.setItem('orderCurrentStep', '1');
    }
    
    // Nếu step = 3 nhưng không có orderDetails, reset về step 1  
    if (savedStep === 3 && (!orderDetails || orderDetails.length === 0)) {
      console.log("Reset to step 1: No order details found for step 3");
      setCurrentStep(1);
      localStorage.setItem('orderCurrentStep', '1');
    }
  }, [currentOrder, orderDetails]);

  // Xử lý trường hợp sử dụng existing order từ localStorage
  useEffect(() => {
    if (useExistingOrder && existingOrderId && finalIsFromAIDesign) {
      console.log("Order - Sử dụng existing order:", existingOrderId);
      
      // Tạo mock currentOrder object với existingOrderId
      const mockOrder = {
        id: existingOrderId, // Giữ nguyên UUID string, không parse thành integer
        orderType: "AI_DESIGN",
        // Các thông tin khác sẽ được fetch từ API nếu cần
      };
      
      // Set currentOrder trong Redux store
      dispatch(setCurrentOrder(mockOrder));
      
      // Chuyển đến step 2 để xác nhận đơn hàng
      setCurrentStep(2);
      localStorage.setItem('orderCurrentStep', '2');
      
      console.log("Order - Đã setup existing order và chuyển đến step 2");
    }
  }, [useExistingOrder, existingOrderId, finalIsFromAIDesign, dispatch]);

  // Fetch edited design detail khi ở step 2 và có editedDesignId
  useEffect(() => {
    if (currentStep === 2 && finalIsFromAIDesign && finalEditedDesignId) {
      console.log("Order - Fetching edited design detail for step 2:", finalEditedDesignId);
      dispatch(fetchEditedDesignById(finalEditedDesignId));
    }

    // Cleanup khi component unmount hoặc không còn cần thiết
    return () => {
      if (currentStep !== 2) {
        dispatch(clearEditedDesignDetail());
        setEditedImageUrl(null);
        setLoadingEditedImage(false);
      }
    };
  }, [currentStep, finalIsFromAIDesign, finalEditedDesignId, dispatch]);

  // Fetch order details khi ở step 3
  useEffect(() => {
    // Lấy order ID từ currentOrder hoặc existingOrderId
    const orderIdToFetch = currentOrder?.id || existingOrderId;
    
    console.log("Order - Debug fetch order details:", {
      currentStep,
      currentOrderId: currentOrder?.id,
      existingOrderId: existingOrderId,
      orderIdToFetch: orderIdToFetch,
      typeOfOrderId: typeof orderIdToFetch
    });
    
    if (currentStep === 3 && orderIdToFetch) {
      console.log("Order - Fetching order details for step 3:", orderIdToFetch);
      dispatch(fetchOrderDetails(orderIdToFetch));
    }
  }, [currentStep, currentOrder?.id, existingOrderId, dispatch]);

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

  // Cleanup localStorage khi component unmount
  useEffect(() => {
    return () => {
      // Chỉ clear localStorage nếu đã hoàn tất đơn hàng (step 3)
      const savedStep = localStorage.getItem('orderCurrentStep');
      if (savedStep && parseInt(savedStep, 10) === 3) {
        // Có thể clear sau một thời gian delay để user có thể reload ở step 3
        // localStorage.removeItem('orderCurrentStep');
        // localStorage.removeItem('orderFormData');
      }
    };
  }, []);

  // Clear localStorage khi navigate sang trang khác từ step 3
  const clearOrderLocalStorage = () => {
    localStorage.removeItem('orderCurrentStep');
    localStorage.removeItem('orderFormData');
    localStorage.removeItem('orderAIDesignInfo'); 
  };

  // Clear localStorage bao gồm cả order info cho navigation
  const clearAllOrderLocalStorage = () => {
    clearOrderLocalStorage();
    localStorage.removeItem('orderIdForNewOrder');
    localStorage.removeItem('orderTypeForNewOrder');
  };

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

      if (finalIsFromAIDesign && (!finalEditedDesignId || !finalCustomerChoiceId)) {
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
            orderType: finalIsFromAIDesign ? "AI_DESIGN" : formData.orderType,
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

        if (finalIsFromAIDesign) {
          if (!finalCustomerChoiceId) {
            setErrorMessage(
              "Thiếu customerChoiceId. Vui lòng quay lại trang thiết kế AI."
            );
            return;
          }

          if (!finalEditedDesignId) {
            setErrorMessage(
              "Thiếu editedDesignId. Vui lòng quay lại trang thiết kế AI."
            );
            return;
          }

          // Lấy order ID từ currentOrder hoặc existingOrderId (từ localStorage)
          const orderIdToUse = currentOrder?.id || existingOrderId;
          
          console.log("Order - Debug order ID:", {
            currentOrderId: currentOrder?.id,
            existingOrderId: existingOrderId,
            orderIdToUse: orderIdToUse,
            typeOfOrderId: typeof orderIdToUse
          });
          
          if (!orderIdToUse) {
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
            orderId: orderIdToUse,
            orderDetailData: {
              customerChoiceId: finalCustomerChoiceId,
              quantity: formData.quantity,
              editedDesignId: finalEditedDesignId,
            },
          });

          const result = await dispatch(
            addOrderDetail({
              orderId: orderIdToUse,
              orderDetailData: {
                customerChoiceId: finalCustomerChoiceId,
                quantity: formData.quantity,
                editedDesignId: finalEditedDesignId,
              },
            })
          ).unwrap();

          console.log("Order detail được tạo thành công:", {
            orderId: orderIdToUse,
            customerChoiceId: finalCustomerChoiceId,
            quantity: formData.quantity,
            editedDesignId: finalEditedDesignId,
            result,
          });
        } else {
          console.log("Xử lý đơn hàng thông thường (không từ AI Design)");
        }

        setSuccessMessage("Đơn hàng đã được xác nhận thành công!");

        // Xóa localStorage nếu đã sử dụng existing order
        if (useExistingOrder && existingOrderId) {
          localStorage.removeItem('orderIdForNewOrder');
          localStorage.removeItem('orderTypeForNewOrder');
          console.log("Order - Đã xóa orderIdForNewOrder và orderTypeForNewOrder khỏi localStorage");
        }

        // Chuyển sang step 3 để hiển thị thông tin đơn hàng hoàn tất
        setTimeout(() => {
          setCurrentStep(3);
          setSuccessMessage("");
        }, 1500);
      } catch (error) {
        console.error("Lỗi xác nhận đơn hàng:", error);
        setErrorMessage(error || "Xác nhận đơn hàng thất bại");
      }
      return;
    }
  };

  const handleBackToEdit = async () => {
    try {
      // Nếu có currentOrder (đơn hàng đã tạo ở step 1), xóa nó trước khi quay lại
      if (currentOrder?.id) {
        console.log("Đang xóa đơn hàng trước khi quay lại chỉnh sửa:", currentOrder.id);
        
        setDeletingOrder(true);
        setErrorMessage("");
        setSuccessMessage("");
        
        await dispatch(deleteOrder(currentOrder.id)).unwrap();
        
        console.log("Đã xóa đơn hàng thành công");
        
        // Clear currentOrder khỏi state
        dispatch(setCurrentOrder(null));
      }
      
      // Quay lại step 1
      setCurrentStep(1);
      setErrorMessage("");
      setSuccessMessage("");
      
      // Không clear localStorage để giữ formData
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
      setErrorMessage("Không thể xóa đơn hàng. Vui lòng thử lại.");
      setSuccessMessage("");
    } finally {
      setDeletingOrder(false);
    }
  };

  const steps = ["Thông tin đơn hàng", "Xác nhận đơn hàng", "Hoàn tất đơn hàng"];

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
              : currentStep === 2
              ? "Xác Nhận Đơn Hàng"
              : "Hoàn Tất Đơn Hàng"}
          </Typography>
          <Typography
            variant="subtitle1"
            className="text-gray-600 max-w-2xl mx-auto"
          >
            {currentStep === 1
              ? "Vui lòng điền thông tin để tạo đơn hàng của bạn"
              : currentStep === 2
              ? "Kiểm tra lại thông tin trước khi xác nhận"
              : "Đơn hàng của bạn đã được tạo thành công"}
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
                : currentStep === 2
                ? "bg-gradient-to-r from-green-50 to-emerald-50"
                : "bg-gradient-to-r from-blue-50 to-indigo-50"
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
            ) : currentStep === 2 ? (
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
                                  finalIsFromAIDesign
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
                              finalIsFromAIDesign ? "AI_DESIGN" : formData.orderType
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

                {/* Thông báo khi sử dụng existing order */}
                {existingOrderId && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <Typography variant="subtitle2" className="text-blue-800 font-semibold">
                          Đang sử dụng đơn hàng có sẵn
                        </Typography>
                        <Typography variant="body2" className="text-blue-600">
                          Bạn không thể quay lại chỉnh sửa đơn hàng đã được tạo trước đó từ trang thiết kế AI.
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className={`grid gap-4 pt-4 ${existingOrderId ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {/* Chỉ hiển thị nút "Quay lại chỉnh sửa" nếu không có existingOrderId */}
                  {!existingOrderId && (
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      onClick={handleBackToEdit}
                      disabled={deletingOrder || orderStatus === "loading"}
                      className="py-4 text-lg font-semibold rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
                      sx={{
                        borderColor: "#6B7280",
                        color: "#6B7280",
                        "&:hover": {
                          borderColor: "#374151",
                          color: "#374151",
                          backgroundColor: "#F9FAFB",
                        },
                        "&:disabled": {
                          borderColor: "#D1D5DB",
                          color: "#9CA3AF",
                          backgroundColor: "#F9FAFB",
                        },
                      }}
                      startIcon={
                        deletingOrder ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <ArrowBack />
                        )
                      }
                    >
                      {deletingOrder ? "Đang xóa đơn hàng..." : "Quay lại chỉnh sửa"}
                    </Button>
                  )}

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
            ) : (
              // Bước 3: Hoàn tất đơn hàng
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg mb-4">
                    <CheckCircle className="text-white text-2xl" />
                  </div>
                  <Typography
                    variant="h4"
                    className="text-gray-800 font-bold mb-2"
                  >
                    Đơn hàng đã được tạo thành công!
                  </Typography>
                  <Typography variant="body1" className="text-gray-600">
                    Cảm ơn bạn đã tin tướng và sử dụng dịch vụ của chúng tôi
                  </Typography>
                </div>

                {/* Order Success Information */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                    <Typography
                      variant="h6"
                      className="text-white font-semibold"
                    >
                      Thông tin đơn hàng
                    </Typography>
                  </div>

                  <div className="p-6 space-y-6">
                    {orderDetailsStatus === 'loading' ? (
                      <div className="text-center py-8">
                        <CircularProgress size={40} className="mb-4" />
                        <Typography variant="body2" className="text-gray-600">
                          Đang tải thông tin đơn hàng...
                        </Typography>
                      </div>
                    ) : orderDetailsError ? (
                      <div className="text-center py-8">
                        <Typography variant="body2" className="text-red-600 mb-2">
                          Lỗi khi tải thông tin đơn hàng
                        </Typography>
                        <Typography variant="caption" className="text-red-500">
                          {orderDetailsError}
                        </Typography>
                      </div>
                    ) : (
                      <>
                        {/* Order ID */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <div>
                            <Typography
                              variant="subtitle2"
                              className="text-blue-600 font-semibold mb-1"
                            >
                              Mã đơn hàng
                            </Typography>
                            <Typography
                              variant="h6"
                              className="text-blue-800 font-bold"
                            >
                              #{currentOrder?.id || existingOrderId || 'N/A'}
                            </Typography>
                          </div>
                          <div className="text-right">
                            <Typography
                              variant="subtitle2"
                              className="text-blue-600 font-semibold mb-1"
                            >
                              Ngày tạo
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-blue-800 font-mono"
                            >
                              {currentOrder?.createdAt 
                                ? new Date(currentOrder.createdAt).toLocaleString('vi-VN')
                                : 'N/A'}
                            </Typography>
                          </div>
                        </div>

                        {/* Order Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <Typography
                              variant="subtitle2"
                              className="text-gray-600 font-semibold mb-2"
                            >
                              Địa chỉ giao hàng
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-gray-800"
                            >
                              {currentOrder?.address || formData.address}
                            </Typography>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <Typography
                              variant="subtitle2"
                              className="text-gray-600 font-semibold mb-2"
                            >
                              Loại đơn hàng
                            </Typography>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: `var(--${
                                    ORDER_TYPE_MAP[currentOrder?.orderType || formData.orderType]?.color || "blue"
                                  }-500, #3B82F6)`,
                                }}
                              />
                              <Typography
                                variant="body2"
                                className="text-gray-800 font-medium"
                              >
                                {ORDER_TYPE_MAP[currentOrder?.orderType || formData.orderType]?.label || "Không xác định"}
                              </Typography>
                            </div>
                          </div>
                        </div>

                        {/* Order Details */}
                        {orderDetails && orderDetails.length > 0 && (
                          <div className="space-y-4">
                            <Typography
                              variant="subtitle1"
                              className="text-gray-700 font-semibold"
                            >
                              Chi tiết sản phẩm
                            </Typography>
                            {orderDetails.map((detail, index) => (
                              <div key={detail.id || index} className="space-y-4">
                                {/* Thông tin cơ bản của order detail */}
                                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <Typography
                                        variant="subtitle2"
                                        className="text-green-600 font-semibold mb-1"
                                      >
                                        Số lượng
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        className="text-green-800 font-medium"
                                      >
                                        {detail.quantity || formData.quantity} sản phẩm
                                      </Typography>
                                    </div>
                                    
                                    {detail.detailConstructionAmount && (
                                      <div>
                                        <Typography
                                          variant="subtitle2"
                                          className="text-green-600 font-semibold mb-1"
                                        >
                                          Giá thi công
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          className="text-green-800 font-medium"
                                        >
                                          {detail.detailConstructionAmount.toLocaleString('vi-VN')} VNĐ
                                        </Typography>
                                      </div>
                                    )}

                                    {detail.detailDesignAmount && (
                                      <div>
                                        <Typography
                                          variant="subtitle2"
                                          className="text-green-600 font-semibold mb-1"
                                        >
                                          Giá thiết kế
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          className="text-green-800 font-medium"
                                        >
                                          {detail.detailDesignAmount.toLocaleString('vi-VN')} VNĐ
                                        </Typography>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Customer Choice Histories */}
                                {detail.customerChoiceHistories && (
                                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <Typography
                                      variant="subtitle2"
                                      className="text-blue-600 font-semibold mb-3"
                                    >
                                      📋 Thông tin lựa chọn sản phẩm
                                    </Typography>
                                    
                                    <div className="space-y-4">
                                      {/* Product Type */}
                                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                                        <Typography variant="body2" className="text-blue-700 font-medium">
                                          Loại sản phẩm:
                                        </Typography>
                                        <Typography variant="body2" className="text-blue-800 font-bold">
                                          {detail.customerChoiceHistories.productTypeName}
                                        </Typography>
                                      </div>

                                      {/* Total Amount */}
                                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                                        <Typography variant="body2" className="text-blue-700 font-medium">
                                          Tổng tiền:
                                        </Typography>
                                        <Typography variant="h6" className="text-blue-800 font-bold">
                                          {detail.customerChoiceHistories.totalAmount.toLocaleString('vi-VN')} VNĐ
                                        </Typography>
                                      </div>

                                      {/* Size Selections */}
                                      {detail.customerChoiceHistories.sizeSelections && (
                                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                                          <Typography variant="body2" className="text-blue-700 font-medium mb-2">
                                            Kích thước:
                                          </Typography>
                                          <div className="grid grid-cols-2 gap-2">
                                            {detail.customerChoiceHistories.sizeSelections.map((size, sizeIndex) => (
                                              <div key={sizeIndex} className="flex items-center justify-between">
                                                <Typography variant="caption" className="text-blue-600">
                                                  {size.size}:
                                                </Typography>
                                                <Typography variant="caption" className="text-blue-800 font-semibold">
                                                  {size.value}m
                                                </Typography>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Attribute Selections */}
                                      {detail.customerChoiceHistories.attributeSelections && (
                                        <div className="space-y-2">
                                          <Typography variant="body2" className="text-blue-700 font-medium">
                                            Chi tiết thuộc tính:
                                          </Typography>
                                          {detail.customerChoiceHistories.attributeSelections.map((attr, attrIndex) => (
                                            <div key={attrIndex} className="p-3 bg-white rounded-lg border border-blue-200">
                                              <div className="flex items-center justify-between mb-2">
                                                <Typography variant="caption" className="text-blue-600 font-semibold">
                                                  {attr.attribute}
                                                </Typography>
                                                <Typography variant="caption" className="text-blue-800 font-bold">
                                                  {attr.subTotal.toLocaleString('vi-VN')} VNĐ
                                                </Typography>
                                              </div>
                                              <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                  <span className="text-blue-600">Giá trị: </span>
                                                  <span className="text-blue-800">{attr.value}</span>
                                                </div>
                                                <div>
                                                  <span className="text-blue-600">Đơn vị: </span>
                                                  <span className="text-blue-800">{attr.unit}</span>
                                                </div>
                                                <div>
                                                  <span className="text-blue-600">Giá vật liệu: </span>
                                                  <span className="text-blue-800">{attr.materialPrice.toLocaleString('vi-VN')} VNĐ</span>
                                                </div>
                                                <div>
                                                  <span className="text-blue-600">Đơn giá: </span>
                                                  <span className="text-blue-800">{attr.unitPrice.toLocaleString('vi-VN')} VNĐ</span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Edited Design Information */}
                                {detail.editedDesigns && (
                                  <div className="space-y-4">
                                    {/* Design Image */}
                                    {detail.editedDesigns.editedImage && (
                                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                        <Typography
                                          variant="subtitle2"
                                          className="text-purple-600 font-semibold mb-3"
                                        >
                                          🎨 Hình ảnh thiết kế
                                        </Typography>
                                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                                          <S3Image 
                                            imageKey={detail.editedDesigns.editedImage}
                                            alt="Thiết kế đã chỉnh sửa"
                                            className="w-full max-h-80 object-contain rounded-lg shadow-sm"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Customer Note */}
                                    {detail.editedDesigns.customerNote && (
                                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                        <Typography
                                          variant="subtitle2"
                                          className="text-yellow-600 font-semibold mb-2"
                                        >
                                          💬 Ghi chú từ khách hàng
                                        </Typography>
                                        <Typography variant="body2" className="text-yellow-800">
                                          {detail.editedDesigns.customerNote}
                                        </Typography>
                                      </div>
                                    )}

                                    {/* Design Template Info */}
                                    {detail.editedDesigns.designTemplates && (
                                      <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                                        <Typography
                                          variant="subtitle2"
                                          className="text-orange-600 font-semibold mb-2"
                                        >
                                          📄 Mẫu thiết kế sử dụng
                                        </Typography>
                                        <Typography variant="body2" className="text-orange-800 font-medium">
                                          {detail.editedDesigns.designTemplates.name}
                                        </Typography>
                                        {detail.editedDesigns.designTemplates.description && (
                                          <Typography variant="caption" className="text-orange-700 block mt-1">
                                            {detail.editedDesigns.designTemplates.description}
                                          </Typography>
                                        )}
                                      </div>
                                    )}

                                    {/* Customer Detail Info */}
                                    {detail.editedDesigns.customerDetail && (
                                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <Typography
                                          variant="subtitle2"
                                          className="text-gray-600 font-semibold mb-2"
                                        >
                                          👤 Thông tin khách hàng
                                        </Typography>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <Typography variant="caption" className="text-gray-500">
                                              Tên công ty:
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-800 font-medium">
                                              {detail.editedDesigns.customerDetail.companyName}
                                            </Typography>
                                          </div>
                                          <div>
                                            <Typography variant="caption" className="text-gray-500">
                                              Thông tin liên hệ:
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-800 font-medium">
                                              {detail.editedDesigns.customerDetail.contactInfo}
                                            </Typography>
                                          </div>
                                          <div className="md:col-span-2">
                                            <Typography variant="caption" className="text-gray-500">
                                              Địa chỉ công ty:
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-800 font-medium">
                                              {detail.editedDesigns.customerDetail.address}
                                            </Typography>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Next Steps */}
                        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                          <Typography
                            variant="subtitle2"
                            className="text-yellow-700 font-semibold mb-2"
                          >
                            📋 Bước tiếp theo
                          </Typography>
                          <Typography variant="body2" className="text-yellow-800 mb-2">
                            Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để:
                          </Typography>
                          <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
                            <li>Xác nhận chi tiết đơn hàng</li>
                            <li>Thỏa thuận về thời gian và địa điểm khảo sát (nếu cần)</li>
                            <li>Cung cấp báo giá chi tiết</li>
                            <li>Lập hợp đồng và tiến hành thực hiện</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      onClick={() => {
                        clearAllOrderLocalStorage();
                        navigate("/order-history");
                      }}
                      className="py-4 text-lg font-semibold rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
                      sx={{
                        borderColor: "#3B82F6",
                        color: "#3B82F6",
                        "&:hover": {
                          borderColor: "#2563EB",
                          color: "#2563EB",
                          backgroundColor: "#EFF6FF",
                        },
                      }}
                    >
                      Xem lịch sử đơn hàng
                    </Button>

                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={() => {
                        clearAllOrderLocalStorage();
                        navigate("/");
                      }}
                      className="py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                      sx={{
                        background:
                          "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                        },
                      }}
                    >
                      Về trang chủ
                    </Button>
                  </div>

                  {/* Nút tạo đơn hàng mới */}
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={() => {
                      // Lưu order ID và order Type vào localStorage
                      if (currentOrder?.id) {
                        localStorage.setItem('orderIdForNewOrder', currentOrder.id.toString());
                        localStorage.setItem('orderTypeForNewOrder', currentOrder.orderType || formData.orderType || '');
                      }
                      
                      clearOrderLocalStorage();
                      // Reset tất cả state về ban đầu
                      setCurrentStep(1);
                      setFormData({
                        address: "",
                        orderType: isFromAIDesign ? "AI_DESIGN" : "",
                        quantity: 1,
                      });
                      setSuccessMessage("");
                      setErrorMessage("");
                      
                      // Chuyển đến case 3 của trang AI Design (chọn loại biển hiệu)
                      navigate("/ai-design?step=billboard");
                    }}
                    className="py-4 text-lg font-semibold rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
                    sx={{
                      borderColor: "#10B981",
                      color: "#10B981",
                      "&:hover": {
                        borderColor: "#059669",
                        color: "#059669",
                        backgroundColor: "#F0FDF4",
                      },
                    }}
                  >
                    🎯 Tạo đơn hàng mới
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
