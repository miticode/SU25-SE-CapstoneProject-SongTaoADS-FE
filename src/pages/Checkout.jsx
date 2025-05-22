import React, { useState } from "react";
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
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import PageTransition from "../components/PageTransition";
import StepIndicator from "../components/StepIndicator";

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

  // Step 1: handle input
  const handleInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  // Step navigation
  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // Step 3: handle payment
  const handlePayment = (e) => {
    e.preventDefault();
    if (!agree) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Thanh toán thành công (demo)");
    }, 1500);
  };

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
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        mb={2}
                      >
                        <Avatar
                          variant="rounded"
                          src={productDemo.image}
                          alt={productDemo.name}
                          sx={{ width: 72, height: 72, bgcolor: "#f5f5f5" }}
                        />
                        <Box>
                          <Typography fontWeight={600} mb={0.5}>
                            {productDemo.name}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack spacing={1} mb={2}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary">
                            Subtotal
                          </Typography>
                          <Typography>${productDemo.price}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary">
                            Discount (50% OFF)
                          </Typography>
                          <Typography color="success.main">
                            -${productDemo.discount}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary">
                            Shipping
                          </Typography>
                          <Typography color="success.main">Free</Typography>
                        </Stack>
                      </Stack>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={2}
                      >
                        <Typography fontWeight={700}>TOTAL</Typography>
                        <Typography
                          fontWeight={700}
                          color="primary.main"
                          fontSize={22}
                        >
                          ${productDemo.final}
                        </Typography>
                      </Stack>
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
                        disabled={loading || !agree}
                      >
                        {loading ? "Đang xử lý..." : "Thanh toán"}
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Paper>
            </Box>
            {/* RIGHT: ORDER SUMMARY (luôn hiển thị) */}
            <Box flexShrink={0} width={{ xs: "100%", md: 370 }}>
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 4,
                  p: 3,
                  background: "rgba(255,255,255,0.95)",
                  minWidth: 320,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Order
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar
                    variant="rounded"
                    src={productDemo.image}
                    alt={productDemo.name}
                    sx={{ width: 72, height: 72, bgcolor: "#f5f5f5" }}
                  />
                  <Box>
                    <Typography fontWeight={600} mb={0.5}>
                      {productDemo.name}
                    </Typography>
                    <Typography fontSize={14} color="text.secondary">
                      Size: {productDemo.size} &nbsp; | &nbsp; Color:{" "}
                      {productDemo.color}
                    </Typography>
                  </Box>
                </Stack>
                <Stack spacing={1} mb={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography>${productDemo.price}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">
                      Discount (50% OFF)
                    </Typography>
                    <Typography color="success.main">
                      -${productDemo.discount}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Shipping</Typography>
                    <Typography color="success.main">Free</Typography>
                  </Stack>
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography fontWeight={700}>TOTAL</Typography>
                  <Typography
                    fontWeight={700}
                    color="primary.main"
                    fontSize={22}
                  >
                    ${productDemo.final}
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Stack>
        </Box>
      </Box>
    </PageTransition>
  );
};

export default Checkout;
