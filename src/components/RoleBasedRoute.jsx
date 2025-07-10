import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { canAccessRoute } from '../utils/roleUtils';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, status } = useSelector((state) => state.auth);

  // Hiển thị loading khi đang kiểm tra auth
  if (status === 'loading') {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển đến trang login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Nếu không có thông tin user hoặc role
  if (!user || !user.roles) {
    return <Navigate to="/access-denied" replace />;
  }

  // Kiểm tra quyền truy cập
  if (!canAccessRoute(user, allowedRoles)) {
    return <Navigate to="/access-denied" replace />;
  }

  // Cho phép truy cập
  return children;
};

export default RoleBasedRoute;