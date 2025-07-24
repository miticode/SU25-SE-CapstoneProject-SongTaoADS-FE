import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllContractors,
  createContractorThunk,
  updateContractorThunk,
  fetchContractorById,
  deleteContractorThunk,
} from "../../store/features/contractor/contractorSlice";

// TODO: Thêm thunk xóa contractor nếu có API xóa

const defaultForm = {
  name: "",
  address: "",
  phone: "",
  email: "",
  isInternal: false,
  isAvailable: true,
};

const ContractorManagement = () => {
  const dispatch = useDispatch();
  const { contractors, loading, error } = useSelector(
    (state) => state.contractor
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    data: null,
    loading: false,
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  useEffect(() => {
    dispatch(fetchAllContractors());
  }, [dispatch]);

  const handleOpenDialog = (contractor) => {
    if (contractor) {
      setForm(contractor);
      setEditId(contractor.id);
    } else {
      setForm(defaultForm);
      setEditId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm(defaultForm);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      // Update
      const res = await dispatch(
        updateContractorThunk({ contractorId: editId, data: form })
      );
      if (res.meta.requestStatus === "fulfilled") {
        setSnackbar({
          open: true,
          message: "Cập nhật thành công!",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        setSnackbar({
          open: true,
          message: res.payload || "Cập nhật thất bại!",
          severity: "error",
        });
      }
    } else {
      // Create
      const res = await dispatch(createContractorThunk(form));
      if (res.meta.requestStatus === "fulfilled") {
        setSnackbar({
          open: true,
          message: "Tạo mới thành công!",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        setSnackbar({
          open: true,
          message: res.payload || "Tạo mới thất bại!",
          severity: "error",
        });
      }
    }
  };

  // Xem chi tiết
  const handleViewDetail = async (id) => {
    setDetailDialog({ open: true, data: null, loading: true });
    const res = await dispatch(fetchContractorById(id));
    if (res.meta.requestStatus === "fulfilled") {
      setDetailDialog({ open: true, data: res.payload, loading: false });
    } else {
      setDetailDialog({ open: false, data: null, loading: false });
      setSnackbar({
        open: true,
        message: res.payload || "Lỗi khi lấy chi tiết!",
        severity: "error",
      });
    }
  };

  // Xác nhận xóa
  const handleDelete = (id) => {
    setDeleteDialog({ open: true, id });
  };
  const handleConfirmDelete = async () => {
    const id = deleteDialog.id;
    const res = await dispatch(deleteContractorThunk(id));
    if (res.meta.requestStatus === "fulfilled") {
      setSnackbar({
        open: true,
        message: "Xóa thành công!",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: res.payload || "Xóa thất bại!",
        severity: "error",
      });
    }
    setDeleteDialog({ open: false, id: null });
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          Quản lý đơn vị thi công
        </Typography>
        <Box>
          <Tooltip title="Làm mới danh sách">
            <IconButton onClick={() => dispatch(fetchAllContractors())}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ ml: 2 }}
          >
            Thêm mới
          </Button>
        </Box>
      </Box>
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên đơn vị</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Nội bộ</TableCell>
                <TableCell>Hoạt động</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : contractors && contractors.length > 0 ? (
                contractors.map((row, idx) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.isInternal ? "Có" : "Không"}</TableCell>
                    <TableCell>{row.isAvailable ? "Có" : "Không"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết">
                        <IconButton onClick={() => handleViewDetail(row.id)}>
                          <i
                            className="fa fa-eye"
                            style={{ color: "#1976d2" }}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa">
                        <IconButton onClick={() => handleOpenDialog(row)}>
                          <EditIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton onClick={() => handleDelete(row.id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Dialog thêm/sửa */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editId ? "Cập nhật đơn vị thi công" : "Thêm mới đơn vị thi công"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <TextField
              label="Tên đơn vị"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Địa chỉ"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Số điện thoại"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="email"
            />
            <Box display="flex" gap={2} mt={2}>
              <label>
                <input
                  type="checkbox"
                  name="isInternal"
                  checked={form.isInternal}
                  onChange={handleChange}
                />{" "}
                Nội bộ
              </label>
              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                />{" "}
                Hoạt động
              </label>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {editId ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Dialog chi tiết */}
      <Dialog
        open={detailDialog.open}
        onClose={() =>
          setDetailDialog({ open: false, data: null, loading: false })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết đơn vị thi công</DialogTitle>
        <DialogContent dividers>
          {detailDialog.loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={120}
            >
              <CircularProgress />
            </Box>
          ) : detailDialog.data ? (
            <Box>
              <Typography>
                <b>Tên đơn vị:</b> {detailDialog.data.name}
              </Typography>
              <Typography>
                <b>Địa chỉ:</b> {detailDialog.data.address}
              </Typography>
              <Typography>
                <b>Số điện thoại:</b> {detailDialog.data.phone}
              </Typography>
              <Typography>
                <b>Email:</b> {detailDialog.data.email}
              </Typography>
              <Typography>
                <b>Nội bộ:</b> {detailDialog.data.isInternal ? "Có" : "Không"}
              </Typography>
              <Typography>
                <b>Hoạt động:</b>{" "}
                {detailDialog.data.isAvailable ? "Có" : "Không"}
              </Typography>
              <Typography>
                <b>Ngày tạo:</b> {detailDialog.data.createdAt}
              </Typography>
              <Typography>
                <b>Ngày cập nhật:</b> {detailDialog.data.updatedAt}
              </Typography>
            </Box>
          ) : (
            <Typography color="error">Không tìm thấy dữ liệu</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDetailDialog({ open: false, data: null, loading: false })
            }
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        maxWidth="xs"
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa đơn vị thi công này?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Hiển thị lỗi chung */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ContractorManagement;
