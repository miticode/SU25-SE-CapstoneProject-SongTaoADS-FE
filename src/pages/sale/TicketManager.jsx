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
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
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

const statusMap = {
  OPEN: { label: "Mới", color: "warning" },
  IN_PROGRESS: { label: "Đang xử lý", color: "info" },
  RESOLVED: { label: "Đã xử lý", color: "success" },
  CLOSED: { label: "Đã đóng", color: "default" },
};

const statusOptions = [
  { value: "OPEN", label: "Mới" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "CLOSED", label: "Đã đóng" },
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
    <Box>
      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Danh sách Ticket
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
              <TableCell>Đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Loại ticket</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets && tickets.length > 0 ? (
              tickets.map((tk) => (
                <TableRow key={tk.id} hover>
                  <TableCell>{tk.orders?.id || tk.orderCode}</TableCell>
                  <TableCell>{tk.customer?.fullName || tk.customer}</TableCell>
                  <TableCell>{tk.title || tk.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusMap[tk.status]?.label || tk.status}
                      color={statusMap[tk.status]?.color || "default"}
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
                <TableCell colSpan={6} align="center">
                  Không có ticket nào.
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
      {/* Dialog chi tiết ticket */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết Ticket</DialogTitle>
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
              <Typography>
                <b>Đơn hàng:</b>{" "}
                {ticketDetail.orders?.id || ticketDetail.orderCode}
              </Typography>
              <Typography>
                <b>Khách hàng:</b>{" "}
                {ticketDetail.customer?.fullName || ticketDetail.customer}
              </Typography>
              <Typography mt={1}>
                <b>Loại ticket:</b> {ticketDetail.title || ticketDetail.type}
              </Typography>
              <Typography mt={1}>
                <b>Mô tả:</b> {ticketDetail.description}
              </Typography>
              <Typography mt={1}>
                <b>Mức độ:</b> {ticketDetail.severity}
              </Typography>
              <Box mt={1}>
                <Chip
                  label={
                    statusMap[ticketDetail.status]?.label || ticketDetail.status
                  }
                  color={statusMap[ticketDetail.status]?.color || "default"}
                  size="small"
                />
              </Box>
              <Typography mt={1}>
                <b>Ngày tạo:</b>{" "}
                {new Date(ticketDetail.createdAt).toLocaleString("vi-VN")}
              </Typography>
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
        {/* Hiển thị staff đã nhận nếu có */}
        {ticketDetail && ticketDetail.staff && (
          <Alert severity="info" sx={{ mt: 2 }}>
            ĐÃ ĐƯỢC XỬ LÍ BỞI BỘ PHẬN QUẢN LÝ:{" "}
            <b>{ticketDetail.staff.fullName}</b>
          </Alert>
        )}
      </Dialog>
      {/* Confirm Dialog chuyển ticket */}
      <Dialog
        open={openDeliveryConfirm}
        onClose={() => setOpenDeliveryConfirm(false)}
      >
        <DialogTitle>Xác nhận chuyển ticket</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn chắc chắn muốn chuyển ticket này cho bộ phận sản xuất (staff) xử
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
      {/* Snackbar chuyển ticket thành công */}
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
          Chuyển ticket cho staff thành công!
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
    </Box>
  );
};

export default TicketManager;
