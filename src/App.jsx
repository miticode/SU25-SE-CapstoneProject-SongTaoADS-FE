import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Snackbar, Alert, CircularProgress } from "@mui/material";

import { syncAuthState } from "./store/features/auth/authSlice";
import { checkAuthStatus } from "./api/authService";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthLayout from "./layouts/AuthLayout";
import Signup from "./pages/SignUp";
import Service from "./pages/Service";
import Blog from "./pages/Blog";
import Aboutus from "./pages/Aboutus";
import AIDesign from "./pages/AiDesign";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// Custom event để theo dõi đăng nhập thành công
const loginSuccessEvent = new CustomEvent("loginSuccess");

// Export hàm để component khác có thể gọi khi đăng nhập thành công
export const notifyLoginSuccess = () => {
  window.dispatchEvent(loginSuccessEvent);
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  return children;
};

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Xử lý sự kiện đăng nhập thành công
  useEffect(() => {
    const handleLoginSuccess = () => {
      setShowLoginSuccess(true);
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
    };
  }, []);

  // Kiểm tra trạng thái đăng nhập khi tải trang
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authStatus = await checkAuthStatus();
        dispatch(
          syncAuthState({
            ...authStatus,
            accessToken: localStorage.getItem("accessToken"),
          })
        );
      } catch {
        dispatch(
          syncAuthState({
            isAuthenticated: false,
            user: null,
            accessToken: null,
          })
        );
      }
      setAuthLoading(false);
    };
    initializeAuth();
  }, [dispatch]);

  // Xử lý đóng thông báo
  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowLoginSuccess(false);
  };

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <CircularProgress color="primary" size={48} />
      </div>
    );
  }

  return (
    <>
      {/* Thông báo đăng nhập thành công */}
      <Snackbar
        open={showLoginSuccess}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Đăng nhập thành công!
        </Alert>
      </Snackbar>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<MainLayout />}>
            {/* Public routes - có thể truy cập mà không cần đăng nhập */}
            <Route index element={<Home />} />
            <Route path="service" element={<Service />} />
            <Route path="blog" element={<Blog />} />
            <Route path="aboutus" element={<Aboutus />} />
            <Route path="ai-design" element={<AIDesign />} />

            {/* Protected routes - cần đăng nhập để truy cập */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* Thêm các protected routes khác ở đây */}
          </Route>

          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
};

export default App;
