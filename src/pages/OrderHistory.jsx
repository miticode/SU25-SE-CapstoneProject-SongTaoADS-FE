import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  LinearProgress,
  Rating,
  Divider,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import HistoryIcon from "@mui/icons-material/History";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import BrushIcon from "@mui/icons-material/Brush";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DescriptionIcon from "@mui/icons-material/Description";
import StarIcon from "@mui/icons-material/Star";
import FeedbackIcon from "@mui/icons-material/Feedback";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  fetchCustomDesignRequestsByCustomerDetail,
  setCurrentDesignRequest,
  selectCurrentDesignRequest,
} from "../store/features/customeDesign/customerDesignSlice";
import {
  createOrderFromDesignRequest,
  fetchOrdersByUserId,
} from "../store/features/order/orderSlice";
import { fetchCustomerDetailByUserId } from "../store/features/customer/customerSlice";
import {
  getPriceProposals,
  approvePriceProposal,
  offerPriceProposal,
} from "../api/priceService";

import {
  payCustomDesignDepositThunk,
  payCustomDesignRemainingThunk,
  payOrderRemainingThunk,
  selectPaymentLoading,
} from "../store/features/payment/paymentSlice";
import {
  getDemoDesigns,
  approveDemoDesign,
  rejectDemoDesign,
  getDemoSubImages,
} from "../store/features/demo/demoSlice";
import { fetchUserDetail } from "../store/features/user/userSlice";
import { unwrapResult } from "@reduxjs/toolkit";

import {
  CONTRACT_STATUS_MAP,
  discussContract,
  getOrderContract,
  selectContractLoading,
  uploadSignedContract,
} from "../store/features/contract/contractSlice";
import { getPresignedUrl, openFileInNewTab } from "../api/s3Service";
import { fetchImageFromS3 } from "../store/features/s3/s3Slice";
import {
  createImpression,
  uploadImpressionImage,
  fetchImpressionsByOrderId,
  selectUploadingImage,
  selectUploadImageError,
  clearError as clearImpressionError,
  IMPRESSION_STATUS_MAP,
  selectImpressionsByOrder,
} from "../store/features/impression/impressionSlice";
import {
  createTicket,
  selectCreateStatus,
  selectCreateError,
  resetCreateStatus,
} from "../store/features/ticket/ticketSlice";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

