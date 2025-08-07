import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/features/auth/authSlice";
import {
  Box,
  Typography,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
  Container,
  Tooltip,
  Paper,
  InputBase,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import DesignRequests from "./DesignRequests";
import SaleChat from "./SaleChat";
import DashboardContent from "./DashboardContent";

const DesignerDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAvatarClick = (event) => {
    setAvatarAnchorEl(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAvatarAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Clear chatbot history from localStorage
      localStorage.removeItem("ai_chatbot_messages");
      await dispatch(logout()).unwrap();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMenuItemClick = (menuId) => {
    setSelectedMenu(menuId);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return <DashboardContent stats={{}} orders={[]} />;
      case "designs":
        return <DesignRequests />;
      case "chat":
        return <SaleChat />;
      default:
        return <DashboardContent stats={{}} orders={[]} />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation Bar */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          color: "white",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SongTao ADS
          </Typography>
          <Chip
            label="Designer Panel"
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Search Bar */}
          <Paper
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              width: 300,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <InputBase
              sx={{ ml: 2, flex: 1, color: "white" }}
              placeholder="Tìm kiếm..."
              inputProps={{ "aria-label": "search" }}
            />
            <Button sx={{ p: "10px", color: "white", minWidth: "auto" }}>
              <SearchIcon />
            </Button>
          </Paper>

          {/* Notifications */}
          <Tooltip title="Thông báo" arrow>
            <Button
              onClick={handleProfileMenuOpen}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                minWidth: "auto",
                p: 1,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </Button>
          </Tooltip>

          {/* User Avatar */}
          <Tooltip title="Tài khoản" arrow>
            <Button
              onClick={handleAvatarClick}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                minWidth: "auto",
                p: 1,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  width: 32,
                  height: 32,
                }}
              >
                D
              </Avatar>
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 240,
            bgcolor: "white",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
            display: { xs: "none", md: "block" },
            overflowY: "auto",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Menu
            </Typography>
            <Stack spacing={1}>
              {[
                { id: "dashboard", text: "Dashboard", color: "#2e7d32" },
                { id: "designs", text: "Yêu cầu thiết kế", color: "#1976d2" },
                { id: "chat", text: "Chat với Sale", color: "#ff6f00" },
              ].map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: selectedMenu === item.id ? `${item.color}15` : "transparent",
                    color: selectedMenu === item.id ? item.color : "text.primary",
                    border: selectedMenu === item.id ? `2px solid ${item.color}40` : "2px solid transparent",
                    "&:hover": {
                      bgcolor: `${item.color}10`,
                      transform: "translateX(4px)",
                    },
                    transition: "all 0.3s ease",
                    fontWeight: selectedMenu === item.id ? 600 : 500,
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "#f8fafc" }}>
          {renderContent()}
        </Box>
      </Box>

      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">Bạn có 3 thông báo mới</Typography>
        </MenuItem>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={avatarAnchorEl}
        open={Boolean(avatarAnchorEl)}
        onClose={handleAvatarClose}
        onClick={handleAvatarClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Đăng xuất
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DesignerDashboard;
