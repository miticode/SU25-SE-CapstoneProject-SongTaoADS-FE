import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
  Button,
  Box,
  Popover,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as TasksIcon,
  Group as TeamIcon,
  Refresh as RefreshIcon,
  CheckCircle as CompletedIcon,
  LocalShipping as ShippingIcon,
  CalendarToday as CalendarIcon,
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
import {
  fetchStaffDashboard,
  fetchStaffOrdersStats,
  selectStaffDashboard,
  selectOrdersStats,
  selectDashboardStatus,
  selectOrdersStatsStatus,
  selectDashboardError,
  selectOrdersStatsError,
  selectDashboardLastUpdated,
  selectOrdersStatsLastUpdated
} from "../../store/features/dashboard/dashboardSlice";
import TicketManager from "./TicketManager";
// ChatBotTopicManager đã được tích hợp vào ManagerFineTuneAI.jsx

// Mock data for manager dashboard (keeping only what's still used)
const teamPerformanceData = [
  { month: "Jan", completed: 85, inProgress: 15 },
  { month: "Feb", completed: 78, inProgress: 22 },
  { month: "Mar", completed: 92, inProgress: 8 },
  { month: "Apr", completed: 88, inProgress: 12 },
  { month: "May", completed: 95, inProgress: 5 },
  { month: "Jun", completed: 90, inProgress: 10 },
];

