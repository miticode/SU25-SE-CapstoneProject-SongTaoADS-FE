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
  Clear as ClearIcon,
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
import {
  fetchImageFromS3,
  selectS3Image,
} from "../../store/features/s3/s3Slice";
import {
  fetchProductTypes,
  selectAllProductTypes,
  selectProductTypeStatus,
} from "../../store/features/productType/productTypeSlice";
import {
  fetchAttributesByProductTypeId,
  selectAllAttributes,
  selectAttributeStatus,
  clearAttributes,
} from "../../store/features/attribute/attributeSlice";
import {
  getAttributeValuesByAttributeId,
  resetAttributeValue,
} from "../../store/features/attribute/attributeValueSlice";

// Trang quản lý Nền (Background) cho Manager
const BackgroundManager = () => {
  const dispatch = useDispatch();
  // State redux
  const backgrounds = useSelector(selectAllBackgroundSuggestions) || [];
  const backgroundStatus = useSelector(selectBackgroundStatus);
  const backgroundError = useSelector(selectBackgroundError);
  const selectedBackground = useSelector(selectSelectedBackground);

  // State filter - cascade filter cho user experience tốt hơn
  const [filterProductType, setFilterProductType] = useState("");
  const [filterAttribute, setFilterAttribute] = useState("");
  const [filterAttributeValue, setFilterAttributeValue] = useState("");
  
  // State cho filter attributes
  const [filterAttributes, setFilterAttributes] = useState([]);
  const [filterAttributeValues, setFilterAttributeValues] = useState([]);
  const [isLoadingFilterAttributes, setIsLoadingFilterAttributes] = useState(false);
  const [isLoadingFilterAttributeValues, setIsLoadingFilterAttributeValues] = useState(false);

  // State cho product types trong form
  const allProductTypes = useSelector(selectAllProductTypes) || [];
  const productTypeStatus = useSelector(selectProductTypeStatus);
  
  // Filter chỉ lấy product types có isAiGenerated = false
  const productTypes = allProductTypes.filter(pt => pt.isAiGenerated === false);

  // State cho attributes trong form
  const attributes = useSelector(selectAllAttributes) || [];
  const attributeStatus = useSelector(selectAttributeStatus);

  // State cho attribute values trong form
  const attributeValues = useSelector((state) => state.attributeValue.attributeValues) || [];
  const attributeValueStatus = useSelector((state) => state.attributeValue.isLoading);

  // Modal/Form state
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    attributeValueId: "",
    productTypeId: "", // Thêm productTypeId
    attributeId: "", // Thêm attributeId
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

  // Component để hiển thị hình ảnh background với S3
  const BackgroundImage = ({ background, size = "large" }) => {
    const s3Image = useSelector((state) =>
      selectS3Image(state, background?.backgroundUrl)
    );

    useEffect(() => {
      if (background?.backgroundUrl && !s3Image) {
        dispatch(fetchImageFromS3(background.backgroundUrl));
      }
    }, [background?.backgroundUrl, s3Image]);

    const isSmall = size === "small";

    if (!background?.backgroundUrl) {
      return (
        <Box
          sx={{
            width: isSmall ? 120 : "100%",
            height: isSmall ? 120 : "auto",
            maxHeight: isSmall ? 120 : 220,
            aspectRatio: isSmall ? "1/1" : "4/3",
            borderRadius: 2,
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageIcon color="disabled" sx={{ fontSize: isSmall ? 40 : 60 }} />
        </Box>
      );
    }

    if (!s3Image) {
      return (
        <Box
          sx={{
            width: isSmall ? 120 : "100%",
            height: isSmall ? 120 : "auto",
            maxHeight: isSmall ? 120 : 220,
            aspectRatio: isSmall ? "1/1" : "4/3",
            borderRadius: 2,
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={isSmall ? 30 : 40} />
        </Box>
      );
    }

    return (
      <Box
        component="img"
        src={s3Image}
        alt={background.name}
        sx={{
          width: isSmall ? 120 : "100%",
          height: isSmall ? 120 : "auto",
          maxHeight: isSmall ? 120 : 220,
          aspectRatio: isSmall ? "1/1" : "4/3",
          objectFit: "cover",
          borderRadius: 2,
          background: "#f5f5f5",
        }}
      />
    );
  };

  // Lấy tất cả backgrounds khi component mount
  useEffect(() => {
    const initializeData = async () => {
      // Lấy product types
      dispatch(fetchProductTypes({ page: 1, size: 100 })); // Lấy nhiều product types
      
      // Tự động hiển thị tất cả backgrounds khi vào trang
      setShowAll(true);
      setFilterProductType("");
      setFilterAttribute("");
      setFilterAttributeValue("");
      setFilterAttributes([]);
      setFilterAttributeValues([]);
      setPagination({ page: 0, rowsPerPage: 10 });
      const backgroundsRes = await dispatch(fetchAllBackgrounds());
      if (backgroundsRes.payload) setAllBackgrounds(backgroundsRes.payload);
    };
    
    initializeData();
  }, [dispatch]);

  // Lấy danh sách background khi chọn attribute value
  useEffect(() => {
    if (filterAttributeValue) {
      dispatch(fetchBackgroundsByAttributeValueId(filterAttributeValue));
    }
  }, [dispatch, filterAttributeValue]);

  // Hàm xử lý khi bấm nút TẤT CẢ
  const handleShowAll = async () => {
    setShowAll(true);
    setFilterAttributeValue("");
    setFilterAttribute("");
    setFilterProductType("");
    setFilterAttributes([]);
    setFilterAttributeValues([]);
    setIsLoadingFilterAttributes(false);
    setIsLoadingFilterAttributeValues(false);
    setPagination({ page: 0, rowsPerPage: 10 });
    const res = await dispatch(fetchAllBackgrounds());
    if (res.payload) setAllBackgrounds(res.payload);
  };

  // Hàm xử lý khi product type thay đổi
  const handleProductTypeChange = (productTypeId) => {
    setFormData({
      ...formData,
      productTypeId,
      attributeId: "", // Reset attribute khi đổi product type
      attributeValueId: "", // Reset attribute value khi đổi product type
    });
    
    // Clear attributes cũ và fetch attributes mới
    dispatch(clearAttributes());
    dispatch(resetAttributeValue()); // Reset attribute values
    if (productTypeId) {
      dispatch(fetchAttributesByProductTypeId(productTypeId));
    }
  };

  // Hàm xử lý khi attribute thay đổi
  const handleAttributeChange = (attributeId) => {
    setFormData({
      ...formData,
      attributeId,
      attributeValueId: "", // Reset attribute value khi đổi attribute
    });
    
    // Reset và fetch attribute values mới
    dispatch(resetAttributeValue());
    if (attributeId) {
      dispatch(getAttributeValuesByAttributeId({ 
        attributeId, 
        page: 1, 
        size: 100 
      }));
    }
  };

  // Hàm xử lý cascade filter cho product type
  const handleFilterProductTypeChange = async (productTypeId) => {
    setFilterProductType(productTypeId);
    setFilterAttribute("");
    setFilterAttributeValue("");
    setFilterAttributes([]);
    setFilterAttributeValues([]);
    setShowAll(false);
    
    if (productTypeId) {
      setIsLoadingFilterAttributes(true);
      try {
        // Fetch attributes cho product type được chọn
        const attributesRes = await dispatch(fetchAttributesByProductTypeId(productTypeId));
        if (attributesRes.payload) {
          setFilterAttributes(attributesRes.payload);
        }
      } catch (error) {
        console.error('Error fetching attributes:', error);
      } finally {
        setIsLoadingFilterAttributes(false);
      }
    }
  };

  // Hàm xử lý cascade filter cho attribute
  const handleFilterAttributeChange = async (attributeId) => {
    setFilterAttribute(attributeId);
    setFilterAttributeValue("");
    setFilterAttributeValues([]);
    setShowAll(false);
    
    if (attributeId) {
      setIsLoadingFilterAttributeValues(true);
      try {
        // Fetch attribute values cho attribute được chọn
        const attributeValuesRes = await dispatch(getAttributeValuesByAttributeId({ 
          attributeId, 
          page: 1, 
          size: 100 
        }));
        
        if (attributeValuesRes.payload?.attributeValues) {
          setFilterAttributeValues(attributeValuesRes.payload.attributeValues);
        } else if (attributeValuesRes.payload && Array.isArray(attributeValuesRes.payload)) {
          // Fallback nếu cấu trúc khác
          setFilterAttributeValues(attributeValuesRes.payload);
        }
      } catch (error) {
        console.error('Error fetching attribute values:', error);
      } finally {
        setIsLoadingFilterAttributeValues(false);
      }
    }
  };

  // Khi chọn attribute value thì tắt chế độ tất cả
  const handleAttributeValueChange = (e) => {
    const selectedValue = e.target.value;
    setShowAll(false);
    setFilterAttributeValue(selectedValue);
    setPagination({ ...pagination, page: 0 });
    
    // Tự động fetch backgrounds theo attribute value được chọn
    if (selectedValue) {
      dispatch(fetchBackgroundsByAttributeValueId(selectedValue));
    }
  };

  // Mở modal tạo mới
  const handleOpenCreate = () => {
    setFormMode("create");
    setFormData({
      name: "",
      description: "",
      attributeValueId: "",
      productTypeId: "", // Reset productTypeId
      attributeId: "", // Reset attributeId
      backgroundImage: null,
      isAvailable: true,
      id: undefined,
    });
    setImageFile(null);
    setFormError("");
    dispatch(clearAttributes()); // Clear attributes khi mở form mới
    dispatch(resetAttributeValue()); // Reset attribute values
    setOpenForm(true);
  };
  // Mở modal sửa
  const handleOpenEdit = (bg) => {
    setFormMode("edit");
    const productTypeId = bg.attributeValues?.productTypeId || "";
    setFormData({
      name: bg.name,
      description: bg.description,
      attributeValueId: bg.attributeValues?.id || "",
      productTypeId: productTypeId, // Lấy productTypeId từ attributeValues
      attributeId: bg.attributeValues?.attributeId || "", // Thêm attributeId
      isAvailable: bg.isAvailable,
      id: bg.id,
    });
    setImageFile(null);
    setFormError("");
    
    // Load attributes cho product type này khi edit
    dispatch(clearAttributes());
    dispatch(resetAttributeValue()); // Reset attribute values
    if (productTypeId) {
      dispatch(fetchAttributesByProductTypeId(productTypeId));
    }
    
    // Load attribute values nếu có attributeId
    const attributeId = bg.attributeValues?.attributes?.id;
    if (attributeId) {
      dispatch(getAttributeValuesByAttributeId({ 
        attributeId, 
        page: 1, 
        size: 100 
      }));
    }
    
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
    if (!formData.name || !formData.productTypeId || !formData.attributeId || !formData.attributeValueId) {
      setFormError("Vui lòng nhập tên và chọn đầy đủ loại sản phẩm, thuộc tính, giá trị thuộc tính.");
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
        // Tự động làm mới danh sách backgrounds để hiển thị background mới
        if (showAll) {
          // Nếu đang ở chế độ hiển thị tất cả, refresh toàn bộ danh sách
          const backgroundsRes = await dispatch(fetchAllBackgrounds());
          if (backgroundsRes.payload) setAllBackgrounds(backgroundsRes.payload);
        } else if (filterAttributeValue) {
          // Nếu có filter theo attribute value, refresh theo filter đó
          dispatch(fetchBackgroundsByAttributeValueId(filterAttributeValue));
        } else {
          // Mặc định chuyển về chế độ hiển thị tất cả và refresh
          setShowAll(true);
          setFilterAttributeValue("");
          const backgroundsRes = await dispatch(fetchAllBackgrounds());
          if (backgroundsRes.payload) setAllBackgrounds(backgroundsRes.payload);
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
        // Tự động làm mới danh sách backgrounds sau khi cập nhật
        if (showAll) {
          // Nếu đang ở chế độ hiển thị tất cả, refresh toàn bộ danh sách
          const backgroundsRes = await dispatch(fetchAllBackgrounds());
          if (backgroundsRes.payload) setAllBackgrounds(backgroundsRes.payload);
        } else if (filterAttributeValue) {
          // Nếu có filter theo attribute value, refresh theo filter đó
          dispatch(fetchBackgroundsByAttributeValueId(filterAttributeValue));
        } else {
          // Mặc định chuyển về chế độ hiển thị tất cả và refresh
          setShowAll(true);
          setFilterAttributeValue("");
          const backgroundsRes = await dispatch(fetchAllBackgrounds());
          if (backgroundsRes.payload) setAllBackgrounds(backgroundsRes.payload);
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
    if (res.meta.requestStatus === "fulfilled") {
      // Tự động làm mới danh sách backgrounds sau khi xóa
      if (showAll) {
        // Nếu đang ở chế độ hiển thị tất cả, refresh toàn bộ danh sách
        const backgroundsRes = await dispatch(fetchAllBackgrounds());
        if (backgroundsRes.payload) setAllBackgrounds(backgroundsRes.payload);
      } else if (filterAttributeValue) {
        // Nếu có filter theo attribute value, refresh theo filter đó
        dispatch(fetchBackgroundsByAttributeValueId(filterAttributeValue));
      } else {
        // Mặc định chuyển về chế độ hiển thị tất cả và refresh
        setShowAll(true);
        setFilterAttributeValue("");
        const backgroundsRes = await dispatch(fetchAllBackgrounds());
        if (backgroundsRes.payload) setAllBackgrounds(backgroundsRes.payload);
      }
    }
  };
  // Xử lý upload ảnh
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Tính toán backgrounds hiển thị - chỉ filter theo attribute value
  const filteredBackgrounds = showAll
    ? allBackgrounds.filter((bg) => {
        if (
          filterAttributeValue &&
          bg.attributeValues?.id !== filterAttributeValue
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
        {/* Filter thân thiện với người dùng - cascade selection */}
        <Box>
          <Stack 
            direction={{ xs: "column", sm: "row" }} 
            spacing={2} 
            alignItems={{ xs: "stretch", sm: "center" }} 
            flexWrap="wrap"
          >
            <Button
              variant={showAll ? "contained" : "outlined"}
              color="secondary"
              onClick={handleShowAll}
              sx={{ 
                height: 56, 
                minWidth: { xs: "100%", sm: 100 },
                maxWidth: { xs: "100%", sm: "auto" }
              }}
            >
              TẤT CẢ
            </Button>
            
            <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
              <InputLabel>Loại sản phẩm</InputLabel>
              <Select
                value={filterProductType}
                label="Loại sản phẩm"
                onChange={(e) => handleFilterProductTypeChange(e.target.value)}
                disabled={productTypes.length === 0 || productTypeStatus === 'loading'}
              >
                <MenuItem value="">
                  <em>
                    {productTypeStatus === 'loading' 
                      ? "Đang tải..." 
                      : "Chọn loại sản phẩm"
                    }
                  </em>
                </MenuItem>
                {productTypes.map((pt) => (
                  <MenuItem key={pt.id} value={pt.id}>
                    {pt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 } }}>
              <InputLabel>Thuộc tính</InputLabel>
              <Select
                value={filterAttribute}
                label="Thuộc tính"
                onChange={(e) => handleFilterAttributeChange(e.target.value)}
                disabled={!filterProductType || filterAttributes.length === 0 || isLoadingFilterAttributes}
              >
                <MenuItem value="">
                  <em>
                    {!filterProductType 
                      ? "Chọn loại sản phẩm trước" 
                      : isLoadingFilterAttributes
                        ? "Đang tải..."
                        : filterAttributes.length === 0 
                          ? "Không có thuộc tính"
                          : "Chọn thuộc tính"
                    }
                  </em>
                </MenuItem>
                {filterAttributes.map((attr) => (
                  <MenuItem key={attr.id} value={attr.id}>
                    {attr.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
              <InputLabel>Giá trị thuộc tính</InputLabel>
              <Select
                value={filterAttributeValue}
                label="Giá trị thuộc tính"
                onChange={handleAttributeValueChange}
                disabled={!filterAttribute || filterAttributeValues.length === 0 || isLoadingFilterAttributeValues}
              >
                <MenuItem value="">
                  <em>
                    {!filterAttribute 
                      ? "Chọn thuộc tính trước" 
                      : isLoadingFilterAttributeValues
                        ? "Đang tải..."
                        : filterAttributeValues.length === 0 
                          ? "Không có giá trị"
                          : "Chọn giá trị thuộc tính"
                    }
                  </em>
                </MenuItem>
                {filterAttributeValues.map((attrValue) => (
                  <MenuItem key={attrValue.id} value={attrValue.id}>
                    {attrValue.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Nút Clear Filter nếu có filter được áp dụng */}
            {(filterProductType || filterAttribute || filterAttributeValue) && (
              <Tooltip title="Xóa bộ lọc">
                <IconButton 
                  color="secondary" 
                  onClick={handleShowAll}
                  sx={{ 
                    bgcolor: 'grey.100',
                    '&:hover': { bgcolor: 'grey.200' },
                    alignSelf: { xs: "center", sm: "auto" }
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* Hiển thị thông tin số lượng kết quả và breadcrumb filter */}
        <Box display="flex" flexDirection="column" gap={1}>
          {/* Breadcrumb hiển thị path filter hiện tại */}
          {(filterProductType || filterAttribute || filterAttributeValue) && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Đang lọc: 
                {filterProductType && (
                  <Chip 
                    label={productTypes.find(pt => pt.id === filterProductType)?.name || ''} 
                    size="small" 
                    sx={{ ml: 1, mr: 0.5 }}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filterAttribute && (
                  <>
                    <span style={{ margin: '0 4px' }}>→</span>
                    <Chip 
                      label={filterAttributes.find(attr => attr.id === filterAttribute)?.name || ''} 
                      size="small" 
                      sx={{ mr: 0.5 }}
                      color="secondary"
                      variant="outlined"
                    />
                  </>
                )}
                {filterAttributeValue && (
                  <>
                    <span style={{ margin: '0 4px' }}>→</span>
                    <Chip 
                      label={filterAttributeValues.find(av => av.id === filterAttributeValue)?.name || ''} 
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </>
                )}
              </Typography>
            </Box>
          )}
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {showAll 
                ? `Hiển thị tất cả: ${filteredBackgrounds.length} nền mẫu`
                : filterAttributeValue
                  ? `Kết quả tìm kiếm: ${filteredBackgrounds.length} nền mẫu`
                  : `${filteredBackgrounds.length} nền mẫu`
              }
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              disabled={!filterAttributeValue && !showAll}
            >
              Tạo mới
            </Button>
          </Box>
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
                  <BackgroundImage background={bg} />
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
                <BackgroundImage background={selectedBackground} size="small" />
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
              disabled={productTypes.length === 0 || productTypeStatus === 'loading'}
            >
              <InputLabel>Loại sản phẩm</InputLabel>
              <Select
                value={formData.productTypeId}
                label="Loại sản phẩm"
                onChange={(e) => handleProductTypeChange(e.target.value)}
                required
              >
                <MenuItem value="">
                  {productTypeStatus === 'loading' ? "Đang tải..." : "Chọn loại sản phẩm"}
                </MenuItem>
                {productTypes.map((pt) => (
                  <MenuItem key={pt.id} value={pt.id}>
                    {pt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              fullWidth
              margin="normal"
              disabled={!formData.productTypeId || attributes.length === 0}
            >
              <InputLabel>Thuộc tính</InputLabel>
              <Select
                value={formData.attributeId}
                label="Thuộc tính"
                onChange={(e) => handleAttributeChange(e.target.value)}
                required
              >
                <MenuItem value="">
                  {!formData.productTypeId 
                    ? "Chọn loại sản phẩm trước" 
                    : attributeStatus === 'loading' 
                      ? "Đang tải..."
                      : attributes.length === 0 
                        ? "Không có thuộc tính" 
                        : "Chọn thuộc tính"
                  }
                </MenuItem>
                {attributes.map((attr) => (
                  <MenuItem key={attr.id} value={attr.id}>
                    {attr.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              fullWidth
              margin="normal"
              disabled={!formData.attributeId || attributeValues.length === 0}
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
                <MenuItem value="">
                  {!formData.attributeId 
                    ? "Chọn thuộc tính trước" 
                    : attributeValueStatus 
                      ? "Đang tải..."
                      : attributeValues.length === 0 
                        ? "Không có giá trị thuộc tính" 
                        : "Chọn giá trị thuộc tính"
                  }
                </MenuItem>
                {attributeValues.map((attrValue) => (
                  <MenuItem key={attrValue.id} value={attrValue.id}>
                    {attrValue.name}
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
