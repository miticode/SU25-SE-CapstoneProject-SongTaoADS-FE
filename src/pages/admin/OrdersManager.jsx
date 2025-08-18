import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  ORDER_STATUS_MAP,
  ORDER_TYPE_MAP,
  selectOrders,
  selectOrderStatus,
  selectOrderError,
  selectOrderPagination,
} from "../../store/features/order/orderSlice";
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery, Tooltip } from "@mui/material";

const OrdersManager = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  // Local UI state
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0); // 0-based for UI
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Redux state
  const orders = useSelector(selectOrders);
  const loadStatus = useSelector(selectOrderStatus); // 'loading' | 'succeeded' | 'failed'
  const loadError = useSelector(selectOrderError);
  const pagination = useSelector(selectOrderPagination); // { currentPage, totalPages, pageSize, totalElements }

  // Derived lists
  const statusOptions = useMemo(() => [
    { value: "ALL", label: "Tất cả trạng thái" },
    ...Object.entries(ORDER_STATUS_MAP).map(([value, info]) => ({
      value,
      label: info.label,
      color: info.color,
    })),
  ], []);

  // Fetch orders
  const loadData = () => {
    dispatch(
      fetchOrders({
        orderStatus: statusFilter,
        page: page + 1, // API is 1-based
        size: rowsPerPage,
      })
    );
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page, rowsPerPage, dispatch]);

  // Handlers
  const handleChangeStatus = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_evt, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (evt) => {
    setRowsPerPage(parseInt(evt.target.value, 10));
    setPage(0);
  };

  // Helpers
  // Format currency as VND code, e.g., "10.000 VND"
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        currencyDisplay: "code",
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatCurrency = (val) =>
    typeof val === "number" ? currencyFormatter.format(val) : "-";

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleString("vi-VN") : "-";

  const getStatusChip = (status) => {
    const info = ORDER_STATUS_MAP[status] || { label: status, color: "default" };
    return (
      <Chip
        label={info.label || status}
        size="small"
        color={info.color || "default"}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const getTypeLabel = (type) => ORDER_TYPE_MAP[type]?.label || type || "-";

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          mb: { xs: 2, sm: 3 },
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant={isSmDown ? "h6" : "h5"}
          fontWeight={700}
          sx={{
            letterSpacing: 0.2,
            fontSize: { xs: "1.125rem", sm: "1.5rem" },
          }}
        >
          Quản Lý Đơn Hàng
        </Typography>

        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <FormControl
            size={isSmDown ? "small" : "medium"}
            sx={{ minWidth: { xs: 160, sm: 200 }, flexGrow: { xs: 1, sm: 0 } }}
          >
            <InputLabel>Trạng thái</InputLabel>
            <Select label="Trạng thái" value={statusFilter} onChange={handleChangeStatus}>
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Làm mới">
            <IconButton onClick={loadData} color="primary" size={isSmDown ? "small" : "medium"}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto", maxHeight: { xs: 520, md: 640 } }}>
          <Table stickyHeader size={isSmDown ? "small" : "medium"} sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 700 }}>Mã đơn</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Khách hàng</TableCell>
                <TableCell sx={{ fontWeight: 700, display: { xs: "none", sm: "table-cell" } }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Tổng tiền
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, display: { xs: "none", md: "table-cell" } }}
                  align="right"
                >
                  Đặt cọc
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, display: { xs: "none", md: "table-cell" } }}
                  align="right"
                >
                  Còn lại
                </TableCell>
                <TableCell sx={{ fontWeight: 700, display: { xs: "none", sm: "table-cell" } }}>Ngày tạo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadStatus === "loading" ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={36} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Đang tải đơn hàng...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      Không có đơn hàng nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((ord) => (
                  <TableRow
                    key={ord.id}
                    hover
                    sx={{ "&:nth-of-type(odd)": { backgroundColor: "action.hover" } }}
                  >
                    <TableCell sx={{ maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Tooltip title={ord.orderCode || ord.id} arrow>
                        <span>{ord.orderCode || ord.id}</span>
                      </Tooltip>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: { xs: "block", sm: "none" } }}
                      >
                        {formatDate(ord.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: { xs: 180, sm: 220 }, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Tooltip title={ord.users?.fullName || ord.users?.email || "-"} arrow>
                        <span>{ord.users?.fullName || ord.users?.email || "-"}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      {getTypeLabel(ord.orderType)}
                    </TableCell>
                    <TableCell>{getStatusChip(ord.status)}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(ord.totalOrderAmount)}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: { xs: "block", md: "none" } }}
                      >
                        ĐC: {formatCurrency(ord.totalOrderDepositAmount)} • CL: {formatCurrency(ord.totalOrderRemainingAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ display: { xs: "none", md: "table-cell" }, fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatCurrency(ord.totalOrderDepositAmount)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ display: { xs: "none", md: "table-cell" }, fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatCurrency(ord.totalOrderRemainingAmount)}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      {formatDate(ord.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 25, 50]}
          component="div"
          count={pagination?.totalElements ?? 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ px: { xs: 1.5, sm: 2 } }}
        />
      </Paper>
    </Box>
  );
};

export default OrdersManager;
