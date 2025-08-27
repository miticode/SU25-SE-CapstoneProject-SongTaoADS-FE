import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductTypesApi } from "../../api/productTypeService";
import {
  fetchAttributesByProductTypeId,
  selectAllAttributes,
  selectAttributeStatus,
  resetAttributeStatus,
} from "../../store/features/attribute/attributeSlice";
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
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  InfoOutlined as InfoOutlinedIcon,
  Visibility as VisibilityIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
} from "@mui/icons-material";
import {
  createAttributeValue,
  toggleAttributeValueStatus,
  getAttributeValuesByAttributeId,
  updateAttributeValue,
} from "../../store/features/attribute/attributeValueSlice";
const Illustration = () => (
  <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
    <img
      src="https://quangcaotayninh.com.vn/wp-content/uploads/2020/08/logo-quang-cao-tay-ninh-3.png"
      alt="Chọn loại biển hiệu"
      style={{ width: 180, opacity: 0.7 }}
    />
    <Typography variant="h5" fontWeight="bold" mt={2}>
      Chọn loại biển hiệu để xem giá trị thuộc tính
    </Typography>
    <Typography color="text.secondary" mt={1}>
      Vui lòng chọn một loại biển hiệu ở bên trái để quản lý giá trị thuộc tính.
    </Typography>
  </Box>
);

