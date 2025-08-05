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
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State cho password validation
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false,
  });
  
  // State cho confirm password validation
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({
    matches: false,
    isValid: false,
  });

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
    // Kiểm tra mật khẩu có ít nhất 7 ký tự, bao gồm chữ, số và ký tự đặc biệt
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{7,}$/;
    return passwordRegex.test(password);
  };

  // Hàm kiểm tra password real-time
  const checkPasswordStrength = (password) => {
    const validation = {
      length: password.length >= 7,
      hasLetter: /[A-Za-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*#?&]/.test(password),
    };
    setPasswordValidation(validation);
    return validation;
  };

  // Hàm xử lý thay đổi password
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
    // Kiểm tra lại confirm password khi password thay đổi
    if (confirmPassword) {
      checkConfirmPasswordMatch(confirmPassword, newPassword);
    }
  };

  // Hàm kiểm tra confirm password match
  const checkConfirmPasswordMatch = (confirmPwd, originalPwd = password) => {
    const validation = {
      matches: confirmPwd === originalPwd && confirmPwd !== "",
      isValid: confirmPwd !== "" && confirmPwd === originalPwd,
    };
    setConfirmPasswordValidation(validation);
    return validation;
  };

  // Hàm xử lý thay đổi confirm password
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    checkConfirmPasswordMatch(newConfirmPassword);
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
        "Mật khẩu phải có ít nhất 7 ký tự, bao gồm chữ, số và ký tự đặc biệt"
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
        {/* Nút quay lại trang chủ */}
        <div className="text-left mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-green-600 font-medium transition-colors duration-300 group"
          >
            <FaArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Quay lại trang chủ
          </Link>
        </div>
        
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="••••••••••••"
                disabled={status === "loading"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-green-500 transition-colors duration-300"
                disabled={status === "loading"}
              >
                {showPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Password validation checklist */}
            {password && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-gray-600 mb-2">Yêu cầu mật khẩu:</div>
                <div className="space-y-1">
                  <div className={`flex items-center text-xs ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${passwordValidation.length ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      {passwordValidation.length ? '✓' : '○'}
                    </span>
                    Ít nhất 7 ký tự
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${passwordValidation.hasLetter ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      {passwordValidation.hasLetter ? '✓' : '○'}
                    </span>
                    Có chữ cái
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${passwordValidation.hasNumber ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      {passwordValidation.hasNumber ? '✓' : '○'}
                    </span>
                    Có số
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${passwordValidation.hasSpecial ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                      {passwordValidation.hasSpecial ? '✓' : '○'}
                    </span>
                    Có ký tự đặc biệt (@$!%*#?&)
                  </div>
                </div>
              </div>
            )}
            
            {!password && (
              <p className="mt-2 text-xs text-gray-500 font-medium">
                💡 Ít nhất 7 ký tự, bao gồm chữ, số và ký tự đặc biệt
              </p>
            )}
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
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="••••••••••••"
                disabled={status === "loading"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-green-500 transition-colors duration-300"
                disabled={status === "loading"}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Confirm password validation */}
            {confirmPassword && (
              <div className="mt-3">
                <div className={`flex items-center text-xs ${confirmPasswordValidation.matches ? 'text-green-600' : 'text-red-500'}`}>
                  <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${confirmPasswordValidation.matches ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {confirmPasswordValidation.matches ? '✓' : '✗'}
                  </span>
                  {confirmPasswordValidation.matches ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}
                </div>
              </div>
            )}
            
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

      
    </PageTransition>
  );
};

export default Signup;
