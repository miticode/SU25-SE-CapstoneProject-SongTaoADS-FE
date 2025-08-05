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
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          px: 2
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Xác thực thất bại
          </Typography>
          <Typography variant="body2">
            {outboundAuthError || 'Có lỗi xảy ra trong quá trình xác thực'}
          </Typography>
        </Alert>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/auth/login')}
        >
          Quay lại trang đăng nhập
        </Typography>
      </Box>
    );
  }

  // Handle successful authentication
  if (isLoggedin && user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h5" color="success.main">
          ✅ Đăng nhập thành công!
        </Typography>
        <Typography variant="body1">
          Chào mừng, {user.fullName || user.email}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Đang chuyển hướng...
        </Typography>
      </Box>
    );
  }

  // Default loading state
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">
        Authenticating...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Đang xử lý xác thực Google...
      </Typography>
    </Box>
  );
};

export default Authenticate;