const statusMap = {
  APPROVED: { label: "Đã xác nhận", color: "success" },
  CONFIRMED: { label: "Đã xác nhận", color: "success" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  PENDING: { label: "Chờ xác nhận", color: "warning" },
  DEPOSITED: { label: "Đã đặt cọc", color: "info" },
  COMPLETED: { label: "Hoàn tất", color: "primary" },
  CANCELLED: { label: "Đã bị hủy", color: "error" },
  FULLY_PAID: { label: "Đã thanh toán", color: "success" },
  PENDING_CONTRACT: { label: "Đang chờ hợp đồng", color: "warning" },
  CONTRACT_SENT: { label: "Hợp đồng đã được gửi", color: "info" },
  CONTRACT_SIGNED: { label: "Hợp đồng đã ký", color: "success" },
  CONTRACT_CONFIRMED: { label: "Đã xác nhận hợp đồng", color: "success" },
  CONTRACT_RESIGNED: { label: "Yêu cầu gửi lại hợp đồng", color: "warning" },
  CONTRACT_DISCUSS: { label: "Chờ thương lượng hợp đồng", color: "warning" },
  WAITING_FULL_PAYMENT: { label: "Đang chờ thanh toán", color: "warning" },
  IN_PROGRESS: { label: "Đang thực hiện", color: "info" },
  PRODUCING: { label: "Đang sản xuất", color: "info" },
  PRODUCTION_COMPLETED: { label: "Hoàn thành sản xuất", color: "success" },
  DELIVERING: { label: "Đang giao hàng", color: "info" },
  INSTALLED: { label: "Đã lắp đặt", color: "success" },
};

const OrderHistory = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [constructionLoading, setConstructionLoading] = useState(false);
  // Redux state for custom design requests
  const contractLoading = useSelector(selectContractLoading);
  // const [contractData, setContractData] = useState({}); // Lưu contract theo orderId
  const [discussLoading, setDiscussLoading] = useState(false);
  const [impressionDialog, setImpressionDialog] = useState({
    open: false,
    orderId: null,
  });
  const [impressionForm, setImpressionForm] = useState({
    rating: 5,
    comment: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submittingImpression, setSubmittingImpression] = useState(false);
  // const [createdImpressionId, setCreatedImpressionId] = useState(null);
  // const impressionLoading = useSelector(selectImpressionLoading);
  const uploadingImage = useSelector(selectUploadingImage);
  const uploadImageError = useSelector(selectUploadImageError);
  // const fetchingImpressions = useSelector(selectFetchingImpressions);
  const [contractDialog, setContractDialog] = useState({
    open: false,
    contract: null,
    orderId: null,
  });
  const customDesignState = useSelector((state) => state.customDesign);
  const {
    designRequests,
    status: customStatus,
    error: customError,
  } = customDesignState;

  // Redux state for orders
  const orders = useSelector((state) => state.order.orders);
  const orderLoading = useSelector((state) => state.order.loading);
  const orderError = useSelector((state) => state.order.error);

  const [customerDetailId, setCustomerDetailId] = useState(undefined);
  const currentDesignRequest = useSelector(selectCurrentDesignRequest);
  const [openDetail, setOpenDetail] = useState(false);
  const [priceProposals, setPriceProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [contractViewLoading, setContractViewLoading] = useState(false);
  const [uploadingSignedContract, setUploadingSignedContract] = useState(false);
  // const [depositingOrderId, setDepositingOrderId] = useState(null);
  const paymentLoading = useSelector(selectPaymentLoading);
  // const paymentError = useSelector(selectPaymentError);
  // const orderDepositResult = useSelector(selectOrderDepositResult);
  // const orderRemainingResult = useSelector(selectOrderRemainingResult);
  const [remainingPaymentLoading, setRemainingPaymentLoading] = useState({});
  const allImpressionsByOrder = useSelector(selectImpressionsByOrder);

  const [imageDialog, setImageDialog] = useState({
    open: false,
    imageUrl: null,
    loading: false,
    title: "",
  });
  const [offerDialog, setOfferDialog] = useState({
    open: false,
    proposalId: null,
  });
  const [offerForm, setOfferForm] = useState({
    totalPriceOffer: "",
    depositAmountOffer: "",
    rejectionReason: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // const [depositLoadingId, setDepositLoadingId] = useState(null);
  const [depositLoadingId, setDepositLoadingId] = useState(null);
  const s3FinalImageUrl = useSelector((state) =>
    currentDesignRequest?.finalDesignImage
      ? state.s3.images[currentDesignRequest.finalDesignImage]
      : null
  );
  const getOrderImpressions = (orderId) => {
    return allImpressionsByOrder[orderId] || [];
  };
  const handlePayRemaining = async (order) => {
    if (!order?.id) {
      setNotification({
        open: true,
        message: "Thông tin đơn hàng không hợp lệ",
        severity: "error",
      });
      return;
    }

    // Set loading cho order này
    setRemainingPaymentLoading((prev) => ({ ...prev, [order.id]: true }));

    try {
      const resultAction = await dispatch(payOrderRemainingThunk(order.id));

      if (payOrderRemainingThunk.fulfilled.match(resultAction)) {
        const { checkoutUrl } = resultAction.payload;

        if (checkoutUrl) {
          // Redirect đến trang thanh toán
          window.location.href = checkoutUrl;
        } else {
          setNotification({
            open: true,
            message: "Không thể tạo link thanh toán",
            severity: "error",
          });
        }
      } else {
        // Xử lý lỗi
        const errorMessage =
          resultAction.payload || "Có lỗi xảy ra khi tạo thanh toán";
        setNotification({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error paying remaining:", error);
      setNotification({
        open: true,
        message: "Có lỗi xảy ra khi thanh toán",
        severity: "error",
      });
    } finally {
      // Clear loading cho order này
      setRemainingPaymentLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };
  // useEffect(() => {
  //   if (orderRemainingResult?.success) {
  //     setNotification({
  //       open: true,
  //       message: "Tạo thanh toán thành công! Đang chuyển hướng...",
  //       severity: "success",
  //     });
  //
  //     // Clear state sau khi xử lý
  //     dispatch(clearPaymentState());
  //   }
  // }, [orderRemainingResult, dispatch]);
  // useEffect(() => {
  //   if (paymentError) {
  //     setNotification({
  //       open: true,
  //       message: paymentError,
  //       severity: "error",
  //     });
  //
  //     // Clear error sau khi hiển thị
  //     dispatch(clearPaymentState());
  //   }
  // }, [paymentError, dispatch]);
  const getProductionProgress = (status) => {
    const steps = [
      { key: "PRODUCING", label: "Đang thi công", progress: 25 },
      { key: "PRODUCTION_COMPLETED", label: "Đã thi công", progress: 50 },
      { key: "DELIVERING", label: "Đang vận chuyển", progress: 75 },
      { key: "INSTALLED", label: "Đã lắp đặt", progress: 100 },
    ];

    const currentStepIndex = steps.findIndex((step) => step.key === status);

    return {
      steps,
      currentStepIndex,
      progress: currentStepIndex >= 0 ? steps[currentStepIndex].progress : 0,
      currentStep: currentStepIndex >= 0 ? steps[currentStepIndex] : null,
    };
  };
  const ProductionProgressBar = ({ status, order }) => {
    const { steps, currentStepIndex, progress, currentStep } =
      getProductionProgress(status);

    if (currentStepIndex === -1) return null;

    // Cập nhật hàm handleStepClick để hỗ trợ cả draftImageUrl và productImageUrl
    const handleStepClick = async (step) => {
      let imageUrl = null;
      let title = "";

      // Xử lý cho step "Đang thi công" với draftImageUrl
      if (step.key === "PRODUCING" && order?.draftImageUrl) {
        imageUrl = order.draftImageUrl;
        title = "Ảnh thiết kế - Đang thi công";
      }
      // Xử lý cho step "Đã thi công" với productImageUrl
      else if (step.key === "PRODUCTION_COMPLETED" && order?.productImageUrl) {
        imageUrl = order.productImageUrl;
        title = "Ảnh sản phẩm đã hoàn thành";
      } else if (step.key === "DELIVERING" && order?.deliveryImageUrl) {
        imageUrl = order.deliveryImageUrl;
        title = "Ảnh vận chuyển - Đang vận chuyển";
      } else if (step.key === "INSTALLED" && order?.installationImageUrl) {
        imageUrl = order.installationImageUrl;
        title = "Ảnh lắp đặt hoàn thành - Đã lắp đặt";
      }
      // Nếu không có ảnh thì không làm gì
      if (!imageUrl) return;

      setImageDialog({
        open: true,
        imageUrl: null,
        loading: true,
        title: title,
      });

      try {
        const result = await getPresignedUrl(imageUrl, 30);
        if (result.success) {
          setImageDialog((prev) => ({
            ...prev,
            imageUrl: result.url,
            loading: false,
          }));
        } else {
          setImageDialog((prev) => ({
            ...prev,
            loading: false,
          }));
          setNotification({
            open: true,
            message:
              "Không thể tải ảnh: " + (result.message || "Lỗi không xác định"),
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error getting presigned URL:", error);
        setImageDialog((prev) => ({
          ...prev,
          loading: false,
        }));
        setNotification({
          open: true,
          message: "Có lỗi xảy ra khi tải ảnh",
          severity: "error",
        });
      }
    };

    return (
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography
          variant="body2"
          color="primary.main"
          fontWeight={600}
          gutterBottom
        >
          🔨 Tiến độ thi công
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {currentStep?.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                backgroundColor:
                  progress === 100 ? "success.main" : "primary.main",
              },
            }}
          />
        </Box>

        {/* Step indicators */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {steps.map((step, index) => {
            // Kiểm tra xem step có thể click được không
            const isClickable =
              (step.key === "PRODUCING" && order?.draftImageUrl) ||
              (step.key === "PRODUCTION_COMPLETED" && order?.productImageUrl) ||
              (step.key === "DELIVERING" && order?.deliveryImageUrl) ||
              (step.key === "INSTALLED" && order?.installationImageUrl);
            const isCurrentStep = index === currentStepIndex;
            const isCompletedStep = index < currentStepIndex;

            return (
              <Box
                key={step.key}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  position: "relative",
                  cursor: isClickable ? "pointer" : "default",
                  "&:hover": isClickable
                    ? {
                        "& .step-circle": {
                          transform: "scale(1.1)",
                          boxShadow: 3,
                        },
                      }
                    : {},
                }}
                onClick={() => handleStepClick(step)}
              >
                {/* Step circle */}
                <Box
                  className="step-circle"
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor:
                      index <= currentStepIndex
                        ? index === currentStepIndex
                          ? "primary.main"
                          : "success.main"
                        : "grey.300",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                    zIndex: 2,
                    border: "2px solid white",
                    boxShadow: 1,
                    transition: "all 0.2s ease-in-out",
                    ...(isClickable && {
                      border: "2px solid",
                      borderColor:
                        isCurrentStep || isCompletedStep
                          ? "primary.dark"
                          : "primary.light",
                      "&:hover": {
                        borderColor: "primary.dark",
                        boxShadow: 2,
                      },
                    }),
                  }}
                >
                  {index < currentStepIndex ? (
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      ✓
                    </Typography>
                  ) : index === currentStepIndex ? (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "white",
                      }}
                    />
                  ) : null}
                </Box>

                {/* Step label */}
                <Typography
                  variant="caption"
                  color={
                    index <= currentStepIndex
                      ? "text.primary"
                      : "text.secondary"
                  }
                  fontWeight={index === currentStepIndex ? 600 : 400}
                  textAlign="center"
                  sx={{
                    fontSize: "0.7rem",
                    lineHeight: 1.2,
                    maxWidth: 70,
                    ...(isClickable && {
                      color: "primary.main",
                      fontWeight: 600,
                      textDecoration: "underline",
                    }),
                  }}
                >
                  {step.label}
                  {isClickable && " 📷"}
                </Typography>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: "50%",
                      right: "-50%",
                      height: 2,
                      backgroundColor:
                        index < currentStepIndex ? "success.main" : "grey.300",
                      zIndex: 1,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Status message */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            backgroundColor: "primary.50",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "primary.200",
          }}
        >
          <Typography variant="body2" color="primary.dark">
            {status === "PRODUCING" && (
              <>
                🔨 Đơn hàng đang được thi công
                {order?.draftImageUrl && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5, fontStyle: "italic" }}
                  >
                    💡 Click vào "Đang thi công" để xem ảnh thiết kế
                  </Typography>
                )}
              </>
            )}
            {status === "PRODUCTION_COMPLETED" && (
              <>
                ✅ Thi công hoàn tất, chuẩn bị vận chuyển
                {order?.productImageUrl && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5, fontStyle: "italic" }}
                  >
                    💡 Click vào "Đã thi công" để xem ảnh sản phẩm hoàn thành
                  </Typography>
                )}
              </>
            )}
            {status === "DELIVERING" && (
              <>
                🚛 Đang vận chuyển đến địa chỉ của bạn
                {order?.deliveryImageUrl && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5, fontStyle: "italic" }}
                  >
                    💡 Click vào "Đang vận chuyển" để xem ảnh vận chuyển
                  </Typography>
                )}
                {/* Hiển thị hint cho các ảnh có thể xem từ các bước trước */}
                {(order?.draftImageUrl || order?.productImageUrl) && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5, fontStyle: "italic" }}
                  >
                    💡 Click vào các bước có biểu tượng 📷 để xem ảnh
                  </Typography>
                )}
              </>
            )}
            {status === "INSTALLED" && (
              <>
                🎉 Đã lắp đặt hoàn tất!
                {order?.installationImageUrl && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5, fontStyle: "italic" }}
                  >
                    💡 Click vào "Đã lắp đặt" để xem ảnh lắp đặt hoàn thành
                  </Typography>
                )}
                {/* Hiển thị hint cho tất cả các ảnh có thể xem từ các bước trước */}
                {(order?.draftImageUrl ||
                  order?.productImageUrl ||
                  order?.deliveryImageUrl) && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5, fontStyle: "italic" }}
                  >
                    💡 Click vào các bước có biểu tượng 📷 để xem ảnh
                  </Typography>
                )}
              </>
            )}
          </Typography>
        </Box>
      </Box>
    );
  };
  const handleCloseImageDialog = () => {
    setImageDialog({
      open: false,
      imageUrl: null,
      loading: false,
      title: "",
    });
  };
  const handleUploadSignedContract = async (contractId, file) => {
    if (!file) {
      setNotification({
        open: true,
        message: "Vui lòng chọn file hợp đồng đã ký",
        severity: "error",
      });
      return;
    }

    // Kiểm tra định dạng file
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setNotification({
        open: true,
        message: "Chỉ chấp nhận file PDF, DOC, DOCX",
        severity: "error",
      });
      return;
    }

    setUploadingSignedContract(true);

    try {
      const result = await dispatch(
        uploadSignedContract({
          contractId,
          signedContractFile: file,
        })
      );

      if (uploadSignedContract.fulfilled.match(result)) {
        setNotification({
          open: true,
          message: "Upload hợp đồng đã ký thành công",
          severity: "success",
        });

        // Cập nhật lại contract dialog với dữ liệu mới
        setContractDialog((prev) => ({
          ...prev,
          contract: result.payload,
        }));
      } else {
        setNotification({
          open: true,
          message: result.payload || "Không thể upload hợp đồng đã ký",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Lỗi khi upload hợp đồng đã ký",
        severity: "error",
      });
    } finally {
      setUploadingSignedContract(false);
    }
  };
  const handleDiscussContract = async (contractId) => {
    if (!contractId) {
      setNotification({
        open: true,
        message: "Không có ID hợp đồng",
        severity: "error",
      });
      return;
    }

    setDiscussLoading(true);
    try {
      const result = await dispatch(discussContract(contractId));
      if (discussContract.fulfilled.match(result)) {
        setNotification({
          open: true,
          message: "Đã gửi yêu cầu thảo luận hợp đồng thành công",
          severity: "success",
        });

        // Cập nhật lại contract dialog với dữ liệu mới
        setContractDialog((prev) => ({
          ...prev,
          contract: result.payload,
        }));
      } else {
        setNotification({
          open: true,
          message: result.payload || "Không thể gửi yêu cầu thảo luận",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Lỗi khi gửi yêu cầu thảo luận",
        severity: "error",
      });
    } finally {
      setDiscussLoading(false);
    }
  };
  const [designerMap, setDesignerMap] = useState({});
  const [demoList, setDemoList] = useState([]);
  const [latestDemo, setLatestDemo] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [demoActionLoading, setDemoActionLoading] = useState(false);
  const [payingRemaining, setPayingRemaining] = useState(false);

  const handleViewContract = async (contractUrl) => {
    if (!contractUrl) {
      setNotification({
        open: true,
        message: "Không có URL hợp đồng",
        severity: "error",
      });
      return;
    }

    setContractViewLoading(true);
    try {
      const result = await openFileInNewTab(contractUrl, 30);
      if (!result.success) {
        setNotification({
          open: true,
          message: result.message || "Không thể mở hợp đồng",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Lỗi khi mở hợp đồng",
        severity: "error",
      });
    } finally {
      setContractViewLoading(false);
    }
  };

  const handleGetContract = async (orderId) => {
    try {
      const result = await dispatch(getOrderContract(orderId));
      if (getOrderContract.fulfilled.match(result)) {
        setContractDialog({
          open: true,
          contract: result.payload,
          orderId: orderId,
        });
      } else {
        setNotification({
          open: true,
          message: result.payload || "Không thể lấy thông tin hợp đồng",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Lỗi khi lấy hợp đồng",
        severity: "error",
      });
    }
  };
  const handleCloseContractDialog = () => {
    setContractDialog({
      open: false,
      contract: null,
      orderId: null,
    });
  };
  const handleConstructionChoice = (designRequestId, needConstruction) => {
    setConstructionLoading(true);

    // Tìm design request theo ID để cập nhật UI
    const designRequest = designRequests.find(
      (req) => req.id === designRequestId
    );

    if (designRequest) {
      // Cập nhật state local
      dispatch(
        setCurrentDesignRequest({
          ...designRequest,
          isNeedSupport: needConstruction,
        })
      );

      // Nếu chọn "Có thi công" thì gọi API tạo đơn hàng
      if (needConstruction) {
        dispatch(createOrderFromDesignRequest(designRequestId)).then(
          (resultAction) => {
            if (createOrderFromDesignRequest.fulfilled.match(resultAction)) {
              setNotification({
                open: true,
                message:
                  "Đã chọn có thi công và tạo đơn hàng thành công! Vui lòng đợi hợp đồng từ chúng tôi.",
                severity: "success",
              });

              // Tải lại danh sách đơn hàng
              if (user?.id) {
                dispatch(fetchOrdersByUserId(user.id));
              }
            } else {
              setNotification({
                open: true,
                message:
                  resultAction.payload ||
                  "Đã chọn có thi công nhưng không thể tạo đơn hàng!",
                severity: "error",
              });
            }
            setConstructionLoading(false);
          }
        );
      } else {
        // Nếu chọn "Không thi công" thì hiện thông báo bình thường
        setNotification({
          open: true,
          message: "Đơn hàng sẽ không thi công, cảm ơn bạn",
          severity: "success",
        });
        setConstructionLoading(false);
      }

      // Cập nhật lại danh sách đơn thiết kế để hiển thị đúng trạng thái
      dispatch(
        fetchCustomDesignRequestsByCustomerDetail({
          customerDetailId: customerDetailId,
          page: 1,
          size: 10,
        })
      );
    } else {
      setNotification({
        open: true,
        message:
          "Không thể xác định yêu cầu thiết kế với ID: " + designRequestId,
        severity: "error",
      });
      setConstructionLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => setTab(newValue);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchOrdersByUserId(user.id));
      dispatch(fetchCustomerDetailByUserId(user.id)).then((res) => {
        // Redux Toolkit unwraps the promise, so res.payload là kết quả
        const detail = res.payload;
        if (detail && detail.id) {
          setCustomerDetailId(detail.id);
        } else {
          setCustomerDetailId(undefined);
        }
      });
    }
  }, [isAuthenticated, user, dispatch]);

  // Gọi API lấy đơn thiết kế thủ công khi chuyển tab hoặc khi customerDetailId thay đổi
  useEffect(() => {
    console.log(
      "useEffect: isAuthenticated:",
      isAuthenticated,
      "user:",
      user,
      "tab:",
      tab,
      "customerDetailId:",
      customerDetailId
    );
    if (
      isAuthenticated &&
      customerDetailId &&
      tab === 1 // tab 1 là đơn thiết kế thủ công
    ) {
      console.log(
        "Dispatch fetchCustomDesignRequestsByCustomerDetail trong useEffect với customerDetailId:",
        customerDetailId
      );
      dispatch(
        fetchCustomDesignRequestsByCustomerDetail({
          customerDetailId: customerDetailId,
          page: 1,
          size: 10,
        })
      );
    }
  }, [isAuthenticated, user, tab, customerDetailId, dispatch]);

  // Fetch price proposals when openDetail or currentDesignRequest changes
  useEffect(() => {
    if (openDetail && currentDesignRequest) {
      setLoadingProposals(true);
      getPriceProposals(currentDesignRequest.id).then((res) => {
        if (res.success) {
          setPriceProposals(res.result);
        } else {
          setPriceProposals([]);
        }
        setLoadingProposals(false);
      });
    }
  }, [openDetail, currentDesignRequest]);

  // Fetch designer info khi currentDesignRequest thay đổi
  useEffect(() => {
    const designerId = currentDesignRequest?.assignDesigner;
    if (designerId && !designerMap[designerId]) {
      dispatch(fetchUserDetail(currentDesignRequest.assignDesigner?.id))
        .then(unwrapResult)
        .then((user) =>
          setDesignerMap((prev) => ({ ...prev, [designerId]: user }))
        )
        .catch(() =>
          setDesignerMap((prev) => ({ ...prev, [designerId]: null }))
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDesignRequest, dispatch]);

  // Fetch demo list khi dialog mở hoặc currentDesignRequest thay đổi
  useEffect(() => {
    const fetchDemoList = async () => {
      if (openDetail && currentDesignRequest) {
        const res = await dispatch(
          getDemoDesigns(currentDesignRequest.id)
        ).unwrap();
        if (res && res.length > 0) {
          setDemoList(res);
          setLatestDemo(res[res.length - 1]);
          // Preload tất cả ảnh demo nếu là key (không phải url)
          res.forEach((demo) => {
            if (
              demo.demoImage &&
              !demo.demoImage.startsWith("http") &&
              !s3Images[demo.demoImage]
            ) {
              dispatch(fetchImageFromS3(demo.demoImage));
            }
          });
        } else {
          setDemoList([]);
          setLatestDemo(null);
        }
      } else {
        setDemoList([]);
        setLatestDemo(null);
      }
    };
    fetchDemoList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDetail, currentDesignRequest, dispatch]);

  useEffect(() => {
    if (
      openDetail &&
      currentDesignRequest?.finalDesignImage &&
      currentDesignRequest.status === "COMPLETED"
    ) {
      dispatch(fetchImageFromS3(currentDesignRequest.finalDesignImage));
    }
  }, [openDetail, currentDesignRequest, dispatch]);
  useEffect(() => {
    if (uploadImageError) {
      setNotification({
        open: true,
        message: `Lỗi upload ảnh: ${uploadImageError}`,
        severity: "error",
      });
      dispatch(clearImpressionError());
    }
  }, [uploadImageError, dispatch]);
  useEffect(() => {
    if (orders.length > 0) {
      // Load impression cho các đơn hàng COMPLETED
      orders.forEach((order) => {
        if (order.status === "COMPLETED") {
          dispatch(fetchImpressionsByOrderId(order.id));
        }
      });
    }
  }, [orders, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setNotification({
          open: true,
          message: "Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF)",
          severity: "error",
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setNotification({
          open: true,
          message: "Kích thước file không được vượt quá 5MB",
          severity: "error",
        });
        return;
      }

      setSelectedImage(file);

      // Tạo preview ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset input file
    const fileInput = document.getElementById("feedback-image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };
  const handleOpenImpressionDialog = (orderId) => {
    setImpressionDialog({
      open: true,
      orderId: orderId,
    });
    setImpressionForm({
      rating: 5,
      comment: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
    // setCreatedImpressionId(null);
  };
  const handleCloseImpressionDialog = () => {
    setImpressionDialog({
      open: false,
      orderId: null,
    });
    setImpressionForm({
      rating: 5,
      comment: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
    // setCreatedImpressionId(null);
  };
  const handleSubmitImpression = async () => {
    if (!impressionForm.comment.trim()) {
      setNotification({
        open: true,
        message: "Vui lòng nhập nhận xét về đơn hàng",
        severity: "warning",
      });
      return;
    }

    setSubmittingImpression(true);

    try {
      // Bước 1: Tạo impression trước
      const result = await dispatch(
        createImpression({
          orderId: impressionDialog.orderId,
          impressionData: {
            rating: impressionForm.rating,
            comment: impressionForm.comment.trim(),
          },
        })
      ).unwrap();

      // setCreatedImpressionId(result.id);

      // Bước 2: Upload ảnh nếu có
      if (selectedImage && result.id) {
        try {
          await dispatch(
            uploadImpressionImage({
              impressionId: result.id,
              imageFile: selectedImage,
            })
          ).unwrap();

          setNotification({
            open: true,
            message: "Gửi đánh giá và ảnh thành công! Cảm ơn bạn đã phản hồi.",
            severity: "success",
          });
        } catch (uploadError) {
          setNotification({
            open: true,
            message:
              "Gửi đánh giá thành công nhưng không thể upload ảnh. Vui lòng thử upload ảnh lại sau.",
            severity: "warning",
          });
        }
      } else {
        setNotification({
          open: true,
          message: "Gửi đánh giá thành công! Cảm ơn bạn đã phản hồi.",
          severity: "success",
        });
      }

      handleCloseImpressionDialog();

      // Có thể reload lại orders để cập nhật trạng thái
      if (user?.id) {
        dispatch(fetchOrdersByUserId(user.id));
      }
    } catch {
      setNotification({
        open: true,
        message: "Không thể gửi đánh giá. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setSubmittingImpression(false);
    }
  };
  const handleDeposit = (order) => {
    // Lưu thông tin order vào localStorage để trang checkout có thể sử dụng
    localStorage.setItem("checkoutOrderId", order.id);
    localStorage.setItem("checkoutOrderInfo", JSON.stringify(order));

    // Navigate đến trang checkout
    navigate("/checkout", {
      state: {
        orderId: order.id,
        orderInfo: order,
      },
    });
  };

  const handleApproveProposal = async (proposalId) => {
    setActionLoading(true);
    const res = await approvePriceProposal(proposalId);
    if (res.success) {
      setNotification({
        open: true,
        message: "Chấp nhận báo giá thành công!",
        severity: "success",
      });
      // Reload proposals
      getPriceProposals(currentDesignRequest.id).then(
        (r) => r.success && setPriceProposals(r.result)
      );
    } else {
      setNotification({
        open: true,
        message: res.error || "Chấp nhận báo giá thất bại",
        severity: "error",
      });
    }
    setActionLoading(false);
  };

  const handleOpenOfferDialog = (proposalId) => {
    setOfferDialog({ open: true, proposalId });
    setOfferForm({
      totalPriceOffer: "",
      depositAmountOffer: "",
      rejectionReason: "",
    });
  };
  const handleCloseOfferDialog = () => {
    setOfferDialog({ open: false, proposalId: null });
  };
  const handleOfferSubmit = async () => {
    setActionLoading(true);
    const { proposalId } = offerDialog;
    const data = {
      rejectionReason:
        offerForm.rejectionReason || "Khách muốn thương lượng giá",
      totalPriceOffer: Number(offerForm.totalPriceOffer),
      depositAmountOffer: Number(offerForm.depositAmountOffer),
    };
    const res = await offerPriceProposal(proposalId, data);
    if (res.success) {
      setNotification({
        open: true,
        message: "Gửi offer giá mới thành công!",
        severity: "success",
      });
      handleCloseOfferDialog();
      // Reload lại proposal và custom design request
      getPriceProposals(currentDesignRequest.id).then(
        (r) => r.success && setPriceProposals(r.result)
      );
      // Có thể reload lại custom design request nếu cần
    } else {
      setNotification({
        open: true,
        message: res.error || "Gửi offer thất bại",
        severity: "error",
      });
    }
    setActionLoading(false);
  };

  // Hàm xử lý đặt cọc custom design (redirect thẳng)
  const handleCustomDeposit = (customDesignRequestId) => {
    setDepositLoadingId(customDesignRequestId);
    dispatch(payCustomDesignDepositThunk(customDesignRequestId))
      .unwrap()
      .then((res) => {
        setDepositLoadingId(null);
        const checkoutUrl = res.result?.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          setNotification({
            open: true,
            message: res.error || "Không thể tạo link thanh toán",
            severity: "error",
          });
        }
      })
      .catch((err) => {
        setDepositLoadingId(null);
        setNotification({
          open: true,
          message: err || "Không thể tạo link thanh toán",
          severity: "error",
        });
      });
  };

  // Xử lý chấp nhận demo
  const handleApproveDemo = async () => {
    if (!latestDemo) return;
    setDemoActionLoading(true);
    try {
      await dispatch(approveDemoDesign(latestDemo.id)).unwrap();
      setNotification({
        open: true,
        message: "Chấp nhận demo thành công!",
        severity: "success",
      });
      setOpenDetail(false);
    } catch (err) {
      setNotification({
        open: true,
        message: err || "Chấp nhận demo thất bại",
        severity: "error",
      });
    }
    setDemoActionLoading(false);
  };
  // Xử lý từ chối demo
  const handleRejectDemo = async () => {
    if (!latestDemo) return;
    setDemoActionLoading(true);
    try {
      await dispatch(
        rejectDemoDesign({
          customDesignId: latestDemo.id,
          data: { customerNote: rejectReason || "Khách hàng từ chối demo" },
        })
      ).unwrap();
      setNotification({
        open: true,
        message: "Từ chối demo thành công!",
        severity: "success",
      });
      setRejectDialogOpen(false);
      setOpenDetail(false);
    } catch (err) {
      setNotification({
        open: true,
        message: err || "Từ chối demo thất bại",
        severity: "error",
      });
    }
    setDemoActionLoading(false);
  };

  // Thêm hàm xử lý thanh toán tiền còn lại custom design
  const handlePayCustomDesignRemaining = (customDesignRequestId) => {
    setPayingRemaining(true);
    dispatch(payCustomDesignRemainingThunk(customDesignRequestId))
      .unwrap()
      .then((res) => {
        setPayingRemaining(false);
        const checkoutUrl = res.result?.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          setNotification({
            open: true,
            message: res.error || "Không thể tạo link thanh toán",
            severity: "error",
          });
        }
      })
      .catch((err) => {
        setPayingRemaining(false);
        setNotification({
          open: true,
          message: err || "Không thể tạo link thanh toán",
          severity: "error",
        });
      });
  };

  const [openTicketDialog, setOpenTicketDialog] = useState(false);
  const [ticketOrderId, setTicketOrderId] = useState(null);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const createStatus = useSelector(selectCreateStatus);
  const createError = useSelector(selectCreateError);

  const handleOpenTicketDialog = (orderId) => {
    setTicketOrderId(orderId);
    setTicketTitle("");
    setTicketDescription("");
    setOpenTicketDialog(true);
    dispatch(resetCreateStatus());
  };
  const handleCloseTicketDialog = () => {
    setOpenTicketDialog(false);
    setTicketOrderId(null);
    setTicketTitle("");
    setTicketDescription("");
    dispatch(resetCreateStatus());
  };
  const handleSubmitTicket = () => {
    if (!ticketOrderId || !ticketTitle || !ticketDescription) return;
    dispatch(
      createTicket({
        orderId: ticketOrderId,
        ticketData: {
          title: ticketTitle,
          description: ticketDescription,
          severity: "SALE",
        },
      })
    );
  };

  useEffect(() => {
    if (createStatus === "succeeded") {
      setTimeout(() => {
        handleCloseTicketDialog();
      }, 1200);
    }
  }, [createStatus]);

  // Thêm selector lấy ảnh S3 cho demo
  const s3Images = useSelector((state) => state.s3.images);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const demoSubImagesObj = useSelector((state) => state.demo.demoSubImages);

  if (!isAuthenticated) {
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h6" color="error">
          Vui lòng đăng nhập để xem lịch sử đơn hàng.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        py: 6,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        maxWidth="lg"
        mx="auto"
        py={4}
        px={2}
        sx={{ position: "relative", zIndex: 1 }}
      >
        {/* Header Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 4,
            p: 4,
            boxShadow: "0 25px 45px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 80,
                height: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 2,
              },
            }}
          >
            Lịch sử đơn hàng
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Quản lý và theo dõi tất cả đơn hàng của bạn
          </Typography>
        </Box>

        {/* Tabs Section */}
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 3,
            p: 1,
            mb: 3,
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            sx={{
              "& .MuiTabs-indicator": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                height: 3,
                borderRadius: 2,
              },
              "& .MuiTab-root": {
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                color: "rgba(0, 0, 0, 0.6)",
                transition: "all 0.3s ease",
                borderRadius: 2,
                margin: "0 4px",
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.08)",
                  transform: "translateY(-1px)",
                },
                "&.Mui-selected": {
                  background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                  color: "#667eea",
                  fontWeight: 700,
                },
              },
            }}
          >
            <Tab
              label="Lịch sử đơn hàng"
              icon={<HistoryIcon />}
              iconPosition="start"
            />
            <Tab
              label="Đơn thiết kế thủ công"
              icon={<BrushIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
        {tab === 0 ? (
          <>
            {orderLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                py={6}
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: 3,
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <CircularProgress
                    size={60}
                    sx={{ color: "#667eea", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    Đang tải dữ liệu...
                  </Typography>
                </Box>
              </Box>
            ) : orderError ? (
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: 3,
                  p: 4,
                  textAlign: "center",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
                }}
              >
                <Typography color="error" variant="h6">
                  ⚠️ {orderError}
                </Typography>
              </Box>
            ) : orders.length === 0 ? (
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: 3,
                  p: 6,
                  textAlign: "center",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
                }}
              >
                <HistoryIcon
                  sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Chưa có đơn hàng nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {orders.map((order) => {
                  // ✅ Sử dụng helper function thay vì useSelector
                  const orderImpressions = getOrderImpressions(order.id);

                  return (
                    <Card
                      key={order.id}
                      sx={{
                        borderRadius: 3,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 25px 45px rgba(0, 0, 0, 0.12)",
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: 4,
                          height: "100%",
                          background: order.aiDesigns
                            ? "linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)"
                            : order.customDesignRequests
                            ? "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)"
                            : "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={3}
                          alignItems={{ sm: "center" }}
                          justifyContent="space-between"
                        >
                          <Box flex={1} minWidth={0}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              mb={2}
                              flexWrap="wrap"
                            >
                              {order.aiDesigns ? (
                                <Chip
                                  icon={<SmartToyIcon />}
                                  label="AI Design"
                                  size="small"
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)",
                                    color: "white",
                                    fontWeight: 600,
                                    "& .MuiChip-icon": { color: "white" },
                                  }}
                                />
                              ) : order.customDesignRequests ? (
                                <Chip
                                  icon={<BrushIcon />}
                                  label="Custom Design"
                                  size="small"
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)",
                                    color: "white",
                                    fontWeight: 600,
                                    "& .MuiChip-icon": { color: "white" },
                                  }}
                                />
                              ) : (
                                <Chip
                                  icon={<ShoppingBagIcon />}
                                  label="Đơn hàng thường"
                                  size="small"
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
                                    color: "white",
                                    fontWeight: 600,
                                    "& .MuiChip-icon": { color: "white" },
                                  }}
                                />
                              )}

                              <Chip
                                label={
                                  statusMap[order.status]?.label || order.status
                                }
                                size="small"
                                sx={{
                                  background:
                                    order.status === "COMPLETED"
                                      ? "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)"
                                      : order.status === "CANCELLED"
                                      ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                      : order.status === "IN_PROGRESS"
                                      ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                                      : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                  color: "white",
                                  fontWeight: 600,
                                  "& .MuiChip-icon": { color: "white" },
                                }}
                              />
                            </Stack>

                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{
                                  wordBreak: "break-all",
                                  overflowWrap: "break-word",
                                  color: "#667eea",
                                  mb: 1,
                                }}
                              >
                                Mã đơn: #{order.id}
                              </Typography>

                              {order.customDesignRequests && (
                                <Typography
                                  color="text.secondary"
                                  fontSize={14}
                                  sx={{
                                    background: "rgba(102, 126, 234, 0.04)",
                                    p: 1.5,
                                    borderRadius: 2,
                                    border:
                                      "1px solid rgba(102, 126, 234, 0.1)",
                                  }}
                                >
                                  <b>Yêu cầu thiết kế:</b>{" "}
                                  {order.customDesignRequests.requirements?.substring(
                                    0,
                                    50
                                  )}
                                  {order.customDesignRequests.requirements
                                    ?.length > 50
                                    ? "..."
                                    : ""}
                                </Typography>
                              )}

                              {order.aiDesigns && (
                                <Typography
                                  color="text.secondary"
                                  fontSize={14}
                                >
                                  <b>Ghi chú:</b>{" "}
                                  {order.aiDesigns.customerNote?.substring(
                                    0,
                                    50
                                  )}
                                  {order.aiDesigns.customerNote?.length > 50
                                    ? "..."
                                    : ""}
                                </Typography>
                              )}

                              <Typography color="text.secondary" fontSize={14}>
                                Ngày đặt:{" "}
                                {new Date(order.orderDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </Typography>
                              <Typography color="text.secondary" fontSize={14}>
                                Tổng tiền:{" "}
                                {order.totalAmount?.toLocaleString("vi-VN") ||
                                  0}
                                ₫
                              </Typography>
                              {order.status === "DEPOSITED" && (
                                <>
                                  <Typography
                                    color="success.main"
                                    fontSize={14}
                                  >
                                    Đã đặt cọc:{" "}
                                    {order.depositAmount?.toLocaleString(
                                      "vi-VN"
                                    ) || 0}
                                    ₫
                                  </Typography>
                                  <Typography color="info.main" fontSize={14}>
                                    Còn lại:{" "}
                                    {order.remainingAmount?.toLocaleString(
                                      "vi-VN"
                                    ) || 0}
                                    ₫
                                  </Typography>
                                </>
                              )}
                              {order.status === "INSTALLED" && (
                                <>
                                  <Typography
                                    color="success.main"
                                    fontSize={14}
                                  >
                                    Đã đặt cọc:{" "}
                                    {order.depositAmount?.toLocaleString(
                                      "vi-VN"
                                    ) || 0}
                                    ₫
                                  </Typography>
                                  {order.remainingAmount > 0 ? (
                                    <Typography
                                      color="warning.main"
                                      fontSize={14}
                                      fontWeight={600}
                                    >
                                      🔔 Còn lại cần thanh toán:{" "}
                                      {order.remainingAmount?.toLocaleString(
                                        "vi-VN"
                                      ) || 0}
                                      ₫
                                    </Typography>
                                  ) : (
                                    <Typography
                                      color="success.main"
                                      fontSize={14}
                                      fontWeight={600}
                                    >
                                      ✅ Đã thanh toán đầy đủ
                                    </Typography>
                                  )}
                                </>
                              )}
                              {!["DEPOSITED", "INSTALLED"].includes(
                                order.status
                              ) &&
                                order.remainingAmount > 0 && (
                                  <Typography color="info.main" fontSize={14}>
                                    Còn lại:{" "}
                                    {order.remainingAmount?.toLocaleString(
                                      "vi-VN"
                                    ) || 0}
                                    ₫
                                  </Typography>
                                )}
                              {order.status === "IN_PROGRESS" &&
                                order.estimatedDeliveryDate && (
                                  <Typography
                                    color="primary.main"
                                    fontSize={14}
                                    fontWeight={500}
                                  >
                                    📅 Ngày giao dự kiến:{" "}
                                    {new Date(
                                      order.estimatedDeliveryDate
                                    ).toLocaleDateString("vi-VN")}
                                  </Typography>
                                )}
                              {order.deliveryDate && (
                                <Typography color="primary.main" fontSize={14}>
                                  Ngày giao dự kiến:{" "}
                                  {new Date(
                                    order.deliveryDate
                                  ).toLocaleDateString("vi-VN")}
                                </Typography>
                              )}
                              {/* Thêm thanh tiến trình cho các trạng thái sản xuất */}
                              {[
                                "PRODUCING",
                                "PRODUCTION_COMPLETED",
                                "DELIVERING",
                                "INSTALLED",
                              ].includes(order.status) && (
                                <ProductionProgressBar
                                  status={order.status}
                                  order={order}
                                />
                              )}
                            </Box>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={1}
                              alignItems="center"
                              flexShrink={0} // Ngăn không cho phần này bị co lại
                              minWidth={{ xs: "100%", sm: "auto" }} // Trên mobile chiếm full width
                            >
                              <Chip
                                label={
                                  statusMap[order.status]?.label || order.status
                                }
                                color={
                                  statusMap[order.status]?.color || "default"
                                }
                              />

                              {/* Chip outline THANH TOÁN TIỀN CÒN LẠI nếu status là WAITING_FULL_PAYMENT */}
                              {order.status === "WAITING_FULL_PAYMENT" && (
                                <Chip
                                  label="THANH TOÁN TIỀN CÒN LẠI"
                                  color="warning"
                                  variant="outlined"
                                  sx={{
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap",
                                  }}
                                />
                              )}
                              {/* {order.status === "IN_PROGRESS" && (
                          <Chip
                            label="Đang thực hiện"
                            color="info"
                            variant="outlined"
                            sx={{
                              minWidth: "fit-content",
                              whiteSpace: "nowrap",
                            }}
                          />
                        )} */}
                              {order.status === "DEPOSITED" && (
                                <Chip
                                  label="Đang chờ ngày giao dự kiến"
                                  color="info"
                                  variant="outlined"
                                  sx={{
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap",
                                  }}
                                />
                              )}

                              {["APPROVED", "CONFIRMED", "PENDING"].includes(
                                (order.status || "").toUpperCase()
                              ) && (
                                <Button
                                  variant="contained"
                                  color="warning"
                                  size="small"
                                  onClick={() => handleDeposit(order)}
                                  sx={{
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                  }}
                                >
                                  ĐẶT CỌC NGAY
                                </Button>
                              )}
                              {[
                                "CONTRACT_SENT",
                                "CONTRACT_SIGNED",
                                "CONTRACT_RESIGNED",
                                "CONTRACT_CONFIRMED",
                              ].includes(
                                (order.status || "").toUpperCase()
                              ) && (
                                <Button
                                  variant="outlined"
                                  color="info"
                                  size="small"
                                  onClick={() => handleGetContract(order.id)}
                                  disabled={contractLoading}
                                  startIcon={
                                    contractLoading ? (
                                      <CircularProgress size={16} />
                                    ) : null
                                  }
                                  sx={{
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap", // Không cho phép text trong button xuống dòng
                                    flexShrink: 0, // Không cho button bị co lại
                                  }}
                                >
                                  Xem hợp đồng
                                </Button>
                              )}
                              {order.status === "CONTRACT_CONFIRMED" && (
                                <Button
                                  variant="contained"
                                  color="warning"
                                  size="small"
                                  onClick={() => handleDeposit(order)}
                                  sx={{
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                  }}
                                >
                                  ĐẶT CỌC NGAY
                                </Button>
                              )}
                            </Stack>
                            {/* Nút tạo ticket */}
                            <Box
                              sx={{
                                minWidth: 180,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 1,
                              }}
                            >
                              <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleOpenTicketDialog(order.id)}
                              >
                                Yêu cầu hỗ trợ
                              </Button>
                            </Box>
                          </Box>
                        </Stack>
                        {order.status === "COMPLETED" && (
                          <>
                            <Divider sx={{ my: 2 }} />

                            {/* Hiển thị feedback đã gửi */}
                            {orderImpressions && orderImpressions.length > 0 ? (
                              <Box
                                sx={{
                                  p: 2,
                                  backgroundColor: "info.50",
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "info.200",
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={600}
                                  color="info.dark"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 2,
                                  }}
                                >
                                  <FeedbackIcon /> Đánh giá của bạn
                                </Typography>

                                {orderImpressions.map((impression, index) => (
                                  <Box
                                    key={impression.id}
                                    sx={{
                                      mb:
                                        index < orderImpressions.length - 1
                                          ? 2
                                          : 0,
                                      p: 2,
                                      backgroundColor: "white",
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "grey.200",
                                    }}
                                  >
                                    {/* Rating */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 1,
                                      }}
                                    >
                                      <Rating
                                        value={impression.rating}
                                        readOnly
                                        size="small"
                                        icon={<StarIcon fontSize="inherit" />}
                                        emptyIcon={
                                          <StarIcon fontSize="inherit" />
                                        }
                                      />
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        ({impression.rating}/5)
                                      </Typography>
                                    </Box>

                                    {/* Comment */}
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                      {impression.comment}
                                    </Typography>

                                    {/* Feedback Image */}
                                    {impression.feedbackImageUrl && (
                                      <Box sx={{ mb: 1 }}>
                                        <Box
                                          component="img"
                                          src={impression.feedbackImageUrl}
                                          alt="Ảnh feedback"
                                          sx={{
                                            maxWidth: 200,
                                            height: "auto",
                                            borderRadius: 1,
                                            cursor: "pointer",
                                            "&:hover": {
                                              opacity: 0.8,
                                            },
                                          }}
                                          onClick={() =>
                                            window.open(
                                              impression.feedbackImageUrl,
                                              "_blank"
                                            )
                                          }
                                        />
                                      </Box>
                                    )}

                                    {/* Feedback Info */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Gửi lúc:{" "}
                                        {new Date(
                                          impression.sendAt
                                        ).toLocaleString("vi-VN")}
                                      </Typography>
                                      <Chip
                                        label={
                                          IMPRESSION_STATUS_MAP[
                                            impression.status
                                          ]?.label || impression.status
                                        }
                                        color={
                                          IMPRESSION_STATUS_MAP[
                                            impression.status
                                          ]?.color || "default"
                                        }
                                        size="small"
                                      />
                                    </Box>

                                    {/* Admin Response */}
                                    {impression.response && (
                                      <Box
                                        sx={{
                                          mt: 2,
                                          p: 2,
                                          backgroundColor: "success.50",
                                          borderRadius: 1,
                                          border: "1px solid",
                                          borderColor: "success.200",
                                        }}
                                      >
                                        <Typography
                                          variant="subtitle2"
                                          color="success.dark"
                                          fontWeight={600}
                                          sx={{ mb: 1 }}
                                        >
                                          💬 Phản hồi từ chúng tôi:
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="success.dark"
                                        >
                                          {impression.response}
                                        </Typography>
                                        {impression.responseAt && (
                                          <Typography
                                            variant="caption"
                                            color="success.dark"
                                            sx={{ display: "block", mt: 1 }}
                                          >
                                            Phản hồi lúc:{" "}
                                            {new Date(
                                              impression.responseAt
                                            ).toLocaleString("vi-VN")}
                                          </Typography>
                                        )}
                                      </Box>
                                    )}
                                  </Box>
                                ))}

                                {/* Nút gửi feedback mới */}
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<FeedbackIcon />}
                                  onClick={() =>
                                    handleOpenImpressionDialog(order.id)
                                  }
                                  sx={{
                                    mt: 2,
                                    borderRadius: 2,
                                    textTransform: "none",
                                  }}
                                >
                                  Gửi đánh giá khác
                                </Button>
                              </Box>
                            ) : (
                              // Chưa có feedback nào
                              <Box
                                sx={{
                                  p: 2,
                                  backgroundColor: "success.50",
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "success.200",
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={600}
                                  color="success.dark"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                  }}
                                >
                                  <StarIcon /> Đơn hàng đã hoàn thành
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 2 }}
                                >
                                  🎉 Cảm ơn bạn đã sử dụng dịch vụ của chúng
                                  tôi! Hãy chia sẻ trải nghiệm của bạn để giúp
                                  chúng tôi cải thiện chất lượng dịch vụ.
                                </Typography>

                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<FeedbackIcon />}
                                  onClick={() =>
                                    handleOpenImpressionDialog(order.id)
                                  }
                                  sx={{
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    boxShadow: 2,
                                    "&:hover": {
                                      boxShadow: 4,
                                    },
                                  }}
                                >
                                  Đánh giá đơn hàng
                                </Button>
                              </Box>
                            )}
                          </>
                        )}
                        {order.status === "INSTALLED" &&
                          order.remainingAmount > 0 && (
                            <Box
                              sx={{
                                mt: 3,
                                pt: 2,
                                borderTop: "1px solid",
                                borderColor: "grey.200",
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="warning.main"
                                    fontWeight={600}
                                  >
                                    🔔 Còn lại cần thanh toán:{" "}
                                    {order.remainingAmount?.toLocaleString(
                                      "vi-VN"
                                    ) || 0}
                                    ₫
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Đơn hàng đã lắp đặt hoàn tất, vui lòng thanh
                                    toán số tiền còn lại
                                  </Typography>
                                </Box>
                                <Button
                                  variant="contained"
                                  color="warning"
                                  size="large"
                                  onClick={() => handlePayRemaining(order)} // ✅ Thay đổi function call
                                  disabled={
                                    remainingPaymentLoading[order.id] ||
                                    paymentLoading
                                  } // ✅ Thêm disabled state
                                  sx={{
                                    minWidth: "200px",
                                    fontWeight: 600,
                                    boxShadow: 2,
                                    "&:hover": {
                                      boxShadow: 4,
                                    },
                                  }}
                                >
                                  {remainingPaymentLoading[order.id] ? (
                                    <>
                                      <CircularProgress
                                        size={20}
                                        color="inherit"
                                        sx={{ mr: 1 }}
                                      />
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    "💰 THANH TOÁN NGAY"
                                  )}
                                </Button>
                              </Stack>
                            </Box>
                          )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </>
        ) : (
          <Stack spacing={3}>
            {customStatus === "loading" ? (
              <Box
                display="flex"
                justifyContent="center"
                py={6}
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: 3,
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <CircularProgress
                    size={60}
                    sx={{ color: "#667eea", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    Đang tải thiết kế...
                  </Typography>
                </Box>
              </Box>
            ) : customError ? (
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: 3,
                  p: 4,
                  textAlign: "center",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
                }}
              >
                <Typography color="error" variant="h6">
                  ⚠️ {customError}
                </Typography>
              </Box>
            ) : designRequests.length === 0 ? (
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: 3,
                  p: 6,
                  textAlign: "center",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
                }}
              >
                <BrushIcon
                  sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Chưa có đơn thiết kế nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bạn chưa có yêu cầu thiết kế thủ công nào. Hãy tạo yêu cầu
                  mới!
                </Typography>
              </Box>
            ) : (
              designRequests.map((req) => (
                <Card
                  key={req.id}
                  sx={{
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 25px 45px rgba(0, 0, 0, 0.12)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: 4,
                      height: "100%",
                      background:
                        "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="column" spacing={2}>
                      <Box
                        sx={{
                          cursor: "pointer",
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(33, 150, 243, 0.04)",
                          border: "1px solid rgba(33, 150, 243, 0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: "rgba(33, 150, 243, 0.08)",
                            transform: "translateY(-1px)",
                          },
                        }}
                        onClick={() => {
                          dispatch(setCurrentDesignRequest(req));
                          setOpenDetail(true);
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{
                            color: "#2196f3",
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <BrushIcon />
                          Yêu cầu thiết kế #{req.id}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            sx={{ mb: 1, color: "text.primary" }}
                          >
                            📝 Mô tả: {req.requirements}
                          </Typography>

                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <Typography variant="body2" color="text.secondary">
                              💰 Tổng tiền:{" "}
                              <strong>
                                {req.totalPrice?.toLocaleString("vi-VN")}₫
                              </strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              🏦 Đặt cọc:{" "}
                              <strong>
                                {req.depositAmount?.toLocaleString("vi-VN")}₫
                              </strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📅 Ngày tạo:{" "}
                              <strong>
                                {new Date(req.createAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </strong>
                            </Typography>
                          </Stack>
                        </Box>

                        <Chip
                          label={statusMap[req.status]?.label || req.status}
                          size="medium"
                          sx={{
                            background:
                              req.status === "COMPLETED"
                                ? "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)"
                                : req.status === "CANCELLED"
                                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                : req.status === "DEPOSITED"
                                ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                                : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            color: "white",
                            fontWeight: 600,
                            "& .MuiChip-icon": { color: "white" },
                          }}
                        />
                      </Box>

                      {/* Status-specific actions */}
                      {req.status === "WAITING_FULL_PAYMENT" && (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                          }}
                        >
                          <Chip
                            label="⚡ THANH TOÁN TIỀN CÒN LẠI"
                            sx={{
                              background:
                                "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                              color: "white",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              p: 1,
                            }}
                          />
                        </Box>
                      )}

                      {req.status === "DEPOSITED" && (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                          }}
                        >
                          <Chip
                            icon={<BrushIcon />}
                            label="🎨 Đợi bản demo từ designer"
                            sx={{
                              background:
                                "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
                              color: "white",
                              fontWeight: 600,
                              "& .MuiChip-icon": { color: "white" },
                            }}
                          />
                        </Box>
                      )}

                      {req.status === "APPROVED_PRICING" && (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="warning.dark"
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            💳 Giá đã được phê duyệt, tiến hành đặt cọc
                          </Typography>
                          <Button
                            variant="contained"
                            size="large"
                            sx={{
                              background:
                                "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                              fontWeight: 700,
                              py: 1.5,
                              px: 4,
                              boxShadow: "0 8px 25px rgba(245, 158, 11, 0.3)",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow:
                                  "0 12px 35px rgba(245, 158, 11, 0.4)",
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCustomDeposit(req.id);
                            }}
                            disabled={depositLoadingId === req.id}
                          >
                            {depositLoadingId === req.id ? (
                              <>
                                <CircularProgress
                                  size={20}
                                  color="inherit"
                                  sx={{ mr: 1 }}
                                />
                                Đang xử lý...
                              </>
                            ) : (
                              "💰 Đặt cọc ngay"
                            )}
                          </Button>
                        </Box>
                      )}

                      {/* Action buttons */}
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<DescriptionIcon />}
                          sx={{
                            borderColor: "#2196f3",
                            color: "#2196f3",
                            fontWeight: 600,
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 203, 243, 0.1) 100%)",
                              borderColor: "#21cbf3",
                              transform: "translateY(-1px)",
                            },
                          }}
                          onClick={() => {
                            dispatch(setCurrentDesignRequest(req));
                            setOpenDetail(true);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </Stack>

                      {/* Hiển thị nút lựa chọn thi công trong card khi trạng thái COMPLETED và chưa có lựa chọn */}
                      {/* {req.status === "COMPLETED" &&
                      req.isNeedSupport === null &&
                      !orders.some(
                        (order) => order.customDesignRequests?.id === req.id
                      ) && (
                        <Box
                          mt={1}
                          p={2}
                          border={1}
                          borderRadius={1}
                          borderColor="primary.light"
                          bgcolor="#e3f2fd"
                        >
                          <Typography variant="body2" fontWeight="bold" mb={1}>
                            Bạn muốn sử dụng dịch vụ thi công?
                          </Typography>
                          <Stack direction="row" spacing={1} mt={1}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              disabled={constructionLoading}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConstructionChoice(req.id, true);
                              }}
                              startIcon={
                                constructionLoading ? (
                                  <CircularProgress size={16} />
                                ) : null
                              }
                            >
                              Có thi công
                            </Button>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              disabled={constructionLoading}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConstructionChoice(req.id, false);
                              }}
                              startIcon={
                                constructionLoading ? (
                                  <CircularProgress size={16} />
                                ) : null
                              }
                            >
                              Không thi công
                            </Button>
                          </Stack>
                        </Box>
                      )} */}

                      {/* Hiển thị lựa chọn thi công đã chọn trong card */}
                      {req.status === "COMPLETED" && (
                        <>
                          {req.isNeedSupport === true &&
                          orders.some(
                            (order) => order.customDesignRequests?.id === req.id
                          ) ? (
                            <Box
                              mt={1}
                              p={2}
                              border={1}
                              borderRadius={1}
                              borderColor="info.light"
                              bgcolor="#e1f5fe"
                            >
                              <Typography variant="body2">
                                <b>Đã chọn thi công:</b> Đơn hàng đã được tạo,
                                vui lòng kiểm tra ở tab "Lịch sử đơn hàng"
                              </Typography>
                            </Box>
                          ) : req.isNeedSupport !== null ? (
                            <Box
                              mt={1}
                              p={2}
                              border={1}
                              borderRadius={1}
                              borderColor="success.light"
                              bgcolor="#e8f5e9"
                            >
                              <Typography variant="body2">
                                <b>Đã chọn:</b>{" "}
                                {req.isNeedSupport
                                  ? "Có thi công"
                                  : "Không thi công"}
                              </Typography>
                            </Box>
                          ) : null}
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        )}
        {/* Popup chi tiết custom design request */}
        <Dialog
          open={impressionDialog.open}
          onClose={handleCloseImpressionDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 45px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            sx={{
              textAlign: "center",
              pb: 1,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              position: "relative",
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                fontWeight: 700,
                fontSize: "1.5rem",
              }}
            >
              <StarIcon /> Đánh giá đơn hàng
            </Typography>
            <IconButton
              onClick={handleCloseImpressionDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 4, pb: 2, px: 4 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  color: "#667eea",
                  fontWeight: 600,
                }}
              >
                Đơn hàng #{impressionDialog.orderId}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                }}
              >
                Bạn cảm thấy thế nào về dịch vụ của chúng tôi?
              </Typography>
            </Box>

            {/* Rating Section */}
            <Box
              sx={{
                textAlign: "center",
                mb: 4,
                p: 3,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                border: "1px solid rgba(102, 126, 234, 0.1)",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Đánh giá chung
              </Typography>
              <Rating
                name="feedback-rating"
                value={impressionForm.rating}
                onChange={(event, newValue) => {
                  setImpressionForm((prev) => ({
                    ...prev,
                    rating: newValue || 1,
                  }));
                }}
                size="large"
                precision={1}
                icon={<StarIcon fontSize="inherit" />}
                emptyIcon={<StarIcon fontSize="inherit" />}
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "#fbbf24",
                  },
                  "& .MuiRating-iconEmpty": {
                    color: "rgba(0, 0, 0, 0.1)",
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  fontWeight: 600,
                  color:
                    impressionForm.rating >= 4
                      ? "#22c55e"
                      : impressionForm.rating === 3
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              >
                {impressionForm.rating === 1 && "😞 Rất không hài lòng"}
                {impressionForm.rating === 2 && "😐 Không hài lòng"}
                {impressionForm.rating === 3 && "😊 Bình thường"}
                {impressionForm.rating === 4 && "😃 Hài lòng"}
                {impressionForm.rating === 5 && "🤩 Rất hài lòng"}
              </Typography>
            </Box>

            {/* Comment Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Nhận xét chi tiết <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={impressionForm.comment}
                onChange={(e) =>
                  setImpressionForm((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                placeholder="Chia sẻ trải nghiệm của bạn về chất lượng sản phẩm, dịch vụ khách hàng, thời gian giao hàng..."
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    background: "rgba(102, 126, 234, 0.04)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(102, 126, 234, 0.08)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(102, 126, 234, 0.08)",
                      boxShadow: "0 4px 20px rgba(102, 126, 234, 0.2)",
                    },
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 1,
                  display: "block",
                  fontStyle: "italic",
                }}
              >
                💡 Góp ý của bạn sẽ giúp chúng tôi cải thiện chất lượng dịch vụ
              </Typography>
            </Box>

            {/* Image Upload Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Ảnh đính kèm (tùy chọn)
              </Typography>

              {/* Image Upload Button */}
              {!selectedImage && (
                <Box sx={{ textAlign: "center" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    id="feedback-image-upload"
                  />
                  <label htmlFor="feedback-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CameraAltIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        borderStyle: "dashed",
                        borderWidth: 2,
                        py: 2,
                        px: 3,
                        "&:hover": {
                          borderStyle: "dashed",
                          borderWidth: 2,
                        },
                      }}
                    >
                      Chọn ảnh để upload
                    </Button>
                  </label>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    📸 Hỗ trợ định dạng: JPEG, JPG, PNG, GIF (tối đa 5MB)
                  </Typography>
                </Box>
              )}

              {/* Image Preview */}
              {selectedImage && imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Preview"
                      sx={{
                        width: "100%",
                        maxWidth: 300,
                        height: "auto",
                        maxHeight: 200,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    {/* Remove button */}
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "error.main",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 1)",
                        },
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{
                      mt: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    ✅ Đã chọn: {selectedImage.name}
                  </Typography>

                  {/* Change image button */}
                  <Box sx={{ mt: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                      id="feedback-image-change"
                    />
                    <label htmlFor="feedback-image-change">
                      <Button
                        variant="text"
                        component="span"
                        size="small"
                        startIcon={<CameraAltIcon />}
                        sx={{ textTransform: "none" }}
                      >
                        Chọn ảnh khác
                      </Button>
                    </label>
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
            <Button
              onClick={handleCloseImpressionDialog}
              variant="outlined"
              sx={{
                borderRadius: 3,
                textTransform: "none",
                minWidth: 120,
                fontWeight: 600,
                borderColor: "#667eea",
                color: "#667eea",
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.08)",
                  borderColor: "#764ba2",
                },
              }}
              disabled={submittingImpression || uploadingImage}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitImpression}
              variant="contained"
              disabled={
                submittingImpression ||
                uploadingImage ||
                !impressionForm.comment.trim()
              }
              sx={{
                borderRadius: 3,
                textTransform: "none",
                minWidth: 140,
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
                },
              }}
            >
              {submittingImpression ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Đang gửi...
                </>
              ) : uploadingImage ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Đang upload ảnh...
                </>
              ) : (
                "🚀 Gửi đánh giá"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Chi tiết yêu cầu thiết kế
            <IconButton
              aria-label="close"
              onClick={() => setOpenDetail(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {currentDesignRequest ? (
              <Box>
                <Typography>
                  <b>ID:</b> {currentDesignRequest.id}
                </Typography>
                <Typography>
                  <b>Yêu cầu:</b> {currentDesignRequest.requirements}
                </Typography>
                <Typography>
                  <b>Tổng tiền:</b>{" "}
                  {currentDesignRequest.totalPrice?.toLocaleString("vi-VN") ||
                    "N/A"}
                  ₫
                </Typography>
                <Typography>
                  <b>Đặt cọc:</b>{" "}
                  {currentDesignRequest.depositAmount?.toLocaleString(
                    "vi-VN"
                  ) || "N/A"}
                  ₫
                </Typography>
                <Typography>
                  <b>Còn lại:</b>{" "}
                  {currentDesignRequest.remainingAmount?.toLocaleString(
                    "vi-VN"
                  ) || "N/A"}
                  ₫
                </Typography>
                <Typography>
                  <b>Trạng thái:</b>{" "}
                  {statusMap[currentDesignRequest.status]?.label ||
                    currentDesignRequest.status}
                </Typography>
                <Typography>
                  <b>Ngày tạo:</b>{" "}
                  {new Date(currentDesignRequest.createAt).toLocaleString(
                    "vi-VN"
                  )}
                </Typography>
                <Typography>
                  <b>Ngày cập nhật:</b>{" "}
                  {new Date(currentDesignRequest.updateAt).toLocaleString(
                    "vi-VN"
                  )}
                </Typography>
                <Typography>
                  <b>Hỗ trợ:</b>{" "}
                  {currentDesignRequest.isNeedSupport === null
                    ? "N/A"
                    : currentDesignRequest.isNeedSupport
                    ? "Có"
                    : "Không"}
                </Typography>
                <Typography>
                  <b>Designer phụ trách:</b>{" "}
                  {designerMap[currentDesignRequest?.assignDesigner?.id]
                    ?.fullName ||
                    currentDesignRequest?.assignDesigner?.fullName ||
                    currentDesignRequest?.assignDesigner?.email ||
                    "Chưa có"}
                </Typography>
                {/* <Typography>
                <b>Ảnh thiết kế cuối:</b>{" "}
                {currentDesignRequest.finalDesignImage ? (
                  <img
                    src={currentDesignRequest.finalDesignImage}
                    alt="final"
                    style={{ maxWidth: 200 }}
                  />
                ) : (
                  "Chưa có"
                )}
              </Typography> */}
                <Typography mt={2}>
                  <b>Thông tin lựa chọn sản phẩm:</b>
                </Typography>
                {currentDesignRequest.customerChoiceHistories && (
                  <Box ml={2}>
                    <Typography>
                      <b>Loại sản phẩm:</b>{" "}
                      {
                        currentDesignRequest.customerChoiceHistories
                          .productTypeName
                      }
                    </Typography>
                    <Typography>
                      <b>Công thức tính:</b>{" "}
                      {
                        currentDesignRequest.customerChoiceHistories
                          .calculateFormula
                      }
                    </Typography>
                    <Typography>
                      <b>Tổng tiền:</b>{" "}
                      {currentDesignRequest.customerChoiceHistories.totalAmount?.toLocaleString(
                        "vi-VN"
                      ) || "N/A"}
                      ₫
                    </Typography>
                    <Typography mt={1}>
                      <b>Thuộc tính đã chọn:</b>
                    </Typography>
                    <ul>
                      {currentDesignRequest.customerChoiceHistories.attributeSelections?.map(
                        (attr, idx) => (
                          <li key={idx}>
                            <Typography>
                              <b>{attr.attribute}:</b> {attr.value} | Đơn vị:{" "}
                              {attr.unit} | Giá vật liệu:{" "}
                              {attr.materialPrice?.toLocaleString("vi-VN") || 0}
                              ₫ | Đơn giá:{" "}
                              {attr.unitPrice?.toLocaleString("vi-VN") || 0}₫ |
                              Công thức: {attr.calculateFormula} | Thành tiền:{" "}
                              {attr.subTotal?.toLocaleString("vi-VN") || 0}₫
                            </Typography>
                          </li>
                        )
                      )}
                    </ul>
                    <Typography mt={1}>
                      <b>Kích thước đã chọn:</b>
                    </Typography>
                    <ul>
                      {currentDesignRequest.customerChoiceHistories.sizeSelections?.map(
                        (size, idx) => (
                          <li key={idx}>
                            <Typography>
                              <b>{size.size}:</b> {size.value}
                            </Typography>
                          </li>
                        )
                      )}
                    </ul>
                  </Box>
                )}
                {/* Lịch sử báo giá */}
                <Typography mt={2} variant="h6">
                  Lịch sử báo giá
                </Typography>
                {loadingProposals ? (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress />
                  </Box>
                ) : priceProposals.length === 0 ? (
                  <Typography>Chưa có báo giá nào.</Typography>
                ) : (
                  <Box>
                    {priceProposals.map((proposal) => (
                      <Box
                        key={proposal.id}
                        mb={2}
                        p={2}
                        border={1}
                        borderRadius={2}
                        borderColor="grey.300"
                      >
                        <Typography>
                          <b>Giá báo:</b>{" "}
                          {proposal.totalPrice?.toLocaleString("vi-VN")}₫
                        </Typography>
                        <Typography>
                          <b>Tiền cọc:</b>{" "}
                          {proposal.depositAmount?.toLocaleString("vi-VN")}₫
                        </Typography>
                        {proposal.totalPriceOffer && (
                          <Typography>
                            <b>Giá offer:</b>{" "}
                            {proposal.totalPriceOffer?.toLocaleString("vi-VN")}₫
                          </Typography>
                        )}
                        {proposal.depositAmountOffer && (
                          <Typography>
                            <b>Cọc offer:</b>{" "}
                            {proposal.depositAmountOffer?.toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </Typography>
                        )}
                        <Typography>
                          <b>Trạng thái:</b> {proposal.status}
                        </Typography>
                        <Typography>
                          <b>Ngày báo giá:</b>{" "}
                          {new Date(proposal.createAt).toLocaleString("vi-VN")}
                        </Typography>
                        {/* Nút thao tác nếu trạng thái phù hợp */}
                        {["PENDING", "NEGOTIATING"].includes(
                          proposal.status
                        ) && (
                          <Box mt={1} display="flex" gap={2}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              disabled={actionLoading}
                              onClick={() => handleApproveProposal(proposal.id)}
                            >
                              Chấp nhận
                            </Button>
                            <Button
                              variant="outlined"
                              color="warning"
                              size="small"
                              disabled={actionLoading}
                              onClick={() => handleOpenOfferDialog(proposal.id)}
                            >
                              Offer giá khác
                            </Button>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
                {/* Dialog offer giá khác */}
                <Dialog
                  open={offerDialog.open}
                  onClose={handleCloseOfferDialog}
                >
                  <DialogTitle>Offer giá khác</DialogTitle>
                  <DialogContent>
                    <TextField
                      label="Lý do từ chối"
                      fullWidth
                      margin="normal"
                      value={offerForm.rejectionReason}
                      onChange={(e) =>
                        setOfferForm((f) => ({
                          ...f,
                          rejectionReason: e.target.value,
                        }))
                      }
                      required
                    />
                    <TextField
                      label="Giá offer (VND)"
                      type="number"
                      fullWidth
                      margin="normal"
                      value={offerForm.totalPriceOffer}
                      onChange={(e) =>
                        setOfferForm((f) => ({
                          ...f,
                          totalPriceOffer: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      label="Tiền cọc offer (VND)"
                      type="number"
                      fullWidth
                      margin="normal"
                      value={offerForm.depositAmountOffer}
                      onChange={(e) =>
                        setOfferForm((f) => ({
                          ...f,
                          depositAmountOffer: e.target.value,
                        }))
                      }
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseOfferDialog}>Hủy</Button>
                    <Button
                      onClick={handleOfferSubmit}
                      variant="contained"
                      color="primary"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "Gửi offer"
                      )}
                    </Button>
                  </DialogActions>
                </Dialog>
                {/* Hiển thị lịch sử các bản demo */}
                {demoList.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="h6" gutterBottom>
                      Lịch sử các bản demo
                    </Typography>
                    {demoList.map((demo, idx) => (
                      <Box
                        key={demo.id}
                        mb={2}
                        p={2}
                        border={1}
                        borderRadius={2}
                        borderColor="grey.300"
                      >
                        <Typography fontWeight={600}>
                          Lần gửi #{idx + 1} -{" "}
                          {new Date(demo.createAt).toLocaleString("vi-VN")}
                        </Typography>
                        <Typography>
                          <b>Mô tả:</b>{" "}
                          {demo.designerDescription || "(Không có)"}
                        </Typography>
                        {demo.demoImage && (
                          <Box
                            mt={1}
                            sx={{
                              position: "relative",
                              display: "inline-block",
                            }}
                          >
                            <img
                              src={
                                demo.demoImage.startsWith("http")
                                  ? demo.demoImage
                                  : s3Images[demo.demoImage] || ""
                              }
                              alt={`Demo ${idx + 1}`}
                              style={{
                                maxWidth: 300,
                                borderRadius: 8,
                                cursor: "pointer",
                                display: "block",
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                bgcolor: "rgba(255,255,255,0.85)",
                                borderRadius: "50%",
                                p: 1,
                                boxShadow: 2,
                                cursor: "pointer",
                                zIndex: 2,
                                "&:hover": { bgcolor: "primary.light" },
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onClick={async () => {
                                let subImages = demoSubImagesObj[demo.id] || [];
                                if (subImages.length === 0) {
                                  const res = await dispatch(
                                    getDemoSubImages(demo.id)
                                  ).unwrap();
                                  subImages = res || [];
                                }
                                const mainKey = demo.demoImage;
                                const subKeys = subImages.map(
                                  (img) => img.imageUrl
                                );
                                const allKeys = [mainKey, ...subKeys];
                                await Promise.all(
                                  allKeys.map(async (key) => {
                                    if (
                                      key &&
                                      !key.startsWith("http") &&
                                      !s3Images[key]
                                    ) {
                                      await dispatch(fetchImageFromS3(key));
                                    }
                                  })
                                );
                                const galleryArr = allKeys.map((key) =>
                                  key.startsWith("http")
                                    ? key
                                    : s3Images[key] || ""
                                );
                                setGalleryImages(galleryArr);
                                setGalleryIndex(0);
                                setGalleryOpen(true);
                              }}
                            >
                              <VisibilityIcon
                                sx={{ fontSize: 28, color: "primary.main" }}
                              />
                            </Box>
                          </Box>
                        )}
                        <Typography>
                          <b>Trạng thái:</b> {demo.status}
                        </Typography>
                        {/* Nếu là bản demo cuối cùng và status phù hợp thì hiển thị nút thao tác */}
                        {idx === demoList.length - 1 &&
                          (currentDesignRequest.status === "DEMO_SUBMITTED" ||
                            currentDesignRequest.status ===
                              "REVISION_REQUESTED") && (
                            <Stack direction="row" spacing={2} mt={2}>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={handleApproveDemo}
                                disabled={demoActionLoading}
                              >
                                {demoActionLoading
                                  ? "Đang xử lý..."
                                  : "Chấp nhận demo"}
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setRejectDialogOpen(true)}
                                disabled={demoActionLoading}
                              >
                                Từ chối demo
                              </Button>
                            </Stack>
                          )}
                      </Box>
                    ))}
                  </Box>
                )}
                {/* Hiển thị demo nếu có và status là DEMO_SUBMITTED hoặc WAITING_FULL_PAYMENT */}
                {latestDemo && (
                  <Box mt={2} mb={2}>
                    <Typography variant="subtitle2" color="primary">
                      Demo designer đã gửi:
                    </Typography>
                    <Typography>
                      <b>Mô tả demo:</b>{" "}
                      {latestDemo.designerDescription || "(Không có)"}
                    </Typography>
                    {latestDemo.demoImage && (
                      <Box mt={1}>
                        <img
                          src={
                            latestDemo.demoImage.startsWith("http")
                              ? latestDemo.demoImage
                              : s3Images[latestDemo.demoImage] || ""
                          }
                          alt="Demo đã gửi"
                          style={{ maxWidth: 300, borderRadius: 8 }}
                        />
                      </Box>
                    )}
                    {/* Hiển thị bản thiết kế chính thức nếu đã hoàn thành */}
                    {currentDesignRequest.status === "COMPLETED" &&
                      currentDesignRequest.finalDesignImage && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" color="success.main">
                            Bản thiết kế chính thức:
                          </Typography>
                          {s3FinalImageUrl ? (
                            <img
                              src={s3FinalImageUrl}
                              alt="Thiết kế chính thức"
                              style={{ maxWidth: 300, borderRadius: 8 }}
                            />
                          ) : (
                            <Typography color="text.secondary">
                              Đang tải ảnh...
                            </Typography>
                          )}
                        </Box>
                      )}
                    {/* Nếu status là DEMO_SUBMITTED hoặc REVISION_REQUESTED thì hiển thị nút Chấp nhận/Từ chối demo */}
                    {/* {(currentDesignRequest.status === "DEMO_SUBMITTED" ||
                    currentDesignRequest.status === "REVISION_REQUESTED") && (
                    <Stack direction="row" spacing={2} mt={2}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleApproveDemo}
                        disabled={demoActionLoading}
                      >
                        {demoActionLoading ? "Đang xử lý..." : "Chấp nhận demo"}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setRejectDialogOpen(true)}
                        disabled={demoActionLoading}
                      >
                        Từ chối demo
                      </Button>
                    </Stack>
                  )} */}
                    {/* Nếu status là WAITING_FULL_PAYMENT thì hiển thị nút Thanh Toán Tiền Còn Lại */}
                    {currentDesignRequest.status === "WAITING_FULL_PAYMENT" && (
                      <Button
                        variant="contained"
                        color="warning"
                        sx={{ mt: 2 }}
                        onClick={() =>
                          handlePayCustomDesignRemaining(
                            currentDesignRequest.id
                          )
                        }
                        disabled={payingRemaining}
                      >
                        {payingRemaining ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Thanh toán tiền còn lại"
                        )}
                      </Button>
                    )}
                  </Box>
                )}
                {/* Dưới cùng của Dialog chi tiết: nút Thanh Toán nếu còn tiền phải thanh toán */}
                {(() => {
                  // Tìm order tương ứng với customDesignRequestId
                  const order = orders.find(
                    (o) =>
                      o.customDesignRequests?.id === currentDesignRequest?.id
                  );
                  if (order && order.remainingAmount > 0) {
                    return (
                      <Box mt={3} display="flex" justifyContent="flex-end">
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() => handleDeposit(order)}
                        >
                          Thanh Toán
                        </Button>
                      </Box>
                    );
                  }
                  return null;
                })()}
              </Box>
            ) : (
              <Typography>Không có dữ liệu.</Typography>
            )}
            {/* {currentDesignRequest &&
            currentDesignRequest.status === "COMPLETED" && // Thay "FULLY_PAID" thành "COMPLETED"
            currentDesignRequest.isNeedSupport === null &&
            !orders.some(
              (order) => order.customDesignRequests?.id === currentDesignRequest.id
            ) && (
              <Box
                mt={2}
                p={2}
                border={1}
                borderRadius={2}
                borderColor="primary.light"
                bgcolor="#e3f2fd"
              >
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Bạn có muốn chọn dịch vụ thi công không?
                </Typography>
                <Stack direction="row" spacing={2} mt={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={constructionLoading}
                    onClick={() =>
                      handleConstructionChoice(currentDesignRequest.id, true)
                    }
                    startIcon={
                      constructionLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                  >
                    Có thi công
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={constructionLoading}
                    onClick={() =>
                      handleConstructionChoice(currentDesignRequest.id, false)
                    }
                    startIcon={
                      constructionLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                  >
                    Không thi công
                  </Button>
                </Stack>
              </Box>
            )} */}
            {/* Hiển thị lựa chọn thi công đã chọn */}
            {currentDesignRequest &&
              currentDesignRequest.status === "COMPLETED" && ( // Thay "FULLY_PAID" thành "COMPLETED"
                <>
                  {currentDesignRequest.isNeedSupport === true &&
                  orders.some(
                    (order) =>
                      order.customDesignRequests?.id === currentDesignRequest.id
                  ) ? (
                    <Box
                      mt={2}
                      p={2}
                      border={1}
                      borderRadius={2}
                      borderColor="info.light"
                      bgcolor="#e1f5fe"
                    >
                      <Typography variant="body2">
                        <b>Đã chọn thi công:</b> Đơn hàng đã được tạo, vui lòng
                        kiểm tra ở tab "Lịch sử đơn hàng"
                      </Typography>
                    </Box>
                  ) : currentDesignRequest.isNeedSupport !== null ? (
                    <Box
                      mt={2}
                      p={2}
                      border={1}
                      borderRadius={2}
                      borderColor="success.light"
                      bgcolor="#e8f5e9"
                    >
                      <Typography variant="body2">
                        <b>Đã chọn:</b>{" "}
                        {currentDesignRequest.isNeedSupport
                          ? "Có thi công"
                          : "Không thi công"}
                      </Typography>
                    </Box>
                  ) : null}
                </>
              )}
            {/* Dialog nhập lý do từ chối demo */}
            <Dialog
              open={rejectDialogOpen}
              onClose={() => setRejectDialogOpen(false)}
              PaperProps={{
                sx: { borderRadius: 3, minWidth: 350, p: 0 },
              }}
            >
              <DialogTitle
                sx={{
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 22,
                  pb: 0,
                }}
              >
                Lý do từ chối demo
              </DialogTitle>
              <DialogContent sx={{ p: 3, pt: 2 }}>
                <TextField
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  fullWidth
                  multiline
                  minRows={4}
                  autoFocus
                  variant="outlined"
                  sx={{ borderRadius: 2, mb: 2 }}
                />
              </DialogContent>
              <DialogActions sx={{ justifyContent: "center", pb: 2, pt: 0 }}>
                <Button
                  onClick={() => setRejectDialogOpen(false)}
                  disabled={demoActionLoading}
                  variant="text"
                  color="inherit"
                  sx={{ minWidth: 90, fontWeight: 500 }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleRejectDemo}
                  variant="contained"
                  color="error"
                  disabled={demoActionLoading || !rejectReason.trim()}
                  sx={{
                    minWidth: 160,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    height: 48,
                    fontSize: 16,
                    boxShadow: 2,
                    ml: 2,
                  }}
                  startIcon={<CloseIcon />}
                >
                  {demoActionLoading ? "Đang gửi..." : "Xác nhận từ chối"}
                </Button>
              </DialogActions>
            </Dialog>
          </DialogContent>
        </Dialog>
        <Dialog
          open={contractDialog.open}
          onClose={handleCloseContractDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 45px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              position: "relative",
              py: 3,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: "1.5rem",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                }}
              >
                📄
              </Box>
              <Typography variant="h5" fontWeight={700}>
                Thông tin hợp đồng
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Đơn hàng #{contractDialog.orderId}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleCloseContractDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "white",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              p: 3,
              background: "rgba(248, 250, 252, 0.8)",
            }}
          >
            {contractDialog.contract ? (
              <Box>
                {/* Header với thông tin cơ bản */}
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    🔍 Chi tiết hợp đồng
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        background: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                        p: 2,
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        ID Hợp đồng
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="primary">
                        #{contractDialog.contract.id}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        background: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                        p: 2,
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Số hợp đồng
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {contractDialog.contract.contractNumber || "Chưa có"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography variant="body1" fontWeight={600}>
                      Trạng thái:
                    </Typography>
                    <Chip
                      label={
                        CONTRACT_STATUS_MAP[contractDialog.contract.status]
                          ?.label || contractDialog.contract.status
                      }
                      sx={{
                        background:
                          CONTRACT_STATUS_MAP[contractDialog.contract.status]
                            ?.color === "success"
                            ? "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)"
                            : CONTRACT_STATUS_MAP[
                                contractDialog.contract.status
                              ]?.color === "warning"
                            ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                            : CONTRACT_STATUS_MAP[
                                contractDialog.contract.status
                              ]?.color === "error"
                            ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                            : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        📅 Ngày gửi
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {contractDialog.contract.sentDate
                          ? new Date(
                              contractDialog.contract.sentDate
                            ).toLocaleString("vi-VN")
                          : "Chưa gửi"}
                      </Typography>
                    </Box>

                    {contractDialog.contract.signedDate && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          ✍️ Ngày ký
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {new Date(
                            contractDialog.contract.signedDate
                          ).toLocaleString("vi-VN")}
                        </Typography>
                      </Box>
                    )}

                    {contractDialog.contract.depositPercentChanged && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          💰 Tỷ lệ đặt cọc
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          color="warning.main"
                        >
                          {contractDialog.contract.depositPercentChanged}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Hợp đồng gốc */}
                {contractDialog.contract.contractUrl && (
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)",
                      borderRadius: 3,
                      p: 3,
                      mb: 3,
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background:
                          "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)",
                      }}
                    />

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        color: "#1d4ed8",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      📄 Hợp đồng gốc
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleViewContract(
                            contractDialog.contract.contractUrl
                          )
                        }
                        disabled={contractViewLoading}
                        startIcon={
                          contractViewLoading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Box component="span" sx={{ fontSize: "1.1rem" }}>
                              👁️
                            </Box>
                          )
                        }
                        sx={{
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                          fontWeight: 600,
                          py: 1.5,
                          px: 3,
                          boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
                          },
                        }}
                      >
                        Xem hợp đồng
                      </Button>

                      {/* Nút cho trạng thái SENT */}
                      {contractDialog.contract.status === "SENT" && (
                        <>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              handleDiscussContract(contractDialog.contract.id)
                            }
                            disabled={discussLoading}
                            startIcon={
                              discussLoading ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Box
                                  component="span"
                                  sx={{ fontSize: "1.1rem" }}
                                >
                                  💬
                                </Box>
                              )
                            }
                            sx={{
                              borderRadius: 2,
                              borderColor: "#f59e0b",
                              color: "#f59e0b",
                              fontWeight: 600,
                              py: 1.5,
                              px: 3,
                              "&:hover": {
                                background: "rgba(245, 158, 11, 0.1)",
                                borderColor: "#d97706",
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            Yêu cầu thảo luận
                          </Button>

                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleUploadSignedContract(
                                  contractDialog.contract.id,
                                  file
                                );
                              }
                              e.target.value = "";
                            }}
                            style={{ display: "none" }}
                            id={`signed-contract-upload-${contractDialog.contract.id}`}
                          />
                          <label
                            htmlFor={`signed-contract-upload-${contractDialog.contract.id}`}
                          >
                            <Button
                              variant="contained"
                              component="span"
                              disabled={uploadingSignedContract}
                              startIcon={
                                uploadingSignedContract ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <Box
                                    component="span"
                                    sx={{ fontSize: "1.1rem" }}
                                  >
                                    ✅
                                  </Box>
                                )
                              }
                              sx={{
                                borderRadius: 2,
                                background:
                                  "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                fontWeight: 600,
                                py: 1.5,
                                px: 3,
                                boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                                "&:hover": {
                                  transform: "translateY(-1px)",
                                  boxShadow:
                                    "0 6px 20px rgba(34, 197, 94, 0.4)",
                                },
                              }}
                            >
                              {uploadingSignedContract
                                ? "Đang upload..."
                                : "Xác nhận hợp đồng"}
                            </Button>
                          </label>
                        </>
                      )}

                      {/* Nút cho trạng thái CONTRACT_RESIGNED */}
                      {contractDialog.contract.status === "NEED_RESIGNED" && (
                        <>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleUploadSignedContract(
                                  contractDialog.contract.id,
                                  file
                                );
                              }
                              e.target.value = "";
                            }}
                            style={{ display: "none" }}
                            id={`resigned-contract-upload-${contractDialog.contract.id}`}
                          />
                          <label
                            htmlFor={`resigned-contract-upload-${contractDialog.contract.id}`}
                          >
                            <Button
                              variant="contained"
                              component="span"
                              disabled={uploadingSignedContract}
                              startIcon={
                                uploadingSignedContract ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <Box
                                    component="span"
                                    sx={{ fontSize: "1.1rem" }}
                                  >
                                    🔄
                                  </Box>
                                )
                              }
                              sx={{
                                borderRadius: 2,
                                background:
                                  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                fontWeight: 600,
                                py: 1.5,
                                px: 3,
                                boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
                                "&:hover": {
                                  transform: "translateY(-1px)",
                                  boxShadow:
                                    "0 6px 20px rgba(245, 158, 11, 0.4)",
                                },
                              }}
                            >
                              {uploadingSignedContract
                                ? "Đang upload..."
                                : "Gửi lại hợp đồng đã ký"}
                            </Button>
                          </label>
                        </>
                      )}
                    </Box>
                  </Box>
                )}
                {contractDialog.contract.status === "NEED_RESIGNED" && (
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)",
                      borderRadius: 3,
                      p: 3,
                      mb: 3,
                      border: "2px dashed #f59e0b",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background:
                          "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
                      }}
                    />

                    <Box
                      sx={{
                        background: "rgba(245, 158, 11, 0.1)",
                        borderRadius: 2,
                        p: 2,
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontSize: "2rem",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        }}
                      >
                        🔄
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="#d97706"
                          sx={{ mb: 0.5 }}
                        >
                          Yêu cầu gửi lại hợp đồng
                        </Typography>
                        <Typography
                          variant="body2"
                          color="#92400e"
                          sx={{ lineHeight: 1.6 }}
                        >
                          Chúng tôi đã yêu cầu bạn gửi lại hợp đồng đã ký. Vui
                          lòng kiểm tra hợp đồng gốc, ký lại và upload file hợp
                          đồng đã ký mới.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          handleViewContract(
                            contractDialog.contract.contractUrl
                          )
                        }
                        disabled={contractViewLoading}
                        startIcon={
                          contractViewLoading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Box component="span" sx={{ fontSize: "1.1rem" }}>
                              👁️
                            </Box>
                          )
                        }
                        sx={{
                          borderRadius: 2,
                          borderColor: "#3b82f6",
                          color: "#3b82f6",
                          fontWeight: 600,
                          py: 1.5,
                          px: 3,
                          "&:hover": {
                            background: "rgba(59, 130, 246, 0.1)",
                            borderColor: "#1d4ed8",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        Xem hợp đồng gốc
                      </Button>

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleUploadSignedContract(
                              contractDialog.contract.id,
                              file
                            );
                          }
                          e.target.value = "";
                        }}
                        style={{ display: "none" }}
                        id={`need-resign-upload-${contractDialog.contract.id}`}
                      />
                      <label
                        htmlFor={`need-resign-upload-${contractDialog.contract.id}`}
                      >
                        <Button
                          variant="contained"
                          component="span"
                          disabled={uploadingSignedContract}
                          startIcon={
                            uploadingSignedContract ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Box component="span" sx={{ fontSize: "1.1rem" }}>
                                📤
                              </Box>
                            )
                          }
                          size="large"
                          sx={{
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            fontWeight: 600,
                            py: 1.5,
                            px: 3,
                            boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
                            "&:hover": {
                              transform: "translateY(-1px)",
                              boxShadow: "0 6px 20px rgba(245, 158, 11, 0.4)",
                            },
                          }}
                        >
                          {uploadingSignedContract
                            ? "Đang upload hợp đồng..."
                            : "Upload hợp đồng đã ký mới"}
                        </Button>
                      </label>
                    </Box>
                  </Box>
                )}
                {/* Hợp đồng đã ký */}
                {contractDialog.contract.signedContractUrl && (
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%)",
                      borderRadius: 3,
                      p: 3,
                      mb: 3,
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background:
                          "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                      }}
                    />

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        color: "#16a34a",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      ✅ Hợp đồng đã ký
                    </Typography>

                    <Button
                      variant="contained"
                      onClick={() =>
                        handleViewContract(
                          contractDialog.contract.signedContractUrl
                        )
                      }
                      disabled={contractViewLoading}
                      startIcon={
                        contractViewLoading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Box component="span" sx={{ fontSize: "1.1rem" }}>
                            👁️
                          </Box>
                        )
                      }
                      sx={{
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        fontWeight: 600,
                        py: 1.5,
                        px: 3,
                        boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 20px rgba(34, 197, 94, 0.4)",
                        },
                      }}
                    >
                      Xem hợp đồng đã ký
                    </Button>
                  </Box>
                )}

                {/* Status messages */}
                {contractDialog.contract.status === "SENT" && (
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)",
                      borderRadius: 3,
                      p: 3,
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontSize: "1.5rem",
                          mt: 0.5,
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        }}
                      >
                        📋
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          color="#d97706"
                          sx={{ mb: 1 }}
                        >
                          Hướng dẫn xử lý hợp đồng
                        </Typography>
                        <Box
                          component="ul"
                          sx={{ pl: 2, m: 0, color: "#92400e" }}
                        >
                          <Typography
                            component="li"
                            variant="body2"
                            sx={{ mb: 0.5 }}
                          >
                            📄 Hợp đồng đã được gửi, vui lòng kiểm tra và ký hợp
                            đồng
                          </Typography>
                          <Typography
                            component="li"
                            variant="body2"
                            sx={{ mb: 0.5 }}
                          >
                            💬 Nếu có thắc mắc, bạn có thể yêu cầu thảo luận với
                            chúng tôi
                          </Typography>
                          <Typography component="li" variant="body2">
                            ✍️ Sau khi ký, hãy upload hợp đồng đã ký bằng nút
                            "Xác nhận hợp đồng"
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}

                {contractDialog.contract.status === "DISCUSSING" && (
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)",
                      borderRadius: 3,
                      p: 3,
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontSize: "1.5rem",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                      }}
                    >
                      💬
                    </Box>
                    <Typography
                      variant="body1"
                      color="#1d4ed8"
                      fontWeight={500}
                    >
                      Yêu cầu thảo luận đã được gửi. Chúng tôi sẽ liên hệ với
                      bạn sớm nhất.
                    </Typography>
                  </Box>
                )}

                {contractDialog.contract.status === "NEED_RESIGNED" && (
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)",
                      borderRadius: 3,
                      p: 3,
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontSize: "1.5rem",
                          mt: 0.5,
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        }}
                      >
                        🔄
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          color="#d97706"
                          sx={{ mb: 1 }}
                        >
                          Yêu cầu gửi lại hợp đồng
                        </Typography>
                        <Box
                          component="ul"
                          sx={{ pl: 2, m: 0, color: "#92400e" }}
                        >
                          <Typography
                            component="li"
                            variant="body2"
                            sx={{ mb: 0.5 }}
                          >
                            🔄 Chúng tôi cần bạn ký lại hợp đồng
                          </Typography>
                          <Typography
                            component="li"
                            variant="body2"
                            sx={{ mb: 0.5 }}
                          >
                            📋 Vui lòng xem lại hợp đồng gốc, ký lại và upload
                            file mới
                          </Typography>
                          <Typography component="li" variant="body2">
                            ⏰ Sau khi upload thành công, chúng tôi sẽ xem xét
                            và xác nhận hợp đồng
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}

                {contractDialog.contract.status === "SIGNED" && (
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%)",
                      borderRadius: 3,
                      p: 3,
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontSize: "1.5rem",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                      }}
                    >
                      ✅
                    </Box>
                    <Typography
                      variant="body1"
                      color="#16a34a"
                      fontWeight={600}
                    >
                      Hợp đồng đã được ký thành công!
                    </Typography>
                  </Box>
                )}

                {contractDialog.contract.status === "REJECTED" && (
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)",
                      borderRadius: 3,
                      p: 3,
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontSize: "1.5rem",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                      }}
                    >
                      ❌
                    </Box>
                    <Typography
                      variant="body1"
                      color="#dc2626"
                      fontWeight={500}
                    >
                      Hợp đồng đã bị từ chối. Vui lòng liên hệ để được hỗ trợ.
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  background:
                    "linear-gradient(135deg, rgba(148, 163, 184, 0.05) 0%, rgba(100, 116, 139, 0.05) 100%)",
                  borderRadius: 3,
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: "3rem",
                    display: "block",
                    mb: 2,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                  }}
                >
                  📋
                </Box>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  fontWeight={500}
                >
                  Chưa có hợp đồng cho đơn hàng này
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Hợp đồng sẽ được tạo sau khi đơn hàng được xác nhận
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: 3,
              background: "rgba(248, 250, 252, 0.8)",
              borderTop: "1px solid rgba(226, 232, 240, 0.5)",
            }}
          >
            <Button
              onClick={handleCloseContractDialog}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                },
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={imageDialog.open}
          onClose={handleCloseImageDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              minHeight: "60vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 1,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              📷 {imageDialog.title}
            </Typography>
            <IconButton
              onClick={handleCloseImageDialog}
              sx={{
                color: "grey.500",
                "&:hover": { backgroundColor: "grey.100" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
              p: 3,
            }}
          >
            {imageDialog.loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CircularProgress size={40} />
                <Typography color="text.secondary">
                  Đang tải ảnh thiết kế...
                </Typography>
              </Box>
            ) : imageDialog.imageUrl ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  component="img"
                  src={imageDialog.imageUrl}
                  alt="Ảnh thiết kế"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    borderRadius: 1,
                    boxShadow: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    setNotification({
                      open: true,
                      message: "Không thể hiển thị ảnh",
                      severity: "error",
                    });
                  }}
                />

                {/* Thông tin bổ sung */}
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    backgroundColor: "grey.50",
                    borderRadius: 1,
                    width: "100%",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    🎨 Ảnh thiết kế được tạo trong quá trình thi công
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    Bạn có thể phóng to ảnh bằng cách nhấp chuột phải và chọn
                    "Mở ảnh trong tab mới"
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  color: "text.secondary",
                }}
              >
                <Typography variant="h6">❌ Không thể tải ảnh</Typography>
                <Typography variant="body2">
                  Vui lòng thử lại sau hoặc liên hệ hỗ trợ
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            {imageDialog.imageUrl && (
              <Button
                variant="outlined"
                onClick={() => window.open(imageDialog.imageUrl, "_blank")}
                sx={{ mr: "auto" }}
              >
                Mở trong tab mới
              </Button>
            )}
            <Button onClick={handleCloseImageDialog} variant="contained">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification((n) => ({ ...n, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setNotification((n) => ({ ...n, open: false }))}
            severity={notification.severity}
            sx={{
              width: "100%",
              borderRadius: 3,
              fontWeight: 600,
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              "&.MuiAlert-standardSuccess": {
                background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                color: "white",
                "& .MuiAlert-icon": {
                  color: "white",
                },
              },
              "&.MuiAlert-standardError": {
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                "& .MuiAlert-icon": {
                  color: "white",
                },
              },
              "&.MuiAlert-standardWarning": {
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
                "& .MuiAlert-icon": {
                  color: "white",
                },
              },
              "&.MuiAlert-standardInfo": {
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "white",
                "& .MuiAlert-icon": {
                  color: "white",
                },
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Dialog tạo ticket */}
        <Dialog
          open={openTicketDialog}
          onClose={handleCloseTicketDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 45px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              fontSize: "1.5rem",
              textAlign: "center",
            }}
          >
            🎫 Yêu cầu hỗ trợ cho đơn hàng
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <TextField
              label="Tiêu đề"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              fullWidth
              margin="normal"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  background: "rgba(102, 126, 234, 0.04)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(102, 126, 234, 0.08)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(102, 126, 234, 0.08)",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.2)",
                  },
                },
              }}
            />
            <TextField
              label="Mô tả"
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              minRows={4}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  background: "rgba(102, 126, 234, 0.04)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(102, 126, 234, 0.08)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(102, 126, 234, 0.08)",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.2)",
                  },
                },
              }}
            />
            {createError && (
              <Alert
                severity="error"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  "& .MuiAlert-icon": { color: "white" },
                }}
              >
                {createError}
              </Alert>
            )}
            {createStatus === "succeeded" && (
              <Alert
                severity="success"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                  color: "white",
                  "& .MuiAlert-icon": { color: "white" },
                }}
              >
                Gửi yêu cầu hỗ trợ thành công!
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleCloseTicketDialog}
              sx={{
                borderRadius: 2,
                color: "#667eea",
                fontWeight: 600,
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.08)",
                },
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitTicket}
              disabled={
                !ticketTitle || !ticketDescription || createStatus === "loading"
              }
              variant="contained"
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontWeight: 600,
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                },
              }}
            >
              {createStatus === "loading" ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Đang gửi...
                </>
              ) : (
                "🚀 Gửi"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {galleryOpen && (
        <PhotoProvider
          visible={galleryOpen}
          onVisibleChange={(v) => setGalleryOpen(v)}
          images={galleryImages.map((url) => ({ src: url }))}
          defaultIndex={galleryIndex}
        >
          <PhotoView src={galleryImages[galleryIndex] || ""}>
            <img
              src={galleryImages[galleryIndex] || ""}
              style={{ display: "none" }}
              alt="demo"
            />
          </PhotoView>
        </PhotoProvider>
      )}
    </Box>
  );
};

export default OrderHistory;
