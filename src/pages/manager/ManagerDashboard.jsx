import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
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
  CircularProgress,
  Alert,
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
  const [timeFilter, setTimeFilter] = useState("weekly");
  const [tasksTabValue, setTasksTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
  };

  const handleTasksTabChange = (event, newValue) => {
    setTasksTabValue(newValue);
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
          Manager Dashboard
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
        {/* Team Performance Card */}
        <Grid xs={12} sm={6} lg={3}>
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
                backgroundColor: "#2e7d32",
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
                  bgcolor: "rgba(46, 125, 50, 0.15)",
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                }}
              >
                <TeamIcon
                  sx={{
                    color: "#2e7d32",
                    fontSize: isMobile ? "1.25rem" : "1.5rem",
                  }}
                />
              </Avatar>
              <Box display="flex" alignItems="center">
                <ArrowUpIcon sx={{ color: "#2e7d32", fontSize: 16 }} />
                <Typography variant="body2" color="#2e7d32" fontWeight="medium">
                  +8.5%
                </Typography>
              </Box>
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="medium"
              my={isMobile ? 0.5 : 1}
            >
              92%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team Performance
            </Typography>
          </Paper>
        </Grid>

        {/* Active Tasks Card */}
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
                backgroundColor: "#1976d2",
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
                  bgcolor: "rgba(25, 118, 210, 0.15)",
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                }}
              >
                <TasksIcon
                  sx={{
                    color: "#1976d2",
                    fontSize: isMobile ? "1.25rem" : "1.5rem",
                  }}
                />
              </Avatar>
              <Box display="flex" alignItems="center">
                <ArrowUpIcon sx={{ color: "#2e7d32", fontSize: 16 }} />
                <Typography variant="body2" color="#2e7d32" fontWeight="medium">
                  +12.3%
                </Typography>
              </Box>
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="medium"
              my={isMobile ? 0.5 : 1}
            >
              18
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Tasks
            </Typography>
          </Paper>
        </Grid>

        {/* Team Members Card */}
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
                backgroundColor: "#ed6c02",
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
                  bgcolor: "rgba(237, 108, 2, 0.15)",
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                }}
              >
                <PeopleIcon
                  sx={{
                    color: "#ed6c02",
                    fontSize: isMobile ? "1.25rem" : "1.5rem",
                  }}
                />
              </Avatar>
              <Box display="flex" alignItems="center">
                <ArrowUpIcon sx={{ color: "#2e7d32", fontSize: 16 }} />
                <Typography variant="body2" color="#2e7d32" fontWeight="medium">
                  +2
                </Typography>
              </Box>
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="medium"
              my={isMobile ? 0.5 : 1}
            >
              12
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team Members
            </Typography>
          </Paper>
        </Grid>

        {/* Project Completion Card */}
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
                <ArrowUpIcon sx={{ color: "#2e7d32", fontSize: 16 }} />
                <Typography variant="body2" color="#2e7d32" fontWeight="medium">
                  +5.2%
                </Typography>
              </Box>
            </Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="medium"
              my={isMobile ? 0.5 : 1}
            >
              85%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Project Completion
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={isMobile ? 2 : 3} mb={isMobile ? 2 : 4}>
        {/* Team Performance Chart */}
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
                Team Performance Overview
              </Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box height={isMobile ? 250 : isTablet ? 300 : 350}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teamPerformanceData}
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
                  <Bar
                    dataKey="completed"
                    fill="#2e7d32"
                    radius={[4, 4, 0, 0]}
                    name="Completed Tasks"
                  />
                  <Bar
                    dataKey="inProgress"
                    fill="#1976d2"
                    radius={[4, 4, 0, 0]}
                    name="In Progress"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Task Status Chart */}
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
                Task Status
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
                    data={taskStatusData}
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
            </Box>
            <Box mt={isMobile ? 1 : 2}>
              <Grid container spacing={2}>
                {taskStatusData.map((item, index) => (
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
        {/* Recent Tasks */}
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
                Recent Tasks
              </Typography>
              <Button size="small" variant="text">
                View All
              </Button>
            </Box>
            <Divider />
            <Box>
              <Box sx={{ overflowX: "auto" }}>
                <Tabs
                  value={tasksTabValue}
                  onChange={handleTasksTabChange}
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
                    label="In Progress"
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
                    label="Pending"
                    sx={{
                      fontSize: isMobile ? "0.8rem" : "inherit",
                      minHeight: isMobile ? 42 : 48,
                    }}
                  />
                </Tabs>
              </Box>
              <Box sx={{ p: 0 }}>
                {recentTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
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
                          <Chip
                            label={task.priority}
                            size="small"
                            sx={{
                              backgroundColor:
                                task.priority === "High"
                                  ? "rgba(244, 67, 54, 0.1)"
                                  : task.priority === "Medium"
                                  ? "rgba(255, 152, 0, 0.1)"
                                  : "rgba(76, 175, 80, 0.1)",
                              color:
                                task.priority === "High"
                                  ? "#f44336"
                                  : task.priority === "Medium"
                                  ? "#ff9800"
                                  : "#4caf50",
                            }}
                          />
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
                              {task.id}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                backgroundColor:
                                  task.status === "Completed"
                                    ? "rgba(76, 175, 80, 0.1)"
                                    : task.status === "In Progress"
                                    ? "rgba(33, 150, 243, 0.1)"
                                    : "rgba(255, 152, 0, 0.1)",
                                color:
                                  task.status === "Completed"
                                    ? "#4caf50"
                                    : task.status === "In Progress"
                                    ? "#2196f3"
                                    : "#ff9800",
                              }}
                            >
                              {task.status}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="div"
                              variant="body2"
                              color="text.secondary"
                            >
                              {task.title}
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
                                {task.assignee}
                              </Typography>
                              {isMobile && (
                                <Chip
                                  label={task.priority}
                                  size="small"
                                  sx={{
                                    backgroundColor:
                                      task.priority === "High"
                                        ? "rgba(244, 67, 54, 0.1)"
                                        : task.priority === "Medium"
                                        ? "rgba(255, 152, 0, 0.1)"
                                        : "rgba(76, 175, 80, 0.1)",
                                    color:
                                      task.priority === "High"
                                        ? "#f44336"
                                        : task.priority === "Medium"
                                        ? "#ff9800"
                                        : "#4caf50",
                                  }}
                                />
                              )}
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < recentTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Team Members */}
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
                Team Members
              </Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Divider />
            <List disablePadding>
              {teamMembers.map((member, index) => (
                <React.Fragment key={member.id}>
                  <div
                    className={`flex items-center px-6 py-4 hover:bg-gray-50 ${
                      index !== teamMembers.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium`}
                        style={{
                          backgroundColor: `hsl(${member.id * 60}, 70%, 90%)`,
                        }}
                      >
                        {member.name.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {member.name}
                        </h3>
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-gray-500">
                            <EditIcon fontSize="small" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-500">
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {member.role}
                      </p>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>{member.tasks} active tasks</span>
                        <span>{member.completed} completed</span>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Team Management Content
  const renderTeamContent = () => (
    <Box>
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Team Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Add Team Member
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
            placeholder="Search team members..."
            size="small"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ flexGrow: 1 }}
            fullWidth={isMobile}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select label="Role">
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="designer">Designer</MenuItem>
              <MenuItem value="developer">Developer</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="team members table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Active Tasks</TableCell>
                <TableCell>Completed</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          mr: 2,
                          bgcolor: `hsl(${member.id * 60}, 70%, 90%)`,
                        }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {member.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.tasks}</TableCell>
                  <TableCell>{member.completed}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 60,
                          height: 6,
                          bgcolor: "#e0e0e0",
                          borderRadius: 3,
                          mr: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: `${
                              (member.completed /
                                (member.completed + member.tasks)) *
                              100
                            }%`,
                            height: "100%",
                            bgcolor: "#2e7d32",
                            borderRadius: 3,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(
                          (member.completed /
                            (member.completed + member.tasks)) *
                            100
                        )}
                        %
                      </Typography>
                    </Box>
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  // Task Management Content
  const renderTasksContent = () => (
    <Box>
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Task Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Create Task
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
            placeholder="Search tasks..."
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
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority">
              <MenuItem value="all">All Priority</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="tasks table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Task ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {task.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          task.status === "Completed"
                            ? "rgba(76, 175, 80, 0.1)"
                            : task.status === "In Progress"
                            ? "rgba(33, 150, 243, 0.1)"
                            : "rgba(255, 152, 0, 0.1)",
                        color:
                          task.status === "Completed"
                            ? "#4caf50"
                            : task.status === "In Progress"
                            ? "#2196f3"
                            : "#ff9800",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        backgroundColor:
                          task.priority === "High"
                            ? "rgba(244, 67, 54, 0.1)"
                            : task.priority === "Medium"
                            ? "rgba(255, 152, 0, 0.1)"
                            : "rgba(76, 175, 80, 0.1)",
                        color:
                          task.priority === "High"
                            ? "#f44336"
                            : task.priority === "Medium"
                            ? "#ff9800"
                            : "#4caf50",
                      }}
                    />
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  // Statistics Content
  const renderStatisticsContent = () => (
    <Box>
      <Box mb={3}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Team Analytics & Statistics
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
                Team Performance Trend
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
                  data={teamPerformanceData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Completed Tasks"
                  />
                  <Line
                    type="monotone"
                    dataKey="inProgress"
                    stroke="#1976d2"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="In Progress Tasks"
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
          Team Settings
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Configure team-wide settings and preferences
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Team Name"
              defaultValue="Design Team"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Team Lead"
              defaultValue="John Doe"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Team Email"
              defaultValue="team@songtaoads.com"
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Department"
              defaultValue="Design Department"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Team Description"
              defaultValue="Responsible for all design-related tasks and projects"
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
    </Box>
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
      default:
        return renderDashboardContent();
    }
  };

  return renderContent();
};

export default ManagerDashboard;
