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
  { value: "ALL", label: "TẤT CẢ" },
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
      dispatch(fetchStaffTicketsByStatus({ status: filterStatus, page: page + 1, size: rowsPerPage }))
        .then((result) => {
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
  const filteredTickets = filterStatus === "ALL" ? tickets : tickets.filter(ticket => {
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
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {generateTicketCode(tk)}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
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
                    : `Không có yêu cầu hỗ trợ nào với trạng thái "${statusOptions.find(opt => opt.value === filterStatus)?.label}"`
                  }
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
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ tên
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ticketDetail.customer?.fullName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
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

              {/* Form phản hồi */}
              {ticketDetail.status === "CLOSED" ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Vấn đề này đã được hỗ trợ và phản hồi. Không thể gửi thêm phản hồi.
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
                    color="primary"
                    onClick={handleReportSubmit}
                    disabled={reportStatus === "loading" || !report.trim()}
                    sx={{ mt: 2 }}
                  >
                    {reportStatus === "loading" ? (
                      <CircularProgress size={20} />
                    ) : (
                      "GỬI PHẢN HỒI"
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
