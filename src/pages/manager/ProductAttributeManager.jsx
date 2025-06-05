import React, { useState } from "react";
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
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Mock data cho UI demo
const mockAttributes = [
  { id: 1, name: "Chất liệu", description: "Nhôm, mica, inox..." },
  { id: 2, name: "Màu sắc", description: "Đỏ, xanh, vàng..." },
];

const ProductAttributeManager = () => {
  const [attributes, setAttributes] = useState(mockAttributes);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({ name: "", description: "" });
    setOpenDialog(true);
  };

  const handleOpenEdit = (attr) => {
    setEditMode(true);
    setForm({ name: attr.name, description: attr.description });
    setSelectedId(attr.id);
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
      setAttributes((prev) =>
        prev.map((a) => (a.id === selectedId ? { ...a, ...form } : a))
      );
    } else {
      setAttributes((prev) => [...prev, { id: Date.now(), ...form }]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    setAttributes((prev) => prev.filter((a) => a.id !== deleteId));
    setConfirmDelete(false);
    setDeleteId(null);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Thuộc tính biển hiệu
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          mb: 3,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Danh sách thuộc tính</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: 2 }}
          >
            Thêm thuộc tính
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Tên thuộc tính</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attributes.map((attr) => (
                <TableRow key={attr.id} hover>
                  <TableCell>{attr.name}</TableCell>
                  <TableCell>{attr.description}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Sửa">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEdit(attr)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(attr.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Sửa thuộc tính" : "Thêm thuộc tính"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên thuộc tính"
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
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Lưu" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn xóa thuộc tính này?</Typography>
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
    </Box>
  );
};

export default ProductAttributeManager;
