import React, { useEffect, useState, useCallback } from "react";
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
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Backdrop,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  fetchCustomDesignRequestsByCustomerDetail,
  setCurrentDesignRequest,
  selectCurrentDesignRequest,
  getFinalDesignSubImages,
  selectFinalDesignSubImages,
} from "../store/features/customeDesign/customerDesignSlice";
import {
  createOrderFromDesignRequest,
  fetchOrdersByUserId,
  fetchOrderDetails,
  selectOrderDetails,
  selectOrderDetailsStatus,
  selectOrderDetailsError,
  clearOrderDetails,
  cancelOrder,
} from "../store/features/order/orderSlice";
import { fetchCustomerDetailByUserId } from "../store/features/customer/customerSlice";
import {
  getPriceProposals,
  approvePriceProposal,
  offerPriceProposal,
} from "../api/priceService";

import {
  payDesignDepositThunk,
  payDesignRemainingThunk,
  payOrderRemainingThunk,
  selectPaymentLoading,
} from "../store/features/payment/paymentSlice";
import {
  getDemoDesigns,
  approveDemoDesign,
  rejectDemoDesign,
  getDemoSubImages,
  getCustomDesignRequestSubImages,
  selectCustomDesignRequestSubImages,
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
import {
  getPresignedUrl,
  openFileInNewTab,
  getImageFromS3,
} from "../api/s3Service";
import { fetchImageFromS3, selectS3Image } from "../store/features/s3/s3Slice";
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
import {
  fetchProgressLogsByOrderId,
  fetchProgressLogImages,
  selectProgressLogs,
  selectProgressLogLoading,
  selectProgressLogError,
  selectProgressLogImages,
  selectImagesLoading,
  selectImagesError,
  selectImagesByProgressLogId,
} from "../store/features/progressLog/progressLogSlice";
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
  ORDER_COMPLETED: { label: "Đơn hàng đã hoàn tất", color: "success" },
  NEED_DEPOSIT_DESIGN: { label: "Cần đặt cọc thiết kế", color: "warning" },
  NEED_FULLY_PAID_DESIGN: {
    label: "Cần thanh toán đủ thiết kế",
    color: "error",
  },
};

