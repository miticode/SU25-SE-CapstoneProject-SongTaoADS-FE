import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  outboundAuthenticationAndFetchProfile,
  selectOutboundAuthStatus,
  selectOutboundAuthError,
  selectAuthUser,
  resetOutboundAuthStatus
} from '../store/features/auth/authSlice';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { FaCheckCircle, FaExclamationCircle, FaGoogle } from 'react-icons/fa';

const Authenticate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggedin, setIsLoggedin] = useState(false);

  const outboundAuthStatus = useSelector(selectOutboundAuthStatus);
  const outboundAuthError = useSelector(selectOutboundAuthError);
  const user = useSelector(selectAuthUser);

  useEffect(() => {
    console.log('Current URL:', window.location.href);
    console.log('URL search params:', window.location.search);

    // Extract authorization code from URL - use URLSearchParams for proper parsing
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const error = urlParams.get('error');

    // Check for OAuth error first
    if (error) {
      console.error('OAuth error from URL:', error);
      const errorDescription = urlParams.get('error_description');
      console.error('Error description:', errorDescription);
      
      setTimeout(() => {
        navigate(`/auth/login?error=${encodeURIComponent(error)}`);
      }, 2000);
      return;
    }

    if (authCode) {
      console.log('Raw auth code from URL:', authCode);
      
      // Use the code as-is, no additional decoding needed since URLSearchParams handles it
      console.log('Final auth code to send:', authCode);

      // Dispatch outbound authentication action
      dispatch(outboundAuthenticationAndFetchProfile(authCode));
    } else {
      console.log('No authorization code found in URL');
      // Redirect to login if no code found
      setTimeout(() => {
        navigate('/auth/login?error=no_auth_code');
      }, 2000);
    }

    // Cleanup on unmount
    return () => {
      dispatch(resetOutboundAuthStatus());
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    // Handle authentication success
    if (outboundAuthStatus === 'succeeded' && user) {
      console.log('Authentication successful:', user);
      setIsLoggedin(true);
    }
  }, [outboundAuthStatus, user]);

  useEffect(() => {
    // Redirect after successful login
    if (isLoggedin) {
      console.log('Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  }, [isLoggedin, navigate]);

  // Handle authentication error
  if (outboundAuthStatus === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-100 to-white px-4">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center animate-fade-in">
          <FaExclamationCircle className="text-red-500 text-5xl mb-4 animate-bounce" />
          <Typography variant="h5" className="font-bold text-red-600 mb-2 text-center">Xác thực thất bại</Typography>
          <Typography variant="body2" className="text-gray-700 text-center mb-4">
            {outboundAuthError || 'Có lỗi xảy ra trong quá trình xác thực'}
          </Typography>
          <Button
            variant="contained"
            color="error"
            className="w-full py-3 rounded-xl font-bold text-lg shadow-md hover:scale-105 transition mb-2"
            onClick={() => navigate('/auth/login')}
            sx={{
              background: 'linear-gradient(90deg,#ef4444,#f59e42)',
              color: '#fff',
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 8px 25px rgba(239,68,68,0.15)',
              textTransform: 'none',
            }}
          >
            Quay lại trang đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  // Handle successful authentication
  if (isLoggedin && user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-white px-4">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center animate-fade-in">
          <FaCheckCircle className="text-green-500 text-5xl mb-4 animate-bounce" />
          <Typography variant="h5" className="font-bold text-green-700 mb-2 text-center">Đăng nhập thành công!</Typography>
          <Typography variant="body1" className="text-gray-800 text-center mb-2">
            Chào mừng, <span className="font-bold">{user.fullName || user.email}</span>
          </Typography>
          <Typography variant="body2" className="text-gray-500 text-center">
            Đang chuyển hướng về trang chủ...
          </Typography>
        </div>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center animate-fade-in">
        <div className="mb-4 flex flex-col items-center">
          <span className="relative flex h-16 w-16 mb-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-16 w-16 bg-gradient-to-br from-blue-400 to-green-400 items-center justify-center">
              <FaGoogle className="text-white text-3xl" />
            </span>
          </span>
          <CircularProgress size={48} sx={{ color: '#2563eb', marginTop: '-2.5rem', zIndex: 1, background: 'white', borderRadius: '50%' }} />
        </div>
        <Typography variant="h6" className="font-bold text-blue-700 mb-2 text-center">
          Đang xác thực Google...
        </Typography>
        <Typography variant="body2" className="text-gray-500 text-center">
          Vui lòng chờ trong giây lát, hệ thống đang xử lý đăng nhập Google của bạn.
        </Typography>
      </div>
    </div>
  );
};

export default Authenticate;
