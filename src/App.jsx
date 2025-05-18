import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

import { syncAuthState } from "./store/features/auth/authSlice";
import { getAuthState } from "./api/authService";

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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth/login" />;
  }

  return children;
};

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Đồng bộ trạng thái từ authService khi ứng dụng khởi động
    dispatch(syncAuthState(getAuthState()));
  }, [dispatch]);

  return (
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
          {/* Thêm các protected routes khác ở đây */}
        </Route>

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
