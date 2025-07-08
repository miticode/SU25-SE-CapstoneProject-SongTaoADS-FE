import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Stack,
  Chip,
  ButtonGroup,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import {
  fetchBackgroundsByAttributeValueId,
  createBackgroundByAttributeValueId,
  updateBackgroundInfo,
  updateBackgroundImage,
  deleteBackgroundById,
  selectAllBackgroundSuggestions,
  selectBackgroundStatus,
  selectBackgroundError,
  selectSelectedBackground,
  setSelectedBackground,
  clearSelectedBackground,
  fetchAllBackgrounds,
} from "../../store/features/background/backgroundSlice";
import { getAttributeValuesByAttributeId } from "../../store/features/attribute/attributeValueSlice";
import { fetchAttributesByProductTypeId } from "../../store/features/attribute/attributeSlice";
import { fetchProductTypes } from "../../store/features/productType/productTypeSlice";

// Trang quản lý Nền (Background) cho Manager
const BackgroundManager = () => {
  const dispatch = useDispatch();
  // State redux
  const backgrounds = useSelector(selectAllBackgroundSuggestions) || [];
  const backgroundStatus = useSelector(selectBackgroundStatus);
  const backgroundError = useSelector(selectBackgroundError);
  const selectedBackground = useSelector(selectSelectedBackground);

  // State filter
  const [productTypes, setProductTypes] = useState([]); // Danh sách product type
  const [selectedProductType, setSelectedProductType] = useState("");
  const [attributes, setAttributes] = useState([]); // Danh sách thuộc tính
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [attributeValues, setAttributeValues] = useState([]); // Danh sách giá trị thuộc tính
  const [selectedAttributeValue, setSelectedAttributeValue] = useState("");

  // Modal/Form state
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    attributeValueId: "",
    backgroundImage: null,
    isAvailable: true,
    id: undefined,
  });
  const [formError, setFormError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10 });

  // Thêm state để biết có đang ở chế độ tất cả không
  const [showAll, setShowAll] = useState(false);
  const [allBackgrounds, setAllBackgrounds] = useState([]);

  // Lấy danh sách product type khi mount
  useEffect(() => {
    dispatch(fetchProductTypes()).then((res) => {
      if (res.payload && res.payload.data && Array.isArray(res.payload.data)) {
        setProductTypes(res.payload.data);
      }
    });
  }, [dispatch]);

  // Lấy danh sách thuộc tính khi chọn product type
  useEffect(() => {
    if (selectedProductType) {
      dispatch(fetchAttributesByProductTypeId(selectedProductType)).then(
        (res) => {
          if (res.payload && Array.isArray(res.payload)) {
            setAttributes(res.payload);
          } else {
            setAttributes([]);
          }
          setSelectedAttribute("");
          setAttributeValues([]);
          setSelectedAttributeValue("");
        }
      );
    } else {
      setAttributes([]);
      setSelectedAttribute("");
      setAttributeValues([]);
      setSelectedAttributeValue("");
    }
  }, [dispatch, selectedProductType]);

  // Lấy danh sách giá trị thuộc tính khi chọn attribute
  useEffect(() => {
    if (selectedAttribute) {
      dispatch(
        getAttributeValuesByAttributeId({
          attributeId: selectedAttribute,
          page: 1,
          size: 50,
        })
      ).then((res) => {
        if (
          res.payload &&
          res.payload.attributeValues &&
          Array.isArray(res.payload.attributeValues)
        ) {
          setAttributeValues(res.payload.attributeValues);
        } else {
          setAttributeValues([]);
        }
        setSelectedAttributeValue("");
      });
    } else {
      setAttributeValues([]);
      setSelectedAttributeValue("");
    }
  }, [dispatch, selectedAttribute]);

  // Lấy danh sách background khi chọn đủ 3 cấp
  useEffect(() => {
    if (selectedAttributeValue) {
      dispatch(fetchBackgroundsByAttributeValueId(selectedAttributeValue));
    }
  }, [dispatch, selectedAttributeValue]);

  // Hàm xử lý khi bấm nút TẤT CẢ
  const handleShowAll = async () => {
    setShowAll(true);
    setSelectedProductType("");
    setSelectedAttribute("");
    setSelectedAttributeValue("");
    setPagination({ page: 0, rowsPerPage: 10 });
    const res = await dispatch(fetchAllBackgrounds());
    if (res.payload) setAllBackgrounds(res.payload);
  };

  // Khi chọn filter lại thì tắt chế độ tất cả
  const handleProductTypeChange = (e) => {
    setShowAll(false);
    setSelectedProductType(e.target.value);
  };
  const handleAttributeChange = (e) => {
    setShowAll(false);
    setSelectedAttribute(e.target.value);
  };
  const handleAttributeValueChange = (e) => {
    setShowAll(false);
    setSelectedAttributeValue(e.target.value);
    setPagination({ ...pagination, page: 0 });
  };

  // Mở modal tạo mới
  const handleOpenCreate = () => {
    setFormMode("create");
    setFormData({
      name: "",
      description: "",
      attributeValueId: "",
      backgroundImage: null,
      isAvailable: true,
      id: undefined,
    });
    setImageFile(null);
    setFormError("");
    setOpenForm(true);
  };
  // Mở modal sửa
  const handleOpenEdit = (bg) => {
    setFormMode("edit");
    setFormData({
      name: bg.name,
      description: bg.description,
      attributeValueId: bg.attributeValues?.id || "",
      isAvailable: bg.isAvailable,
      id: bg.id,
    });
    setImageFile(null);
    setFormError("");
    setOpenForm(true);
  };
  // Mở modal chi tiết
  const handleOpenDetail = (bg) => {
    dispatch(setSelectedBackground(bg));
    setOpenDetail(true);
  };
  // Đóng modal chi tiết
  const handleCloseDetail = () => {
    setOpenDetail(false);
    dispatch(clearSelectedBackground());
  };
  // Đóng modal form
  const handleCloseForm = () => {
    setOpenForm(false);
  };
  // Đóng modal xóa
  const handleCloseDelete = () => {
    setOpenDelete(false);
  };
  // Mở modal xác nhận xóa
  const handleOpenDelete = (bg) => {
    setFormData({ id: bg.id });
    setOpenDelete(true);
  };
  // Xử lý submit form tạo/sửa
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.attributeValueId) {
      setFormError("Vui lòng nhập tên và chọn giá trị thuộc tính.");
      return;
    }
    if (formMode === "create") {
      // Tạo mới
      const res = await dispatch(
        createBackgroundByAttributeValueId({
          attributeValueId: formData.attributeValueId,
          name: formData.name,
          description: formData.description,
          backgroundImage: imageFile,
        })
      );
      if (res.meta.requestStatus === "fulfilled") {
        setOpenForm(false);
        if (selectedAttributeValue) {
          dispatch(fetchBackgroundsByAttributeValueId(selectedAttributeValue));
        }
      } else {
        setFormError(res.payload || "Tạo nền thất bại");
      }
    } else {
      // Sửa thông tin
      const res = await dispatch(
        updateBackgroundInfo({
          backgroundId: formData.id,
          name: formData.name,
          description: formData.description,
          isAvailable: formData.isAvailable,
        })
      );
      if (res.meta.requestStatus === "fulfilled") {
        if (imageFile) {
          await dispatch(
            updateBackgroundImage({
              backgroundId: formData.id,
              file: imageFile,
            })
          );
        }
        setOpenForm(false);
        if (selectedAttributeValue) {
          dispatch(fetchBackgroundsByAttributeValueId(selectedAttributeValue));
        }
      } else {
        setFormError(res.payload || "Cập nhật thất bại");
      }
    }
  };
  // Xử lý xóa
  const handleDelete = async () => {
    setOpenDelete(false);
    const res = await dispatch(deleteBackgroundById(formData.id));
    if (res.meta.requestStatus === "fulfilled" && selectedAttributeValue) {
      dispatch(fetchBackgroundsByAttributeValueId(selectedAttributeValue));
    }
  };
  // Xử lý upload ảnh
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Tính toán backgrounds hiển thị
  const filteredBackgrounds = showAll
    ? allBackgrounds.filter((bg) => {
        if (
          selectedProductType &&
          bg.attributeValues?.productTypeId !== selectedProductType
        )
          return false;
        if (
          selectedAttribute &&
          bg.attributeValues?.attributeId !== selectedAttribute
        )
          return false;
        if (
          selectedAttributeValue &&
          bg.attributeValues?.id !== selectedAttributeValue
        )
          return false;
        return true;
      })
    : backgrounds;

  // Render
  return (
    <Box>
      <Box mb={3} display="flex" flexDirection="column" gap={2}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Nền Mẫu
        </Typography>
        {/* Filter 3 cấp + nút TẤT CẢ */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant={showAll ? "contained" : "outlined"}
            color="secondary"
            onClick={handleShowAll}
            sx={{ height: 56 }}
          >
            TẤT CẢ
          </Button>
          <FormControl
            sx={{ minWidth: 180 }}
            disabled={productTypes.length === 0}
          >
            <InputLabel>Loại sản phẩm</InputLabel>
            <Select
              value={selectedProductType}
              label="Loại sản phẩm"
              onChange={handleProductTypeChange}
            >
              <MenuItem value="">Chọn loại sản phẩm</MenuItem>
              {productTypes.map((pt) => (
                <MenuItem key={pt.id} value={pt.id}>
                  {pt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            sx={{ minWidth: 180 }}
            disabled={attributes.length === 0}
          >
            <InputLabel>Thuộc tính</InputLabel>
            <Select
              value={selectedAttribute}
              label="Thuộc tính"
              onChange={handleAttributeChange}
            >
              <MenuItem value="">Chọn thuộc tính</MenuItem>
              {attributes.map((attr) => (
                <MenuItem key={attr.id} value={attr.id}>
                  {attr.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            sx={{ minWidth: 180 }}
            disabled={attributeValues.length === 0}
          >
            <InputLabel>Giá trị thuộc tính</InputLabel>
            <Select
              value={selectedAttributeValue}
              label="Giá trị thuộc tính"
              onChange={handleAttributeValueChange}
            >
              <MenuItem value="">Chọn giá trị thuộc tính</MenuItem>
              {attributeValues.map((av) => (
                <MenuItem key={av.id} value={av.id}>
                  {av.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Box textAlign="right">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={!selectedAttributeValue && !showAll}
          >
            Tạo mới
          </Button>
        </Box>
      </Box>
      {backgroundStatus === "loading" ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      ) : backgroundError ? (
        <Alert severity="error">{backgroundError}</Alert>
      ) : (
        <Grid container spacing={5} justifyContent="flex-start" width="100%">
          {filteredBackgrounds
            .slice(
              pagination.page * pagination.rowsPerPage,
              pagination.page * pagination.rowsPerPage + pagination.rowsPerPage
            )
            .map((bg) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={bg.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: 2,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={bg.backgroundUrl || "/public/default-logo.png"}
                    alt={bg.name}
                    sx={{
                      width: "100%",
                      maxHeight: 220,
                      aspectRatio: "4/3",
                      objectFit: "cover",
                      borderRadius: 2,
                      background: "#f5f5f5",
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      noWrap
                    >
                      {bg.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      noWrap
                    >
                      {bg.attributeValues?.name || ""}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mt={1}
                    >
                      <Chip
                        label={bg.isAvailable ? "Hiển thị" : "Ẩn"}
                        color={bg.isAvailable ? "success" : "default"}
                        size="small"
                      />
                    </Stack>
                  </CardContent>
                  <CardActions
                    sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                  >
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDetail(bg)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <IconButton
                        color="info"
                        onClick={() => handleOpenEdit(bg)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDelete(bg)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
      <Box mt={3} display="flex" justifyContent="center">
        <TablePagination
          component="div"
          count={filteredBackgrounds.length}
          page={pagination.page}
          onPageChange={(e, newPage) =>
            setPagination((prev) => ({ ...prev, page: newPage }))
          }
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={(e) =>
            setPagination({
              page: 0,
              rowsPerPage: parseInt(e.target.value, 10),
            })
          }
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Box>
      {/* Modal chi tiết */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết Nền</DialogTitle>
        <DialogContent>
          {selectedBackground ? (
            <Box>
              <Typography variant="h6">{selectedBackground.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {selectedBackground.description}
              </Typography>
              <Box mb={2}>
                {selectedBackground.backgroundUrl ? (
                  <Avatar
                    src={selectedBackground.backgroundUrl}
                    variant="rounded"
                    sx={{ width: 120, height: 120 }}
                  />
                ) : (
                  <ImageIcon color="disabled" sx={{ fontSize: 120 }} />
                )}
              </Box>
              <Typography>
                Giá trị thuộc tính:{" "}
                {selectedBackground.attributeValues?.name || ""}
              </Typography>
              <Typography>
                Trạng thái: {selectedBackground.isAvailable ? "Hiển thị" : "Ẩn"}
              </Typography>
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Đóng</Button>
        </DialogActions>
      </Dialog>
      {/* Modal tạo/sửa */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formMode === "create" ? "Tạo Nền" : "Sửa Nền"}
        </DialogTitle>
        <form onSubmit={handleSubmitForm}>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <TextField
              label="Tên nền"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Mô tả"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <FormControl
              fullWidth
              margin="normal"
              disabled={attributeValues.length === 0}
            >
              <InputLabel>Giá trị thuộc tính</InputLabel>
              <Select
                value={formData.attributeValueId}
                label="Giá trị thuộc tính"
                onChange={(e) =>
                  setFormData({ ...formData, attributeValueId: e.target.value })
                }
                required
              >
                <MenuItem value="">Chọn giá trị thuộc tính</MenuItem>
                {attributeValues.map((av) => (
                  <MenuItem key={av.id} value={av.id}>
                    {av.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box mt={2}>
              <Button variant="contained" component="label">
                {formMode === "create" ? "Upload ảnh" : "Đổi ảnh"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {imageFile && <Typography ml={2}>{imageFile.name}</Typography>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {formMode === "create" ? "Tạo mới" : "Lưu thay đổi"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Modal xác nhận xóa */}
      <Dialog
        open={openDelete}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa nền này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackgroundManager;
