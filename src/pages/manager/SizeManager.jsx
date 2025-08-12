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
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

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
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Typography variant="h4" className="!font-bold !text-gray-800 !mb-2">
              📏 Quản lý kích thước
            </Typography>
            <Typography variant="body1" className="!text-gray-600">
              Quản lý các kích thước trong hệ thống
            </Typography>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2"
          >
            <AddIcon />
            Thêm kích thước
          </button>
        </div>

        {/* Status Messages */}
        {status === "loading" && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <CircularProgress size={20} className="text-blue-600" />
            <Typography className="!text-blue-700">Đang tải dữ liệu...</Typography>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <Typography className="!text-red-700">{error}</Typography>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table stickyHeader>
            <TableHead>
              <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <TableCell className="!font-bold !text-gray-700 !py-4">Tên kích thước</TableCell>
                <TableCell className="!font-bold !text-gray-700 !py-4">Mô tả</TableCell>
                <TableCell className="!font-bold !text-gray-700 !py-4 !text-right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sizes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" className="!py-16">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6M9 16h6M9 8h6M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                        </svg>
                      </div>
                      <Typography variant="h6" className="!font-bold !text-gray-500 !mb-2">
                        Chưa có kích thước nào
                      </Typography>
                      <Typography className="!text-gray-400 !mb-4">
                        Hãy thêm kích thước mới để bắt đầu quản lý
                      </Typography>
                      <button
                        onClick={handleOpenAdd}
                        className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg font-medium transition-colors duration-200"
                      >
                        Thêm kích thước đầu tiên
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sizes.map((size) => (
                  <TableRow
                    key={size.id}
                    className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                  >
                    <TableCell className="!py-4">
                      <Typography className="!font-semibold !text-gray-800">
                        {size.name}
                      </Typography>
                    </TableCell>
                    <TableCell className="!py-4">
                      <Typography className="!text-gray-600">
                        {size.description || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" className="!py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(size)}
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                          title="Chỉnh sửa"
                        >
                          <EditIcon className="!text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(size.id)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                          title="Xóa"
                        >
                          <DeleteIcon className="!text-sm" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "!rounded-2xl !shadow-2xl !max-h-[90vh]"
        }}
      >
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 border-b border-gray-200 relative">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              editMode 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-emerald-100 text-emerald-600'
            }`}>
              {editMode ? <EditIcon /> : <AddIcon />}
            </div>
            <div>
              <Typography variant="h5" className="!font-bold !text-gray-800">
                {editMode ? "✏️ Sửa kích thước" : "🎯 Thêm kích thước"}
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !mt-1">
                {editMode 
                  ? "Cập nhật thông tin kích thước đã chọn"
                  : "Tạo mới kích thước cho hệ thống"}
              </Typography>
            </div>
          </div>
          
          <button
            onClick={handleCloseDialog}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors duration-200"
          >
            <CloseIcon className="!text-gray-700" />
          </button>
        </div>

        <div className="p-6 bg-white max-h-[calc(90vh-180px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Tên kích thước */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tên kích thước <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-700 placeholder-gray-400 font-medium"
                placeholder="Nhập tên kích thước"
                autoFocus
                required
              />
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Mô tả
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 resize-none text-gray-700 placeholder-gray-400"
                placeholder="Nhập mô tả cho kích thước (tùy chọn)"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={handleCloseDialog}
              className="order-2 sm:order-1 w-full sm:w-auto px-6 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim()}
              className="order-1 sm:order-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editMode ? <EditIcon className="!text-sm" /> : <AddIcon className="!text-sm" />}
              {editMode ? "Lưu thay đổi" : "Thêm kích thước"}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "!rounded-2xl !shadow-2xl"
        }}
      >
        <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <DeleteIcon />
            </div>
            <div>
              <Typography variant="h6" className="!font-bold !text-gray-800">
                🗑️ Xác nhận xóa
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !mt-1">
                Thao tác này không thể hoàn tác
              </Typography>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white">
          <Typography className="!text-gray-700 !text-lg">
            Bạn có chắc chắn muốn xóa kích thước này không?
          </Typography>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <Typography variant="body2" className="!text-yellow-800">
              ⚠️ <strong>Lưu ý:</strong> Việc xóa kích thước có thể ảnh hưởng đến các sản phẩm đang sử dụng kích thước này.
            </Typography>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => setConfirmDelete(false)}
              className="order-2 sm:order-1 w-full sm:w-auto px-6 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirmDelete}
              className="order-1 sm:order-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2"
            >
              <DeleteIcon className="!text-sm" />
              Xóa kích thước
            </button>
          </div>
        </div>
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
    </div>
  );
};

export default SizeManager;
