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
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import PageTransition from "../components/PageTransition";
import StepIndicator from "../components/StepIndicator";
import PayOSCheckout from "../components/PayOSCheckout";
import { createPayOSDeposit } from "../api/paymentService";
import { updateOrderStatusApi, getOrderByIdApi } from "../api/orderService";
import { getOrdersByUserIdApi } from "../api/orderService";
import { getProfileApi } from "../api/authService";

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
        src="https://payos.vn/wp-content/uploads/sites/13/2023/07/Untitled-design-8.svg"
        alt="PAYOS"
        width={32}
        height={32}
      />
    ),
  },
];

const productDemo = {
  name: "Biển Quảng Cáo",
  image:
    "https://aitvietnam.com/wp-content/uploads/2022/04/cac-loai-bien-quang-cao-1-2-min.jpg",

  price: 139,
  discount: 70,
  final: 69,
};

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [customer, setCustomer] = useState({
    address: "",
  });
  const [agree, setAgree] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [showPayOS, setShowPayOS] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);
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
        console.log(
          "Cập nhật orderId:",
          orderId,
          "với địa chỉ:",
          customer.address
        );
        await updateOrderStatusApi(orderId, {
          address: customer.address,
          note: "",
          deliveryDate: new Date().toISOString(),
          status: "PENDING",
        });
        setCurrentStep(2);
      } catch (err) {
        alert("Cập nhật địa chỉ thất bại!");
        console.error("Lỗi cập nhật địa chỉ:", err);
      }
    } else if (currentStep === 2) {
      try {
        if (!orderId) throw new Error("Không tìm thấy orderId!");
        // Lấy lại thông tin đơn hàng mới nhất từ backend
        const res = await getOrderByIdApi(orderId);
        if (res.success && res.data) {
          setOrderInfo(res.data);
          if (res.data.status !== "PENDING") {
            alert(
              "Đơn hàng không còn ở trạng thái chờ xác nhận, không thể thanh toán!"
            );
            return;
          }
          setCurrentStep(3);
        } else {
          alert("Không thể lấy thông tin đơn hàng mới nhất!");
        }
      } catch (err) {
        alert("Có lỗi khi lấy thông tin đơn hàng!");
        console.error(err);
      }
    } else {
      setCurrentStep((s) => Math.min(s + 1, 3));
    }
  };
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // Step 3: handle payment
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!agree) {
      console.log("[PayOS] Người dùng chưa đồng ý điều khoản.");
      return;
    }
    setLoading(true);
    if (paymentMethod === "payos") {
      try {
        if (!orderInfo) throw new Error("Không tìm thấy orderInfo!");
        console.log(
          "[PayOS] Thông tin đơn hàng trước khi thanh toán:",
          orderInfo
        );
        console.log(
          "[PayOS] Gọi createPayOSDeposit với orderId:",
          orderInfo.id
        );
        const res = await createPayOSDeposit(orderInfo.id, "Coc don hang");
        console.log("[PayOS] Kết quả trả về từ createPayOSDeposit:", res);

        if (!res.success) {
          console.error("[PayOS] API trả về lỗi:", res.error);
          throw new Error(res.error || "Không thể tạo link thanh toán");
        }

        const url = res.checkoutUrl || res.result?.checkoutUrl || "";
        console.log("[PayOS] checkoutUrl nhận được:", url);
        if (!url) throw new Error("Không nhận được URL thanh toán");
        console.log("[PayOS] Redirecting to:", url);

        // Thêm log trước và sau khi redirect
        setTimeout(() => {
          console.log("[PayOS] Thực hiện chuyển trang sang PayOS...");
          window.location.href = url;
        }, 5000); // delay nhỏ để log kịp hiện ra

        // return ngay để không chạy code phía sau
        return;
      } catch (err) {
        alert(err.message || "Không thể tạo link thanh toán PAYOS");
        console.error("[PayOS] Lỗi chi tiết khi tạo thanh toán:", err);
      } finally {
        setLoading(false);
      }
      return;
    }
    setTimeout(() => {
      setLoading(false);
      alert("Thanh toán thành công (demo)");
    }, 1500);
  };

  useEffect(() => {
    // Lấy userId từ getProfileApi
    getProfileApi().then((profileRes) => {
      if (profileRes.success && profileRes.data && profileRes.data.id) {
        const userId = profileRes.data.id;
        // Có thể lưu lại vào localStorage nếu muốn dùng lại
        localStorage.setItem("userId", userId);
        getOrdersByUserIdApi(userId).then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const pendingOrder = res.data.find((o) => o.status === "PENDING");
            const selectedOrder = pendingOrder ? pendingOrder : res.data[0];
            setOrderId(selectedOrder.id);
            setOrderInfo(selectedOrder);
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
  }, []);

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
            {/* LEFT: FORM STEPS */}
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
                      1. Nhập địa chỉ nhận hàng
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          label="Address"
                          name="address"
                          value={customer.address}
                          onChange={handleInputChange}
                          fullWidth
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
                      2. Xem lại chi tiết đơn hàng
                    </Typography>
                    <Paper
                      elevation={2}
                      sx={{ p: 2, borderRadius: 3, background: "#f9f9f9" }}
                    >
                      {orderInfo ? (
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            mb={2}
                          >
                            <Avatar
                              variant="rounded"
                              src={orderInfo.image || productDemo.image}
                              alt={
                                orderInfo.histories?.productTypeName ||
                                orderInfo.productTypeName ||
                                productDemo.name
                              }
                              sx={{ width: 72, height: 72, bgcolor: "#f5f5f5" }}
                            />
                            <Box>
                              <Typography fontWeight={600} mb={0.5}>
                                {orderInfo.histories?.productTypeName ||
                                  orderInfo.productTypeName ||
                                  productDemo.name}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary">
                              Tổng tiền
                            </Typography>
                            <Typography>
                              {Math.round(
                                orderInfo.totalAmount
                              )?.toLocaleString("vi-VN")}{" "}
                              VND
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary">
                              Tiền cọc (30%)
                            </Typography>
                            <Typography color="warning.main">
                              {Math.round(
                                orderInfo.depositAmount ??
                                  orderInfo.totalAmount * 0.3
                              ).toLocaleString("vi-VN")}{" "}
                              VND
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary">
                              Còn lại (70%)
                            </Typography>
                            <Typography color="info.main">
                              {(() => {
                                const deposit = Math.round(
                                  orderInfo.depositAmount ??
                                    orderInfo.totalAmount * 0.3
                                );
                                const total = Math.round(orderInfo.totalAmount);
                                const remaining =
                                  orderInfo.remainingAmount != null
                                    ? Math.round(orderInfo.remainingAmount)
                                    : total - deposit;
                                return (
                                  remaining.toLocaleString("vi-VN") + " VND"
                                );
                              })()}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary">
                              Địa chỉ nhận hàng
                            </Typography>
                            <Typography>{orderInfo.address || "-"}</Typography>
                          </Stack>
                          {orderInfo.note && (
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography color="text.secondary">
                                Ghi chú
                              </Typography>
                              <Typography>{orderInfo.note}</Typography>
                            </Stack>
                          )}
                        </Stack>
                      ) : (
                        <Typography color="text.secondary">
                          Không có thông tin đơn hàng.
                        </Typography>
                      )}
                    </Paper>
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
                      >
                        Tiếp tục
                      </Button>
                    </Stack>
                  </Stack>
                )}
                {/* STEP 3: Thanh toán */}
                {currentStep === 3 && (
                  <Stack spacing={4}>
                    {console.log("Vào step 3, orderInfo:", orderInfo)}
                    <Typography fontWeight={700} mb={2}>
                      3. Chọn phương thức thanh toán
                    </Typography>
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
                        startIcon={<PaymentIcon />}
                        onClick={handlePayment}
                        disabled={
                          loading ||
                          !agree ||
                          !orderInfo ||
                          orderInfo.status !== "PENDING"
                        }
                      >
                        {loading ? "Đang xử lý..." : "Thanh toán"}
                      </Button>
                    </Stack>
                    <Modal
                      open={showPayOS && !!checkoutUrl}
                      onClose={() => setShowPayOS(false)}
                      onEntered={() => {
                        if (payOSRef.current) payOSRef.current.open();
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          bgcolor: "background.paper",
                          boxShadow: 24,
                          p: 4,
                          borderRadius: 2,
                          minWidth: 350,
                          outline: "none",
                        }}
                      >
                        <PayOSCheckout
                          ref={payOSRef}
                          checkoutUrl={checkoutUrl}
                          onSuccess={() => {
                            alert("Thanh toán thành công với PAYOS!");
                            setShowPayOS(false);
                          }}
                          onCancel={() => {
                            alert("Bạn đã hủy thanh toán PAYOS!");
                            setShowPayOS(false);
                          }}
                          onExit={() => {
                            setShowPayOS(false);
                          }}
                        />
                      </Box>
                    </Modal>
                    {orderInfo && orderInfo.status !== "PENDING" && (
                      <Typography color="error" mt={2}>
                        Đơn hàng không còn ở trạng thái chờ xác nhận, không thể
                        thanh toán!
                      </Typography>
                    )}
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
