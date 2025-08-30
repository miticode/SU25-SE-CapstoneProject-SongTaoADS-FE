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
  fetchAllTickets,
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
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `SP-${year}${month}${day}-${idPart}`;
};

// Map trạng thái sang tiếng Việt và màu
const getStatusDisplay = (status) => {
  switch (status) {
    // Trạng thái ticket
    case "OPEN":
      return "Chờ xử lý";
    case "IN_PROGRESS":
      return "Đang xử lý";
    case "CLOSED":
      return "Đã xử lý";
    case "PENDING":
      return "Chờ xử lý";
    case "PROCESSING":
      return "Đang xử lý";
    case "COMPLETED":
      return "Hoàn thành";
    case "WAITING_CUSTOMER_APPROVAL":
      return "Chờ khách hàng phê duyệt";
    case "APPROVED":
      return "Đã phê duyệt";
    case "REJECTED":
      return "Đã từ chối";

    // Mức độ ưu tiên
    case "HIGH":
      return "Cao";
    case "MEDIUM":
      return "Trung bình";
    case "LOW":
      return "Thấp";
    case "PRODUCTION":
      return "Sản xuất";

    // Loại đơn hàng
    case "CUSTOM_DESIGN_WITH_CONSTRUCTION":
      return "Thiết kế và thi công";
    case "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION":
      return "Thiết kế không thi công";
    case "AI_DESIGN":
      return "Thiết kế AI";

    // Trạng thái thiết kế
    case "PENDING_DESIGN":
      return "Chờ thiết kế";
    case "NEED_DEPOSIT_DESIGN":
      return "Cần đặt cọc thiết kế";
    case "DEPOSITED_DESIGN":
      return "Đã đặt cọc thiết kế";
    case "NEED_FULLY_PAID_DESIGN":
      return "Cần thanh toán đủ thiết kế";
    case "WAITING_FINAL_DESIGN":
      return "Chờ thiết kế cuối cùng";
    case "DESIGN_COMPLETED":
      return "Thiết kế hoàn thành";
    case "AWAITING_DESIGN":
      return "Chờ thiết kế";
    case "DESIGN_IN_PROGRESS":
      return "Đang thiết kế";

    // Trạng thái hợp đồng
    case "PENDING_CONTRACT":
      return "Chờ ký hợp đồng";
    case "CONTRACT_SENT":
      return "Đã gửi hợp đồng";
    case "CONTRACT_SIGNED":
      return "Đã ký hợp đồng";
    case "CONTRACT_DISCUSS":
      return "Thảo luận hợp đồng";
    case "CONTRACT_RESIGNED":
      return "Ký lại hợp đồng";
    case "CONTRACT_CONFIRMED":
      return "Xác nhận hợp đồng";

    // Trạng thái sản xuất và thực hiện
    case "DEPOSITED":
      return "Đã đặt cọc";
    case "PRODUCING":
      return "Đang sản xuất";
    case "PRODUCTION_COMPLETED":
      return "Hoàn thành sản xuất";
    case "DELIVERING":
      return "Đang giao hàng";
    case "INSTALLED":
      return "Đã lắp đặt";
    case "ORDER_COMPLETED":
      return "Đơn hàng hoàn thành";
    case "CANCELLED":
      return "Đã hủy";

    // Trạng thái thi công
    case "NEED_DEPOSIT_CONSTRUCTION":
      return "Cần đặt cọc thi công";
    case "CONSTRUCTION_IN_PROGRESS":
      return "Đang thi công";
    case "CONSTRUCTION_COMPLETED":
      return "Thi công hoàn thành";

    // Trạng thái giao hàng và thanh toán
    case "DELIVERED":
      return "Đã giao hàng";
    case "PAYMENT_PENDING":
      return "Chờ thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "REFUNDED":
      return "Đã hoàn tiền";

    default:
      return status;
  }
};
const getStatusColor = (status) => {
  switch (status) {
    case "OPEN":
    case "PENDING":
      return "error"; // Đỏ - cần xử lý ngay
    case "IN_PROGRESS":
    case "PROCESSING":
    case "WAITING_CUSTOMER_APPROVAL":
      return "warning"; // Cam - đang xử lý
    case "CLOSED":
    case "COMPLETED":
    case "APPROVED":
      return "success"; // Xanh - hoàn thành
    case "REJECTED":
    case "CANCELLED":
      return "error"; // Đỏ - bị từ chối/hủy
    case "PENDING_CONTRACT":
    case "CONTRACT_SENT":
    case "CONTRACT_DISCUSS":
      return "info"; // Xanh dương - chờ xử lý hợp đồng
    case "CONTRACT_SIGNED":
    case "CONTRACT_CONFIRMED":
    case "DEPOSITED":
      return "success"; // Xanh - đã hoàn thành
    case "PRODUCING":
    case "CONSTRUCTION_IN_PROGRESS":
    case "DELIVERING":
      return "warning"; // Cam - đang thực hiện
    case "PRODUCTION_COMPLETED":
    case "CONSTRUCTION_COMPLETED":
    case "DELIVERED":
    case "INSTALLED":
    case "ORDER_COMPLETED":
    case "PAID":
      return "success"; // Xanh - hoàn thành
    case "PAYMENT_PENDING":
    case "NEED_DEPOSIT_DESIGN":
    case "NEED_DEPOSIT_CONSTRUCTION":
    case "NEED_FULLY_PAID_DESIGN":
      return "warning"; // Cam - cần hành động
    case "REFUNDED":
      return "info"; // Xanh dương - đã hoàn tiền
    default:
      return "default";
  }
};

const statusOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "OPEN", label: "Chờ xử lý" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "CLOSED", label: "Đã xử lý" },
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
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDeliveryConfirm, setOpenDeliveryConfirm] = useState(false);
  const [openDeliverySnackbar, setOpenDeliverySnackbar] = useState(false);

  useEffect(() => {
    // Thử gọi API filter trước, nếu không được thì fallback về lấy tất cả
    if (filterStatus === "ALL") {
      dispatch(fetchAllTickets({ page: page + 1, size: rowsPerPage }));
    } else {
      // Thử gọi API filter
      dispatch(
        fetchTicketsByStatus({
          status: filterStatus,
          page: page + 1,
          size: rowsPerPage,
        })
      ).then((result) => {
        // Nếu API filter không hoạt động, fallback về lấy tất cả
        if (result.meta.requestStatus === "rejected") {
          console.log("API filter không hoạt động, fallback về lấy tất cả");
          dispatch(fetchAllTickets({ page: page + 1, size: rowsPerPage }));
        }
      });
    }
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

  // Filter tickets theo status ở frontend (fallback khi API không hoạt động)
  const filteredTickets =
    filterStatus === "ALL"
      ? tickets
      : tickets.filter((ticket) => {
          return ticket.status === filterStatus;
        });

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Card
        sx={{
          mb: 2,
          background:
            "linear-gradient(135deg, #030C20 0%, #030C20 50%, #030C20 100%)",
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
        }}
      >
        <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                width: 56,
                height: 56,
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Quản lý Hỗ trợ Khách hàng
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Theo dõi và xử lý các yêu cầu hỗ trợ từ khách hàng - Có thể xem
                tất cả hoặc lọc theo trạng thái
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            flexWrap="wrap"
          >
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                Trạng thái
              </InputLabel>
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
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  if (filterStatus === "ALL") {
                    dispatch(
                      fetchAllTickets({
                        page: page + 1,
                        size: rowsPerPage,
                      })
                    );
                  } else {
                    dispatch(
                      fetchTicketsByStatus({
                        status: filterStatus,
                        page: page + 1,
                        size: rowsPerPage,
                      })
                    );
                  }
                }}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.4)",
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.12)'
                  }
                }}
              >
                Làm mới
              </Button>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>
      <Card
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#030C20" }}>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}
                >
                  Mã Hỗ trợ
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}
                >
                  Mã Đơn Hàng
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}
                >
                  Khách hàng
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}
                >
                  Loại hỗ trợ
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}
                >
                  Ngày tạo
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets && filteredTickets.length > 0 ? (
                filteredTickets.map((tk) => (
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
                    <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {generateTicketCode(tk)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
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
                            background:
                              "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                            fontSize: "0.8rem",
                          }}
                        >
                          {(tk.customer?.fullName || tk.customer || "K")
                            .charAt(0)
                            .toUpperCase()}
                        </S3Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {tk.customer?.fullName ||
                            tk.customer ||
                            "Chưa có thông tin"}
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
                      <SupportAgentIcon
                        sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        {filterStatus === "ALL"
                          ? "Không có yêu cầu hỗ trợ nào"
                          : `Không có yêu cầu hỗ trợ nào với trạng thái "${
                              statusOptions.find(
                                (opt) => opt.value === filterStatus
                              )?.label
                            }"`}
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        {filterStatus === "ALL"
                          ? "Hiện tại không có ticket nào trong hệ thống"
                          : "Hiện tại không có ticket nào trong trạng thái này"}
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
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 700,
            fontSize: "1.5rem",
          }}
        >
          <SupportAgentIcon sx={{ fontSize: 28 }} />
          Chi tiết Yêu cầu Hỗ trợ
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
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
            <Box>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "error.50",
                  border: "1px solid",
                  borderColor: "error.200",
                  mb: 2,
                  mt: 1,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Mã hỗ trợ
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "error.main",
                        fontSize: "1.2rem",
                      }}
                    >
                      {generateTicketCode(ticketDetail)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Trạng thái
                    </Typography>
                    <Chip
                      label={getStatusDisplay(ticketDetail.status)}
                      color={getStatusColor(ticketDetail.status)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Loại hỗ trợ
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {ticketDetail.title || ticketDetail.type}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Mức độ ưu tiên
                    </Typography>
                    <Chip
                      label={getStatusDisplay(ticketDetail.severity)}
                      color={
                        ticketDetail.severity === "HIGH"
                          ? "error"
                          : ticketDetail.severity === "MEDIUM"
                          ? "warning"
                          : "info"
                      }
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Mô tả vấn đề
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      backgroundColor: "white",
                      p: 2,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.300",
                      lineHeight: 1.6,
                    }}
                  >
                    {ticketDetail.description}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Thông tin khách hàng */}
              <Typography variant="h6" sx={{ mb: 2, color: "info.main" }}>
                 Thông tin khách hàng
              </Typography>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "info.50",
                  border: "1px solid",
                  borderColor: "info.200",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <S3Avatar
                    s3Key={ticketDetail.customer?.avatar}
                    sx={{
                      width: 60,
                      height: 60,
                      mr: 2,
                      background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                    }}
                  >
                    {ticketDetail.customer?.fullName
                      ?.charAt(0)
                      ?.toUpperCase() || "K"}
                  </S3Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {ticketDetail.customer?.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ticketDetail.customer?.email}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Số điện thoại
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {ticketDetail.customer?.phone || "Chưa cập nhật"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Địa chỉ
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {ticketDetail.customer?.address || "Chưa cập nhật"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Thông tin đơn hàng */}
              <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
               Thông tin đơn hàng
              </Typography>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "primary.50",
                  border: "1px solid",
                  borderColor: "primary.200",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Mã đơn hàng
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: "primary.main",
                        fontSize: "1.1rem",
                      }}
                    >
                      {ticketDetail.orders?.orderCode}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Loại đơn hàng
                    </Typography>
                    <Chip
                      label={getStatusDisplay(ticketDetail.orders?.orderType)}
                      color="info"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Trạng thái đơn hàng
                    </Typography>
                    <Chip
                      label={getStatusDisplay(ticketDetail.orders?.status)}
                      color={getStatusColor(ticketDetail.orders?.status)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Địa chỉ giao hàng
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {ticketDetail.orders?.address}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {ticketDetail.orders?.note && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Ghi chú đơn hàng
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      backgroundColor: "warning.50",
                      p: 2,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "warning.200",
                      lineHeight: 1.6,
                    }}
                  >
                    {ticketDetail.orders.note}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Thông tin tài chính */}
              <Typography variant="h6" sx={{ mb: 2, color: "success.main" }}>
             Thông tin tài chính
              </Typography>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "success.50",
                  border: "1px solid",
                  borderColor: "success.200",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Tổng tiền đơn hàng
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "success.dark",
                        fontSize: "1.2rem",
                      }}
                    >
                      {ticketDetail.orders?.totalOrderAmount?.toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VNĐ
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Đã đặt cọc
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "info.dark",
                        fontSize: "1.2rem",
                      }}
                    >
                      {ticketDetail.orders?.totalOrderDepositAmount?.toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VNĐ
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Còn lại
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "warning.dark",
                        fontSize: "1.2rem",
                      }}
                    >
                      {ticketDetail.orders?.totalOrderRemainingAmount?.toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VNĐ
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Thông tin thiết kế */}
              {ticketDetail.orders?.totalDesignAmount > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />

                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}
                  >
                    Thông tin thiết kế
                  </Typography>

                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      backgroundColor: "#f9f9f9",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 3,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: "200px" }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Tổng tiền thiết kế
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color: "black",
                            fontSize: "1.1rem",
                          }}
                        >
                          {ticketDetail.orders?.totalDesignAmount?.toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: "200px" }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Đã đặt cọc thiết kế
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color: "black",
                            fontSize: "1.1rem",
                          }}
                        >
                          {ticketDetail.orders?.depositDesignAmount?.toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}

              {/* Thông tin xây dựng */}
              {ticketDetail.orders?.totalConstructionAmount > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />

                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}
                  >
                    Thông tin thi công
                  </Typography>

                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      backgroundColor: "#f0f7ff",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 3,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: "200px" }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Tổng tiền thi công
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color: "black",
                            fontSize: "1.1rem",
                          }}
                        >
                          {ticketDetail.orders?.totalConstructionAmount?.toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: "200px" }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Đã đặt cọc thi công
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color: "black",
                            fontSize: "1.1rem",
                          }}
                        >
                          {ticketDetail.orders?.depositConstructionAmount?.toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Thông tin Dơn vị */}
                  {ticketDetail.orders?.contractors && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Đơn vị thi công
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          backgroundColor: "info.50",
                          p: 2,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "info.200",
                          fontWeight: 500,
                        }}
                      >
                        {ticketDetail.orders.contractors.name || ""}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {/* Thông tin Staff xử lý */}
              {ticketDetail.severity === "PRODUCTION" && ticketDetail.staff && (
                <>
                  <Divider sx={{ my: 3 }} />

                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}
                  >
                    Staff xử lý
                  </Typography>

                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "primary.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "primary.200",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Họ tên Staff
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "primary.dark" }}
                        >
                          {ticketDetail.staff.fullName}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Email
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "primary.dark" }}
                        >
                          {ticketDetail.staff.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Số điện thoại
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "primary.dark" }}
                        >
                          {ticketDetail.staff.phone}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Vai trò
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "primary.dark" }}
                        >
                          {ticketDetail.staff.roles?.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}

              {/* Giải pháp đã xử lý */}
              {ticketDetail.solution && (
                <>
                  <Divider sx={{ my: 3 }} />

                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "success.main", fontWeight: 600 }}
                  >
                    ✅ Giải pháp đã xử lý
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      backgroundColor: "success.50",
                      p: 2,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "success.200",
                      color: "success.dark",
                      lineHeight: 1.6,
                      mb: 2,
                    }}
                  >
                    {ticketDetail.solution}
                  </Typography>
                </>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Form phản hồi hoặc thông báo đã hỗ trợ */}
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}
              >
                💬 Phản hồi
              </Typography>

              {ticketDetail.status === "CLOSED" ? (
                <Alert severity="success" sx={{ borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Vấn đề này đã được hỗ trợ và phản hồi. Không thể gửi thêm
                    phản hồi.
                  </Typography>
                </Alert>
              ) : ticketDetail.staff ||
                ticketDetail.status === "IN_PROGRESS" ? (
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Đã gửi cho bộ phận quản lý, vui lòng đợi phản hồi.
                  </Typography>
                </Alert>
              ) : (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                    placeholder="Nhập nội dung phản hồi chi tiết cho khách hàng..."
                    disabled={reportStatus === "loading"}
                    sx={{ mb: 2 }}
                  />
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleReportSubmit}
                      disabled={reportStatus === "loading" || !report.trim()}
                      startIcon={
                        reportStatus === "loading" ? (
                          <CircularProgress size={20} />
                        ) : (
                          <CheckCircleIcon />
                        )
                      }
                    >
                      Gửi phản hồi
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleSendToStaff}
                      disabled={deliveryStatus === "loading"}
                      startIcon={
                        deliveryStatus === "loading" ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SupportAgentIcon />
                        )
                      }
                    >
                      Gửi cho bộ phận quản lý
                    </Button>
                  </Stack>
                  {reportError && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }}>
                      <Typography variant="body2">{reportError}</Typography>
                    </Alert>
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
            Bạn chắc chắn muốn chuyển yêu cầu hỗ trợ này cho bộ phận sản xuất
            (staff) xử lý?
          </Typography>
          {deliveryError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deliveryError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeliveryConfirm(false)}>Hủy</Button>
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