// Component để hiển thị ảnh thiết kế đã chỉnh sửa với auto-detect tỷ lệ
const EditedDesignImage = ({
  imagePath,
  customerNote,
  customerDetail,
  designTemplate,
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageType, setImageType] = useState(null); // 'SQUARE', 'HORIZONTAL', 'VERTICAL'
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Hàm xác định loại ảnh dựa trên tỷ lệ
  const detectImageType = (width, height) => {
    const ratio = width / height;
    const tolerance = 0.1; // Dung sai để coi là vuông

    if (Math.abs(ratio - 1) <= tolerance) {
      return "SQUARE";
    } else if (ratio > 1) {
      return "HORIZONTAL";
    } else {
      return "VERTICAL";
    }
  };

  // Hàm xử lý khi ảnh load xong
  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    const type = detectImageType(naturalWidth, naturalHeight);
    setImageType(type);
    console.log(
      `Image dimensions: ${naturalWidth}x${naturalHeight}, Type: ${type}`
    );
  };

  // Hàm lấy style dựa trên loại ảnh
  const getImageStyles = (type) => {
    const baseStyles = {
      cursor: "pointer",
      borderRadius: 1,
      transition: "all 0.3s ease",
      objectFit: "cover",
      "&:hover": {
        opacity: 0.9,
        transform: "scale(1.02)",
      },
    };

    switch (type) {
      case "SQUARE":
        return {
          ...baseStyles,
          width: "100%",
          maxWidth: 300,
          height: 300,
          aspectRatio: "1/1",
        };
      case "HORIZONTAL":
        return {
          ...baseStyles,
          width: "100%",
          maxWidth: 400,
          height: 250,
          aspectRatio: "16/10",
        };
      case "VERTICAL":
        return {
          ...baseStyles,
          width: "100%",
          maxWidth: 250,
          height: 350,
          aspectRatio: "5/7",
        };
      default:
        return {
          ...baseStyles,
          width: "100%",
          maxHeight: 300,
          objectFit: "contain",
        };
    }
  };

  // Hàm lấy container styles dựa trên loại ảnh
  const getContainerStyles = (type) => {
    const baseStyles = {
      border: "1px solid #e0e0e0",
      borderRadius: 2,
      overflow: "hidden",
      position: "relative",
    };

    switch (type) {
      case "SQUARE":
        return {
          ...baseStyles,
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          maxWidth: 300,
          margin: "0 auto",
        };
      case "HORIZONTAL":
        return {
          ...baseStyles,
          background: "linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)",
          maxWidth: 400,
        };
      case "VERTICAL":
        return {
          ...baseStyles,
          background: "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)",
          maxWidth: 250,
          margin: "0 auto",
        };
      default:
        return baseStyles;
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      if (!imagePath) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        const result = await getPresignedUrl(imagePath);

        if (result.success) {
          setImageUrl(result.url);
        } else {
          setError(true);
          console.error("Failed to load image:", result.message);
        }
      } catch (err) {
        setError(true);
        console.error("Error loading image:", err);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 100,
          border: "1px dashed #ccc",
          borderRadius: 2,
          backgroundColor: "#f8f9fa",
        }}
      >
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Đang tải ảnh...
        </Typography>
      </Box>
    );
  }

  if (error || !imageUrl) {
    return (
      <Box
        sx={{
          p: 2,
          border: "1px dashed #ccc",
          borderRadius: 1,
          textAlign: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Không thể tải ảnh thiết kế
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={getContainerStyles(imageType)}>
      {/* Badge hiển thị loại ảnh */}
      {imageType && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            backgroundColor:
              imageType === "SQUARE"
                ? "#2196f3"
                : imageType === "HORIZONTAL"
                ? "#4caf50"
                : "#ff9800",
            color: "white",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {imageType === "SQUARE" && "⬜ SQUARE"}
          {imageType === "HORIZONTAL" && "▭ HORIZONTAL"}
          {imageType === "VERTICAL" && "▬ VERTICAL"}
        </Box>
      )}

      {/* Hiển thị kích thước ảnh */}
      {imageDimensions.width > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 2,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: 500,
          }}
        >
          {imageDimensions.width} × {imageDimensions.height}
        </Box>
      )}

      <Box
        component="img"
        src={imageUrl}
        alt="Thiết kế đã chỉnh sửa"
        sx={getImageStyles(imageType)}
        onClick={() => window.open(imageUrl, "_blank")}
        onLoad={handleImageLoad}
        onError={() => {
          console.error("Error loading image");
          setError(true);
        }}
      />

      {/* Thông tin bổ sung */}
      <Box sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
        {customerNote && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Ghi chú khách hàng:</strong> {customerNote}
          </Typography>
        )}

        {designTemplate && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Mẫu thiết kế:</strong> {designTemplate.name}
          </Typography>
        )}

        {customerDetail && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Công ty:</strong> {customerDetail.companyName}
          </Typography>
        )}

        {/* Hiển thị thông tin tỷ lệ */}
        {imageType && imageDimensions.width > 0 && (
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>Loại ảnh:</strong> {imageType} •<strong>Tỷ lệ:</strong>{" "}
            {(imageDimensions.width / imageDimensions.height).toFixed(2)}:1
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Component để hiển thị ảnh feedback
const FeedbackImage = ({ feedbackImageKey, altText = "Ảnh feedback" }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!feedbackImageKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        console.log("Loading feedback image from S3:", feedbackImageKey);

        const result = await getImageFromS3(feedbackImageKey);

        if (result.success) {
          setImageUrl(result.imageUrl);
          console.log("Feedback image loaded successfully");
        } else {
          setError(true);
          console.error("Failed to load feedback image:", result.message);
        }
      } catch (err) {
        setError(true);
        console.error("Error loading feedback image:", err);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [feedbackImageKey]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 80,
          p: 2,
          border: "1px dashed #ccc",
          borderRadius: 1,
          backgroundColor: "#f5f5f5",
        }}
      >
        <CircularProgress size={20} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Đang tải ảnh...
        </Typography>
      </Box>
    );
  }

  if (error || !imageUrl) {
    return (
      <Box
        sx={{
          p: 2,
          border: "1px dashed #ccc",
          borderRadius: 1,
          textAlign: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Không thể tải ảnh feedback
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={imageUrl}
      alt={altText}
      sx={{
        maxWidth: 200,
        height: "auto",
        borderRadius: 1,
        cursor: "pointer",
        border: "1px solid #e0e0e0",
        "&:hover": {
          opacity: 0.8,
        },
      }}
      onClick={() => window.open(imageUrl, "_blank")}
      onError={(e) => {
        console.error("Error displaying feedback image");
        e.target.style.display = "none";
      }}
    />
  );
};

const OrderHistory = () => {
  // Order type mapping cho hiển thị
  const ORDER_TYPE_MAP = {
    TEMPLATE: "Đơn hàng mẫu",
    CUSTOM_DESIGN_WITH_CONSTRUCTION: "Thiết kế + Thi công",
    CUSTOM_DESIGN_WITHOUT_CONSTRUCTION: "Chỉ thiết kế",
  };

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

  // State để lưu order details cho mỗi đơn hàng
  const [orderDetailsMap, setOrderDetailsMap] = useState({}); // { orderId: orderDetails }
  const [loadingOrderDetails, setLoadingOrderDetails] = useState({}); // { orderId: boolean }

  // State để track việc expand/collapse order details
  const [expandedOrderDetails, setExpandedOrderDetails] = useState({}); // { orderId: boolean }

  // State để lưu progress logs cho mỗi đơn hàng
  const [progressLogsMap, setProgressLogsMap] = useState({}); // { orderId: progressLogs[] }
  const [loadingProgressLogs, setLoadingProgressLogs] = useState({}); // { orderId: boolean }

  // State để lưu ảnh progress logs cho mỗi progress log
  const [progressLogImagesMap, setProgressLogImagesMap] = useState({}); // { progressLogId: images[] }
  const [loadingProgressLogImages, setLoadingProgressLogImages] = useState({}); // { progressLogId: boolean }

  // State để track những order đã fetch impression
  const [fetchedImpressionsOrders, setFetchedImpressionsOrders] = useState(
    new Set()
  );

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
    description: "",
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
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    orderId: null,
    orderInfo: null,
  });
  const s3FinalImageUrl = useSelector((state) =>
    currentDesignRequest?.finalDesignImage
      ? state.s3.images[currentDesignRequest.finalDesignImage]
      : null
  );

  // S3 images selector
  const s3Images = useSelector((state) => state.s3.images);
  const getOrderImpressions = (orderId) => {
    return allImpressionsByOrder[orderId] || [];
  };

  // Helper function để lấy order details
  const getOrderDetails = (orderId) => {
    return orderDetailsMap[orderId] || null;
  };

  // Helper function để kiểm tra loading state của order details
  const isLoadingOrderDetails = (orderId) => {
    return loadingOrderDetails[orderId] || false;
  };

  // Helper function để toggle expand/collapse order details
  const toggleOrderDetailsExpanded = (orderId) => {
    setExpandedOrderDetails((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Helper function để kiểm tra order details có đang expanded không
  const isOrderDetailsExpanded = (orderId) => {
    return expandedOrderDetails[orderId] || false;
  };

  // Helper function để lấy progress logs
  const getProgressLogs = (orderId) => {
    return progressLogsMap[orderId] || [];
  };

  // Helper function để kiểm tra loading state của progress logs
  const isLoadingProgressLogs = (orderId) => {
    return loadingProgressLogs[orderId] || false;
  };

  // Helper function để lấy progress log theo status - ưu tiên log có ảnh
  const getProgressLogByStatus = (orderId, status) => {
    const logs = getProgressLogs(orderId);
    const logsWithStatus = logs.filter((log) => log.status === status);

    if (logsWithStatus.length === 0) return null;

    // Ưu tiên log có ảnh
    for (const log of logsWithStatus) {
      const images = getProgressLogImages(log.id);
      if (images && images.length > 0) {
        console.log(
          `Found progress log with images: ${log.id}, images:`,
          images
        );
        return log;
      }
    }

    // Nếu không có log nào có ảnh, lấy log đầu tiên
    console.log(
      `No progress log with images found, using first log: ${logsWithStatus[0].id}`
    );
    return logsWithStatus[0];
  };

  // Hàm fetch order details cho một đơn hàng
  const fetchOrderDetailsForOrder = useCallback(
    async (orderId) => {
      if (orderDetailsMap[orderId] || loadingOrderDetails[orderId]) {
        return; // Đã có data hoặc đang loading
      }

      setLoadingOrderDetails((prev) => ({ ...prev, [orderId]: true }));

      try {
        const result = await dispatch(fetchOrderDetails(orderId));
        if (fetchOrderDetails.fulfilled.match(result)) {
          setOrderDetailsMap((prev) => ({
            ...prev,
            [orderId]: result.payload,
          }));
          console.log(`Order details for ${orderId}:`, result.payload);
        } else {
          console.error(
            `Failed to fetch order details for ${orderId}:`,
            result.payload
          );
        }
      } catch (error) {
        console.error(`Error fetching order details for ${orderId}:`, error);
      } finally {
        setLoadingOrderDetails((prev) => ({ ...prev, [orderId]: false }));
      }
    },
    [dispatch, orderDetailsMap, loadingOrderDetails]
  );

  // Hàm fetch progress logs cho một đơn hàng
  const fetchProgressLogsForOrder = useCallback(
    async (orderId) => {
      if (progressLogsMap[orderId] || loadingProgressLogs[orderId]) {
        return; // Đã có data hoặc đang loading
      }

      setLoadingProgressLogs((prev) => ({ ...prev, [orderId]: true }));

      try {
        const result = await dispatch(
          fetchProgressLogsByOrderId({ orderId, page: 1, size: 50 })
        );

        if (fetchProgressLogsByOrderId.fulfilled.match(result)) {
          setProgressLogsMap((prev) => ({
            ...prev,
            [orderId]: result.payload.data,
          }));
          console.log(`Progress logs for ${orderId}:`, result.payload.data);
        } else {
          console.error(
            `Failed to fetch progress logs for ${orderId}:`,
            result.payload
          );
        }
      } catch (error) {
        console.error(`Error fetching progress logs for ${orderId}:`, error);
      } finally {
        setLoadingProgressLogs((prev) => ({ ...prev, [orderId]: false }));
      }
    },
    [dispatch, progressLogsMap, loadingProgressLogs]
  );

  // Helper function để lấy ảnh progress log
  const getProgressLogImages = (progressLogId) => {
    const images = progressLogImagesMap[progressLogId] || [];
    console.log(`getProgressLogImages for ${progressLogId}:`, images);
    return images;
  };

  // Helper function để kiểm tra loading state của ảnh progress log
  const isLoadingProgressLogImages = (progressLogId) => {
    return loadingProgressLogImages[progressLogId] || false;
  };

  // Hàm fetch ảnh progress log cho một progress log
  const fetchProgressLogImagesForLog = useCallback(
    async (progressLogId) => {
      if (
        progressLogImagesMap[progressLogId] ||
        loadingProgressLogImages[progressLogId]
      ) {
        return; // Đã có data hoặc đang loading
      }

      setLoadingProgressLogImages((prev) => ({
        ...prev,
        [progressLogId]: true,
      }));

      try {
        const result = await dispatch(fetchProgressLogImages(progressLogId));

        if (fetchProgressLogImages.fulfilled.match(result)) {
          setProgressLogImagesMap((prev) => ({
            ...prev,
            [progressLogId]: result.payload.images,
          }));
          console.log(
            `Progress log images for ${progressLogId}:`,
            result.payload.images
          );
        } else {
          console.error(
            `Failed to fetch progress log images for ${progressLogId}:`,
            result.payload
          );
        }
      } catch (error) {
        console.error(
          `Error fetching progress log images for ${progressLogId}:`,
          error
        );
      } finally {
        setLoadingProgressLogImages((prev) => ({
          ...prev,
          [progressLogId]: false,
        }));
      }
    },
    [dispatch, progressLogImagesMap, loadingProgressLogImages]
  );
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

    // Lấy progress logs cho đơn hàng này
    const progressLogs = getProgressLogs(order.id);
    const producingLog = getProgressLogByStatus(order.id, "PRODUCING");

    // Cập nhật hàm handleStepClick để hỗ trợ ảnh từ progress log
    const handleStepClick = async (step) => {
      console.log("handleStepClick called with step:", step.key);
      console.log("Current order:", order);
      console.log("Current producingLog:", producingLog);

      let imageUrl = null;
      let title = "";
      let description = "";
      let allImages = []; // Để lưu tất cả ảnh trong trường hợp có nhiều ảnh

      // Xử lý cho step "Đang thi công" - ưu tiên ảnh từ progress log
      if (step.key === "PRODUCING") {
        // Lấy tất cả progress logs có status PRODUCING
        const allProgressLogs = getProgressLogs(order.id);
        const producingLogs = allProgressLogs.filter(
          (log) => log.status === "PRODUCING"
        );
        console.log("All PRODUCING logs:", producingLogs);

        // Lấy tất cả ảnh từ các progress logs PRODUCING
        let allProductionImages = [];
        for (const log of producingLogs) {
          const images = getProgressLogImages(log.id);
          if (images && images.length > 0) {
            allProductionImages.push(...images);
          }
        }

        console.log("All production images found:", allProductionImages);

        if (allProductionImages.length > 0) {
          // Nếu có ảnh progress log, sử dụng ảnh đầu tiên và lưu tất cả
          imageUrl = allProductionImages[0].imageUrl;
          allImages = allProductionImages.map((img) => img.imageUrl);
          title = `Ảnh tiến độ - Đang sản xuất (${allProductionImages.length} ảnh)`;
          description =
            producingLogs.find((log) => log.description)?.description ||
            "Đang sản xuất";
          console.log("Using production images:", {
            imageUrl,
            allImages,
            title,
          });
        } else if (order?.draftImageUrl) {
          // Fallback về draftImageUrl cũ nếu chưa có ảnh progress log
          imageUrl = order.draftImageUrl;
          allImages = [order.draftImageUrl];
          title = "Ảnh thiết kế - Đang thi công";
          console.log("Fallback to draftImageUrl:", imageUrl);
        }
      }
      // Xử lý cho step "Đã thi công" - ưu tiên ảnh từ progress log
      else if (step.key === "PRODUCTION_COMPLETED") {
        // Lấy tất cả progress logs có status PRODUCTION_COMPLETED
        const allProgressLogs = getProgressLogs(order.id);
        const completedLogs = allProgressLogs.filter(
          (log) => log.status === "PRODUCTION_COMPLETED"
        );
        console.log("All PRODUCTION_COMPLETED logs:", completedLogs);

        // Lấy tất cả ảnh từ các progress logs PRODUCTION_COMPLETED
        let allCompletedImages = [];
        for (const log of completedLogs) {
          const images = getProgressLogImages(log.id);
          if (images && images.length > 0) {
            allCompletedImages.push(...images);
          }
        }

        console.log(
          "All production completed images found:",
          allCompletedImages
        );

        if (allCompletedImages.length > 0) {
          // Nếu có ảnh progress log, sử dụng ảnh đầu tiên và lưu tất cả
          imageUrl = allCompletedImages[0].imageUrl;
          allImages = allCompletedImages.map((img) => img.imageUrl);
          title = `Ảnh sản phẩm hoàn thành (${allCompletedImages.length} ảnh)`;
          description =
            completedLogs.find((log) => log.description)?.description ||
            "Sản phẩm đã hoàn thành";
          console.log("Using production completed images:", {
            imageUrl,
            allImages,
            title,
          });
        } else if (order?.productImageUrl) {
          // Fallback về productImageUrl cũ nếu chưa có ảnh progress log
          imageUrl = order.productImageUrl;
          allImages = [order.productImageUrl];
          title = "Ảnh sản phẩm đã hoàn thành";
          console.log("Fallback to productImageUrl:", imageUrl);
        }
      }
      // Xử lý cho step "Đang vận chuyển" - ưu tiên ảnh từ progress log
      else if (step.key === "DELIVERING") {
        // Lấy tất cả progress logs có status DELIVERING
        const allProgressLogs = getProgressLogs(order.id);
        const deliveringLogs = allProgressLogs.filter(
          (log) => log.status === "DELIVERING"
        );
        console.log("All DELIVERING logs:", deliveringLogs);

        // Lấy tất cả ảnh từ các progress logs DELIVERING
        let allDeliveringImages = [];
        for (const log of deliveringLogs) {
          const images = getProgressLogImages(log.id);
          if (images && images.length > 0) {
            allDeliveringImages.push(...images);
          }
        }

        console.log("All delivering images found:", allDeliveringImages);

        if (allDeliveringImages.length > 0) {
          // Nếu có ảnh progress log, sử dụng ảnh đầu tiên và lưu tất cả
          imageUrl = allDeliveringImages[0].imageUrl;
          allImages = allDeliveringImages.map((img) => img.imageUrl);
          title = `Ảnh vận chuyển (${allDeliveringImages.length} ảnh)`;
          description =
            deliveringLogs.find((log) => log.description)?.description ||
            "Đang vận chuyển";
          console.log("Using delivering images:", {
            imageUrl,
            allImages,
            title,
          });
        } else if (order?.deliveryImageUrl) {
          // Fallback về deliveryImageUrl cũ nếu chưa có ảnh progress log
          imageUrl = order.deliveryImageUrl;
          allImages = [order.deliveryImageUrl];
          title = "Ảnh vận chuyển - Đang vận chuyển";
          console.log("Fallback to deliveryImageUrl:", imageUrl);
        }
      }
      // Xử lý cho step "Đã lắp đặt" - ưu tiên ảnh từ progress log
      else if (step.key === "INSTALLED") {
        // Lấy tất cả progress logs có status INSTALLED
        const allProgressLogs = getProgressLogs(order.id);
        const installedLogs = allProgressLogs.filter(
          (log) => log.status === "INSTALLED"
        );
        console.log("All INSTALLED logs:", installedLogs);

        // Lấy tất cả ảnh từ các progress logs INSTALLED
        let allInstalledImages = [];
        for (const log of installedLogs) {
          const images = getProgressLogImages(log.id);
          if (images && images.length > 0) {
            allInstalledImages.push(...images);
          }
        }

        console.log("All installed images found:", allInstalledImages);

        if (allInstalledImages.length > 0) {
          // Nếu có ảnh progress log, sử dụng ảnh đầu tiên và lưu tất cả
          imageUrl = allInstalledImages[0].imageUrl;
          allImages = allInstalledImages.map((img) => img.imageUrl);
          title = `Ảnh lắp đặt hoàn thành (${allInstalledImages.length} ảnh)`;
          description =
            installedLogs.find((log) => log.description)?.description ||
            "Đã lắp đặt hoàn thành";
          console.log("Using installed images:", {
            imageUrl,
            allImages,
            title,
          });
        } else if (order?.installationImageUrl) {
          // Fallback về installationImageUrl cũ nếu chưa có ảnh progress log
          imageUrl = order.installationImageUrl;
          allImages = [order.installationImageUrl];
          title = "Ảnh lắp đặt hoàn thành - Đã lắp đặt";
          console.log("Fallback to installationImageUrl:", imageUrl);
        }
        title = "Ảnh lắp đặt hoàn thành - Đã lắp đặt";
      }

      // Nếu không có ảnh thì không làm gì
      if (!imageUrl || allImages.length === 0) return;

      // Nếu chỉ có 1 ảnh, hiển thị bằng dialog cũ
      if (allImages.length === 1) {
        setImageDialog({
          open: true,
          imageUrl: null,
          loading: true,
          title: title,
          description: description,
        });

        try {
          const result = await getImageFromS3(imageUrl);
          if (result.success) {
            setImageDialog((prev) => ({
              ...prev,
              imageUrl: result.imageUrl,
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
                "Không thể tải ảnh: " +
                (result.message || "Lỗi không xác định"),
              severity: "error",
            });
          }
        } catch (error) {
          console.error("Error getting image from S3:", error);
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
      } else {
        // Nếu có nhiều ảnh, hiển thị gallery
        const loadAllImages = async () => {
          try {
            const imagePromises = allImages.map(async (img) => {
              const result = await getImageFromS3(img);
              return result.success ? result.imageUrl : null;
            });

            const resolvedImages = await Promise.all(imagePromises);
            const validImages = resolvedImages.filter((img) => img !== null);

            if (validImages.length > 0) {
              setGalleryImages(validImages);
              setGalleryIndex(0);
              setGalleryOpen(true);
            } else {
              setNotification({
                open: true,
                message: "Không thể tải ảnh",
                severity: "error",
              });
            }
          } catch (error) {
            console.error("Error loading gallery images:", error);
            setNotification({
              open: true,
              message: "Có lỗi xảy ra khi tải ảnh",
              severity: "error",
            });
          }
        };

        loadAllImages();
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
            let hasProgressLogImage = false;
            const allProgressLogs = getProgressLogs(order.id);

            if (step.key === "PRODUCING") {
              // Kiểm tra tất cả progress logs có status PRODUCING
              const producingLogs = allProgressLogs.filter(
                (log) => log.status === "PRODUCING"
              );
              hasProgressLogImage = producingLogs.some((log) => {
                const images = getProgressLogImages(log.id);
                return images && images.length > 0;
              });
            } else if (step.key === "PRODUCTION_COMPLETED") {
              // Kiểm tra tất cả progress logs có status PRODUCTION_COMPLETED
              const completedLogs = allProgressLogs.filter(
                (log) => log.status === "PRODUCTION_COMPLETED"
              );
              hasProgressLogImage = completedLogs.some((log) => {
                const images = getProgressLogImages(log.id);
                return images && images.length > 0;
              });
            } else if (step.key === "DELIVERING") {
              // Kiểm tra tất cả progress logs có status DELIVERING
              const deliveringLogs = allProgressLogs.filter(
                (log) => log.status === "DELIVERING"
              );
              hasProgressLogImage = deliveringLogs.some((log) => {
                const images = getProgressLogImages(log.id);
                return images && images.length > 0;
              });
            } else if (step.key === "INSTALLED") {
              // Kiểm tra tất cả progress logs có status INSTALLED
              const installedLogs = allProgressLogs.filter(
                (log) => log.status === "INSTALLED"
              );
              hasProgressLogImage = installedLogs.some((log) => {
                const images = getProgressLogImages(log.id);
                return images && images.length > 0;
              });
            }

            const isClickable =
              hasProgressLogImage ||
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

                {/* Progress log description for PRODUCING step */}
                {step.key === "PRODUCING" &&
                  producingLog &&
                  producingLog.description && (
                    <Typography
                      variant="caption"
                      color="primary.main"
                      textAlign="center"
                      sx={{
                        fontSize: "0.6rem",
                        lineHeight: 1.1,
                        maxWidth: 80,
                        fontStyle: "italic",
                        mt: 0.5,
                      }}
                    >
                      "{producingLog.description}"
                    </Typography>
                  )}

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
                {(() => {
                  // Kiểm tra có ảnh progress log không từ tất cả progress logs PRODUCING
                  const allProgressLogs = getProgressLogs(order.id);
                  const producingLogs = allProgressLogs.filter(
                    (log) => log.status === "PRODUCING"
                  );
                  let totalProgressLogImages = 0;

                  for (const log of producingLogs) {
                    const images = getProgressLogImages(log.id);
                    if (images && images.length > 0) {
                      totalProgressLogImages += images.length;
                    }
                  }

                  if (totalProgressLogImages > 0) {
                    return (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, fontStyle: "italic" }}
                      >
                        💡 Click vào "Đang thi công" để xem ảnh tiến độ (
                        {totalProgressLogImages} ảnh)
                      </Typography>
                    );
                  } else if (order?.draftImageUrl) {
                    return (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, fontStyle: "italic" }}
                      >
                        💡 Click vào "Đang thi công" để xem ảnh thiết kế
                      </Typography>
                    );
                  }
                  return null;
                })()}
              </>
            )}
            {status === "PRODUCTION_COMPLETED" && (
              <>
                ✅ Thi công hoàn tất, chuẩn bị vận chuyển
                {(() => {
                  // Kiểm tra có ảnh progress log không từ tất cả progress logs PRODUCTION_COMPLETED
                  const allProgressLogs = getProgressLogs(order.id);
                  const completedLogs = allProgressLogs.filter(
                    (log) => log.status === "PRODUCTION_COMPLETED"
                  );
                  let totalCompletedImages = 0;

                  for (const log of completedLogs) {
                    const images = getProgressLogImages(log.id);
                    if (images && images.length > 0) {
                      totalCompletedImages += images.length;
                    }
                  }

                  if (totalCompletedImages > 0) {
                    return (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, fontStyle: "italic" }}
                      >
                        💡 Click vào "Đã thi công" để xem ảnh sản phẩm hoàn
                        thành ({totalCompletedImages} ảnh)
                      </Typography>
                    );
                  } else if (order?.productImageUrl) {
                    return (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, fontStyle: "italic" }}
                      >
                        💡 Click vào "Đã thi công" để xem ảnh sản phẩm hoàn
                        thành
                      </Typography>
                    );
                  }
                  return null;
                })()}
              </>
            )}
            {status === "DELIVERING" && (
              <>
                🚛 Đang vận chuyển đến địa chỉ của bạn
                {(() => {
                  // Kiểm tra có ảnh progress log không từ tất cả progress logs DELIVERING
                  const allProgressLogs = getProgressLogs(order.id);
                  const deliveringLogs = allProgressLogs.filter(
                    (log) => log.status === "DELIVERING"
                  );
                  let totalDeliveringImages = 0;

                  for (const log of deliveringLogs) {
                    const images = getProgressLogImages(log.id);
                    if (images && images.length > 0) {
                      totalDeliveringImages += images.length;
                    }
                  }

                  if (totalDeliveringImages > 0) {
                    return (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, fontStyle: "italic" }}
                      >
                        💡 Click vào "Đang vận chuyển" để xem ảnh vận chuyển (
                        {totalDeliveringImages} ảnh)
                      </Typography>
                    );
                  } else if (order?.deliveryImageUrl) {
                    return (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, fontStyle: "italic" }}
                      >
                        💡 Click vào "Đang vận chuyển" để xem ảnh vận chuyển
                      </Typography>
                    );
                  }
                  return null;
                })()}
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
                {(() => {
                  // Kiểm tra có ảnh progress log không từ tất cả progress logs INSTALLED
                  const allProgressLogs = getProgressLogs(order.id);
                  const installedLogs = allProgressLogs.filter(
                    (log) => log.status === "INSTALLED"
                  );
                  let totalInstalledImages = 0;

                  for (const log of installedLogs) {
                    const images = getProgressLogImages(log.id);
                    if (images && images.length > 0) {
                      totalInstalledImages += images.length;
                    }
                  }

                  if (totalInstalledImages > 0) {
                    return (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, fontStyle: "italic" }}
                      >
                        💡 Click vào "Đã lắp đặt" để xem ảnh lắp đặt hoàn thành
                        ({totalInstalledImages} ảnh)
                      </Typography>
                    );
                  } else if (order?.installationImageUrl) {
                    return (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, fontStyle: "italic" }}
                      >
                        💡 Click vào "Đã lắp đặt" để xem ảnh lắp đặt hoàn thành
                      </Typography>
                    );
                  }
                  return null;
                })()}
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
      description: "",
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

        // Tự động refresh trang để hiển thị trạng thái mới
        if (user?.id) {
          dispatch(fetchOrdersByUserId(user.id));
        }
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

        // Tự động refresh trang để hiển thị trạng thái mới
        if (user?.id) {
          dispatch(fetchOrdersByUserId(user.id));
        }
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

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Component for file info tooltip
  const FileInfoTooltip = ({ fileInfo }) => (
    <Box>
      <Typography variant="body2" fontWeight={600}>
        {fileInfo.name || "Image"}
      </Typography>
      <Typography variant="caption" display="block">
        Type: {fileInfo.contentType || "N/A"}
      </Typography>
      <Typography variant="caption" display="block">
        Size: {formatFileSize(fileInfo.fileSize || 0)}
      </Typography>
    </Box>
  );

  // Image viewer handlers
  const handleOpenImageViewer = (imageUrl, title) => {
    setImageViewer({
      open: true,
      imageUrl,
      title,
    });
  };

  const handleCloseImageViewer = () => {
    setImageViewer({
      open: false,
      imageUrl: null,
      title: "",
    });
  };

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
    } else {
      // Clear cache khi user logout
      setFetchedImpressionsOrders(new Set());
    }
  }, [isAuthenticated, user, dispatch]);

  // Fetch impressions khi user được authenticate (để đảm bảo load data ngay từ đầu)
  useEffect(() => {
    if (isAuthenticated && user?.id && orders.length > 0) {
      console.log(
        "Fetching impressions for all completed/installed orders on auth"
      );
      const ordersToFetch = orders.filter(
        (order) =>
          (order.status === "ORDER_COMPLETED" ||
            order.status === "INSTALLED") &&
          !fetchedImpressionsOrders.has(order.id)
      );

      if (ordersToFetch.length > 0) {
        ordersToFetch.forEach((order) => {
          console.log(`Fetching impressions for order ${order.id}`);
          dispatch(fetchImpressionsByOrderId(order.id));
        });

        // Update tracked orders
        setFetchedImpressionsOrders((prev) => {
          const newSet = new Set(prev);
          ordersToFetch.forEach((order) => newSet.add(order.id));
          return newSet;
        });
      }
    }
  }, [isAuthenticated, user?.id, orders, dispatch, fetchedImpressionsOrders]);

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

  // Fetch sub-images when dialog opens and we have demo list
  useEffect(() => {
    const fetchSubImages = async () => {
      if (!currentDesignRequest || !openDetail || demoList.length === 0) return;

      try {
        // Fetch demo sub-images for each demo
        for (const demo of demoList) {
          try {
            const subImagesResult = await dispatch(
              getDemoSubImages(demo.id)
            ).unwrap();
            if (subImagesResult && subImagesResult.length > 0) {
              setDemoSubImagesMap((prev) => ({
                ...prev,
                [demo.id]: subImagesResult,
              }));

              // Fetch S3 URLs for sub-images
              for (const img of subImagesResult) {
                if (img.imageUrl) {
                  try {
                    const result = await dispatch(
                      fetchImageFromS3(img.imageUrl)
                    ).unwrap();
                    setSubDemoS3Urls((prev) => ({
                      ...prev,
                      [img.id]: result.url,
                    }));
                  } catch (error) {
                    console.error(
                      "Error fetching S3 URL for sub-demo image:",
                      error
                    );
                  }
                }
              }
            }
          } catch (error) {
            console.error(
              "Error fetching demo sub-images for demo:",
              demo.id,
              error
            );
          }
        }
      } catch (error) {
        console.error("Error fetching demo sub-images:", error);
      }
    };

    fetchSubImages();
  }, [currentDesignRequest, openDetail, demoList, dispatch]);

  // Fetch final design images when status is COMPLETED
  useEffect(() => {
    const fetchFinalDesignImages = async () => {
      if (
        !currentDesignRequest ||
        !openDetail ||
        currentDesignRequest.status !== "COMPLETED"
      )
        return;

      try {
        // Fetch final design sub-images
        try {
          const finalSubImagesResult = await dispatch(
            getFinalDesignSubImages(currentDesignRequest.id)
          ).unwrap();
          if (finalSubImagesResult && finalSubImagesResult.length > 0) {
            setFinalDesignSubImages(finalSubImagesResult);

            // Fetch S3 URLs for final design sub-images
            for (const img of finalSubImagesResult) {
              if (img.imageUrl) {
                try {
                  const result = await dispatch(
                    fetchImageFromS3(img.imageUrl)
                  ).unwrap();
                  setFinalDesignS3Urls((prev) => ({
                    ...prev,
                    [img.id]: result.url,
                  }));
                } catch (error) {
                  console.error(
                    "Error fetching S3 URL for final design sub-image:",
                    error
                  );
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching final design sub-images:", error);
        }

        // Fetch main final design S3 URL
        if (currentDesignRequest.finalDesignImage) {
          try {
            const result = await dispatch(
              fetchImageFromS3(currentDesignRequest.finalDesignImage)
            ).unwrap();
            setFinalDesignMainS3Url(result.url);
          } catch (error) {
            console.error("Error fetching final design main S3 URL:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching final design images:", error);
      }
    };

    fetchFinalDesignImages();
  }, [currentDesignRequest, openDetail, dispatch]);

  // Reset states when dialog closes or currentDesignRequest changes
  useEffect(() => {
    if (!openDetail || !currentDesignRequest) {
      setDemoSubImagesMap({});
      setFinalDesignSubImages([]);
      setSubDemoS3Urls({});
      setFinalDesignS3Urls({});
      setFinalDesignMainS3Url(null);
    }
  }, [openDetail, currentDesignRequest?.id]);

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
      // Load impression cho các đơn hàng ORDER_COMPLETED và INSTALLED (chỉ những order chưa fetch)
      const ordersToFetch = orders.filter(
        (order) =>
          (order.status === "ORDER_COMPLETED" ||
            order.status === "INSTALLED") &&
          !fetchedImpressionsOrders.has(order.id)
      );

      if (ordersToFetch.length > 0) {
        console.log(
          "Fetching impressions for orders:",
          ordersToFetch.map((o) => o.id)
        );
        ordersToFetch.forEach((order) => {
          console.log(
            `Fetching impressions for order ${order.id} with status ${order.status}`
          );
          dispatch(fetchImpressionsByOrderId(order.id));
        });

        // Update tracked orders
        setFetchedImpressionsOrders((prev) => {
          const newSet = new Set(prev);
          ordersToFetch.forEach((order) => newSet.add(order.id));
          return newSet;
        });
      }
    }
  }, [orders, dispatch, fetchedImpressionsOrders]);

  // useEffect để fetch order details cho tất cả đơn hàng ở tab 0 (Lịch sử đơn hàng)
  useEffect(() => {
    if (tab === 0 && orders.length > 0) {
      console.log("Fetching order details for all orders in tab 0");
      orders.forEach((order) => {
        if (order.id) {
          fetchOrderDetailsForOrder(order.id);
        }
      });
    }
  }, [tab, orders, fetchOrderDetailsForOrder]);

  // useEffect để fetch progress logs cho tất cả đơn hàng ở tab 0 (Lịch sử đơn hàng)
  useEffect(() => {
    if (tab === 0 && orders.length > 0) {
      console.log("Fetching progress logs for all orders in tab 0");
      orders.forEach((order) => {
        if (
          order.id &&
          [
            "PRODUCING",
            "PRODUCTION_COMPLETED",
            "DELIVERING",
            "INSTALLED",
          ].includes(order.status)
        ) {
          fetchProgressLogsForOrder(order.id);
        }
      });
    }
  }, [tab, orders, fetchProgressLogsForOrder]);

  // useEffect để fetch ảnh progress logs cho các progress logs có status PRODUCING, PRODUCTION_COMPLETED, DELIVERING, INSTALLED
  useEffect(() => {
    if (tab === 0 && Object.keys(progressLogsMap).length > 0) {
      console.log("Fetching progress log images for all relevant logs");
      Object.entries(progressLogsMap).forEach(([orderId, progressLogs]) => {
        if (progressLogs && progressLogs.length > 0) {
          progressLogs.forEach((log) => {
            if (
              [
                "PRODUCING",
                "PRODUCTION_COMPLETED",
                "DELIVERING",
                "INSTALLED",
              ].includes(log.status) &&
              log.id
            ) {
              fetchProgressLogImagesForLog(log.id);
            }
          });
        }
      });
    }
  }, [tab, progressLogsMap, fetchProgressLogImagesForLog]);

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

      // Reload lại orders và impressions để cập nhật trạng thái
      if (user?.id) {
        dispatch(fetchOrdersByUserId(user.id));
        dispatch(fetchImpressionsByOrderId(impressionDialog.orderId));
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

  const handleCancelOrder = async (orderId) => {
    // Tìm thông tin order để hiển thị trong dialog
    const order = orders.find((o) => o.id === orderId);

    // Mở dialog xác nhận
    setCancelDialog({
      open: true,
      orderId: orderId,
      orderInfo: order,
    });
  };

  const handleConfirmCancelOrder = async () => {
    const { orderId } = cancelDialog;

    // Đóng dialog
    setCancelDialog({
      open: false,
      orderId: null,
      orderInfo: null,
    });

    setCancelingOrderId(orderId);
    try {
      const result = await dispatch(cancelOrder(orderId));

      if (cancelOrder.fulfilled.match(result)) {
        setNotification({
          open: true,
          message: "Hủy đơn hàng thành công!",
          severity: "success",
        });

        // Refresh orders list
        if (user?.id) {
          dispatch(fetchOrdersByUserId(user.id));
        }
      } else {
        setNotification({
          open: true,
          message:
            result.payload || "Không thể hủy đơn hàng. Vui lòng thử lại.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      setNotification({
        open: true,
        message: "Có lỗi xảy ra khi hủy đơn hàng",
        severity: "error",
      });
    } finally {
      setCancelingOrderId(null);
    }
  };

  const handleCloseCancelDialog = () => {
    setCancelDialog({
      open: false,
      orderId: null,
      orderInfo: null,
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

  // Xóa hàm handleCustomDeposit - chuyển sang tab Lịch sử đơn hàng

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

  // Xóa hàm handlePayCustomDesignRemaining - chuyển sang tab Lịch sử đơn hàng

  // Thêm hàm xử lý đặt cọc thiết kế
  const handleDesignDeposit = (order) => {
    if (!order?.id) {
      setNotification({
        open: true,
        message: "Thông tin đơn hàng không hợp lệ",
        severity: "error",
      });
      return;
    }

    setDepositLoadingId(order.id);
    dispatch(payDesignDepositThunk(order.id))
      .unwrap()
      .then((res) => {
        setDepositLoadingId(null);
        const checkoutUrl = res.data?.checkoutUrl;
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

  // Thêm hàm xử lý thanh toán đủ thiết kế
  const handleDesignRemaining = (order) => {
    if (!order?.id) {
      setNotification({
        open: true,
        message: "Thông tin đơn hàng không hợp lệ",
        severity: "error",
      });
      return;
    }

    setPayingRemaining(true);
    dispatch(payDesignRemainingThunk(order.id))
      .unwrap()
      .then((res) => {
        setPayingRemaining(false);
        const checkoutUrl = res.data?.checkoutUrl;
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

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // States for sub-images
  const [demoSubImagesMap, setDemoSubImagesMap] = useState({}); // { demoId: subImages[] }
  const [finalDesignSubImages, setFinalDesignSubImages] = useState([]);
  const [subDemoS3Urls, setSubDemoS3Urls] = useState({}); // { imageId: S3URL }
  const [finalDesignS3Urls, setFinalDesignS3Urls] = useState({}); // { imageId: S3URL }
  const [finalDesignMainS3Url, setFinalDesignMainS3Url] = useState(null);

  // Image viewer state
  const [imageViewer, setImageViewer] = useState({
    open: false,
    imageUrl: null,
    title: "",
  });

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <HistoryIcon
              sx={{
                fontSize: 40,
                color: "#667eea",
                filter: "drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))",
              }}
            />
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
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
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 2,
                },
              }}
            >
              Lịch sử đơn hàng
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 2,
              fontSize: "1.1rem",
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
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
            p: 2,
            mb: 3,
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTabs-indicator": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                height: 3,
                borderRadius: 2,
              },
              "& .MuiTab-root": {
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1.1rem",
                color: "rgba(0, 0, 0, 0.6)",
                transition: "all 0.3s ease",
                borderRadius: 2,
                margin: "0 8px",
                minHeight: 56,
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
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HistoryIcon />
                  <span>Lịch sử đơn hàng</span>
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BrushIcon />
                  <span>Đơn thiết kế thủ công</span>
                </Box>
              }
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
                  const orderDetails = getOrderDetails(order.id);
                  const loadingDetails = isLoadingOrderDetails(order.id);

                  return (
                    <Card
                      key={order.id}
                      sx={{
                        borderRadius: 4,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: "0 25px 45px rgba(0, 0, 0, 0.15)",
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: 6,
                          height: "100%",
                          background:
                            order.orderType === "AI_DESIGN"
                              ? "linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)"
                              : order.orderType ===
                                "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                              ? "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)"
                              : order.orderType ===
                                "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"
                              ? "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"
                              : "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
                          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 3,
                            alignItems: { xs: "stretch", md: "flex-start" },
                          }}
                        >
                          {/* Left Section - Order Info */}
                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {/* Header with Chips */}
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              {order.orderType === "AI_DESIGN" ? (
                                <Chip
                                  icon={<SmartToyIcon />}
                                  label="🤖 Đơn hàng AI"
                                  size="small"
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)",
                                    color: "white",
                                    fontWeight: 600,
                                    "& .MuiChip-icon": { color: "white" },
                                  }}
                                />
                              ) : order.orderType ===
                                "CUSTOM_DESIGN_WITH_CONSTRUCTION" ? (
                                <Chip
                                  icon={<BrushIcon />}
                                  label="🏗️ Thiết kế thủ công (có thi công)"
                                  size="small"
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)",
                                    color: "white",
                                    fontWeight: 600,
                                    "& .MuiChip-icon": { color: "white" },
                                  }}
                                />
                              ) : order.orderType ===
                                "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION" ? (
                                <Chip
                                  icon={<BrushIcon />}
                                  label="🎨 Thiết kế thủ công (không thi công)"
                                  size="small"
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                                    color: "white",
                                    fontWeight: 600,
                                    "& .MuiChip-icon": { color: "white" },
                                  }}
                                />
                              ) : (
                                <Chip
                                  icon={<ShoppingBagIcon />}
                                  label="🛍️ Đơn hàng thường"
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
                            </Box>

                            {/* Order Details Section */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                              }}
                            >
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
                                Mã đơn: #{order.orderCode || order.id}
                              </Typography>

                              {(order.orderType ===
                                "CUSTOM_DESIGN_WITH_CONSTRUCTION" ||
                                order.orderType ===
                                  "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION") &&
                                order.customDesignRequests && (
                                  <Typography
                                    color="text.secondary"
                                    fontSize={14}
                                    sx={{
                                      background:
                                        order.orderType ===
                                        "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                                          ? "rgba(33, 150, 243, 0.04)"
                                          : "rgba(255, 152, 0, 0.04)",
                                      p: 1.5,
                                      borderRadius: 2,
                                      border:
                                        order.orderType ===
                                        "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                                          ? "1px solid rgba(33, 150, 243, 0.1)"
                                          : "1px solid rgba(255, 152, 0, 0.1)",
                                    }}
                                  >
                                    <b>
                                      {order.orderType ===
                                      "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                                        ? "🏗️ Yêu cầu thiết kế (có thi công):"
                                        : "🎨 Yêu cầu thiết kế (không thi công):"}
                                    </b>{" "}
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

                              {order.orderType === "AI_DESIGN" &&
                                order.aiDesigns && (
                                  <Typography
                                    color="text.secondary"
                                    fontSize={14}
                                    sx={{
                                      background: "rgba(156, 39, 176, 0.04)",
                                      p: 1.5,
                                      borderRadius: 2,
                                      border:
                                        "1px solid rgba(156, 39, 176, 0.1)",
                                    }}
                                  >
                                    <b>🤖 Ghi chú AI Design:</b>{" "}
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

                              {/* Hiển thị địa chỉ nếu có */}
                              {order.address && (
                                <Typography
                                  color="text.secondary"
                                  fontSize={14}
                                >
                                  <b>📍 Địa chỉ:</b> {order.address}
                                </Typography>
                              )}

                              {/* Hiển thị thông tin thi công cho đơn PENDING_CONTRACT */}
                              {order.status === "PENDING_CONTRACT" && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    p: 1.5,
                                    backgroundColor: "warning.50",
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: "warning.200",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    color="warning.dark"
                                    sx={{ mb: 1 }}
                                  >
                                    💰 Thông tin thi công:
                                  </Typography>
                                  <Typography
                                    color="text.secondary"
                                    fontSize={13}
                                  >
                                    <b>Tổng phí thi công:</b>{" "}
                                    {order.totalConstructionAmount?.toLocaleString(
                                      "vi-VN"
                                    ) || "Chưa xác định"}
                                    VNĐ
                                  </Typography>
                                  <Typography
                                    color="text.secondary"
                                    fontSize={13}
                                  >
                                    <b>Cọc thi công:</b>{" "}
                                    {order.depositConstructionAmount?.toLocaleString(
                                      "vi-VN"
                                    ) || "Chưa xác định"}
                                    VNĐ
                                  </Typography>
                                  <Typography
                                    color="text.secondary"
                                    fontSize={13}
                                  >
                                    <b>Còn lại thi công:</b>{" "}
                                    {order.remainingConstructionAmount?.toLocaleString(
                                      "vi-VN"
                                    ) || "Chưa xác định"}
                                    VNĐ
                                  </Typography>
                                  {order.totalDesignAmount && (
                                    <>
                                      <Typography
                                        color="text.secondary"
                                        fontSize={13}
                                      >
                                        <b>Phí thiết kế:</b>{" "}
                                        {order.totalDesignAmount?.toLocaleString(
                                          "vi-VN"
                                        )}
                                        VNĐ
                                      </Typography>
                                      {order.depositDesignAmount && (
                                        <Typography
                                          color="text.secondary"
                                          fontSize={13}
                                        >
                                          <b>Cọc thiết kế:</b>{" "}
                                          {order.depositDesignAmount?.toLocaleString(
                                            "vi-VN"
                                          )}
                                          VNĐ
                                        </Typography>
                                      )}
                                      {order.remainingDesignAmount && (
                                        <Typography
                                          color="text.secondary"
                                          fontSize={13}
                                        >
                                          <b>Còn lại thiết kế:</b>{" "}
                                          {order.remainingDesignAmount?.toLocaleString(
                                            "vi-VN"
                                          )}
                                          VNĐ
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {order.note && (
                                    <Typography
                                      color="text.secondary"
                                      fontSize={13}
                                      sx={{ mt: 1, fontStyle: "italic" }}
                                    >
                                      <b>📝 Ghi chú:</b> {order.note}
                                    </Typography>
                                  )}
                                </Box>
                              )}

                              <Typography color="text.secondary" fontSize={14}>
                                Tổng tiền:{" "}
                                {order.totalOrderAmount?.toLocaleString(
                                  "vi-VN"
                                ) ||
                                  order.totalAmount?.toLocaleString("vi-VN") ||
                                  0}
                                VNĐ
                              </Typography>
                              {order.status === "DEPOSITED" && (
                                <>
                                  <Typography
                                    color="success.main"
                                    fontSize={14}
                                  >
                                    Đã đặt cọc:{" "}
                                    {order.totalOrderDepositAmount?.toLocaleString(
                                      "vi-VN"
                                    ) ||
                                      order.depositAmount?.toLocaleString(
                                        "vi-VN"
                                      ) ||
                                      0}
                                    VNĐ
                                  </Typography>
                                  <Typography color="info.main" fontSize={14}>
                                    Còn lại:{" "}
                                    {order.totalOrderRemainingAmount?.toLocaleString(
                                      "vi-VN"
                                    ) ||
                                      order.remainingAmount?.toLocaleString(
                                        "vi-VN"
                                      ) ||
                                      0}
                                    VNĐ
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
                                    {order.totalOrderDepositAmount?.toLocaleString(
                                      "vi-VN"
                                    ) ||
                                      order.depositAmount?.toLocaleString(
                                        "vi-VN"
                                      ) ||
                                      0}
                                    VNĐ
                                  </Typography>
                                  {(order.totalOrderRemainingAmount ||
                                    order.remainingAmount) > 0 ? (
                                    <Typography
                                      color="warning.main"
                                      fontSize={14}
                                      fontWeight={600}
                                    >
                                      🔔 Còn lại cần thanh toán:{" "}
                                      {order.totalOrderRemainingAmount?.toLocaleString(
                                        "vi-VN"
                                      ) ||
                                        order.remainingAmount?.toLocaleString(
                                          "vi-VN"
                                        ) ||
                                        0}
                                      VNĐ
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
                                    VNĐ
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

                              {/* Hiển thị Order Details */}
                              {loadingDetails && (
                                <Box
                                  sx={{
                                    mt: 2,
                                    p: 2,
                                    backgroundColor: "grey.50",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <CircularProgress size={16} />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Đang tải chi tiết đơn hàng...
                                    </Typography>
                                  </Box>
                                </Box>
                              )}

                              {orderDetails && orderDetails.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                      color="primary.main"
                                    >
                                      📋 Chi tiết đơn hàng (
                                      {orderDetails.length} sản phẩm)
                                    </Typography>
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        toggleOrderDetailsExpanded(order.id)
                                      }
                                      startIcon={
                                        isOrderDetailsExpanded(order.id) ? (
                                          <ExpandLessIcon />
                                        ) : (
                                          <ExpandMoreIcon />
                                        )
                                      }
                                      sx={{
                                        color: "primary.main",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        minWidth: "fit-content",
                                        "&:hover": {
                                          backgroundColor: "primary.50",
                                        },
                                      }}
                                    >
                                      {isOrderDetailsExpanded(order.id)
                                        ? "Ẩn chi tiết"
                                        : "Xem chi tiết"}
                                    </Button>
                                  </Box>
                                  {isOrderDetailsExpanded(order.id) && (
                                    <Box
                                      sx={{
                                        backgroundColor: "primary.50",
                                        borderRadius: 1,
                                        p: 2,
                                        border: "1px solid",
                                        borderColor: "primary.200",
                                      }}
                                    >
                                      {orderDetails.map((detail, index) => (
                                        <Card
                                          key={detail.id}
                                          sx={{
                                            mb:
                                              index < orderDetails.length - 1
                                                ? 2
                                                : 0,
                                            backgroundColor: "#fff",
                                            border: "1px solid #e0e0e0",
                                            borderRadius: 2,
                                            overflow: "hidden",
                                          }}
                                        >
                                          <CardContent sx={{ p: 2 }}>
                                            {/* Header */}
                                            <Box
                                              sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 2,
                                                pb: 1,
                                                borderBottom:
                                                  "1px solid #f0f0f0",
                                              }}
                                            >
                                              <Typography
                                                variant="subtitle2"
                                                fontWeight={600}
                                                color="primary.main"
                                              >
                                                Chi tiết #{index + 1}
                                              </Typography>
                                              <Chip
                                                label={`SL: ${detail.quantity}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                              />
                                            </Box>

                                            {/* Thông tin giá cả */}
                                            <Box sx={{ mb: 2 }}>
                                              <Typography
                                                variant="body2"
                                                sx={{ mb: 1 }}
                                              >
                                                <strong>
                                                  💰 Thông tin giá cả:
                                                </strong>
                                              </Typography>
                                              <Box sx={{ ml: 2 }}>
                                                <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                  sx={{ mb: 0.5 }}
                                                >
                                                  • Phí thi công:{" "}
                                                  {detail.detailConstructionAmount?.toLocaleString(
                                                    "vi-VN"
                                                  ) || 0}
                                                  VNĐ
                                                </Typography>
                                                {detail.detailDesignAmount && (
                                                  <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 0.5 }}
                                                  >
                                                    • Phí thiết kế:{" "}
                                                    {detail.detailDesignAmount.toLocaleString(
                                                      "vi-VN"
                                                    )}
                                                    VNĐ
                                                  </Typography>
                                                )}
                                                {detail.detailDepositDesignAmount && (
                                                  <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 0.5 }}
                                                  >
                                                    • Tiền cọc thiết kế:{" "}
                                                    {detail.detailDepositDesignAmount.toLocaleString(
                                                      "vi-VN"
                                                    )}
                                                    VNĐ
                                                  </Typography>
                                                )}
                                                {detail.detailRemainingDesignAmount && (
                                                  <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                  >
                                                    • Còn lại thiết kế:{" "}
                                                    {detail.detailRemainingDesignAmount.toLocaleString(
                                                      "vi-VN"
                                                    )}
                                                    VNĐ
                                                  </Typography>
                                                )}
                                              </Box>
                                            </Box>

                                            {/* Thông tin sản phẩm */}
                                            {detail.customerChoiceHistories && (
                                              <Box sx={{ mb: 2 }}>
                                                <Typography
                                                  variant="body2"
                                                  sx={{ mb: 1 }}
                                                >
                                                  <strong>
                                                    🏷️ Thông tin sản phẩm:
                                                  </strong>
                                                </Typography>
                                                <Box sx={{ ml: 2 }}>
                                                  <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 0.5 }}
                                                  >
                                                    • Loại sản phẩm:{" "}
                                                    {detail
                                                      .customerChoiceHistories
                                                      .productTypeName || "N/A"}
                                                  </Typography>
                                                  <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 0.5 }}
                                                  >
                                                    • Công thức tính:{" "}
                                                    {detail
                                                      .customerChoiceHistories
                                                      .calculateFormula ||
                                                      "N/A"}
                                                  </Typography>
                                                  <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                  >
                                                    • Tổng tiền:{" "}
                                                    {detail.customerChoiceHistories.totalAmount?.toLocaleString(
                                                      "vi-VN"
                                                    ) || 0}
                                                    VNĐ
                                                  </Typography>
                                                </Box>
                                              </Box>
                                            )}

                                            {/* Ảnh thiết kế */}
                                            {detail.editedDesigns
                                              ?.editedImage && (
                                              <Box sx={{ mb: 2 }}>
                                                <Typography
                                                  variant="body2"
                                                  sx={{ mb: 1 }}
                                                >
                                                  <strong>
                                                    🎨 Thiết kế đã chỉnh sửa:
                                                  </strong>
                                                </Typography>
                                                <EditedDesignImage
                                                  imagePath={
                                                    detail.editedDesigns
                                                      .editedImage
                                                  }
                                                  customerNote={
                                                    detail.editedDesigns
                                                      .customerNote
                                                  }
                                                  customerDetail={
                                                    detail.editedDesigns
                                                      .customerDetail
                                                  }
                                                  designTemplate={
                                                    detail.editedDesigns
                                                      .designTemplates
                                                  }
                                                />
                                              </Box>
                                            )}

                                            {/* Lựa chọn thuộc tính */}
                                            {detail.customerChoiceHistories
                                              ?.attributeSelections &&
                                              detail.customerChoiceHistories
                                                .attributeSelections.length >
                                                0 && (
                                                <Box sx={{ mb: 2 }}>
                                                  <Typography
                                                    variant="body2"
                                                    sx={{ mb: 1 }}
                                                  >
                                                    <strong>
                                                      ⚙️ Lựa chọn thuộc tính:
                                                    </strong>
                                                  </Typography>
                                                  <Box sx={{ ml: 2 }}>
                                                    {detail.customerChoiceHistories.attributeSelections.map(
                                                      (attr, attrIndex) => (
                                                        <Box
                                                          key={attrIndex}
                                                          sx={{
                                                            mb: 1,
                                                            p: 1,
                                                            backgroundColor:
                                                              "#f8f9fa",
                                                            borderRadius: 1,
                                                          }}
                                                        >
                                                          <Typography
                                                            variant="body2"
                                                            fontWeight={500}
                                                          >
                                                            {attr.attribute}:{" "}
                                                            {attr.value}
                                                            {attr.unit &&
                                                              ` (${attr.unit})`}
                                                          </Typography>
                                                          <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                              display: "block",
                                                            }}
                                                          >
                                                            Giá vật liệu:{" "}
                                                            {attr.materialPrice?.toLocaleString(
                                                              "vi-VN"
                                                            ) || 0}
                                                            ₫ • Đơn giá:{" "}
                                                            {attr.unitPrice?.toLocaleString(
                                                              "vi-VN"
                                                            ) || 0}
                                                            ₫ • Thành tiền:{" "}
                                                            {attr.subTotal?.toLocaleString(
                                                              "vi-VN"
                                                            ) || 0}
                                                            ₫
                                                          </Typography>
                                                          {attr.calculateFormula && (
                                                            <Typography
                                                              variant="caption"
                                                              color="primary.main"
                                                              sx={{
                                                                fontStyle:
                                                                  "italic",
                                                              }}
                                                            >
                                                              Công thức:{" "}
                                                              {
                                                                attr.calculateFormula
                                                              }
                                                            </Typography>
                                                          )}
                                                        </Box>
                                                      )
                                                    )}
                                                  </Box>
                                                </Box>
                                              )}

                                            {/* Kích thước */}
                                            {detail.customerChoiceHistories
                                              ?.sizeSelections &&
                                              detail.customerChoiceHistories
                                                .sizeSelections.length > 0 && (
                                                <Box>
                                                  <Typography
                                                    variant="body2"
                                                    sx={{ mb: 1 }}
                                                  >
                                                    <strong>
                                                      📐 Kích thước:
                                                    </strong>
                                                  </Typography>
                                                  <Box
                                                    sx={{
                                                      ml: 2,
                                                      display: "flex",
                                                      flexWrap: "wrap",
                                                      gap: 1,
                                                    }}
                                                  >
                                                    {detail.customerChoiceHistories.sizeSelections.map(
                                                      (size, sizeIndex) => (
                                                        <Chip
                                                          key={sizeIndex}
                                                          label={`${size.size}: ${size.value}`}
                                                          size="small"
                                                          variant="outlined"
                                                          color="info"
                                                        />
                                                      )
                                                    )}
                                                  </Box>
                                                </Box>
                                              )}
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </Box>
                                  )}
                                </Box>
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

                              {/* Thêm logic cho design payment */}
                              {order.status === "NEED_DEPOSIT_DESIGN" && (
                                <Button
                                  variant="contained"
                                  color="warning"
                                  size="small"
                                  onClick={() => handleDesignDeposit(order)}
                                  disabled={depositLoadingId === order.id}
                                  sx={{
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                  }}
                                >
                                  {depositLoadingId === order.id ? (
                                    <>
                                      <CircularProgress
                                        size={16}
                                        color="inherit"
                                        sx={{ mr: 1 }}
                                      />
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    "💰 ĐẶT CỌC THIẾT KẾ"
                                  )}
                                </Button>
                              )}

                              {order.status === "NEED_FULLY_PAID_DESIGN" && (
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  onClick={() => handleDesignRemaining(order)}
                                  disabled={payingRemaining}
                                  sx={{
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                  }}
                                >
                                  {payingRemaining ? (
                                    <>
                                      <CircularProgress
                                        size={16}
                                        color="inherit"
                                        sx={{ mr: 1 }}
                                      />
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    "⚡ THANH TOÁN ĐỦ THIẾT KẾ"
                                  )}
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
                          </Box>

                          {/* Right Section - Actions */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                              minWidth: { xs: "100%", md: 200 },
                              alignItems: { xs: "stretch", md: "flex-end" },
                            }}
                          >
                            {/* Action Buttons */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                                width: "100%",
                              }}
                            >
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
                                  size="medium"
                                  onClick={() => handleGetContract(order.id)}
                                  disabled={contractLoading}
                                  startIcon={
                                    contractLoading ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      <DescriptionIcon />
                                    )
                                  }
                                  sx={{
                                    width: "100%",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    "&:hover": {
                                      transform: "translateY(-1px)",
                                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                    },
                                  }}
                                >
                                  Xem hợp đồng
                                </Button>
                              )}
                              {order.status === "PENDING_CONTRACT" && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="medium"
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={cancelingOrderId === order.id}
                                  startIcon={
                                    cancelingOrderId === order.id ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      <CloseIcon />
                                    )
                                  }
                                  sx={{
                                    width: "100%",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    "&:hover": {
                                      transform: "translateY(-1px)",
                                      boxShadow:
                                        "0 4px 8px rgba(244, 67, 54, 0.2)",
                                    },
                                  }}
                                >
                                  Hủy đơn hàng
                                </Button>
                              )}
                              {order.status === "CONTRACT_CONFIRMED" && (
                                <Button
                                  variant="contained"
                                  color="warning"
                                  size="medium"
                                  onClick={() => handleDeposit(order)}
                                  sx={{
                                    width: "100%",
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    background:
                                      "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                                    "&:hover": {
                                      background:
                                        "linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)",
                                      transform: "translateY(-1px)",
                                      boxShadow:
                                        "0 6px 12px rgba(255, 152, 0, 0.3)",
                                    },
                                  }}
                                >
                                  💰 ĐẶT CỌC NGAY
                                </Button>
                              )}
                              <Button
                                variant="outlined"
                                color="secondary"
                                size="medium"
                                onClick={() => handleOpenTicketDialog(order.id)}
                                startIcon={<FeedbackIcon />}
                                sx={{
                                  width: "100%",
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  textTransform: "none",
                                  borderColor: "#9c27b0",
                                  color: "#9c27b0",
                                  "&:hover": {
                                    borderColor: "#7b1fa2",
                                    backgroundColor: "rgba(156, 39, 176, 0.04)",
                                    transform: "translateY(-1px)",
                                    boxShadow:
                                      "0 4px 8px rgba(156, 39, 176, 0.2)",
                                  },
                                }}
                              >
                                Yêu cầu hỗ trợ
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                        {order.status === "ORDER_COMPLETED" && (
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
                                        <FeedbackImage
                                          feedbackImageKey={
                                            impression.feedbackImageUrl
                                          }
                                          altText="Ảnh feedback"
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
                          (order.totalOrderRemainingAmount ||
                            order.remainingAmount) > 0 && (
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
                                    {order.totalOrderRemainingAmount?.toLocaleString(
                                      "vi-VN"
                                    ) ||
                                      order.remainingAmount?.toLocaleString(
                                        "vi-VN"
                                      ) ||
                                      0}
                                    VNĐ
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

                      {/* Xóa nút đặt cọc - chuyển sang tab Lịch sử đơn hàng */}

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
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0,
              maxHeight: "95vh",
              height: "auto",
              m: 0,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#0F172A",
              color: "white",
              fontWeight: 700,
              fontSize: "1.5rem",
              py: 3,
              px: 4,
              position: "relative",
              letterSpacing: "-0.025em",
            }}
          >
            Chi tiết yêu cầu thiết kế #{currentDesignRequest?.id}
            <IconButton
              onClick={() => setOpenDetail(false)}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0, bgcolor: "#f8fafc" }}>
            {currentDesignRequest ? (
              <Box>
                {/* Demo Thiết Kế Section */}
                {demoList.length > 0 && (
                  <Card
                    sx={{
                      m: 0,
                      borderRadius: 0,
                      bgcolor: "#ecfdf5",
                      border: "none",
                      boxShadow: "none",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box mb={3}>
                        <Typography
                          variant="h5"
                          fontWeight={600}
                          color="#0F172A"
                          mb={1}
                          letterSpacing="-0.015em"
                        >
                          Demo Thiết Kế
                        </Typography>
                        <Typography
                          variant="body2"
                          color="#64748b"
                          fontSize="0.95rem"
                        >
                          Các bản demo đã gửi từ designer
                        </Typography>
                      </Box>

                      {demoList.map((demo, idx) => (
                        <Box
                          key={demo.id}
                          mb={idx < demoList.length - 1 ? 4 : 0}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            mb={2}
                            color="#0F172A"
                            letterSpacing="-0.01em"
                          >
                            Demo #{idx + 1} -{" "}
                            {new Date(demo.createAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Typography>

                          {/* Main Demo Image */}
                          <Box mb={3}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              mb={2}
                              color="#0F172A"
                              letterSpacing="-0.01em"
                            >
                              Hình ảnh demo chính
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                display: "inline-block",
                                borderRadius: 3,
                                bgcolor: "white",
                                border: "1px solid #10b981",
                                boxShadow:
                                  "0 2px 4px -1px rgba(16, 185, 129, 0.2)",
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow:
                                    "0 8px 20px -3px rgba(16, 185, 129, 0.3)",
                                  borderColor: "#059669",
                                },
                              }}
                            >
                              {demo.demoImage &&
                                (demo.demoImage.startsWith("http") ||
                                s3Images[demo.demoImage] ? (
                                  <img
                                    src={
                                      demo.demoImage.startsWith("http")
                                        ? demo.demoImage
                                        : s3Images[demo.demoImage]
                                    }
                                    alt={`Demo ${idx + 1}`}
                                    style={{
                                      maxWidth: "100%",
                                      height: "auto",
                                      maxHeight: 300,
                                      borderRadius: 6,
                                      objectFit: "contain",
                                      display: "block",
                                    }}
                                    onClick={() => {
                                      const mainImageUrl =
                                        demo.demoImage.startsWith("http")
                                          ? demo.demoImage
                                          : s3Images[demo.demoImage];
                                      if (mainImageUrl) {
                                        handleOpenImageViewer(
                                          mainImageUrl,
                                          `Demo ${idx + 1}`
                                        );
                                      }
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 400,
                                      height: 200,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      bgcolor: "#ecfdf5",
                                      borderRadius: 2,
                                      border: "2px dashed #10b981",
                                    }}
                                  >
                                    <CircularProgress
                                      size={32}
                                      sx={{ color: "#10b981" }}
                                    />
                                  </Box>
                                ))}
                            </Paper>
                          </Box>

                          {/* Sub Demo Images */}
                          {demoSubImagesMap[demo.id] &&
                            demoSubImagesMap[demo.id].length > 0 && (
                              <Box mb={3}>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={600}
                                  mb={2}
                                  color="#0F172A"
                                  letterSpacing="-0.01em"
                                >
                                  Hình ảnh chi tiết demo
                                </Typography>
                                <Box
                                  display="flex"
                                  flexWrap="wrap"
                                  gap={2}
                                  alignItems="center"
                                >
                                  {demoSubImagesMap[demo.id].map((img) => (
                                    <Paper
                                      key={img.id}
                                      elevation={0}
                                      sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: "white",
                                        border: "1px solid #10b981",
                                        transition: "all 0.2s ease-in-out",
                                        cursor: "pointer",
                                        "&:hover": {
                                          transform: "translateY(-2px)",
                                          boxShadow:
                                            "0 8px 20px -3px rgba(16, 185, 129, 0.3)",
                                          borderColor: "#059669",
                                        },
                                      }}
                                      onClick={() =>
                                        subDemoS3Urls[img.id] &&
                                        handleOpenImageViewer(
                                          subDemoS3Urls[img.id],
                                          img.name || "Demo chi tiết"
                                        )
                                      }
                                    >
                                      {subDemoS3Urls[img.id] ? (
                                        <Tooltip
                                          title={
                                            <FileInfoTooltip fileInfo={img} />
                                          }
                                          arrow
                                          placement="top"
                                        >
                                          <img
                                            src={subDemoS3Urls[img.id]}
                                            alt={img.name || "Demo chi tiết"}
                                            style={{
                                              width: 100,
                                              height: 100,
                                              objectFit: "cover",
                                              borderRadius: 6,
                                            }}
                                            onError={(e) => {
                                              console.error(
                                                "Error loading sub-demo S3 image:",
                                                img.imageUrl
                                              );
                                              e.target.style.display = "none";
                                            }}
                                          />
                                        </Tooltip>
                                      ) : (
                                        <Box
                                          sx={{
                                            width: 100,
                                            height: 100,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "#ecfdf5",
                                            borderRadius: 1.5,
                                          }}
                                        >
                                          <CircularProgress
                                            size={24}
                                            sx={{ color: "#10b981" }}
                                          />
                                        </Box>
                                      )}
                                    </Paper>
                                  ))}
                                </Box>
                              </Box>
                            )}

                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Stack spacing={2}>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="#64748b"
                                    fontWeight={600}
                                    mb={1}
                                    textTransform="uppercase"
                                    letterSpacing="0.05em"
                                  >
                                    Mô tả từ designer
                                  </Typography>
                                  <Typography variant="body1" color="#374151">
                                    {demo.designerDescription ||
                                      "Không có mô tả"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="#64748b"
                                    fontWeight={600}
                                    mb={1}
                                    textTransform="uppercase"
                                    letterSpacing="0.05em"
                                  >
                                    Trạng thái
                                  </Typography>
                                  <Chip
                                    label={demo.status}
                                    size="small"
                                    sx={{
                                      bgcolor:
                                        demo.status === "APPROVED"
                                          ? "#10b981"
                                          : demo.status === "REJECTED"
                                          ? "#ef4444"
                                          : "#f59e0b",
                                      color: "white",
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              </Stack>
                            </Grid>
                          </Grid>

                          {/* Demo Action Buttons */}
                          {idx === demoList.length - 1 &&
                            (currentDesignRequest.status === "DEMO_SUBMITTED" ||
                              currentDesignRequest.status ===
                                "REVISION_REQUESTED") && (
                              <Box
                                mt={3}
                                p={3}
                                borderRadius={3}
                                bgcolor="rgba(16, 185, 129, 0.1)"
                                border="1px solid rgba(16, 185, 129, 0.2)"
                              >
                                <Stack direction="row" spacing={2}>
                                  <Button
                                    variant="contained"
                                    onClick={handleApproveDemo}
                                    disabled={demoActionLoading}
                                    sx={{
                                      bgcolor: "#10b981",
                                      "&:hover": { bgcolor: "#059669" },
                                      fontWeight: 600,
                                      px: 3,
                                    }}
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
                                    sx={{ fontWeight: 600, px: 3 }}
                                  >
                                    Từ chối demo
                                  </Button>
                                </Stack>
                              </Box>
                            )}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Final Design Section */}
                {currentDesignRequest?.status === "COMPLETED" &&
                  (currentDesignRequest?.finalDesignImage ||
                    (finalDesignSubImages &&
                      finalDesignSubImages.length > 0)) && (
                    <Card
                      sx={{
                        m: 0,
                        borderRadius: 0,
                        bgcolor: "#fefce8",
                        border: "none",
                        boxShadow: "none",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box mb={3}>
                          <Typography
                            variant="h5"
                            fontWeight={600}
                            color="#0F172A"
                            mb={1}
                            letterSpacing="-0.015em"
                          >
                            Thiết Kế Chính Thức
                          </Typography>
                          <Typography
                            variant="body2"
                            color="#64748b"
                            fontSize="0.95rem"
                          >
                            Bản thiết kế chính thức đã hoàn thành
                          </Typography>
                        </Box>

                        {/* Final Design Main Image */}
                        {currentDesignRequest?.finalDesignImage && (
                          <Box mb={4}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              mb={2}
                              color="#0F172A"
                              letterSpacing="-0.01em"
                            >
                              Hình ảnh thiết kế chính thức
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                display: "inline-block",
                                borderRadius: 3,
                                bgcolor: "white",
                                border: "1px solid #fbbf24",
                                boxShadow:
                                  "0 2px 4px -1px rgba(251, 191, 36, 0.2)",
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow:
                                    "0 8px 20px -3px rgba(251, 191, 36, 0.3)",
                                  borderColor: "#f59e0b",
                                },
                              }}
                              onClick={() =>
                                finalDesignMainS3Url &&
                                handleOpenImageViewer(
                                  finalDesignMainS3Url,
                                  "Thiết kế chính thức"
                                )
                              }
                            >
                              {finalDesignMainS3Url ? (
                                <img
                                  src={finalDesignMainS3Url}
                                  alt="Thiết kế chính thức"
                                  style={{
                                    maxWidth: "100%",
                                    height: "auto",
                                    maxHeight: 300,
                                    borderRadius: 6,
                                    objectFit: "contain",
                                    display: "block",
                                  }}
                                  onError={(e) => {
                                    console.error(
                                      "Error loading final design main S3 image:",
                                      currentDesignRequest.finalDesignImage
                                    );
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: 400,
                                    height: 200,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "#fef3c7",
                                    borderRadius: 2,
                                    border: "2px dashed #fbbf24",
                                  }}
                                >
                                  <CircularProgress
                                    size={32}
                                    sx={{ color: "#f59e0b" }}
                                  />
                                </Box>
                              )}
                            </Paper>
                          </Box>
                        )}

                        {/* Final Design Sub Images */}
                        {finalDesignSubImages &&
                          finalDesignSubImages.length > 0 && (
                            <Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                mb={2}
                                color="#0F172A"
                                letterSpacing="-0.01em"
                              >
                                Hình ảnh chi tiết thiết kế
                              </Typography>

                              <Box
                                display="flex"
                                flexWrap="wrap"
                                gap={2}
                                alignItems="center"
                              >
                                {finalDesignSubImages.map((img) => (
                                  <Paper
                                    key={img.id}
                                    elevation={0}
                                    sx={{
                                      p: 1.5,
                                      borderRadius: 2,
                                      bgcolor: "white",
                                      border: "1px solid #fbbf24",
                                      transition: "all 0.2s ease-in-out",
                                      cursor: "pointer",
                                      "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow:
                                          "0 8px 20px -3px rgba(251, 191, 36, 0.3)",
                                        borderColor: "#f59e0b",
                                      },
                                    }}
                                    onClick={() =>
                                      finalDesignS3Urls[img.id] &&
                                      handleOpenImageViewer(
                                        finalDesignS3Urls[img.id],
                                        img.name || "Thiết kế chi tiết"
                                      )
                                    }
                                  >
                                    {finalDesignS3Urls[img.id] ? (
                                      <Tooltip
                                        title={
                                          <FileInfoTooltip fileInfo={img} />
                                        }
                                        arrow
                                        placement="top"
                                      >
                                        <img
                                          src={finalDesignS3Urls[img.id]}
                                          alt={img.name || "Thiết kế chi tiết"}
                                          style={{
                                            width: 100,
                                            height: 100,
                                            objectFit: "cover",
                                            borderRadius: 6,
                                          }}
                                          onError={(e) => {
                                            console.error(
                                              "Error loading final design S3 image:",
                                              img.imageUrl
                                            );
                                            e.target.style.display = "none";
                                          }}
                                        />
                                      </Tooltip>
                                    ) : (
                                      <Box
                                        sx={{
                                          width: 100,
                                          height: 100,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          bgcolor: "#fef3c7",
                                          borderRadius: 1.5,
                                        }}
                                      >
                                        <CircularProgress
                                          size={24}
                                          sx={{ color: "#f59e0b" }}
                                        />
                                      </Box>
                                    )}
                                  </Paper>
                                ))}
                              </Box>
                            </Box>
                          )}
                      </CardContent>
                    </Card>
                  )}

                {/* Customer Information */}
                <Card
                  sx={{ m: 0, borderRadius: 0, borderTop: "1px solid #e0e0e0" }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: 4,
                            border: "1px solid #e2e8f0",
                            bgcolor: "#f8fafc",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            color="#0F172A"
                            mb={3}
                            letterSpacing="-0.015em"
                          >
                            Thông Tin Yêu Cầu
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography
                                variant="body2"
                                color="#64748b"
                                fontWeight={600}
                                mb={1}
                                textTransform="uppercase"
                                letterSpacing="0.05em"
                              >
                                Mô tả yêu cầu
                              </Typography>
                              <Typography variant="body1" color="#374151">
                                {currentDesignRequest.requirements}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="#64748b"
                                fontWeight={600}
                                mb={1}
                                textTransform="uppercase"
                                letterSpacing="0.05em"
                              >
                                Trạng thái
                              </Typography>
                              <Chip
                                label={
                                  statusMap[currentDesignRequest.status]
                                    ?.label || currentDesignRequest.status
                                }
                                sx={{
                                  bgcolor:
                                    currentDesignRequest.status === "COMPLETED"
                                      ? "#10b981"
                                      : currentDesignRequest.status ===
                                        "CANCELLED"
                                      ? "#ef4444"
                                      : "#f59e0b",
                                  color: "white",
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                color="#64748b"
                                fontWeight={600}
                                mb={1}
                                textTransform="uppercase"
                                letterSpacing="0.05em"
                              >
                                Designer phụ trách
                              </Typography>
                              <Typography variant="body1" color="#374151">
                                {designerMap[
                                  currentDesignRequest?.assignDesigner?.id
                                ]?.fullName ||
                                  currentDesignRequest?.assignDesigner
                                    ?.fullName ||
                                  currentDesignRequest?.assignDesigner?.email ||
                                  "Chưa có"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: 4,
                            border: "1px solid #e2e8f0",
                            bgcolor: "#f8fafc",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            color="#0F172A"
                            mb={3}
                            letterSpacing="-0.015em"
                          >
                            Thông Tin Báo Giá
                          </Typography>
                          <Stack spacing={3}>
                            <Grid container spacing={3}>
                              <Grid item xs={6}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: "rgba(34, 197, 94, 0.1)",
                                    border: "1px solid rgba(34, 197, 94, 0.2)",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="#16a34a"
                                    fontWeight={600}
                                    mb={1}
                                    textTransform="uppercase"
                                    letterSpacing="0.05em"
                                  >
                                    Tổng tiền
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    color="#15803d"
                                    fontWeight={700}
                                  >
                                    {currentDesignRequest.totalPrice?.toLocaleString(
                                      "vi-VN"
                                    ) || 0}
                                    ₫
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={6}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: "rgba(59, 130, 246, 0.1)",
                                    border: "1px solid rgba(59, 130, 246, 0.2)",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="#2563eb"
                                    fontWeight={600}
                                    mb={1}
                                    textTransform="uppercase"
                                    letterSpacing="0.05em"
                                  >
                                    Đặt cọc
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    color="#1d4ed8"
                                    fontWeight={700}
                                  >
                                    {currentDesignRequest.depositAmount?.toLocaleString(
                                      "vi-VN"
                                    ) || 0}
                                    ₫
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={6}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    bgcolor: "rgba(245, 158, 11, 0.1)",
                                    border: "1px solid rgba(245, 158, 11, 0.2)",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="#d97706"
                                    fontWeight={600}
                                    mb={1}
                                    textTransform="uppercase"
                                    letterSpacing="0.05em"
                                  >
                                    Còn lại
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    color="#ca8a04"
                                    fontWeight={700}
                                  >
                                    {currentDesignRequest.remainingAmount?.toLocaleString(
                                      "vi-VN"
                                    ) || 0}
                                    ₫
                                  </Typography>
                                </Paper>
                              </Grid>
                            </Grid>
                          </Stack>
                        </Card>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Product Details Section */}
                {currentDesignRequest.customerChoiceHistories && (
                  <Card
                    sx={{ borderRadius: 0, borderTop: "1px solid #e0e0e0" }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box mb={3}>
                        <Typography
                          variant="h5"
                          fontWeight={600}
                          color="#0F172A"
                          mb={1}
                          letterSpacing="-0.015em"
                        >
                          Chi Tiết Sản Phẩm
                        </Typography>
                        <Typography
                          variant="body2"
                          color="#64748b"
                          fontSize="0.95rem"
                        >
                          Thông tin kỹ thuật và lựa chọn của khách hàng
                        </Typography>
                      </Box>

                      <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 4,
                              borderRadius: 4,
                              border: "1px solid #e2e8f0",
                              bgcolor: "#f8fafc",
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              color="#0F172A"
                              mb={3}
                              letterSpacing="-0.015em"
                            >
                              Thông Tin Sản Phẩm
                            </Typography>
                            <Stack spacing={2}>
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="#64748b"
                                  fontWeight={600}
                                  mb={1}
                                  textTransform="uppercase"
                                  letterSpacing="0.05em"
                                >
                                  Loại sản phẩm
                                </Typography>
                                <Typography
                                  variant="h6"
                                  fontWeight={700}
                                  color="#0F172A"
                                >
                                  {
                                    currentDesignRequest.customerChoiceHistories
                                      .productTypeName
                                  }
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="#64748b"
                                  fontWeight={600}
                                  mb={1}
                                  textTransform="uppercase"
                                  letterSpacing="0.05em"
                                >
                                  Công thức tính
                                </Typography>
                                <Typography variant="body1" color="#374151">
                                  {
                                    currentDesignRequest.customerChoiceHistories
                                      .calculateFormula
                                  }
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="#64748b"
                                  fontWeight={600}
                                  mb={1}
                                  textTransform="uppercase"
                                  letterSpacing="0.05em"
                                >
                                  Tổng tiền
                                </Typography>
                                <Typography
                                  variant="h6"
                                  fontWeight={700}
                                  color="#0F172A"
                                >
                                  {currentDesignRequest.customerChoiceHistories.totalAmount?.toLocaleString(
                                    "vi-VN"
                                  ) || "N/A"}
                                  ₫
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={8}>
                          <Stack spacing={3}>
                            {/* Attributes Table */}
                            <Box>
                              <Typography
                                variant="h6"
                                fontWeight={600}
                                mb={2}
                                color="#0F172A"
                                letterSpacing="-0.015em"
                              >
                                Thuộc Tính Đã Chọn
                              </Typography>
                              <TableContainer
                                component={Paper}
                                elevation={0}
                                sx={{
                                  borderRadius: 4,
                                  overflow: "hidden",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <Table>
                                  <TableHead sx={{ bgcolor: "#0F172A" }}>
                                    <TableRow>
                                      <TableCell
                                        sx={{
                                          fontWeight: 700,
                                          color: "white",
                                          fontSize: "0.9rem",
                                        }}
                                      >
                                        Thuộc tính
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 700,
                                          color: "white",
                                          fontSize: "0.9rem",
                                        }}
                                      >
                                        Giá trị
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 700,
                                          color: "white",
                                          fontSize: "0.9rem",
                                        }}
                                      >
                                        Đơn vị
                                      </TableCell>
                                      <TableCell
                                        align="right"
                                        sx={{
                                          fontWeight: 700,
                                          color: "white",
                                          fontSize: "0.9rem",
                                        }}
                                      >
                                        Đơn giá
                                      </TableCell>
                                      <TableCell
                                        align="right"
                                        sx={{
                                          fontWeight: 700,
                                          color: "white",
                                          fontSize: "0.9rem",
                                        }}
                                      >
                                        Thành tiền
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {currentDesignRequest.customerChoiceHistories.attributeSelections?.map(
                                      (attr, idx) => (
                                        <TableRow
                                          key={idx}
                                          sx={{
                                            "&:nth-of-type(odd)": {
                                              bgcolor: "#f8fafc",
                                            },
                                            "&:hover": { bgcolor: "#f1f5f9" },
                                            borderBottom: "1px solid #e2e8f0",
                                          }}
                                        >
                                          <TableCell
                                            sx={{
                                              py: 2,
                                              fontSize: "0.95rem",
                                              color: "#374151",
                                            }}
                                          >
                                            {attr.attribute}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontWeight: 600,
                                              py: 2,
                                              fontSize: "0.95rem",
                                              color: "#0F172A",
                                            }}
                                          >
                                            {attr.value}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              py: 2,
                                              fontSize: "0.95rem",
                                              color: "#64748b",
                                            }}
                                          >
                                            {attr.unit}
                                          </TableCell>
                                          <TableCell
                                            align="right"
                                            sx={{
                                              py: 2,
                                              fontSize: "0.95rem",
                                              color: "#374151",
                                            }}
                                          >
                                            {attr.unitPrice?.toLocaleString(
                                              "vi-VN"
                                            ) || 0}
                                            ₫
                                          </TableCell>
                                          <TableCell
                                            align="right"
                                            sx={{
                                              fontWeight: 600,
                                              py: 2,
                                              fontSize: "0.95rem",
                                              color: "#0F172A",
                                            }}
                                          >
                                            {attr.subTotal?.toLocaleString(
                                              "vi-VN"
                                            ) || 0}
                                            ₫
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>

                            {/* Sizes Table */}
                            <Box>
                              <Typography
                                variant="h6"
                                fontWeight={600}
                                mb={2}
                                color="#0F172A"
                                letterSpacing="-0.015em"
                              >
                                Kích Thước Đã Chọn
                              </Typography>
                              <TableContainer
                                component={Paper}
                                elevation={0}
                                sx={{
                                  borderRadius: 4,
                                  overflow: "hidden",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <Table>
                                  <TableHead sx={{ bgcolor: "#0F172A" }}>
                                    <TableRow>
                                      <TableCell
                                        sx={{
                                          fontWeight: 700,
                                          color: "white",
                                          fontSize: "0.9rem",
                                        }}
                                      >
                                        Kích thước
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          fontWeight: 700,
                                          color: "white",
                                          fontSize: "0.9rem",
                                        }}
                                      >
                                        Giá trị
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {currentDesignRequest.customerChoiceHistories.sizeSelections?.map(
                                      (size, idx) => (
                                        <TableRow
                                          key={idx}
                                          sx={{
                                            "&:nth-of-type(odd)": {
                                              bgcolor: "#f8fafc",
                                            },
                                            "&:hover": { bgcolor: "#f1f5f9" },
                                            borderBottom: "1px solid #e2e8f0",
                                          }}
                                        >
                                          <TableCell
                                            sx={{
                                              py: 2,
                                              fontSize: "0.95rem",
                                              color: "#374151",
                                            }}
                                          >
                                            {size.size}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontWeight: 600,
                                              py: 2,
                                              fontSize: "0.95rem",
                                              color: "#0F172A",
                                            }}
                                          >
                                            {size.value}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Price Proposals Section */}
                <Card sx={{ borderRadius: 0, borderTop: "1px solid #e0e0e0" }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      color="#0F172A"
                      mb={3}
                      letterSpacing="-0.015em"
                    >
                      Lịch sử báo giá
                    </Typography>

                    {loadingProposals ? (
                      <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                      </Box>
                    ) : priceProposals.length === 0 ? (
                      <Typography color="#64748b">
                        Chưa có báo giá nào.
                      </Typography>
                    ) : (
                      <Stack spacing={3}>
                        {priceProposals.map((proposal) => (
                          <Paper
                            key={proposal.id}
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              border: "1px solid #e2e8f0",
                              bgcolor: "#f8fafc",
                            }}
                          >
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Stack spacing={1}>
                                  <Typography
                                    variant="body2"
                                    color="#64748b"
                                    fontWeight={600}
                                  >
                                    Giá báo:{" "}
                                    <strong>
                                      {proposal.totalPrice?.toLocaleString(
                                        "vi-VN"
                                      )}
                                      ₫
                                    </strong>
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="#64748b"
                                    fontWeight={600}
                                  >
                                    Tiền cọc:{" "}
                                    <strong>
                                      {proposal.depositAmount?.toLocaleString(
                                        "vi-VN"
                                      )}
                                      ₫
                                    </strong>
                                  </Typography>
                                  {proposal.totalPriceOffer && (
                                    <Typography
                                      variant="body2"
                                      color="#64748b"
                                      fontWeight={600}
                                    >
                                      Giá offer:{" "}
                                      <strong>
                                        {proposal.totalPriceOffer?.toLocaleString(
                                          "vi-VN"
                                        )}
                                        ₫
                                      </strong>
                                    </Typography>
                                  )}
                                  {proposal.depositAmountOffer && (
                                    <Typography
                                      variant="body2"
                                      color="#64748b"
                                      fontWeight={600}
                                    >
                                      Cọc offer:{" "}
                                      <strong>
                                        {proposal.depositAmountOffer?.toLocaleString(
                                          "vi-VN"
                                        )}
                                        ₫
                                      </strong>
                                    </Typography>
                                  )}
                                </Stack>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Stack spacing={1}>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="#64748b"
                                      fontWeight={600}
                                    >
                                      Trạng thái:
                                    </Typography>
                                    <Chip
                                      label={proposal.status}
                                      size="small"
                                    />
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="#64748b"
                                    fontWeight={600}
                                  >
                                    Ngày báo giá:{" "}
                                    <strong>
                                      {new Date(
                                        proposal.createAt
                                      ).toLocaleDateString("vi-VN")}
                                    </strong>
                                  </Typography>
                                </Stack>
                              </Grid>
                            </Grid>

                            {["PENDING", "NEGOTIATING"].includes(
                              proposal.status
                            ) && (
                              <Box mt={2} display="flex" gap={2}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleApproveProposal(proposal.id)
                                  }
                                  sx={{
                                    bgcolor: "#10b981",
                                    "&:hover": { bgcolor: "#059669" },
                                  }}
                                >
                                  Chấp nhận
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="warning"
                                  size="small"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleOpenOfferDialog(proposal.id)
                                  }
                                >
                                  Offer giá khác
                                </Button>
                              </Box>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>

                {/* Construction Choice Section */}
                {currentDesignRequest &&
                  currentDesignRequest.status === "COMPLETED" && (
                    <Card
                      sx={{ borderRadius: 0, borderTop: "1px solid #e0e0e0" }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Typography
                          variant="h5"
                          fontWeight={600}
                          color="#0F172A"
                          mb={3}
                          letterSpacing="-0.015em"
                        >
                          Lựa chọn thi công
                        </Typography>

                        {currentDesignRequest.isNeedSupport === true &&
                        orders.some(
                          (order) =>
                            order.customDesignRequests?.id ===
                            currentDesignRequest.id
                        ) ? (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              bgcolor: "#e1f5fe",
                              border: "1px solid #2196f3",
                            }}
                          >
                            <Typography
                              variant="body1"
                              color="#1976d2"
                              fontWeight={600}
                            >
                              ✅ Đã chọn thi công: Đơn hàng đã được tạo, vui
                              lòng kiểm tra ở tab "Lịch sử đơn hàng"
                            </Typography>
                          </Paper>
                        ) : currentDesignRequest.isNeedSupport !== null ? (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              bgcolor: "#e8f5e9",
                              border: "1px solid #4caf50",
                            }}
                          >
                            <Typography
                              variant="body1"
                              color="#388e3c"
                              fontWeight={600}
                            >
                              ✅ Đã chọn:{" "}
                              {currentDesignRequest.isNeedSupport
                                ? "Có thi công"
                                : "Không thi công"}
                            </Typography>
                          </Paper>
                        ) : (
                          <Typography color="#64748b">
                            Chưa có lựa chọn thi công
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  )}

                {/* Dialog offer giá khác */}
                <Dialog
                  open={offerDialog.open}
                  onClose={handleCloseOfferDialog}
                  maxWidth="sm"
                  fullWidth
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

                {/* Dialog nhập lý do từ chối demo */}
                <Dialog
                  open={rejectDialogOpen}
                  onClose={() => setRejectDialogOpen(false)}
                  PaperProps={{ sx: { borderRadius: 3, minWidth: 350, p: 0 } }}
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
                  <DialogActions
                    sx={{ justifyContent: "center", pb: 2, pt: 0 }}
                  >
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

                {/* Image Viewer Dialog */}
                <Dialog
                  open={imageViewer.open}
                  onClose={handleCloseImageViewer}
                  maxWidth="lg"
                  fullWidth
                  PaperProps={{
                    sx: {
                      bgcolor: "rgba(0, 0, 0, 0.9)",
                      borderRadius: 0,
                      height: "100vh",
                      m: 0,
                      maxWidth: "100vw",
                      maxHeight: "100vh",
                    },
                  }}
                >
                  <DialogTitle
                    sx={{
                      bgcolor: "transparent",
                      color: "white",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {imageViewer.title}
                    </Typography>
                    <IconButton
                      onClick={handleCloseImageViewer}
                      sx={{
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </DialogTitle>
                  <DialogContent
                    sx={{
                      p: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "transparent",
                    }}
                  >
                    {imageViewer.imageUrl && (
                      <img
                        src={imageViewer.imageUrl}
                        alt={imageViewer.title}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "80vh",
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </Box>
            ) : (
              <Typography p={4}>Không có dữ liệu.</Typography>
            )}
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
                {imageDialog.description && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: "primary.50",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "primary.200",
                      width: "100%",
                      maxWidth: 600,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="primary.dark"
                      fontWeight={600}
                      sx={{ mb: 1 }}
                    >
                      📝 Mô tả tiến độ:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ fontStyle: "italic" }}
                    >
                      "{imageDialog.description}"
                    </Typography>
                  </Box>
                )}

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

        {/* Cancel Order Confirmation Dialog */}
        <Dialog
          open={cancelDialog.open}
          onClose={handleCloseCancelDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.5rem",
                }}
              >
                ⚠️
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  Xác nhận hủy đơn hàng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hành động này không thể hoàn tác
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 2 }}>
            {cancelDialog.orderInfo && (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
                  border: "1px solid #e17055",
                  mb: 2,
                }}
              >
                <Typography variant="body1" fontWeight={600} mb={1}>
                  📋 Thông tin đơn hàng sẽ bị hủy:
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  <strong>Loại đơn:</strong>{" "}
                  {ORDER_TYPE_MAP[cancelDialog.orderInfo.orderType] ||
                    cancelDialog.orderInfo.orderType}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(
                    cancelDialog.orderInfo.createdAt
                  ).toLocaleDateString("vi-VN")}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "error.50",
                border: "1px solid",
                borderColor: "error.200",
              }}
            >
              <Typography variant="body1" color="error.dark" fontWeight={600}>
                ⚠️ Lưu ý quan trọng:
              </Typography>
              <Typography variant="body2" color="error.dark" sx={{ mt: 1 }}>
                • Đơn hàng sẽ bị hủy vĩnh viễn và không thể khôi phục
              </Typography>
              <Typography variant="body2" color="error.dark">
                • Bạn có thể cần liên hệ bộ phận hỗ trợ để xử lý hoàn tiền (nếu
                có)
              </Typography>
              <Typography variant="body2" color="error.dark">
                • Tất cả dữ liệu liên quan đến đơn hàng này sẽ được lưu trữ để
                theo dõi
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={handleCloseCancelDialog}
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: "grey.300",
                color: "text.secondary",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "grey.400",
                  backgroundColor: "grey.50",
                },
              }}
            >
              ❌ Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmCancelOrder}
              variant="contained"
              disabled={cancelingOrderId === cancelDialog.orderId}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                fontWeight: 600,
                minWidth: 140,
                boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 20px rgba(255, 107, 107, 0.4)",
                },
                "&:disabled": {
                  background: "grey.300",
                  color: "grey.500",
                },
              }}
            >
              {cancelingOrderId === cancelDialog.orderId ? (
                <>
                  <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                  Đang hủy...
                </>
              ) : (
                "🗑️ Xác nhận hủy"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {galleryOpen && (
        <PhotoProvider
          visible={galleryOpen}
          onVisibleChange={(v) => setGalleryOpen(v)}
          images={galleryImages.map((url, index) => ({ src: url, key: index }))}
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
