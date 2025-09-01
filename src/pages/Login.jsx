import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginAndFetchProfile,
  resetAuthStatus,
  sendVerificationEmail,
} from "../store/features/auth/authSlice";
import PageTransition from "../components/PageTransition";
import CountdownTimer from "../components/CountdownTimer";
import { notifyLoginSuccess } from "../utils/loginEvents"; // Import hàm thông báo

// MUI Components
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaRedo,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { getDefaultRedirectPath, getUserRole } from "../utils/roleUtils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [openAlert, setOpenAlert] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error, isAuthenticated, verificationStatus } = useSelector((state) => state.auth);

  // Kiểm tra xem người dùng vừa đăng ký thành công hay không
  const [searchParams] = useSearchParams();
  const registrationSuccess = searchParams.get("registered") === "success";
  const verifyRequired = searchParams.get("verify") === "required";
  const sessionError = searchParams.get("error");
  const emailFromParams = searchParams.get("email");

  // Handle resend verification email
  const handleResendVerification = async () => {
    try {
      await dispatch(sendVerificationEmail({ email })).unwrap();
      console.log("Verification email resent successfully");
    } catch (err) {
      console.error("Failed to resend verification email:", err);
    }
  };

  ///
  const handleLoginWithGoogle = () => {
    const callBackUrl = import.meta.env.VITE_REDIRECT_URI;
    const authUri = import.meta.env.VITE_AUTH_URI;
    const googleClientId = import.meta.env.VITE_CLIENT_ID;
    const targetUrl = `${authUri}?redirect_uri=${encodeURIComponent(
      callBackUrl
    )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

    console.log(targetUrl);

    window.location.href = targetUrl;
  };

  ///
  useEffect(() => {
    // Reset auth status khi component mount
    dispatch(resetAuthStatus());

    // Chuyển hướng nếu đã đăng nhập
    if (isAuthenticated) {
      navigate("/");
    }

    // Xử lý thông báo lỗi session
    if (sessionError === "session_expired") {
      console.log("Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.");
    }

    // Set email from URL parameters if verify is required
    if (verifyRequired && emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [dispatch, isAuthenticated, navigate, sessionError, verifyRequired, emailFromParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      localStorage.removeItem("accessToken");

      const result = await dispatch(
        loginAndFetchProfile({ email, password, rememberMe })
      ).unwrap();

      console.log("Login result:", result); // Debug log

      // Thông báo đăng nhập thành công
      notifyLoginSuccess();

      // Điều hướng dựa trên role của user
      const userRole = getUserRole(result.user);
      const redirectPath = getDefaultRedirectPath(userRole);

      console.log("User role:", userRole); // Debug log
      console.log("Redirect path:", redirectPath); // Debug log

      // Chuyển hướng ngay lập tức không có delay
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <PageTransition className="w-full">
      <div className="mb-10 text-center">
        {/* Nút quay lại trang chủ */}
        <div className="text-left mb-6">
          <Link
            to="/"
            className="cursor-pointer inline-flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 group"
          >
            <FaArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Quay lại trang chủ
          </Link>
        </div>

        <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-3">
          Chào mừng trở lại!
        </h2>
        <p className="text-gray-600 text-lg">
          Đăng nhập để tiếp tục hành trình sáng tạo quảng cáo với AI
        </p>
      </div>

      {/* Hiển thị thông báo đăng ký thành công với countdown timer */}
      {registrationSuccess && (
        <Box sx={{ width: "100%", mb: 4 }}>
          <Collapse in={openAlert}>
            <Alert
              severity={verifyRequired ? "warning" : "success"}
              icon={
                verifyRequired ? (
                  <FaExclamationTriangle className="text-xl" />
                ) : (
                  <FaCheckCircle className="text-xl" />
                )
              }
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpenAlert(false);
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  <IoClose />
                </IconButton>
              }
              sx={{
                mb: 2,
                alignItems: "center",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                "& .MuiAlert-message": {
                  fontSize: "14px",
                  fontWeight: 500,
                },
              }}
            >
              <div className="w-full">
                <div className="mb-3">
                  {verifyRequired
                    ? "📧 Vui lòng kiểm tra email của bạn để xác thực tài khoản trước khi đăng nhập."
                    : "🎉 Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục."}
                </div>
                
                {/* Countdown Timer Component chỉ hiển thị khi cần xác thực */}
                {verifyRequired && (
                  <CountdownTimer
                    initialSeconds={60}
                    onResend={handleResendVerification}
                    isResendLoading={verificationStatus === "loading"}
                    showResendButton={true}
                  />
                )}
                
                {/* Success message for resend */}
                {verifyRequired && verificationStatus === "succeeded" && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    ✅ Email xác thực đã được gửi lại thành công!
                  </div>
                )}
              </div>
            </Alert>
          </Collapse>
        </Box>
      )}

      {/* Hiển thị thông báo lỗi nếu có */}
      {status === "failed" && (
        <Box sx={{ width: "100%", mb: 4 }}>
          <Alert
            severity="error"
            icon={<FaExclamationCircle className="text-xl" />}
            sx={{
              mb: 2,
              alignItems: "center",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(239, 68, 68, 0.2)",
              "& .MuiAlert-message": {
                fontSize: "14px",
                fontWeight: 500,
              },
            }}
          >
            ❌ {error || "Đăng nhập thất bại. Vui lòng thử lại."}
          </Alert>
        </Box>
      )}

      {/* Form đăng nhập */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="group">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            📧 Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
              placeholder="your.email@example.com"
              disabled={status === "loading"}
              autoComplete="email"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group">
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              🔒 Mật khẩu
            </label>
            <Link
              to="/auth/forgot-password"
              className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-300"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
              placeholder="••••••••••••"
              disabled={status === "loading"}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-blue-500 transition-colors duration-300"
              disabled={status === "loading"}
            >
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-300"
            />
            <label
              htmlFor="remember-me"
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className={`cursor-pointer group relative w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden ${
            status === "loading"
              ? "opacity-70 cursor-not-allowed"
              : "hover:from-blue-700 hover:to-purple-700"
          }`}
        >
          <span className="relative z-10 flex items-center justify-center">
            {status === "loading" ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  ></circle>
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    className="opacity-75"
                  ></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>
                Đăng nhập
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 font-medium">
          Chưa có tài khoản?{" "}
          <Link
            to="/auth/signup"
            className="cursor-pointer text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors duration-300"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 text-gray-500 font-medium backdrop-blur-sm rounded-full">
              Hoặc đăng nhập với
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleLoginWithGoogle}
            className="cursor-pointer group flex items-center justify-center py-4 w-full border-2 border-gray-200 rounded-2xl shadow-sm bg-white/80  text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-300 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg"
            disabled={status === "loading"}
          >
            <svg
              className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-300"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Đăng nhập với Google
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
