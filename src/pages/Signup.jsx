import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  register,
  resetAuthStatus,
  resetVerificationStatus,
} from "../store/features/auth/authSlice";
import { isAuthenticated } from "../utils/cookieManager";
import PageTransition from "../components/PageTransition";

// Import MUI components
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

// Import React Icons
import { FaExclamationCircle } from "react-icons/fa";
import { FaExclamationTriangle } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    status,
    error,
    isAuthenticated: reduxAuth,
    verificationStatus,
    verificationError,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    // Reset auth status khi component mount
    dispatch(resetAuthStatus());
    dispatch(resetVerificationStatus());

    // Chuyển hướng nếu đã đăng nhập
    if (reduxAuth || isAuthenticated()) {
      navigate("/");
    }
  }, [dispatch, reduxAuth, navigate]);

  const validatePassword = (password) => {
    // Kiểm tra mật khẩu có ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone) => {
    // Kiểm tra số điện thoại Việt Nam
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    setFormError("");
    setPasswordError("");

    // Kiểm tra mật khẩu và xác nhận mật khẩu
    if (password !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return false;
    }

    // Kiểm tra độ mạnh của mật khẩu
    if (!validatePassword(password)) {
      setPasswordError(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt"
      );
      return false;
    }

    // Kiểm tra số điện thoại
    if (phone && !validatePhone(phone)) {
      setFormError("Số điện thoại không hợp lệ");
      return false;
    }

    // Kiểm tra đồng ý điều khoản
    if (!agreeTerms) {
      setFormError("Bạn phải đồng ý với điều khoản sử dụng");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        console.log("Starting registration process...");

        // Chỉ gọi register - backend sẽ tự động gửi email xác thực
        console.log("Registering account...");
        await dispatch(
          register({
            email,
            password,
            fullName,
            phone,
          })
        ).unwrap();
        console.log("Registration successful");

        setShowVerificationMessage(true);
        navigate("/auth/login?registered=success&verify=required");
      } catch (err) {
        console.error("Registration failed:", err);
      }
    }
  };

  return (
    <PageTransition className="w-full">
      <div className="mb-10 text-center">
        <div className="inline-block p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-3">
          Tạo tài khoản mới
        </h2>
        <p className="text-gray-600 text-lg">
          Tham gia cùng Song Tạo ADS để bắt đầu hành trình sáng tạo với AI
        </p>
      </div>

      {/* Hiển thị thông báo lỗi từ Redux hoặc form validation */}
      {(status === "failed" || formError || verificationError) && (
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
            ❌{" "}
            {error ||
              formError ||
              verificationError ||
              "Đăng ký thất bại. Vui lòng thử lại."}
          </Alert>
        </Box>
      )}

      {/* Hiển thị thông báo xác thực email */}
      {showVerificationMessage && (
        <Box sx={{ width: "100%", mb: 4 }}>
          <Alert
            severity="success"
            icon={<FaCheckCircle className="text-xl" />}
            sx={{
              mb: 2,
              alignItems: "center",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(34, 197, 94, 0.2)",
              "& .MuiAlert-message": {
                fontSize: "14px",
                fontWeight: 500,
              },
            }}
          >
            📧 Vui lòng kiểm tra email của bạn để xác thực tài khoản trước khi
            đăng nhập.
          </Alert>
        </Box>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              👤 Họ và tên
            </label>
            <div className="relative">
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="Nguyễn Văn A"
                disabled={status === "loading"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              📱 Số điện thoại
            </label>
            <div className="relative">
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="0901234567"
                disabled={status === "loading"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

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
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
              placeholder="your.email@example.com"
              disabled={status === "loading"}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              🔒 Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="••••••••••••"
                disabled={status === "loading"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300"
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
            </div>
            <p className="mt-2 text-xs text-gray-500 font-medium">
              💡 Ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt
            </p>
          </div>

          <div className="group">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              🔐 Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="••••••••••••"
                disabled={status === "loading"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300"
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
            </div>
            {passwordError && (
              <Box sx={{ width: "100%", mt: 1 }}>
                <Alert
                  severity="warning"
                  icon={<FaExclamationTriangle className="text-lg" />}
                  sx={{
                    py: 1,
                    alignItems: "center",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                >
                  {passwordError}
                </Alert>
              </Box>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <input
            id="terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-300 mt-0.5"
            disabled={status === "loading"}
          />
          <label htmlFor="terms" className="text-sm text-gray-700 font-medium">
            📋 Tôi đồng ý với{" "}
            <Link
              to="/terms"
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors duration-300"
            >
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link
              to="/privacy"
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors duration-300"
            >
              Chính sách bảo mật
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "loading" || verificationStatus === "loading"}
          className={`group relative w-full py-4 px-6 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden ${
            status === "loading" || verificationStatus === "loading"
              ? "opacity-70 cursor-not-allowed"
              : "hover:from-green-700 hover:to-blue-700"
          }`}
        >
          <span className="relative z-10 flex items-center justify-center">
            {status === "loading" || verificationStatus === "loading" ? (
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
                Tạo tài khoản
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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 font-medium">
          Đã có tài khoản?{" "}
          <Link
            to="/auth/login"
            className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors duration-300"
          >
            Đăng nhập ngay
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
              Hoặc đăng ký với
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="group flex items-center justify-center py-4 w-full border-2 border-gray-200 rounded-2xl shadow-sm bg-white/80 backdrop-blur-sm text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-300 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg"
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
            Đăng ký với Google
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default Signup;