const AttributeValueManager = () => {
  const dispatch = useDispatch();
  const attributes = useSelector(selectAllAttributes);
  const status = useSelector(selectAttributeStatus);

  const [productTypes, setProductTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProductTypeId, setSelectedProductTypeId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { attributeValues, isLoading, isSuccess, isError, message } =
    useSelector((state) => state.attributeValue);
  const [selectedId, setSelectedId] = useState(null);
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    attributeValue: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedAttributeValues, setSelectedAttributeValues] = useState([]);
  const [viewValuesDialog, setViewValuesDialog] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState(null);
  const [selectedAttributeName, setSelectedAttributeName] = useState("");
  const [loadingValues, setLoadingValues] = useState(false);
  const [form, setForm] = useState({
    attributeId: "",
    name: "",
    unit: "",
    materialPrice: 0,
    unitPrice: 0,
    isAvailable: true,
    isMultiplier: false,
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
      // Reset attribute values when changing product type
      setSelectedAttributeValues([]);

      // Fetch attributes by product type ID
      dispatch(fetchAttributesByProductTypeId(selectedProductTypeId))
        .unwrap()
        .then((fetchedAttributes) => {
          console.log("Attributes fetched successfully:", fetchedAttributes);
          // Không tạo dữ liệu giả nào ở đây
        })
        .catch((error) => {
          console.error("Error fetching attributes:", error);
        });
    } else {
      setSelectedAttributeValues([]);
    }
  }, [dispatch, selectedProductTypeId]);

  // Lọc loại biển hiệu theo search
  const filteredProductTypes = productTypes.filter((pt) =>
    pt.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = (attributeId = "") => {
    setEditMode(false);
    setForm({
      attributeId,
      name: "",
      unit: "",
      materialPrice: 0,
      unitPrice: 0,
      isAvailable: true,
      isMultiplier: false,
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (value) => {
    setEditMode(true);
    setForm({
      attributeId:
        value.attributeId || value.attributesId?.id || value.attributesId, // Handle different response formats
      name: value.name,
      unit: value.unit,
      materialPrice: value.materialPrice,
      unitPrice: value.unitPrice,
      isAvailable: value.isAvailable,
      isMultiplier: value.isMultiplier || false,
    });
    setSelectedId(value.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm({
      attributeId: "",
      name: "",
      unit: "",
      materialPrice: 0,
      unitPrice: 0,
      isAvailable: true,
      isMultiplier: false,
    });
    setSelectedId(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Convert numeric values to numbers
    if (type === "number") {
      setForm({ ...form, [name]: parseFloat(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = () => {
    if (!form.attributeId) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn thuộc tính!",
        severity: "error",
      });
      return;
    }

    // Prepare data for the API call
    const attributeValueData = {
      name: form.name,
      unit: form.unit,
      materialPrice: parseFloat(form.materialPrice) || 0,
      unitPrice: parseFloat(form.unitPrice) || 0,
      isAvailable: form.isAvailable,
      isMultiplier: form.isMultiplier,
    };

    if (editMode) {
      // Update existing attribute value
      dispatch(
        updateAttributeValue({
          attributeValueId: selectedId,
          attributeValueData,
        })
      )
        .unwrap()
        .then(() => {
          // Refresh attribute values
          dispatch(
            getAttributeValuesByAttributeId({
              attributeId: form.attributeId,
              page: 1,
              size: 100,
            })
          );

          setSnackbar({
            open: true,
            message: "Cập nhật giá trị thuộc tính thành công!",
            severity: "success",
          });
          handleCloseDialog();
        })
        .catch((error) => {
          console.error("Error updating attribute value:", error);
          setSnackbar({
            open: true,
            message: `Lỗi: ${error}`,
            severity: "error",
          });
        });
    } else {
      // Create new attribute value (existing code)
      dispatch(
        createAttributeValue({
          attributeId: form.attributeId,
          attributeValueData,
        })
      )
        .unwrap()
        .then(() => {
          // Refresh attribute values for the current attribute
          dispatch(
            getAttributeValuesByAttributeId({
              attributeId: form.attributeId,
              page: 1,
              size: 100,
            })
          );

          setSnackbar({
            open: true,
            message: "Thêm giá trị thuộc tính thành công!",
            severity: "success",
          });
          handleCloseDialog();
        })
        .catch((error) => {
          console.error("Error creating attribute value:", error);
          setSnackbar({
            open: true,
            message: `Lỗi: ${error}`,
            severity: "error",
          });
        });
    }
  };

  const handleToggleStatus = (attributeValue) => {
    setToggleDialog({ open: true, attributeValue });
  };

  const handleConfirmToggleStatus = () => {
    const attributeValue = toggleDialog.attributeValue;
    setToggleDialog({ open: false, attributeValue: null });

    // Call the toggle API
    dispatch(
      toggleAttributeValueStatus({
        attributeValueId: attributeValue.id,
        attributeValueData: {
          name: attributeValue.name,
          unit: attributeValue.unit,
          materialPrice: attributeValue.materialPrice,
          unitPrice: attributeValue.unitPrice,
          isAvailable: attributeValue.isAvailable,
          isMultiplier: attributeValue.isMultiplier,
        },
      })
    )
      .unwrap()
      .then(() => {
        // After successful toggle, refresh the attribute values list
        if (selectedAttributeId) {
          dispatch(
            getAttributeValuesByAttributeId({
              attributeId: selectedAttributeId,
              page: 1,
              size: 100,
            })
          );
        }

        setSnackbar({
          open: true,
          message: `${
            attributeValue.isAvailable ? "Ẩn" : "Hiển thị"
          } giá trị thuộc tính thành công!`,
          severity: "success",
        });
      })
      .catch((error) => {
        console.error("Error toggling attribute value status:", error);
        setSnackbar({
          open: true,
          message: `Lỗi: ${error}`,
          severity: "error",
        });
      });
  };
  const handleViewAttributeValues = (attributeId, attributeName) => {
    setSelectedAttributeId(attributeId);
    setSelectedAttributeName(attributeName);
    setLoadingValues(true);

    // Dispatch the action to get attribute values by attribute ID
    dispatch(
      getAttributeValuesByAttributeId({ attributeId, page: 1, size: 100 })
    )
      .unwrap()
      .then(() => {
        setLoadingValues(false);
        setViewValuesDialog(true);
      })
      .catch((error) => {
        setLoadingValues(false);
        console.error("Error fetching attribute values:", error);
        setSnackbar({
          open: true,
          message: `Lỗi khi tải giá trị thuộc tính: ${error}`,
          severity: "error",
        });
      });
  };
  const handleCloseValuesDialog = () => {
    setViewValuesDialog(false);
    setSelectedAttributeId(null);
    setSelectedAttributeName("");
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

      {/* Main Content: Attribute Values Table */}
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
            onClick={() => handleOpenAdd()}
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
                  {/* Removed ID column and added Values column */}
                  <TableCell sx={{ fontWeight: 700 }}>Giá trị</TableCell>
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
                          alt="No attributes"
                          style={{ width: 120, opacity: 0.6 }}
                        />
                        <Typography color="text.secondary" mt={2}>
                          Chưa có thuộc tính nào cho loại biển hiệu này.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Modified table rows to include View Values button
                  attributes.map((attribute) => (
                    <TableRow
                      key={attribute.id}
                      hover
                      sx={{
                        transition: "background 0.2s",
                        ":hover": { bgcolor: "#f1f8e9" },
                      }}
                    >
                      <TableCell>{attribute.name}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          color="info"
                          startIcon={<VisibilityIcon />}
                          onClick={() =>
                            handleViewAttributeValues(
                              attribute.id,
                              attribute.name
                            )
                          }
                          sx={{ borderRadius: 2, textTransform: "none" }}
                        >
                          Xem giá trị
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => handleOpenAdd(attribute.id)}
                          sx={{ borderRadius: 2, textTransform: "none" }}
                        >
                          Thêm giá trị
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Add/Edit Dialog with Tailwind CSS */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          elevation: 3,
          className: "rounded-2xl overflow-hidden",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Dialog Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {editMode ? (
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <EditIcon className="text-blue-600 w-6 h-6" />
                  </div>
                ) : (
                  <div className="p-2 bg-green-100 rounded-lg">
                    <AddIcon className="text-green-600 w-6 h-6" />
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editMode
                    ? "Sửa giá trị thuộc tính"
                    : "Thêm giá trị thuộc tính"}
                </h2>
              </div>
              <button
                onClick={handleCloseDialog}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Dialog Content */}
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[70vh]">
            {/* Form Grid Layout - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Chọn thuộc tính */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Thuộc tính <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FormControl fullWidth required>
                      <Select
                        name="attributeId"
                        value={form.attributeId}
                        onChange={handleChange}
                        displayEmpty
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        sx={{
                          borderRadius: "12px",
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#d1d5db",
                            },
                            "&:hover fieldset": {
                              borderColor: "#3b82f6",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#3b82f6",
                            },
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em className="text-gray-500">Chọn thuộc tính</em>
                        </MenuItem>
                        {attributes.map((attr) => (
                          <MenuItem key={attr.id} value={attr.id}>
                            {attr.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </div>

                {/* Tên giá trị */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Tên giá trị <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    placeholder="Nhập tên giá trị thuộc tính"
                    className="rounded-xl"
                    InputProps={{
                      className: "rounded-xl shadow-sm",
                      sx: {
                        "& fieldset": {
                          borderColor: "#d1d5db",
                        },
                        "&:hover fieldset": {
                          borderColor: "#3b82f6",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#3b82f6",
                        },
                      },
                    }}
                  />
                </div>

                {/* Đơn vị */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Đơn vị <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    placeholder="Nhập đơn vị (vd: cm, m², kg...)"
                    className="rounded-xl"
                    InputProps={{
                      className: "rounded-xl shadow-sm",
                      sx: {
                        "& fieldset": {
                          borderColor: "#d1d5db",
                        },
                        "&:hover fieldset": {
                          borderColor: "#3b82f6",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#3b82f6",
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Giá vật liệu */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Giá vật liệu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TextField
                      name="materialPrice"
                      value={form.materialPrice}
                      onChange={handleChange}
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: "0", step: "0.01" }}
                      variant="outlined"
                      placeholder="0"
                      className="rounded-xl"
                      InputProps={{
                        className: "rounded-xl shadow-sm",
                        startAdornment: (
                          <span className="text-gray-500 mr-2">₫</span>
                        ),
                        sx: {
                          "& fieldset": {
                            borderColor: "#d1d5db",
                          },
                          "&:hover fieldset": {
                            borderColor: "#3b82f6",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#3b82f6",
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Đơn giá */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Đơn giá <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TextField
                      name="unitPrice"
                      value={form.unitPrice}
                      onChange={handleChange}
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: "0", step: "0.01" }}
                      variant="outlined"
                      placeholder="0"
                      className="rounded-xl"
                      InputProps={{
                        className: "rounded-xl shadow-sm",
                        startAdornment: (
                          <span className="text-gray-500 mr-2">₫</span>
                        ),
                        sx: {
                          "& fieldset": {
                            borderColor: "#d1d5db",
                          },
                          "&:hover fieldset": {
                            borderColor: "#3b82f6",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#3b82f6",
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Trạng thái
                  </label>
                  <div className="flex items-center space-x-3 mb-4">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, isAvailable: !form.isAvailable })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        form.isAvailable ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          form.isAvailable ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-medium ${
                        form.isAvailable ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {form.isAvailable ? "Khả dụng" : "Không khả dụng"}
                    </span>
                  </div>

                  {/* Is Multiplier Toggle */}
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, isMultiplier: !form.isMultiplier })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        form.isMultiplier ? "bg-purple-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          form.isMultiplier ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-medium ${
                        form.isMultiplier ? "text-purple-600" : "text-gray-500"
                      }`}
                    >
                      {form.isMultiplier
                        ? "Là hệ số nhân"
                        : "Không phải hệ số nhân"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 lg:p-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <InfoOutlinedIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Thông tin quan trọng
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Giá trị thuộc tính được sử dụng để cung cấp các tùy chọn
                      khi tạo biển hiệu. Hãy nhập đầy đủ thông tin về giá vật
                      liệu và đơn giá để hệ thống tính toán chi phí chính xác.
                    </p>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      <strong>Hệ số nhân:</strong> Khi bật tính năng này, giá
                      trị sẽ được sử dụng như một hệ số nhân trong tính toán
                      thay vì giá trị cố định.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleCloseDialog}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isLoading || !form.attributeId || !form.name || !form.unit
                }
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isLoading || !form.attributeId || !form.name || !form.unit
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : editMode
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CircularProgress size={20} color="inherit" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : editMode ? (
                  "Lưu thay đổi"
                ) : (
                  "Thêm giá trị"
                )}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={viewValuesDialog}
        onClose={handleCloseValuesDialog}
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
            <VisibilityIcon color="info" />
            Giá trị của thuộc tính: {selectedAttributeName}
          </Box>
          <IconButton
            onClick={handleCloseValuesDialog}
            size="small"
            sx={{ borderRadius: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loadingValues ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={4}
            >
              <CircularProgress size={40} />
            </Box>
          ) : attributeValues.length === 0 ? (
            <Box
              py={4}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <img
                src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/sleeping_kitty.png"
                alt="No values"
                style={{ width: 120, opacity: 0.6 }}
              />
              <Typography color="text.secondary" mt={2}>
                Chưa có giá trị nào cho thuộc tính này.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Tên giá trị</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Đơn vị</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Giá vật liệu
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Đơn giá
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Loại
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Trạng thái
                    </TableCell>
                    {/* Add Thao tác column */}
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attributeValues.map((value) => (
                    <TableRow key={value.id} hover>
                      <TableCell>{value.name}</TableCell>
                      <TableCell>{value.unit}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value.materialPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value.unitPrice)}
                      </TableCell>
                      <TableCell align="center">
                        {value.isMultiplier ? (
                          <Chip
                            label="Hệ số nhân"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label="Giá trị thường"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {value.isAvailable ? (
                          <Chip
                            label="Khả dụng"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label="Không khả dụng"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      {/* Add Edit button */}
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            color="primary"
                            onClick={() => handleOpenEdit(value)}
                            sx={{ borderRadius: 2, textTransform: "none" }}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={
                              value.isAvailable ? (
                                <ToggleOffIcon />
                              ) : (
                                <ToggleOnIcon />
                              )
                            }
                            color={value.isAvailable ? "error" : "success"}
                            onClick={() => handleToggleStatus(value)}
                            sx={{ borderRadius: 2, textTransform: "none" }}
                          >
                            {value.isAvailable ? "Ẩn" : "Hiển thị"}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
          <Button
            onClick={handleCloseValuesDialog}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal xác nhận toggle trạng thái với Tailwind CSS */}
      <Dialog
        open={toggleDialog.open}
        onClose={() => setToggleDialog({ open: false, attributeValue: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          className: "rounded-2xl shadow-2xl",
        }}
      >
        <DialogTitle
          className={`text-white ${
            toggleDialog.attributeValue?.isAvailable
              ? "bg-gradient-to-r from-red-500 to-pink-500"
              : "bg-gradient-to-r from-green-500 to-emerald-500"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {toggleDialog.attributeValue?.isAvailable ? (
                <ToggleOffIcon />
              ) : (
                <ToggleOnIcon />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {toggleDialog.attributeValue?.isAvailable
                  ? "Ẩn giá trị thuộc tính"
                  : "Hiển thị giá trị thuộc tính"}
              </h2>
              <p
                className={`text-sm ${
                  toggleDialog.attributeValue?.isAvailable
                    ? "text-red-100"
                    : "text-green-100"
                }`}
              >
                Thay đổi trạng thái hiển thị
              </p>
            </div>
          </div>
        </DialogTitle>

        <DialogContent className="p-6 bg-white">
          {toggleDialog.attributeValue && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  toggleDialog.attributeValue.isAvailable
                    ? "bg-red-100"
                    : "bg-green-100"
                }`}
              >
                {toggleDialog.attributeValue.isAvailable ? (
                  <ToggleOffIcon
                    className="text-red-500"
                    sx={{ fontSize: 32 }}
                  />
                ) : (
                  <ToggleOnIcon
                    className="text-green-500"
                    sx={{ fontSize: 32 }}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Typography className="text-lg font-semibold text-gray-800">
                  Bạn có chắc chắn muốn{" "}
                  {toggleDialog.attributeValue.isAvailable ? "ẩn" : "hiển thị"}
                  giá trị thuộc tính "
                  <strong>{toggleDialog.attributeValue.name}</strong>"?
                </Typography>
                <Typography
                  className={`text-sm p-3 rounded-lg ${
                    toggleDialog.attributeValue.isAvailable
                      ? "text-yellow-800 bg-yellow-50 border border-yellow-200"
                      : "text-blue-800 bg-blue-50 border border-blue-200"
                  }`}
                >
                  {toggleDialog.attributeValue.isAvailable
                    ? "⚠️ Giá trị thuộc tính sẽ được ẩn khỏi danh sách hiển thị cho người dùng."
                    : "ℹ️ Giá trị thuộc tính sẽ được hiển thị trở lại cho người dùng."}
                </Typography>
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={() =>
                setToggleDialog({ open: false, attributeValue: null })
              }
              variant="outlined"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg py-2"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmToggleStatus}
              variant="contained"
              className={`flex-1 text-white rounded-lg py-2 shadow-md hover:shadow-lg transition-all duration-300 ${
                toggleDialog.attributeValue?.isAvailable
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              }`}
              startIcon={
                toggleDialog.attributeValue?.isAvailable ? (
                  <ToggleOffIcon />
                ) : (
                  <ToggleOnIcon />
                )
              }
            >
              {toggleDialog.attributeValue?.isAvailable
                ? "Ẩn giá trị thuộc tính"
                : "Hiển thị giá trị thuộc tính"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default AttributeValueManager;
