import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSizes,
  addSize,
  updateSize,
  deleteSize,
  selectAllSizes,
  selectSizeStatus,
  selectSizeError,
} from "../../store/features/size/sizeSlice";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const Illustration = () => (
  <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
    <img
      src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/sleeping_kitty.png"
      alt="No size"
      style={{ width: 180, opacity: 0.7 }}
    />
    <Typography variant="h5" fontWeight="bold" mt={2}>
      Chưa có kích thước nào
    </Typography>
    <Typography color="text.secondary" mt={1}>
      Hãy thêm kích thước mới để bắt đầu quản lý.
    </Typography>
  </Box>
);

const SizeManager = () => {
  const dispatch = useDispatch();
  const sizes = useSelector(selectAllSizes);
  const status = useSelector(selectSizeStatus);
  const error = useSelector(selectSizeError);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    dispatch(fetchSizes());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({ name: "", description: "" });
    setOpenDialog(true);
  };

  const handleOpenEdit = (size) => {
    setEditMode(true);
    setForm({ name: size.name, description: size.description || "" });
    setSelectedId(size.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm({ name: "", description: "" });
    setSelectedId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (editMode) {
      dispatch(updateSize({ id: selectedId, data: form }));
      setSnackbar({
        open: true,
        message: "Cập nhật thành công!",
        severity: "success",
      });
    } else {
      dispatch(addSize(form));
      setSnackbar({
        open: true,
        message: "Thêm thành công!",
        severity: "success",
      });
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteSize(deleteId));
    setSnackbar({
      open: true,
      message: "Xóa thành công!",
      severity: "success",
    });
    setConfirmDelete(false);
    setDeleteId(null);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Quản lý kích thước
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0 2px 10px rgba(56,142,60,0.08)",
          mb: 3,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight={700}>
            Tất cả kích thước
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 16,
              boxShadow: "0 2px 8px 0 rgba(56,142,60,0.08)",
            }}
          >
            Thêm kích thước
          </Button>
        </Box>
        {status === "loading" ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : (
          <TableContainer
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 10px rgba(56,142,60,0.08)",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Tên kích thước</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sizes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Illustration />
                    </TableCell>
                  </TableRow>
                ) : (
                  sizes.map((size) => (
                    <TableRow
                      key={size.id}
                      hover
                      sx={{
                        transition: "background 0.2s",
                        ":hover": { bgcolor: "#f1f8e9" },
                      }}
                    >
                      <TableCell>{size.name}</TableCell>
                      <TableCell>{size.description}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Sửa">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEdit(size)}
                            sx={{ borderRadius: 2 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(size.id)}
                            sx={{ borderRadius: 2 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>
          {editMode ? "Sửa kích thước" : "Thêm kích thước"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên kích thước"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Mô tả"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            {editMode ? "Lưu" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa kích thước này không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          ".MuiAlert-root": { borderRadius: 2, fontSize: 16, fontWeight: 500 },
        }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SizeManager;
