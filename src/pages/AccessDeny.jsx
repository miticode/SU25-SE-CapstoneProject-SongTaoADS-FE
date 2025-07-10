import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Stack,
  useTheme
} from '@mui/material';
import { 
  LockOutlined,
  HomeOutlined,
  ArrowBackOutlined 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserRole, getDefaultRedirectPath, getRoleDisplayName } from '../utils/roleUtils';

const AccessDeny = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoDashboard = () => {
    // Sử dụng helper function để điều hướng dựa trên role
    const userRole = getUserRole(user);
    const redirectPath = getDefaultRedirectPath(userRole);
    navigate(redirectPath);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%' }}
        >
          <Paper
            elevation={8}
            sx={{
              p: { xs: 3, md: 6 },
              textAlign: 'center',
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.error.light}10 0%, ${theme.palette.warning.light}10 100%)`,
              border: `1px solid ${theme.palette.error.light}30`
            }}
          >
            {/* Icon chính */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Box
                sx={{
                  mb: 3,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                    boxShadow: `0 8px 32px ${theme.palette.error.main}40`
                  }}
                >
                  <LockOutlined sx={{ fontSize: 60, color: 'white' }} />
                </Box>
              </Box>
            </motion.div>

            {/* Tiêu đề chính */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  color: theme.palette.error.main,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                403
              </Typography>
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 2,
                  fontSize: { xs: '1.5rem', md: '2rem' }
                }}
              >
                Truy Cập Bị Từ Chối
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Xin lỗi, bạn không có quyền truy cập vào trang này. 
                Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
              </Typography>
            </motion.div>

            {/* Thông tin user hiện tại */}
            {user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    mb: 4,
                    backgroundColor: theme.palette.grey[50],
                    border: `1px solid ${theme.palette.grey[200]}`
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Đăng nhập với tư cách: <strong>{user.fullName || user.email}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vai trò: <strong>{getRoleDisplayName(getUserRole(user))}</strong>
                  </Typography>
                </Paper>
              </motion.div>
            )}

            {/* Các nút hành động */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<HomeOutlined />}
                  onClick={handleGoHome}
                  sx={{
                    minWidth: 160,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${theme.palette.primary.main}40`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Về Trang Chủ
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBackOutlined />}
                  onClick={handleGoBack}
                  sx={{
                    minWidth: 160,
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${theme.palette.primary.main}20`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Quay Lại
                </Button>

                {user && (
                  <Button
                    variant="text"
                    size="large"
                    onClick={handleGoDashboard}
                    sx={{
                      minWidth: 160,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}10`,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Đến Dashboard
                  </Button>
                )}
              </Stack>
            </motion.div>

            {/* Thông tin liên hệ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <Typography
                variant="body2"
                sx={{
                  mt: 4,
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem'
                }}
              >
                Cần hỗ trợ? Liên hệ{' '}
                <Typography
                  component="span"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': {
                      color: theme.palette.primary.dark
                    }
                  }}
                  onClick={() => navigate('/my-ticket')}
                >
                  hỗ trợ khách hàng
                </Typography>
              </Typography>
            </motion.div>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default AccessDeny;