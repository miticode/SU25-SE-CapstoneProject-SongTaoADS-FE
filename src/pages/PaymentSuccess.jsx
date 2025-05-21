import React from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { CheckCircle } from "@mui/icons-material";
import { Box, Container, Typography, Button } from "@mui/material";

const PaymentSuccess = () => {
  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 4,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 120,
                color: "#4CAF50",
                mb: 3,
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: "bold",
                color: "#2B2F4A",
                mb: 2,
              }}
            >
              Thanh toán thành công!
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#666",
                mb: 4,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Đơn hàng của bạn đã
              được xác nhận và sẽ được xử lý trong thời gian sớm nhất.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              component={Link}
              to="/"
              variant="contained"
              sx={{
                bgcolor: "#2B2F4A",
                color: "white",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: "#1a1d2e",
                },
              }}
            >
              Về trang chủ
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    </Container>
  );
};

export default PaymentSuccess;
