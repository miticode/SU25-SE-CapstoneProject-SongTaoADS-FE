import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, resetAuthStatus } from "../store/features/auth/authSlice";
import { isAuthenticated } from "../utils/cookieManager";
import PageTransition from "../components/PageTransition";

// Import MUI components
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";

// Import React Icons
import { FaCheckCircle } from "react-icons/fa";
import { FaExclamationCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [openAlert, setOpenAlert] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    status,
    error,
    isAuthenticated: reduxAuth,
  } = useSelector((state) => state.auth);

  // Kiểm tra xem người dùng vừa đăng ký thành công hay không
  const [searchParams] = useSearchParams();
  const registrationSuccess = searchParams.get("registered") === "success";

  useEffect(() => {
    // Reset auth status khi component mount
    dispatch(resetAuthStatus());

    // Chuyển hướng nếu đã đăng nhập
    if (reduxAuth || isAuthenticated()) {
      navigate("/"); // hoặc trang mà bạn muốn chuyển hướng sau khi đăng nhập
    }
  }, [dispatch, reduxAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Dispatch login action và đợi kết quả
      await dispatch(login({ email, password, rememberMe })).unwrap();

      // Nếu thành công, chuyển hướng đến dashboard
      navigate("/"); // hoặc trang mà bạn muốn chuyển hướng sau khi đăng nhập
    } catch (err) {
      // Lỗi đã được xử lý trong slice
      console.error("Login failed:", err);
    }
  };

  return (
    <PageTransition className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
        <p className="text-gray-600">
          Chào mừng bạn quay trở lại! Hãy đăng nhập để tiếp tục.
        </p>
      </div>
      {registrationSuccess && (
        <Box sx={{ width: "100%", mb: 3 }}>
          <Collapse in={openAlert}>
            <Alert
              severity="success"
              icon={<FaCheckCircle className="text-xl" />}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpenAlert(false);
                  }}
                >
                  <IoClose />
                </IconButton>
              }
              sx={{ mb: 2, alignItems: "center" }}
            >
              Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục.
            </Alert>
          </Collapse>
        </Box>
      )}
      {/* Hiển thị thông báo lỗi nếu có */}
      {status === "failed" && (
        <Box sx={{ width: "100%", mb: 3 }}>
          <Alert
            severity="error"
            icon={<FaExclamationCircle className="text-xl" />}
            sx={{ mb: 2, alignItems: "center" }}
          >
            {error || "Đăng nhập thất bại. Vui lòng thử lại."}
          </Alert>
        </Box>
      )}

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

        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-sm text-[#2B2F4A] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B2F4A] focus:border-transparent"
            placeholder="••••••••"
            disabled={status === "loading"}
          />
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-[#2B2F4A] border-gray-300 rounded focus:ring-[#2B2F4A]"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700"
          >
            Ghi nhớ đăng nhập
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className={`cursor-pointer w-full bg-custom-primary text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity font-medium ${
            status === "loading" ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {status === "loading" ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/auth/signup"
            className="text-[#2B2F4A] hover:underline font-medium"
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
            <span className="px-2 bg-white text-gray-500">
              Hoặc đăng nhập với
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="flex items-center justify-center py-2 w-full border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={status === "loading"}
          >
            <svg
              className="h-5 w-5 mr-2"
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