const ManagerDashboard = () => {
  const { activeTab } = useOutletContext();
  const dispatch = useDispatch();
  
  // Redux selectors for dashboard data
  const dashboardData = useSelector(selectStaffDashboard);
  const ordersStats = useSelector(selectOrdersStats);
  const dashboardStatus = useSelector(selectDashboardStatus);
  const ordersStatsStatus = useSelector(selectOrdersStatsStatus);
  const dashboardError = useSelector(selectDashboardError);
  const ordersStatsError = useSelector(selectOrdersStatsError);
  const lastUpdated = useSelector(selectDashboardLastUpdated);
  const ordersStatsLastUpdated = useSelector(selectOrdersStatsLastUpdated);
  
  const [timeFilter, setTimeFilter] = useState("weekly");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  // Helper function to calculate date range based on time filter
  const getDateRangeForFilter = (filter) => {
    const now = new Date();
    const endDate = now.toISOString();
    let startDate;

    switch (filter) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'yearly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    return { startDate, endDate };
  };

  // Function to fetch orders stats based on date range
  const fetchOrdersStatsForDateRange = useCallback((start, end) => {
    const startDate = new Date(start + 'T00:00:00.000Z').toISOString();
    const endDate = new Date(end + 'T23:59:59.999Z').toISOString();
    dispatch(fetchStaffOrdersStats({ startDate, endDate }));
  }, [dispatch]);

  // Function to fetch orders stats based on time filter
  const fetchOrdersStatsForTimeFilter = useCallback((filter) => {
    const { startDate, endDate } = getDateRangeForFilter(filter);
    dispatch(fetchStaffOrdersStats({ startDate, endDate }));
  }, [dispatch]);

  // Handle date picker
  const handleDatePickerOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setTempDateRange(dateRange);
  };

  const handleDatePickerClose = () => {
    setAnchorEl(null);
  };

  const handleDateRangeApply = () => {
    setDateRange(tempDateRange);
    setTimeFilter('custom');
    fetchOrdersStatsForDateRange(tempDateRange.start, tempDateRange.end);
    setAnchorEl(null);
  };

  const handleQuickDateFilter = (filter) => {
    setTimeFilter(filter);
    const { startDate, endDate } = getDateRangeForFilter(filter);
    const start = startDate.split('T')[0];
    const end = endDate.split('T')[0];
    setDateRange({ start, end });
    fetchOrdersStatsForTimeFilter(filter);
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    dispatch(fetchStaffDashboard());
    // Fetch orders stats for initial time filter
    fetchOrdersStatsForTimeFilter(timeFilter);
  }, [dispatch, timeFilter, fetchOrdersStatsForTimeFilter]);

  // Handle refresh dashboard data
  const handleRefreshDashboard = () => {
    dispatch(fetchStaffDashboard());
    fetchOrdersStatsForTimeFilter(timeFilter);
  };

  const handleTimeFilterChange = (event) => {
    const newFilter = event.target.value;
    handleQuickDateFilter(newFilter);
  };

  // Transform orders stats data for charts
  const getOrdersChartData = () => {
    if (!ordersStats || ordersStatsStatus === 'loading') {
      return [];
    }

    return [
      {
        name: "Đang sản xuất",
        value: ordersStats.producing || 0,
        color: "#f59e0b"
      },
      {
        name: "Hoàn thành SX",
        value: ordersStats.productionCompleted || 0,
        color: "#3b82f6"
      },
      {
        name: "Đang giao",
        value: ordersStats.delivering || 0,
        color: "#8b5cf6"
      },
      {
        name: "Đã lắp đặt",
        value: ordersStats.installed || 0,
        color: "#10b981"
      },
      {
        name: "Hoàn thành",
        value: ordersStats.orderCompleted || 0,
        color: "#06b6d4"
      },
      {
        name: "Đã hủy",
        value: ordersStats.cancelled || 0,
        color: "#ef4444"
      }
    ];
  };

  // Get orders stats for bar chart
  const getOrdersBarChartData = () => {
    if (!ordersStats || ordersStatsStatus === 'loading') {
      return [];
    }

    const timeLabel = timeFilter === 'daily' ? 'Hôm nay' : 
                     timeFilter === 'weekly' ? '7 ngày qua' :
                     timeFilter === 'monthly' ? '30 ngày qua' : 
                     timeFilter === 'yearly' ? 'Năm qua' :
                     timeFilter === 'custom' ? `${dateRange.start} - ${dateRange.end}` : '7 ngày qua';

    return [
      {
        period: timeLabel,
        producing: ordersStats.producing || 0,
        productionCompleted: ordersStats.productionCompleted || 0,
        delivering: ordersStats.delivering || 0,
        installed: ordersStats.installed || 0,
        completed: ordersStats.orderCompleted || 0,
        cancelled: ordersStats.cancelled || 0
      }
    ];
  };

  // Dashboard Content
  const renderDashboardContent = () => (
    <div className="p-6 min-h-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <Typography variant="h4" className="!font-bold !text-gray-800 !mb-2">
              📊 Manager Dashboard
            </Typography>
            <Typography variant="body1" className="!text-gray-600">
              Tổng quan quản lý và theo dõi hiệu suất
            </Typography>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {lastUpdated && (
              <Typography variant="body2" className="!text-gray-500 !text-sm">
                Cập nhật: {new Date(lastUpdated).toLocaleString('vi-VN')}
              </Typography>
            )}
            <div className="flex items-center gap-2">
              <FormControl variant="outlined" size="small" className="!min-w-[120px]">
                <InputLabel id="time-filter-label">Thời gian</InputLabel>
                <Select
                  labelId="time-filter-label"
                  value={timeFilter}
                  onChange={handleTimeFilterChange}
                  label="Thời gian"
                  className="!rounded-xl"
                >
                  <MenuItem value="daily">Hàng ngày</MenuItem>
                  <MenuItem value="weekly">Hàng tuần</MenuItem>
                  <MenuItem value="monthly">Hàng tháng</MenuItem>
                  <MenuItem value="yearly">Hàng năm</MenuItem>
                  <MenuItem value="custom">Tùy chọn</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={handleDatePickerOpen}
                className="!min-w-[140px] !rounded-xl !border-gray-300 !text-gray-700 hover:!border-blue-500 hover:!text-blue-600"
                size="small"
              >
                {timeFilter === 'custom' ? 'Chọn ngày' : 'Lịch'}
              </Button>
              
              <button
                onClick={handleRefreshDashboard}
                disabled={dashboardStatus === 'loading'}
                className="w-10 h-10 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-600 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshIcon className={dashboardStatus === 'loading' ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {(dashboardError || ordersStatsError) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            {dashboardError && (
              <Typography className="!text-red-700 !mb-2">Dashboard: {dashboardError}</Typography>
            )}
            {ordersStatsError && (
              <Typography className="!text-red-700">Orders Stats: {ordersStatsError}</Typography>
            )}
          </div>
        )}
      </div>

      {/* Date Range Picker Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleDatePickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          className: '!rounded-2xl !shadow-xl !border !border-gray-200 !mt-2'
        }}
      >
        <Box className="p-6 min-w-[320px]">
          <Typography variant="h6" className="!font-semibold !text-gray-800 !mb-4">
            🗓️ Chọn khoảng thời gian
          </Typography>
          
          <div className="space-y-4 mb-6">
            <div>
              <Typography variant="body2" className="!text-gray-600 !mb-2 !font-medium">
                Từ ngày
              </Typography>
              <TextField
                type="date"
                value={tempDateRange.start}
                onChange={(e) => setTempDateRange(prev => ({ ...prev, start: e.target.value }))}
                fullWidth
                size="small"
                className="!rounded-xl"
                InputProps={{
                  className: '!rounded-xl'
                }}
              />
            </div>
            
            <div>
              <Typography variant="body2" className="!text-gray-600 !mb-2 !font-medium">
                Đến ngày
              </Typography>
              <TextField
                type="date"
                value={tempDateRange.end}
                onChange={(e) => setTempDateRange(prev => ({ ...prev, end: e.target.value }))}
                fullWidth
                size="small"
                className="!rounded-xl"
                InputProps={{
                  className: '!rounded-xl'
                }}
              />
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="mb-6">
            <Typography variant="body2" className="!text-gray-600 !mb-3 !font-medium">
              Chọn nhanh
            </Typography>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const now = new Date();
                  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  const end = now.toISOString().split('T')[0];
                  setTempDateRange({ start, end });
                }}
                className="!rounded-lg !border-gray-300 !text-gray-700 hover:!border-blue-500 hover:!text-blue-600"
              >
                Hôm qua
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const now = new Date();
                  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  const end = now.toISOString().split('T')[0];
                  setTempDateRange({ start, end });
                }}
                className="!rounded-lg !border-gray-300 !text-gray-700 hover:!border-blue-500 hover:!text-blue-600"
              >
                7 ngày
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const now = new Date();
                  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  const end = now.toISOString().split('T')[0];
                  setTempDateRange({ start, end });
                }}
                className="!rounded-lg !border-gray-300 !text-gray-700 hover:!border-blue-500 hover:!text-blue-600"
              >
                30 ngày
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const now = new Date();
                  const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  const end = now.toISOString().split('T')[0];
                  setTempDateRange({ start, end });
                }}
                className="!rounded-lg !border-gray-300 !text-gray-700 hover:!border-blue-500 hover:!text-blue-600"
              >
                3 tháng
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outlined"
              onClick={handleDatePickerClose}
              className="!flex-1 !rounded-xl !border-gray-300 !text-gray-700 hover:!border-red-500 hover:!text-red-600"
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleDateRangeApply}
              className="!flex-1 !rounded-xl !bg-blue-600 hover:!bg-blue-700 !shadow-lg hover:!shadow-xl"
            >
              Áp dụng
            </Button>
          </div>
        </Box>
      </Popover>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {/* Đơn hàng đang sản xuất */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <TasksIcon className="!text-orange-600" />
            </div>
            {dashboardStatus === 'loading' && (
              <CircularProgress size={20} className="!text-orange-600" />
            )}
          </div>
          <div className="space-y-2">
            <Typography variant="h4" className="!font-bold !text-orange-600">
              {dashboardStatus === 'loading' ? '...' : dashboardData.totalProducingOrder?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Đơn hàng đang sản xuất
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-orange-50 rounded-full opacity-20"></div>
        </div>

        {/* Đơn hàng hoàn thành sản xuất */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShippingIcon className="!text-blue-600" />
            </div>
            {dashboardStatus === 'loading' && (
              <CircularProgress size={20} className="!text-blue-600" />
            )}
          </div>
          <div className="space-y-2">
            <Typography variant="h4" className="!font-bold !text-blue-600">
              {dashboardStatus === 'loading' ? '...' : dashboardData.totalProductionCompletedOrder?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Đơn hàng hoàn thành sản xuất
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-50 rounded-full opacity-20"></div>
        </div>

        {/* Đơn hàng đang giao */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ShippingIcon className="!text-purple-600" />
            </div>
            {dashboardStatus === 'loading' && (
              <CircularProgress size={20} className="!text-purple-600" />
            )}
          </div>
          <div className="space-y-2">
            <Typography variant="h4" className="!font-bold !text-purple-600">
              {dashboardStatus === 'loading' ? '...' : dashboardData.totalDeliveringOrder?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Đơn hàng đang giao
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-purple-50 rounded-full opacity-20"></div>
        </div>

        {/* Đơn hàng đã lắp đặt */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CompletedIcon className="!text-emerald-600" />
            </div>
            {dashboardStatus === 'loading' && (
              <CircularProgress size={20} className="!text-emerald-600" />
            )}
          </div>
          <div className="space-y-2">
            <Typography variant="h4" className="!font-bold !text-emerald-600">
              {dashboardStatus === 'loading' ? '...' : dashboardData.totalInstalledOrder?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Đơn hàng đã lắp đặt
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-emerald-50 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {/* Tổng đơn hàng */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <TasksIcon className="!text-indigo-600" />
            </div>
            {dashboardStatus === 'loading' && (
              <CircularProgress size={20} className="!text-indigo-600" />
            )}
          </div>
          <div className="space-y-2">
            <Typography variant="h4" className="!font-bold !text-indigo-600">
              {dashboardStatus === 'loading' ? '...' : dashboardData.totalOrder?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Tổng đơn hàng
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-indigo-50 rounded-full opacity-20"></div>
        </div>

        {/* Loại sản phẩm */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <PeopleIcon className="!text-pink-600" />
            </div>
            {dashboardStatus === 'loading' && (
              <CircularProgress size={20} className="!text-pink-600" />
            )}
          </div>
          <div className="space-y-2">
            <Typography variant="h4" className="!font-bold !text-pink-600">
              {dashboardStatus === 'loading' ? '...' : dashboardData.totalProductType?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Loại sản phẩm
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-pink-50 rounded-full opacity-20"></div>
        </div>

        {/* Nhà thầu */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <TeamIcon className="!text-teal-600" />
            </div>
            {dashboardStatus === 'loading' && (
              <CircularProgress size={20} className="!text-teal-600" />
            )}
          </div>
          <div className="space-y-2">
            <Typography variant="h4" className="!font-bold !text-teal-600">
              {dashboardStatus === 'loading' ? '...' : dashboardData.totalContractor?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Tổng nhà thầu
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-teal-50 rounded-full opacity-20"></div>
        </div>

        {/* Doanh thu */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingUpIcon className="!text-yellow-600" />
            </div>
            {dashboardStatus === 'loading' && (
              <CircularProgress size={20} className="!text-yellow-600" />
            )}
          </div>
          <div className="space-y-2">
            <Typography variant="h4" className="!font-bold !text-yellow-600">
              {dashboardStatus === 'loading' ? '...' : (dashboardData.totalRevenue?.toLocaleString() || '0') + ' VNĐ'}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Tổng doanh thu
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-yellow-50 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        {/* Orders Status Overview Chart */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 h-full hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <Typography variant="h5" className="!font-bold !text-gray-800 !mb-1">
                      Orders Status Overview
                    </Typography>
                    <Typography variant="body2" className="!text-gray-500">
                      Tổng quan trạng thái đơn hàng theo thời gian
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {ordersStatsLastUpdated && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <Typography variant="body2" className="!text-gray-600 !text-xs !font-medium">
                        Cập nhật: {new Date(ordersStatsLastUpdated).toLocaleString('vi-VN')}
                      </Typography>
                    </div>
                  )}
                  {ordersStatsStatus === 'loading' && (
                    <div className="bg-blue-50 rounded-lg p-2">
                      <CircularProgress size={16} className="!text-blue-600" />
                    </div>
                  )}
                  <button className="w-10 h-10 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all duration-200 hover:shadow-md">
                    <MoreVertIcon />
                  </button>
                </div>
              </div>
              
              <div className="h-96 lg:h-[400px] relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 to-transparent rounded-xl"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getOrdersBarChartData()}
                    margin={{
                      top: 20,
                      right: 40,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <defs>
                      <linearGradient id="producingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="deliveringGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="installedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="finishedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="cancelledGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke="#e5e7eb" 
                      strokeOpacity={0.5}
                    />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }} 
                      width={50}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        fontSize: 13, 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        backgroundColor: '#ffffff',
                        backdropFilter: 'blur(10px)'
                      }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        fontSize: 13, 
                        fontWeight: 500,
                        paddingTop: '20px'
                      }} 
                    />
                    <Bar
                      dataKey="producing"
                      fill="url(#producingGradient)"
                      radius={[6, 6, 0, 0]}
                      name="Đang sản xuất"
                    />
                    <Bar
                      dataKey="productionCompleted"
                      fill="url(#completedGradient)"
                      radius={[6, 6, 0, 0]}
                      name="Hoàn thành SX"
                    />
                    <Bar
                      dataKey="delivering"
                      fill="url(#deliveringGradient)"
                      radius={[6, 6, 0, 0]}
                      name="Đang giao"
                    />
                    <Bar
                      dataKey="installed"
                      fill="url(#installedGradient)"
                      radius={[6, 6, 0, 0]}
                      name="Đã lắp đặt"
                    />
                    <Bar
                      dataKey="completed"
                      fill="url(#finishedGradient)"
                      radius={[6, 6, 0, 0]}
                      name="Hoàn thành"
                    />
                    <Bar
                      dataKey="cancelled"
                      fill="url(#cancelledGradient)"
                      radius={[6, 6, 0, 0]}
                      name="Đã hủy"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Distribution Pie Chart */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 h-full hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🥧</span>
                  </div>
                  <div>
                    <Typography variant="h6" className="!font-bold !text-gray-800 !mb-1">
                      Orders Distribution
                    </Typography>
                    <Typography variant="body2" className="!text-gray-500 !text-sm">
                      Phân bổ đơn hàng
                    </Typography>
                  </div>
                </div>
                <button className="w-10 h-10 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all duration-200 hover:shadow-md">
                  <MoreVertIcon />
                </button>
              </div>
              
              <div className="h-72 flex justify-center items-center relative">
                {ordersStatsStatus === 'loading' ? (
                  <div className="flex flex-col items-center gap-3">
                    <CircularProgress size={50} className="!text-purple-600" />
                    <Typography variant="body2" className="!text-gray-500 !font-medium">
                      Đang tải dữ liệu...
                    </Typography>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {getOrdersChartData().map((entry, index) => (
                          <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.5}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={getOrdersChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ percent, value }) => value > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                        labelLine={false}
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {getOrdersChartData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#pieGradient${index})`}
                            className="hover:opacity-80 transition-opacity duration-200"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              {/* Legend */}
              <div className="mt-6">
                <div className="grid grid-cols-2 gap-3">
                  {getOrdersChartData().map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <Typography variant="body2" className="!text-xs !text-gray-700 !font-medium !truncate">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" className="!text-xs !font-bold !text-gray-900">
                          {item.value.toLocaleString()}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Team Management Content
  const renderTeamContent = () => (
    <div className="p-6 min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Typography variant="h4" className="!font-bold !text-gray-800 !mb-2">
            👥 Team Management
          </Typography>
          <Typography variant="body1" className="!text-gray-600">
            Quản lý thành viên trong nhóm
          </Typography>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <Typography variant="h6" className="!font-semibold !text-gray-800 !mb-2">
          Team Management
        </Typography>
        <Typography variant="body2" className="!text-gray-600 !mb-6">
          This feature is coming soon...
        </Typography>
      </div>
    </div>
  );

  // Task Management Content
  const renderTasksContent = () => (
    <div className="p-6 min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Typography variant="h4" className="!font-bold !text-gray-800 !mb-2">
            📋 Task Management
          </Typography>
          <Typography variant="body1" className="!text-gray-600">
            Quản lý và theo dõi các nhiệm vụ
          </Typography>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <Typography variant="h6" className="!font-semibold !text-gray-800 !mb-2">
          Task Management
        </Typography>
        <Typography variant="body2" className="!text-gray-600 !mb-6">
          This feature is coming soon...
        </Typography>
      </div>
    </div>
  );

  // Statistics Content
  const renderStatisticsContent = () => (
    <div className="p-6 min-h-full">
      <div className="mb-8">
        <Typography variant="h4" className="!font-bold !text-gray-800 !mb-2">
          📊 Team Analytics & Statistics
        </Typography>
        <Typography variant="body1" className="!text-gray-600">
          Phân tích và thống kê hiệu suất nhóm
        </Typography>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h6" className="!font-semibold !text-gray-800">
              📈 Team Performance Trend
            </Typography>
            <FormControl variant="outlined" size="small" className="!min-w-[120px]">
              <InputLabel>Period</InputLabel>
              <Select label="Period" defaultValue="year">
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={teamPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="Completed Tasks"
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="In Progress Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Content
  const renderSettingsContent = () => (
    <div className="p-6 min-h-full">
      <div className="mb-8">
        <Typography variant="h4" className="!font-bold !text-gray-800 !mb-2">
          ⚙️ Team Settings
        </Typography>
        <Typography variant="body1" className="!text-gray-600">
          Cấu hình cài đặt cho nhóm
        </Typography>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <Typography variant="h6" className="!font-semibold !text-gray-800 !mb-2">
          General Settings
        </Typography>
        <Typography variant="body2" className="!text-gray-600 !mb-6">
          Configure team-wide settings and preferences
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Team Name"
              defaultValue="Design Team"
              variant="outlined"
              className="!mb-4"
            />
            <TextField
              fullWidth
              label="Team Lead"
              defaultValue="John Doe"
              variant="outlined"
              className="!mb-4"
            />
            <TextField
              fullWidth
              label="Team Email"
              defaultValue="team@songtaoads.com"
              variant="outlined"
            />
          </div>
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Department"
              defaultValue="Design Department"
              variant="outlined"
              className="!mb-4"
            />
            <TextField
              fullWidth
              label="Team Description"
              defaultValue="Responsible for all design-related tasks and projects"
              variant="outlined"
              multiline
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  // Render different content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      case "team":
        return renderTeamContent();
      case "tasks":
        return renderTasksContent();
      case "statistics":
        return renderStatisticsContent();
      case "settings":
        return renderSettingsContent();
      case "support-ticket":
        return <TicketManager />;
      case "chat-bot-topic":
        return (
          <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            <div className="mb-8">
              <Typography variant="h4" className="!font-bold !text-gray-800 !mb-2">
                🤖 ChatBot Topic Management
              </Typography>
              <Typography variant="body1" className="!text-gray-600">
                Tính năng này đã được tích hợp vào trang "Quản lý Chatbot - Tinh chỉnh Model AI & RAG"
              </Typography>
              <Typography variant="body2" className="!text-gray-500 !mt-2">
                Vui lòng sử dụng tab "Quản lý Topic của Model Chat" trong trang đó.
              </Typography>
            </div>
          </div>
        );
      default:
        return renderDashboardContent();
    }
  };

  return renderContent();
};

export default ManagerDashboard;
