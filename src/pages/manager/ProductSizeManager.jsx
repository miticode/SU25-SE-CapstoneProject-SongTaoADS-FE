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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";

const ProductSizeManager = () => {
  const dispatch = useDispatch();
  const sizes = useSelector(selectAllSizes);
  const status = useSelector(selectSizeStatus);
  const error = useSelector(selectSizeError);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSizes());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setDialogMode("add");
    setForm({ name: "", description: "" });
    setEditId(null);
    setOpenDialog(true);
  };
  const handleOpenEdit = (row) => {
    setDialogMode("edit");
    setForm({ name: row.name || "", description: row.description || "" });
    setEditId(row.id);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditId(null);
  };
  const handleSubmit = async () => {
    if (dialogMode === "add") {
      await dispatch(addSize(form));
      dispatch(fetchSizes());
    } else if (dialogMode === "edit" && editId) {
      await dispatch(updateSize({ id: editId, data: form }));
      dispatch(fetchSizes());
    }
    setOpenDialog(false);
  };
  const handleDelete = async (row) => {
    const result = await dispatch(deleteSize(row.id));
    if (deleteSize.fulfilled.match(result)) {
      setSnackbarOpen(true);
    } else {
      // Nếu muốn, có thể show snackbar lỗi ở đây
    }
  };

  return (
    <Box>
      <Box
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5" fontWeight="bold">
          Quản lý kích thước
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Thêm kích thước
        </Button>
      </Box>
      {status === "loading" && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sizes.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.description || ""}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenEdit(row)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(row)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogMode === "add" ? "Thêm kích thước" : "Sửa kích thước"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Mô tả"
            fullWidth
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === "add" ? "Thêm" : "Sửa"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Xóa kích thước thành công!
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default ProductSizeManager;
