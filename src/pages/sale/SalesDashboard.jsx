import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Button,
  Tooltip,
  IconButton,
  Popover,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import {
  TrendingUp as TrendingUpIcon,
  Assignment as OrderIcon,
  CheckCircle as CompletedIcon,
  HourglassEmpty as InProgressIcon,
  Cancel as CancelledIcon,
  Psychology as AiIcon,
  Brush as CustomIcon,
  DesignServices as DesignIcon,
  AttachMoney as MoneyIcon,
  Receipt as PaymentIcon,
  Description as ContractIcon,
  Feedback as FeedbackIcon,
  SupportAgent as TicketIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as ChartIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  fetchSaleDashboard,
  fetchSaleOrdersStats,
  fetchCustomDesignRequestsStats,
  selectDashboardStatus,
  selectDashboardError,
  selectDashboardLastUpdated,
  selectSaleOrdersStats,
  selectSaleOrdersStatsStatus,
  selectSaleOrdersStatsError,
  selectSaleOrdersStatsLastUpdated,
  selectCustomDesignRequestsStats,
  selectCustomDesignRequestsStatsStatus,
  selectCustomDesignRequestsStatsError,
  selectCustomDesignRequestsStatsLastUpdated,
  // Individual selectors
  selectSaleTotalOrders,
  selectSaleTotalOrderCompleted,
  selectSaleTotalOrderInProgress,
  selectSaleTotalOrderCancelled,
  selectSaleTotalAiDesignOrder,
  selectSaleTotalCustomDesignOrder,
  selectSaleTotalRevenue,
  selectSaleTotalPayOSPayment,
  selectSaleTotalCastPayment,
  selectSaleTotalContractSigned,
  selectSaleTotalFeedback,
  selectSaleTotalTicket,
} from '../../store/features/dashboard/dashboardSlice';

