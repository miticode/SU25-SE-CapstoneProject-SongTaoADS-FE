import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  BarChart as StatisticsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Assignment as TasksIcon,
  Group as TeamIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon,
  Straighten as StraightenIcon,
  Tune as TuneIcon,
  BuildCircle as BuildCircleIcon,
  ManageAccounts as ManageAccountsIcon,
  List as ListIcon,
  Assignment as AssignmentIcon,
  SupportAgent as SupportAgentIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import ProductTypeManager from "../pages/manager/ProductTypeManager";
import ProductSizeManager from "../pages/manager/ProductSizeManager";
import ManagerFineTuneAI from "../pages/manager/ManagerFineTuneAI";
import SizeManager from "../pages/manager/SizeManager";
import ProductAttributeManagement from "../pages/manager/ProductAttributeManager";
import AttributeValueManager from "../pages/manager/AttributeValueManager";
import OrderManager from "../pages/manager/OrderManager";
import DesignTemplateManager from "../pages/manager/DesignTemplateManager";
import BackgroundManager from "../pages/manager/BackgroundManager";

const drawerWidth = 240;

// Define all sidebar menu items for Manager
const menuItems = [
  { id: "dashboard", text: "Dashboard", icon: <DashboardIcon /> },
  {
    id: "order-management",
    text: "Quản lý sản xuất",
    icon: <PrecisionManufacturingIcon />,
  },
  {
    id: "product",
    text: "Quản lí biển hiệu",
    icon: <ListIcon />,
    subItems: [
      { id: "product-type", text: "Loại biển hiệu", icon: <CategoryIcon /> },
      {
        id: "product-size",
        text: "Kích thước biển hiệu",
        icon: <StraightenIcon />,
      },
      {
        id: "product-type-attribute",
        text: "Thuộc tính biển hiệu",
        icon: <TuneIcon />,
      },
      {
        id: "attribute-value",
        text: "Giá trị thuộc tính",
        icon: <AssignmentIcon />,
      },
    ],
  },
  {
    id: "design-template",
    text: "Quản lý Thiết Kế Mẫu",
    icon: <ImageIcon />,
  },
  {
    id: "background-management",
    text: "Quản lý Nền Mẫu",
    icon: <ImageIcon />,
  },
  {
    id: "size-management",
    text: "Quản lý kích thước",
    icon: <StraightenIcon />,
  },
  {
    id: "fine-tune-ai",
    text: "Fine Tune AI",
    icon: <BuildCircleIcon />,
  },
  { id: "statistics", text: "Statistics", icon: <StatisticsIcon /> },
  { id: "settings", text: "Settings", icon: <ManageAccountsIcon /> },
  { id: "support-ticket", text: "Hỗ trợ", icon: <SupportAgentIcon /> },
];

const ManagerLayout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Current active tab state - passed to outlet context
  const [activeTab, setActiveTab] = useState("dashboard");

  // Auto-close sidebar on mobile
  React.useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Implement logout logic
    handleMenuClose();
    navigate("/auth/login");
  };

  // Handle menu item click - set active tab instead of navigating
  const handleMenuItemClick = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleMenuExpand = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#2e7d32", // Green color for manager
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SongTao ADS Manager
          </Typography>

          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
            <Avatar
              sx={{
                width: 35,
                height: 35,
                bgcolor: "#e8f5e9",
                color: "#2e7d32",
              }}
            >
              {user?.name?.charAt(0) || "M"}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: "45px" }}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                setActiveTab("profile");
              }}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                setActiveTab("settings");
              }}
            >
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#f5f5f5",
            borderRight: "1px solid rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            py: 2,
          }}
        >
          {!isMobile && (
            <Box display="flex" justifyContent="flex-end" px={1}>
              <IconButton onClick={handleDrawerToggle}>
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          )}

          <List>
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      borderRadius: "0 24px 24px 0",
                      mr: 1,
                      "&:hover": {
                        backgroundColor: "rgba(46, 125, 50, 0.08)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(46, 125, 50, 0.16)",
                      },
                    }}
                    selected={activeTab === item.id}
                    onClick={() => {
                      if (item.subItems) {
                        handleMenuExpand(item.id);
                      } else {
                        handleMenuItemClick(item.id);
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color:
                          activeTab === item.id ? "#2e7d32" : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: activeTab === item.id ? 600 : 400,
                        color:
                          activeTab === item.id ? "#2e7d32" : "text.primary",
                      }}
                    />
                    {item.subItems &&
                      (expandedMenu === item.id ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      ))}
                  </ListItemButton>
                </ListItem>
                {item.subItems && expandedMenu === item.id && (
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.id} disablePadding>
                        <ListItemButton
                          sx={{
                            pl: 4,
                            borderRadius: "0 24px 24px 0",
                            mr: 1,
                            "&:hover": {
                              backgroundColor: "rgba(46, 125, 50, 0.08)",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "rgba(46, 125, 50, 0.16)",
                            },
                          }}
                          selected={activeTab === subItem.id}
                          onClick={() => handleMenuItemClick(subItem.id)}
                        >
                          <ListItemText
                            primary={subItem.text}
                            primaryTypographyProps={{
                              fontWeight: activeTab === subItem.id ? 600 : 400,
                              color:
                                activeTab === subItem.id
                                  ? "#2e7d32"
                                  : "text.primary",
                              fontSize: "0.9rem",
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </React.Fragment>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mt: "auto" }}>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LogoutIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ color: "error.main" }}
                />
              </ListItemButton>
            </ListItem>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          backgroundColor: "#f9fafc",
          height: "calc(100vh - 64px)",
          overflow: "auto",
        }}
      >
        <Toolbar />
        {activeTab === "order-management" && <OrderManager />}
        {activeTab === "product-type" && <ProductTypeManager />}
        {activeTab === "product-size" && <ProductSizeManager />}
        {activeTab === "fine-tune-ai" && <ManagerFineTuneAI />}
        {activeTab === "size-management" && <SizeManager />}
        {activeTab === "product-type-attribute" && (
          <ProductAttributeManagement />
        )}
        {activeTab === "attribute-value" && <AttributeValueManager />}
        {activeTab === "design-template" && <DesignTemplateManager />}
        {activeTab === "background-management" && <BackgroundManager />}
        {activeTab === "support-ticket" && <Outlet context={{ activeTab }} />}
        {activeTab !== "order-management" &&
          activeTab !== "product-type" &&
          activeTab !== "product-size" &&
          activeTab !== "fine-tune-ai" &&
          activeTab !== "size-management" &&
          activeTab !== "product-type-attribute" &&
          activeTab !== "attribute-value" &&
          activeTab !== "design-template" &&
          activeTab !== "background-management" &&
          activeTab !== "support-ticket" && <Outlet context={{ activeTab }} />}
      </Box>
    </Box>
  );
};

export default ManagerLayout;
