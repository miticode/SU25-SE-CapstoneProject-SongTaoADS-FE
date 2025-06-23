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
    <Box sx={{ background: "#f7f7f9", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 6,
            p: { xs: 2, md: 6 },
            maxWidth: 800,
            mx: "auto",
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#fff",
            boxShadow: "0 8px 32px 0 rgba(0,0,0,0.10)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 4, letterSpacing: 2, textAlign: "left", width: "100%" }}
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
            }}
          >
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  className="text-custom-primary"
                  sx={{ fontWeight: 600, fontSize: 14 }}
                >
                  HỌ VÀ TÊN
                </Typography>
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography
                  className="text-custom-primary"
                  sx={{ fontWeight: 600, fontSize: 14 }}
                >
                  E-MAIL
                </Typography>
                <TextField
                  value={profile.email}
                  size="small"
                  fullWidth
                  disabled
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    className="text-custom-primary"
                    sx={{ fontWeight: 600, fontSize: 14 }}
                  >
                    MẬT KHẨU
                  </Typography>
                  <TextField
                    value={"********"}
                    size="small"
                    fullWidth
                    disabled
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <IconButton
                  color="primary"
                  onClick={() => setOpenPwd(true)}
                  sx={{ mt: 3 }}
                >
                  <Lock />
                </IconButton>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  className="text-custom-primary"
                  sx={{ fontWeight: 600, fontSize: 14 }}
                >
                  SỐ ĐIỆN THOẠI
                </Typography>
                <TextField
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <Typography
                  className="text-custom-primary"
                  sx={{ fontWeight: 600, fontSize: 14, minWidth: 110 }}
                >
                  TRẠNG THÁI
                </Typography>
                {profile.isActive ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Đang hoạt động"
                    size="small"
                    sx={{
                      bgcolor: "#d1f5e0",
                      color: "#217a3c",
                      fontWeight: 600,
                      ml: 1,
                    }}
                  />
                ) : (
                  <Chip
                    icon={<Cancel />}
                    label="Bị khóa"
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </Box>

            <Box
              sx={{
                position: "relative",
                mx: "auto",
                minWidth: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src={profile.avatar || DEFAULT_AVATAR}
                alt={profile.fullName}
                sx={{
                  width: 140,
                  height: 140,
                  border: "6px solid #fff",
                  boxShadow: 3,
                  bgcolor: "grey.200",
                  objectFit: "cover",
                  mb: 2,
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  bottom: 24,
                  right: 24,
                  bgcolor: "#fff",
                  borderRadius: "50%",
                  boxShadow: 2,
                  p: 1,
                  cursor: "pointer",
                  border: "2px solid #e0e0e0",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 4, bgcolor: "#f5f5f5" },
                }}
                onClick={() =>
                  document.getElementById("avatar-upload-input").click()
                }
              >
                <Edit sx={{ color: "#e26a2c", fontSize: 26 }} />
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
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
                bgcolor: "#e26a2c",
                color: "#fff",
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 16,
                px: 4,
                py: 1.2,
                boxShadow: "0 2px 8px 0 rgba(226,106,44,0.15)",
                letterSpacing: 1,
                textTransform: "none",
                "&:hover": { bgcolor: "#c85a1e" },
              }}
              onClick={handleSaveProfile}
              disabled={editLoading}
            >
              {editLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </Box>
        </Paper>

        <Dialog open={openPwd} onClose={() => setOpenPwd(false)}>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogContent>
            <TextField
              label="Mật khẩu cũ"
              type={showOldPassword ? "text" : "password"}
              fullWidth
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      edge="end"
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
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
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
              sx={{ mb: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPwd(false)} color="inherit">
              Hủy
            </Button>
            <Button
              onClick={handleSavePassword}
              variant="contained"
              color="primary"
              disabled={pwdLoading}
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
          <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Profile;
