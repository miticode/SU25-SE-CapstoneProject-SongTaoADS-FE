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
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#4caf50", "#2196f3", "#f44336"];

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
  const [paymentsTimeFilter, setPaymentsTimeFilter] = useState("30days");
  
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
      dispatch(fetchAdminDashboard());
      
      // Calculate date range based on filter
      const endDate = new Date();
      const startDate = new Date();
      
      switch(paymentsTimeFilter) {
        case "7days":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "1year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      // Set start date to beginning of day
      startDate.setHours(0, 0, 0, 0);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      // Format dates as LocalDateTime (YYYY-MM-DDTHH:mm:ss)
      const formatDateTime = (date) => {
        // Use ISO string and remove timezone info for LocalDateTime
        return date.toISOString().slice(0, 19);
      };
      
      const formattedStartDate = formatDateTime(startDate);
      const formattedEndDate = formatDateTime(endDate);
      
      console.log('Payments API request:', {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        filter: paymentsTimeFilter
      });
      
      dispatch(fetchPaymentsStats({
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }));
    }
  }, [activeTab, paymentsTimeFilter, dispatch]);

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
        <div className="relative">
          <select
            value={paymentsTimeFilter}
            onChange={(e) => setPaymentsTimeFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="7days">7 Ngày Qua</option>
            <option value="30days">30 Ngày Qua</option>
            <option value="90days">90 Ngày Qua</option>
            <option value="1year">1 Năm Qua</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
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

      {/* Stats Cards - Người Dùng & Vai Trò */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">👥 Quản Lý Người Dùng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
          {/* Total Users Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+5.2%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                totalUsers?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Tổng Người Dùng</p>
          </div>

          {/* Total Customers Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-indigo-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+8.3%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              ) : (
                totalCustomer?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Khách Hàng</p>
          </div>

          {/* Banned Users Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-red-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
              </div>
              <div className="flex items-center text-red-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+2.1%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              ) : (
                totalBannedUsers?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Người Dùng Bị Khóa</p>
          </div>

          {/* Total Sale Staff Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-pink-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-pink-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 lg:w-8 lg:h-8 text-pink-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+1.5%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
              ) : (
                totalSale?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Nhân Viên Sale</p>
          </div>

          {/* Total Staff Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-teal-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-teal-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 lg:w-8 lg:h-8 text-teal-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+0.8%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              ) : (
                totalStaff?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Nhân Viên</p>
          </div>

          {/* Total Designers Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-amber-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-amber-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 lg:w-8 lg:h-8 text-amber-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+3.2%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
              ) : (
                totalDesigner?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Thiết Kế Viên</p>
          </div>

          {/* Total Admins Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-gray-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 lg:w-8 lg:h-8 text-gray-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+0.0%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              ) : (
                totalAdmin?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Quản Trị Viên</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Thống Kê Thanh Toán */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">💰 Thống Kê Thanh Toán</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Total Revenue Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+12.5%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              ) : (
                `${totalPaymentSuccessAmount?.toLocaleString() || "0"}đ`
              )}
            </div>
            <p className="text-gray-600 text-sm">Tổng Doanh Thu</p>
          </div>

          {/* Payment Transactions Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-orange-100 rounded-full flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+8.4%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              ) : (
                totalPaymentTransactionCreated?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Tổng Giao Dịch</p>
          </div>

          {/* Successful Payments Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+15.3%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              ) : (
                totalPaymentSuccess?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Thanh Toán Thành Công</p>
          </div>

          {/* Failed Payments Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-rose-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-rose-100 rounded-full flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 lg:w-8 lg:h-8 text-rose-600" />
              </div>
              <div className="flex items-center text-red-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+2.1%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
              ) : (
                totalPaymentFailure?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Thanh Toán Thất Bại</p>
          </div>

          {/* Cancelled Payments Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-600" />
              </div>
              <div className="flex items-center text-yellow-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+1.2%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
              ) : (
                totalPaymentCancelled?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Thanh Toán Đã Hủy</p>
          </div>

          {/* Payment Failure Amount Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-red-600 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-red-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
              </div>
              <div className="flex items-center text-red-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+1.8%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              ) : (
                `${totalPaymentFailureAmount?.toLocaleString() || "0"}đ`
              )}
            </div>
            <p className="text-gray-600 text-sm">Số Tiền TT Thất Bại</p>
          </div>

          {/* Payment Cancelled Amount Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-yellow-600 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-600" />
              </div>
              <div className="flex items-center text-yellow-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+0.5%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
              ) : (
                `${totalPaymentCancelledAmount?.toLocaleString() || "0"}đ`
              )}
            </div>
            <p className="text-gray-600 text-sm">Số Tiền TT Đã Hủy</p>
          </div>

          {/* Total Cast Amount Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-violet-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-violet-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-violet-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+22.1%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
              ) : (
                `${totalCastAmount?.toLocaleString() || "0"}đ`
              )}
            </div>
            <p className="text-gray-600 text-sm">Tổng Tiền Mặt</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - PayOS & Hệ Thống */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">🔧 PayOS & Hệ Thống</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* PayOS Success Amount Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-emerald-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+18.2%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              ) : (
                `${totalPayOSSuccessAmount?.toLocaleString() || "0"}đ`
              )}
            </div>
            <p className="text-gray-600 text-sm">PayOS Thành Công</p>
          </div>

          {/* PayOS Failure Amount Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-red-700 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-red-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-red-700" />
              </div>
              <div className="flex items-center text-red-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+0.8%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-700"></div>
              ) : (
                `${totalPayOSFailureAmount?.toLocaleString() || "0"}đ`
              )}
            </div>
            <p className="text-gray-600 text-sm">PayOS Thất Bại</p>
          </div>

          {/* PayOS Cancelled Amount Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-orange-600 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-orange-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600" />
              </div>
              <div className="flex items-center text-orange-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+1.1%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              ) : (
                `${totalPayOSCancelledAmount?.toLocaleString() || "0"}đ`
              )}
            </div>
            <p className="text-gray-600 text-sm">PayOS Đã Hủy</p>
          </div>

          {/* ChatBot Usage Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-cyan-500 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-cyan-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-cyan-600" />
              </div>
              <div className="flex items-center text-green-600">
                <ChevronUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">+7.8%</span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {dashboardStatus === "loading" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
              ) : (
                totalChatBotUsed?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-gray-600 text-sm">Lượt Sử Dụng ChatBot</p>
          </div>
        </div>
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
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
                {paymentsTimeFilter === "7days" ? "7 ngày qua" :
                 paymentsTimeFilter === "30days" ? "30 ngày qua" :
                 paymentsTimeFilter === "90days" ? "90 ngày qua" :
                 paymentsTimeFilter === "1year" ? "1 năm qua" : ""}
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

  // Orders Management Content
  const renderOrdersContent = () => (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Quản Lý Đơn Hàng
        </h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Tạo Đơn Hàng
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors min-w-32">
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="Đã Hoàn Thành">Đã Hoàn Thành</option>
              <option value="Đang Xử Lý">Đang Xử Lý</option>
              <option value="Đã Hủy">Đã Hủy</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors min-w-40">
              <option value="all">Tất Cả Thời Gian</option>
              <option value="today">Hôm Nay</option>
              <option value="week">7 Ngày Gần Đây</option>
              <option value="month">30 Ngày Gần Đây</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã Đơn Hàng
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách Hàng
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số Lượng
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương Thức TT
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số Tiền
                </th>
                <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordersData.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{order.id}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-900">
                    {order.date}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === "Đã Hoàn Thành"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Đang Xử Lý"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-900">
                    {order.items}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-gray-900">
                    {order.paymentMethod}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                    {order.amount}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="p-1 text-blue-600 hover:text-blue-800 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:text-red-800 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-center justify-between sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Trước
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">1</span> đến{' '}
                <span className="font-medium">5</span> trong{' '}
                <span className="font-medium">{ordersData.length}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <div>
      {renderContent()}
    </div>
  );
};

export default AdminDashboard;
