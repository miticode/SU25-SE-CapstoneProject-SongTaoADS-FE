import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getProfileApi } from "../api/authService";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

const DEFAULT_AVATAR = "https://i.imgur.com/HeIi0wU.png";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        setError("Vui lòng đăng nhập để xem thông tin cá nhân");
        setLoading(false);
        return;
      }

      const res = await getProfileApi();
      if (res.success) {
        setProfile(res.data);
      } else {
        setError(res.error || "Không thể tải thông tin cá nhân");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [accessToken]);

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
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            borderRadius: 4,
            p: 4,
            pt: 8,
            position: "relative",
            textAlign: "center",
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
            maxWidth: 400,
            margin: "40px auto",
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Avatar nổi */}
          <Avatar
            src={profile.avatar || DEFAULT_AVATAR}
            alt={profile.fullName}
            sx={{
              width: 100,
              height: 100,
              position: "absolute",
              top: -50,
              left: "50%",
              transform: "translateX(-50%)",
              border: "4px solid #fff",
              boxShadow: 2,
              bgcolor: "grey.200",
              objectFit: "cover",
            }}
          />
          <Typography variant="h5" fontWeight={700} sx={{ mt: 2, mb: 3 }}>
            Thông tin cá nhân
          </Typography>
          <Box
            sx={{ textAlign: "left", width: "100%", maxWidth: 320, mx: "auto" }}
          >
            <Box sx={{ display: "flex", mb: 1.5 }}>
              <Typography sx={{ minWidth: 110, fontWeight: 500 }}>
                Email:
              </Typography>
              <Typography>{profile.email}</Typography>
            </Box>
            <Box sx={{ display: "flex", mb: 1.5 }}>
              <Typography sx={{ minWidth: 110, fontWeight: 500 }}>
                Họ tên:
              </Typography>
              <Typography>{profile.fullName}</Typography>
            </Box>
            <Box sx={{ display: "flex", mb: 1.5 }}>
              <Typography sx={{ minWidth: 110, fontWeight: 500 }}>
                Số điện thoại:
              </Typography>
              <Typography>{profile.phone}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography sx={{ minWidth: 110, fontWeight: 500 }}>
                Trạng thái:
              </Typography>
              {profile.isActive ? (
                <Chip
                  icon={<CheckCircle />}
                  label="Đang hoạt động"
                  size="small"
                  sx={{ bgcolor: "#d1f5e0", color: "#217a3c", fontWeight: 600 }}
                />
              ) : (
                <Chip
                  icon={<Cancel />}
                  label="Bị khóa"
                  size="small"
                  color="error"
                />
              )}
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: "#e26a2c",
              color: "#fff",
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 16,
              px: 4,
              py: 1.2,
              boxShadow: "0 2px 8px 0 rgba(226,106,44,0.15)",
              "&:hover": { bgcolor: "#c85a1e" },
            }}
          >
            Cập nhật thông tin
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
