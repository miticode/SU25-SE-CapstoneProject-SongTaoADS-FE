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
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  InfoOutlined as InfoOutlinedIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  createAttributeValue,
  deleteAttributeValue,
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
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
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (value) => {
    setEditMode(true);
    setForm({
      attributeId: value.attributesId, // Use attributesId from the API response
      name: value.name,
      unit: value.unit,
      materialPrice: value.materialPrice,
      unitPrice: value.unitPrice,
      isAvailable: value.isAvailable,
    });
    setSelectedId(value.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm({ attributeId: "", value: "", description: "" });
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

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    // Call the delete API
    dispatch(deleteAttributeValue(deleteId))
      .unwrap()
      .then(() => {
        // After successful deletion, refresh the attribute values list
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
          message: "Xóa giá trị thuộc tính thành công!",
          severity: "success",
        });
      })
      .catch((error) => {
        console.error("Error deleting attribute value:", error);
        setSnackbar({
          open: true,
          message: `Lỗi: ${error}`,
          severity: "error",
        });
      })
      .finally(() => {
        setConfirmDelete(false);
        setDeleteId(null);
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

      {/* Add/Edit Dialog */}
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
              {editMode ? (
                <EditIcon color="primary" />
              ) : (
                <AddIcon color="primary" />
              )}
              {editMode ? "Sửa giá trị thuộc tính" : "Thêm giá trị thuộc tính"}
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
              {/* Chọn thuộc tính */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="500"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Thuộc tính
                </Typography>
                <FormControl fullWidth required>
                  <Select
                    name="attributeId"
                    value={form.attributeId}
                    onChange={handleChange}
                    displayEmpty
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="" disabled>
                      <em>Chọn thuộc tính</em>
                    </MenuItem>
                    {attributes.map((attr) => (
                      <MenuItem key={attr.id} value={attr.id}>
                        {attr.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Tên giá trị */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="500"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Tên giá trị
                </Typography>
                <TextField
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  placeholder="Nhập tên giá trị thuộc tính"
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      fontSize: "1rem",
                    },
                  }}
                />
              </Box>

              {/* Đơn vị */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="500"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Đơn vị
                </Typography>
                <TextField
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  placeholder="Nhập đơn vị (vd: cm, m², kg...)"
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      fontSize: "1rem",
                    },
                  }}
                />
              </Box>

              {/* Giá vật liệu */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="500"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Giá vật liệu
                </Typography>
                <TextField
                  name="materialPrice"
                  value={form.materialPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                  type="number"
                  inputProps={{ min: "0", step: "0.01" }}
                  variant="outlined"
                  placeholder="Nhập giá vật liệu"
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      fontSize: "1rem",
                    },
                  }}
                />
              </Box>

              {/* Đơn giá */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="500"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Đơn giá
                </Typography>
                <TextField
                  name="unitPrice"
                  value={form.unitPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                  type="number"
                  inputProps={{ min: "0", step: "0.01" }}
                  variant="outlined"
                  placeholder="Nhập đơn giá"
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      fontSize: "1rem",
                    },
                  }}
                />
              </Box>

              {/* Hướng dẫn */}
              <Box sx={{ mt: 1, bgcolor: "#f9fbe7", p: 2, borderRadius: 2 }}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 18, mr: 1 }} />
                  Thông tin
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Giá trị thuộc tính được sử dụng để cung cấp các tùy chọn khi
                  tạo biển hiệu. Hãy nhập đầy đủ thông tin về giá vật liệu và
                  đơn giá để hệ thống tính toán chi phí chính xác.
                </Typography>
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
              disabled={
                isLoading || !form.attributeId || !form.name || !form.unit
              }
              sx={{
                borderRadius: 1.5,
                px: 3,
                boxShadow: "0 3px 5px 0 rgba(76,175,80,0.3)",
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : editMode ? (
                "Lưu thay đổi"
              ) : (
                "Thêm giá trị"
              )}
            </Button>
          </DialogActions>
        </Box>
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
                            startIcon={<DeleteIcon />}
                            color="error"
                            onClick={() => handleDelete(value.id)}
                            sx={{ borderRadius: 2, textTransform: "none" }}
                          >
                            Xóa
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
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
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
          <Typography>Bạn có chắc muốn xóa giá trị thuộc tính này?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDelete(false)}
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
