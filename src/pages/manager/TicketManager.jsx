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
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
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
    case "OPEN":
      return "Chờ xử lí";
    case "IN_PROGRESS":
      return "Đang xử lí";
    case "CLOSED":
      return "Đã xử lí";
    case "PENDING_CONTRACT":
      return "Chờ ký hợp đồng";
    case "PENDING":
      return "Chờ xử lí";
    case "PROCESSING":
      return "Đang xử lí";
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    case "ORDER_COMPLETED":
      return "Đơn hàng hoàn thành";
    case "HIGH":
      return "Cao";
    case "MEDIUM":
      return "Trung bình";
    case "LOW":
      return "Thấp";
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
    <Box>
      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Danh sách Hỗ trợ
        </Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filterStatus}
            label="Trạng thái"
            onChange={handleChangeStatus}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
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
                <TableRow key={tk.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                    {generateTicketCode(tk)}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {tk.orders?.orderCode}
                  </TableCell>
                  <TableCell>{tk.customer?.fullName || tk.customer}</TableCell>
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
                    <IconButton color="primary" onClick={() => handleView(tk)}>
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {filterStatus === "ALL"
                    ? "Không có yêu cầu hỗ trợ nào."
                    : `Không có yêu cầu hỗ trợ nào với trạng thái "${
                        statusOptions.find((opt) => opt.value === filterStatus)
                          ?.label
                      }"`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={pagination.totalElements || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số dòng mỗi trang"
      />

      {/* Dialog chi tiết hỗ trợ */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết Yêu cầu Hỗ trợ</DialogTitle>
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
              <Typography variant="h6" sx={{ mb: 2 }}>
                Thông tin yêu cầu hỗ trợ
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã hỗ trợ
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loại hỗ trợ
                  </Typography>
                  <Typography variant="body1">
                    {ticketDetail.title || ticketDetail.type}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
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
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mô tả vấn đề
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
                  {ticketDetail.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Thông tin khách hàng */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Thông tin khách hàng
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ tên
                  </Typography>
                  <Typography variant="body1">
                    {ticketDetail.customer?.fullName}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {ticketDetail.customer?.email}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1">
                    {ticketDetail.customer?.phone}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1">
                    {ticketDetail.customer?.address || "Chưa cập nhật"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Thông tin đơn hàng */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Thông tin đơn hàng
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã đơn hàng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ticketDetail.orders?.orderCode}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loại đơn hàng
                  </Typography>
                  <Typography variant="body1">
                    {getStatusDisplay(ticketDetail.orders?.orderType)}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái đơn hàng
                  </Typography>
                  <Chip
                    label={getStatusDisplay(ticketDetail.orders?.status)}
                    color={
                      ticketDetail.orders?.status === "PENDING_CONTRACT"
                        ? "warning"
                        : "success"
                    }
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Địa chỉ giao hàng
                  </Typography>
                  <Typography variant="body1">
                    {ticketDetail.orders?.address}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Thông tin tài chính */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Thông tin tài chính
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tổng tiền đơn hàng
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {ticketDetail.orders?.totalOrderAmount?.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VNĐ
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đã đặt cọc
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {ticketDetail.orders?.totalOrderDepositAmount?.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VNĐ
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Còn lại
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {ticketDetail.orders?.totalOrderRemainingAmount?.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VNĐ
                  </Typography>
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
                      mb: 3,
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
                  <Box sx={{ mb: 3 }}>
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
                  <Box sx={{ mb: 3 }}>
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
    </Box>
  );
};

export default TicketManager;
