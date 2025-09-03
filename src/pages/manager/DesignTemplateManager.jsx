import React, { useEffect, useState, useCallback } from "react";
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
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
} from "@mui/icons-material";
import {
  fetchAllDesignTemplates,
  fetchDesignTemplateById,
  createDesignTemplate,
  updateDesignTemplateInfo,
  updateDesignTemplateImage,
  toggleDesignTemplateStatus,
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
  // Lấy pagination từ Redux state
  const reduxPagination = useSelector(
    (state) => state.designTemplate.suggestionsPagination
  );

  // State local
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("all");
  const [openDetail, setOpenDetail] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    template: null,
  });
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
  // Thay đổi pagination state để sử dụng API pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Thêm state cho API pagination
  const [apiPagination, setApiPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  });

  // Lấy danh sách loại sản phẩm khi mount
  useEffect(() => {
    dispatch(fetchProductTypes());
  }, [dispatch]);

  // Lấy danh sách design template với pagination
  const loadDesignTemplates = useCallback(
    async (page = 1, size = 10) => {
      try {
        const aspectRatioParam =
          selectedAspectRatio === "all" ? undefined : selectedAspectRatio;
        const response = await dispatch(
          fetchAllDesignTemplates({ page, size, aspectRatio: aspectRatioParam })
        );
        if (response.meta.requestStatus === "fulfilled") {
          const {
            currentPage,
            totalPages,
            pageSize: size,
            totalElements,
          } = response.payload.pagination;
          setApiPagination({
            currentPage,
            totalPages,
            pageSize: size,
            totalElements,
          });
          setCurrentPage(currentPage);
        }
      } catch (error) {
        console.error("Lỗi khi load design templates:", error);
      }
    },
    [dispatch, selectedAspectRatio]
  );

  // Lấy danh sách design template khi mount và khi pageSize thay đổi
  useEffect(() => {
    loadDesignTemplates(1, pageSize);
  }, [loadDesignTemplates, pageSize]);

  // Cập nhật apiPagination từ Redux state khi component mount hoặc state thay đổi
  useEffect(() => {
    if (reduxPagination) {
      setApiPagination({
        currentPage: reduxPagination.currentPage,
        totalPages: reduxPagination.totalPages,
        pageSize: reduxPagination.pageSize,
        totalElements: reduxPagination.totalElements,
      });
      setCurrentPage(reduxPagination.currentPage);
    }
  }, [reduxPagination]);

  // Xử lý thay đổi trang
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage + 1); // MUI TablePagination sử dụng 0-based index
    loadDesignTemplates(newPage + 1, pageSize);
  };

  // Xử lý thay đổi số items per page
  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset về trang đầu
    loadDesignTemplates(1, newPageSize);
  };

  // Load lại dữ liệu từ đầu (reset)
  const reloadDesignTemplates = () => {
    setCurrentPage(1);
    loadDesignTemplates(1, pageSize);
  };

  // Preload S3 images cho danh sách
  useEffect(() => {
    designTemplates.forEach((template) => {
      if (template.image && !s3Images[template.image]) {
        dispatch(fetchImageFromS3(template.image));
      }
    });
  }, [designTemplates, dispatch, s3Images]);

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
  }, [openDetail, selectedTemplate, dispatch, s3Images]);

  // Handler cho filter aspect ratio
  const handleAspectRatioFilter = (ratio) => {
    setSelectedAspectRatio(ratio);
    setCurrentPage(1); // Reset về trang đầu khi thay đổi bộ lọc
    // Không cần gọi API vì filter được thực hiện trên client
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

  // Mở modal toggle trạng thái
  const handleToggleStatus = (template) => {
    setToggleDialog({ open: true, template });
  };

  // Xử lý xác nhận toggle trạng thái
  const handleConfirmToggleStatus = async () => {
    const template = toggleDialog.template;
    setToggleDialog({ open: false, template: null });

    const res = await dispatch(
      toggleDesignTemplateStatus({
        designTemplateId: template.id,
        templateData: {
          name: template.name,
          description: template.description,
          aspectRatio: template.aspectRatio,
          isAvailable: template.isAvailable,
        },
      })
    );

    if (res.meta.requestStatus === "rejected") {
      console.error("Failed to toggle template status:", res.payload);
    }
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
        reloadDesignTemplates();
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
        reloadDesignTemplates();
      } else {
        setFormError(updateRes.payload || "Cập nhật thất bại");
      }
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
            Hiển thị {designTemplates.length} /{" "}
            {apiPagination.totalElements || reduxPagination?.totalElements || 0}{" "}
            mẫu thiết kế
            {apiPagination.totalPages > 1 &&
              ` (Trang ${apiPagination.currentPage} / ${apiPagination.totalPages})`}
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
              setCurrentPage(1);
              loadDesignTemplates(1, pageSize);
            }}
            sx={{ mt: 1 }}
          >
            Xóa bộ lọc
          </Button>
        </Box>
      ) : (
        <Grid container spacing={5} justifyContent="flex-start" width="100%">
          {filteredDesignTemplates.map((template) => (
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
                  image={template.image ? s3Images[template.image] || "" : ""}
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
                  <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                    <Chip
                      label={template.isAvailable ? "Hiển thị" : "Ẩn"}
                      color={template.isAvailable ? "warning" : "error"}
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
                  <Tooltip title={template.isAvailable ? "Tạm ẩn" : "Hiển thị"}>
                    <IconButton
                      onClick={() => handleToggleStatus(template)}
                      sx={{
                        color: template.isAvailable ? "#EAB308" : "#EF4444",
                        "&:hover": {
                          color: template.isAvailable ? "#CA8A04" : "#DC2626",
                        },
                      }}
                    >
                      {template.isAvailable ? (
                        <ToggleOffIcon />
                      ) : (
                        <ToggleOnIcon />
                      )}
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
          count={
            apiPagination.totalElements || reduxPagination?.totalElements || 0
          }
          page={currentPage - 1}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
          labelRowsPerPage="Hiển thị:"
          sx={{
            "& .MuiTablePagination-selectLabel": {
              margin: 0,
            },
            "& .MuiTablePagination-displayedRows": {
              margin: 0,
            },
          }}
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

      {/* Modal xác nhận toggle trạng thái với Tailwind CSS */}
      <Dialog
        open={toggleDialog.open}
        onClose={() => setToggleDialog({ open: false, template: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          className: "rounded-2xl shadow-2xl",
        }}
      >
        <DialogTitle
          className={`text-white ${
            toggleDialog.template?.isAvailable
              ? "bg-yellow-500"
              : "bg-gradient-to-r from-red-500 to-pink-500"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {toggleDialog.template?.isAvailable ? (
                <ToggleOffIcon />
              ) : (
                <ToggleOnIcon />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {toggleDialog.template?.isAvailable
                  ? "Ẩn thiết kế mẫu"
                  : "Hiển thị thiết kế mẫu"}
              </h2>
              <p
                className={`text-sm ${
                  toggleDialog.template?.isAvailable
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
          {toggleDialog.template && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  toggleDialog.template.isAvailable
                    ? "bg-yellow-100"
                    : "bg-red-100"
                }`}
              >
                {toggleDialog.template.isAvailable ? (
                  <ToggleOffIcon
                    className="text-yellow-600"
                    sx={{ fontSize: 32 }}
                  />
                ) : (
                  <ToggleOnIcon
                    className="text-red-500"
                    sx={{ fontSize: 32 }}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Typography className="text-lg font-semibold text-gray-800">
                  Bạn có chắc chắn muốn{" "}
                  {toggleDialog.template.isAvailable ? "ẩn" : "hiển thị"}
                  thiết kế mẫu "<strong>{toggleDialog.template.name}</strong>"?
                </Typography>
                <Typography
                  className={`text-sm p-3 rounded-lg ${
                    toggleDialog.template.isAvailable
                      ? "text-yellow-800 bg-yellow-50 border border-yellow-200"
                      : "text-red-800 bg-red-50 border border-red-200"
                  }`}
                >
                  {toggleDialog.template.isAvailable
                    ? "⚠️ Thiết kế mẫu sẽ được ẩn khỏi danh sách hiển thị cho người dùng."
                    : "⚠️ Thiết kế mẫu sẽ được hiển thị trở lại cho người dùng."}
                </Typography>
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={() => setToggleDialog({ open: false, template: null })}
              variant="outlined"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg py-2"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmToggleStatus}
              variant="contained"
              className={`flex-1 text-white rounded-lg py-2 shadow-md hover:shadow-lg transition-all duration-300 ${
                toggleDialog.template?.isAvailable
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              }`}
              startIcon={
                toggleDialog.template?.isAvailable ? (
                  <ToggleOffIcon />
                ) : (
                  <ToggleOnIcon />
                )
              }
            >
              {toggleDialog.template?.isAvailable
                ? "Ẩn thiết kế mẫu"
                : "Hiển thị thiết kế mẫu"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesignTemplateManager;
