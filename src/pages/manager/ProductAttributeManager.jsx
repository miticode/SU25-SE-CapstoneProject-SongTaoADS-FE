import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAttributesByProductTypeId,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  selectAllAttributes,
  selectAttributeStatus,
  resetAttributeStatus,
} from "../../store/features/attribute/attributeSlice";
import { getProductTypesApi } from "../../api/productTypeService";
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
  CircularProgress,
  Snackbar,
  InputBase,
  Fade,
  Divider,
  Alert,
  MenuItem,
  Select,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const Illustration = () => (
  <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
    <img
      src="https://quangcaotayninh.com.vn/wp-content/uploads/2020/08/logo-quang-cao-tay-ninh-3.png"
      alt="Chọn loại biển hiệu"
      style={{ width: 180, opacity: 0.7 }}
    />
    <Typography variant="h5" fontWeight="bold" mt={2}>
      Chọn loại biển hiệu để xem thuộc tính
    </Typography>
    <Typography color="text.secondary" mt={1}>
      Vui lòng chọn một loại biển hiệu ở bên trái để quản lý thuộc tính.
    </Typography>
  </Box>
);

const ProductAttributeManager = () => {
  const dispatch = useDispatch();
  const attributes = useSelector(selectAllAttributes);
  const status = useSelector(selectAttributeStatus);
  // const error = useSelector(selectAttributeError);

  const [productTypes, setProductTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProductTypeId, setSelectedProductTypeId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", calculateFormula: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch all product types on mount
  useEffect(() => {
    const fetchProductTypes = async () => {
      const res = await getProductTypesApi();
      if (res.success) setProductTypes(res.data);
    };
    fetchProductTypes();
  }, []);

  // Fetch attributes when product type changes
  useEffect(() => {
    if (selectedProductTypeId) {
      dispatch(fetchAttributesByProductTypeId(selectedProductTypeId));
    }
  }, [dispatch, selectedProductTypeId]);

  // Lọc loại biển hiệu theo search
  const filteredProductTypes = productTypes.filter((pt) =>
    pt.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({ name: "", calculateFormula: "" });
    setOpenDialog(true);
  };

  const handleOpenEdit = (attr) => {
    setEditMode(true);
    setForm({ name: attr.name, calculateFormula: attr.calculateFormula || "" });
    setSelectedId(attr.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm({ name: "", calculateFormula: "" });
    setSelectedId(null);
    dispatch(resetAttributeStatus());
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!selectedProductTypeId) return;
    const data = {
      name: form.name,
      calculateFormula: form.calculateFormula,
      isAvailable: true,
      isCore: true,
    };
    if (editMode) {
      dispatch(updateAttribute({ attributeId: selectedId, data }))
        .unwrap()
        .then(() =>
          setSnackbar({
            open: true,
            message: "Cập nhật thành công!",
            severity: "success",
          })
        )
        .catch((err) =>
          setSnackbar({ open: true, message: err, severity: "error" })
        );
    } else {
      dispatch(createAttribute({ productTypeId: selectedProductTypeId, data }))
        .unwrap()
        .then(() =>
          setSnackbar({
            open: true,
            message: "Thêm thành công!",
            severity: "success",
          })
        )
        .catch((err) =>
          setSnackbar({ open: true, message: err, severity: "error" })
        );
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteAttribute(deleteId))
      .unwrap()
      .then(() =>
        setSnackbar({
          open: true,
          message: "Xóa thành công!",
          severity: "success",
        })
      )
      .catch((err) =>
        setSnackbar({ open: true, message: err, severity: "error" })
      );
    setConfirmDelete(false);
    setDeleteId(null);
  };

  return (
    <Box display="flex" gap={2}>
      {/* Sidebar Product Type List */}
      <Paper
        elevation={0}
        sx={{
          width: 270,
          minWidth: 200,
          borderRight: "1px solid #eee",
          p: 2,
          borderRadius: 3,
          height: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" mb={2} fontWeight={700}>
          Loại biển hiệu
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1.5,
            px: 1,
            borderRadius: 2,
            background: "#f5f5f5",
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: "#888", mr: 1 }} />
          <InputBase
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ fontSize: 15, width: 1 }}
          />
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box flex={1} overflow="auto">
          {status === "loading" && <CircularProgress size={20} />}
          {filteredProductTypes.map((pt) => (
            <Fade in key={pt.id}>
              <Box
                p={1.2}
                mb={1}
                borderRadius={2}
                bgcolor={
                  selectedProductTypeId === pt.id ? "#e8f5e9" : "transparent"
                }
                border={
                  selectedProductTypeId === pt.id
                    ? "2px solid #388e3c"
                    : "2px solid transparent"
                }
                sx={{
                  cursor: "pointer",
                  fontWeight: selectedProductTypeId === pt.id ? 700 : 400,
                  transition: "all 0.2s",
                  boxShadow:
                    selectedProductTypeId === pt.id
                      ? "0 2px 8px 0 rgba(56,142,60,0.08)"
                      : undefined,
                  color:
                    selectedProductTypeId === pt.id ? "#1b5e20" : undefined,
                  ":hover": {
                    bgcolor: "#f1f8e9",
                  },
                }}
                onClick={() => setSelectedProductTypeId(pt.id)}
              >
                {pt.name}
              </Box>
            </Fade>
          ))}
          {filteredProductTypes.length === 0 && (
            <Typography color="text.secondary" mt={2} fontSize={15}>
              Không tìm thấy loại biển hiệu nào.
            </Typography>
          )}
        </Box>
      </Paper>
      {/* Main Content: Attribute Table */}
      <Box flex={1}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight="bold">
            {selectedProductTypeId
              ? `Thuộc tính của: ${
                  productTypes.find((pt) => pt.id === selectedProductTypeId)
                    ?.name
                }`
              : "Chọn loại biển hiệu để xem thuộc tính"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            disabled={!selectedProductTypeId}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 16,
              boxShadow: "0 2px 8px 0 rgba(56,142,60,0.08)",
            }}
          >
            Thêm thuộc tính
          </Button>
        </Box>
        {status === "loading" && <CircularProgress />}
        {!selectedProductTypeId && <Illustration />}
        {selectedProductTypeId && (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 10px rgba(56,142,60,0.08)",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Tên thuộc tính</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Công thức tính</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Box py={4}>
                        <img
                          src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/sleeping_kitty.png"
                          alt="No attribute"
                          style={{ width: 120, opacity: 0.6 }}
                        />
                        <Typography color="text.secondary" mt={2}>
                          Chưa có thuộc tính nào cho loại biển hiệu này.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  attributes.map((attr) => (
                    <TableRow
                      key={attr.id}
                      hover
                      sx={{
                        transition: "background 0.2s",
                        ":hover": { bgcolor: "#f1f8e9" },
                      }}
                    >
                      <TableCell>{attr.name}</TableCell>
                      <TableCell>{attr.calculateFormula}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Sửa">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEdit(attr)}
                            sx={{ borderRadius: 2 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(attr.id)}
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
      </Box>
      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>
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
            label="Công thức tính"
            name="calculateFormula"
            value={form.calculateFormula}
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

export default ProductAttributeManager;
