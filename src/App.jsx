import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { syncAuthState, setRefreshing } from "./store/features/auth/authSlice";
import { checkAuthStatus, refreshTokenApi } from "./api/authService";

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
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import AdminLayout from "./layouts/AdminLayout";
import ManagerLayout from "./layouts/ManagerLayout";
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
  // Show loading during refresh attempts
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // If Redux state says not authenticated but we have a token,
    // it might be that the token just hasn't been validated yet
    if (!isAuthenticated && hasToken && !isRefreshing) {
      setVerifying(true);

      // Try to validate the token
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
            // Token invalid, redirect to login
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
  const { isAuthenticated, user } = useSelector((state) => state.auth);

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

        if (accessToken) {
          // We have a token, validate it
          try {
            const authStatus = await checkAuthStatus();
            dispatch(
              syncAuthState({
                ...authStatus,
                accessToken:
                  authStatus.accessToken || localStorage.getItem("accessToken"),
              })
            );
          } catch (validationError) {
            console.error("Token validation failed:", validationError);

            // Try to refresh if validation fails
            try {
              const refreshResult = await refreshTokenApi();
              if (refreshResult.success) {
                dispatch(
                  syncAuthState({
                    isAuthenticated: true,
                    user: refreshResult.user || null,
                    accessToken: refreshResult.accessToken,
                  })
                );
              } else {
                throw new Error("Refresh failed during initialization");
              }
            } catch (refreshError) {
              console.error("Auth refresh error:", refreshError);
              dispatch(
                syncAuthState({
                  isAuthenticated: false,
                  user: null,
                  accessToken: null,
                })
              );
            }
          }
        } else {
          // No token, try silent refresh once
          try {
            const refreshPromise = refreshTokenApi();
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Auth refresh timeout")), 5000)
            );

            // Race between refresh and timeout
            const refreshResult = await Promise.race([
              refreshPromise,
              timeoutPromise,
            ]);

            if (refreshResult.success) {
              dispatch(
                syncAuthState({
                  isAuthenticated: true,
                  user: refreshResult.user || null,
                  accessToken: refreshResult.accessToken,
                })
              );
            } else {
              dispatch(
                syncAuthState({
                  isAuthenticated: false,
                  user: null,
                  accessToken: null,
                })
              );
            }
          } catch (silentRefreshError) {
            console.error("Silent auth refresh failed:", silentRefreshError);
            dispatch(
              syncAuthState({
                isAuthenticated: false,
                user: null,
                accessToken: null,
              })
            );
          }
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
  useEffect(() => {
    if (isAuthenticated) {
      // Calculate refresh timing - 5 minutes before expiration (assuming 30 min tokens)
      const tokenLifetime = 30 * 60 * 1000; // 30 minutes in milliseconds
      const refreshBuffer = 5 * 60 * 1000; // 5 minutes before expiry
      const refreshTiming = tokenLifetime - refreshBuffer; // 25 minutes

      console.log(
        `Setting token refresh interval for ${refreshTiming / 60000} minutes`
      );

      const refreshInterval = setInterval(() => {
        console.log("Performing scheduled token refresh");
        refreshTokenApi()
          .then((result) => {
            if (result.success) {
              dispatch(
                syncAuthState({
                  isAuthenticated: true,
                  accessToken: result.accessToken,
                  user: result.user || user,
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
      }, refreshTiming);

      return () => clearInterval(refreshInterval);
    }
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

            <Route
              path="manager"
              element={
                <ProtectedRoute>
                  <ManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ManagerDashboard />} />
              {/* Add more manager routes as needed */}
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