const SalesDashboard = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const dashboardStatus = useSelector(selectDashboardStatus);
  const dashboardError = useSelector(selectDashboardError);
  const lastUpdated = useSelector(selectDashboardLastUpdated);
  
  // Sale orders stats selectors
  const saleOrdersStats = useSelector(selectSaleOrdersStats);
  const saleOrdersStatsStatus = useSelector(selectSaleOrdersStatsStatus);
  const saleOrdersStatsError = useSelector(selectSaleOrdersStatsError);
  const saleOrdersStatsLastUpdated = useSelector(selectSaleOrdersStatsLastUpdated);
  
  // Custom design requests stats selectors
  const customDesignRequestsStats = useSelector(selectCustomDesignRequestsStats);
  const customDesignRequestsStatsStatus = useSelector(selectCustomDesignRequestsStatsStatus);
  const customDesignRequestsStatsError = useSelector(selectCustomDesignRequestsStatsError);
  const customDesignRequestsStatsLastUpdated = useSelector(selectCustomDesignRequestsStatsLastUpdated);
  
  // Individual metrics
  const totalOrders = useSelector(selectSaleTotalOrders);
  const totalOrderCompleted = useSelector(selectSaleTotalOrderCompleted);
  const totalOrderInProgress = useSelector(selectSaleTotalOrderInProgress);
  const totalOrderCancelled = useSelector(selectSaleTotalOrderCancelled);
  const totalAiDesignOrder = useSelector(selectSaleTotalAiDesignOrder);
  const totalCustomDesignOrder = useSelector(selectSaleTotalCustomDesignOrder);
  const totalRevenue = useSelector(selectSaleTotalRevenue);
  const totalPayOSPayment = useSelector(selectSaleTotalPayOSPayment);
  const totalCastPayment = useSelector(selectSaleTotalCastPayment);
  const totalContractSigned = useSelector(selectSaleTotalContractSigned);
  const totalFeedback = useSelector(selectSaleTotalFeedback);
  const totalTicket = useSelector(selectSaleTotalTicket);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);

  // Set Vietnamese locale for dayjs
  dayjs.locale('vi');

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchSaleDashboard());
    // Fetch orders stats with default date range
    dispatch(fetchSaleOrdersStats({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }));
    // Fetch custom design requests stats with default date range
    dispatch(fetchCustomDesignRequestsStats({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }));
  }, [dispatch, startDate, endDate]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchSaleDashboard()).unwrap();
      await dispatch(fetchSaleOrdersStats({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })).unwrap();
      await dispatch(fetchCustomDesignRequestsStats({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })).unwrap();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, startDate, endDate]);

  // Handle date change
  const handleDateChange = useCallback(() => {
    dispatch(fetchSaleOrdersStats({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }));
    dispatch(fetchCustomDesignRequestsStats({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }));
  }, [dispatch, startDate, endDate]);

  // Quick date range selectors
  const handleQuickDateSelect = useCallback((days) => {
    const newStartDate = dayjs().subtract(days, 'day');
    const newEndDate = dayjs();
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setDatePickerAnchor(null);
  }, []);

  // Prepare chart data
  const prepareChartData = useCallback(() => {
    if (!saleOrdersStats) return [];
    
    return [
      { name: 'Chờ thiết kế', value: saleOrdersStats.pendingDesign, color: '#FF6B6B' },
      { name: 'Cần đặt cọc thiết kế', value: saleOrdersStats.needDepositDesign, color: '#4ECDC4' },
      { name: 'Đã đặt cọc thiết kế', value: saleOrdersStats.depositedDesign, color: '#45B7D1' },
      { name: 'Cần thanh toán đầy đủ', value: saleOrdersStats.needFullyPaidDesign, color: '#96CEB4' },
      { name: 'Chờ thiết kế cuối cùng', value: saleOrdersStats.waitingFinalDesign, color: '#FFEAA7' },
      { name: 'Thiết kế hoàn thành', value: saleOrdersStats.designCompleted, color: '#DDA0DD' },
      { name: 'Chờ hợp đồng', value: saleOrdersStats.pendingContract, color: '#98D8C8' },
      { name: 'Đã gửi hợp đồng', value: saleOrdersStats.contractSent, color: '#F7DC6F' },
      { name: 'Đã ký hợp đồng', value: saleOrdersStats.contractSigned, color: '#BB8FCE' },
      { name: 'Thảo luận hợp đồng', value: saleOrdersStats.contractDiscuss, color: '#85C1E9' },
      { name: 'Ký lại hợp đồng', value: saleOrdersStats.contractResigned, color: '#F8C471' },
      { name: 'Xác nhận hợp đồng', value: saleOrdersStats.contractConfirmed, color: '#82E0AA' },
      { name: 'Đã đặt cọc', value: saleOrdersStats.deposited, color: '#AED6F1' },
      { name: 'Đang thực hiện', value: saleOrdersStats.inProgress, color: '#A9DFBF' },
      { name: 'Đã hủy', value: saleOrdersStats.cancelled, color: '#F1948A' },
    ].filter(item => item.value > 0);
  }, [saleOrdersStats]);

  const chartData = prepareChartData();

  // Prepare custom design requests chart data
  const prepareCustomDesignChartData = useCallback(() => {
    if (!customDesignRequestsStats) return [];
    
    return [
      { name: 'Chờ xử lý', value: customDesignRequestsStats.pending, color: '#FF6B6B' },
      { name: 'Đã thông báo giá', value: customDesignRequestsStats.pricingNotified, color: '#4ECDC4' },
      { name: 'Từ chối báo giá', value: customDesignRequestsStats.rejectedPricing, color: '#FF8C8C' },
      { name: 'Chấp nhận báo giá', value: customDesignRequestsStats.approvedPricing, color: '#45B7D1' },
      { name: 'Đã đặt cọc', value: customDesignRequestsStats.deposited, color: '#96CEB4' },
      { name: 'Đã phân công designer', value: customDesignRequestsStats.assignedDesigner, color: '#FFEAA7' },
      { name: 'Đang xử lý', value: customDesignRequestsStats.processing, color: '#DDA0DD' },
      { name: 'Designer từ chối', value: customDesignRequestsStats.designerRejected, color: '#FF9999' },
      { name: 'Đã nộp demo', value: customDesignRequestsStats.demoSubmitted, color: '#98D8C8' },
      { name: 'Yêu cầu chỉnh sửa', value: customDesignRequestsStats.revisionRequested, color: '#F7DC6F' },
      { name: 'Chờ thanh toán đầy đủ', value: customDesignRequestsStats.waitingFullPayment, color: '#BB8FCE' },
      { name: 'Đã thanh toán đầy đủ', value: customDesignRequestsStats.fullyPaid, color: '#85C1E9' },
      { name: 'Hoàn thành', value: customDesignRequestsStats.completed, color: '#82E0AA' },
      { name: 'Đã hủy', value: customDesignRequestsStats.cancelled, color: '#F1948A' },
    ].filter(item => item.value > 0);
  }, [customDesignRequestsStats]);

  const customDesignChartData = prepareCustomDesignChartData();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (number) => {
    return new Intl.NumberFormat('vi-VN').format(number || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 lg:gap-6 mb-6">
            <div className="space-y-2">
              <Typography variant="h3" className="!font-black !text-transparent !bg-clip-text !bg-gradient-to-r !from-blue-600 !to-purple-600 !text-2xl sm:!text-3xl lg:!text-4xl">
                 Sale Dashboard
              </Typography>
              <Typography variant="body1" className="!text-gray-600 !text-sm sm:!text-base !leading-relaxed">
                Tổng quan thống kê bán hàng và hiệu suất kinh doanh
              </Typography>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
              {lastUpdated && (
                <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
                  <Typography variant="body2" className="!text-gray-600 !text-xs sm:!text-sm !font-medium">
                    Cập nhật: {new Date(lastUpdated).toLocaleString('vi-VN')}
                  </Typography>
                </div>
              )}
              
              <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={(e) => setDatePickerAnchor(e.currentTarget)}
                className="!rounded-xl !border-2 !border-indigo-200 !text-indigo-600 hover:!bg-indigo-50 hover:!border-indigo-300 !font-semibold !px-4 lg:!px-6 !py-2 !transition-all !duration-300 !shadow-sm hover:!shadow-md"
                size="small"
              >
                Lọc ngày
              </Button>
              
              <Button
                variant="outlined"
                startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing || dashboardStatus === 'loading' || saleOrdersStatsStatus === 'loading'}
                className="!rounded-xl !border-2 !border-blue-200 !text-blue-600 hover:!bg-blue-50 hover:!border-blue-300 !font-semibold !px-4 lg:!px-6 !py-2 !transition-all !duration-300 !shadow-sm hover:!shadow-md"
                size="small"
              >
                {refreshing ? 'Đang làm mới...' : 'Làm mới'}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {dashboardError && (
            <Alert severity="error" className="!mb-6 !rounded-xl !shadow-lg">
              {dashboardError}
            </Alert>
          )}
          
          {/* Sale Orders Stats Error */}
          {saleOrdersStatsError && (
            <Alert severity="error" className="!mb-6 !rounded-xl !shadow-lg">
              Lỗi thống kê đơn hàng: {saleOrdersStatsError}
            </Alert>
          )}

          {/* Custom Design Requests Stats Error */}
          {customDesignRequestsStatsError && (
            <Alert severity="error" className="!mb-6 !rounded-xl !shadow-lg">
              Lỗi thống kê yêu cầu thiết kế: {customDesignRequestsStatsError}
            </Alert>
          )}
        </div>

        {/* Date Picker Popover */}
        <Popover
          open={Boolean(datePickerAnchor)}
          anchorEl={datePickerAnchor}
          onClose={() => setDatePickerAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Box className="p-4 min-w-80">
              <Typography variant="h6" className="!font-bold !mb-4">
                Chọn khoảng thời gian
              </Typography>
              
              {/* Quick select buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickDateSelect(7)}
                  className="!rounded-lg"
                >
                  7 ngày qua
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickDateSelect(30)}
                  className="!rounded-lg"
                >
                  30 ngày qua
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickDateSelect(90)}
                  className="!rounded-lg"
                >
                  3 tháng qua
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuickDateSelect(365)}
                  className="!rounded-lg"
                >
                  1 năm qua
                </Button>
              </div>
              
              <Divider className="!my-4" />
              
              {/* Date pickers */}
              <div className="space-y-4">
                <DatePicker
                  label="Từ ngày"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
                <DatePicker
                  label="Đến ngày"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="contained"
                  onClick={handleDateChange}
                  className="!rounded-lg !flex-1"
                  disabled={saleOrdersStatsStatus === 'loading'}
                >
                  {saleOrdersStatsStatus === 'loading' ? 'Đang tải...' : 'Áp dụng'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setDatePickerAnchor(null)}
                  className="!rounded-lg !flex-1"
                >
                  Đóng
                </Button>
              </div>
            </Box>
          </LocalizationProvider>
        </Popover>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Total Orders */}
          <Card className="!rounded-2xl lg:!rounded-3xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-0 !bg-gradient-to-br !from-white !to-blue-50 hover:!from-blue-50 hover:!to-blue-100 group">
            <CardContent className="!p-4 lg:!p-6">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <OrderIcon className="!text-white !text-lg lg:!text-xl" />
                </div>
                {dashboardStatus === 'loading' && (
                  <CircularProgress size={20} className="!text-blue-600" />
                )}
              </div>
              <Typography variant="h4" className="!font-black !text-blue-600 !mb-1 lg:!mb-2 !text-xl sm:!text-2xl lg:!text-3xl">
                {dashboardStatus === 'loading' ? '...' : formatNumber(totalOrders)}
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !font-semibold !text-xs sm:!text-sm">
                Tổng đơn hàng
              </Typography>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card className="!rounded-2xl lg:!rounded-3xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-0 !bg-gradient-to-br !from-white !to-green-50 hover:!from-green-50 hover:!to-green-100 group">
            <CardContent className="!p-4 lg:!p-6">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <CompletedIcon className="!text-white !text-lg lg:!text-xl" />
                </div>
                {dashboardStatus === 'loading' && (
                  <CircularProgress size={20} className="!text-green-600" />
                )}
              </div>
              <Typography variant="h4" className="!font-black !text-green-600 !mb-1 lg:!mb-2 !text-xl sm:!text-2xl lg:!text-3xl">
                {dashboardStatus === 'loading' ? '...' : formatNumber(totalOrderCompleted)}
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !font-semibold !text-xs sm:!text-sm">
                Đơn hàng hoàn thành
              </Typography>
            </CardContent>
          </Card>

          {/* In Progress Orders */}
          <Card className="!rounded-2xl lg:!rounded-3xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-0 !bg-gradient-to-br !from-white !to-orange-50 hover:!from-orange-50 hover:!to-orange-100 group">
            <CardContent className="!p-4 lg:!p-6">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <InProgressIcon className="!text-white !text-lg lg:!text-xl" />
                </div>
                {dashboardStatus === 'loading' && (
                  <CircularProgress size={20} className="!text-orange-600" />
                )}
              </div>
              <Typography variant="h4" className="!font-black !text-orange-600 !mb-1 lg:!mb-2 !text-xl sm:!text-2xl lg:!text-3xl">
                {dashboardStatus === 'loading' ? '...' : formatNumber(totalOrderInProgress)}
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !font-semibold !text-xs sm:!text-sm">
                Đơn hàng đang xử lý
              </Typography>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="!rounded-2xl lg:!rounded-3xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-0 !bg-gradient-to-br !from-white !to-purple-50 hover:!from-purple-50 hover:!to-purple-100 group">
            <CardContent className="!p-4 lg:!p-6">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <MoneyIcon className="!text-white !text-lg lg:!text-xl" />
                </div>
                {dashboardStatus === 'loading' && (
                  <CircularProgress size={20} className="!text-purple-600" />
                )}
              </div>
              <Typography variant="h5" className="!font-black !text-purple-600 !mb-1 lg:!mb-2 !text-base sm:!text-lg lg:!text-xl">
                {dashboardStatus === 'loading' ? '...' : formatCurrency(totalRevenue)}
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !font-semibold !text-xs sm:!text-sm">
                Tổng doanh thu
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* Order Types Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="!rounded-2xl lg:!rounded-3xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-0 !bg-gradient-to-br !from-white !to-blue-50">
            <CardContent className="!p-4 lg:!p-6">
              <Typography variant="h6" className="!font-black !text-gray-800 !mb-4 lg:!mb-6 !flex !items-center !gap-2 !text-lg lg:!text-xl">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <DesignIcon className="!text-white !text-lg lg:!text-xl" />
                </div>
                Loại đơn hàng
              </Typography>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 rounded-xl lg:rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <AiIcon className="!text-white !text-sm lg:!text-base" />
                    </div>
                    <div>
                      <Typography variant="body1" className="!font-bold !text-gray-800 !text-sm lg:!text-base">
                        AI Design
                      </Typography>
                      <Typography variant="body2" className="!text-gray-600 !text-xs lg:!text-sm">
                        Thiết kế tự động bằng AI
                      </Typography>
                    </div>
                  </div>
                  <Chip 
                    label={formatNumber(totalAiDesignOrder)}
                    color="primary"
                    className="!font-bold !text-xs lg:!text-sm"
                    size="small"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-xl lg:rounded-2xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <CustomIcon className="!text-white !text-sm lg:!text-base" />
                    </div>
                    <div>
                      <Typography variant="body1" className="!font-bold !text-gray-800 !text-sm lg:!text-base">
                        Custom Design
                      </Typography>
                      <Typography variant="body2" className="!text-gray-600 !text-xs lg:!text-sm">
                        Thiết kế theo yêu cầu
                      </Typography>
                    </div>
                  </div>
                  <Chip 
                    label={formatNumber(totalCustomDesignOrder)}
                    color="secondary"
                    className="!font-bold !text-xs lg:!text-sm"
                    size="small"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="!rounded-2xl lg:!rounded-3xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-0 !bg-gradient-to-br !from-white !to-green-50">
            <CardContent className="!p-4 lg:!p-6">
              <Typography variant="h6" className="!font-black !text-gray-800 !mb-4 lg:!mb-6 !flex !items-center !gap-2 !text-lg lg:!text-xl">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <PaymentIcon className="!text-white !text-lg lg:!text-xl" />
                </div>
                Phương thức thanh toán
              </Typography>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 lg:p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-xl lg:rounded-2xl border-2 border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <PaymentIcon className="!text-white !text-sm lg:!text-base" />
                    </div>
                    <div>
                      <Typography variant="body1" className="!font-bold !text-gray-800 !text-sm lg:!text-base">
                        PayOS Payment
                      </Typography>
                      <Typography variant="body2" className="!text-gray-600 !text-xs lg:!text-sm">
                        Thanh toán online
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="h6" className="!font-black !text-green-600 !text-sm lg:!text-base">
                    {formatCurrency(totalPayOSPayment)}
                  </Typography>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 lg:p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-xl lg:rounded-2xl border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <MoneyIcon className="!text-white !text-sm lg:!text-base" />
                    </div>
                    <div>
                      <Typography variant="body1" className="!font-bold !text-gray-800 !text-sm lg:!text-base">
                        Cash Payment
                      </Typography>
                      <Typography variant="body2" className="!text-gray-600 !text-xs lg:!text-sm">
                        Thanh toán tiền mặt
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="h6" className="!font-black !text-amber-600 !text-sm lg:!text-base">
                    {formatCurrency(totalCastPayment)}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="!rounded-2xl lg:!rounded-3xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-0 !bg-gradient-to-br !from-white !to-indigo-50 hover:!from-indigo-50 hover:!to-indigo-100 group">
            <CardContent className="!p-4 lg:!p-6 !text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ContractIcon className="!text-white !text-2xl lg:!text-3xl" />
              </div>
              <Typography variant="h5" className="!font-black !text-indigo-600 !mb-1 lg:!mb-2 !text-lg lg:!text-xl">
                {formatNumber(totalContractSigned)}
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !font-semibold !text-xs lg:!text-sm">
                Hợp đồng đã ký
              </Typography>
            </CardContent>
          </Card>

          <Card className="!rounded-2xl lg:!rounded-3xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-0 !bg-gradient-to-br !from-white !to-pink-50 hover:!from-pink-50 hover:!to-pink-100 group">
            <CardContent className="!p-4 lg:!p-6 !text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <FeedbackIcon className="!text-white !text-2xl lg:!text-3xl" />
              </div>
              <Typography variant="h5" className="!font-black !text-pink-600 !mb-1 lg:!mb-2 !text-lg lg:!text-xl">
                {formatNumber(totalFeedback)}
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !font-semibold !text-xs lg:!text-sm">
                Feedback nhận được
              </Typography>
            </CardContent>
          </Card>

          <Card className="!rounded-2xl lg:!rounded-3xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-0 !bg-gradient-to-br !from-white !to-cyan-50 hover:!from-cyan-50 hover:!to-cyan-100 group">
            <CardContent className="!p-4 lg:!p-6 !text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <TicketIcon className="!text-white !text-2xl lg:!text-3xl" />
              </div>
              <Typography variant="h5" className="!font-black !text-cyan-600 !mb-1 lg:!mb-2 !text-lg lg:!text-xl">
                {formatNumber(totalTicket)}
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !font-semibold !text-xs lg:!text-sm">
                Ticket hỗ trợ
              </Typography>
            </CardContent>
          </Card>

          <Card className="!rounded-2xl lg:!rounded-3xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-0 !bg-gradient-to-br !from-white !to-red-50 hover:!from-red-50 hover:!to-red-100 group">
            <CardContent className="!p-4 lg:!p-6 !text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <CancelledIcon className="!text-white !text-2xl lg:!text-3xl" />
              </div>
              <Typography variant="h5" className="!font-black !text-red-600 !mb-1 lg:!mb-2 !text-lg lg:!text-xl">
                {formatNumber(totalOrderCancelled)}
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !font-semibold !text-xs lg:!text-sm">
                Đơn hàng đã hủy
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {/* Bar Chart - Order Status Overview (Full Width) */}
        <div className="mt-6 lg:mt-8">
          <Card className="!rounded-3xl !shadow-2xl hover:!shadow-3xl !transition-all !duration-500 !border-0 !bg-gradient-to-br !from-white !via-blue-50 !to-indigo-100 hover:!from-blue-50 hover:!to-indigo-200 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%]"></div>
            <CardContent className="!p-6 lg:!p-8 relative z-10">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <Typography variant="h6" className="!font-black !text-gray-800 !flex !items-center !gap-3 !text-lg lg:!text-xl">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 group-hover:shadow-2xl group-hover:shadow-blue-300 transition-all duration-300 group-hover:scale-110">
                    <ChartIcon className="!text-white !text-xl lg:!text-2xl" />
                  </div>
                  <div>
                    <div className="!text-lg lg:!text-xl !font-bold">Thống kê trạng thái đơn hàng</div>
                    <div className="!text-sm !text-gray-600 !font-medium">Biểu đồ cột hiển thị số lượng đơn hàng theo trạng thái</div>
                  </div>
                </Typography>
                {saleOrdersStatsStatus === 'loading' && (
                  <CircularProgress size={24} className="!text-blue-600" thickness={4} />
                )}
              </div>
              
              <div className="h-96 lg:h-[32rem] relative">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent rounded-2xl"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 30, right: 40, left: 20, bottom: 80 }}>
                    <defs>
                      <linearGradient id="barGradientBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
                        <stop offset="50%" stopColor="#1E40AF" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.8}/>
                      </linearGradient>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="4 4" 
                      stroke="#E2E8F0" 
                      strokeOpacity={0.6}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="name" 
                      angle={-35}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      stroke="#64748B"
                      fontWeight="600"
                      tickMargin={15}
                    />
                    <YAxis 
                      fontSize={12} 
                      stroke="#64748B"
                      fontWeight="600"
                      tickMargin={10}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        padding: '16px 20px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      labelStyle={{ 
                        color: '#1E293B', 
                        fontWeight: '700',
                        marginBottom: '8px'
                      }}
                      formatter={(value) => [formatNumber(value), 'Số lượng']}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#barGradientBlue)"
                      radius={[8, 8, 4, 4]}
                      filter="url(#shadow)"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {saleOrdersStatsLastUpdated && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <Typography variant="body2" className="!text-blue-700 !text-sm !font-semibold !flex !items-center !gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Cập nhật: {new Date(saleOrdersStatsLastUpdated).toLocaleString('vi-VN')}
                  </Typography>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pie Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6 lg:mt-8">
          {/* Pie Chart - Order Status Distribution */}
          <Card className="!rounded-3xl !shadow-2xl hover:!shadow-3xl !transition-all !duration-500 !border-0 !bg-gradient-to-br !from-white !via-purple-50 !to-pink-100 hover:!from-purple-50 hover:!to-pink-200 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%]"></div>
            <CardContent className="!p-6 lg:!p-8 relative z-10">
              <Typography variant="h6" className="!font-black !text-gray-800 !mb-6 lg:!mb-8 !flex !items-center !gap-3 !text-lg lg:!text-xl">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-200 group-hover:shadow-2xl group-hover:shadow-purple-300 transition-all duration-300 group-hover:scale-110">
                  <TrendingUpIcon className="!text-white !text-xl lg:!text-2xl" />
                </div>
                <div>
                  <div className="!text-lg lg:!text-xl !font-bold">Phân bố trạng thái</div>
                  <div className="!text-sm !text-gray-600 !font-medium">Tỷ lệ các trạng thái đơn hàng</div>
                </div>
              </Typography>
              
              <div className="h-80 lg:h-96 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-50/50 to-transparent rounded-2xl"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.25"/>
                      </filter>
                    </defs>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="40%"
                      outerRadius={100}
                      innerRadius={40}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      filter="url(#pieShadow)"
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        padding: '16px 20px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      labelStyle={{ 
                        color: '#1E293B', 
                        fontWeight: '700',
                        marginBottom: '8px'
                      }}
                      formatter={(value, name) => [formatNumber(value), name]}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        fontSize: '10px',
                        paddingTop: '15px',
                        fontWeight: '600'
                      }}
                      iconType="circle"
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Total Orders Display */}
              <div className="text-center mt-4 p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl border border-purple-100 shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <Typography variant="h5" className="!font-black !text-purple-600 !text-xl lg:!text-2xl">
                    {formatNumber(saleOrdersStats?.total || 0)}
                  </Typography>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                </div>
                <Typography variant="body2" className="!text-gray-700 !font-bold !text-sm">
                  Tổng đơn hàng trong khoảng thời gian
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Custom Design Requests Chart */}
          <Card className="!rounded-3xl !shadow-2xl hover:!shadow-3xl !transition-all !duration-500 !border-0 !bg-gradient-to-br !from-white !via-green-50 !to-emerald-100 hover:!from-green-50 hover:!to-emerald-200 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%]"></div>
            <CardContent className="!p-6 lg:!p-8 relative z-10">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <Typography variant="h6" className="!font-black !text-gray-800 !flex !items-center !gap-3 !text-lg lg:!text-xl">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-200 group-hover:shadow-2xl group-hover:shadow-green-300 transition-all duration-300 group-hover:scale-110">
                    <DesignIcon className="!text-white !text-xl lg:!text-2xl" />
                  </div>
                  <div>
                    <div className="!text-lg lg:!text-xl !font-bold">Yêu cầu thiết kế AI</div>
                    <div className="!text-sm !text-gray-600 !font-medium">Thống kê theo trạng thái</div>
                  </div>
                </Typography>
                {customDesignRequestsStatsStatus === 'loading' && (
                  <CircularProgress size={24} className="!text-green-600" thickness={4} />
                )}
              </div>
              
              <div className="h-80 lg:h-96 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-green-50/50 to-transparent rounded-2xl"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="designPieShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.25"/>
                      </filter>
                      <linearGradient id="designGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="designGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={customDesignChartData}
                      cx="50%"
                      cy="40%"
                      outerRadius={85}
                      innerRadius={30}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={300}
                      animationDuration={1800}
                      animationEasing="ease-in-out"
                      filter="url(#designPieShadow)"
                    >
                      {customDesignChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="rgba(255,255,255,0.9)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        padding: '16px 20px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      labelStyle={{ 
                        color: '#1E293B', 
                        fontWeight: '700',
                        marginBottom: '8px'
                      }}
                      formatter={(value, name) => [formatNumber(value), name]}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        fontSize: '9px',
                        paddingTop: '15px',
                        fontWeight: '600',
                        maxHeight: '70px',
                        overflowY: 'auto'
                      }}
                      iconType="circle"
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Total Custom Design Requests Display */}
              <div className="text-center mt-4 p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-2xl border border-green-100 shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <Typography variant="h5" className="!font-black !text-green-600 !text-xl lg:!text-2xl">
                    {formatNumber(
                      customDesignRequestsStats ? 
                      Object.values(customDesignRequestsStats).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0) : 
                      0
                    )}
                  </Typography>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <Typography variant="body2" className="!text-gray-700 !font-bold !text-sm">
                  Tổng yêu cầu thiết kế
                </Typography>
              </div>

              {customDesignRequestsStatsLastUpdated && (
                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                  <Typography variant="body2" className="!text-green-700 !text-xs !font-semibold !flex !items-center !gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Cập nhật: {new Date(customDesignRequestsStatsLastUpdated).toLocaleString('vi-VN')}
                  </Typography>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
