import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminDashboard } from "../../store/features/dashboard/dashboardSlice";
import { useOutletContext } from "react-router-dom";
import Grid from "@mui/material/Grid";
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

const COLORS = ["#4caf50", "#2196f3", "#f44336"];

const recentOrders = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    date: "2025-05-28",
    status: "Đã Hoàn Thành",
    amount: "299.99đ",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    date: "2025-05-27",
    status: "Đang Xử Lý",
    amount: "149.50đ",
  },
  {
    id: "#ORD-003",
    customer: "Michael Johnson",
    date: "2025-05-26",
    status: "Đã Hoàn Thành",
    amount: "499.99đ",
  },
  {
    id: "#ORD-004",
    customer: "Emily Davis",
    date: "2025-05-26",
    status: "Đã Hủy",
    amount: "89.99đ",
  },
];

const topSellingProducts = [
  {
    id: 1,
    name: "Thiết Kế Billboard Premium",
    sold: 45,
    revenue: "13.500.000đ",
  },
  { id: 2, name: "Gói Mạng Xã Hội", sold: 39, revenue: "7.800.000đ" },
  { id: 3, name: "Thiết Kế Logo Pro", sold: 36, revenue: "5.400.000đ" },
  { id: 4, name: "Bộ Nhận Diện Thương Hiệu", sold: 28, revenue: "8.400.000đ" },
];

// Mock orders data with more details
const ordersData = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    date: "2025-05-28",
    status: "Đã Hoàn Thành",
    amount: "299.99đ",
    items: 2,
    paymentMethod: "Thẻ Tín Dụng",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    date: "2025-05-27",
    status: "Đang Xử Lý",
    amount: "149.50đ",
    items: 1,
    paymentMethod: "PayPal",
  },
  {
    id: "#ORD-003",
    customer: "Michael Johnson",
    date: "2025-05-26",
    status: "Đã Hoàn Thành",
    amount: "499.99đ",
    items: 3,
    paymentMethod: "Thẻ Tín Dụng",
  },
  {
    id: "#ORD-004",
    customer: "Emily Davis",
    date: "2025-05-26",
    status: "Đã Hủy",
    amount: "89.99đ",
    items: 1,
    paymentMethod: "Chuyển Khoản Ngân Hàng",
  },
  {
    id: "#ORD-005",
    customer: "David Wilson",
    date: "2025-05-25",
    status: "Đã Hoàn Thành",
    amount: "199.99đ",
    items: 2,
    paymentMethod: "PayPal",
  },
  {
    id: "#ORD-006",
    customer: "Sarah Brown",
    date: "2025-05-25",
    status: "Đang Xử Lý",
    amount: "349.99đ",
    items: 2,
    paymentMethod: "Thẻ Tín Dụng",
  },
  {
    id: "#ORD-007",
    customer: "Robert Miller",
    date: "2025-05-24",
    status: "Đã Hoàn Thành",
    amount: "129.99đ",
    items: 1,
    paymentMethod: "Thẻ Tín Dụng",
  },
  {
    id: "#ORD-008",
    customer: "Jennifer Garcia",
    date: "2025-05-24",
    status: "Đã Hủy",
    amount: "79.99đ",
    items: 1,
    paymentMethod: "PayPal",
  },
];

