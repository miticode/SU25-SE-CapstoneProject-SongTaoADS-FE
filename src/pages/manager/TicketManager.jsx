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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  TablePagination,
  Snackbar,
  Alert,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Card,
  CardContent,
  Stack,
  Container,
} from "@mui/material";
import {
  Visibility,
  SupportAgent as SupportAgentIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStaffTickets,
  fetchStaffTicketsByStatus,
  selectTickets,
  selectTicketStatus,
  selectTicketError,
  fetchTicketDetail,
  selectCurrentTicket,
  selectTicketPagination,
  staffReport,
  selectReportStatus,
  selectReportError,
} from "../../store/features/ticket/ticketSlice";

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
      return "Chờ xử lí";
    case "IN_PROGRESS":
      return "Đang xử lí";
    case "CLOSED":
      return "Đã xử lí";
    case "PENDING":
      return "Chờ xử lí";
    case "PROCESSING":
      return "Đang xử lí";
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";

    // Trạng thái đơn hàng
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
    case "ORDER_COMPLETED":
      return "Đơn hàng hoàn thành";

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
    case "DELIVERED":
      return "Đã giao hàng";

    // Trạng thái thi công
    case "NEED_DEPOSIT_CONSTRUCTION":
      return "Cần đặt cọc thi công";
    case "CONSTRUCTION_IN_PROGRESS":
      return "Đang thi công";
    case "CONSTRUCTION_COMPLETED":
      return "Thi công hoàn thành";

    // Trạng thái thanh toán
    case "PAYMENT_PENDING":
      return "Chờ thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "REFUNDED":
      return "Đã hoàn tiền";

    // Mức độ ưu tiên
    case "HIGH":
      return "Cao";
    case "MEDIUM":
      return "Trung bình";
    case "LOW":
      return "Thấp";

    // Loại đơn hàng
    case "PRODUCTION":
      return "Sản xuất";
    case "CUSTOM_DESIGN_WITH_CONSTRUCTION":
      return "Thiết kế và thi công";
    case "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION":
      return "Thiết kế không thi công";
    case "AI_DESIGN":
      return "Thiết kế AI";

    default:
      return status;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    // Ticket states
    case "OPEN":
    case "PENDING":
      return "error"; // Đỏ - cần xử lý ngay
    case "IN_PROGRESS":
    case "PROCESSING":
      return "warning"; // Cam - đang xử lý
    case "CLOSED":
    case "COMPLETED":
      return "success"; // Xanh - hoàn thành

    // Order states
    case "PENDING_CONTRACT":
    case "CONTRACT_SENT":
    case "CONTRACT_DISCUSS":
      return "info"; // Xanh dương - chờ hợp đồng
    case "CONTRACT_SIGNED":
    case "CONTRACT_CONFIRMED":
    case "DEPOSITED":
      return "success"; // Xanh - đã hoàn thành

    // Design states
    case "PENDING_DESIGN":
    case "AWAITING_DESIGN":
    case "WAITING_FINAL_DESIGN":
      return "warning"; // Cam - đang chờ
    case "NEED_DEPOSIT_DESIGN":
    case "NEED_FULLY_PAID_DESIGN":
    case "PAYMENT_PENDING":
      return "error"; // Đỏ - cần hành động
    case "DEPOSITED_DESIGN":
    case "DESIGN_COMPLETED":
    case "PAID":
      return "success"; // Xanh - hoàn thành
    case "DESIGN_IN_PROGRESS":
      return "info"; // Xanh dương - đang thực hiện

    // Production & Construction states
    case "PRODUCING":
    case "CONSTRUCTION_IN_PROGRESS":
    case "DELIVERING":
      return "warning"; // Cam - đang thực hiện
    case "PRODUCTION_COMPLETED":
    case "CONSTRUCTION_COMPLETED":
    case "DELIVERED":
    case "INSTALLED":
    case "ORDER_COMPLETED":
      return "success"; // Xanh - hoàn thành
    case "NEED_DEPOSIT_CONSTRUCTION":
      return "error"; // Đỏ - cần hành động

    // Other states
    case "CANCELLED":
      return "error"; // Đỏ - đã hủy
    case "REFUNDED":
      return "info"; // Xanh dương - đã hoàn tiền

    default:
      return "default";
  }
};

const statusOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "OPEN", label: "Chờ xử lí" },
  { value: "IN_PROGRESS", label: "Đang xử lí" },
  { value: "CLOSED", label: "Đã xử lí" },
];

