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
  fetchDesignTemplateById,
  createDesignTemplate,
  updateDesignTemplateInfo,
  updateDesignTemplateImage,
  deleteDesignTemplateById,
  removeDesignTemplateOptimistically,
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
import { fetchImageFromS3, removeImage } from "../../store/features/s3/s3Slice";

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
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("all");
  const [openDetail, setOpenDetail] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    aspectRatio: "SQUARE",
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

  // Lấy danh sách design template khi mount
  useEffect(() => {
    dispatch(fetchAllDesignTemplates());
  }, [dispatch]);

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

  // Handler cho filter aspect ratio
  const handleAspectRatioFilter = (ratio) => {
    setSelectedAspectRatio(ratio);
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
      aspectRatio: "SQUARE",
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
      aspectRatio: template.aspectRatio || "SQUARE",
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
    if (formMode === "create") {
      // Tạo mới với API mới - gửi multipart/form-data
      const { name, description, aspectRatio, isAvailable, productTypeId } =
        formData;

      const templateData = {
        name,
        description,
        aspectRatio,
        isAvailable,
        designTemplateImage: imageFile, // Thêm file hình ảnh vào dữ liệu
      };

      const res = await dispatch(
        createDesignTemplate({
          productTypeId,
          templateData,
        })
      );
      if (res.meta.requestStatus === "fulfilled") {
        setOpenForm(false);
        // Refresh danh sách để hiển thị template mới
        dispatch(fetchAllDesignTemplates());
      } else {
        setFormError(res.payload || "Tạo mẫu thất bại");
      }
    } else {
      // Sửa thông tin
      const { id, name, description, aspectRatio, isAvailable } = formData;
      const updateRes = await dispatch(
        updateDesignTemplateInfo({
          designTemplateId: id,
          updateData: {
            name,
            description,
            aspectRatio,
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
        // Refresh danh sách
        dispatch(fetchAllDesignTemplates());
      } else {
        setFormError(updateRes.payload || "Cập nhật thất bại");
      }
    }
  };

  // Xử lý xóa
  const handleDelete = async () => {
    setOpenDelete(false);
    const templateId = formData.id;

    // Optimistic update - xóa ngay lập tức khỏi UI
    dispatch(removeDesignTemplateOptimistically(templateId));

    const res = await dispatch(deleteDesignTemplateById(templateId));
    if (res.meta.requestStatus === "rejected") {
      // Nếu xóa thất bại, refresh lại danh sách để khôi phục
      dispatch(fetchAllDesignTemplates());
    }
  };

  // Xử lý upload ảnh
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Filter designTemplates dựa trên selectedAspectRatio
  const filteredDesignTemplates = designTemplates.filter((template) => {
    // Filter theo aspect ratio
    const aspectRatioMatch =
      selectedAspectRatio === "all" ||
      (template.aspectRatio || "SQUARE") === selectedAspectRatio;

    return aspectRatioMatch;
  });

  // Render
  return (
    <Box>
      <Box mb={3} display="flex" flexDirection="column" gap={2}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Thiết Kế Mẫu
        </Typography>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Lọc theo tỷ lệ khung hình:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <ButtonGroup variant="outlined" color="secondary">
              <Button
                variant={
                  selectedAspectRatio === "all" ? "contained" : "outlined"
                }
                onClick={() => handleAspectRatioFilter("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={
                  selectedAspectRatio === "SQUARE" ? "contained" : "outlined"
                }
                onClick={() => handleAspectRatioFilter("SQUARE")}
              >
                Vuông
              </Button>
              <Button
                variant={
                  selectedAspectRatio === "HORIZONTAL"
                    ? "contained"
                    : "outlined"
                }
                onClick={() => handleAspectRatioFilter("HORIZONTAL")}
              >
                Ngang
              </Button>
              <Button
                variant={
                  selectedAspectRatio === "VERTICAL" ? "contained" : "outlined"
                }
                onClick={() => handleAspectRatioFilter("VERTICAL")}
              >
                Dọc
              </Button>
            </ButtonGroup>
          </Stack>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Hiển thị {filteredDesignTemplates.length} / {designTemplates.length}{" "}
            mẫu thiết kế
          </Typography>
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
      ) : filteredDesignTemplates.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={300}
          gap={2}
        >
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy mẫu thiết kế nào
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {selectedAspectRatio !== "all"
              ? "Thử thay đổi bộ lọc để xem thêm kết quả"
              : "Hãy tạo mẫu thiết kế đầu tiên của bạn"}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSelectedAspectRatio("all");
              setPagination({ ...pagination, page: 0 });
            }}
            sx={{ mt: 1 }}
          >
            Xóa bộ lọc
          </Button>
        </Box>
      ) : (
        <Grid container spacing={5} justifyContent="flex-start" width="100%">
          {filteredDesignTemplates
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
                        ? s3Images[template.image] || ""
                        : ""
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
                        {template.aspectRatio || "SQUARE"}
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
          count={filteredDesignTemplates.length}
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
                Tỷ lệ khung hình: {selectedTemplate.aspectRatio || "SQUARE"}
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Tỷ lệ khung hình</InputLabel>
              <Select
                value={formData.aspectRatio}
                label="Tỷ lệ khung hình"
                onChange={(e) =>
                  setFormData({ ...formData, aspectRatio: e.target.value })
                }
                required
              >
                <MenuItem value="SQUARE">Vuông (SQUARE)</MenuItem>
                <MenuItem value="HORIZONTAL">Ngang (HORIZONTAL)</MenuItem>
                <MenuItem value="VERTICAL">Dọc (VERTICAL)</MenuItem>
              </Select>
            </FormControl>
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
                {productTypes
                  .filter((pt) => pt.isAiGenerated === true)
                  .map((pt) => (
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
