import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import '../styles/adminLayout.css';
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
  Chip,
  Tooltip,
  Card,
  CardContent,
  Fade,
  Paper,
  InputBase
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as DarkModeIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/features/auth/authSlice';

// Add keyframes for animations
const pulseKeyframes = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 68, 68, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

const drawerWidth = 240;

// Define all sidebar menu items with enhanced styling
const menuItems = [
  { 
    id: 'dashboard', 
    text: 'Dashboard', 
    icon: <DashboardIcon />,
    color: '#1976d2',
    description: 'Tổng quan hệ thống'
  },
  { 
    id: 'users', 
    text: 'Người Dùng', 
    icon: <PeopleIcon />,
    color: '#9c27b0',
    description: 'Quản lý người dùng'
  },
  { 
    id: 'orders', 
    text: 'Đơn Hàng', 
    icon: <OrdersIcon />,
    color: '#ff9800',
    description: 'Quản lý đơn hàng'
  },
];

// Helper function to get active tab from location
const getActiveTabFromLocation = (pathname) => {
  if (pathname === '/admin' || pathname === '/admin/') {
    return 'dashboard';
  } else if (pathname.includes('/admin/users')) {
    return 'users';
  } else if (pathname.includes('/admin/orders')) {
    return 'orders';
  }
  return 'dashboard';
};

const AdminLayout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Current active tab state - based on current location
  const [activeTab, setActiveTab] = useState(getActiveTabFromLocation(location.pathname));

  // Update activeTab when location changes
  React.useEffect(() => {
    setActiveTab(getActiveTabFromLocation(location.pathname));
  }, [location.pathname]);

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

  const handleLogout = async () => {
    try {
      // Clear chatbot history from localStorage
      localStorage.removeItem("ai_chatbot_messages");
      await dispatch(logout()).unwrap();
      handleMenuClose();
      navigate('/auth/login');
    } catch (error) {
      console.error("Logout failed:", error);
      handleMenuClose();
      navigate('/auth/login');
    }
  };

  // Handle menu item click - navigate to the route
  const handleMenuItemClick = (tabId) => {
    setActiveTab(tabId);
    
    // Navigate to the appropriate route
    switch (tabId) {
      case 'dashboard':
        navigate('/admin');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'orders':
        navigate('/admin/orders');
        break;
      default:
        navigate('/admin');
    }
    
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          backdropFilter: 'blur(4px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }}>
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ 
              mr: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mr: 2
              }}
            >
              SongTao ADS
            </Typography>
            <Chip 
              label="Quản Trị Viên" 
              size="small" 
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600
              }} 
            />
          </Box>

          {/* Search Bar */}
          <Paper
            component="form"
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: 300,
              mr: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '25px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <IconButton sx={{ p: '10px', color: 'white' }}>
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ 
                ml: 1, 
                flex: 1, 
                color: 'white',
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              }}
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>
          
          <Tooltip title="Thông báo" arrow>
            <IconButton 
              color="inherit"
              sx={{
                mr: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Badge 
                badgeContent={4} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#ff4444',
                    color: 'white',
                    animation: 'pulse 2s infinite',
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Tài khoản" arrow>
            <IconButton 
              onClick={handleProfileMenuOpen}
              sx={{ 
                ml: 1,
                p: 0.5,
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Avatar 
                sx={{ 
                  width: 45, 
                  height: 45,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ 
              mt: '50px',
              '& .MuiPaper-root': {
                borderRadius: '16px',
                minWidth: 200,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              }
            }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 300 }}
          >
            <MenuItem 
              onClick={() => { handleMenuClose(); setActiveTab('profile'); }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Hồ Sơ
            </MenuItem>
            <Divider sx={{ my: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: '#ffcccb',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Đăng Xuất
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
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRight: 'none',
            boxShadow: '4px 0 15px rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }} />
        <Box sx={{ 
          overflow: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          py: 2,
          px: 1
        }}>
          {!isMobile && (
            <Box display="flex" justifyContent="space-between" alignItems="center" px={2} mb={2}>
              <Typography variant="subtitle2" sx={{ 
                color: '#64748b', 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Điều Hướng
              </Typography>
              <IconButton 
                onClick={handleDrawerToggle}
                size="small"
                sx={{
                  backgroundColor: '#e2e8f0',
                  '&:hover': {
                    backgroundColor: '#cbd5e1',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          
          <List sx={{ px: 1 }}>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                <Tooltip title={item.description} placement="right" arrow>
                  <ListItemButton 
                    sx={{
                      borderRadius: '12px',
                      minHeight: 48,
                      backgroundColor: activeTab === item.id ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                      border: activeTab === item.id ? '2px solid rgba(102, 126, 234, 0.3)' : '2px solid transparent',
                      '&:hover': {
                        backgroundColor: activeTab === item.id 
                          ? 'rgba(102, 126, 234, 0.2)' 
                          : 'rgba(102, 126, 234, 0.08)',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: activeTab === item.id ? '4px' : '0px',
                        backgroundColor: item.color,
                        transition: 'width 0.3s ease',
                      }
                    }}
                    selected={activeTab === item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 40,
                      color: activeTab === item.id ? item.color : '#64748b',
                      '& svg': {
                        fontSize: '1.3rem',
                        filter: activeTab === item.id ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none',
                      }
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: activeTab === item.id ? 700 : 500,
                        color: activeTab === item.id ? '#1e293b' : '#475569',
                        fontSize: '0.95rem'
                      }}
                    />
                    {activeTab === item.id && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: item.color,
                          boxShadow: `0 0 10px ${item.color}`,
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 3, mx: 2, backgroundColor: '#cbd5e1' }} />
          
          <Box sx={{ mt: 'auto', px: 1 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '16px',
              mb: 2,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Chào mừng trở lại!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                  {user?.fullName || user?.name || 'Người Dùng Quản Trị'}
                </Typography>
                <Box sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}></Box>
              </CardContent>
            </Card>
            
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleLogout}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LogoutIcon sx={{ color: '#ef4444' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Đăng Xuất" 
                  primaryTypographyProps={{ 
                    color: '#ef4444',
                    fontWeight: 600
                  }} 
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
          p: 3, 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
          minHeight: '100vh',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          }
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Pass the active tab to the Outlet context */}
          <Outlet context={{ activeTab }} />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;