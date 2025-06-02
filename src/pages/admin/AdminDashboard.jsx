import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  setSearchQuery,
  setCurrentPage,
  toggleUserStatus,
} from "../../store/features/user/userSlice";
import { useNavigate, useOutletContext } from "react-router-dom";
import Grid from '@mui/material/Grid';
import {
  Box,
  
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress, // Thêm CircularProgress vào đây
  Alert, // Thêm Alert để hiển thị thông báo lỗi
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PowerSettingsNew as LogoutIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { logout } from "../../store/features/auth/authSlice";

// Mock data
const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
];

const orderStatusData = [
  { name: "Completed", value: 65 },
  { name: "In Progress", value: 25 },
  { name: "Cancelled", value: 10 },
];

const COLORS = ["#4caf50", "#2196f3", "#f44336"];

const recentOrders = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    date: "2025-05-28",
    status: "Completed",
    amount: "$299.99",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    date: "2025-05-27",
    status: "Processing",
    amount: "$149.50",
  },
  {
    id: "#ORD-003",
    customer: "Michael Johnson",
    date: "2025-05-26",
    status: "Completed",
    amount: "$499.99",
  },
  {
    id: "#ORD-004",
    customer: "Emily Davis",
    date: "2025-05-26",
    status: "Cancelled",
    amount: "$89.99",
  },
];

const topSellingProducts = [
  { id: 1, name: "Billboard Design Premium", sold: 45, revenue: "$13,500" },
  { id: 2, name: "Social Media Package", sold: 39, revenue: "$7,800" },
  { id: 3, name: "Logo Design Pro", sold: 36, revenue: "$5,400" },
  { id: 4, name: "Branding Kit Complete", sold: 28, revenue: "$8,400" },
];

// Mock users data
const usersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Customer",
    status: "Active",
    joinDate: "2025-01-15",
  },
];

// Mock orders data with more details
const ordersData = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    date: "2025-05-28",
    status: "Completed",
    amount: "$299.99",
    items: 2,
    paymentMethod: "Credit Card",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    date: "2025-05-27",
    status: "Processing",
    amount: "$149.50",
    items: 1,
    paymentMethod: "PayPal",
  },
  {
    id: "#ORD-003",
    customer: "Michael Johnson",
    date: "2025-05-26",
    status: "Completed",
    amount: "$499.99",
    items: 3,
    paymentMethod: "Credit Card",
  },
  {
    id: "#ORD-004",
    customer: "Emily Davis",
    date: "2025-05-26",
    status: "Cancelled",
    amount: "$89.99",
    items: 1,
    paymentMethod: "Bank Transfer",
  },
  {
    id: "#ORD-005",
    customer: "David Wilson",
    date: "2025-05-25",
    status: "Completed",
    amount: "$199.99",
    items: 2,
    paymentMethod: "PayPal",
  },
  {
    id: "#ORD-006",
    customer: "Sarah Brown",
    date: "2025-05-25",
    status: "Processing",
    amount: "$349.99",
    items: 2,
    paymentMethod: "Credit Card",
  },
  {
    id: "#ORD-007",
    customer: "Robert Miller",
    date: "2025-05-24",
    status: "Completed",
    amount: "$129.99",
    items: 1,
    paymentMethod: "Credit Card",
  },
  {
    id: "#ORD-008",
    customer: "Jennifer Garcia",
    date: "2025-05-24",
    status: "Cancelled",
    amount: "$79.99",
    items: 1,
    paymentMethod: "PayPal",
  },
];

