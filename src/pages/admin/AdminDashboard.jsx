import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchAdminDashboard,
  fetchPaymentsStats,
  selectAdminDashboard,
  selectDashboardStatus,
  selectDashboardError,
  selectAdminTotalUsers,
  selectAdminTotalBannedUsers,
  selectAdminTotalCustomer,
  selectAdminTotalSale,
  selectAdminTotalStaff,
  selectAdminTotalDesigner,
  selectAdminTotalAdmin,
  selectAdminTotalPaymentTransactionCreated,
  selectAdminTotalPaymentSuccess,
  selectAdminTotalPaymentFailure,
  selectAdminTotalPaymentCancelled,
  selectAdminTotalPaymentSuccessAmount,
  selectAdminTotalPaymentFailureAmount,
  selectAdminTotalPaymentCancelledAmount,
  selectAdminTotalPayOSSuccessAmount,
  selectAdminTotalPayOSFailureAmount,
  selectAdminTotalPayOSCancelledAmount,
  selectAdminTotalCastAmount,
  selectAdminTotalChatBotUsed,
  selectPaymentsStats,
  selectPaymentsStatsStatus,
  selectPaymentsStatsError
} from "../../store/features/dashboard/dashboardSlice";
import { useOutletContext } from "react-router-dom";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Button, Popover, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CalendarMonth as CalendarIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const COLORS = ["#4caf50", "#2196f3", "#f44336"];

