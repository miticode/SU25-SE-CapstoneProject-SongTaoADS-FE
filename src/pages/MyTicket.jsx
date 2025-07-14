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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0C1528 0%, #1a2332 100%)",
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
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography
          variant="h4"
          mb={3}
          fontWeight={700}
          sx={{
            background: "linear-gradient(45deg, #0C1528, #1a2332)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
          }}
        >
          Danh sách yêu cầu hỗ trợ
        </Typography>

        <FormControl
          sx={{
            minWidth: 200,
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
            },
          }}
          size="medium"
        >
          <InputLabel id="status-filter-label">Trạng Thái</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Trạng Thái"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="OPEN">ĐÃ GỬI</MenuItem>
            <MenuItem value="IN_PROGRESS">ĐANG XỬ LÍ</MenuItem>
            <MenuItem value="CLOSED">ĐÃ XỬ LÍ</MenuItem>
          </Select>
        </FormControl>

        {status === "loading" && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress size={60} sx={{ color: "#0C1528" }} />
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                color: "#d32f2f",
              },
            }}
          >
            {error}
          </Alert>
        )}

        {tickets.length === 0 && status === "succeeded" && (
          <Box
            textAlign="center"
            py={6}
            sx={{
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              borderRadius: 3,
              border: "2px dashed #0C1528",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Chưa có yêu cầu hỗ trợ nào.
            </Typography>
          </Box>
        )}

        {tickets.length > 0 && (
          <Paper
            sx={{
              width: "100%",
              mb: 2,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(12, 21, 40, 0.1)",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#0C1528",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        backgroundColor: "#0C1528",
                        fontSize: "1rem",
                      }}
                    >
                      Tiêu đề
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        backgroundColor: "#0C1528",
                        fontSize: "1rem",
                      }}
                    >
                      Mô tả
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        backgroundColor: "#0C1528",
                        fontSize: "1rem",
                      }}
                    >
                      Trạng thái
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        backgroundColor: "#0C1528",
                        fontSize: "1rem",
                      }}
                    >
                      Ngày tạo
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        backgroundColor: "#0C1528",
                        fontSize: "1rem",
                      }}
                    >
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket, index) => (
                    <TableRow
                      key={ticket.id}
                      sx={{
                        backgroundColor:
                          index % 2 === 0
                            ? "rgba(12, 21, 40, 0.02)"
                            : "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
                        {ticket.title}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "0.9rem", color: "text.secondary" }}
                      >
                        {ticket.description?.length > 50
                          ? ticket.description.slice(0, 50) + "..."
                          : ticket.description}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusDisplay(ticket.status)}
                          color={getStatusColor(ticket.status)}
                          size="medium"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            borderRadius: 2,
                            "&.MuiChip-colorPrimary": {
                              backgroundColor: "#1976d2",
                              color: "white",
                            },
                            "&.MuiChip-colorWarning": {
                              backgroundColor: "#ed6c02",
                              color: "white",
                            },
                            "&.MuiChip-colorSuccess": {
                              backgroundColor: "#2e7d32",
                              color: "white",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "0.9rem", color: "text.secondary" }}
                      >
                        {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenDetail(ticket)}
                          sx={{
                            background: "#0C1528",
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                              background: "#1a2332",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(12, 21, 40, 0.3)",
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
              sx={{
                backgroundColor: "rgba(12, 21, 40, 0.05)",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontWeight: 500,
                  },
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
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "#0C1528",
              color: "white",
              fontWeight: 600,
              fontSize: "1.3rem",
            }}
          >
            Chi tiết yêu cầu hỗ trợ
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selectedTicket && (
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    background: "linear-gradient(45deg, #0C1528, #1a2332)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 2,
                  }}
                >
                  {selectedTicket.title}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Mô tả:
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                    {selectedTicket.description}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Trạng thái:
                  </Typography>
                  <Chip
                    label={getStatusDisplay(selectedTicket.status)}
                    color={getStatusColor(selectedTicket.status)}
                    sx={{ mt: 0.5, fontWeight: 600 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Ngày tạo:
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {new Date(selectedTicket.createdAt).toLocaleString("vi-VN")}
                  </Typography>
                </Box>

                {selectedTicket.solution && (
                  <Alert
                    severity="success"
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      "& .MuiAlert-icon": {
                        color: "#2e7d32",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ mb: 1 }}
                    >
                      Phản hồi từ bộ phận hỗ trợ:
                    </Typography>
                    <Typography variant="body1">
                      {selectedTicket.solution}
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={handleCloseDetail}
              variant="contained"
              sx={{
                background: "#0C1528",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                "&:hover": {
                  background: "#1a2332",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(12, 21, 40, 0.3)",
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
