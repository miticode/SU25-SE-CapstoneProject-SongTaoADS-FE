import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Stack
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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
            '50%': { transform: 'translate(-20px, -20px) rotate(180deg)' }
          }
        }}
      />
      
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            position: 'relative',
            zIndex: 1
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: '100%' }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 6 },
                textAlign: 'center',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 45px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #ef4444 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite',
                  '@keyframes shimmer': {
                    '0%, 100%': { backgroundPosition: '200% 0' },
                    '50%': { backgroundPosition: '-200% 0' }
                  }
                }}
              />

              {/* Icon chính */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Box
                  sx={{
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 100, md: 140 },
                      height: { xs: 100, md: 140 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -3,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ef4444, #f59e0b, #ef4444)',
                        zIndex: -1,
                        animation: 'spin 4s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }
                    }}
                  >
                    <LockOutlined sx={{ fontSize: { xs: 50, md: 70 }, color: 'white' }} />
                  </Box>
                </Box>
              </motion.div>

              {/* Tiêu đề chính */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                    fontSize: { xs: '4rem', md: '6rem' },
                    textShadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  403
                </Typography>
                
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#374151',
                    mb: 2,
                    fontSize: { xs: '1.8rem', md: '2.5rem' }
                  }}
                >
                  🚫 Truy Cập Bị Từ Chối
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: '#6b7280',
                    mb: 4,
                    maxWidth: 600,
                    mx: 'auto',
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', md: '1.125rem' }
                  }}
                >
                  Xin lỗi, bạn không có quyền truy cập vào trang này. 
                  Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                </Typography>
              </motion.div>

              {/* Thông tin user hiện tại */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Box
                    sx={{
                      p: 3,
                      mb: 4,
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                      borderRadius: 3,
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                      <Box
                        component="span"
                        sx={{
                          fontSize: '1.5rem',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                      >
                        👤
                      </Box>
                      <Typography variant="h6" fontWeight={600} color="#667eea">
                        Thông tin tài khoản hiện tại
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                      gap: 2 
                    }}>
                      <Box sx={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: 2,
                        p: 2,
                        textAlign: 'left'
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Tên người dùng
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {user.fullName || user.email}
                        </Typography>
                      </Box>
                      
                      <Box sx={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: 2,
                        p: 2,
                        textAlign: 'left'
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Vai trò
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="#667eea">
                          {getRoleDisplayName(getUserRole(user))}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
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
                      minWidth: 180,
                      py: 1.5,
                      px: 4,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
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
                      minWidth: 180,
                      py: 1.5,
                      px: 4,
                      borderRadius: 3,
                      borderWidth: 2,
                      borderColor: '#667eea',
                      color: '#667eea',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: '#764ba2',
                        background: 'rgba(102, 126, 234, 0.05)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)'
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
                        minWidth: 180,
                        py: 1.5,
                        px: 4,
                        borderRadius: 3,
                        color: '#667eea',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      📊 Đến Dashboard
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
                <Box sx={{
                  mt: 4,
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                  borderRadius: 3,
                  border: '1px solid rgba(59, 130, 246, 0.1)'
                }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#374151',
                      fontSize: '1rem',
                      mb: 1
                    }}
                  >
                    💡 <strong>Cần hỗ trợ?</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      mb: 2
                    }}
                  >
                    Nếu bạn tin rằng đây là lỗi hoặc cần quyền truy cập, hãy liên hệ với chúng tôi
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/my-ticket')}
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                      }
                    }}
                  >
                    🎫 Gửi Ticket Hỗ Trợ
                  </Button>
                </Box>
              </motion.div>
            </Paper>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default AccessDeny;