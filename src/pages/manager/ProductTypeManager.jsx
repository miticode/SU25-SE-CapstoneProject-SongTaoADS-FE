import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductTypes,
  selectAllProductTypes,
  selectProductTypeStatus,
  selectProductTypeError,
} from "../../store/features/productType/productTypeSlice";
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
import {
  addProductTypeApi,
  deleteProductTypeApi,
  updateProductTypeApi,
} from "../../api/productTypeService";
import dayjs from "dayjs";

const Illustration = () => (
  <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
    <img
      src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/sleeping_kitty.png"
      alt="No product type"
      style={{ width: 180, opacity: 0.7 }}
    />
    <Typography variant="h5" fontWeight="bold" mt={2}>
      Chưa có loại biển hiệu nào
    </Typography>
    <Typography color="text.secondary" mt={1}>
      Hãy thêm loại biển hiệu mới để bắt đầu quản lý.
    </Typography>
  </Box>
);

const ProductTypeManager = () => {
  const dispatch = useDispatch();
  const productTypes = useSelector(selectAllProductTypes);
  const status = useSelector(selectProductTypeStatus);
  const error = useSelector(selectProductTypeError);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' | 'edit'
 const [form, setForm] = useState({ name: "", calculateFormula: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    dispatch(fetchProductTypes());
  }, [dispatch]);

 const handleOpenAdd = () => {
  setDialogMode("add");
  setForm({ name: "", calculateFormula: "" });
  setEditId(null);
  setOpenDialog(true);
};
 const handleOpenEdit = (row) => {
  setDialogMode("edit");
  setForm({ 
    name: row.name || "", 
    calculateFormula: row.calculateFormula || "" 
  });
  setEditId(row.id);
  setOpenDialog(true);
};
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleSubmit = async () => {
  if (dialogMode === "add") {
    const res = await addProductTypeApi({
      name: form.name,
      calculateFormula: form.calculateFormula,
      isAvailable: true,
    });
    if (res.success) {
      dispatch(fetchProductTypes());
      setSnackbar({
        open: true,
        message: "Thêm thành công!",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: res.error || "Add failed",
        severity: "error",
      });
    }
  } else if (dialogMode === "edit" && editId) {
    const res = await updateProductTypeApi(editId, {
      name: form.name,
      calculateFormula: form.calculateFormula,
      isAvailable: true,
    });
    if (res.success) {
      dispatch(fetchProductTypes());
      setSnackbar({
        open: true,
        message: "Cập nhật thành công!",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: res.error || "Update failed",
        severity: "error",
      });
    }
  }
  setOpenDialog(false);
};
  const handleDelete = (row) => {
    setDeleteTarget(row);
    setConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      const res = await deleteProductTypeApi(deleteTarget.id);
      if (res.success) {
        dispatch(fetchProductTypes());
        setSnackbar({
          open: true,
          message: "Xóa thành công!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.error || "Delete failed",
          severity: "error",
        });
      }
    }
    setConfirmOpen(false);
    setDeleteTarget(null);
  };
  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  return (
    <Box>
      <Box
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight="bold">
          Quản lý loại biển hiệu
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
          Thêm loại biển hiệu
        </Button>
      </Box>
      {status === "loading" && <CircularProgress />}
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(56,142,60,0.08)" }}
      >
        <Table stickyHeader>
         <TableHead>
  <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
    <TableCell sx={{ fontWeight: 700 }}>Tên</TableCell>
    <TableCell sx={{ fontWeight: 700 }}>Công thức tính toán</TableCell>
    <TableCell sx={{ fontWeight: 700 }}>Ngày tạo</TableCell>
    <TableCell sx={{ fontWeight: 700 }}>Ngày cập nhật</TableCell>
    <TableCell align="right" sx={{ fontWeight: 700 }}>
      Thao Tác
    </TableCell>
  </TableRow>
</TableHead>
         <TableBody>
  {productTypes.length === 0 ? (
    <TableRow>
      <TableCell colSpan={5} align="center">
        <Illustration />
      </TableCell>
    </TableRow>
  ) : (
    productTypes.map((row) => (
      <TableRow
        key={row.id}
        hover
        sx={{
          transition: "background 0.2s",
          ":hover": { bgcolor: "#f1f8e9" },
        }}
      >
        <TableCell>{row.name}</TableCell>
        <TableCell>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={row.calculateFormula || "Không có công thức"}
          >
            {row.calculateFormula || "Không có công thức"}
          </Typography>
        </TableCell>
        <TableCell>
          {row.createAt
            ? dayjs(row.createAt).format("DD/MM/YYYY")
            : ""}
        </TableCell>
        <TableCell>
          {row.updateAt
            ? dayjs(row.updateAt).format("DD/MM/YYYY")
            : ""}
        </TableCell>
        <TableCell align="right">
          <IconButton
            color="primary"
            onClick={() => handleOpenEdit(row)}
            sx={{ borderRadius: 2 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(row)}
            sx={{ borderRadius: 2 }}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>
          {dialogMode === "add" ? "Thêm Loại Biển Hiệu" : "Sửa Loại Biển Hiệu"}
        </DialogTitle>
       <DialogContent>
  <TextField
    autoFocus
    margin="dense"
    label="Tên loại biển hiệu"
    fullWidth
    value={form.name}
    onChange={(e) => setForm({ ...form, name: e.target.value })}
  />
  <TextField
    margin="dense"
    label="Công thức tính toán"
    fullWidth
    value={form.calculateFormula}
    onChange={(e) => setForm({ ...form, calculateFormula: e.target.value })}
    placeholder="Nhập công thức tính toán"
    sx={{ mt: 2, fontFamily: 'monospace' }}
  />
</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            {dialogMode === "add" ? "Thêm" : "Sửa"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa loại sản phẩm này không?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Hủy</Button>
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

export default ProductTypeManager;
