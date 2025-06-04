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

const ProductTypeManager = () => {
  const dispatch = useDispatch();
  const productTypes = useSelector(selectAllProductTypes);
  const status = useSelector(selectProductTypeStatus);
  const error = useSelector(selectProductTypeError);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' | 'edit'
  const [form, setForm] = useState({ name: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(fetchProductTypes());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setDialogMode("add");
    setForm({ name: "" });
    setEditId(null);
    setOpenDialog(true);
  };
  const handleOpenEdit = (row) => {
    setDialogMode("edit");
    setForm({ name: row.name || "" });
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
        calculateFormula: "",
        isAvailable: true,
      });
      if (res.success) {
        dispatch(fetchProductTypes());
      } else {
        alert(res.error || "Add failed");
      }
    } else if (dialogMode === "edit" && editId) {
      const res = await updateProductTypeApi(editId, {
        name: form.name,
        calculateFormula: "",
        isAvailable: true,
      });
      if (res.success) {
        dispatch(fetchProductTypes());
      } else {
        alert(res.error || "Update failed");
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
      } else {
        alert(res.error || "Delete failed");
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
        <Typography variant="h5" fontWeight="bold">
          Quản lý loại biển hiệu
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Thêm loại biển hiệu
        </Button>
      </Box>
      {status === "loading" && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Ngày cập nhật</TableCell>
              <TableCell align="right">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productTypes.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  {row.createAt ? dayjs(row.createAt).format("DD/MM/YYYY") : ""}
                </TableCell>
                <TableCell>
                  {row.updateAt ? dayjs(row.updateAt).format("DD/MM/YYYY") : ""}
                </TableCell>
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
          {dialogMode === "add" ? "Thêm Loại Biển Hiệu" : "Sửa Loại Biển Hiệu"}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === "add" ? "Thêm" : "Sửa"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
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
    </Box>
  );
};

export default ProductTypeManager;