const AdminDashboard = () => {
  // Get active tab from outlet context
  const { activeTab } = useOutletContext();
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  dayjs.locale('vi');
  
  const dispatch = useDispatch();

  // Admin dashboard data using new selectors
  const adminDashboard = useSelector(selectAdminDashboard);
  const dashboardStatus = useSelector(selectDashboardStatus);
  const dashboardError = useSelector(selectDashboardError);
  
  // Payments stats data
  const paymentsStats = useSelector(selectPaymentsStats);
  const paymentsStatsStatus = useSelector(selectPaymentsStatsStatus);
  const paymentsStatsError = useSelector(selectPaymentsStatsError);
  
  // Individual metrics
  const totalUsers = useSelector(selectAdminTotalUsers);
  const totalBannedUsers = useSelector(selectAdminTotalBannedUsers);
  const totalCustomer = useSelector(selectAdminTotalCustomer);
  const totalSale = useSelector(selectAdminTotalSale);
  const totalStaff = useSelector(selectAdminTotalStaff);
  const totalDesigner = useSelector(selectAdminTotalDesigner);
  const totalAdmin = useSelector(selectAdminTotalAdmin);
  const totalPaymentTransactionCreated = useSelector(selectAdminTotalPaymentTransactionCreated);
  const totalPaymentSuccess = useSelector(selectAdminTotalPaymentSuccess);
  const totalPaymentFailure = useSelector(selectAdminTotalPaymentFailure);
  const totalPaymentCancelled = useSelector(selectAdminTotalPaymentCancelled);
  const totalPaymentSuccessAmount = useSelector(selectAdminTotalPaymentSuccessAmount);
  const totalPaymentFailureAmount = useSelector(selectAdminTotalPaymentFailureAmount);
  const totalPaymentCancelledAmount = useSelector(selectAdminTotalPaymentCancelledAmount);
  const totalPayOSSuccessAmount = useSelector(selectAdminTotalPayOSSuccessAmount);
  const totalPayOSFailureAmount = useSelector(selectAdminTotalPayOSFailureAmount);
  const totalPayOSCancelledAmount = useSelector(selectAdminTotalPayOSCancelledAmount);
  const totalCastAmount = useSelector(selectAdminTotalCastAmount);
  const totalChatBotUsed = useSelector(selectAdminTotalChatBotUsed);

  // Fetch admin dashboard data when component mounts or when dashboard tab is active
  useEffect(() => {
    if (activeTab === "dashboard") {
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();
      dispatch(fetchAdminDashboard({ startDate: formattedStartDate, endDate: formattedEndDate }));
      dispatch(fetchPaymentsStats({ startDate: formattedStartDate, endDate: formattedEndDate }));
    }
  }, [activeTab, startDate, endDate, dispatch]);

  // Generate revenue data based on API data
  const getRevenueData = () => {
    if (dashboardStatus === "loading" || paymentsStatsStatus === "loading" || !paymentsStats) {
      return [
        { month: "Jan", revenue: 0, payOSRevenue: 0, castRevenue: 0, designRevenue: 0, constructionRevenue: 0 },
        { month: "Feb", revenue: 0, payOSRevenue: 0, castRevenue: 0, designRevenue: 0, constructionRevenue: 0 },
        { month: "Mar", revenue: 0, payOSRevenue: 0, castRevenue: 0, designRevenue: 0, constructionRevenue: 0 },
        { month: "Apr", revenue: 0, payOSRevenue: 0, castRevenue: 0, designRevenue: 0, constructionRevenue: 0 },
        { month: "May", revenue: 0, payOSRevenue: 0, castRevenue: 0, designRevenue: 0, constructionRevenue: 0 },
        { month: "Jun", revenue: 0, payOSRevenue: 0, castRevenue: 0, designRevenue: 0, constructionRevenue: 0 },
      ];
    }

    // Use payments stats data for revenue calculation
    const totalRevenue = paymentsStats.revenue || 0;
    const totalPayOSRevenue = paymentsStats.payOSRevenue || 0;
    const totalCastRevenue = paymentsStats.castRevenue || 0;
    const totalDesignRevenue = paymentsStats.designRevenue || 0;
    const totalConstructionRevenue = paymentsStats.constructionRevenue || 0;
    
    // Generate monthly distribution (mock data based on totals)
    const monthlyAverage = Math.round(totalRevenue / 6);
    const payOSMonthlyAverage = Math.round(totalPayOSRevenue / 6);
    const castMonthlyAverage = Math.round(totalCastRevenue / 6);
    const designMonthlyAverage = Math.round(totalDesignRevenue / 6);
    const constructionMonthlyAverage = Math.round(totalConstructionRevenue / 6);

    return [
      { 
        month: "Jan", 
        revenue: Math.round(monthlyAverage * 0.8),
        payOSRevenue: Math.round(payOSMonthlyAverage * 0.8),
        castRevenue: Math.round(castMonthlyAverage * 0.8),
        designRevenue: Math.round(designMonthlyAverage * 0.8),
        constructionRevenue: Math.round(constructionMonthlyAverage * 0.8)
      },
      { 
        month: "Feb", 
        revenue: Math.round(monthlyAverage * 0.6),
        payOSRevenue: Math.round(payOSMonthlyAverage * 0.6),
        castRevenue: Math.round(castMonthlyAverage * 0.6),
        designRevenue: Math.round(designMonthlyAverage * 0.6),
        constructionRevenue: Math.round(constructionMonthlyAverage * 0.6)
      },
      { 
        month: "Mar", 
        revenue: Math.round(monthlyAverage * 1.0),
        payOSRevenue: Math.round(payOSMonthlyAverage * 1.0),
        castRevenue: Math.round(castMonthlyAverage * 1.0),
        designRevenue: Math.round(designMonthlyAverage * 1.0),
        constructionRevenue: Math.round(constructionMonthlyAverage * 1.0)
      },
      { 
        month: "Apr", 
        revenue: Math.round(monthlyAverage * 0.9),
        payOSRevenue: Math.round(payOSMonthlyAverage * 0.9),
        castRevenue: Math.round(castMonthlyAverage * 0.9),
        designRevenue: Math.round(designMonthlyAverage * 0.9),
        constructionRevenue: Math.round(constructionMonthlyAverage * 0.9)
      },
      { 
        month: "May", 
        revenue: Math.round(monthlyAverage * 1.2),
        payOSRevenue: Math.round(payOSMonthlyAverage * 1.2),
        castRevenue: Math.round(castMonthlyAverage * 1.2),
        designRevenue: Math.round(designMonthlyAverage * 1.2),
        constructionRevenue: Math.round(constructionMonthlyAverage * 1.2)
      },
      { 
        month: "Jun", 
        revenue: Math.round(monthlyAverage * 1.1),
        payOSRevenue: Math.round(payOSMonthlyAverage * 1.1),
        castRevenue: Math.round(castMonthlyAverage * 1.1),
        designRevenue: Math.round(designMonthlyAverage * 1.1),
        constructionRevenue: Math.round(constructionMonthlyAverage * 1.1)
      },
    ];
  };

  // Calculate payment status data from API
  const getOrderStatusData = () => {
    if (dashboardStatus === "loading" || !adminDashboard) {
      return [
        { name: "Thành Công", value: 0 },
        { name: "Thất Bại", value: 0 },
        { name: "Đã Hủy", value: 0 },
      ];
    }

    const total = totalPaymentTransactionCreated || 0;
    const success = totalPaymentSuccess || 0;
    const failure = totalPaymentFailure || 0;
    const cancelled = totalPaymentCancelled || 0;

    return [
      {
        name: "Thành Công",
        value: total > 0 ? Math.round((success / total) * 100) : 0,
      },
      {
        name: "Thất Bại",
        value: total > 0 ? Math.round((failure / total) * 100) : 0,
      },
      {
        name: "Đã Hủy",
        value: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      },
    ];
  };

  const revenueData = getRevenueData();
  const orderStatusData = getOrderStatusData();
  
  // Dashboard Content
  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Tổng Quan Dashboard
        </h1>
        <div className="flex flex-wrap gap-3">
          <Button
            variant='outlined'
            startIcon={<CalendarIcon />}
            onClick={(e)=> setDatePickerAnchor(e.currentTarget)}
            className='!rounded-xl !border-2 !border-indigo-200 !text-indigo-600 hover:!bg-indigo-50 hover:!border-indigo-300 !font-semibold !px-4 !py-2 !transition-all !duration-300 !shadow-sm hover:!shadow-md !cursor-pointer'
            size='small'
          >
            Lọc ngày
          </Button>
          <Button
            variant='outlined'
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing || dashboardStatus === 'loading'}
            className='!rounded-xl !border-2 !border-blue-200 !text-blue-600 hover:!bg-blue-50 hover:!border-blue-300 !font-semibold !px-4 !py-2 !transition-all !duration-300 !shadow-sm hover:!shadow-md !cursor-pointer disabled:!cursor-not-allowed'
            size='small'
          >
            {refreshing ? 'Đang làm mới...' : 'Làm mới'}
          </Button>
          <div className='px-3 py-2 bg-white rounded-lg border text-xs text-gray-600 font-medium'>
            {startDate.format('DD/MM/YYYY')} - {endDate.format('DD/MM/YYYY')}
          </div>
        </div>
      </div>

      {/* Dashboard Error Alert */}
      {(dashboardError || paymentsStatsError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5" />
          {dashboardError || paymentsStatsError}
        </div>
      )}

      {/* Stats Cards - Người Dùng & Vai Trò (Compact) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">👥 Quản Lý Người Dùng</h2>
          <button
            onClick={() => setShowUserDetails(v => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-600 shadow-sm cursor-pointer"
          >{showUserDetails ? 'Thu gọn' : 'Chi tiết'}</button>
        </div>
        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[{label:'Người Dùng',value:totalUsers,color:'blue'},{label:'Khách Hàng',value:totalCustomer,color:'indigo'},{label:'Sale',value:totalSale,color:'pink'},{label:'Nhân Viên',value:totalStaff,color:'teal'},{label:'Designer',value:totalDesigner,color:'amber'},{label:'Bị Khóa',value:totalBannedUsers,color:'red'}].map((m,i)=>(
            <div key={i} className={`relative overflow-hidden rounded-xl p-3 bg-white border-l-4 shadow-sm hover:shadow-md transition-all border-${m.color}-500`}> 
              <div className="text-xs font-medium text-gray-500 mb-1">{m.label}</div>
              <div className={`text-lg font-bold text-gray-800`}>{dashboardStatus==='loading'?<div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-${m.color}-600`}></div>: (m.value?.toLocaleString()||'0')}</div>
            </div>
          ))}
        </div>
        {showUserDetails && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Detailed original cards condensed (Admins & ChatBot usage) */}
            <div className="bg-white rounded-xl shadow p-4 relative overflow-hidden border-t-4 border-gray-500">
              <div className="text-sm font-semibold text-gray-700 mb-1">Quản Trị Viên</div>
              <div className="text-2xl font-bold text-gray-900">{dashboardStatus==='loading'? '...' : (totalAdmin?.toLocaleString()||'0')}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 relative overflow-hidden border-t-4 border-cyan-500">
              <div className="text-sm font-semibold text-gray-700 mb-1">Lượt ChatBot</div>
              <div className="text-2xl font-bold text-gray-900">{dashboardStatus==='loading'? '...' : (totalChatBotUsed?.toLocaleString()||'0')}</div>
            </div>
          </div>
        )}
      </div>
      {/* Stats Cards - Thống Kê Thanh Toán (Compact) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">💰 Thống Kê Thanh Toán</h2>
          <button
            onClick={() => setShowPaymentDetails(v => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-medium text-gray-600 shadow-sm cursor-pointer"
          >{showPaymentDetails ? 'Thu gọn' : 'Chi tiết'}</button>
        </div>
        {/* Summary metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[{label:'Doanh Thu',value:totalPaymentSuccessAmount,suffix:'đ',color:'green'},{label:'Giao Dịch',value:totalPaymentTransactionCreated,color:'orange'},{label:'Thành Công',value:totalPaymentSuccess,color:'purple'},{label:'Thất Bại',value:totalPaymentFailure,color:'rose'},{label:'Đã Hủy',value:totalPaymentCancelled,color:'yellow'},{label:'Tiền Mặt',value:totalCastAmount,suffix:'đ',color:'violet'}].map((m,i)=>(
            <div key={i} className={`relative overflow-hidden rounded-xl p-3 bg-white border-l-4 shadow-sm hover:shadow-md transition-all border-${m.color}-500`}>
              <div className="text-xs font-medium text-gray-500 mb-1">{m.label}</div>
              <div className="text-lg font-bold text-gray-900">{paymentsStatsStatus==='loading'? '...' : `${m.value?.toLocaleString()||'0'}${m.suffix||''}`}</div>
            </div>
          ))}
        </div>
        {showPaymentDetails && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[{label:'TT Thất Bại (đ)',value:totalPaymentFailureAmount,color:'red-600'},{label:'TT Đã Hủy (đ)',value:totalPaymentCancelledAmount,color:'yellow-600'},{label:'PayOS Thành Công (đ)',value:totalPayOSSuccessAmount,color:'emerald-600'},{label:'PayOS Thất Bại (đ)',value:totalPayOSFailureAmount,color:'red-700'},{label:'PayOS Đã Hủy (đ)',value:totalPayOSCancelledAmount,color:'orange-600'}].map((m,i)=>(
              <div key={i} className={`bg-white rounded-xl shadow p-4 border-t-4 border-${m.color}`}>
                <div className="text-sm font-semibold text-gray-700 mb-1">{m.label}</div>
                <div className="text-xl font-bold text-gray-900">{paymentsStatsStatus==='loading' ? '...' : (m.value?.toLocaleString()||'0')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
              Tổng Quan Doanh Thu
            </h3>
            <div className="flex items-center gap-2">
              {paymentsStatsStatus === "loading" && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  fontSize={14}
                />
                <YAxis
                  fontSize={14}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: 14,
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    `${value?.toLocaleString()}đ`,
                    name === 'revenue' ? 'Tổng Doanh Thu' :
                    name === 'payOSRevenue' ? 'PayOS' :
                    name === 'castRevenue' ? 'Tiền Mặt' :
                    name === 'designRevenue' ? 'Thiết Kế' :
                    name === 'constructionRevenue' ? 'Thi Công' : name
                  ]}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 14 }}
                  formatter={(value) => (
                    value === 'revenue' ? 'Tổng Doanh Thu' :
                    value === 'payOSRevenue' ? 'PayOS' :
                    value === 'castRevenue' ? 'Tiền Mặt' :
                    value === 'designRevenue' ? 'Thiết Kế' :
                    value === 'constructionRevenue' ? 'Thi Công' : value
                  )}
                />
                <Bar dataKey="revenue" fill="#1a237e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="payOSRevenue" fill="#4caf50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="castRevenue" fill="#ff9800" radius={[4, 4, 0, 0]} />
                <Bar dataKey="designRevenue" fill="#2196f3" radius={[4, 4, 0, 0]} />
                <Bar dataKey="constructionRevenue" fill="#9c27b0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
              Trạng Thái Thanh Toán
            </h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="h-64 lg:h-80 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={true}
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
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-2">
              {orderStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payments Stats Summary Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* Payments Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
              Phân Tích Doanh Thu Chi Tiết
            </h3>
            {paymentsStatsStatus === "loading" && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "PayOS", value: paymentsStats?.payOSRevenue || 0, color: "#4caf50" },
                    { name: "Tiền Mặt", value: paymentsStats?.castRevenue || 0, color: "#ff9800" },
                    { name: "Thiết Kế", value: paymentsStats?.designRevenue || 0, color: "#2196f3" },
                    { name: "Thi Công", value: paymentsStats?.constructionRevenue || 0, color: "#9c27b0" }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent, value }) =>
                    value > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : null
                  }
                  labelLine={true}
                >
                  {[
                    { name: "PayOS", value: paymentsStats?.payOSRevenue || 0, color: "#4caf50" },
                    { name: "Tiền Mặt", value: paymentsStats?.castRevenue || 0, color: "#ff9800" },
                    { name: "Thiết Kế", value: paymentsStats?.designRevenue || 0, color: "#2196f3" },
                    { name: "Thi Công", value: paymentsStats?.constructionRevenue || 0, color: "#9c27b0" }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value?.toLocaleString()}đ`, 'Doanh Thu']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Statistics Cards */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
              Thống Kê Doanh Thu 
            </h3>
            <div className="flex items-center gap-2">
              {paymentsStatsStatus === "loading" && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
              <span className="text-xs text-gray-500">
                {selectedRangeLabel}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {/* Total Revenue */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Tổng Doanh Thu</span>
              </div>
              <span className="font-bold text-lg text-gray-900">
                {paymentsStatsStatus === "loading" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                ) : (
                  `${paymentsStats?.revenue?.toLocaleString() || "0"}đ`
                )}
              </span>
            </div>

            {/* PayOS Revenue */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Doanh Thu PayOS</span>
              </div>
              <span className="font-bold text-lg text-gray-900">
                {paymentsStatsStatus === "loading" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                ) : (
                  `${paymentsStats?.payOSRevenue?.toLocaleString() || "0"}đ`
                )}
              </span>
            </div>

            {/* Cast Revenue */}
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Doanh Thu Tiền Mặt</span>
              </div>
              <span className="font-bold text-lg text-gray-900">
                {paymentsStatsStatus === "loading" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                ) : (
                  `${paymentsStats?.castRevenue?.toLocaleString() || "0"}đ`
                )}
              </span>
            </div>

            {/* Design Revenue */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Doanh Thu Thiết Kế</span>
              </div>
              <span className="font-bold text-lg text-gray-900">
                {paymentsStatsStatus === "loading" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  `${paymentsStats?.designRevenue?.toLocaleString() || "0"}đ`
                )}
              </span>
            </div>

            {/* Construction Revenue */}
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Doanh Thu Thi Công</span>
              </div>
              <span className="font-bold text-lg text-gray-900">
                {paymentsStatsStatus === "loading" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                ) : (
                  `${paymentsStats?.constructionRevenue?.toLocaleString() || "0"}đ`
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchAdminDashboard({ startDate: startDate.toISOString(), endDate: endDate.toISOString() })).unwrap();
      await dispatch(fetchPaymentsStats({ startDate: startDate.toISOString(), endDate: endDate.toISOString() })).unwrap();
    } catch (e) {
      console.error('Refresh admin dashboard failed:', e);
    } finally { setRefreshing(false); }
  };
  const handleDateChange = () => {
    dispatch(fetchAdminDashboard({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }));
    dispatch(fetchPaymentsStats({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }));
    setDatePickerAnchor(null);
  };
  const handleQuickDateSelect = (days) => {
    setStartDate(dayjs().subtract(days, 'day'));
    setEndDate(dayjs());
  };
  const selectedRangeLabel = (() => {
    const diff = endDate.startOf('day').diff(startDate.startOf('day'), 'day') + 1;
    if (diff === 7) return '7 ngày qua';
    if (diff === 30) return '30 ngày qua';
    if (diff === 90) return '90 ngày qua';
    if (diff >= 365) return '1 năm qua';
    return `${diff} ngày`; })();

  return (
    <>
      {renderDashboardContent()}
      {/* Popover */}
      <Popover
        open={Boolean(datePickerAnchor)}
        anchorEl={datePickerAnchor}
        onClose={() => setDatePickerAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { className: 'rounded-xl shadow-xl border border-gray-200' }}}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='vi'>
          <div className='p-4 sm:p-5 w-[320px] sm:w-[380px] md:w-[420px] max-w-full'>
            <div className='flex items-start justify-between mb-4'>
              <h2 className='text-lg font-bold text-gray-800'>Chọn khoảng thời gian</h2>
              <button
                onClick={()=> setDatePickerAnchor(null)}
                className='ml-2 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
                aria-label='Đóng'
              >
                <span className='block leading-none'>×</span>
              </button>
            </div>

            {/* Quick ranges */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mb-5'>
              {[{d:7,l:'7 ngày'},{d:30,l:'30 ngày'},{d:90,l:'3 tháng'},{d:365,l:'1 năm'}].map(r=> (
                <button
                  key={r.d}
                  onClick={()=>handleQuickDateSelect(r.d)}
                  className={`text-xs sm:text-sm font-medium rounded-lg border px-2 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 cursor-pointer ${
                    startDate.isSame(dayjs().subtract(r.d,'day'),'day') && endDate.isSame(dayjs(),'day')
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >{r.l}</button>
              ))}
            </div>

            {/* Date pickers */}
            <div className='space-y-4 mb-5'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide'>Từ ngày</label>
                <DatePicker 
                  value={startDate} 
                  onChange={(v)=> setStartDate(v)} 
                  slotProps={{ textField: { size: 'small', fullWidth: true, className: '!bg-white !rounded-lg [&_input]:!text-sm' }}} 
                />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide'>Đến ngày</label>
                <DatePicker 
                  value={endDate} 
                  onChange={(v)=> setEndDate(v)} 
                  slotProps={{ textField: { size: 'small', fullWidth: true, className: '!bg-white !rounded-lg [&_input]:!text-sm' }}} 
                />
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-3'>
              <button
                onClick={handleDateChange}
                disabled={dashboardStatus === 'loading'}
                className='flex-1 inline-flex justify-center items-center gap-2 rounded-lg bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors cursor-pointer'
              >
                {dashboardStatus === 'loading' ? 'Đang tải...' : 'Áp dụng'}
              </button>
              <button
                onClick={()=> setDatePickerAnchor(null)}
                className='flex-1 inline-flex justify-center items-center gap-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 transition-colors cursor-pointer'
              >Đóng</button>
            </div>
            <div className='mt-4 text-[11px] sm:text-xs text-gray-500 font-medium flex items-center justify-between'>
              <span>Phạm vi: {selectedRangeLabel}</span>
              <span className='text-gray-400'>Từ {startDate.format('DD/MM/YYYY')} • Đến {endDate.format('DD/MM/YYYY')}</span>
            </div>
          </div>
        </LocalizationProvider>
      </Popover>
    </>
  );
};

export default AdminDashboard;
