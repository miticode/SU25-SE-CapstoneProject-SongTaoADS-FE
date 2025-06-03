import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  BarChart as StatisticsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const drawerWidth = 240;

// Define all sidebar menu items
const menuItems = [
  { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'users', text: 'Users', icon: <PeopleIcon /> },
  { id: 'orders', text: 'Orders', icon: <OrdersIcon /> },
  { id: 'statistics', text: 'Statistics', icon: <StatisticsIcon /> },
  { id: 'settings', text: 'Settings', icon: <SettingsIcon /> },
];

const AdminLayout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Current active tab state - passed to outlet context
  const [activeTab, setActiveTab] = useState('dashboard');

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
    navigate('/auth/login');
  };

  // Handle menu item click - set active tab instead of navigating
  const handleMenuItemClick = (tabId) => {
    setActiveTab(tabId);
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
          backgroundColor: '#1a237e',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
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
            SongTao ADS Admin
          </Typography>
          
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton 
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar 
              sx={{ 
                width: 35, 
                height: 35,
                bgcolor: '#e8eaf6',
                color: '#1a237e',
              }}
            >
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: '45px' }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); setActiveTab('profile'); }}>Profile</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); setActiveTab('settings'); }}>Settings</MenuItem>
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
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ 
          overflow: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          py: 2
        }}>
          {!isMobile && (
            <Box display="flex" justifyContent="flex-end" px={1}>
              <IconButton onClick={handleDrawerToggle}>
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          )}
          
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton 
                  sx={{
                    borderRadius: '0 24px 24px 0',
                    mr: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.16)',
                    },
                  }}
                  selected={activeTab === item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40,
                    color: activeTab === item.id ? '#1a237e' : 'text.secondary'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: activeTab === item.id ? 600 : 400,
                      color: activeTab === item.id ? '#1a237e' : 'text.primary'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mt: 'auto' }}>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LogoutIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error.main' }} />
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
          backgroundColor: '#f9fafc',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {/* Pass the active tab to the Outlet context */}
        <Outlet context={{ activeTab }} />
      </Box>
    </Box>
  );
};

export default AdminLayout;