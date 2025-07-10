import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import {
  syncAuthState,
  setRefreshing,
  initializeAuth,
} from "./store/features/auth/authSlice";
import { checkAuthStatus, refreshTokenApi } from "./api/authService";

import MainLayout from "./layouts/MainLayout";
import SaleLayout from "./layouts/SaleLayout";
import DesignerLayout from "./layouts/DesignerLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthLayout from "./layouts/AuthLayout";
import Service from "./pages/Service";
import ServiceDetail from "./pages/ServiceDetail";
import Blog from "./pages/Blog";
import Aboutus from "./pages/Aboutus";
import AIDesign from "./pages/AIDesign";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SaleDashboard from "./pages/sale/SaleDashboard";
import DesignerDashboard from "./pages/designer/DesignerDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import OrderHistory from "./pages/OrderHistory";
import Checkout from "./pages/Checkout";
import Signup from "./pages/Signup";
import AIChatbot from "./components/AIChatbot";
import CustomDesign from "./pages/CustomDesign";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import AdminLayout from "./layouts/AdminLayout";
import ManagerLayout from "./layouts/ManagerLayout";

import MyTicket from "./pages/MyTicket";

import AccessDeny from "./pages/AccessDeny";
import RoleBasedRoute from "./components/RoleBasedRoute";
import { ROLES } from "./utils/roleUtils";

// Custom event để theo dõi đăng nhập thành công
const loginSuccessEvent = new CustomEvent("loginSuccess");

// Export hàm để component khác có thể gọi khi đăng nhập thành công
export const notifyLoginSuccess = () => {
  window.dispatchEvent(loginSuccessEvent);
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isRefreshing } = useSelector((state) => state.auth);
  const hasToken = !!localStorage.getItem("accessToken");
  const dispatch = useDispatch();
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && hasToken && !isRefreshing) {
      setVerifying(true);
      dispatch(setRefreshing(true));

      checkAuthStatus()
        .then((authStatus) => {
          if (authStatus.isAuthenticated) {
            dispatch(
              syncAuthState({
                ...authStatus,
                accessToken:
                  authStatus.accessToken || localStorage.getItem("accessToken"),
              })
            );
          } else {
            localStorage.removeItem("accessToken");
          }
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
        })
        .finally(() => {
          setVerifying(false);
          dispatch(setRefreshing(false));
        });
    }
  }, [isAuthenticated, hasToken, isRefreshing, dispatch]);

  if (verifying || isRefreshing) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/auth/login" />;
  }

  return children;
};

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const { isAuthenticated, user, status } = useSelector((state) => state.auth);
  const authInitialized = useRef(false); // Thêm ref để track đã init hay chưa

  // Xử lý sự kiện đăng nhập thành công
  useEffect(() => {
    const handleLoginSuccess = () => {
      setShowLoginSuccess(true);

      // Debug: kiểm tra user data sau khi đăng nhập
      console.log("Login success event triggered");
      setTimeout(() => {
        const currentUser = JSON.parse(
          localStorage.getItem("persist:auth") || "{}"
        );
        console.log("Current user after login:", currentUser);
      }, 1000);
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
    };
  }, []);

  // Kiểm tra trạng thái đăng nhập khi tải trang
  useEffect(() => {
    const initAuth = async () => {
      // Chỉ init một lần
      if (authInitialized.current) {
        return;
      }

      try {
        setAuthLoading(true);
        authInitialized.current = true; // Đánh dấu đã init

        const hasToken = localStorage.getItem("accessToken");

        if (hasToken) {
          // Nếu có token, kiểm tra và sync auth state
          await dispatch(initializeAuth()).unwrap();
        } else {
          // Nếu không có token, set auth loading = false
          setAuthLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        // Xóa token nếu có lỗi
        localStorage.removeItem("accessToken");
      } finally {
        setAuthLoading(false);
      }
    };

    // Chỉ init auth khi component mount lần đầu
    initAuth();
  }, []); // Chỉ chạy một lần khi component mount

  // Token refresh effect - tách riêng
  useEffect(() => {
    let refreshInterval;

    if (isAuthenticated && user) {
      // Refresh token sau mỗi 25 phút
      refreshInterval = setInterval(() => {
        console.log("Performing scheduled token refresh");
        refreshTokenApi()
          .then((result) => {
            if (result.success) {
              dispatch(
                syncAuthState({
                  isAuthenticated: true,
                  user: result.user || user,
                  accessToken: result.accessToken,
                })
              );
              console.log("Scheduled token refresh completed successfully");
            } else {
              console.warn("Scheduled token refresh failed:", result.error);
            }
          })
          .catch((error) => {
            console.error("Error during scheduled token refresh:", error);
          });
      }, 25 * 60 * 1000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [dispatch, isAuthenticated, user]);

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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
              <Route path="service/:id" element={<ServiceDetail />} />
              <Route path="blog" element={<Blog />} />
              <Route path="aboutus" element={<Aboutus />} />
              <Route path="ai-design" element={<AIDesign />} />
              <Route path="order-history" element={<OrderHistory />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="custom-design" element={<CustomDesign />} />
              <Route path="my-ticket" element={<MyTicket />} />
              <Route path="access-denied" element={<AccessDeny />} />

              {/* Protected routes - chỉ cho CUSTOMER */}

              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin routes - chỉ cho ADMIN */}
            <Route
              path="/admin"
              element={
                <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminLayout />
                </RoleBasedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
            </Route>

            {/* Manager routes - chỉ cho STAFF (MANAGER) */}
            <Route
              path="/manager"
              element={
                <RoleBasedRoute allowedRoles={[ROLES.STAFF]}>
                  <ManagerLayout />
                </RoleBasedRoute>
              }
            >
              <Route index element={<ManagerDashboard />} />
            </Route>

            {/* Sale routes - chỉ cho SALE */}
            <Route
              path="/sale"
              element={
                <RoleBasedRoute allowedRoles={[ROLES.SALE]}>
                  <SaleLayout />
                </RoleBasedRoute>
              }
            >
              <Route index element={<SaleDashboard />} />
            </Route>

            {/* Designer routes - chỉ cho DESIGNER */}
            <Route
              path="/designer"
              element={
                <RoleBasedRoute allowedRoles={[ROLES.DESIGNER]}>
                  <DesignerLayout />
                </RoleBasedRoute>
              }
            >
              <Route index element={<DesignerDashboard />} />
            </Route>

            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
            </Route>
          </Routes>
        </AnimatePresence>

        {/* AI Chatbot */}
        <AIChatbot />
      </>
    </LocalizationProvider>
  );
};

export default App;
