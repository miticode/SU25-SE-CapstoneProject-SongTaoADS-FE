import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Card,
  CardContent,
  Stack,
  Divider,
  Container,
  Tooltip,
  Fade,
  Zoom,
  Grid,
  Avatar,
  Badge,
} from "@mui/material";
import { 
  Visibility as VisibilityIcon,
  SupportAgent as SupportAgentIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as OrderIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTicketsByStatus,
  selectTickets,
  selectTicketStatus,
  selectTicketError,
  fetchTicketDetail,
  selectCurrentTicket,
  saleReport,
  selectReportStatus,
  selectReportError,
  selectTicketPagination,
  deliveryToStaff,
  selectDeliveryStatus,
  selectDeliveryError,
} from "../../store/features/ticket/ticketSlice";
import S3Avatar from "../../components/S3Avatar";

// Tạo mã ticket chuyên nghiệp
const generateTicketCode = (ticket) => {
     if (!ticket?.id || !ticket?.createdAt) return "SP-000000";
  
  // Lấy 6 ký tự đầu của ID
  const idPart = ticket.id.substring(0, 6).toUpperCase();
  
  // Tạo mã dựa trên ngày tạo (format: YYMMDD)
  const date = new Date(ticket.createdAt);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
     return `SP-${year}${month}${day}-${idPart}`;
};

// Map trạng thái sang tiếng Việt và màu
const getStatusDisplay = (status) => {
  switch (status) {
    case "OPEN":
      return "CHỜ XỬ LÍ";
    case "IN_PROGRESS":
      return "ĐANG XỬ LÍ";
    case "CLOSED":
      return "ĐÃ XỬ LÍ";
    default:
      return status;
  }
};
const getStatusColor = (status) => {
  switch (status) {
    case "OPEN":
      return "error"; // Đỏ - cần xử lý ngay
    case "IN_PROGRESS":
      return "warning"; // Cam - đang xử lý
    case "CLOSED":
      return "success"; // Xanh - hoàn thành
    default:
      return "default";
  }
};

const statusOptions = [
  { value: "OPEN", label: "CHỜ XỬ LÍ" },
  { value: "IN_PROGRESS", label: "ĐANG XỬ LÍ" },
  { value: "CLOSED", label: "ĐÃ XỬ LÍ" },
];

