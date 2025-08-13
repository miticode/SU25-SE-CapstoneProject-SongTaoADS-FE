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
  updateProductTypeImage,
  selectUpdateImageStatus,
  selectUpdateImageError,
  resetUpdateImageStatus,
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
  Close as CloseIcon,
  InfoOutlined as InfoOutlinedIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import {
  updateProductTypeApi,
} from "../../api/productTypeService";
import { getPresignedUrl } from "../../api/s3Service";
import FormulaGuide from "../../components/FormulaGuide";
import dayjs from "dayjs";

// Component để hiển thị ảnh từ S3
const ProductTypeImage = ({ imageKey }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!imageKey || imageKey.trim() === '') {
        return;
      }
      
      setLoading(true);
      try {
        const result = await getPresignedUrl(imageKey, 60); // 60 phút
        if (result.success) {
          setImageUrl(result.url);
        }
      } catch (error) {
        console.error("Lỗi tải ảnh:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imageKey]);

  if (!imageKey || imageKey.trim() === '') {
    return (
      <Avatar
        sx={{ 
          width: 50, 
          height: 50, 
          bgcolor: 'grey.200',
          borderRadius: 2 
        }}
        variant="rounded"
      >
        <ImageIcon sx={{ color: 'grey.400' }} />
      </Avatar>
    );
  }

  if (loading) {
    return (
      <Box 
        sx={{ 
          width: 50, 
          height: 50, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: 2,
          bgcolor: 'grey.100'
        }}
      >
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <Avatar
      src={imageUrl}
      sx={{ 
        width: 50, 
        height: 50, 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.300'
      }}
      variant="rounded"
    >
      <ImageIcon />
    </Avatar>
  );
};

const ProductTypeManager = ({ setActiveTab }) => {
  const dispatch = useDispatch();
  const productTypes = useSelector(selectAllProductTypes);
  const status = useSelector(selectProductTypeStatus);
  const error = useSelector(selectProductTypeError);
  
  // Add status và error cho việc tạo mới
  const addStatus = useSelector(selectAddProductTypeStatus);
  
  // Status và error cho việc cập nhật hình ảnh
  const updateImageStatus = useSelector(selectUpdateImageStatus);
  const updateImageError = useSelector(selectUpdateImageError);
  

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
  const [_originalImage, setOriginalImage] = useState(null); // Lưu ảnh gốc
  const [imageChanged, setImageChanged] = useState(false); // Theo dõi thay đổi ảnh
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  }); 
  const [openFormulaGuide, setOpenFormulaGuide] = useState(false); 
  useEffect(() => {
    dispatch(fetchProductTypes());
  }, [dispatch]);

  // Effect để xử lý lỗi cập nhật hình ảnh
  useEffect(() => {
    if (updateImageError) {
      setSnackbar({
        open: true,
        message: updateImageError,
        severity: "error",
      });
    }
  }, [updateImageError]);
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
    setOriginalImage(row.image || null);
    setImageChanged(false);
    setEditId(row.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setImagePreview(null);
    setOriginalImage(null);
    setImageChanged(false);
    // Reset add status khi đóng dialog
    dispatch(resetAddProductTypeStatus());
    dispatch(resetUpdateImageStatus());
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
      setImageChanged(true); // Đánh dấu ảnh đã thay đổi
      
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
    if (dialogMode === "edit") {
      setImageChanged(true); // Đánh dấu ảnh đã thay đổi (xóa)
    }
  };

  const handleSubmit = async () => {
    if (dialogMode === "add") {
      const formData = {
        name: form.name,
        isAiGenerated: form.isAiGenerated,
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
      try {
        // Cập nhật thông tin cơ bản
        const res = await updateProductTypeApi(editId, {
          name: form.name,
          calculateFormula: form.calculateFormula,
          isAiGenerated: form.isAiGenerated,
          isAvailable: form.isAvailable,
        });

        if (!res.success) {
          setSnackbar({
            open: true,
            message: res.error || "Cập nhật thông tin thất bại",
            severity: "error",
          });
          return;
        }

        // Nếu hình ảnh có thay đổi, cập nhật hình ảnh
        if (imageChanged && form.productTypeImage) {
          const imageResult = await dispatch(updateProductTypeImage({
            productTypeId: editId,
            imageFile: form.productTypeImage,
          }));

          if (!updateProductTypeImage.fulfilled.match(imageResult)) {
            setSnackbar({
              open: true,
              message: imageResult.payload || "Cập nhật hình ảnh thất bại",
              severity: "error",
            });
            return;
          }
        }

        // Refresh danh sách sau khi cập nhật thành công
        dispatch(fetchProductTypes());
        setSnackbar({
          open: true,
          message: "Cập nhật thành công!",
          severity: "success",
        });
        setOpenDialog(false);
      } catch (error) {
        console.error("Update error:", error);
        setSnackbar({
          open: true,
          message: "Có lỗi xảy ra khi cập nhật!",
          severity: "error",
        });
      }
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const newStatus = !row.isAvailable;
      const res = await updateProductTypeApi(row.id, {
        name: row.name,
        calculateFormula: row.calculateFormula,
        isAiGenerated: row.isAiGenerated,
        isAvailable: newStatus,
      });

      if (res.success) {
        dispatch(fetchProductTypes());
        setSnackbar({
          open: true,
          message: `${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} thành công!`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.error || "Cập nhật trạng thái thất bại",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra khi cập nhật trạng thái!",
        severity: "error",
      });
    }
  };

  const handleFormulaGuide = () => {
    setOpenFormulaGuide(true);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Typography variant="h4" className="!font-bold !text-gray-800 !mb-2">
              🏷️ Quản lý loại biển hiệu
            </Typography>
            <Typography variant="body1" className="!text-gray-600">
              Quản lý các loại biển hiệu trong hệ thống
            </Typography>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2"
          >
            <AddIcon />
            Thêm loại biển hiệu
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
                <TableCell className="!font-bold !text-gray-700 !py-4">Hình ảnh</TableCell>
                <TableCell className="!font-bold !text-gray-700 !py-4">Tên</TableCell>
                <TableCell className="!font-bold !text-gray-700 !py-4">Công thức tính toán</TableCell>
                <TableCell className="!font-bold !text-gray-700 !py-4">Trạng thái</TableCell>
                <TableCell className="!font-bold !text-gray-700 !py-4">Ngày tạo</TableCell>
                <TableCell className="!font-bold !text-gray-700 !py-4">Ngày cập nhật</TableCell>
                <TableCell className="!font-bold !text-gray-700 !py-4 !text-right">Thao Tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="!py-16">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <Typography variant="h6" className="!font-bold !text-gray-500 !mb-2">
                        Chưa có loại biển hiệu nào
                      </Typography>
                      <Typography className="!text-gray-400 !mb-4">
                        Hãy thêm loại biển hiệu mới để bắt đầu quản lý
                      </Typography>
                      <button
                        onClick={handleOpenAdd}
                        className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg font-medium transition-colors duration-200"
                      >
                        Thêm loại biển hiệu đầu tiên
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                productTypes.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                  >
                    <TableCell className="!py-4">
                      <ProductTypeImage imageKey={row.image} />
                    </TableCell>
                    <TableCell className="!py-4">
                      <Typography className="!font-semibold !text-gray-800">
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell className="!py-4">
                      {row.calculateFormula && row.calculateFormula.trim() !== "" ? (
                        <div className="bg-gray-50 rounded-lg p-3 max-w-[200px]">
                          <Typography
                            variant="body2"
                            className="!font-mono !text-gray-700 !text-sm !leading-relaxed"
                            title={row.calculateFormula}
                          >
                            {row.calculateFormula.length > 50 
                              ? `${row.calculateFormula.substring(0, 50)}...` 
                              : row.calculateFormula}
                          </Typography>
                        </div>
                      ) : (
                        <button
                          onClick={handleFormulaGuide}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                        >
                          <HelpIcon className="!text-sm" />
                          Hướng dẫn tạo công thức
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="!py-4">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        row.isAvailable 
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {row.isAvailable ? "✅ Có sẵn" : " Không có sẵn"}
                      </span>
                    </TableCell>
                    <TableCell className="!py-4">
                      <Typography className="!text-gray-600">
                        {row.createdAt ? dayjs(row.createdAt).format("DD/MM/YYYY") : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell className="!py-4">
                      <Typography className="!text-gray-600">
                        {row.updatedAt ? dayjs(row.updatedAt).format("DD/MM/YYYY") : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" className="!py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(row)}
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                          title="Chỉnh sửa"
                        >
                          <EditIcon className="!text-sm" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(row)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                            row.isAvailable
                              ? 'bg-green-100 hover:bg-green-200 text-green-600'
                              : 'bg-red-100 hover:bg-red-200 text-red-600'
                          }`}
                          title={row.isAvailable ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {row.isAvailable ? <ToggleOnIcon className="!text-sm" /> : <ToggleOffIcon className="!text-sm" />}
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

      {/* Enhanced Dialog with improved styling */}
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
              dialogMode === "edit" 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-emerald-100 text-emerald-600'
            }`}>
              {dialogMode === "edit" ? <EditIcon /> : <AddIcon />}
            </div>
            <div>
              <Typography variant="h5" className="!font-bold !text-gray-800">
                {dialogMode === "edit"
                  ? "✏️ Sửa Loại Biển Hiệu"
                  : "🎯 Thêm Loại Biển Hiệu"}
              </Typography>
              <Typography variant="body2" className="!text-gray-600 !mt-1">
                {dialogMode === "edit"
                  ? "Cập nhật thông tin loại biển hiệu đã chọn"
                  : "Tạo mới loại biển hiệu cho hệ thống"}
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
            {/* Tên loại biển hiệu */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tên loại biển hiệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-700 placeholder-gray-400 font-medium"
                placeholder="Nhập tên loại biển hiệu"
                autoFocus
              />
              <Typography variant="caption" className="!text-gray-500">
                Tên sẽ được tự động chuyển thành chữ in hoa
              </Typography>
            </div>

            {/* Upload hình ảnh */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Hình ảnh loại biển hiệu
              </label>
              
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <label htmlFor="image-upload">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-6 py-3 border-2 border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    <UploadIcon />
                    Chọn hình ảnh
                  </button>
                </label>
                
                {imagePreview && (
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <CloseIcon className="!text-sm" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <InfoOutlinedIcon className="!text-blue-500 !text-lg mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <div className="font-semibold mb-1">Lưu ý về hình ảnh:</div>
                    <ul className="space-y-1 text-xs">
                      <li>• Định dạng: JPG, PNG, GIF</li>
                      <li>• Kích thước tối đa: 5MB</li>
                      <li>• Tỷ lệ khuyến nghị: 1:1 (vuông)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Cài đặt */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Cài đặt loại biển hiệu
              </label>
              
              <div className="grid grid-cols-1 gap-4">
                {/* AI Generated */}
                <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  form.isAiGenerated 
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        form.isAiGenerated ? 'bg-purple-100' : 'bg-gray-200'
                      }`}>
                        {form.isAiGenerated ? '🤖' : '👨‍💻'}
                      </div>
                      <div>
                        <Typography variant="body1" className="!font-semibold !text-gray-800">
                          Được tạo bởi AI
                        </Typography>
                        <Typography variant="caption" className="!text-gray-600">
                          {form.isAiGenerated ? "Tạo bởi trí tuệ nhân tạo" : "Tạo thủ công"}
                        </Typography>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isAiGenerated: !form.isAiGenerated })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        form.isAiGenerated ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        form.isAiGenerated ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chỉ hiển thị các trường bổ sung khi đang edit */}
            {dialogMode === "edit" && (
              <>
                {/* Công thức tính toán */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Công thức tính toán
                  </label>
                  <textarea
                    name="calculateFormula"
                    value={form.calculateFormula}
                    onChange={(e) => setForm({ ...form, calculateFormula: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 font-mono text-sm resize-none text-gray-700 placeholder-gray-400"
                    placeholder="Nhập công thức tính toán (tùy chọn)"
                  />
                  <div className="flex items-center justify-between">
                    <Typography variant="caption" className="!text-gray-500">
                      Công thức dùng để tính toán chi phí tự động
                    </Typography>
                    <button
                      type="button"
                      onClick={handleFormulaGuide}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <HelpIcon className="!text-sm" />
                      Hướng dẫn tạo công thức
                    </button>
                  </div>
                </div>

                {/* Trạng thái hoạt động */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Trạng thái hoạt động
                  </label>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      form.isAvailable 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            form.isAvailable ? 'bg-emerald-100' : 'bg-gray-200'
                          }`}>
                            {form.isAvailable ? '✅' : '⏸️'}
                          </div>
                          <div>
                            <Typography variant="body1" className="!font-semibold !text-gray-800">
                              Trạng thái hoạt động
                            </Typography>
                            <Typography variant="caption" className="!text-gray-600">
                              {form.isAvailable ? "Sẵn sàng sử dụng" : "Tạm dừng hoạt động"}
                            </Typography>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            form.isAvailable ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            form.isAvailable ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={handleCloseDialog}
              disabled={addStatus === "loading" || updateImageStatus === "loading"}
              className="order-2 sm:order-1 w-full sm:w-auto px-6 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim() || addStatus === "loading" || updateImageStatus === "loading"}
              className="order-1 sm:order-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(addStatus === "loading" || updateImageStatus === "loading") ? (
                <>
                  <CircularProgress size={18} className="text-white" />
                  {dialogMode === "edit" ? "Đang lưu..." : "Đang thêm..."}
                </>
              ) : (
                <>
                  {dialogMode === "edit" ? <EditIcon className="!text-sm" /> : <AddIcon className="!text-sm" />}
                  {dialogMode === "edit" ? "Lưu thay đổi" : "Thêm loại biển hiệu"}
                </>
              )}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Formula Guide Dialog */}
      <FormulaGuide 
        open={openFormulaGuide} 
        onClose={() => setOpenFormulaGuide(false)}
        onNavigate={(pageId) => setActiveTab?.(pageId)}
      />

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

export default ProductTypeManager;