const AdminDashboard = () => {
  // Get active tab from outlet context
  const { activeTab } = useOutletContext();
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("weekly");
  const [ordersTabValue, setOrdersTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("xl"));
  const navigate = useNavigate();
  // Users table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const {
    users,
    status: usersStatus,
    error: usersError,
    currentPage,
    totalPages,
    searchQuery,
  } = useSelector((state) => state.users);
  const loadUsers = () => {
    // Xử lý lỗi CORS bằng cách sử dụng proxy trong development
    // Nếu có lỗi CORS, hãy sử dụng một middleware proxy ở server hoặc sử dụng một proxy trong development
    dispatch(
      fetchUsers({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      })
    );
  };
  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab, currentPage, rowsPerPage, searchTerm]);
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    dispatch(setSearchQuery(value));

    // Đặt lại về trang 1 khi tìm kiếm
    setPage(0);
    dispatch(setCurrentPage(1));

    // Load users sau khi tìm kiếm
    setTimeout(() => {
      loadUsers();
    }, 500);
  };
  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
  };

  const handleOrdersTabChange = (event, newValue) => {
    setOrdersTabValue(newValue);
  };
  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
  };
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    dispatch(setCurrentPage(newPage + 1));
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearch = () => {
    setPage(0);
    dispatch(setCurrentPage(1));
    loadUsers();
  };
  const handleToggleUserStatus = (userId, currentStatus) => {
    dispatch(toggleUserStatus({ userId, isActive: !currentStatus }))
      .then(() => {
        // Hiển thị thông báo thành công
        // enqueueSnackbar('User status updated successfully', { variant: 'success' });
        loadUsers(); // Reload users sau khi cập nhật status
      })
      .catch(() => {
        // Hiển thị thông báo lỗi
        // enqueueSnackbar('Failed to update user status', { variant: 'error' });
      });
  };
  const handleLogout = async () => {
  try {
    console.log("Logout button clicked");
    
    // Đợi API logout hoàn thành
    await dispatch(logout()).unwrap();
    
    // Không cần xóa token ở đây vì đã được xử lý trong reducer
    
    // Sử dụng window.location thay vì navigate để đảm bảo trang được load lại hoàn toàn
    window.location.href = '/auth/login';
  } catch (error) {
    console.error("Logout error:", error);
    
    // Nếu có lỗi, vẫn chuyển hướng người dùng
    window.location.href = '/auth/login';
  }
};
  // Filter users based on search term
  const useMockData = usersStatus === "failed" || !users || users.length === 0;
  const displayUsers = useMockData
    ? usersData.filter(
        (user) =>
          (searchTerm === "" ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (roleFilter === "all" || user.role === roleFilter) &&
          (statusFilter === "all" || user.status === statusFilter)
      )
    : users;

  // Dashboard Content
  const renderDashboardContent = () => (
    <Box>
      {/* Header Section */}
      <Box
        mb={3}
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "flex-start" : "center"}
        gap={isMobile ? 2 : 0}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          color="text.primary"
        >
          Dashboard Overview
        </Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="time-filter-label">Time Period</InputLabel>
          <Select
            labelId="time-filter-label"
            value={timeFilter}
            onChange={handleTimeFilterChange}
            label="Time Period"
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 2 : 3} mb={isMobile ? 2 : 4}>
        {/* Revenue Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 1.5 : 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                backgroundColor: "#4caf50",
              },
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={1}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(76, 175, 80, 0.15)",
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                }}
              >
                <RevenueIcon
                  sx={{
                    color: "#4caf50",
                    fontSize: isMobile ? "1.25rem" : "1.5rem",
                  }}
                />
              </Avatar>
              <Box display="flex" alignItems="center">
                <ArrowUpIcon sx={{ color: "#4caf50", fontSize: 16 }} />
                <Typography variant="body2" color="#4caf50" fontWeight="medium">
                  +12.5%
                </Typography>
              </Box>
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="medium"
              my={isMobile ? 0.5 : 1}
            >
              $24,780
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
          </Paper>
        </Grid>

        {/* Users Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 1.5 : 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                backgroundColor: "#2196f3",
              },
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={1}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(33, 150, 243, 0.15)",
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                }}
              >
                <PeopleIcon
                  sx={{
                    color: "#2196f3",
                    fontSize: isMobile ? "1.25rem" : "1.5rem",
                  }}
                />
              </Avatar>
              <Box display="flex" alignItems="center">
                <ArrowUpIcon sx={{ color: "#4caf50", fontSize: 16 }} />
                <Typography variant="body2" color="#4caf50" fontWeight="medium">
                  +5.2%
                </Typography>
              </Box>
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="medium"
              my={isMobile ? 0.5 : 1}
            >
              1,240
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </Paper>
        </Grid>

        {/* Orders Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 1.5 : 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                backgroundColor: "#ff9800",
              },
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={1}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(255, 152, 0, 0.15)",
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                }}
              >
                <OrdersIcon
                  sx={{
                    color: "#ff9800",
                    fontSize: isMobile ? "1.25rem" : "1.5rem",
                  }}
                />
              </Avatar>
              <Box display="flex" alignItems="center">
                <ArrowUpIcon sx={{ color: "#4caf50", fontSize: 16 }} />
                <Typography variant="body2" color="#4caf50" fontWeight="medium">
                  +8.4%
                </Typography>
              </Box>
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="medium"
              my={isMobile ? 0.5 : 1}
            >
              560
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Orders
            </Typography>
          </Paper>
        </Grid>

        {/* Conversion Rate Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 1.5 : 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                backgroundColor: "#9c27b0",
              },
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={1}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(156, 39, 176, 0.15)",
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                }}
              >
                <TrendingUpIcon
                  sx={{
                    color: "#9c27b0",
                    fontSize: isMobile ? "1.25rem" : "1.5rem",
                  }}
                />
              </Avatar>
              <Box display="flex" alignItems="center">
                <ArrowDownIcon sx={{ color: "#f44336", fontSize: 16 }} />
                <Typography variant="body2" color="#f44336" fontWeight="medium">
                  -2.1%
                </Typography>
              </Box>
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="medium"
              my={isMobile ? 0.5 : 1}
            >
              18.2%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Conversion Rate
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={isMobile ? 2 : 3} mb={isMobile ? 2 : 4}>
        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 1.5 : 2,
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={isMobile ? 1 : 2}
            >
              <Typography variant="h6" fontWeight="medium">
                Revenue Overview
              </Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box height={isMobile ? 250 : isTablet ? 300 : 350}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 10,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? -20 : 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                  />
                  <YAxis
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                    width={isMobile ? 30 : 40}
                  />
                  <Tooltip contentStyle={{ fontSize: isMobile ? 12 : 14 }} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 12 : 14 }} />
                  <Bar dataKey="revenue" fill="#1a237e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Order Status Chart */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 1.5 : 2,
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={isMobile ? 1 : 2}
            >
              <Typography variant="h6" fontWeight="medium">
                Orders Status
              </Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box
              height={isMobile ? 220 : 300}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 60}
                    outerRadius={isMobile ? 60 : 80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      isMobile
                        ? `${(percent * 100).toFixed(0)}%`
                        : `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={!isMobile}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box mt={isMobile ? 1 : 2}>
              <Grid container spacing={2}>
                {orderStatusData.map((item, index) => (
                  <Grid item xs={4} key={index}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: COLORS[index],
                          borderRadius: "50%",
                          mb: 0.5,
                        }}
                      />
                      <Typography
                        variant="body2"
                        align="center"
                        fontSize={isMobile ? "0.75rem" : "inherit"}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        align="center"
                        fontSize={isMobile ? "0.75rem" : "inherit"}
                      >
                        {item.value}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Recent Orders */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={isMobile ? 2 : 3}
              py={isMobile ? 1.5 : 2}
            >
              <Typography variant="h6" fontWeight="medium">
                Recent Orders
              </Typography>
              <Button size="small" variant="text">
                View All
              </Button>
            </Box>
            <Divider />
            <Box>
              <Box sx={{ overflowX: "auto" }}>
                <Tabs
                  value={ordersTabValue}
                  onChange={handleOrdersTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  sx={{
                    px: isMobile ? 2 : 3,
                    minHeight: isMobile ? 42 : 48,
                  }}
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons={isMobile ? "auto" : false}
                >
                  <Tab
                    label="All"
                    sx={{
                      fontSize: isMobile ? "0.8rem" : "inherit",
                      minHeight: isMobile ? 42 : 48,
                    }}
                  />
                  <Tab
                    label="Completed"
                    sx={{
                      fontSize: isMobile ? "0.8rem" : "inherit",
                      minHeight: isMobile ? 42 : 48,
                    }}
                  />
                  <Tab
                    label="Processing"
                    sx={{
                      fontSize: isMobile ? "0.8rem" : "inherit",
                      minHeight: isMobile ? 42 : 48,
                    }}
                  />
                  <Tab
                    label="Cancelled"
                    sx={{
                      fontSize: isMobile ? "0.8rem" : "inherit",
                      minHeight: isMobile ? 42 : 48,
                    }}
                  />
                </Tabs>
              </Box>
              <Box sx={{ p: 0 }}>
                {recentOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem
                      sx={{
                        px: isMobile ? 2 : 3,
                        py: isMobile ? 1.5 : 2,
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                        },
                      }}
                      secondaryAction={
                        !isMobile && (
                          <Typography variant="body1" fontWeight="medium">
                            {order.amount}
                          </Typography>
                        )
                      }
                    >
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            alignItems="center"
                            flexWrap="wrap"
                            gap={1}
                            mb={isMobile ? 1 : 0}
                          >
                            <Typography
                              variant="body1"
                              fontWeight="medium"
                              sx={{ mr: 1 }}
                            >
                              {order.id}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                backgroundColor:
                                  order.status === "Completed"
                                    ? "rgba(76, 175, 80, 0.1)"
                                    : order.status === "Processing"
                                    ? "rgba(33, 150, 243, 0.1)"
                                    : "rgba(244, 67, 54, 0.1)",
                                color:
                                  order.status === "Completed"
                                    ? "#4caf50"
                                    : order.status === "Processing"
                                    ? "#2196f3"
                                    : "#f44336",
                              }}
                            >
                              {order.status}
                            </Typography>
                          </Box>
                        }
                        // Thay đổi phần này để tránh lồng <p> trong <p>
                        secondaryTypographyProps={{ component: "div" }}
                        secondary={
                          <React.Fragment>
                            {/* Sử dụng Typography với component="div" để không có <p> bọc ngoài */}
                            <Typography
                              component="div"
                              variant="body2"
                              color="text.secondary"
                            >
                              {order.customer}
                            </Typography>
                            <Box
                              component="div"
                              display="flex"
                              justifyContent="space-between"
                              width={isMobile ? "100%" : "auto"}
                              sx={{ mt: isMobile ? 0.5 : 0 }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                              >
                                {order.date}
                              </Typography>
                              {isMobile && (
                                <Typography
                                  variant="body2"
                                  fontWeight="medium"
                                  component="span"
                                >
                                  {order.amount}
                                </Typography>
                              )}
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < recentOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Top Selling Products */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              overflow: "hidden",
              height: "100%",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={isMobile ? 2 : 3}
              py={isMobile ? 1.5 : 2}
            >
              <Typography variant="h6" fontWeight="medium">
                Top Selling Products
              </Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Divider />
            <List disablePadding>
              {topSellingProducts.map((product, index) => (
                <React.Fragment key={product.id}>
                  <ListItem
                    sx={{
                      px: isMobile ? 2 : 3,
                      py: isMobile ? 1.5 : 2,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                      },
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                    }}
                    secondaryAction={
                      !isMobile && (
                        <Box textAlign="right">
                          <Typography variant="body2" fontWeight="medium">
                            {product.revenue}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontSize="0.75rem"
                          >
                            {product.sold} sold
                          </Typography>
                        </Box>
                      )
                    }
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      width="100%"
                      mb={isMobile ? 1 : 0}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          sx={{
                            bgcolor: `hsl(${product.id * 60}, 70%, 90%)`,
                            width: isMobile ? 36 : 40,
                            height: isMobile ? 36 : 40,
                          }}
                        >
                          {product.id}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={product.name}
                        primaryTypographyProps={{
                          fontWeight: "medium",
                          fontSize: isMobile ? "0.9rem" : "inherit",
                        }}
                      />
                    </Box>
                    {isMobile && (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        width="100%"
                        pl={7}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontSize="0.75rem"
                        >
                          {product.sold} sold
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {product.revenue}
                        </Typography>
                      </Box>
                    )}
                  </ListItem>
                  {index < topSellingProducts.length - 1 && (
                    <Divider
                      variant={isMobile ? "fullWidth" : "inset"}
                      component="li"
                    />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Users Management Content
  const renderUsersContent = () => (
    <Box>
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Users Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Add User
        </Button>
      </Box>

      {usersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {usersError || "Failed to connect to API. Showing mock data instead."}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Box
          p={2}
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={2}
          alignItems="center"
        >
          <TextField
            variant="outlined"
            placeholder="Search users..."
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              endAdornment: (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSearch}
                  sx={{ minWidth: "unset", p: "4px 8px" }}
                >
                  Search
                </Button>
              ),
            }}
            sx={{ flexGrow: 1 }}
            fullWidth={isMobile}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={roleFilter}
              onChange={handleRoleFilterChange}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Designer">Designer</MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersStatus === "loading" ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Loading users...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : displayUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            src={user.avatar}
                            sx={{
                              mr: 2,
                              bgcolor: `hsl(${
                                useMockData
                                  ? user.id * 40
                                  : user.id.charCodeAt(0) * 10
                              }, 70%, 75%)`,
                            }}
                          >
                            {(useMockData ? user.name : user.fullName)?.charAt(
                              0
                            ) || "U"}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {useMockData ? user.name : user.fullName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            useMockData
                              ? user.status
                              : user.isActive
                              ? "Active"
                              : "Inactive"
                          }
                          size="small"
                          sx={{
                            backgroundColor: (
                              useMockData
                                ? user.status === "Active"
                                : user.isActive
                            )
                              ? "rgba(76, 175, 80, 0.1)"
                              : "rgba(244, 67, 54, 0.1)",
                            color: (
                              useMockData
                                ? user.status === "Active"
                                : user.isActive
                            )
                              ? "#4caf50"
                              : "#f44336",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handleToggleUserStatus(
                              user.id,
                              useMockData
                                ? user.status === "Active"
                                : user.isActive
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {useMockData
                          ? user.joinDate
                          : new Date(
                              user.createAt || Date.now()
                            ).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" sx={{ mr: 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={displayUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );

  // Orders Management Content
  const renderOrdersContent = () => (
    <Box>
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Orders Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Create Order
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Box
          p={2}
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={2}
          alignItems="center"
        >
          <TextField
            variant="outlined"
            placeholder="Search orders..."
            size="small"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ flexGrow: 1 }}
            fullWidth={isMobile}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status">
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Date Range</InputLabel>
            <Select label="Date Range">
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="orders table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordersData.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          order.status === "Completed"
                            ? "rgba(76, 175, 80, 0.1)"
                            : order.status === "Processing"
                            ? "rgba(33, 150, 243, 0.1)"
                            : "rgba(244, 67, 54, 0.1)",
                        color:
                          order.status === "Completed"
                            ? "#4caf50"
                            : order.status === "Processing"
                            ? "#2196f3"
                            : "#f44336",
                      }}
                    />
                  </TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell align="right">{order.amount}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" sx={{ mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={ordersData.length}
          rowsPerPage={5}
          page={0}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
        />
      </Paper>
    </Box>
  );

  // Statistics Content
  const renderStatisticsContent = () => (
    <Box>
      <Box mb={3}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Analytics & Statistics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" fontWeight="medium">
                Sales Trend
              </Typography>
              <FormControl
                variant="outlined"
                size="small"
                sx={{ minWidth: 120 }}
              >
                <InputLabel>Period</InputLabel>
                <Select label="Period" defaultValue="year">
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="quarter">This Quarter</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1a237e"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Settings Content
  const renderSettingsContent = () => (
    <Box>
      <Box mb={3}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          System Settings
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          mb: 3, // Thêm margin-bottom để tạo khoảng cách với phần Logout
        }}
      >
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Configure system-wide settings and preferences
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Name"
              defaultValue="SongTao ADS"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Support Email"
              defaultValue="support@songtaoads.com"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number"
              defaultValue="+84 123 456 789"
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website URL"
              defaultValue="https://songtaoads.com"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Address"
              defaultValue="123 Le Loi, District 1, Ho Chi Minh City, Vietnam"
              variant="outlined"
              margin="normal"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button variant="contained" color="primary" sx={{ borderRadius: 2 }}>
            Save Changes
          </Button>
        </Box>
      </Paper>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Account Management
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Manage your account settings and session
        </Typography>

        <Box mt={2}>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => {
              console.log("Logout button clicked directly");
              handleLogout();
            }}
            sx={{
              borderRadius: 2,
              position: "relative", // Đảm bảo nút ở trên cùng
              zIndex: 1000, // Đảm bảo không bị element khác che
              border: "2px solid red", // Dễ nhìn để kiểm tra
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  // Render different content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      case "users":
        return renderUsersContent();
      case "orders":
        return renderOrdersContent();
      case "statistics":
        return renderStatisticsContent();
      case "settings":
        return renderSettingsContent();
      default:
        return renderDashboardContent();
    }
  };

  return renderContent();
};

export default AdminDashboard;
