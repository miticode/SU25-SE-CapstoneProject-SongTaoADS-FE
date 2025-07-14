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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStaffTickets,
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

const TicketManager = () => {
  const dispatch = useDispatch();
  const tickets = useSelector(selectTickets);
  const status = useSelector(selectTicketStatus);
  const error = useSelector(selectTicketError);
  const currentTicket = useSelector(selectCurrentTicket);
  const pagination = useSelector(selectTicketPagination);
  const reportStatus = useSelector(selectReportStatus);
  const reportError = useSelector(selectReportError);

  const [openDetail, setOpenDetail] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [report, setReport] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    dispatch(fetchStaffTickets({ page: page + 1, size: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleOpenDetail = (ticketId) => {
    setSelectedTicketId(ticketId);
    dispatch(fetchTicketDetail(ticketId));
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setReport("");
    setSelectedTicketId(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        return "primary";
      case "IN_PROGRESS":
        return "warning";
      case "CLOSED":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Quản lý Hỗ trợ (Ticket)
      </Typography>
      {status === "loading" ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Mức độ</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets && tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id} hover>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>{ticket.description}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.severity}
                          color={
                            ticket.severity === "SALE" ? "primary" : "secondary"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusDisplay(ticket.status)}
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{ticket.customer?.fullName}</TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDetail(ticket.id)}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
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
        </Paper>
      )}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết Ticket</DialogTitle>
        <DialogContent>
          {!currentTicket ? (
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
                <b>Tiêu đề:</b> {currentTicket.title}
              </Typography>
              <Typography>
                <b>Mô tả:</b> {currentTicket.description}
              </Typography>
              <Typography>
                <b>Mức độ:</b> {currentTicket.severity}
              </Typography>
              <Typography>
                <b>Trạng thái:</b>{" "}
                <Chip
                  label={getStatusDisplay(currentTicket.status)}
                  color={getStatusColor(currentTicket.status)}
                  sx={{ mt: 0.5, fontWeight: 600 }}
                />
              </Typography>
              <Typography>
                <b>Khách hàng:</b> {currentTicket.customer?.fullName}
              </Typography>
              <Typography>
                <b>Ngày tạo:</b>{" "}
                {new Date(currentTicket.createdAt).toLocaleString()}
              </Typography>
              {currentTicket.status === "CLOSED" ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Vấn đề này đã được hỗ trợ và phản hồi. Không thể gửi thêm phản
                  hồi.
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
                  <Button
                    variant="contained"
                    sx={{ mt: 1 }}
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
          <Button onClick={handleCloseDetail}>Đóng</Button>
        </DialogActions>
      </Dialog>
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
