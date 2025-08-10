import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductTypes,
  selectAllProductTypes,
  selectProductTypeStatus,
  selectProductTypeError,
  addProductType, // Add this import for Redux action
  selectAddProductTypeStatus, // Add this import
  resetAddProductTypeStatus, // Add this import
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
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Avatar,
  Radio,
  RadioGroup,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  InfoOutlined as InfoOutlinedIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import {
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
  
  // Add status và error cho việc tạo mới
  const addStatus = useSelector(selectAddProductTypeStatus);
  

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' | 'edit'
  
  // Cập nhật state form với các trường mới
  const [form, setForm] = useState({ 
    name: "", 
    calculateFormula: "",
    isAiGenerated: false,
    isAvailable: false,
    productTypeImage: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
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
    setForm({ 
      name: "", 
      calculateFormula: "",
      isAiGenerated: false,
      isAvailable: false,
      productTypeImage: null
    });
    setImagePreview(null);
    setEditId(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (row) => {
    setDialogMode("edit");
    setForm({
      name: row.name || "",
      calculateFormula: row.calculateFormula || "",
      isAiGenerated: row.isAiGenerated || false,
      isAvailable: row.isAvailable !== undefined ? row.isAvailable : true,
      productTypeImage: null
    });
    setImagePreview(row.image || null);
    setEditId(row.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setImagePreview(null);
    // Reset add status khi đóng dialog
    dispatch(resetAddProductTypeStatus());
  };

  // Hàm xử lý file upload
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Kiểm tra file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn file hình ảnh!",
          severity: "error",
        });
        return;
      }
      
      // Kiểm tra file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "File hình ảnh phải nhỏ hơn 5MB!",
          severity: "error",
        });
        return;
      }

      setForm({ ...form, productTypeImage: file });
      
      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm xóa image
  const handleRemoveImage = () => {
    setForm({ ...form, productTypeImage: null });
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (dialogMode === "add") {
      const formData = {
        name: form.name,
        calculateFormula: form.calculateFormula,
        isAiGenerated: form.isAiGenerated,
        isAvailable: form.isAvailable,
        productTypeImage: form.productTypeImage,
      };
      
      const result = await dispatch(addProductType(formData));
      
      if (addProductType.fulfilled.match(result)) {
        // Refresh danh sách product types
        dispatch(fetchProductTypes());
        setSnackbar({
          open: true,
          message: "Thêm loại biển hiệu thành công!",
          severity: "success",
        });
        setOpenDialog(false);
      } else {
        setSnackbar({
          open: true,
          message: result.payload || "Thêm thất bại!",
          severity: "error",
        });
      }
    } else if (dialogMode === "edit" && editId) {
      const res = await updateProductTypeApi(editId, {
        name: form.name,
        calculateFormula: form.calculateFormula,
        isAiGenerated: form.isAiGenerated,
        isAvailable: form.isAvailable,
      });
      if (res.success) {
        dispatch(fetchProductTypes());
        setSnackbar({
          open: true,
          message: "Cập nhật thành công!",
          severity: "success",
        });
        setOpenDialog(false);
      } else {
        setSnackbar({
          open: true,
          message: res.error || "Update failed",
          severity: "error",
        });
      }
    }
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
              <TableCell sx={{ fontWeight: 700 }}>
                Công thức tính toán
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
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
                <TableCell colSpan={6} align="center">
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
                        fontFamily: "monospace",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={row.calculateFormula || "Không có công thức"}
                    >
                      {row.calculateFormula || "Không có công thức"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.isAvailable ? "Có sẵn" : "Không có sẵn"}
                      color={row.isAvailable ? "success" : "default"}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        minWidth: 90,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {row.createdAt
                      ? dayjs(row.createdAt).format("DD/MM/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row.updatedAt
                      ? dayjs(row.updatedAt).format("DD/MM/YYYY")
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

      {/* Enhanced Dialog with improved styling */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              fontSize: 22,
              p: 3,
              bgcolor: "#f8f9fa",
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              {dialogMode === "edit" ? (
                <EditIcon color="primary" />
              ) : (
                <AddIcon color="primary" />
              )}
              {dialogMode === "edit"
                ? "Sửa Loại Biển Hiệu"
                : "Thêm Loại Biển Hiệu"}
            </Box>
            <IconButton
              onClick={handleCloseDialog}
              size="small"
              sx={{ borderRadius: 1 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Tên loại biển hiệu */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="500"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Tên loại biển hiệu
                </Typography>
                <TextField
                  autoFocus
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                  fullWidth
                  required
                  variant="outlined"
                  placeholder="Nhập tên loại biển hiệu"
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      fontSize: "1rem",
                    },
                  }}
                />
              </Box>

        {/* Upload hình ảnh */}
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight="500"
            sx={{ mb: 1, color: "text.primary" }}
          >
            Hình ảnh loại biển hiệu
          </Typography>
          
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageChange}
          />
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Chọn hình ảnh
              </Button>
            </label>
            
            {imagePreview && (
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={imagePreview}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: 2 
                  }}
                  variant="rounded"
                >
                  <ImageIcon />
                </Avatar>
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'error.dark' },
                    width: 24,
                    height: 24
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>

        {/* Checkbox chỉ cho isAiGenerated */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight="500"
            sx={{ color: "text.primary" }}
          >
            Cài đặt
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isAiGenerated}
                  onChange={(e) =>
                    setForm({ ...form, isAiGenerated: e.target.checked })
                  }
                  color="primary"
                />
              }
              label="Được tạo bởi AI"
            />
          </Box>
        </Box>

           
            </Box>
          </DialogContent>

          <DialogActions
            sx={{ p: 2.5, borderTop: "1px solid #eee", bgcolor: "#f8f9fa" }}
          >
            <Button
              onClick={handleCloseDialog}
              size="large"
              sx={{
                borderRadius: 1.5,
                px: 3,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              size="large"
              disabled={!form.name || addStatus === "loading"}
              startIcon={addStatus === "loading" ? <CircularProgress size={20} /> : null}
              sx={{
                borderRadius: 1.5,
                px: 3,
                boxShadow: "0 3px 5px 0 rgba(76,175,80,0.3)",
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              {addStatus === "loading" 
                ? (dialogMode === "edit" ? "Đang lưu..." : "Đang thêm...") 
                : (dialogMode === "edit" ? "Lưu thay đổi" : "Thêm loại biển hiệu")
              }
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa loại sản phẩm này không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCancelDelete}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 500,
            }}
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
