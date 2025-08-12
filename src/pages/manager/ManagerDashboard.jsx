import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as TasksIcon,
  Group as TeamIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CompletedIcon,
  LocalShipping as ShippingIcon,
  Settings as TicketIcon,
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
  selectStaffDashboard,
  selectDashboardStatus,
  selectDashboardError,
  selectDashboardLastUpdated
} from "../../store/features/dashboard/dashboardSlice";
import TicketManager from "./TicketManager";

// Mock data for manager dashboard
const teamPerformanceData = [
  { month: "Jan", completed: 85, inProgress: 15 },
  { month: "Feb", completed: 78, inProgress: 22 },
  { month: "Mar", completed: 92, inProgress: 8 },
  { month: "Apr", completed: 88, inProgress: 12 },
  { month: "May", completed: 95, inProgress: 5 },
  { month: "Jun", completed: 90, inProgress: 10 },
];

const taskStatusData = [
  { name: "Completed", value: 65 },
  { name: "In Progress", value: 25 },
  { name: "Pending", value: 10 },
];

const COLORS = ["#4caf50", "#2196f3", "#ff9800"];

const recentTasks = [
  {
    id: "TASK-001",
    title: "Website Redesign",
    assignee: "John Doe",
    dueDate: "2024-03-28",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "TASK-002",
    title: "Social Media Campaign",
    assignee: "Jane Smith",
    dueDate: "2024-03-27",
    status: "Completed",
    priority: "Medium",
  },
  {
    id: "TASK-003",
    title: "Client Meeting",
    assignee: "Mike Johnson",
    dueDate: "2024-03-26",
    status: "Pending",
    priority: "High",
  },
  {
    id: "TASK-004",
    title: "Content Creation",
    assignee: "Sarah Wilson",
    dueDate: "2024-03-25",
    status: "In Progress",
    priority: "Low",
  },
];

const teamMembers = [
  {
    id: 1,
    name: "John Doe",
    role: "Senior Designer",
    tasks: 5,
    completed: 12,
    avatar: null,
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Content Writer",
    tasks: 3,
    completed: 8,
    avatar: null,
  },
  {
    id: 3,
    name: "Mike Johnson",
    role: "Developer",
    tasks: 4,
    completed: 15,
    avatar: null,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    role: "Marketing Specialist",
    tasks: 6,
    completed: 10,
    avatar: null,
  },
];

