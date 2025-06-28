import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Avatar,
  Divider,
  Grid,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  Modal,
  CircularProgress,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import PageTransition from "../components/PageTransition";
import StepIndicator from "../components/StepIndicator";
import PayOSCheckout from "../components/PayOSCheckout";
import { createPayOSDeposit } from "../api/paymentService";
import {
  updateOrderCustomerInfoApi,
  getOrderByIdApi,
  updateOrderAddressApi,
} from "../api/orderService";
import { getOrdersByUserIdApi } from "../api/orderService";
import { getProfileApi } from "../api/authService";
import { useLocation } from "react-router-dom";
// Import Redux hooks và action
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById } from "../store/features/order/orderSlice";
import { payOrderDepositThunk } from "../store/features/payment/paymentSlice";

const steps = [
  { number: 1, label: "Thông tin cá nhân" },
  { number: 2, label: "Xem lại đơn hàng" },
  { number: 3, label: "Thanh toán" },
];

const paymentMethods = [
  {
    value: "vnpay",
    label: "VNPay",
    icon: (
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1v7T287-ikP1m7dEUbs2n1SbbLEqkMd1ZA&s"
        alt="VNPay"
        width={32}
        height={32}
      />
    ),
  },
  {
    value: "payos",
    label: "PAYOS",
    icon: (
      <img
        src="https://payos.vn/docs/img/logo.svg"
        alt="PAYOS"
        width={32}
        height={32}
      />
    ),
  },
];

