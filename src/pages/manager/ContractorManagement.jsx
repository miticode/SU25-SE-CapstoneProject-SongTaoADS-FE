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
  FormControlLabel,
  Checkbox,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllContractors,
  createContractorThunk,
  updateContractorThunk,
  updateContractorLogoThunk,
  fetchContractorById,
  deleteContractorThunk,
  clearError,
} from "../../store/features/contractor/contractorSlice";
import ContractorLogo from "../../components/ContractorLogo";
import { clearAvatarCache } from "../../components/S3Avatar";
const defaultForm = {
  name: "",
  address: "",
  phone: "",
  email: "",
  isInternal: false,
  isAvailable: true,
  logoImage: null,
};

const ContractorManagement = () => {
  const dispatch = useDispatch();
  const { contractors, loading, error, pagination } = useSelector(
    (state) => state.contractor
  );
  
  // State cho phân trang và filter
  const [paginationParams, setPaginationParams] = useState({
    page: 1,
    size: 10,
    isInternal: null,
  });
  
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
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    // Tạo params để gửi API, loại bỏ các giá trị null/undefined
    const apiParams = {
      page: paginationParams.page,
      size: paginationParams.size,
    };
    
    // Chỉ thêm isInternal nếu có giá trị boolean
    if (paginationParams.isInternal !== null) {
      apiParams.isInternal = paginationParams.isInternal;
    }
    
    dispatch(fetchAllContractors(apiParams));
  }, [dispatch, paginationParams]);

  // Xử lý thay đổi phân trang
  const handlePageChange = (event, newPage) => {
    setPaginationParams(prev => ({ ...prev, page: newPage }));
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (field, value) => {
    // Chuyển đổi giá trị string thành boolean hoặc null
    let processedValue = value;
    if (field === 'isInternal') {
      if (value === '') {
        processedValue = null; // "Tất cả"
      } else {
        processedValue = value === 'true'; // Chuyển string thành boolean
      }
    }
    
    setPaginationParams(prev => ({ ...prev, [field]: processedValue, page: 1 }));
  };

  const handleOpenDialog = (contractor) => {
    if (contractor) {
      setForm({
        name: contractor.name || "",
        address: contractor.address || "",
        phone: contractor.phone || "",
        email: contractor.email || "",
        isInternal: contractor.isInternal || false,
        isAvailable: contractor.isAvailable || true,
        logoImage: null,
      });
      setEditId(contractor.id);
      setLogoPreview(contractor.logo); // Đây là S3 key
    } else {
      setForm(defaultForm);
      setEditId(null);
      setLogoPreview(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm(defaultForm);
    setEditId(null);
    setLogoPreview(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file" && files) {
      const file = files[0];
      setForm(prev => ({ ...prev, logoImage: file }));
      
      // Tạo preview
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      // Update
      let updateSuccess = false;
      
      // Nếu có logo mới, cập nhật logo trước
      if (form.logoImage) {
        const logoRes = await dispatch(
          updateContractorLogoThunk({ contractorId: editId, logoFile: form.logoImage })
        );
        if (logoRes.meta.requestStatus === "fulfilled") {
          updateSuccess = true;
          // Clear cache của logo cũ nếu có
          if (logoPreview) {
            clearAvatarCache(logoPreview);
          }
        } else {
          setSnackbar({
            open: true,
            message: logoRes.payload || "Cập nhật logo thất bại!",
            severity: "error",
          });
          return;
        }
      }
      
      // Cập nhật thông tin khác
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
        
        // Refresh lại danh sách để hiển thị logo mới
        const apiParams = {
          page: paginationParams.page,
          size: paginationParams.size,
        };
        if (paginationParams.isInternal !== null) {
          apiParams.isInternal = paginationParams.isInternal;
        }
        dispatch(fetchAllContractors(apiParams));
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
        
        // Refresh lại danh sách để hiển thị logo mới
        const apiParams = {
          page: paginationParams.page,
          size: paginationParams.size,
        };
        if (paginationParams.isInternal !== null) {
          apiParams.isInternal = paginationParams.isInternal;
        }
        dispatch(fetchAllContractors(apiParams));
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

  // Xử lý đóng snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Xử lý đóng error
  const handleCloseError = () => {
    dispatch(clearError());
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
            <IconButton onClick={() => {
              const apiParams = {
                page: paginationParams.page,
                size: paginationParams.size,
              };
              if (paginationParams.isInternal !== null) {
                apiParams.isInternal = paginationParams.isInternal;
              }
              dispatch(fetchAllContractors(apiParams));
            }}>
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

      {/* Filter */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Loại đơn vị</InputLabel>
            <Select
              value={paginationParams.isInternal === null ? "" : paginationParams.isInternal.toString()}
              label="Loại đơn vị"
              onChange={(e) => handleFilterChange('isInternal', e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="true">Nội bộ</MenuItem>
              <MenuItem value="false">Bên ngoài</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Logo</TableCell>
                <TableCell>Tên đơn vị</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : contractors && contractors.length > 0 ? (
                contractors.map((row, idx) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{(paginationParams.page - 1) * paginationParams.size + idx + 1}</TableCell>
                                         <TableCell>
                       <ContractorLogo
                         logoKey={row.logo}
                         contractorName={row.name}
                         size={40}
                       />
                     </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.isInternal ? "Nội bộ" : "Bên ngoài"}
                        color={row.isInternal ? "primary" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.isAvailable ? "Hoạt động" : "Không hoạt động"}
                        color={row.isAvailable ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết">
                        <IconButton onClick={() => handleViewDetail(row.id)}>
                          <VisibilityIcon color="primary" />
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
                  <TableCell colSpan={9} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={pagination.totalPages}
              page={paginationParams.page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
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
                         {/* Logo upload */}
             <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
               {editId && form.logoImage ? (
                 <Avatar
                   src={logoPreview}
                   sx={{ width: 80, height: 80, mb: 1 }}
                 >
                   {form.name?.charAt(0)?.toUpperCase()}
                 </Avatar>
                               ) : editId ? (
                  <ContractorLogo
                    logoKey={logoPreview}
                    contractorName={form.name}
                    size={80}
                    sx={{ mb: 1 }}
                  />
                ) : (
                 <Avatar
                   src={logoPreview}
                   sx={{ width: 80, height: 80, mb: 1 }}
                 >
                   {form.name?.charAt(0)?.toUpperCase()}
                 </Avatar>
               )}
               <Button
                 variant="outlined"
                 component="label"
                 startIcon={<PhotoCameraIcon />}
                 size="small"
               >
                 {editId ? "Thay đổi logo" : "Tải logo"}
                 <input
                   type="file"
                   hidden
                   name="logoImage"
                   accept="image/*"
                   onChange={handleChange}
                 />
               </Button>
             </Box>

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
              <FormControlLabel
                control={
                  <Checkbox
                    name="isInternal"
                    checked={form.isInternal}
                    onChange={handleChange}
                  />
                }
                label="Nội bộ"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isAvailable"
                    checked={form.isAvailable}
                    onChange={handleChange}
                  />
                }
                label="Hoạt động"
              />
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
               {/* Logo */}
               <Box display="flex" justifyContent="center" mb={2}>
                 <ContractorLogo
                   logoKey={detailDialog.data.logo}
                   contractorName={detailDialog.data.name}
                   size={160}
                 />
               </Box>
              
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
                <b>Loại:</b> {detailDialog.data.isInternal ? "Nội bộ" : "Bên ngoài"}
              </Typography>
              <Typography>
                <b>Trạng thái:</b>{" "}
                {detailDialog.data.isAvailable ? "Hoạt động" : "Không hoạt động"}
              </Typography>
              <Typography>
                <b>Ngày tạo:</b> {new Date(detailDialog.data.createdAt).toLocaleString('vi-VN')}
              </Typography>
              <Typography>
                <b>Ngày cập nhật:</b> {new Date(detailDialog.data.updatedAt).toLocaleString('vi-VN')}
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
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Hiển thị lỗi chung */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={handleCloseError}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ContractorManagement;
