import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminDashboard } from "../../store/features/dashboard/dashboardSlice";
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
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Hàng Ngày</option>
            <option value="weekly">Hàng Tuần</option>
            <option value="monthly">Hàng Tháng</option>
            <option value="yearly">Hàng Năm</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Dashboard Error Alert */}
      {dashboardError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5" />
          {dashboardError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Revenue Card */}
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
              `${adminDashboard.totalRevenue?.toLocaleString() || "0"}đ`
            )}
          </div>
          <p className="text-gray-600 text-sm">Tổng Doanh Thu</p>
        </div>

        {/* Users Card */}
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
              adminDashboard.totalUsers?.toLocaleString() || "0"
            )}
          </div>
          <p className="text-gray-600 text-sm">Tổng Người Dùng</p>
        </div>

        {/* Orders Card */}
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
              adminDashboard.totalOrders?.toLocaleString() || "0"
            )}
          </div>
          <p className="text-gray-600 text-sm">Tổng Đơn Hàng</p>
        </div>

        {/* Active Contracts Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
            </div>
            <div className="flex items-center text-red-600">
              <ChevronDownIcon className="w-4 h-4" />
              <span className="text-sm font-medium">-2.1%</span>
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {dashboardStatus === "loading" ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            ) : (
              adminDashboard.activeContracts?.toLocaleString() || "0"
            )}
          </div>
          <p className="text-gray-600 text-sm">Hợp Đồng Đang Hoạt Động</p>
        </div>

        {/* Completed Orders Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden border-t-4 border-cyan-500 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-cyan-100 rounded-full flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 lg:w-8 lg:h-8 text-cyan-600" />
            </div>
            <div className="flex items-center text-green-600">
              <ChevronUpIcon className="w-4 h-4" />
              <span className="text-sm font-medium">+15.3%</span>
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {dashboardStatus === "loading" ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
            ) : (
              adminDashboard.completedOrders?.toLocaleString() || "0"
            )}
          </div>
          <p className="text-gray-600 text-sm">Đơn Hàng Đã Hoàn Thành</p>
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
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
            </button>
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
                />
                <Legend wrapperStyle={{ fontSize: 14 }} />
                <Bar dataKey="revenue" fill="#1a237e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
              Trạng Thái Đơn Hàng
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

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex justify-between items-center px-4 lg:px-6 py-4">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
              Đơn Hàng Gần Đây
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
              Xem Tất Cả
            </button>
          </div>
          <div className="border-t border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-4 lg:px-6" aria-label="Tabs">
                <button
                  onClick={() => setOrdersTabValue(0)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    ordersTabValue === 0
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Tất Cả
                </button>
                <button
                  onClick={() => setOrdersTabValue(1)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    ordersTabValue === 1
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Đã Hoàn Thành
                </button>
                <button
                  onClick={() => setOrdersTabValue(2)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    ordersTabValue === 2
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Đang Xử Lý
                </button>
                <button
                  onClick={() => setOrdersTabValue(3)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    ordersTabValue === 3
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Đã Hủy
                </button>
              </nav>
            </div>
            <div className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 lg:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          {order.id}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "Đã Hoàn Thành"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Đang Xử Lý"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {order.customer}
                      </div>
                      <div className="flex justify-between items-center lg:justify-start lg:gap-8">
                        <div className="text-sm text-gray-500">
                          {order.date}
                        </div>
                        <div className="font-semibold text-gray-900 lg:hidden">
                          {order.amount}
                        </div>
                      </div>
                    </div>
                    <div className="hidden lg:block font-semibold text-gray-900">
                      {order.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-fit">
          <div className="flex justify-between items-center px-4 lg:px-6 py-4">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
              Sản Phẩm Bán Chạy Nhất
            </h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="border-t border-gray-200">
            <div className="divide-y divide-gray-200">
              {topSellingProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 lg:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white"
                        style={{ backgroundColor: `hsl(${product.id * 60}, 70%, 50%)` }}
                      >
                        {product.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {product.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center lg:flex-col lg:items-end lg:gap-1 pl-13 lg:pl-0">
                      <div className="text-xs text-gray-500 lg:order-2">
                        Đã Bán: {product.sold}
                      </div>
                      <div className="font-semibold text-gray-900 lg:order-1">
                        {product.revenue}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