const AdminDashboard = () => {
  // Get active tab from outlet context
  const { activeTab } = useOutletContext();
  const [timeFilter, setTimeFilter] = useState("weekly");
  const [ordersTabValue, setOrdersTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  
  const dispatch = useDispatch();

  // Admin dashboard data
  const {
    adminDashboard,
    status: dashboardStatus,
    error: dashboardError,
  } = useSelector((state) => state.dashboard);

  // Fetch admin dashboard data when component mounts or when dashboard tab is active
  useEffect(() => {
    if (activeTab === "dashboard") {
      dispatch(fetchAdminDashboard());
    }
  }, [activeTab, dispatch]);

  // Generate revenue data based on API data
  const getRevenueData = () => {
    if (dashboardStatus === "loading" || !adminDashboard) {
      return [
        { month: "Jan", revenue: 0 },
        { month: "Feb", revenue: 0 },
        { month: "Mar", revenue: 0 },
        { month: "Apr", revenue: 0 },
        { month: "May", revenue: 0 },
        { month: "Jun", revenue: 0 },
      ];
    }

    const totalRevenue = adminDashboard.totalRevenue || 0;
    const monthlyAverage = Math.round(totalRevenue / 6);

    return [
      { month: "Jan", revenue: Math.round(monthlyAverage * 0.8) },
      { month: "Feb", revenue: Math.round(monthlyAverage * 0.6) },
      { month: "Mar", revenue: Math.round(monthlyAverage * 1.0) },
      { month: "Apr", revenue: Math.round(monthlyAverage * 0.9) },
      { month: "May", revenue: Math.round(monthlyAverage * 1.2) },
      { month: "Jun", revenue: Math.round(monthlyAverage * 1.1) },
    ];
  };

  // Calculate order status data from API
  const getOrderStatusData = () => {
    if (dashboardStatus === "loading" || !adminDashboard) {
      return [
        { name: "Đã Hoàn Thành", value: 0 },
        { name: "Đang Xử Lý", value: 0 },
        { name: "Đã Hủy", value: 0 },
      ];
    }

    const total = adminDashboard.totalOrders || 0;
    const completed = adminDashboard.completedOrders || 0;
    const inProgress = total - completed;

    return [
      {
        name: "Đã Hoàn Thành",
        value: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      {
        name: "Đang Xử Lý",
        value: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      },
      { name: "Đã Hủy", value: 0 }, // API không có dữ liệu này
    ];
  };

  const revenueData = getRevenueData();
  const orderStatusData = getOrderStatusData();
  
  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
  };

  const handleOrdersTabChange = (event, newValue) => {
    setOrdersTabValue(newValue);
  };

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
          Tổng Quan Dashboard
        </Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="time-filter-label">Thời Gian</InputLabel>
          <Select
            labelId="time-filter-label"
            value={timeFilter}
            onChange={handleTimeFilterChange}
            label="Thời Gian"
          >
            <MenuItem value="daily">Hàng Ngày</MenuItem>
            <MenuItem value="weekly">Hàng Tuần</MenuItem>
            <MenuItem value="monthly">Hàng Tháng</MenuItem>
            <MenuItem value="yearly">Hàng Năm</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Dashboard Error Alert */}
      {dashboardError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {dashboardError}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 2 : 3} mb={isMobile ? 2 : 4}>
        {/* Revenue Card */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
              {dashboardStatus === "loading" ? (
                <CircularProgress size={20} />
              ) : (
                `${adminDashboard.totalRevenue?.toLocaleString() || "0"}đ`
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng Doanh Thu
            </Typography>
          </Paper>
        </Grid>

        {/* Users Card */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
              {dashboardStatus === "loading" ? (
                <CircularProgress size={20} />
              ) : (
                adminDashboard.totalUsers?.toLocaleString() || "0"
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng Người Dùng
            </Typography>
          </Paper>
        </Grid>

        {/* Orders Card */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
              {dashboardStatus === "loading" ? (
                <CircularProgress size={20} />
              ) : (
                adminDashboard.totalOrders?.toLocaleString() || "0"
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng Đơn Hàng
            </Typography>
          </Paper>
        </Grid>

        {/* Active Contracts Card */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
              {dashboardStatus === "loading" ? (
                <CircularProgress size={20} />
              ) : (
                adminDashboard.activeContracts?.toLocaleString() || "0"
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hợp Đồng Đang Hoạt Động
            </Typography>
          </Paper>
        </Grid>

        {/* Completed Orders Card */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
                backgroundColor: "#00bcd4",
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
                  bgcolor: "rgba(0, 188, 212, 0.15)",
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                }}
              >
                <OrdersIcon
                  sx={{
                    color: "#00bcd4",
                    fontSize: isMobile ? "1.25rem" : "1.5rem",
                  }}
                />
              </Avatar>
              <Box display="flex" alignItems="center">
                <ArrowUpIcon sx={{ color: "#4caf50", fontSize: 16 }} />
                <Typography variant="body2" color="#4caf50" fontWeight="medium">
                  +15.3%
                </Typography>
              </Box>
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="medium"
              my={isMobile ? 0.5 : 1}
            >
              {dashboardStatus === "loading" ? (
                <CircularProgress size={20} />
              ) : (
                adminDashboard.completedOrders?.toLocaleString() || "0"
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đơn Hàng Đã Hoàn Thành
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
                Tổng Quan Doanh Thu
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
                Trạng Thái Đơn Hàng
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
                Đơn Hàng Gần Đây
              </Typography>
              <Button size="small" variant="text">
                Xem Tất Cả
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
                    label="Tất Cả"
                    sx={{
                      fontSize: isMobile ? "0.8rem" : "inherit",
                      minHeight: isMobile ? 42 : 48,
                    }}
                  />
                  <Tab
                    label="Đã Hoàn Thành"
                    sx={{
                      fontSize: isMobile ? "0.8rem" : "inherit",
                      minHeight: isMobile ? 42 : 48,
                    }}
                  />
                  <Tab
                    label="Đang Xử Lý"
                    sx={{
                      fontSize: isMobile ? "0.8rem" : "inherit",
                      minHeight: isMobile ? 42 : 48,
                    }}
                  />
                  <Tab
                    label="Đã Hủy"
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
                                  order.status === "Đã Hoàn Thành"
                                    ? "rgba(76, 175, 80, 0.1)"
                                    : order.status === "Đang Xử Lý"
                                    ? "rgba(33, 150, 243, 0.1)"
                                    : "rgba(244, 67, 54, 0.1)",
                                color:
                                  order.status === "Đã Hoàn Thành"
                                    ? "#4caf50"
                                    : order.status === "Đang Xử Lý"
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
                Sản Phẩm Bán Chạy Nhất
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
                            Đã Bán: {product.sold}
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
                          Đã Bán: {product.sold}
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
          Quản Lý Đơn Hàng
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Tạo Đơn Hàng
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
            placeholder="Tìm kiếm đơn hàng..."
            size="small"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ flexGrow: 1 }}
            fullWidth={isMobile}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Trạng Thái</InputLabel>
            <Select label="Trạng Thái">
              <MenuItem value="all">Tất Cả Trạng Thái</MenuItem>
              <MenuItem value="Đã Hoàn Thành">Đã Hoàn Thành</MenuItem>
              <MenuItem value="Đang Xử Lý">Đang Xử Lý</MenuItem>
              <MenuItem value="Đã Hủy">Đã Hủy</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Khoảng Thời Gian</InputLabel>
            <Select label="Khoảng Thời Gian">
              <MenuItem value="all">Tất Cả Thời Gian</MenuItem>
              <MenuItem value="today">Hôm Nay</MenuItem>
              <MenuItem value="week">7 Ngày Gần Đây</MenuItem>
              <MenuItem value="month">30 Ngày Gần Đây</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="orders table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Mã Đơn Hàng</TableCell>
                <TableCell>Khách Hàng</TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Số Lượng</TableCell>
                <TableCell>Phương Thức Thanh Toán</TableCell>
                <TableCell align="right">Số Tiền</TableCell>
                <TableCell align="center">Hành Động</TableCell>
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
                          order.status === "Đã Hoàn Thành"
                            ? "rgba(76, 175, 80, 0.1)"
                            : order.status === "Đang Xử Lý"
                            ? "rgba(33, 150, 243, 0.1)"
                            : "rgba(244, 67, 54, 0.1)",
                        color:
                          order.status === "Đã Hoàn Thành"
                            ? "#4caf50"
                            : order.status === "Đang Xử Lý"
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

  // Render different content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      case "orders":
        return renderOrdersContent();
      default:
        return renderDashboardContent();
    }
  };

  return (
    <Box>
      {renderContent()}
    </Box>
  );
};

export default AdminDashboard;