const TicketManager = () => {
  const dispatch = useDispatch();
  const tickets = useSelector(selectTickets);
  const status = useSelector(selectTicketStatus);
  const error = useSelector(selectTicketError);
  const ticketDetail = useSelector(selectCurrentTicket);
  const reportStatus = useSelector(selectReportStatus);
  const reportError = useSelector(selectReportError);
  const pagination = useSelector(selectTicketPagination);
  const deliveryStatus = useSelector(selectDeliveryStatus);
  const deliveryError = useSelector(selectDeliveryError);

  const [open, setOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [report, setReport] = useState("");
  const [filterStatus, setFilterStatus] = useState("OPEN");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDeliveryConfirm, setOpenDeliveryConfirm] = useState(false);
  const [openDeliverySnackbar, setOpenDeliverySnackbar] = useState(false);

  useEffect(() => {
    dispatch(
      fetchTicketsByStatus({
        status: filterStatus,
        page: page + 1,
        size: rowsPerPage,
      })
    );
  }, [dispatch, filterStatus, page, rowsPerPage]);

  const handleView = (ticket) => {
    setSelectedTicketId(ticket.id);
    dispatch(fetchTicketDetail(ticket.id));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTicketId(null);
    setReport("");
  };

  const handleReportSubmit = () => {
    if (!report.trim()) return;
    dispatch(
      saleReport({ ticketId: selectedTicketId, reportData: { report } })
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setReport("");
        setOpenSnackbar(true);
        dispatch(fetchTicketDetail(selectedTicketId));
      }
    });
  };

  const handleChangeStatus = (e) => {
    setFilterStatus(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSendToStaff = () => {
    setOpenDeliveryConfirm(true);
  };

  const handleConfirmDelivery = () => {
    setOpenDeliveryConfirm(false);
    dispatch(deliveryToStaff(selectedTicketId)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setOpenDeliverySnackbar(true);
        dispatch(fetchTicketDetail(selectedTicketId));
      }
    });
  };

  if (status === "loading") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Card sx={{ 
        mb: 3, 
        background: "linear-gradient(135deg, #030C20 0%, #030C20 50%, #030C20 100%)",
        color: "white",
        borderRadius: 3,      
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        },
      }}>
        <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar sx={{ 
              bgcolor: "rgba(255, 255, 255, 0.2)", 
              width: 56, 
              height: 56,
              border: "2px solid rgba(255, 255, 255, 0.3)"
            }}>
              <SupportAgentIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Quản lý Hỗ trợ Khách hàng
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Theo dõi và xử lý các yêu cầu hỗ trợ từ khách hàng
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: "rgba(255, 255, 255, 0.8)" }}>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                label="Trạng thái"
                onChange={handleChangeStatus}
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                }}
              >
                {statusOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Làm mới danh sách" arrow>
              <IconButton
                onClick={() => {
                  dispatch(
                    fetchTicketsByStatus({
                      status: filterStatus,
                      page: page + 1,
                      size: rowsPerPage,
                    })
                  );
                }}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>
      <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#030C20" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                  Mã Hỗ trợ
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                  Mã Đơn Hàng
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                  Khách hàng
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                  Loại hỗ trợ
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                  Trạng thái
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>
                  Ngày tạo
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", textAlign: "center", color: "white" }}>
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
                       <TableBody>
              {tickets && tickets.length > 0 ? (
                tickets.map((tk) => (
                  <TableRow 
                    key={tk.id} 
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                        transform: "scale(1.001)",
                        transition: "all 0.2s ease",
                      },
                      "&:nth-of-type(odd)": {
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {generateTicketCode(tk)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      <Typography variant="body2" color="text.secondary">
                        {tk.orders?.orderCode || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <S3Avatar
                          s3Key={tk.customer?.avatar}
                          sx={{
                            width: 32,
                            height: 32,
                            background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                            fontSize: "0.8rem"
                          }}
                        >
                          {(tk.customer?.fullName || tk.customer || "K").charAt(0).toUpperCase()}
                        </S3Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {tk.customer?.fullName || tk.customer || "Chưa có thông tin"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {tk.title || tk.type || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDisplay(tk.status)}
                        color={getStatusColor(tk.status)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          "& .MuiChip-label": {
                            px: 1.5,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(tk.createdAt).toLocaleString("vi-VN")}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết" arrow>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleView(tk)}
                          sx={{
                            bgcolor: "rgba(25, 118, 210, 0.1)",
                            "&:hover": {
                              bgcolor: "rgba(25, 118, 210, 0.2)",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <SupportAgentIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Không có yêu cầu hỗ trợ nào
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Hiện tại không có ticket nào trong trạng thái này
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
                  </Table>
        </TableContainer>
      </Card>
      
      <Box sx={{ mt: 2 }}>
        <TablePagination
          component="div"
          count={pagination.totalElements || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang"
        />
      </Box>
      {/* Dialog chi tiết hỗ trợ */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }
        }}
      >
        <DialogTitle sx={{ 
          background: "linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #42a5f5 100%)",
          color: "white",
          fontWeight: 700,
          fontSize: "1.5rem",
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <SupportAgentIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" component="div">
              Chi tiết Yêu cầu Hỗ trợ
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {!ticketDetail ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={100}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box mb={2}>
              {/* Thông tin cơ bản */}
                             <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                 Thông tin Yêu cầu Hỗ trợ
               </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                                 <Box>
                   <Typography variant="subtitle2" color="text.secondary">
                     Mã Hỗ trợ
                   </Typography>
                   <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                     {generateTicketCode(ticketDetail)}
                   </Typography>
                 </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={getStatusDisplay(ticketDetail.status)}
                    color={getStatusColor(ticketDetail.status)}
                    sx={{ mt: 0.5, fontWeight: 600 }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                                     <Typography variant="subtitle2" color="text.secondary">
                     Loại hỗ trợ
                   </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ticketDetail.title || ticketDetail.type}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mức độ ưu tiên
                  </Typography>
                  <Chip
                    label={ticketDetail.severity}
                    color={ticketDetail.severity === 'HIGH' ? 'error' : ticketDetail.severity === 'MEDIUM' ? 'warning' : 'info'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mô tả vấn đề
                </Typography>
                <Typography variant="body1" sx={{ 
                  backgroundColor: 'grey.50', 
                  p: 1.5, 
                  borderRadius: 1, 
                  border: '1px solid',
                  borderColor: 'grey.200',
                  mt: 0.5
                }}>
                  {ticketDetail.description}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(ticketDetail.createdAt).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(ticketDetail.updatedAt).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
              </Box>

              {/* Thông tin khách hàng */}
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600, mt: 3 }}>
                Thông tin Khách hàng
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <S3Avatar
                  s3Key={ticketDetail.customer?.avatar}
                  sx={{
                    width: 64,
                    height: 64,
                    mr: 2,
                    background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                    fontSize: "1.5rem",
                    fontWeight: 600,
                  }}
                >
                  {ticketDetail.customer?.fullName?.charAt(0)?.toUpperCase() || "K"}
                </S3Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {ticketDetail.customer?.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ticketDetail.customer?.email}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ticketDetail.customer?.phone}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ticketDetail.customer?.address || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ticketDetail.customer?.phone}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ticketDetail.customer?.address || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Box>

              {/* Thông tin đơn hàng */}
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600, mt: 3 }}>
                Thông tin Đơn hàng
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã đơn hàng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                    {ticketDetail.orders?.orderCode}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loại đơn hàng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ticketDetail.orders?.orderType}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái đơn hàng
                  </Typography>
                  <Chip
                    label={ticketDetail.orders?.status}
                    color={ticketDetail.orders?.status === 'PENDING_CONTRACT' ? 'warning' : 'success'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Địa chỉ giao hàng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ticketDetail.orders?.address}
                  </Typography>
                </Box>
              </Box>

              {/* Thông tin tài chính */}
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600, mt: 3 }}>
                Thông tin Tài chính
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tổng tiền đơn hàng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {ticketDetail.orders?.totalOrderAmount?.toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đã đặt cọc
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {ticketDetail.orders?.totalOrderDepositAmount?.toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Còn lại
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {ticketDetail.orders?.totalOrderRemainingAmount?.toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày tạo đơn hàng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(ticketDetail.orders?.createdAt).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
              </Box>

              {/* Thông tin thiết kế */}
              {ticketDetail.orders?.totalDesignAmount > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600, mt: 3 }}>
                    Thông tin Thiết kế
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tổng tiền thiết kế
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {ticketDetail.orders?.totalDesignAmount?.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Đã đặt cọc thiết kế
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {ticketDetail.orders?.depositDesignAmount?.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}

              {/* Thông tin xây dựng */}
              {ticketDetail.orders?.totalConstructionAmount > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600, mt: 3 }}>
                    Thông tin Xây dựng
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tổng tiền xây dựng
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {ticketDetail.orders?.totalConstructionAmount?.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Đã đặt cọc xây dựng
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {ticketDetail.orders?.depositConstructionAmount?.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Box>
                  </Box>

                  {/* Thông tin nhà thầu */}
                  {ticketDetail.orders?.contractors && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Nhà thầu thi công
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {ticketDetail.orders.contractors.companyName || ticketDetail.orders.contractors.fullName}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {/* Ghi chú đơn hàng */}
              {ticketDetail.orders?.note && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ghi chú đơn hàng
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    backgroundColor: 'grey.50', 
                    p: 1.5, 
                    borderRadius: 1, 
                    border: '1px solid',
                    borderColor: 'grey.200',
                    mt: 0.5
                  }}>
                    {ticketDetail.orders.note}
                  </Typography>
                </Box>
              )}

              {/* Thông tin Staff xử lý - chỉ hiển thị khi severity = PRODUCTION và có staff */}
              {ticketDetail.severity === "PRODUCTION" && ticketDetail.staff && (
                <Box sx={{ 
                  mt: 3, 
                  p: 3, 
                  backgroundColor: 'primary.50', 
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'primary.200',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: 'primary.main',
                    borderRadius: '2px 2px 0 0'
                  }
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    color: 'primary.main', 
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box component="span" sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main',
                      display: 'inline-block'
                    }} />
                    Thông tin Staff xử lý
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Họ tên Staff
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                        {ticketDetail.staff.fullName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                        {ticketDetail.staff.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                        {ticketDetail.staff.phone}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Vai trò
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                        {ticketDetail.staff.roles?.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Giải pháp đã xử lý */}
              {ticketDetail.solution && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'success.main', fontWeight: 600 }}>
                    Giải pháp đã xử lý
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    backgroundColor: 'success.50', 
                    p: 1.5, 
                    borderRadius: 1, 
                    border: '1px solid',
                    borderColor: 'success.200',
                    color: 'success.dark'
                  }}>
                    {ticketDetail.solution}
                  </Typography>
                </Box>
              )}
              {/* Form phản hồi hoặc thông báo đã hỗ trợ */}
              {ticketDetail.status === "CLOSED" ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Vấn đề này đã được hỗ trợ và phản hồi. Không thể gửi thêm phản
                  hồi.
                </Alert>
              ) : ticketDetail.staff ||
                ticketDetail.status === "IN_PROGRESS" ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  ĐÃ GỬI CHO BỘ PHẬN QUẢN LÝ, VUI LÒNG ĐỢI PHẢN HỒI.
                </Alert>
              ) : (
                <Box mt={2}>
                  <Typography fontWeight={600} mb={1}>
                    Phản hồi cho khách hàng:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    disabled={reportStatus === "loading"}
                  />
                  <Box display="flex" gap={2} mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleReportSubmit}
                      disabled={reportStatus === "loading" || !report.trim()}
                    >
                      {reportStatus === "loading" ? (
                        <CircularProgress size={20} />
                      ) : (
                        "GỬI PHẢN HỒI"
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleSendToStaff}
                      disabled={deliveryStatus === "loading"}
                    >
                      {deliveryStatus === "loading" ? (
                        <CircularProgress size={20} />
                      ) : (
                        "GỬI CHO BỘ PHẬN QUẢN LÝ"
                      )}
                    </Button>
                  </Box>
                  {reportError && (
                    <Typography color="error" mt={1}>
                      {reportError}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
             {/* Confirm Dialog chuyển hỗ trợ */}
       <Dialog
         open={openDeliveryConfirm}
         onClose={() => setOpenDeliveryConfirm(false)}
       >
         <DialogTitle>Xác nhận chuyển yêu cầu hỗ trợ</DialogTitle>
        <DialogContent>
                     <Typography>
             Bạn chắc chắn muốn chuyển yêu cầu hỗ trợ này cho bộ phận sản xuất (staff) xử
             lý?
           </Typography>
          {deliveryError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deliveryError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeliveryConfirm(false)}>Huỷ</Button>
          <Button
            onClick={handleConfirmDelivery}
            variant="contained"
            color="secondary"
            disabled={deliveryStatus === "loading"}
            startIcon={
              deliveryStatus === "loading" ? (
                <CircularProgress size={18} />
              ) : null
            }
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
             {/* Snackbar chuyển hỗ trợ thành công */}
      <Snackbar
        open={openDeliverySnackbar}
        autoHideDuration={2500}
        onClose={() => setOpenDeliverySnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setOpenDeliverySnackbar(false)}
        >
                     Chuyển yêu cầu hỗ trợ cho staff thành công!
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2500}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setOpenSnackbar(false)}
        >
          Gửi phản hồi thành công!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TicketManager;
