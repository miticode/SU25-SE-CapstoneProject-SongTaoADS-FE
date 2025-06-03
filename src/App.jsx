import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { syncAuthState } from "./store/features/auth/authSlice";
import { checkAuthStatus } from "./api/authService";

import MainLayout from "./layouts/MainLayout";
import SaleLayout from "./layouts/SaleLayout";
import DesignerLayout from "./layouts/DesignerLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthLayout from "./layouts/AuthLayout";
import Signup from "./pages/Signup";
import Service from "./pages/Service";
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
import AIChatbot from "./components/AIChatbot";
import CustomDesign from "./pages/CustomDesign";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./layouts/AdminLayout";
// Custom event để theo dõi đăng nhập thành công
const loginSuccessEvent = new CustomEvent("loginSuccess");

// Export hàm để component khác có thể gọi khi đăng nhập thành công
export const notifyLoginSuccess = () => {
  window.dispatchEvent(loginSuccessEvent);
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  // Also check localStorage as a fallback
  const hasToken = !!localStorage.getItem("accessToken");

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
  const { isAuthenticated } = useSelector((state) => state.auth);

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
        // Get access token from localStorage
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          // Only try refresh once, not repeatedly
          try {
            // Attempt refresh with a timeout to prevent hanging
            const refreshPromise = checkAuthStatus();
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Auth check timeout")), 5000)
            );

            // Race between refresh and timeout
            const authStatus = await Promise.race([
              refreshPromise,
              timeoutPromise,
            ]);

            if (authStatus.isAuthenticated) {
              console.log("Auth refreshed successfully");
              dispatch(syncAuthState(authStatus));
            } else {
              console.log("Auth refresh failed - not authenticated");
              dispatch(
                syncAuthState({
                  isAuthenticated: false,
                  user: null,
                  accessToken: null,
                })
              );
            }
          } catch (refreshError) {
            console.error("Auth refresh error:", refreshError);
            // Clear auth state on refresh failure
            dispatch(
              syncAuthState({
                isAuthenticated: false,
                user: null,
                accessToken: null,
              })
            );
          }
        } else {
          // We have a token, validate it
          const authStatus = await checkAuthStatus();
          dispatch(
            syncAuthState({
              ...authStatus,
              accessToken: localStorage.getItem("accessToken"),
            })
          );
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        dispatch(
          syncAuthState({
            isAuthenticated: false,
            user: null,
            accessToken: null,
          })
        );
      } finally {
        // Always stop loading, even if errors occur
        setAuthLoading(false);
      }
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

        {isAuthenticated && <AIChatbot />}

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<MainLayout />}>
              {/* Public routes - có thể truy cập mà không cần đăng nhập */}
              <Route index element={<Home />} />
              <Route path="service" element={<Service />} />
              <Route path="blog" element={<Blog />} />
              <Route path="aboutus" element={<Aboutus />} />
              <Route path="ai-design" element={<AIDesign />} />
              <Route path="order-history" element={<OrderHistory />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="custom-design" element={<CustomDesign />} />

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
            </Route>
            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              {/* Add more admin routes as needed */}
              {/* <Route path="users" element={<AdminUsers />} /> */}
              {/* <Route path="orders" element={<AdminOrders />} /> */}
            </Route>
            {/* Sale routes with SaleLayout */}
            <Route
              path="sale"
              element={
                <ProtectedRoute>
                  <SaleLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SaleDashboard />} />
            </Route>

            {/* Designer routes with DesignerLayout */}
            <Route
              path="designer"
              element={
                <ProtectedRoute>
                  <DesignerLayout />
                </ProtectedRoute>
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
      </>
    </LocalizationProvider>
  );
};

export default App;
