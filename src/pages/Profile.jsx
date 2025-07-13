import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserAvatarApi,
  updateUserProfileApi,
  updateUserPasswordApi,
} from "../api/authService";
import {
  fetchProfile,
  selectAuthUser,
  selectAuthStatus,
  selectAuthError,
} from "../store/features/auth/authSlice";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  PhotoCamera,
  Edit,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const DEFAULT_AVATAR = "https://i.imgur.com/HeIi0wU.png";

const Profile = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthStatus) === "loading";
  const error = useSelector(selectAuthError);
  const { accessToken } = useSelector((state) => state.auth);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State cho dialog đổi mật khẩu
  const [openPwd, setOpenPwd] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // State cho việc hiển thị/ẩn mật khẩu
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchProfile());
    }
  }, [dispatch, accessToken]);

  // Đồng bộ editName, editPhone khi profile Redux thay đổi
  useEffect(() => {
    if (profile) {
      setEditName(profile.fullName || "");
      setEditPhone(profile.phone || "");
    }
  }, [profile]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;
    try {
      // Gọi API cập nhật avatar user với file gốc
      const updateRes = await updateUserAvatarApi(profile.id, file);
      if (updateRes.success) {
        setSnackbar({
          open: true,
          message: "Cập nhật avatar thành công!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: updateRes.error || "Cập nhật avatar thất bại!",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Có lỗi khi upload avatar!",
        severity: "error",
      });
    }
  };

  // Hàm cập nhật profile
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setSnackbar({
        open: true,
        message: "Họ tên không được để trống",
        severity: "error",
      });
      return;
    }
    setEditLoading(true);
    const res = await updateUserProfileApi(profile.id, editName, editPhone);
    setEditLoading(false);
    if (res.success) {
      setSnackbar({
        open: true,
        message: "Cập nhật thành công!",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: res.error || "Cập nhật thất bại!",
        severity: "error",
      });
    }
  };

  // Hàm cập nhật mật khẩu
  const handleSavePassword = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập đủ thông tin",
        severity: "error",
      });
      return;
    }
    if (newPwd !== confirmPwd) {
      setSnackbar({
        open: true,
        message: "Mật khẩu mới không khớp",
        severity: "error",
      });
      return;
    }
    setPwdLoading(true);
    const res = await updateUserPasswordApi(profile.id, oldPwd, newPwd);
    setPwdLoading(false);
    if (res.success) {
      setOpenPwd(false);
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setSnackbar({
        open: true,
        message: "Đổi mật khẩu thành công!",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: res.error || "Đổi mật khẩu thất bại!",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Typography>Đang tải thông tin...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!profile) return null;

  return (
    <Box 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: "100vh", 
        py: 6,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 3, md: 6 },
            maxWidth: 800,
            mx: "auto",
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 45px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 35px 65px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ 
              mb: 4, 
              letterSpacing: 1, 
              textAlign: "center", 
              width: "100%",
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2
              }
            }}
          >
            Thông tin cá nhân
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              width: "100%",
              alignItems: "flex-start",
              gap: 4,
              mt: 2
            }}
          >
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: 14,
                    color: '#667eea',
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  Họ và tên
                </Typography>
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(102, 126, 234, 0.04)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.08)',
                        transform: 'translateY(-1px)'
                      },
                      '&.Mui-focused': {
                        background: 'rgba(102, 126, 234, 0.08)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                      }
                    }
                  }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: 14,
                    color: '#667eea',
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  E-mail
                </Typography>
                <TextField
                  value={profile.email}
                  size="small"
                  fullWidth
                  disabled
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(0, 0, 0, 0.02)',
                    }
                  }}
                />
              </Box>
              <Box
                sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: 14,
                      color: '#667eea',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }}
                  >
                    Mật khẩu
                  </Typography>
                  <TextField
                    value={"********"}
                    size="small"
                    fullWidth
                    disabled
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(0, 0, 0, 0.02)',
                      }
                    }}
                  />
                </Box>
                <IconButton
                  onClick={() => setOpenPwd(true)}
                  sx={{ 
                    mt: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    width: 40,
                    height: 40,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                    }
                  }}
                >
                  <Lock />
                </IconButton>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: 14,
                    color: '#667eea',
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  Số điện thoại
                </Typography>
                <TextField
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(102, 126, 234, 0.04)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.08)',
                        transform: 'translateY(-1px)'
                      },
                      '&.Mui-focused': {
                        background: 'rgba(102, 126, 234, 0.08)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                position: "relative",
                mx: "auto",
                minWidth: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  p: 1,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  mb: 2
                }}
              >
                <Avatar
                  src={profile.avatar || DEFAULT_AVATAR}
                  alt={profile.fullName}
                  sx={{
                    width: 140,
                    height: 140,
                    border: "4px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                    bgcolor: "grey.200",
                    objectFit: "cover",
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.25)'
                    }
                  }}
                />
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: "50%",
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  p: 1.5,
                  cursor: "pointer",
                  border: "3px solid rgba(255, 255, 255, 0.9)",
                  transition: "all 0.3s ease",
                  "&:hover": { 
                    transform: 'translateY(-3px) scale(1.1)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)'
                  },
                }}
                onClick={() =>
                  document.getElementById("avatar-upload-input").click()
                }
              >
                <Edit sx={{ color: "white", fontSize: 20 }} />
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </Box>
              
             
              
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: 12,
                    color: '#667eea',
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  Trạng thái:
                </Typography>
                {profile.isActive ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Đang hoạt động"
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                      color: "white",
                      fontWeight: 600,
                      boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                      border: 'none',
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                ) : (
                  <Chip
                    icon={<Cancel />}
                    label="Bị khóa"
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      fontWeight: 600,
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              mt: 4,
            }}
          >
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: "#fff",
                borderRadius: 3,
                fontWeight: 600,
                fontSize: 16,
                px: 6,
                py: 1.5,
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                letterSpacing: 1,
                textTransform: "none",
                border: 'none',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                "&:hover": { 
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                  "&::before": {
                    opacity: 1
                  }
                },
                "&::before": {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s ease',
                  opacity: 0
                },
                "&:hover::before": {
                  left: '100%',
                  opacity: 1
                }
              }}
              onClick={handleSaveProfile}
              disabled={editLoading}
            >
              {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </Box>
        </Paper>

        <Dialog 
          open={openPwd} 
          onClose={() => setOpenPwd(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 45px rgba(0, 0, 0, 0.15)',
              minWidth: { xs: '90%', sm: 400 }
            }
          }}
        >
          <DialogTitle 
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.5rem',
              textAlign: 'center',
              pb: 1
            }}
          >
            Đổi mật khẩu
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              label="Mật khẩu cũ"
              type={showOldPassword ? "text" : "password"}
              fullWidth
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: 'rgba(102, 126, 234, 0.04)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.08)',
                  },
                  '&.Mui-focused': {
                    background: 'rgba(102, 126, 234, 0.08)',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      edge="end"
                      sx={{
                        color: '#667eea',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Mật khẩu mới"
              type={showNewPassword ? "text" : "password"}
              fullWidth
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: 'rgba(102, 126, 234, 0.04)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.08)',
                  },
                  '&.Mui-focused': {
                    background: 'rgba(102, 126, 234, 0.08)',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      sx={{
                        color: '#667eea',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Xác nhận mật khẩu mới"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: 'rgba(102, 126, 234, 0.04)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.08)',
                  },
                  '&.Mui-focused': {
                    background: 'rgba(102, 126, 234, 0.08)',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      sx={{
                        color: '#667eea',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setOpenPwd(false)} 
              sx={{
                color: '#667eea',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSavePassword}
              variant="contained"
              disabled={pwdLoading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                fontWeight: 600,
                px: 4,
                py: 1,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                }
              }}
            >
              {pwdLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert 
            severity={snackbar.severity} 
            sx={{ 
              width: "100%",
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              '&.MuiAlert-standardSuccess': {
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: 'white',
                '& .MuiAlert-icon': {
                  color: 'white'
                }
              },
              '&.MuiAlert-standardError': {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                '& .MuiAlert-icon': {
                  color: 'white'
                }
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Profile;
