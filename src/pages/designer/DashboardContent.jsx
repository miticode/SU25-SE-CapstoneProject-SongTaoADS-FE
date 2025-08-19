import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Button,
  Container,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Palette as DesignIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
} from "recharts";

const DashboardContent = ({ stats = {}, loading = false, error = null }) => {
  // Designer dashboard stats
  const designerStats = {
    totalCustomDesignRequestAssigned: stats?.totalCustomDesignRequestAssigned || 0,
    totalDemoSubmitted: stats?.totalDemoSubmitted || 0,
    totalDemoApproved: stats?.totalDemoApproved || 0,
    totalDemoRejected: stats?.totalDemoRejected || 0,
    totalFinalDesignSubmitted: stats?.totalFinalDesignSubmitted || 0,
  };

  // Chart colors - consistent theme
  const COLORS = {
    primary: '#1976d2',
    success: '#4caf50', 
    warning: '#ff9800',
    error: '#f44336',
    purple: '#9c27b0',
  };

  // Prepare chart data từ API
  const demoStatusData = [
    { name: 'Đã duyệt', value: designerStats.totalDemoApproved, color: COLORS.success },
    { name: 'Bị từ chối', value: designerStats.totalDemoRejected, color: COLORS.error },
    { name: 'Chờ duyệt', value: designerStats.totalDemoSubmitted - designerStats.totalDemoApproved - designerStats.totalDemoRejected, color: COLORS.warning }
  ].filter(item => item.value > 0);

  const workflowData = [
    { name: 'Thiết kế được giao', value: designerStats.totalCustomDesignRequestAssigned, fill: COLORS.primary },
    { name: 'Demo đã gửi', value: designerStats.totalDemoSubmitted, fill: COLORS.warning },
    { name: 'Demo được duyệt', value: designerStats.totalDemoApproved, fill: COLORS.success },
    { name: 'Demo bị từ chối', value: designerStats.totalDemoRejected, fill: COLORS.error },
    { name: 'Thiết kế hoàn thành', value: designerStats.totalFinalDesignSubmitted, fill: COLORS.purple }
  ];

  const performanceData = [
    { 
      name: 'Tỷ lệ duyệt demo',
      value: designerStats.totalDemoSubmitted > 0 ? Math.round((designerStats.totalDemoApproved / designerStats.totalDemoSubmitted) * 100) : 0,
      fill: COLORS.success
    },
    {
      name: 'Tỷ lệ hoàn thành', 
      value: designerStats.totalCustomDesignRequestAssigned > 0 ? Math.round((designerStats.totalFinalDesignSubmitted / designerStats.totalCustomDesignRequestAssigned) * 100) : 0,
      fill: COLORS.purple
    },
    {
      name: 'Chất lượng demo',
      value: designerStats.totalDemoSubmitted > 0 ? Math.round(((designerStats.totalDemoSubmitted - designerStats.totalDemoRejected) / designerStats.totalDemoSubmitted) * 100) : 0,
      fill: COLORS.warning
    }
  ];

  // Trend data - Tạo xu hướng đơn giản dựa trên dữ liệu hiện tại
  const trendData = [
    { name: 'Tuần 1', assigned: Math.max(0, designerStats.totalCustomDesignRequestAssigned - 2), completed: Math.max(0, designerStats.totalFinalDesignSubmitted - 1) },
    { name: 'Tuần 2', assigned: Math.max(0, designerStats.totalCustomDesignRequestAssigned - 1), completed: designerStats.totalFinalDesignSubmitted },
    { name: 'Tuần 3', assigned: designerStats.totalCustomDesignRequestAssigned, completed: designerStats.totalFinalDesignSubmitted },
  ];

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: 2
        }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <Typography variant="h6" color="text.secondary">
            Đang tải dữ liệu dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: 2
        }}>
          <Typography variant="h5" color="error" gutterBottom>
            Lỗi tải dữ liệu
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Simple Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AnalyticsIcon sx={{ fontSize: 36 }} />
          Dashboard Thiết Kế
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: '1.1rem' }}
        >
          Theo dõi hiệu suất và tiến độ công việc thiết kế của bạn
        </Typography>
      </Box>

            {/* Simple Stats Cards - Full Width No Gaps */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Card sx={{ 
            flex: 1,
        borderRadius: 3,
            bgcolor: '#1e293b',
            color: 'white',
            height: 130,
            boxShadow: '0 4px 20px rgba(30, 41, 59, 0.15)',
            "&:hover": {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(30, 41, 59, 0.25)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, fontWeight: 500, color: '#94a3b8' }}>
                    Thiết kế được giao
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                    {designerStats.totalCustomDesignRequestAssigned}
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 32, opacity: 0.6, color: '#64748b' }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            flex: 1,
            borderRadius: 3,
            bgcolor: '#1e293b',
            color: 'white',
            height: 130,
            boxShadow: '0 4px 20px rgba(30, 41, 59, 0.15)',
            "&:hover": {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(30, 41, 59, 0.25)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, fontWeight: 500, color: '#94a3b8' }}>
                    Demo đã gửi
              </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                    {designerStats.totalDemoSubmitted}
              </Typography>
            </Box>
                <SendIcon sx={{ fontSize: 32, opacity: 0.6, color: '#64748b' }} />
              </Box>
        </CardContent>
      </Card>

          <Card sx={{ 
            flex: 1,
            borderRadius: 3, 
            bgcolor: '#1e293b',
            color: 'white',
            height: 130,
            boxShadow: '0 4px 20px rgba(30, 41, 59, 0.15)',
            "&:hover": {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(30, 41, 59, 0.25)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, fontWeight: 500, color: '#94a3b8' }}>
                    Demo được duyệt
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                    {designerStats.totalDemoApproved}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 32, opacity: 0.6, color: '#64748b' }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            flex: 1,
            borderRadius: 3,
            bgcolor: '#1e293b',
            color: 'white',
            height: 130,
            boxShadow: '0 4px 20px rgba(30, 41, 59, 0.15)',
            "&:hover": {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(30, 41, 59, 0.25)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, fontWeight: 500, color: '#94a3b8' }}>
                    Demo bị từ chối
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                    {designerStats.totalDemoRejected}
                  </Typography>
                </Box>
                <CancelIcon sx={{ fontSize: 32, opacity: 0.6, color: '#64748b' }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            flex: 1,
            borderRadius: 3, 
            bgcolor: '#1e293b',
            color: 'white',
            height: 130,
            boxShadow: '0 4px 20px rgba(30, 41, 59, 0.15)',
            "&:hover": {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(30, 41, 59, 0.25)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, fontWeight: 500, color: '#94a3b8' }}>
                    Thiết kế hoàn thành
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                    {designerStats.totalFinalDesignSubmitted}
                  </Typography>
                </Box>
                <DesignIcon sx={{ fontSize: 32, opacity: 0.6, color: '#64748b' }} />
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Performance Chart - Full Width */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <TimelineIcon />
                </Avatar>
                <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Quy trình làm việc
                  </Typography>
            <Typography variant="body2" color="text.secondary">
                Theo dõi tiến độ từ nhận việc đến hoàn thành
                  </Typography>
                </Box>
              </Stack>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workflowData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 14, fill: '#666', fontWeight: 500 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]}
                strokeWidth={0}
              />
            </BarChart>
          </ResponsiveContainer>
            </CardContent>
          </Card>

            {/* Demo Analysis - Full Width No Gaps */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ 
            flex: 1,
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            height: 350 
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                  <InsightsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Tình trạng Demo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phân tích chất lượng demo thiết kế
                  </Typography>
                </Box>
              </Stack>

              {demoStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={demoStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {demoStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ 
                  height: 250, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Chưa có dữ liệu demo
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ 
            flex: 1,
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            height: 350 
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Chỉ số hiệu suất
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đánh giá hiệu quả công việc
                  </Typography>
                </Box>
              </Stack>

              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={performanceData}>
                  <RadialBar
                    dataKey="value"
                    cornerRadius={8}
                    fill="#8884d8"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Hiệu suất']}
                  />
                  <Legend 
                    iconSize={12}
                    layout="horizontal"
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Trend Chart - Full Width */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Avatar sx={{ bgcolor: 'purple.main', width: 40, height: 40 }}>
              <TrendingUpIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Xu hướng hiệu suất
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Theo dõi xu hướng nhận và hoàn thành công việc theo thời gian
            </Typography>
          </Box>
          </Stack>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="assignedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 14, fill: '#666', fontWeight: 500 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area
                type="monotone"
                dataKey="assigned"
                stroke="#1976d2"
                strokeWidth={3}
                fill="url(#assignedGradient)"
                name="Được giao"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#4caf50"
                strokeWidth={3}
                fill="url(#completedGradient)"
                name="Hoàn thành"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardContent;
