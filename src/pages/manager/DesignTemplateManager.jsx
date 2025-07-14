import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Stack,
  Chip,
  ButtonGroup,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import {
  fetchAllDesignTemplates,
  fetchDesignTemplatesByProductTypeId,
  fetchDesignTemplateById,
  createDesignTemplate,
  updateDesignTemplateInfo,
  updateDesignTemplateImage,
  deleteDesignTemplateById,
  selectAllDesignTemplates,
  selectDesignTemplateStatus,
  selectDesignTemplateError,
  selectSelectedTemplate,
} from "../../store/features/designTemplate/designTemplateSlice";
import {
  fetchProductTypes,
  selectAllProductTypes,
  selectProductTypeStatus,
} from "../../store/features/productType/productTypeSlice";
import {
  fetchImageFromS3,
  uploadImageToS3,
  removeImage,
} from "../../store/features/s3/s3Slice";
import { v4 as uuidv4 } from "uuid";

// Component quản lý Design Template cho Manager
const DesignTemplateManager = () => {
  const dispatch = useDispatch();
  // State redux
  const designTemplates = useSelector(selectAllDesignTemplates);
  const designTemplateStatus = useSelector(selectDesignTemplateStatus);
  const designTemplateError = useSelector(selectDesignTemplateError);
  const selectedTemplate = useSelector(selectSelectedTemplate);
  const productTypes = useSelector(selectAllProductTypes);
  const productTypeStatus = useSelector(selectProductTypeStatus);
  const s3Images = useSelector((state) => state.s3.images);

  // State local
  const [selectedProductType, setSelectedProductType] = useState("all");
  const [openDetail, setOpenDetail] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    negativePrompt: "",
    width: 512,
    height: 512,
    isAvailable: true,
    productTypeId: "",
    image: null,
  });
  const [formError, setFormError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10 });

  // Lấy danh sách loại sản phẩm khi mount
  useEffect(() => {
    dispatch(fetchProductTypes());
  }, [dispatch]);

  // Lấy danh sách design template khi mount hoặc khi chọn loại sản phẩm
  useEffect(() => {
    if (selectedProductType === "all") {
      dispatch(fetchAllDesignTemplates());
    } else {
      dispatch(fetchDesignTemplatesByProductTypeId(selectedProductType));
    }
  }, [dispatch, selectedProductType]);

  // Preload S3 images cho danh sách
  useEffect(() => {
    designTemplates.forEach((template) => {
      if (template.image && !s3Images[template.image]) {
        dispatch(fetchImageFromS3(template.image));
      }
    });
    // KHÔNG đưa s3Images vào dependencies!
  }, [designTemplates, dispatch]);

  // Preload S3 image cho modal chi tiết
  useEffect(() => {
    if (
      openDetail &&
      selectedTemplate &&
      selectedTemplate.image &&
      !s3Images[selectedTemplate.image]
    ) {
      dispatch(fetchImageFromS3(selectedTemplate.image));
    }
  }, [openDetail, selectedTemplate, dispatch]);

  // Thay filter dropdown bằng button group filter
  const handleProductTypeFilter = (id) => {
    setSelectedProductType(id);
    setPagination({ ...pagination, page: 0 });
  };

  // Xử lý phân trang
  const handleChangePage = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };
  const handleChangeRowsPerPage = (event) => {
    setPagination({ page: 0, rowsPerPage: parseInt(event.target.value, 10) });
  };

  // Mở modal tạo mới
  const handleOpenCreate = () => {
    setFormMode("create");
    setFormData({
      name: "",
      description: "",
      negativePrompt: "",
      width: 512,
      height: 512,
      isAvailable: true,
      productTypeId: "",
      image: null,
    });
    setImageFile(null);
    setFormError("");
    setOpenForm(true);
  };

  // Mở modal sửa
  const handleOpenEdit = (template) => {
    setFormMode("edit");
    setFormData({
      name: template.name,
      description: template.description,
      negativePrompt: template.negativePrompt,
      width: template.width,
      height: template.height,
      isAvailable: template.isAvailable,
      productTypeId: template.productTypes?.id || "",
      image: template.image,
      id: template.id,
    });
    setImageFile(null);
    setFormError("");
    setOpenForm(true);
  };

  // Mở modal chi tiết
  const handleOpenDetail = (template) => {
    dispatch(fetchDesignTemplateById(template.id));
    setOpenDetail(true);
  };

  // Đóng modal chi tiết
  const handleCloseDetail = () => {
    setOpenDetail(false);
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
  const handleOpenDelete = (template) => {
    setFormData({ id: template.id });
    setOpenDelete(true);
  };

  // Xử lý submit form tạo/sửa
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError("");
    // Validate
    if (!formData.name || !formData.productTypeId) {
      setFormError("Vui lòng nhập tên mẫu và chọn loại sản phẩm.");
      return;
    }
    let imageKey = "";
    if (formMode === "create") {
      // Tạo mới
      if (imageFile) {
        const keyName = `design-template/${uuidv4()}/${imageFile.name}`;
        try {
          imageKey = await dispatch(
            uploadImageToS3({ file: imageFile, keyName })
          ).unwrap();
        } catch (err) {
          setFormError(err || "Upload ảnh thất bại");
          return;
        }
      }
      const {
        name,
        description,
        negativePrompt,
        width,
        height,
        isAvailable,
        productTypeId,
      } = formData;
      const res = await dispatch(
        createDesignTemplate({
          productTypeId,
          templateData: {
            name,
            description,
            negativePrompt,
            width,
            height,
            isAvailable,
            image: imageKey,
          },
        })
      );
      if (res.meta.requestStatus === "fulfilled") {
        setOpenForm(false);
        // KHÔNG gọi lại fetchAllDesignTemplates ở đây để tránh mất template mới do phân trang
      } else {
        setFormError(res.payload || "Tạo mẫu thất bại");
      }
    } else {
      // Sửa thông tin
      const {
        id,
        name,
        description,
        negativePrompt,
        width,
        height,
        isAvailable,
      } = formData;
      const updateRes = await dispatch(
        updateDesignTemplateInfo({
          designTemplateId: id,
          updateData: {
            name,
            description,
            negativePrompt,
            width,
            height,
            isAvailable,
          },
        })
      );
      if (updateRes.meta.requestStatus === "fulfilled") {
        if (imageFile) {
          const imgRes = await dispatch(
            updateDesignTemplateImage({ designTemplateId: id, file: imageFile })
          );
          if (imgRes.meta.requestStatus === "fulfilled") {
            dispatch(removeImage(formData.image)); // Xóa url cũ khỏi cache để UI fetch lại ảnh mới
          }
        }
        setOpenForm(false);
        dispatch(fetchAllDesignTemplates());
      } else {
        setFormError(updateRes.payload || "Cập nhật thất bại");
      }
    }
  };

  // Xử lý xóa
  const handleDelete = async () => {
    setOpenDelete(false);
    const res = await dispatch(deleteDesignTemplateById(formData.id));
    if (res.meta.requestStatus === "fulfilled") {
      dispatch(fetchAllDesignTemplates());
    } else {
      // Có thể show alert/toast lỗi ở ngoài nếu muốn
    }
  };

  // Xử lý upload ảnh
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Render
  return (
    <Box>
      <Box mb={3} display="flex" flexDirection="column" gap={2}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Thiết Kế Mẫu
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <ButtonGroup variant="outlined" color="primary">
            <Button
              variant={selectedProductType === "all" ? "contained" : "outlined"}
              onClick={() => handleProductTypeFilter("all")}
            >
              Tất cả
            </Button>
            {productTypes.map((pt) => (
              <Button
                key={pt.id}
                variant={
                  selectedProductType === pt.id ? "contained" : "outlined"
                }
                onClick={() => handleProductTypeFilter(pt.id)}
              >
                {pt.name}
              </Button>
            ))}
          </ButtonGroup>
        </Stack>
        <Box textAlign="right">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Tạo mới
          </Button>
        </Box>
      </Box>
      {designTemplateStatus === "loading" || productTypeStatus === "loading" ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      ) : designTemplateError ? (
        <Alert severity="error">{designTemplateError}</Alert>
      ) : (
        <Grid container spacing={5} justifyContent="flex-start" width="100%">
          {designTemplates
            .slice(
              pagination.page * pagination.rowsPerPage,
              pagination.page * pagination.rowsPerPage + pagination.rowsPerPage
            )
            .map((template) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
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
                    image={
                      template.image
                        ? s3Images[template.image] || "/public/default-logo.png"
                        : "/public/default-logo.png"
                    }
                    alt={template.name}
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
                      {template.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      noWrap
                    >
                      {template.productTypes?.name}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mt={1}
                    >
                      <Chip
                        label={template.isAvailable ? "Hiển thị" : "Ẩn"}
                        color={template.isAvailable ? "success" : "default"}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {template.width}x{template.height}
                      </Typography>
                    </Stack>
                  </CardContent>
                  <CardActions
                    sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                  >
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDetail(template)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <IconButton
                        color="info"
                        onClick={() => handleOpenEdit(template)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDelete(template)}
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
          count={designTemplates.length}
          page={pagination.page}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
        <DialogTitle>Chi tiết Thiết Kế Mẫu</DialogTitle>
        <DialogContent>
          {selectedTemplate ? (
            <Box>
              <Typography variant="h6">{selectedTemplate.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {selectedTemplate.description}
              </Typography>
              <Box mb={2}>
                {selectedTemplate.image ? (
                  <Avatar
                    src={
                      s3Images[selectedTemplate.image] ||
                      "/public/default-logo.png"
                    }
                    variant="rounded"
                    sx={{ width: 120, height: 120 }}
                  />
                ) : (
                  <ImageIcon color="disabled" sx={{ fontSize: 120 }} />
                )}
              </Box>
              <Typography>
                Loại sản phẩm: {selectedTemplate.productTypes?.name}
              </Typography>
              <Typography>
                Negative Prompt: {selectedTemplate.negativePrompt}
              </Typography>
              <Typography>
                Kích thước: {selectedTemplate.width} x {selectedTemplate.height}
              </Typography>
              <Typography>
                Trạng thái: {selectedTemplate.isAvailable ? "Hiển thị" : "Ẩn"}
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
          {formMode === "create" ? "Tạo Thiết Kế Mẫu" : "Sửa Thiết Kế Mẫu"}
        </DialogTitle>
        <form onSubmit={handleSubmitForm}>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <TextField
              label="Tên mẫu"
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
            <TextField
              label="Negative Prompt"
              value={formData.negativePrompt}
              onChange={(e) =>
                setFormData({ ...formData, negativePrompt: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Width"
                  type="number"
                  value={formData.width}
                  onChange={(e) =>
                    setFormData({ ...formData, width: Number(e.target.value) })
                  }
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Height"
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: Number(e.target.value) })
                  }
                  fullWidth
                  margin="normal"
                />
              </Grid>
            </Grid>
            <FormControl fullWidth margin="normal">
              <InputLabel>Loại sản phẩm</InputLabel>
              <Select
                value={formData.productTypeId}
                label="Loại sản phẩm"
                onChange={(e) =>
                  setFormData({ ...formData, productTypeId: e.target.value })
                }
                required
              >
                {productTypes.map((pt) => (
                  <MenuItem key={pt.id} value={pt.id}>
                    {pt.name}
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
          <Typography>Bạn có chắc chắn muốn xóa thiết kế mẫu này?</Typography>
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

export default DesignTemplateManager;
