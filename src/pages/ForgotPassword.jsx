import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPassword,
  resetForgotPasswordStatus,
  selectForgotPasswordStatus,
  selectForgotPasswordError,
  selectForgotPasswordMessage,
} from "../store/features/auth/authSlice";
import { Link } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import { IoClose } from "react-icons/io5";
import PageTransition from "../components/PageTransition";
import CountdownTimer from "../components/CountdownTimer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState(""); // Lưu email đã gửi
  const [openAlert, setOpenAlert] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isResend, setIsResend] = useState(false);
  const dispatch = useDispatch();
  const status = useSelector(selectForgotPasswordStatus);
  const error = useSelector(selectForgotPasswordError);
  const message = useSelector(selectForgotPasswordMessage);

  // Tự động ẩn alert thành công sau 3 giây
  useEffect(() => {
    if (status === "succeeded" && openAlert) {
      const timer = setTimeout(() => setOpenAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, openAlert]);

  // Hiển thị countdown timer khi gửi email thành công
  useEffect(() => {
    if (status === "succeeded") {
      setShowCountdown(true);
      setOpenAlert(true);
      console.log("Email sent successfully, showing countdown. Sent email:", sentEmail);
    }
  }, [status, sentEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(resetForgotPasswordStatus());
    if (!email) return;
    setIsResend(false);
    setSentEmail(email); // Lưu email đã gửi
    dispatch(forgotPassword(email));
    setOpenAlert(true);
  };

  // Handle resend password reset email
  const handleResendPasswordReset = async () => {
    try {
      // Sử dụng sentEmail thay vì email để đảm bảo email đã được lưu
      const emailToResend = sentEmail || email;
      if (!emailToResend) {
        console.error("Email is missing for resend");
        return;
      }
      
      setIsResend(true);
      console.log("Resending password reset email to:", emailToResend);
      await dispatch(forgotPassword(emailToResend)).unwrap();
      console.log("Password reset email resent successfully");
    } catch (err) {
      console.error("Failed to resend password reset email:", err);
      setIsResend(false);
    }
  };

  return (
    <PageTransition className="w-full min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quên mật khẩu</h2>
        <p className="text-gray-600 mb-6">
          Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
          <br />
          Vui lòng kiểm tra hộp thư (bao gồm cả mục spam).
        </p>
        
        {/* Thông báo thành công */}
        {status === "succeeded" && message && (
          <Box sx={{ width: "100%", mb: 3 }}>
            <Collapse in={openAlert}>
              <Alert
                severity="success"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setOpenAlert(false)}
                  >
                    <IoClose />
                  </IconButton>
                }
                sx={{ mb: 2, alignItems: "center" }}
              >
                <div className="w-full">
                  <div className="mb-3">
                    📧 Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                  </div>
                  
                  {/* Success message for resend */}
                  {status === "succeeded" && isResend && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      ✅ Email đặt lại mật khẩu đã được gửi lại thành công!
                    </div>
                  )}
                </div>
              </Alert>
            </Collapse>
          </Box>
        )}
        
        {/* Countdown Timer Component - hiển thị độc lập */}
        {showCountdown && (
          <Box sx={{ width: "100%", mb: 3 }}>
            <CountdownTimer
              initialSeconds={60}
              onResend={() => {
                console.log("CountdownTimer onResend called. sentEmail:", sentEmail, "email:", email);
                handleResendPasswordReset();
              }}
              isResendLoading={status === "loading"}
              showResendButton={true}
            />
          </Box>
        )}
        
        {status === "failed" && error && (
          <Box sx={{ width: "100%", mb: 3 }}>
            <Alert severity="error" sx={{ mb: 2, alignItems: "center" }}>
              {error}
            </Alert>
          </Box>
        )}
        
        {/* Form - ẩn khi hiển thị countdown timer */}
        {!showCountdown && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B2F4A] focus:border-transparent"
                placeholder="your.email@example.com"
                disabled={status === "loading"}
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className={`cursor-pointer w-full bg-[#2B2F4A] text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity font-medium ${
                status === "loading" ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {status === "loading"
                ? "Đang gửi..."
                : "Gửi liên kết đặt lại mật khẩu"}
            </button>
          </form>
        )}
        
        <Link
          to="/auth/login"
          className="flex items-center justify-center gap-2 mt-8 text-[#2B2F4A] hover:underline font-medium"
        >
          <span className="text-lg">&#8592;</span> Quay lại đăng nhập
        </Link>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
