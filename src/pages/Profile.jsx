import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserAvatarApi,
  updateUserProfileApi,
  updateUserPasswordApi,
} from "../api/authService";
import { changeUserPasswordApi } from "../api/userService";
import {
  fetchProfile,
  updateUserProfile,
  selectAuthUser,
  selectAuthStatus,
  selectAuthError,
} from "../store/features/auth/authSlice";
import {
  fetchCustomerDetailByUserId,
  updateCustomerDetail,
  selectCustomerDetail,
  selectCustomerStatus,
} from "../store/features/customer/customerSlice";
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
  FormControl,
  InputLabel,
  OutlinedInput,
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
import {
  fetchImageFromS3,
  selectS3Image,
  removeImage,
} from "../store/features/s3/s3Slice";

const DEFAULT_AVATAR = "https://i.imgur.com/HeIi0wU.png";

const Profile = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthStatus) === "loading";
  const error = useSelector(selectAuthError);
  const { accessToken } = useSelector((state) => state.auth);

  // Thêm selector cho customerDetail
  const customerDetail = useSelector(selectCustomerDetail);
  const customerStatus = useSelector(selectCustomerStatus);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Auto hide snackbar sau 4 giây
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar((s) => ({ ...s, open: false }));
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  // State cho dialog đổi mật khẩu
  const [openPwd, setOpenPwd] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // State cho dialog tạo mật khẩu (khi password là null)
  const [openCreatePwd, setOpenCreatePwd] = useState(false);
  const [createPwd, setCreatePwd] = useState("");
  const [confirmCreatePwd, setConfirmCreatePwd] = useState("");
  const [createPwdLoading, setCreatePwdLoading] = useState(false);

  // State cho việc hiển thị/ẩn mật khẩu
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmCreatePassword, setShowConfirmCreatePassword] = useState(false);

  // State cho dialog edit customer detail
  const [openCustomerDetail, setOpenCustomerDetail] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editContactInfo, setEditContactInfo] = useState("");
  const [editLogo, setEditLogo] = useState(null);
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false);

  const s3Avatar = useSelector((state) =>
    profile?.avatar ? selectS3Image(state, profile.avatar) : null
  );

  // Selector cho company logo từ S3
  const s3CompanyLogo = useSelector((state) =>
    customerDetail?.logoUrl && !customerDetail.logoUrl.startsWith("http")
      ? selectS3Image(state, customerDetail.logoUrl)
      : null
  );

  useEffect(() => {
    if (profile?.avatar && !profile.avatar.startsWith("http") && !s3Avatar) {
      dispatch(fetchImageFromS3(profile.avatar));
    }
  }, [profile?.avatar, s3Avatar, dispatch]);

  // Fetch company logo từ S3 nếu cần
  useEffect(() => {
    if (
      customerDetail?.logoUrl &&
      !customerDetail.logoUrl.startsWith("http") &&
      !s3CompanyLogo
    ) {
      dispatch(fetchImageFromS3(customerDetail.logoUrl));
    }
  }, [customerDetail?.logoUrl, s3CompanyLogo, dispatch]);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchProfile());
    }
  }, [dispatch, accessToken]);

  // Fetch customerDetail khi có profile
  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchCustomerDetailByUserId(profile.id));
    }
  }, [dispatch, profile?.id]);

  // Đồng bộ editName, editPhone khi profile Redux thay đổi
  useEffect(() => {
    if (profile) {
      setEditName(profile.fullName || "");
      setEditPhone(profile.phone || "");
    }
  }, [profile]);

  // Đồng bộ customer detail khi có thay đổi
  useEffect(() => {
    if (customerDetail) {
      setEditCompanyName(customerDetail.companyName || "");
      setEditAddress(customerDetail.address || "");
      setEditContactInfo(customerDetail.contactInfo || "");
    }
  }, [customerDetail]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;
    try {
      // Gọi API cập nhật avatar user với file gốc
      const updateRes = await updateUserAvatarApi(profile.id, file);
      if (updateRes.success) {
        // Dispatch action để cập nhật profile trong Redux store
        dispatch(fetchProfile());
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
      // Dispatch action để cập nhật profile trong Redux store
      dispatch(
        updateUserProfile({
          fullName: editName,
          phone: editPhone,
        })
      );
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

  // Hàm tạo mật khẩu mới (khi password là null)
  const handleCreatePassword = async () => {
    if (!createPwd || !confirmCreatePwd) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập đủ thông tin",
        severity: "error",
      });
      return;
    }
    if (createPwd !== confirmCreatePwd) {
      setSnackbar({
        open: true,
        message: "Mật khẩu không khớp",
        severity: "error",
      });
      return;
    }
    setCreatePwdLoading(true);
    const res = await changeUserPasswordApi(profile.id, createPwd);
    setCreatePwdLoading(false);
    if (res.success) {
      setOpenCreatePwd(false);
      setCreatePwd("");
      setConfirmCreatePwd("");
      // Refresh profile to update password status
      dispatch(fetchProfile());
      setSnackbar({
        open: true,
        message: "Tạo mật khẩu thành công!",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: res.error || "Tạo mật khẩu thất bại!",
        severity: "error",
      });
    }
  };

  // Hàm cập nhật customer detail
  const handleSaveCustomerDetail = async () => {
    if (!editCompanyName.trim()) {
      setSnackbar({
        open: true,
        message: "Tên công ty không được để trống",
        severity: "error",
      });
      return;
    }

    setCustomerDetailLoading(true);

    const customerData = {
      companyName: editCompanyName,
      address: editAddress,
      contactInfo: editContactInfo,
      userId: profile.id,
    };

    // Thêm logo nếu có file mới được chọn
    if (editLogo) {
      customerData.customerDetailLogo = editLogo;
    }

    try {
      await dispatch(
        updateCustomerDetail({
          customerDetailId: customerDetail.id,
          customerData: customerData,
        })
      ).unwrap();

      setCustomerDetailLoading(false);
      setOpenCustomerDetail(false);
      const hasNewLogo = editLogo !== null;
      setEditLogo(null);

      // Xóa cache S3 cũ nếu có logo cũ và đang upload logo mới
      if (
        hasNewLogo &&
        customerDetail.logoUrl &&
        !customerDetail.logoUrl.startsWith("http")
      ) {
        dispatch(removeImage(customerDetail.logoUrl));
      }

      // Fetch lại customer detail để cập nhật UI
      const updatedCustomerDetail = await dispatch(
        fetchCustomerDetailByUserId(profile.id)
      ).unwrap();

      // Fetch ảnh S3 mới nếu có logo mới được upload
      if (
        hasNewLogo &&
        updatedCustomerDetail?.logoUrl &&
        !updatedCustomerDetail.logoUrl.startsWith("http")
      ) {
        dispatch(fetchImageFromS3(updatedCustomerDetail.logoUrl));
      }

      setSnackbar({
        open: true,
        message: "Cập nhật thông tin công ty thành công!",
        severity: "success",
      });
    } catch (error) {
      setCustomerDetailLoading(false);
      setSnackbar({
        open: true,
        message: error || "Cập nhật thông tin công ty thất bại!",
        severity: "error",
      });
    }
  };

  // Hàm xử lý thay đổi logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditLogo(file);
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
        background: "linear-gradient(135deg, #0C1528 0%, #1a2332 100%)",
        minHeight: "100vh",
        py: 6,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
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
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 25px 45px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 35px 65px rgba(0, 0, 0, 0.15)",
            },
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
              background: "linear-gradient(135deg, #0C1528 0%, #1a2332 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 80,
                height: 3,
                background: "linear-gradient(135deg, #0C1528 0%, #1a2332 100%)",
                borderRadius: 2,
              },
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
              mt: 2,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#0C1528",
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: 1,
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
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "rgba(12, 21, 40, 0.04)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(12, 21, 40, 0.08)",
                        transform: "translateY(-1px)",
                      },
                      "&.Mui-focused": {
                        background: "rgba(12, 21, 40, 0.08)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 20px rgba(12, 21, 40, 0.2)",
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#0C1528",
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: 1,
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
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "rgba(0, 0, 0, 0.02)",
                    },
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
                      color: "#0C1528",
                      mb: 1,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Mật khẩu
                  </Typography>
                  <TextField
                    value={profile.password ? "********" : "Chưa có mật khẩu"}
                    size="small"
                    fullWidth
                    disabled
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(0, 0, 0, 0.02)",
                      },
                      "& .MuiOutlinedInput-input": {
                        color: profile.password ? "inherit" : "#f59e0b",
                        fontStyle: profile.password ? "normal" : "italic",
                      },
                    }}
                  />
                </Box>
                <IconButton
                  onClick={() => profile.password ? setOpenPwd(true) : setOpenCreatePwd(true)}
                  sx={{
                    mt: 3,
                    background: profile.password ? "#0C1528" : "#f59e0b",
                    color: "white",
                    width: 40,
                    height: 40,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px) scale(1.05)",
                      boxShadow: profile.password 
                        ? "0 8px 25px rgba(12, 21, 40, 0.3)"
                        : "0 8px 25px rgba(245, 158, 11, 0.3)",
                    },
                  }}
                  title={profile.password ? "Đổi mật khẩu" : "Tạo mật khẩu"}
                >
                  <Lock />
                </IconButton>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#0C1528",
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: 1,
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
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "rgba(12, 21, 40, 0.04)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(12, 21, 40, 0.08)",
                        transform: "translateY(-1px)",
                      },
                      "&.Mui-focused": {
                        background: "rgba(12, 21, 40, 0.08)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 20px rgba(12, 21, 40, 0.2)",
                      },
                    },
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
                  position: "relative",
                  p: 1,
                  borderRadius: "50%",
                  background: "#0C1528",
                  mb: 2,
                }}
              >
                <Avatar
                  src={
                    profile.avatar
                      ? profile.avatar.startsWith("http")
                        ? profile.avatar
                        : s3Avatar || DEFAULT_AVATAR
                      : DEFAULT_AVATAR
                  }
                  alt={profile.fullName}
                  sx={{
                    width: 140,
                    height: 140,
                    border: "4px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 10px 30px rgba(12, 21, 40, 0.15)",
                    bgcolor: "grey.200",
                    objectFit: "cover",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 15px 40px rgba(12, 21, 40, 0.25)",
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "#0C1528",
                  borderRadius: "50%",
                  boxShadow: "0 6px 20px rgba(12, 21, 40, 0.4)",
                  p: 1.5,
                  cursor: "pointer",
                  border: "3px solid rgba(255, 255, 255, 0.9)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-3px) scale(1.1)",
                    boxShadow: "0 10px 30px rgba(12, 21, 40, 0.5)",
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

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: "#0C1528",
                    textTransform: "uppercase",
                    letterSpacing: 1,
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
                      background:
                        "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                      color: "white",
                      fontWeight: 600,
                      boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                      border: "none",
                      "& .MuiChip-icon": {
                        color: "white",
                      },
                    }}
                  />
                ) : (
                  <Chip
                    icon={<Cancel />}
                    label="Bị khóa"
                    size="small"
                    sx={{
                      background:
                        "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      color: "white",
                      fontWeight: 600,
                      boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
                      "& .MuiChip-icon": {
                        color: "white",
                      },
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
                background: "#0C1528",
                color: "#fff",
                borderRadius: 3,
                fontWeight: 600,
                fontSize: 16,
                px: 6,
                py: 1.5,
                boxShadow: "0 8px 25px rgba(12, 21, 40, 0.3)",
                letterSpacing: 1,
                textTransform: "none",
                border: "none",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 35px rgba(12, 21, 40, 0.4)",
                  "&::before": {
                    opacity: 1,
                  },
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  transition: "left 0.5s ease",
                  opacity: 0,
                },
                "&:hover::before": {
                  left: "100%",
                  opacity: 1,
                },
              }}
              onClick={handleSaveProfile}
              disabled={editLoading}
            >
              {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </Box>
        </Paper>

        {/* Customer Detail Section */}
        {customerDetail && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: { xs: 3, md: 6 },
              maxWidth: 800,
              mx: "auto",
              mt: 4,
              display: "flex",
              flexDirection: "column",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 45px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 35px 65px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mb: 4,
                letterSpacing: 1,
                textAlign: "center",
                background: "linear-gradient(135deg, #0C1528 0%, #1a2332 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 80,
                  height: 3,
                  background:
                    "linear-gradient(135deg, #0C1528 0%, #1a2332 100%)",
                  borderRadius: 2,
                },
              }}
            >
              Thông tin công ty
            </Typography>

            {/* Edit Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 2,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setOpenCustomerDetail(true)}
                sx={{
                  color: "#0C1528",
                  borderColor: "#0C1528",
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "#0C1528",
                    color: "white",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 15px rgba(12, 21, 40, 0.3)",
                  },
                }}
              >
                Chỉnh sửa
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                width: "100%",
                alignItems: "flex-start",
                gap: 4,
              }}
            >
              {/* Company Information */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#0C1528",
                      mb: 1,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Tên công ty
                  </Typography>
                  <TextField
                    value={customerDetail.companyName || ""}
                    size="small"
                    fullWidth
                    disabled
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(0, 0, 0, 0.02)",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#0C1528",
                      mb: 1,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Địa chỉ
                  </Typography>
                  <TextField
                    value={customerDetail.address || ""}
                    size="small"
                    fullWidth
                    disabled
                    multiline
                    rows={2}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(0, 0, 0, 0.02)",
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#0C1528",
                      mb: 1,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Thông tin liên hệ
                  </Typography>
                  <TextField
                    value={customerDetail.contactInfo || ""}
                    size="small"
                    fullWidth
                    disabled
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(0, 0, 0, 0.02)",
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Company Logo */}
              {customerDetail.logoUrl && (
                <Box
                  sx={{
                    minWidth: 200,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#0C1528",
                      mb: 2,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Logo công ty
                  </Typography>
                  <Box
                    component="img"
                    src={
                      customerDetail.logoUrl.startsWith("http")
                        ? customerDetail.logoUrl
                        : s3CompanyLogo || customerDetail.logoUrl
                    }
                    alt="Company Logo"
                    sx={{
                      width: 150,
                      height: 150,
                      objectFit: "contain",
                      border: "2px solid rgba(12, 21, 40, 0.1)",
                      borderRadius: 2,
                      background: "white",
                      p: 1,
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Loading state for customer detail */}
        {customerStatus === "loading" && !customerDetail && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: { xs: 3, md: 6 },
              maxWidth: 800,
              mx: "auto",
              mt: 4,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 45px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography>Đang tải thông tin công ty...</Typography>
          </Paper>
        )}

        <Dialog
          open={openPwd}
          onClose={() => setOpenPwd(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 45px rgba(0, 0, 0, 0.15)",
              minWidth: { xs: "90%", sm: 400 },
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #0C1528 0%, #1a2332 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              fontSize: "1.5rem",
              textAlign: "center",
              pb: 1,
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
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  background: "rgba(12, 21, 40, 0.04)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(12, 21, 40, 0.08)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(12, 21, 40, 0.08)",
                    boxShadow: "0 4px 20px rgba(12, 21, 40, 0.2)",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      edge="end"
                      sx={{
                        color: "#0C1528",
                        "&:hover": {
                          background: "rgba(12, 21, 40, 0.1)",
                        },
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
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  background: "rgba(12, 21, 40, 0.04)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(12, 21, 40, 0.08)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(12, 21, 40, 0.08)",
                    boxShadow: "0 4px 20px rgba(12, 21, 40, 0.2)",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      sx={{
                        color: "#0C1528",
                        "&:hover": {
                          background: "rgba(12, 21, 40, 0.1)",
                        },
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
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  background: "rgba(12, 21, 40, 0.04)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(12, 21, 40, 0.08)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(12, 21, 40, 0.08)",
                    boxShadow: "0 4px 20px rgba(12, 21, 40, 0.2)",
                  },
                },
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
                        color: "#0C1528",
                        "&:hover": {
                          background: "rgba(12, 21, 40, 0.1)",
                        },
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
                color: "#0C1528",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(12, 21, 40, 0.1)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSavePassword}
              variant="contained"
              disabled={pwdLoading}
              sx={{
                background: "#0C1528",
                borderRadius: 2,
                fontWeight: 600,
                px: 4,
                py: 1,
                boxShadow: "0 4px 15px rgba(12, 21, 40, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  background: "#1a2332",
                  boxShadow: "0 6px 20px rgba(12, 21, 40, 0.4)",
                },
              }}
            >
              {pwdLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Create Password */}
        <Dialog
          open={openCreatePwd}
          onClose={() => setOpenCreatePwd(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 45px rgba(0, 0, 0, 0.15)",
              minWidth: { xs: "90%", sm: 400 },
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              fontSize: "1.5rem",
              textAlign: "center",
              pb: 1,
            }}
          >
            Tạo mật khẩu
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 3,
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Bạn chưa có mật khẩu. Hãy tạo mật khẩu để bảo mật tài khoản.
            </Typography>
            <TextField
              label="Mật khẩu mới"
              type={showCreatePassword ? "text" : "password"}
              fullWidth
              value={createPwd}
              onChange={(e) => setCreatePwd(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  background: "rgba(245, 158, 11, 0.04)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(245, 158, 11, 0.08)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(245, 158, 11, 0.08)",
                    boxShadow: "0 4px 20px rgba(245, 158, 11, 0.2)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#f59e0b",
                  "&.Mui-focused": {
                    color: "#f59e0b",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      edge="end"
                      sx={{
                        color: "#f59e0b",
                        "&:hover": {
                          background: "rgba(245, 158, 11, 0.1)",
                        },
                      }}
                    >
                      {showCreatePassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Xác nhận mật khẩu"
              type={showConfirmCreatePassword ? "text" : "password"}
              fullWidth
              value={confirmCreatePwd}
              onChange={(e) => setConfirmCreatePwd(e.target.value)}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  background: "rgba(245, 158, 11, 0.04)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(245, 158, 11, 0.08)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(245, 158, 11, 0.08)",
                    boxShadow: "0 4px 20px rgba(245, 158, 11, 0.2)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#f59e0b",
                  "&.Mui-focused": {
                    color: "#f59e0b",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmCreatePassword(!showConfirmCreatePassword)
                      }
                      edge="end"
                      sx={{
                        color: "#f59e0b",
                        "&:hover": {
                          background: "rgba(245, 158, 11, 0.1)",
                        },
                      }}
                    >
                      {showConfirmCreatePassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => {
                setOpenCreatePwd(false);
                setCreatePwd("");
                setConfirmCreatePwd("");
              }}
              sx={{
                color: "#6b7280",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(107, 114, 128, 0.1)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreatePassword}
              variant="contained"
              disabled={createPwdLoading}
              sx={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                borderRadius: 2,
                fontWeight: 600,
                px: 4,
                py: 1,
                boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                  boxShadow: "0 6px 20px rgba(245, 158, 11, 0.4)",
                },
              }}
            >
              {createPwdLoading ? "Đang tạo..." : "Tạo mật khẩu"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Edit Customer Detail */}
        <Dialog
          open={openCustomerDetail}
          onClose={() => setOpenCustomerDetail(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 45px rgba(0, 0, 0, 0.15)",
              minWidth: { xs: "90%", sm: 500 },
              maxWidth: 600,
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #0C1528 0%, #1a2332 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              fontSize: "1.5rem",
              textAlign: "center",
              pb: 1,
            }}
          >
            Chỉnh sửa thông tin công ty
          </DialogTitle>
          <DialogContent sx={{ pt: 4, px: 4, pb: 2 }}>
            <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
              <InputLabel
                htmlFor="company-name-input"
                shrink
                sx={{
                  color: "#0C1528",
                  "&.Mui-focused": {
                    color: "#0C1528",
                  },
                  transform: "translate(14px, -9px) scale(0.75)",
                }}
              >
                Tên công ty *
              </InputLabel>
              <OutlinedInput
                id="company-name-input"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                label="Tên công ty *"
                sx={{
                  borderRadius: 2,
                  background: "rgba(12, 21, 40, 0.04)",
                  transition: "all 0.3s ease",
                  height: "60px",
                  "& .MuiOutlinedInput-input": {
                    padding: "18px 14px",
                  },
                  "&:hover": {
                    background: "rgba(12, 21, 40, 0.08)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(12, 21, 40, 0.08)",
                    boxShadow: "0 4px 20px rgba(12, 21, 40, 0.2)",
                  },
                }}
              />
            </FormControl>
            <TextField
              label="Địa chỉ"
              fullWidth
              multiline
              rows={3}
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiInputLabel-root": {
                  color: "#0C1528",
                  "&.Mui-focused": {
                    color: "#0C1528",
                  },
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  background: "rgba(12, 21, 40, 0.04)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(12, 21, 40, 0.08)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(12, 21, 40, 0.08)",
                    boxShadow: "0 4px 20px rgba(12, 21, 40, 0.2)",
                  },
                },
              }}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel
                htmlFor="contact-info-input"
                shrink
                sx={{
                  color: "#0C1528",
                  "&.Mui-focused": {
                    color: "#0C1528",
                  },
                  transform: "translate(14px, -9px) scale(0.75)",
                }}
              >
                Thông tin liên hệ
              </InputLabel>
              <OutlinedInput
                id="contact-info-input"
                value={editContactInfo}
                onChange={(e) => setEditContactInfo(e.target.value)}
                label="Thông tin liên hệ"
                sx={{
                  borderRadius: 2,
                  background: "rgba(12, 21, 40, 0.04)",
                  transition: "all 0.3s ease",
                  height: "60px",
                  "& .MuiOutlinedInput-input": {
                    padding: "18px 14px",
                  },
                  "&:hover": {
                    background: "rgba(12, 21, 40, 0.08)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(12, 21, 40, 0.08)",
                    boxShadow: "0 4px 20px rgba(12, 21, 40, 0.2)",
                  },
                }}
              />
            </FormControl>

            {/* Logo Upload Section */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#0C1528",
                  mb: 2,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Logo công ty
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                {/* Current Logo Preview */}
                {(customerDetail?.logoUrl || editLogo) && (
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      border: "2px solid rgba(12, 21, 40, 0.1)",
                      borderRadius: 2,
                      background: "white",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {editLogo ? (
                      <img
                        src={URL.createObjectURL(editLogo)}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <img
                        src={
                          customerDetail.logoUrl.startsWith("http")
                            ? customerDetail.logoUrl
                            : s3CompanyLogo || customerDetail.logoUrl
                        }
                        alt="Current Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* Upload Button */}
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() =>
                    document.getElementById("logo-upload-input").click()
                  }
                  sx={{
                    color: "#0C1528",
                    borderColor: "#0C1528",
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "#0C1528",
                      color: "white",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 15px rgba(12, 21, 40, 0.3)",
                    },
                  }}
                >
                  {editLogo ? "Thay đổi logo" : "Chọn logo"}
                </Button>

                <input
                  id="logo-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleLogoChange}
                />
              </Box>

              {editLogo && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#4ade80",
                    fontWeight: 600,
                    mt: 1,
                    display: "block",
                  }}
                >
                  ✓ Logo mới đã được chọn: {editLogo.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => {
                setOpenCustomerDetail(false);
                setEditLogo(null);
              }}
              sx={{
                color: "#0C1528",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(12, 21, 40, 0.1)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveCustomerDetail}
              variant="contained"
              disabled={customerDetailLoading}
              sx={{
                background: "#0C1528",
                borderRadius: 2,
                fontWeight: 600,
                px: 4,
                py: 1,
                boxShadow: "0 4px 15px rgba(12, 21, 40, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  background: "#1a2332",
                  boxShadow: "0 6px 20px rgba(12, 21, 40, 0.4)",
                },
              }}
            >
              {customerDetailLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Alert thông báo trực tiếp */}
        {snackbar.open && (
          <Box
            sx={{
              position: "fixed",
              top: "150px", // Hiển thị xa hơn dưới Header
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 99999,
              width: "auto",
              maxWidth: "90vw",
              minWidth: "300px",
            }}
          >
            <Alert
              severity={snackbar.severity}
              onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                "&.MuiAlert-standardSuccess": {
                  background:
                    "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                  color: "white",
                  "& .MuiAlert-icon": {
                    color: "white",
                  },
                },
                "&.MuiAlert-standardError": {
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  "& .MuiAlert-icon": {
                    color: "white",
                  },
                },
              }}
            >
              {snackbar.message}
            </Alert>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Profile;
