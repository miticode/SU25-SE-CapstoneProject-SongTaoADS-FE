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
  const [showResendForm, setShowResendForm] = useState(false); // Thêm state để hiển thị form gửi lại
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
      setShowResendForm(false); // Ẩn form gửi lại khi gửi thành công
      setIsResend(false); // Reset trạng thái resend
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

  // Handle resend password reset email - yêu cầu nhập lại email
  const handleResendPasswordReset = async () => {
    // Hiển thị form để nhập lại email
    setShowResendForm(true);
    setShowCountdown(false); // Ẩn countdown timer
    setEmail(""); // Xóa email hiện tại để user phải nhập lại
  };

  // Handle submit form gửi lại
  const handleResendSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      setIsResend(true);
      console.log("Resending password reset email to:", email);
      await dispatch(forgotPassword(email)).unwrap();
      console.log("Password reset email resent successfully");
      setSentEmail(email); // Cập nhật email đã gửi
      setShowResendForm(false); // Ẩn form gửi lại
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
        {status === "succeeded" && message && !showResendForm && (
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
        {showCountdown && !showResendForm && (
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
        
        {/* Form gửi lại email - hiển thị khi user bấm gửi lại */}
        {showResendForm && (
          <Box sx={{ width: "100%", mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2, alignItems: "center" }}>
              <div className="w-full">
                <div className="mb-3">
                  🔄 Vui lòng nhập lại email để gửi lại liên kết đặt lại mật khẩu.
                </div>
              </div>
            </Alert>
            
            <form onSubmit={handleResendSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="resendEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="resendEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B2F4A] focus:border-transparent"
                  placeholder="your.email@example.com"
                  disabled={status === "loading"}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`flex-1 cursor-pointer bg-[#2B2F4A] text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity font-medium ${
                    status === "loading" ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {status === "loading"
                    ? "Đang gửi..."
                    : "Gửi lại liên kết"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResendForm(false);
                    setShowCountdown(true);
                    setEmail(sentEmail); // Khôi phục email đã gửi trước đó
                    setIsResend(false); // Reset trạng thái resend
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </Box>
        )}
        
        {/* Form ban đầu - ẩn khi hiển thị countdown timer hoặc form gửi lại */}
        {!showCountdown && !showResendForm && (
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
