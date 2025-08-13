import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductTypes,
  fetchProductTypeSizesByProductTypeId,
  addSizeToProductType,
  deleteProductTypeSize,
  updateProductTypeSize,
  selectAllProductTypes,
  selectProductTypeSizes,
  selectProductTypeSizesStatus,
  selectUpdateSizeStatus,
  selectUpdateSizeError,
} from "../../store/features/productType/productTypeSlice";
import {
  fetchSizes,
  selectAllSizes,
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
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  InputBase,
  Fade,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

const Illustration = () => (
  <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
    <img
      src="https://quangcaotayninh.com.vn/wp-content/uploads/2020/08/logo-quang-cao-tay-ninh-3.png"
      alt="Chọn loại sản phẩm"
      style={{ width: 180, opacity: 0.7 }}
    />
    <Typography variant="h5" fontWeight="bold" mt={2}>
      Chọn loại sản phẩm để xem kích thước
    </Typography>
    <Typography color="text.secondary" mt={1}>
      Vui lòng chọn một loại sản phẩm ở bên trái để quản lý kích thước.
    </Typography>
  </Box>
);

// Helper functions cho dimension type
const getDimensionTypeLabel = (dimensionType) => {
  const labels = {
    WIDTH: "Chiều rộng",
    HEIGHT: "Chiều cao",
    LENGTH: "Chiều dài",
    DEPTH: "Độ sâu",
    DIAMETER: "Đường kính",
    FONT_SIZE: "Cỡ chữ",
  };
  return labels[dimensionType] || dimensionType;
};

const getDimensionTypeColor = (dimensionType) => {
  const colors = {
    WIDTH: "#1976d2",
    HEIGHT: "#388e3c",
    LENGTH: "#f57c00",
    DEPTH: "#7b1fa2",
    DIAMETER: "#d32f2f",
    FONT_SIZE: "#455a64",
  };
  return colors[dimensionType] || "#757575";
};

const dimensionTypeOptions = [
  { value: "WIDTH", label: "Chiều rộng" },
  { value: "HEIGHT", label: "Chiều cao" },
  { value: "LENGTH", label: "Chiều dài" },
  { value: "DEPTH", label: "Độ sâu" },
  { value: "DIAMETER", label: "Đường kính" },
  { value: "FONT_SIZE", label: "Cỡ chữ" },
];

const ProductSizeManager = () => {
  const dispatch = useDispatch();
  const productTypes = useSelector(selectAllProductTypes);
  const allSizes = useSelector(selectAllSizes);
  const productTypeSizes = useSelector(selectProductTypeSizes);
  const sizesStatus = useSelector(selectProductTypeSizesStatus);
  const updateSizeStatus = useSelector(selectUpdateSizeStatus);
  const updateSizeError = useSelector(selectUpdateSizeError);

  const [search, setSearch] = useState("");
  const [selectedProductTypeId, setSelectedProductTypeId] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState(null);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [sizeData, setSizeData] = useState({
    minValue: 0,
    maxValue: 0,
    dimensionType: "WIDTH"
  });
  const [editSizeData, setEditSizeData] = useState({
    minValue: 0,
    maxValue: 0,
    dimensionType: "WIDTH"
  });
  const [validationErrors, setValidationErrors] = useState({
    minValue: "",
    maxValue: ""
  });
  const [editValidationErrors, setEditValidationErrors] = useState({
    minValue: "",
    maxValue: ""
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    dispatch(fetchProductTypes());
    dispatch(fetchSizes());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProductTypeId) {
      dispatch(fetchProductTypeSizesByProductTypeId(selectedProductTypeId));
    }
  }, [dispatch, selectedProductTypeId]);

  // Lọc size chưa có trong product type
  const availableSizes = allSizes.filter(
    (s) => !productTypeSizes.some((ptSize) => ptSize.sizes.id === s.id)
  );

  // Lọc loại sản phẩm theo search
  const filteredProductTypes = productTypes.filter((pt) =>
    pt.name.toLowerCase().includes(search.toLowerCase())
  );

  // Validation functions
  const validateMinValue = (value) => {
    const numValue = parseFloat(value);
    if (!value || value === "") return "Vui lòng nhập giá trị tối thiểu";
    if (isNaN(numValue)) return "Giá trị phải là số";
    if (numValue <= 0) return "Giá trị phải lớn hơn 0";
    if (sizeData.maxValue && numValue >= parseFloat(sizeData.maxValue)) {
      return "Giá trị tối thiểu phải nhỏ hơn giá trị tối đa";
    }
    return "";
  };

  const validateMaxValue = (value) => {
    const numValue = parseFloat(value);
    if (!value || value === "") return "Vui lòng nhập giá trị tối đa";
    if (isNaN(numValue)) return "Giá trị phải là số";
    if (numValue <= 0) return "Giá trị phải lớn hơn 0";
    if (numValue >= 10) return "Giá trị tối đa phải nhỏ hơn 10";
    if (sizeData.minValue && numValue <= parseFloat(sizeData.minValue)) {
      return "Giá trị tối đa phải lớn hơn giá trị tối thiểu";
    }
    return "";
  };

  // Validation functions for edit
  const validateEditMinValue = (value) => {
    const numValue = parseFloat(value);
    if (!value || value === "") return "Vui lòng nhập giá trị tối thiểu";
    if (isNaN(numValue)) return "Giá trị phải là số";
    if (numValue <= 0) return "Giá trị phải lớn hơn 0";
    if (editSizeData.maxValue && numValue >= parseFloat(editSizeData.maxValue)) {
      return "Giá trị tối thiểu phải nhỏ hơn giá trị tối đa";
    }
    return "";
  };

  const validateEditMaxValue = (value) => {
    const numValue = parseFloat(value);
    if (!value || value === "") return "Vui lòng nhập giá trị tối đa";
    if (isNaN(numValue)) return "Giá trị phải là số";
    if (numValue <= 0) return "Giá trị phải lớn hơn 0";
    if (numValue >= 10) return "Giá trị tối đa phải nhỏ hơn 10";
    if (editSizeData.minValue && numValue <= parseFloat(editSizeData.minValue)) {
      return "Giá trị tối đa phải lớn hơn giá trị tối thiểu";
    }
    return "";
  };

  // Handle input changes with validation
  const handleMinValueChange = (value) => {
    setSizeData({ ...sizeData, minValue: value });
    const error = validateMinValue(value);
    setValidationErrors(prev => ({ ...prev, minValue: error }));
    
    // Re-validate max value if it exists
    if (sizeData.maxValue) {
      const maxError = validateMaxValue(sizeData.maxValue);
      setValidationErrors(prev => ({ ...prev, maxValue: maxError }));
    }
  };

  const handleMaxValueChange = (value) => {
    setSizeData({ ...sizeData, maxValue: value });
    const error = validateMaxValue(value);
    setValidationErrors(prev => ({ ...prev, maxValue: error }));
    
    // Re-validate min value if it exists
    if (sizeData.minValue) {
      const minError = validateMinValue(sizeData.minValue);
      setValidationErrors(prev => ({ ...prev, minValue: minError }));
    }
  };

  // Handle input changes with validation for edit
  const handleEditMinValueChange = (value) => {
    setEditSizeData({ ...editSizeData, minValue: value });
    const error = validateEditMinValue(value);
    setEditValidationErrors(prev => ({ ...prev, minValue: error }));
    
    // Re-validate max value if it exists
    if (editSizeData.maxValue) {
      const maxError = validateEditMaxValue(editSizeData.maxValue);
      setEditValidationErrors(prev => ({ ...prev, maxValue: maxError }));
    }
  };

  const handleEditMaxValueChange = (value) => {
    setEditSizeData({ ...editSizeData, maxValue: value });
    const error = validateEditMaxValue(value);
    setEditValidationErrors(prev => ({ ...prev, maxValue: error }));
    
    // Re-validate min value if it exists
    if (editSizeData.minValue) {
      const minError = validateEditMinValue(editSizeData.minValue);
      setEditValidationErrors(prev => ({ ...prev, minValue: minError }));
    }
  };

  const handleOpenAdd = () => {
    setSelectedSizeId(availableSizes[0]?.id || "");
    setSizeData({
      minValue: 0,
      maxValue: 0,
      dimensionType: "WIDTH"
    });
    setValidationErrors({
      minValue: "",
      maxValue: ""
    });
    setAddDialogOpen(true);
  };

  const handleOpenEdit = (ptSize) => {
    setEditingSize(ptSize);
    setEditSizeData({
      minValue: ptSize.minValue || 0,
      maxValue: ptSize.maxValue || 0,
      dimensionType: ptSize.dimensionType || "WIDTH"
    });
    setEditValidationErrors({
      minValue: "",
      maxValue: ""
    });
    setEditDialogOpen(true);
  };

  const handleAddSize = async () => {
    // Validate all fields first
    const minError = validateMinValue(sizeData.minValue);
    const maxError = validateMaxValue(sizeData.maxValue);
    
    setValidationErrors({
      minValue: minError,
      maxValue: maxError
    });

    // Check if there are any validation errors
    if (minError || maxError) {
      setSnackbar({
        open: true,
        message: "Vui lòng sửa các lỗi trước khi tiếp tục!",
        severity: "error",
      });
      return;
    }

    if (!selectedProductTypeId || !selectedSizeId) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn kích thước!",
        severity: "error",
      });
      return;
    }

    try {
      await dispatch(
        addSizeToProductType({
          productTypeId: selectedProductTypeId,
          sizeId: selectedSizeId,
          sizeData: {
            minValue: parseFloat(sizeData.minValue),
            maxValue: parseFloat(sizeData.maxValue),
            dimensionType: sizeData.dimensionType,
          },
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Thêm kích thước thành công!",
        severity: "success",
      });
      await dispatch(
        fetchProductTypeSizesByProductTypeId(selectedProductTypeId)
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: err || "Thêm thất bại!",
        severity: "error",
      });
    }
    setAddDialogOpen(false);
  };

  const handleEditSize = async () => {
    // Validate all fields first
    const minError = validateEditMinValue(editSizeData.minValue);
    const maxError = validateEditMaxValue(editSizeData.maxValue);
    
    setEditValidationErrors({
      minValue: minError,
      maxValue: maxError
    });

    // Check if there are any validation errors
    if (minError || maxError) {
      setSnackbar({
        open: true,
        message: "Vui lòng sửa các lỗi trước khi tiếp tục!",
        severity: "error",
      });
      return;
    }

    if (!editingSize) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy kích thước để cập nhật!",
        severity: "error",
      });
      return;
    }

    try {
      await dispatch(
        updateProductTypeSize({
          productTypeSizeId: editingSize.id,
          sizeData: {
            minValue: parseFloat(editSizeData.minValue),
            maxValue: parseFloat(editSizeData.maxValue),
            dimensionType: editSizeData.dimensionType,
          },
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Cập nhật kích thước thành công!",
        severity: "success",
      });
      await dispatch(
        fetchProductTypeSizesByProductTypeId(selectedProductTypeId)
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: err || "Cập nhật thất bại!",
        severity: "error",
      });
    }
    setEditDialogOpen(false);
  };

  const handleDelete = async (productTypeSizeId) => {
    try {
      await dispatch(
        deleteProductTypeSize({
          productTypeId: selectedProductTypeId,
          productTypeSizeId,
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Xóa thành công!",
        severity: "success",
      });
      await dispatch(
        fetchProductTypeSizesByProductTypeId(selectedProductTypeId)
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: err || "Xóa thất bại!",
        severity: "error",
      });
    }
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
          Loại sản phẩm
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
          {sizesStatus === "loading" && <CircularProgress size={20} />}
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
          {sizesStatus === "succeeded" && filteredProductTypes.length === 0 && (
            <Typography color="text.secondary" mt={2} fontSize={15}>
              Không tìm thấy loại sản phẩm nào.
            </Typography>
          )}
        </Box>
      </Paper>
      {/* Main Content: Size Table */}
      <Box flex={1}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight="bold">
            {selectedProductTypeId
              ? `Kích thước của: ${
                  productTypes.find((pt) => pt.id === selectedProductTypeId)
                    ?.name
                }`
              : "Chọn loại sản phẩm để xem kích thước"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            disabled={!selectedProductTypeId || availableSizes.length === 0}
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
        {sizesStatus === "loading" && <CircularProgress />}
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
                  <TableCell sx={{ fontWeight: 700 }}>Tên</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Giá trị tối thiểu</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Giá trị tối đa</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Loại kích thước</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productTypeSizes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box py={4}>
                        <img
                          src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/sleeping_kitty.png"
                          alt="No size"
                          style={{ width: 120, opacity: 0.6 }}
                        />
                        <Typography color="text.secondary" mt={2}>
                          Chưa có kích thước nào cho loại sản phẩm này.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  productTypeSizes.map((ptSize) => (
                    <TableRow
                      key={ptSize.id}
                      hover
                      sx={{
                        transition: "background 0.2s",
                        ":hover": { bgcolor: "#f1f8e9" },
                      }}
                    >
                      <TableCell>{ptSize.sizes.name}</TableCell>
                      <TableCell>{ptSize.sizes.description}</TableCell>
                      <TableCell>{ptSize.minValue || "Chưa có"}</TableCell>
                      <TableCell>{ptSize.maxValue || "Chưa có"}</TableCell>
                      <TableCell>
                        {ptSize.dimensionType ? (
                          <Box
                            component="span"
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: getDimensionTypeColor(ptSize.dimensionType),
                              color: "white",
                            }}
                          >
                            {getDimensionTypeLabel(ptSize.dimensionType)}
                          </Box>
                        ) : (
                          "Chưa có"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEdit(ptSize)}
                          sx={{ borderRadius: 2, mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(ptSize.id)}
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
        )}
      </Box>
      {/* Add Size Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          className: "!rounded-2xl !shadow-2xl"
        }}
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <Typography variant="h5" className="!font-bold !text-gray-800 flex items-center gap-2">
            <AddIcon className="text-blue-600" />
            Thêm kích thước vào loại sản phẩm
          </Typography>
          <Typography variant="body2" className="!text-gray-600 !mt-1">
            Vui lòng điền đầy đủ thông tin để thêm kích thước mới
          </Typography>
        </div>
        
        <DialogContent className="!p-8 !bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Size Selection - Full width on mobile, half on large screens */}
            <div className="lg:col-span-2">
              <FormControl fullWidth>
                <InputLabel className="!text-gray-700 !font-medium">Chọn kích thước</InputLabel>
                <Select
                  value={selectedSizeId}
                  onChange={(e) => setSelectedSizeId(e.target.value)}
                  label="Chọn kích thước"
                  className="!rounded-xl !bg-gray-50 hover:!bg-gray-100 transition-all duration-200"
                  MenuProps={{ 
                    PaperProps: { 
                      className: "!rounded-xl !shadow-lg !border !border-gray-200 !mt-2" 
                    } 
                  }}
                >
                  {availableSizes.length === 0 ? (
                    <MenuItem disabled className="!text-gray-500 !py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <SearchIcon fontSize="small" className="text-gray-400" />
                        </div>
                        Không còn kích thước nào để thêm
                      </div>
                    </MenuItem>
                  ) : (
                    availableSizes.map((size) => (
                      <MenuItem key={size.id} value={size.id} className="!py-3 hover:!bg-blue-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {size.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{size.name}</div>
                            <div className="text-sm text-gray-500">{size.description}</div>
                          </div>
                        </div>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </div>
            
            {/* Min Value - Responsive: full width on mobile, half on large screens */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Giá trị tối thiểu
              </label>
              <TextField
                type="number"
                fullWidth
                value={sizeData.minValue}
                onChange={(e) => handleMinValueChange(e.target.value)}
                inputProps={{ min: 0, step: 0.1, max: 9.9 }}
                placeholder="Nhập giá trị tối thiểu..."
                className="!rounded-xl"
                error={!!validationErrors.minValue}
                helperText={validationErrors.minValue}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: validationErrors.minValue ? '#fef2f2' : '#f9fafb',
                    '&:hover': {
                      backgroundColor: validationErrors.minValue ? '#fef2f2' : '#f3f4f6',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                    },
                    '&.Mui-error': {
                      borderColor: '#ef4444',
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    marginLeft: '4px',
                    marginTop: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }
                }}
              />
            </div>
            
            {/* Max Value - Responsive: full width on mobile, half on large screens */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Giá trị tối đa
                <span className="text-xs text-gray-500 ml-1">(&lt; 10)</span>
              </label>
              <TextField
                type="number"
                fullWidth
                value={sizeData.maxValue}
                onChange={(e) => handleMaxValueChange(e.target.value)}
                inputProps={{ min: 0, step: 0.1, max: 9.9 }}
                placeholder="Nhập giá trị tối đa..."
                className="!rounded-xl"
                error={!!validationErrors.maxValue}
                helperText={validationErrors.maxValue}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: validationErrors.maxValue ? '#fef2f2' : '#f9fafb',
                    '&:hover': {
                      backgroundColor: validationErrors.maxValue ? '#fef2f2' : '#f3f4f6',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                    },
                    '&.Mui-error': {
                      borderColor: '#ef4444',
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    marginLeft: '4px',
                    marginTop: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }
                }}
              />
            </div>
            
            {/* Dimension Type - Full width */}
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Loại kích thước
              </label>
              <FormControl fullWidth>
                <Select
                  value={sizeData.dimensionType}
                  onChange={(e) => setSizeData({ ...sizeData, dimensionType: e.target.value })}
                  displayEmpty
                  className="!rounded-xl !bg-gray-50 hover:!bg-gray-100 transition-all duration-200"
                  MenuProps={{ 
                    PaperProps: { 
                      className: "!rounded-xl !shadow-lg !border !border-gray-200 !mt-2" 
                    } 
                  }}
                >
                  {dimensionTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value} className="!py-3 hover:!bg-blue-50">
                      <div className="flex items-center gap-3 w-full">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getDimensionTypeColor(option.value) }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{option.label}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {option.value}
                          </div>
                        </div>
                        {sizeData.dimensionType === option.value && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          
          {/* Info Card */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-800 mb-1">
                  Lưu ý quan trọng
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Giá trị tối thiểu phải nhỏ hơn giá trị tối đa</li>
                  <li>• Các giá trị phải lớn hơn 0</li>
                  <li>• Chọn loại kích thước phù hợp với sản phẩm</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end rounded-b-2xl">
          <Button 
            onClick={() => setAddDialogOpen(false)} 
            className="!rounded-xl !px-6 !py-2.5 !text-gray-600 !border-gray-300 hover:!bg-gray-100 !transition-all !duration-200 !font-medium order-2 sm:order-1"
            variant="outlined"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleAddSize}
            variant="contained"
            disabled={
              !selectedSizeId || 
              !sizeData.minValue || 
              !sizeData.maxValue || 
              !!validationErrors.minValue || 
              !!validationErrors.maxValue
            }
            className="!rounded-xl !px-6 !py-2.5 !bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !shadow-lg hover:!shadow-xl !transition-all !duration-200 !font-semibold order-1 sm:order-2 disabled:!opacity-50 disabled:!cursor-not-allowed"
          >
            <AddIcon className="mr-2" />
            Thêm kích thước
          </Button>
        </div>
      </Dialog>

      {/* Edit Size Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          className: "!rounded-2xl !shadow-2xl"
        }}
      >
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <Typography variant="h5" className="!font-bold !text-gray-800 flex items-center gap-2">
            <EditIcon className="text-green-600" />
            Chỉnh sửa kích thước
          </Typography>
          <Typography variant="body2" className="!text-gray-600 !mt-1">
            {editingSize && `Đang chỉnh sửa kích thước: ${editingSize.sizes?.name}`}
          </Typography>
        </div>
        
        <DialogContent className="!p-8 !bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Display current size info */}
            <div className="lg:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-lg">
                    {editingSize?.sizes?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{editingSize?.sizes?.name}</h3>
                  <p className="text-sm text-gray-500">{editingSize?.sizes?.description}</p>
                </div>
              </div>
            </div>
            
            {/* Min Value */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Giá trị tối thiểu
              </label>
              <TextField
                type="number"
                fullWidth
                value={editSizeData.minValue}
                onChange={(e) => handleEditMinValueChange(e.target.value)}
                inputProps={{ min: 0, step: 0.1, max: 9.9 }}
                placeholder="Nhập giá trị tối thiểu..."
                className="!rounded-xl"
                error={!!editValidationErrors.minValue}
                helperText={editValidationErrors.minValue}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: editValidationErrors.minValue ? '#fef2f2' : '#f9fafb',
                    '&:hover': {
                      backgroundColor: editValidationErrors.minValue ? '#fef2f2' : '#f3f4f6',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                    },
                    '&.Mui-error': {
                      borderColor: '#ef4444',
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    marginLeft: '4px',
                    marginTop: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }
                }}
              />
            </div>
            
            {/* Max Value */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Giá trị tối đa
                <span className="text-xs text-gray-500 ml-1">(&lt; 10)</span>
              </label>
              <TextField
                type="number"
                fullWidth
                value={editSizeData.maxValue}
                onChange={(e) => handleEditMaxValueChange(e.target.value)}
                inputProps={{ min: 0, step: 0.1, max: 9.9 }}
                placeholder="Nhập giá trị tối đa..."
                className="!rounded-xl"
                error={!!editValidationErrors.maxValue}
                helperText={editValidationErrors.maxValue}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: editValidationErrors.maxValue ? '#fef2f2' : '#f9fafb',
                    '&:hover': {
                      backgroundColor: editValidationErrors.maxValue ? '#fef2f2' : '#f3f4f6',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                    },
                    '&.Mui-error': {
                      borderColor: '#ef4444',
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    marginLeft: '4px',
                    marginTop: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }
                }}
              />
            </div>
            
            {/* Dimension Type */}
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Loại kích thước
              </label>
              <FormControl fullWidth>
                <Select
                  value={editSizeData.dimensionType}
                  onChange={(e) => setEditSizeData({ ...editSizeData, dimensionType: e.target.value })}
                  displayEmpty
                  className="!rounded-xl !bg-gray-50 hover:!bg-gray-100 transition-all duration-200"
                  MenuProps={{ 
                    PaperProps: { 
                      className: "!rounded-xl !shadow-lg !border !border-gray-200 !mt-2" 
                    } 
                  }}
                >
                  {dimensionTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value} className="!py-3 hover:!bg-green-50">
                      <div className="flex items-center gap-3 w-full">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getDimensionTypeColor(option.value) }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{option.label}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {option.value}
                          </div>
                        </div>
                        {editSizeData.dimensionType === option.value && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          
          {/* Info Note */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-800 mb-1">
                  Lưu ý khi chỉnh sửa
                </h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Giá trị tối thiểu phải nhỏ hơn giá trị tối đa</li>
                  <li>• Các giá trị phải lớn hơn 0</li>
                  <li>• Việc thay đổi sẽ ảnh hưởng đến tính toán giá</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end rounded-b-2xl">
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            className="!rounded-xl !px-6 !py-2.5 !text-gray-600 !border-gray-300 hover:!bg-gray-100 !transition-all !duration-200 !font-medium order-2 sm:order-1"
            variant="outlined"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleEditSize}
            variant="contained"
            disabled={
              !editSizeData.minValue || 
              !editSizeData.maxValue || 
              !!editValidationErrors.minValue || 
              !!editValidationErrors.maxValue
            }
            className="!rounded-xl !px-6 !py-2.5 !bg-gradient-to-r !from-green-600 !to-emerald-600 hover:!from-green-700 hover:!to-emerald-700 !shadow-lg hover:!shadow-xl !transition-all !duration-200 !font-semibold order-1 sm:order-2 disabled:!opacity-50 disabled:!cursor-not-allowed"
          >
            <EditIcon className="mr-2" />
            Cập nhật kích thước
          </Button>
        </div>
      </Dialog>

      {/* Snackbar */}
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

export default ProductSizeManager;