const TicketManager = () => {
  const dispatch = useDispatch();
  const tickets = useSelector(selectTickets);
  const status = useSelector(selectTicketStatus);
  const error = useSelector(selectTicketError);
  const ticketDetail = useSelector(selectCurrentTicket);
  const pagination = useSelector(selectTicketPagination);
  const reportStatus = useSelector(selectReportStatus);
  const reportError = useSelector(selectReportError);

  const [open, setOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [report, setReport] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    // Thử gọi API filter trước, nếu không được thì fallback về lấy tất cả
    if (filterStatus === "ALL") {
      dispatch(fetchStaffTickets({ page: page + 1, size: rowsPerPage }));
    } else {
      // Thử gọi API filter
      dispatch(
        fetchStaffTicketsByStatus({
          status: filterStatus,
          page: page + 1,
          size: rowsPerPage,
        })
      ).then((result) => {
        // Nếu API filter không hoạt động, fallback về lấy tất cả
        if (result.meta.requestStatus === "rejected") {
          console.log("API filter không hoạt động, fallback về lấy tất cả");
          dispatch(fetchStaffTickets({ page: page + 1, size: rowsPerPage }));
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeStatus = (e) => {
    setFilterStatus(e.target.value);
    setPage(0); // Reset về trang 1 khi đổi filter
  };

  const handleReportSubmit = () => {
    if (!report.trim()) return;
    dispatch(
      staffReport({ ticketId: selectedTicketId, reportData: { report } })
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setReport("");
        setOpenSnackbar(true);
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
            "linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)",
          color: "white",
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(25, 118, 210, 0.3)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={3}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <SupportAgentIcon sx={{ fontSize: 48, opacity: 0.9 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Quản lý Hỗ trợ Khách hàng
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Theo dõi và xử lý các yêu cầu hỗ trợ từ khách hàng - Staff
                  Manager
                </Typography>
              </Box>
            </Box>

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
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.8)",
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

              <IconButton
                onClick={() => {
                  if (filterStatus === "ALL") {
                    dispatch(
                      fetchStaffTickets({
                        page: page + 1,
                        size: rowsPerPage,
                      })
                    );
                  } else {
                    dispatch(
                      fetchStaffTicketsByStatus({
                        status: filterStatus,
                        page: page + 1,
                        size: rowsPerPage,
                      })
                    );
                  }
                }}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "grey.50",
                  "& .MuiTableCell-head": {
                    fontWeight: 600,
                    color: "text.primary",
                    borderBottom: "2px solid",
                    borderColor: "primary.main",
                  },
                }}
              >
                <TableCell>Mã Hỗ trợ</TableCell>
                <TableCell>Mã Đơn Hàng</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Loại hỗ trợ</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Hành động</TableCell>
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
                      {generateTicketCode(tk)}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {tk.orders?.orderCode}
                    </TableCell>
                    <TableCell>
                      {tk.customer?.fullName || tk.customer}
                    </TableCell>
                    <TableCell>{tk.title || tk.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDisplay(tk.status)}
                        color={getStatusColor(tk.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(tk.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleView(tk)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <SupportAgentIcon
                        sx={{ fontSize: 64, color: "text.disabled", mb: 1 }}
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

        <Box sx={{ mt: 2 }}>
          <TablePagination
            component="div"
            count={pagination.totalElements || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang"
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          />
        </Box>
      </Card>

      {/* Dialog chi tiết hỗ trợ */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SupportAgentIcon />
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
              {/* Thông tin cơ bản
              <Typography variant="h6" sx={{ mb: 2, color: "error.main" }}>
                
              </Typography> */}

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "error.50",
                  border: "1px solid",
                  borderColor: "error.200",
                  mb: 2,
                  mt: 2,
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
                      Họ tên
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {ticketDetail.customer?.fullName}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
                      {ticketDetail.customer?.phone}
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
                      size="small"
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

              {/* Thông tin thiết kế và thi công - layout hàng ngang */}
              {(ticketDetail.orders?.totalDesignAmount > 0 ||
                ticketDetail.orders?.totalConstructionAmount > 0) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 4,
                      mb: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Thông tin thiết kế */}
                    {ticketDetail.orders?.totalDesignAmount > 0 && (
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: "300px",
                          p: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ mb: 2, color: "#1976d2" }}
                        >
                          Thông tin thiết kế
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 3,
                            flexWrap: "wrap",
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: "150px" }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Tổng tiền thiết kế
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {ticketDetail.orders?.totalDesignAmount?.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1, minWidth: "150px" }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Đã đặt cọc thiết kế
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {ticketDetail.orders?.depositDesignAmount?.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Thông tin thi công */}
                    {ticketDetail.orders?.totalConstructionAmount > 0 && (
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: "300px",
                          p: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          backgroundColor: "#f0f7ff",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ mb: 2, color: "#2e7d32" }}
                        >
                          Thông tin thi công
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 3,
                            flexWrap: "wrap",
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: "150px" }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Tổng tiền thi công
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {ticketDetail.orders?.totalConstructionAmount?.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1, minWidth: "150px" }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Đã đặt cọc thi công
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {ticketDetail.orders?.depositConstructionAmount?.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </Typography>
                          </Box>

                          {ticketDetail.orders?.contractors && (
                            <Box sx={{ flex: 1, minWidth: "150px" }}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Đơn vị thi công
                              </Typography>
                              <Typography variant="body1">
                                {ticketDetail.orders.contractors.name ||
                                  ticketDetail.orders.contractors.fullName}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </>
              )}

              {/* Ghi chú đơn hàng */}
              {ticketDetail.orders?.note && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ghi chú đơn hàng
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        backgroundColor: "grey.50",
                        p: 1.5,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "grey.200",
                        mt: 0.5,
                      }}
                    >
                      {ticketDetail.orders.note}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Giải pháp đã xử lý */}
              {ticketDetail.solution && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Giải pháp đã xử lý
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        backgroundColor: "success.50",
                        p: 1.5,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "success.200",
                        color: "success.dark",
                      }}
                    >
                      {ticketDetail.solution}
                    </Typography>
                  </Box>
                </>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Form phản hồi */}
              {ticketDetail.status === "CLOSED" ? (
                <Alert severity="success">
                  Vấn đề này đã được hỗ trợ và phản hồi. Không thể gửi thêm phản
                  hồi.
                </Alert>
              ) : (
                <Box>
                  <Typography sx={{ mb: 1, fontWeight: 600 }}>
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
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleReportSubmit}
                    disabled={reportStatus === "loading" || !report.trim()}
                  >
                    {reportStatus === "loading" ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Gửi phản hồi"
                    )}
                  </Button>
                  {reportError && (
                    <Typography color="error" sx={{ mt: 1 }}>
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

      {/* Snackbar thông báo thành công */}
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
