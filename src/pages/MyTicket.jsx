import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserTickets,
  fetchUserTicketsByStatus,
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

// Hàm chuyển đổi trạng thái sang tiếng Việt
const getStatusDisplay = (status) => {
  switch (status) {
    case "OPEN":
      return "ĐÃ GỬI";
    case "IN_PROGRESS":
      return "ĐANG XỬ LÍ";
    case "CLOSED":
      return "ĐÃ XỬ LÍ";
    default:
      return status;
  }
};

// Hàm lấy màu cho trạng thái
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
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (user?.id) {
      if (statusFilter && statusFilter !== "ALL") {
        dispatch(
          fetchUserTicketsByStatus({
            userId: user.id,
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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 4,
        px: 2,
      }}
    >
      <Box
        maxWidth="lg"
        mx="auto"
        sx={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: 3,
          p: 4,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: "#1e293b",
              mb: 1,
              letterSpacing: '-0.02em'
            }}
          >
            Yêu cầu hỗ trợ
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: '1.1rem' }}
          >
            Theo dõi và quản lý các yêu cầu hỗ trợ của bạn
          </Typography>
        </Box>

        {/* Filter Section */}
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          bgcolor: '#f8fafc', 
          borderRadius: 2, 
          border: '1px solid #e2e8f0' 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
            Bộ lọc
          </Typography>
          <FormControl
            sx={{
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "white",
                "&:hover": {
                  bgcolor: "#f1f5f9",
                },
                "&.Mui-focused": {
                  bgcolor: "white",
                  boxShadow: "0 0 0 2px rgba(30, 41, 59, 0.1)",
                },
              },
            }}
            size="medium"
          >
            <InputLabel id="status-filter-label">Trạng thái</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Trạng thái"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
              <MenuItem value="OPEN">Đã gửi</MenuItem>
              <MenuItem value="IN_PROGRESS">Đang xử lý</MenuItem>
              <MenuItem value="CLOSED">Đã xử lý</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {status === "loading" && (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            py={6}
            sx={{
              bgcolor: 'white',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <CircularProgress size={50} sx={{ color: "#1e293b", mb: 2 }} />
            <Typography variant="h6" color="#64748b">
              Đang tải danh sách yêu cầu hỗ trợ...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 3,
              bgcolor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              "& .MuiAlert-icon": {
                color: "#dc2626",
              },
            }}
          >
            {error}
          </Alert>
        )}

        {tickets.length === 0 && status === "succeeded" && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: 'white',
              borderRadius: 3,
              border: "2px dashed #cbd5e1",
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ fontSize: '4rem', mb: 2 }}>📋</Box>
            <Typography variant="h6" color="#64748b" sx={{ mb: 1 }}>
              Chưa có yêu cầu hỗ trợ nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Các yêu cầu hỗ trợ bạn gửi sẽ hiển thị tại đây
            </Typography>
          </Box>
        )}

        {tickets.length > 0 && (
          <Paper
            sx={{
              width: "100%",
              mb: 3,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid #e2e8f0",
              bgcolor: 'white'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#1e293b",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        fontSize: "0.875rem",
                        py: 2.5,
                      }}
                    >
                      Tiêu đề yêu cầu
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        fontSize: "0.875rem",
                        py: 2.5,
                      }}
                    >
                      Mô tả vấn đề
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        fontSize: "0.875rem",
                        py: 2.5,
                      }}
                    >
                      Trạng thái
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        fontSize: "0.875rem",
                        py: 2.5,
                      }}
                    >
                      Ngày gửi
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        fontSize: "0.875rem",
                        py: 2.5,
                      }}
                    >
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket, index) => (
                    <TableRow
                      key={ticket.id}
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: "#f8fafc",
                        },
                        "&:hover": {
                          backgroundColor: "#f1f5f9",
                          transition: "all 0.2s ease",
                        },
                      }}
                    >
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: "0.95rem",
                        color: "#1e293b",
                        py: 2
                      }}>
                        {ticket.title}
                      </TableCell>
                      <TableCell
                        sx={{ 
                          fontSize: "0.875rem", 
                          color: "#64748b",
                          py: 2,
                          maxWidth: '300px'
                        }}
                      >
                        {ticket.description?.length > 60
                          ? ticket.description.slice(0, 60) + "..."
                          : ticket.description}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={getStatusDisplay(ticket.status)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            borderRadius: 2,
                            ...(ticket.status === "OPEN" && {
                              bgcolor: "#3b82f6",
                              color: "white",
                            }),
                            ...(ticket.status === "IN_PROGRESS" && {
                              bgcolor: "#f59e0b",
                              color: "white",
                            }),
                            ...(ticket.status === "CLOSED" && {
                              bgcolor: "#10b981",
                              color: "white",
                            }),
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{ 
                          fontSize: "0.875rem", 
                          color: "#64748b",
                          py: 2
                        }}
                      >
                        {new Date(ticket.createdAt).toLocaleDateString("vi-VN", {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenDetail(ticket)}
                          sx={{
                            bgcolor: "#1e293b",
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                            "&:hover": {
                              bgcolor: "#334155",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(30, 41, 59, 0.3)",
                            },
                          }}
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
              labelDisplayedRows={({ from, to, count }) => 
                `${from}–${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
              }
              sx={{
                backgroundColor: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontWeight: 500,
                  color: "#64748b"
                },
                "& .MuiTablePagination-select": {
                  borderRadius: 1,
                  "&:focus": {
                    borderRadius: 1,
                  }
                },
                "& .MuiTablePagination-actions": {
                  "& .MuiIconButton-root": {
                    color: "#64748b",
                    "&:hover": {
                      bgcolor: "#f1f5f9"
                    }
                  }
                }
              }}
            />
          </Paper>
        )}

        {/* Dialog chi tiết ticket */}
        <Dialog
          open={openDetail}
          onClose={handleCloseDetail}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: "white",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "#1e293b",
              color: "white",
              fontWeight: 700,
              fontSize: "1.4rem",
              textAlign: "center",
              py: 3,
            }}
          >
            Chi tiết yêu cầu hỗ trợ
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {selectedTicket && (
              <Box>
                {/* Tiêu đề ticket */}
                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2, 
                  border: '1px solid #e2e8f0' 
                }}>
                  <Typography
                    variant="body2"
                    color="#64748b"
                    fontWeight={600}
                    mb={1}
                    sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
                  >
                    Tiêu đề yêu cầu
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "#1e293b" }}
                  >
                    {selectedTicket.title}
                  </Typography>
                </Box>

                {/* Mô tả */}
                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2, 
                  border: '1px solid #e2e8f0' 
                }}>
                  <Typography
                    variant="body2"
                    color="#64748b"
                    fontWeight={600}
                    mb={1}
                    sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
                  >
                    Mô tả vấn đề
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      lineHeight: 1.6,
                      color: "#374151",
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {selectedTicket.description}
                  </Typography>
                </Box>

                {/* Thông tin meta - Single Column */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: '#f1f5f9', 
                    borderRadius: 2, 
                    border: '1px solid #ddd6fe' 
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="#64748b"
                        fontWeight={600}
                        sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
                      >
                        Trạng thái
                      </Typography>
                      <Chip
                        label={getStatusDisplay(selectedTicket.status)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          borderRadius: 2,
                          ...(selectedTicket.status === "OPEN" && {
                            bgcolor: "#3b82f6",
                            color: "white",
                          }),
                          ...(selectedTicket.status === "IN_PROGRESS" && {
                            bgcolor: "#f59e0b",
                            color: "white",
                          }),
                          ...(selectedTicket.status === "CLOSED" && {
                            bgcolor: "#10b981",
                            color: "white",
                          }),
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        color="#64748b"
                        fontWeight={600}
                        sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
                      >
                        Ngày gửi
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#374151", fontWeight: 500 }}>
                        {new Date(selectedTicket.createdAt).toLocaleDateString("vi-VN")}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Phản hồi từ bộ phận hỗ trợ */}
                {selectedTicket.solution && (
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: '#f0fdf4', 
                    borderRadius: 2, 
                    border: '1px solid #bbf7d0' 
                  }}>
                    <Typography
                      variant="body2"
                      color="#166534"
                      fontWeight={600}
                      mb={2}
                      sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
                    >
                      Phản hồi từ bộ phận hỗ trợ
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: "#15803d",
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {selectedTicket.solution}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 3, bgcolor: '#f8fafc', justifyContent: 'center' }}>
            <Button
              onClick={handleCloseDetail}
              variant="contained"
              sx={{
                bgcolor: "#1e293b",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#334155",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(30, 41, 59, 0.3)",
                },
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