const ManagerDashboard = () => {
  const { activeTab } = useOutletContext();
  const dispatch = useDispatch();
  
  // Redux selectors for dashboard data
  const dashboardData = useSelector(selectStaffDashboard);
  const dashboardStatus = useSelector(selectDashboardStatus);
  const dashboardError = useSelector(selectDashboardError);
  const lastUpdated = useSelector(selectDashboardLastUpdated);
  
  const [timeFilter, setTimeFilter] = useState("weekly");
  const [tasksTabValue, setTasksTabValue] = useState(0);

  // Fetch dashboard data on component mount
  useEffect(() => {
    dispatch(fetchStaffDashboard());
  }, [dispatch]);

  // Handle refresh dashboard data
  const handleRefreshDashboard = () => {
    dispatch(fetchStaffDashboard());
  };

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
  };

  const handleTasksTabChange = (event, newValue) => {
    setTasksTabValue(newValue);
  };

  // Dashboard Content
  const renderDashboardContent = () => (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
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
                </Select>
              </FormControl>
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
        {dashboardError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            <Typography className="!text-red-700">{dashboardError}</Typography>
          </div>
        )}
      </div>

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
              {dashboardStatus === 'loading' ? '...' : dashboardData.productingOrders.toLocaleString()}
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
              {dashboardStatus === 'loading' ? '...' : dashboardData.productionCompletedOrders.toLocaleString()}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Đơn hàng hoàn thành sản xuất
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-50 rounded-full opacity-20"></div>
        </div>

        {/* Tickets đang xử lý */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TicketIcon className="!text-purple-600" />
            </div>
            {dashboardStatus === 'loading' && (
              <CircularProgress size={20} className="!text-purple-600" />
            )}
          </div>
          <div className="space-y-2">
            <Typography variant="h4" className="!font-bold !text-purple-600">
              {dashboardStatus === 'loading' ? '...' : dashboardData.inprogressTickets.toLocaleString()}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Tickets đang xử lý
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-purple-50 rounded-full opacity-20"></div>
        </div>

        {/* Đơn hàng hoàn thành */}
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
              {dashboardStatus === 'loading' ? '...' : dashboardData.completedOrders.toLocaleString()}
            </Typography>
            <Typography variant="body2" className="!text-gray-600 !font-medium">
              Đơn hàng hoàn thành
            </Typography>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-emerald-50 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Team Performance Chart */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <Typography variant="h6" className="!font-semibold !text-gray-800">
                📈 Team Performance Overview
              </Typography>
              <button className="w-8 h-8 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-200">
                <MoreVertIcon />
              </button>
            </div>
            <div className="h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teamPerformanceData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 14 }} />
                  <YAxis tick={{ fontSize: 14 }} width={40} />
                  <Tooltip contentStyle={{ fontSize: 14, borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 14 }} />
                  <Bar
                    dataKey="completed"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Completed Tasks"
                  />
                  <Bar
                    dataKey="inProgress"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="In Progress"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task Status Chart */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <Typography variant="h6" className="!font-semibold !text-gray-800">
                📊 Task Status
              </Typography>
              <button className="w-8 h-8 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-200">
                <MoreVertIcon />
              </button>
            </div>
            <div className="h-64 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {taskStatusData.map((entry, index) => (
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
              <div className="grid grid-cols-3 gap-2">
                {taskStatusData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full mb-1"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <Typography variant="body2" className="!text-center !text-xs !text-gray-600">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" className="!text-center !text-xs !font-bold !text-gray-800">
                      {item.value}%
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <Typography variant="h6" className="!font-semibold !text-gray-800">
                📋 Recent Tasks
              </Typography>
              <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors duration-200">
                View All
              </button>
            </div>
            
            <div className="border-b border-gray-100">
              <Tabs
                value={tasksTabValue}
                onChange={handleTasksTabChange}
                indicatorColor="primary"
                textColor="primary"
                className="px-6"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="All" className="!text-sm !min-h-12" />
                <Tab label="In Progress" className="!text-sm !min-h-12" />
                <Tab label="Completed" className="!text-sm !min-h-12" />
                <Tab label="Pending" className="!text-sm !min-h-12" />
              </Tabs>
            </div>

            <div className="divide-y divide-gray-100">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Typography variant="body1" className="!font-semibold !text-gray-800">
                          {task.id}
                        </Typography>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : task.status === "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <Typography variant="body2" className="!text-gray-600 !mb-2">
                        {task.title}
                      </Typography>
                      <div className="flex items-center justify-between">
                        <Typography variant="body2" className="!text-gray-500">
                          {task.assignee}
                        </Typography>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <Typography variant="h6" className="!font-semibold !text-gray-800">
                👥 Team Members
              </Typography>
              <button className="w-8 h-8 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-200">
                <MoreVertIcon />
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium text-white"
                      style={{
                        backgroundColor: `hsl(${member.id * 60}, 70%, 50%)`,
                      }}
                    >
                      {member.name.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <Typography variant="body2" className="!font-semibold !text-gray-800">
                        {member.name}
                      </Typography>
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors duration-200">
                          <EditIcon className="!text-sm" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600 transition-colors duration-200">
                          <DeleteIcon className="!text-sm" />
                        </button>
                      </div>
                    </div>
                    <Typography variant="body2" className="!text-gray-500 !mt-1">
                      {member.role}
                    </Typography>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{member.tasks} active tasks</span>
                      <span>{member.completed} completed</span>
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

  // Team Management Content
  const renderTeamContent = () => (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Typography variant="h4" className="!font-bold !text-gray-800 !mb-2">
            👥 Team Management
          </Typography>
          <Typography variant="body1" className="!text-gray-600">
            Quản lý thành viên trong nhóm
          </Typography>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2">
          <AddIcon />
          Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <TextField
              variant="outlined"
              placeholder="Search team members..."
              size="small"
              className="flex-1 !w-full sm:!w-auto"
              InputProps={{
                startAdornment: <SearchIcon className="!text-gray-400 !mr-2" />,
              }}
            />
            <FormControl variant="outlined" size="small" className="!min-w-[120px]">
              <InputLabel>Role</InputLabel>
              <Select label="Role" defaultValue="all">
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="designer">Designer</MenuItem>
                <MenuItem value="developer">Developer</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <TableCell className="!font-bold !text-gray-700">Name</TableCell>
                <TableCell className="!font-bold !text-gray-700">Role</TableCell>
                <TableCell className="!font-bold !text-gray-700">Active Tasks</TableCell>
                <TableCell className="!font-bold !text-gray-700">Completed</TableCell>
                <TableCell className="!font-bold !text-gray-700">Performance</TableCell>
                <TableCell align="center" className="!font-bold !text-gray-700">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3"
                        style={{ backgroundColor: `hsl(${member.id * 60}, 70%, 50%)` }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <Typography variant="body2" className="!font-semibold !text-gray-800">
                        {member.name}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell className="!text-gray-600">{member.role}</TableCell>
                  <TableCell className="!text-gray-600">{member.tasks}</TableCell>
                  <TableCell className="!text-gray-600">{member.completed}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${(member.completed / (member.completed + member.tasks)) * 100}%`,
                          }}
                        />
                      </div>
                      <Typography variant="body2" className="!text-gray-600">
                        {Math.round((member.completed / (member.completed + member.tasks)) * 100)}%
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                        <EditIcon className="!text-sm" />
                      </button>
                      <button className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                        <DeleteIcon className="!text-sm" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  // Task Management Content
  const renderTasksContent = () => (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Typography variant="h4" className="!font-bold !text-gray-800 !mb-2">
            📋 Task Management
          </Typography>
          <Typography variant="body1" className="!text-gray-600">
            Quản lý và theo dõi các nhiệm vụ
          </Typography>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2">
          <AddIcon />
          Create Task
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <TextField
              variant="outlined"
              placeholder="Search tasks..."
              size="small"
              className="flex-1 !w-full lg:!w-auto"
              InputProps={{
                startAdornment: <SearchIcon className="!text-gray-400 !mr-2" />,
              }}
            />
            <div className="flex gap-2 w-full lg:w-auto">
              <FormControl variant="outlined" size="small" className="!min-w-[120px] flex-1 lg:flex-none">
                <InputLabel>Status</InputLabel>
                <Select label="Status" defaultValue="all">
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="outlined" size="small" className="!min-w-[120px] flex-1 lg:flex-none">
                <InputLabel>Priority</InputLabel>
                <Select label="Priority" defaultValue="all">
                  <MenuItem value="all">All Priority</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <TableCell className="!font-bold !text-gray-700">Task ID</TableCell>
                <TableCell className="!font-bold !text-gray-700">Title</TableCell>
                <TableCell className="!font-bold !text-gray-700">Assignee</TableCell>
                <TableCell className="!font-bold !text-gray-700">Due Date</TableCell>
                <TableCell className="!font-bold !text-gray-700">Status</TableCell>
                <TableCell className="!font-bold !text-gray-700">Priority</TableCell>
                <TableCell align="center" className="!font-bold !text-gray-700">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Typography variant="body2" className="!font-semibold !text-gray-800">
                      {task.id}
                    </Typography>
                  </TableCell>
                  <TableCell className="!text-gray-600">{task.title}</TableCell>
                  <TableCell className="!text-gray-600">{task.assignee}</TableCell>
                  <TableCell className="!text-gray-600">{task.dueDate}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : task.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {task.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {task.priority}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                        <EditIcon className="!text-sm" />
                      </button>
                      <button className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                        <DeleteIcon className="!text-sm" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  // Statistics Content
  const renderStatisticsContent = () => (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
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
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
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
      default:
        return renderDashboardContent();
    }
  };

  return renderContent();
};

export default ManagerDashboard;
