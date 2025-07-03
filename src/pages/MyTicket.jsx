import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserTickets,
  fetchTicketsByStatus,
  selectTickets,
  selectTicketPagination,
  selectTicketStatus,
  selectTicketError,
} from "../store/features/ticket/ticketSlice";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function MyTicket() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const tickets = useSelector(selectTickets);
  const pagination = useSelector(selectTicketPagination);
  const status = useSelector(selectTicketStatus);
  const error = useSelector(selectTicketError);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState("OPEN");

  useEffect(() => {
    if (user?.id) {
      if (statusFilter) {
        dispatch(
          fetchTicketsByStatus({
            status: statusFilter,
            page: page + 1,
            size: rowsPerPage,
          })
        );
      } else {
        dispatch(
          fetchUserTickets({
            userId: user.id,
            page: page + 1,
            size: rowsPerPage,
          })
        );
      }
    }
  }, [user, dispatch, page, rowsPerPage, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetail = (ticket) => {
    setSelectedTicket(ticket);
    setOpenDetail(true);
  };
  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedTicket(null);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  return (
    <Box maxWidth="md" mx="auto" py={4} px={2}>
      <Typography variant="h5" mb={2} fontWeight={600}>
        Danh sách yêu cầu hỗ trợ
      </Typography>
      <FormControl sx={{ minWidth: 180, mb: 2 }} size="small">
        <InputLabel id="status-filter-label">Trạng thái</InputLabel>
        <Select
          labelId="status-filter-label"
          value={statusFilter}
          label="Trạng thái"
          onChange={handleStatusFilterChange}
        >
          <MenuItem value="OPEN">Đang mở</MenuItem>
          <MenuItem value="IN_PROGRESS">Đang xử lý</MenuItem>
          <MenuItem value="CLOSED">Đã đóng</MenuItem>
        </Select>
      </FormControl>
      {status === "loading" && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {tickets.length === 0 && status === "succeeded" && (
        <Typography>Chưa có yêu cầu hỗ trợ nào.</Typography>
      )}
      {tickets.length > 0 && (
        <Paper sx={{ width: "100%", mb: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>
                      {ticket.description?.length > 40
                        ? ticket.description.slice(0, 40) + "..."
                        : ticket.description}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status}
                        color={
                          ticket.status === "OPEN"
                            ? "info"
                            : ticket.status === "IN_PROGRESS"
                            ? "warning"
                            : ticket.status === "CLOSED"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleOpenDetail(ticket)}
                      >
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
      {/* Dialog chi tiết ticket */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết yêu cầu hỗ trợ</DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedTicket.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <b>Mô tả:</b> {selectedTicket.description}
              </Typography>
              <Typography variant="body2">
                <b>Trạng thái:</b> {selectedTicket.status}
              </Typography>
              <Typography variant="body2">
                <b>Ngày tạo:</b>{" "}
                {new Date(selectedTicket.createdAt).toLocaleString("vi-VN")}
              </Typography>
              {selectedTicket.solution && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <b>Phản hồi từ bộ phận hỗ trợ:</b> {selectedTicket.solution}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
