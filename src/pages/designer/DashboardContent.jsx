import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Container,
  Avatar,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Palette as DesignIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const DashboardContent = ({ stats = {}, loading = false, error = null }) => {
  const designerStats = {
    totalCustomDesignRequestAssigned: stats?.totalCustomDesignRequestAssigned || 0,
    totalDemoSubmitted: stats?.totalDemoSubmitted || 0,
    totalDemoApproved: stats?.totalDemoApproved || 0,
    totalDemoRejected: stats?.totalDemoRejected || 0,
    totalFinalDesignSubmitted: stats?.totalFinalDesignSubmitted || 0,
  };

  const chartData = [
    { name: 'Được giao', value: designerStats.totalCustomDesignRequestAssigned, color: '#3B82F6' },
    { name: 'Demo gửi', value: designerStats.totalDemoSubmitted, color: '#6366F1' },
    { name: 'Demo duyệt', value: designerStats.totalDemoApproved, color: '#10B981' },
    { name: 'Demo từ chối', value: designerStats.totalDemoRejected, color: '#EF4444' },
    { name: 'Hoàn thành', value: designerStats.totalFinalDesignSubmitted, color: '#F59E0B' },
  ].filter(i => i.value > 0);

  const totalAll = chartData.reduce((sum, d) => sum + d.value, 0);

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          gap: 2
        }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <Typography variant="h6" color="text.secondary">
            Đang tải dữ liệu...
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
          minHeight: '50vh',
          gap: 2
        }}>
          <Typography variant="h5" color="error">
            Lỗi tải dữ liệu
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
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
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
          color="primary.main"
        >
          <AnalyticsIcon sx={{ fontSize: 36 }} />
          Dashboard Thiết Kế
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Các chỉ số thiết kế hiện có
        </Typography>
      </Box>

      {/* Simple Stats Cards - Full Width No Gaps */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <Card sx={{ 
            flex: 1,
            borderRadius: 3,
            bgcolor: '#1e293b',
            color: 'white',
            height: 130,
            cursor: 'pointer',
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
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    Thiết kế được giao
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {designerStats.totalCustomDesignRequestAssigned}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 48, height: 48 }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ 
            flex: 1,
            borderRadius: 3,
            bgcolor: '#1e293b',
            color: 'white',
            height: 130,
            cursor: 'pointer',
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
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    Demo đã gửi
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {designerStats.totalDemoSubmitted}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 48, height: 48 }}>
                  <SendIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ 
            flex: 1,
            borderRadius: 3, 
            bgcolor: '#1e293b',
            color: 'white',
            height: 130,
            cursor: 'pointer',
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
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    Demo được duyệt
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {designerStats.totalDemoApproved}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'white', color: 'success.main', width: 48, height: 48 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ 
            flex: 1,
            borderRadius: 3,
            bgcolor: '#1e293b',
            color: 'white',
            height: 130,
            cursor: 'pointer',
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
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    Demo bị từ chối
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {designerStats.totalDemoRejected}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'white', color: 'error.main', width: 48, height: 48 }}>
                  <CancelIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ 
            flex: 1,
            borderRadius: 3, 
            bgcolor: '#1e293b',
            color: 'white',
            height: 130,
            cursor: 'pointer',
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
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    Thiết kế hoàn thành
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {designerStats.totalFinalDesignSubmitted}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'white', color: 'secondary.main', width: 48, height: 48 }}>
                  <DesignIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
      </Stack>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          Phân tích trực quan
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Card sx={{ flex: 2, borderRadius: 3, p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Biểu đồ cột</Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value) => [value, 'Số lượng']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
                  />
                  <Legend />
                  <Bar dataKey="value" radius={[6,6,0,0]} style={{ cursor: 'pointer' }}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
          <Card sx={{ flex: 1, borderRadius: 3, p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Tỷ lệ trạng thái</Typography>
            <Box sx={{ height: 320, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} style={{ cursor: 'pointer' }}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value, name) => [value, name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{totalAll}</Typography>
                <Typography variant="caption" color="text.secondary">Tổng</Typography>
              </Box>
            </Box>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
};

export default DashboardContent;