const Checkout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Redux selectors
  const currentOrder = useSelector((state) => state.order.currentOrder);
  const currentOrderStatus = useSelector(
    (state) => state.order.currentOrderStatus
  );
  const currentOrderError = useSelector(
    (state) => state.order.currentOrderError
  );

  const paymentLoading = useSelector((state) => state.payment.loading);
  const paymentError = useSelector((state) => state.payment.error);
  const paymentSuccess = useSelector((state) => state.payment.success);
  const orderDepositResult = useSelector(
    (state) => state.payment.orderDepositResult
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [customer, setCustomer] = useState({
    address: "",
    note: "",
  });
  const [agree, setAgree] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [showPayOS, setShowPayOS] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);
  const [updatedOrderInfo, setUpdatedOrderInfo] = useState(null); // Thêm state cho dữ liệu đã cập nhật
  const payOSRef = useRef();

  // Step 1: handle input
  const handleInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  // Step navigation
  const handleNext = async () => {
    if (currentStep === 1) {
      try {
        if (!orderId) throw new Error("Không tìm thấy orderId!");

        // Sử dụng API mới để cập nhật địa chỉ và note
        const result = await updateOrderAddressApi(orderId, {
          address: customer.address,
          note: customer.note,
        });

        console.log("Response từ updateOrderAddressApi:", result);

        if (!result.success) {
          throw new Error(result.error || "Cập nhật địa chỉ thất bại");
        }

        // Xử lý cả hai trường hợp: result.result hoặc result.data
        const updatedData = result.result || result.data;
        console.log("Dữ liệu đã cập nhật từ API:", updatedData);

        if (!updatedData) {
          throw new Error("Không nhận được dữ liệu cập nhật từ API");
        }

        // Lưu dữ liệu đã được cập nhật
        setUpdatedOrderInfo(updatedData);
        setCurrentStep(2);
      } catch (err) {
        alert(err.message || "Cập nhật địa chỉ thất bại!");
        console.error("Lỗi cập nhật địa chỉ:", err);
      }
    } else if (currentStep === 2) {
      // Fetch order details khi chuyển sang step 3
      if (orderId) {
        dispatch(fetchOrderById(orderId));
      }
      setCurrentStep(3);
    } else {
      setCurrentStep((s) => Math.min(s + 1, 3));
    }
  };

  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // Step 3: handle payment
 const handlePayment = async (e) => {
  e.preventDefault();
  if (!agree) {
    console.log("[Payment] Người dùng chưa đồng ý điều khoản.");
    return;
  }

  // Lấy thông tin đơn hàng
  const orderToUse = currentOrder || updatedOrderInfo || orderInfo;
  if (!orderToUse) {
    alert("Không tìm thấy thông tin đơn hàng!");
    return;
  }

  console.log(
    "[Payment] Thông tin đơn hàng trước khi thanh toán:",
    orderToUse
  );

  if (paymentMethod === "payos") {
    try {
      // Dispatch Redux thunk để thanh toán
      console.log(
        "[Payment] Gọi payOrderDepositThunk với orderId:",
        orderToUse.id
      );
      const result = await dispatch(payOrderDepositThunk(orderToUse.id));

      if (payOrderDepositThunk.fulfilled.match(result)) {
        // Thanh toán thành công
        console.log(
          "[Payment] Kết quả thanh toán thành công:",
          result.payload
        );

        // Cập nhật logic lấy checkout URL
        let checkoutUrl = null;
        
        // Kiểm tra các vị trí có thể có checkoutUrl
        if (result.payload?.checkoutUrl) {
          checkoutUrl = result.payload.checkoutUrl;
        } else if (result.payload?.data?.checkoutUrl) {
          checkoutUrl = result.payload.data.checkoutUrl;
        } else if (result.payload?.result?.checkoutUrl) {
          checkoutUrl = result.payload.result.checkoutUrl;
        }

        console.log("[Payment] CheckoutUrl found:", checkoutUrl);

        if (checkoutUrl) {
          console.log("[Payment] Redirecting to:", checkoutUrl);
          // Chuyển hướng đến PayOS
          window.location.href = checkoutUrl;
        } else {
          console.error("[Payment] Response structure:", result.payload);
          throw new Error("Không nhận được URL thanh toán từ PayOS");
        }
      } else {
        // Thanh toán thất bại
        const errorMessage =
          result.payload || "Không thể tạo link thanh toán PayOS";
        console.error("[Payment] Lỗi thanh toán:", errorMessage);
        alert(errorMessage);
      }
    } catch (err) {
      console.error("[Payment] Lỗi chi tiết:", err);
      alert(err.message || "Có lỗi xảy ra khi thanh toán");
    }
  } else if (paymentMethod === "vnpay") {
    // Demo cho VNPay
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Thanh toán VNPay thành công (demo)");
    }, 1500);
  }
};
  useEffect(() => {
    if (paymentSuccess && orderDepositResult) {
      console.log("[Payment] Thanh toán thành công:", orderDepositResult);
      // Có thể thêm logic xử lý sau khi thanh toán thành công
    }

    if (paymentError) {
      console.error("[Payment] Lỗi thanh toán:", paymentError);
      alert(`Lỗi thanh toán: ${paymentError}`);
    }
  }, [paymentSuccess, paymentError, orderDepositResult]);
  // Effect to fetch order details when entering step 2
  useEffect(() => {
    if (currentStep === 2 && orderId && !currentOrder) {
      dispatch(fetchOrderById(orderId));
    }
  }, [currentStep, orderId, dispatch, currentOrder]);

  useEffect(() => {
    // Ưu tiên lấy thông tin từ location.state (được truyền từ OrderHistory)
    if (location.state?.orderId && location.state?.orderInfo) {
      setOrderId(location.state.orderId);
      setOrderInfo(location.state.orderInfo);
      // Đặt địa chỉ và note ban đầu từ orderInfo
      setCustomer({
        address: location.state.orderInfo.address || "",
        note: location.state.orderInfo.note || "",
      });
      return;
    }

    // Fallback: lấy từ localStorage
    const checkoutOrderId = localStorage.getItem("checkoutOrderId");
    const checkoutOrderInfo = localStorage.getItem("checkoutOrderInfo");

    if (checkoutOrderId && checkoutOrderInfo) {
      console.log("Sử dụng thông tin từ localStorage:", {
        checkoutOrderId,
        checkoutOrderInfo,
      });
      const parsedOrderInfo = JSON.parse(checkoutOrderInfo);
      setOrderId(checkoutOrderId);
      setOrderInfo(parsedOrderInfo);
      setCustomer({
        address: parsedOrderInfo.address || "",
        note: parsedOrderInfo.note || "",
      });
      return;
    }

    // Fallback cuối cùng: lấy từ API (như code cũ)
    getProfileApi().then((profileRes) => {
      if (profileRes.success && profileRes.data && profileRes.data.id) {
        const userId = profileRes.data.id;
        localStorage.setItem("userId", userId);
        getOrdersByUserIdApi(userId).then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const pendingOrder = res.data.find((o) => o.status === "PENDING");
            const selectedOrder = pendingOrder ? pendingOrder : res.data[0];
            setOrderId(selectedOrder.id);
            setOrderInfo(selectedOrder);
            setCustomer({
              address: selectedOrder.address || "",
              note: selectedOrder.note || "",
            });
            console.log("Order lấy được từ API:", selectedOrder);
          } else {
            setOrderInfo(null);
            console.log("Không tìm thấy đơn hàng nào cho userId:", userId, res);
          }
        });
      } else {
        setOrderInfo(null);
        console.log("Không lấy được userId từ getProfileApi", profileRes);
      }
    });
  }, [location.state]);

  return (
    <PageTransition>
      <Box
        minHeight="100vh"
        sx={{
          background: "linear-gradient(120deg, #f8fafc 60%, #f3f6fb 100%)",
        }}
      >
        <Box maxWidth="lg" mx="auto" py={6} px={{ xs: 1, md: 4 }}>
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            alignItems="flex-start"
          >
            <Box flex={1}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 4 },
                  borderRadius: 4,
                  background: "#fff",
                }}
              >
                {/* STEP 1: Thông tin cá nhân và địa chỉ */}
                {currentStep === 1 && (
                  <Stack spacing={4}>
                    <Typography fontWeight={700} mb={2}>
                      1. Nhập địa chỉ nhận hàng và ghi chú
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          label="Địa chỉ nhận hàng *"
                          name="address"
                          value={customer.address}
                          onChange={handleInputChange}
                          fullWidth
                          required
                          placeholder="Nhập địa chỉ giao hàng đầy đủ"
                          helperText="Vui lòng nhập địa chỉ chi tiết để chúng tôi có thể giao hàng chính xác"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Ghi chú đơn hàng"
                          name="note"
                          value={customer.note}
                          onChange={handleInputChange}
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)"
                          helperText="Ví dụ: Giao hàng vào giờ hành chính, gọi trước khi giao, v.v."
                        />
                      </Grid>
                    </Grid>

                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="flex-end"
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        disabled={!customer.address.trim()}
                        sx={{ minWidth: 120 }}
                      >
                        Tiếp tục
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {/* STEP 2: Xem lại đơn hàng */}
                {currentStep === 2 && (
                  <Stack spacing={4}>
                    <Typography fontWeight={700} mb={2}>
                      2. Xem lại đơn hàng
                    </Typography>

                    {/* Loading state cho việc fetch order */}
                    {currentOrderStatus === "loading" && (
                      <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                        <Typography ml={2}>
                          Đang tải thông tin đơn hàng...
                        </Typography>
                      </Box>
                    )}

                    {/* Error state */}
                    {currentOrderStatus === "failed" && (
                      <Paper
                        elevation={1}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "#fff3f3",
                          border: "1px solid #ffcdd2",
                        }}
                      >
                        <Typography color="error" textAlign="center">
                          Lỗi:{" "}
                          {currentOrderError ||
                            "Không thể tải thông tin đơn hàng"}
                        </Typography>
                      </Paper>
                    )}

                    {/* Hiển thị thông tin đơn hàng từ Redux (ưu tiên cao nhất) */}
                    {currentOrderStatus === "succeeded" && currentOrder && (
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "#f8f9fa",
                          border: "1px solid #e9ecef",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          mb={2}
                          color="primary"
                        >
                          Thông tin đơn hàng
                        </Typography>
                        {currentOrder.customDesignRequests
                          ?.finalDesignImage && (
                          <Box mb={3}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              mb={2}
                              color="secondary"
                            >
                              Thiết kế cuối cùng
                            </Typography>
                            <Box
                              component="img"
                              src={
                                currentOrder.customDesignRequests
                                  .finalDesignImage
                              }
                              alt="Thiết kế cuối cùng"
                              sx={{
                                width: "100%",
                                maxWidth: 400,
                                height: "auto",
                                borderRadius: 2,
                                border: "2px solid #e0e0e0",
                                boxShadow: 2,
                                cursor: "pointer",
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                },
                              }}
                              onClick={() =>
                                window.open(
                                  currentOrder.customDesignRequests
                                    .finalDesignImage,
                                  "_blank"
                                )
                              }
                            />
                          </Box>
                        )}
                        <Stack spacing={2}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body1" color="text.secondary">
                              Mã đơn hàng:
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {currentOrder.id}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body1" color="text.secondary">
                              Tổng tiền:
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color="success.main"
                            >
                              {currentOrder.totalAmount?.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body1" color="text.secondary">
                              Tiền cọc:
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color="warning.main"
                            >
                              {currentOrder.depositAmount?.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND
                            </Typography>
                          </Stack>

                          <Divider />
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body1" color="text.secondary">
                              Địa chỉ giao hàng:
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={500}
                              sx={{ maxWidth: 300, textAlign: "right" }}
                            >
                              {currentOrder.address || "Chưa có địa chỉ"}
                            </Typography>
                          </Stack>
                          {currentOrder.note && (
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Ghi chú:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={500}
                                sx={{ maxWidth: 300, textAlign: "right" }}
                              >
                                {currentOrder.note}
                              </Typography>
                            </Stack>
                          )}
                          {currentOrder.customDesignRequests?.requirements && (
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Yêu cầu thiết kế:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={500}
                                sx={{ maxWidth: 300, textAlign: "right" }}
                              >
                                {currentOrder.customDesignRequests.requirements}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Paper>
                    )}

                    {/* Hiển thị thông tin đã cập nhật từ bước 1 (ưu tiên thứ 2) */}
                    {!currentOrder &&
                      updatedOrderInfo &&
                      currentOrderStatus !== "loading" && (
                        <Paper
                          elevation={2}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: "#f8f9fa",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            mb={2}
                            color="primary"
                          >
                            Thông tin đơn hàng (Đã cập nhật)
                          </Typography>
                          {updatedOrderInfo.customDesignRequests
                            ?.finalDesignImage && (
                            <Box mb={3}>
                              <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                mb={2}
                                color="secondary"
                              >
                                Thiết kế cuối cùng
                              </Typography>
                              <Box
                                component="img"
                                src={
                                  updatedOrderInfo.customDesignRequests
                                    .finalDesignImage
                                }
                                alt="Thiết kế cuối cùng"
                                sx={{
                                  width: "100%",
                                  maxWidth: 400,
                                  height: "auto",
                                  borderRadius: 2,
                                  border: "2px solid #e0e0e0",
                                  boxShadow: 2,
                                  cursor: "pointer",
                                  transition: "transform 0.2s",
                                  "&:hover": {
                                    transform: "scale(1.02)",
                                  },
                                }}
                                onClick={() =>
                                  window.open(
                                    updatedOrderInfo.customDesignRequests
                                      .finalDesignImage,
                                    "_blank"
                                  )
                                }
                              />
                            </Box>
                          )}
                          <Stack spacing={2}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Mã đơn hàng:
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {updatedOrderInfo.id}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Tổng tiền:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color="success.main"
                              >
                                {updatedOrderInfo.totalAmount?.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                VND
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Tiền cọc:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color="warning.main"
                              >
                                {updatedOrderInfo.depositAmount?.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                VND
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Trạng thái:
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {updatedOrderInfo.status}
                              </Typography>
                            </Stack>
                            <Divider />
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Địa chỉ giao hàng:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={500}
                                sx={{ maxWidth: 300, textAlign: "right" }}
                              >
                                {updatedOrderInfo.address || "Chưa có địa chỉ"}
                              </Typography>
                            </Stack>
                            {updatedOrderInfo.note && (
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                >
                                  Ghi chú:
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight={500}
                                  sx={{ maxWidth: 300, textAlign: "right" }}
                                >
                                  {updatedOrderInfo.note}
                                </Typography>
                              </Stack>
                            )}
                            {updatedOrderInfo.customDesignRequests
                              ?.requirements && (
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                >
                                  Yêu cầu thiết kế:
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight={500}
                                  sx={{ maxWidth: 300, textAlign: "right" }}
                                >
                                  {
                                    updatedOrderInfo.customDesignRequests
                                      .requirements
                                  }
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Paper>
                      )}

                    {/* Fallback với orderInfo gốc (ưu tiên thấp nhất) */}
                    {!currentOrder &&
                      !updatedOrderInfo &&
                      orderInfo &&
                      currentOrderStatus !== "loading" && (
                        <Paper
                          elevation={2}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: "#f8f9fa",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            mb={2}
                            color="primary"
                          >
                            Thông tin đơn hàng (Gốc)
                          </Typography>
                          {orderInfo.customDesignRequests?.finalDesignImage && (
                            <Box mb={3}>
                              <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                mb={2}
                                color="secondary"
                              >
                                Thiết kế cuối cùng
                              </Typography>
                              <Box
                                component="img"
                                src={
                                  orderInfo.customDesignRequests
                                    .finalDesignImage
                                }
                                alt="Thiết kế cuối cùng"
                                sx={{
                                  width: "100%",
                                  maxWidth: 400,
                                  height: "auto",
                                  borderRadius: 2,
                                  border: "2px solid #e0e0e0",
                                  boxShadow: 2,
                                  cursor: "pointer",
                                  transition: "transform 0.2s",
                                  "&:hover": {
                                    transform: "scale(1.02)",
                                  },
                                }}
                                onClick={() =>
                                  window.open(
                                    orderInfo.customDesignRequests
                                      .finalDesignImage,
                                    "_blank"
                                  )
                                }
                              />
                            </Box>
                          )}
                          <Stack spacing={2}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Mã đơn hàng:
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {orderInfo.id}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Tổng tiền:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color="success.main"
                              >
                                {orderInfo.totalAmount?.toLocaleString("vi-VN")}{" "}
                                VND
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Tiền cọc:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color="warning.main"
                              >
                                {orderInfo.depositAmount?.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                VND
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Trạng thái:
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {orderInfo.status}
                              </Typography>
                            </Stack>
                            <Divider />
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Địa chỉ giao hàng:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={500}
                                sx={{ maxWidth: 300, textAlign: "right" }}
                              >
                                {customer.address || "Chưa có địa chỉ"}
                              </Typography>
                            </Stack>
                            {customer.note && (
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                >
                                  Ghi chú:
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight={500}
                                  sx={{ maxWidth: 300, textAlign: "right" }}
                                >
                                  {customer.note}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Paper>
                      )}

                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="flex-end"
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleBack}
                      >
                        Quay lại
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        sx={{ minWidth: 120 }}
                        disabled={currentOrderStatus === "loading"}
                      >
                        Tiếp tục thanh toán
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {/* STEP 3: Thanh toán */}
                {currentStep === 3 && (
                  <Stack spacing={4}>
                    <Typography fontWeight={700} mb={2}>
                      3. Chọn phương thức thanh toán
                    </Typography>

                    {/* Tóm tắt đơn hàng trong step 3 */}
                    {(currentOrder || updatedOrderInfo || orderInfo) && (
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "#f0f7ff",
                          border: "1px solid #e3f2fd",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          mb={1}
                          color="primary"
                        >
                          Tóm tắt thanh toán
                        </Typography>
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Mã đơn hàng:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {
                                (currentOrder || updatedOrderInfo || orderInfo)
                                  ?.id
                              }
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Số tiền thanh toán (cọc):
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              color="warning.main"
                            >
                              {(
                                currentOrder ||
                                updatedOrderInfo ||
                                orderInfo
                              )?.depositAmount?.toLocaleString("vi-VN")}{" "}
                              VND
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Trạng thái đơn hàng:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {
                                (currentOrder || updatedOrderInfo || orderInfo)
                                  ?.status
                              }
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    )}

                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <Stack direction="row" spacing={2}>
                        {paymentMethods.map((method) => (
                          <FormControlLabel
                            key={method.value}
                            value={method.value}
                            control={
                              <Radio checked={paymentMethod === method.value} />
                            }
                            label={
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                              >
                                {method.icon}
                                <Typography fontWeight={600}>
                                  {method.label}
                                </Typography>
                              </Stack>
                            }
                            sx={{
                              border:
                                paymentMethod === method.value
                                  ? "2px solid #1976d2"
                                  : "1px solid #eee",
                              borderRadius: 2,
                              px: 2,
                              py: 1,
                              bgcolor:
                                paymentMethod === method.value
                                  ? "#f5faff"
                                  : "#fff",
                              minWidth: 160,
                              m: 0,
                            }}
                          />
                        ))}
                      </Stack>
                    </RadioGroup>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography fontSize={14}>
                          Tôi đồng ý với các{" "}
                          <a
                            href="#"
                            style={{
                              color: "#1976d2",
                              textDecoration: "underline",
                            }}
                          >
                            điều khoản sử dụng
                          </a>
                        </Typography>
                      }
                      sx={{ alignItems: "flex-start" }}
                    />

                    {/* Hiển thị loading state khi đang thanh toán */}
                    {paymentLoading && (
                      <Paper
                        elevation={1}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "#fff3cd",
                          border: "1px solid #ffeaa7",
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <CircularProgress size={24} sx={{ mr: 2 }} />
                          <Typography color="text.secondary">
                            Đang xử lý thanh toán...
                          </Typography>
                        </Box>
                      </Paper>
                    )}

                    {/* Cập nhật logic kiểm tra trạng thái và nút thanh toán */}
                    {(() => {
                      const order =
                        currentOrder || updatedOrderInfo || orderInfo;
                      const allowedStatusesForPayment = [
                        "PENDING",
                        "CONTRACT_CONFIRMED",
                      ];
                      const canPay =
                        order &&
                        allowedStatusesForPayment.includes(order.status);

                      return (
                        <Stack
                          direction="row"
                          spacing={2}
                          justifyContent="flex-end"
                        >
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleBack}
                            disabled={paymentLoading}
                          >
                            Quay lại
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={
                              paymentLoading ? (
                                <CircularProgress size={20} />
                              ) : (
                                <PaymentIcon />
                              )
                            }
                            onClick={handlePayment}
                            disabled={
                              paymentLoading ||
                              loading ||
                              !agree ||
                              !order ||
                              !canPay
                            }
                          >
                            {paymentLoading ? "Đang xử lý..." : "Thanh toán"}
                          </Button>
                        </Stack>
                      );
                    })()}

                    {/* Thông báo lỗi trạng thái */}
                    {(() => {
                      const order =
                        currentOrder || updatedOrderInfo || orderInfo;
                      const allowedStatusesForPayment = [
                        "PENDING",
                        "CONTRACT_CONFIRMED",
                      ];
                      const canPay =
                        order &&
                        allowedStatusesForPayment.includes(order.status);

                      if (order && !canPay) {
                        return (
                          <Typography color="error" mt={2}>
                            Đơn hàng có trạng thái "{order.status}" không thể
                            thanh toán. Chỉ có thể thanh toán với trạng thái:{" "}
                            {allowedStatusesForPayment.join(", ")}
                          </Typography>
                        );
                      }
                      return null;
                    })()}
                  </Stack>
                )}
              </Paper>
            </Box>
          </Stack>
        </Box>
      </Box>
    </PageTransition>
  );
};

export default Checkout;
