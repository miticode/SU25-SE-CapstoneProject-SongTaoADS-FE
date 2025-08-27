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
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import {
  fetchBackgroundsByAttributeValueId,
  createBackgroundByAttributeValueId,
  updateBackgroundInfo,
  updateBackgroundImage,
  toggleBackgroundStatus,
  selectAllBackgroundSuggestions,
  selectBackgroundStatus,
  selectBackgroundError,
  selectSelectedBackground,
  selectBackgroundPagination,
  selectAllBackgroundsPagination,
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
  const backgroundPagination = useSelector(selectBackgroundPagination);
  const allBackgroundsPagination = useSelector(selectAllBackgroundsPagination);
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
  const [isLoadingFilterAttributes, setIsLoadingFilterAttributes] =
    useState(false);
  const [isLoadingFilterAttributeValues, setIsLoadingFilterAttributeValues] =
    useState(false);

  // State cho product types trong form
  const allProductTypes = useSelector(selectAllProductTypes) || [];
  const productTypeStatus = useSelector(selectProductTypeStatus);

  // Filter chỉ lấy product types có isAiGenerated = false
  const productTypes = allProductTypes.filter(
    (pt) => pt.isAiGenerated === false
  );

  // State cho attributes trong form
  const attributes = useSelector(selectAllAttributes) || [];
  const attributeStatus = useSelector(selectAttributeStatus);

  // State cho attribute values trong form
  const attributeValues =
    useSelector((state) => state.attributeValue.attributeValues) || [];
  const attributeValueStatus = useSelector(
    (state) => state.attributeValue.isLoading
  );

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
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    background: null,
  });
  const FIXED_PAGE_SIZE = 10; // số item mỗi trang cố định
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: FIXED_PAGE_SIZE,
  });

  // Thêm state để biết có đang ở chế độ tất cả không
  const [showAll, setShowAll] = useState(false);
  // Server pagination: không cần state allBackgrounds nữa

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
      setPagination({ page: 0, rowsPerPage: FIXED_PAGE_SIZE });
      await dispatch(fetchAllBackgrounds({ page: 1, size: FIXED_PAGE_SIZE }));
    };

    initializeData();
  }, [dispatch]);

  // Lấy danh sách background khi chọn attribute value
  useEffect(() => {
    if (filterAttributeValue) {
      dispatch(
        fetchBackgroundsByAttributeValueId({
          attributeValueId: filterAttributeValue,
          page: pagination.page + 1,
          size: pagination.rowsPerPage,
        })
      );
    } else if (showAll) {
      dispatch(
        fetchAllBackgrounds({
          page: pagination.page + 1,
          size: pagination.rowsPerPage,
        })
      );
    }
  }, [
    dispatch,
    filterAttributeValue,
    pagination.page,
    pagination.rowsPerPage,
    showAll,
  ]);

  // Clamp current page in showAll mode when data length changes (e.g. after delete) or page size changes
  // Clamp when totalPages from server changes
  useEffect(() => {
    const totalPages = showAll
      ? allBackgroundsPagination.totalPages
      : backgroundPagination.totalPages;
    if (pagination.page > totalPages - 1) {
      setPagination((prev) => ({ ...prev, page: Math.max(0, totalPages - 1) }));
    }
  }, [
    showAll,
    allBackgroundsPagination.totalPages,
    backgroundPagination.totalPages,
    pagination.page,
  ]);

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
    setPagination({ page: 0, rowsPerPage: FIXED_PAGE_SIZE });
    await dispatch(fetchAllBackgrounds({ page: 1, size: FIXED_PAGE_SIZE }));
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
      dispatch(
        getAttributeValuesByAttributeId({
          attributeId,
          page: 1,
          size: 100,
        })
      );
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
        const attributesRes = await dispatch(
          fetchAttributesByProductTypeId(productTypeId)
        );
        if (attributesRes.payload) {
          setFilterAttributes(attributesRes.payload);
        }
      } catch (error) {
        console.error("Error fetching attributes:", error);
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
        const attributeValuesRes = await dispatch(
          getAttributeValuesByAttributeId({
            attributeId,
            page: 1,
            size: 100,
          })
        );

        if (attributeValuesRes.payload?.attributeValues) {
          setFilterAttributeValues(attributeValuesRes.payload.attributeValues);
        } else if (
          attributeValuesRes.payload &&
          Array.isArray(attributeValuesRes.payload)
        ) {
          // Fallback nếu cấu trúc khác
          setFilterAttributeValues(attributeValuesRes.payload);
        }
      } catch (error) {
        console.error("Error fetching attribute values:", error);
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
      dispatch(
        fetchBackgroundsByAttributeValueId({
          attributeValueId: selectedValue,
          page: 1,
          size: pagination.rowsPerPage,
        })
      );
    } else {
      // If cleared selection switch to all mode page 1
      if (showAll) {
        dispatch(
          fetchAllBackgrounds({ page: 1, size: pagination.rowsPerPage })
        );
      }
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

    // Load attributes và attribute values để hiển thị thông tin (chỉ để hiển thị, không để edit)
    dispatch(clearAttributes());
    dispatch(resetAttributeValue());
    if (productTypeId) {
      dispatch(fetchAttributesByProductTypeId(productTypeId));
    }

    // Load attribute values nếu có attributeId
    const attributeId = bg.attributeValues?.attributes?.id;
    if (attributeId) {
      dispatch(
        getAttributeValuesByAttributeId({
          attributeId,
          page: 1,
          size: 100,
        })
      );
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
  // Toggle trạng thái background
  const handleToggleStatus = (bg) => {
    setToggleDialog({
      open: true,
      background: bg,
    });
  };

  const handleConfirmToggleStatus = async () => {
    const background = toggleDialog.background;
    const res = await dispatch(
      toggleBackgroundStatus({
        backgroundId: background.id,
        backgroundData: background,
      })
    );

    if (res.meta.requestStatus === "fulfilled") {
      // Refresh lại danh sách
      if (showAll) {
        dispatch(
          fetchAllBackgrounds({
            page: pagination.page + 1,
            size: pagination.rowsPerPage,
          })
        );
      } else if (filterAttributeValue) {
        dispatch(
          fetchBackgroundsByAttributeValueId({
            attributeValueId: filterAttributeValue,
            page: pagination.page + 1,
            size: pagination.rowsPerPage,
          })
        );
      }
    }
    setToggleDialog({ open: false, background: null });
  };
  // Xử lý submit form tạo/sửa
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validation khác nhau giữa create và edit mode
    if (formMode === "create") {
      if (
        !formData.name ||
        !formData.productTypeId ||
        !formData.attributeId ||
        !formData.attributeValueId
      ) {
        setFormError(
          "Vui lòng nhập tên và chọn đầy đủ loại sản phẩm, thuộc tính, giá trị thuộc tính."
        );
        return;
      }
    } else {
      // Edit mode chỉ validate tên
      if (!formData.name) {
        setFormError("Vui lòng nhập tên nền.");
        return;
      }
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
          await dispatch(
            fetchAllBackgrounds({ page: 1, size: pagination.rowsPerPage })
          );
        } else if (filterAttributeValue) {
          // Nếu có filter theo attribute value, refresh theo filter đó (reset to page 1)
          dispatch(
            fetchBackgroundsByAttributeValueId({
              attributeValueId: filterAttributeValue,
              page: 1,
              size: pagination.rowsPerPage,
            })
          );
          setPagination((prev) => ({ ...prev, page: 0 }));
        } else {
          // Mặc định chuyển về chế độ hiển thị tất cả và refresh
          setShowAll(true);
          setFilterAttributeValue("");
          await dispatch(
            fetchAllBackgrounds({ page: 1, size: pagination.rowsPerPage })
          );
          setPagination((prev) => ({ ...prev, page: 0 }));
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
          await dispatch(
            fetchAllBackgrounds({
              page: pagination.page + 1,
              size: pagination.rowsPerPage,
            })
          );
        } else if (filterAttributeValue) {
          dispatch(
            fetchBackgroundsByAttributeValueId({
              attributeValueId: filterAttributeValue,
              page: pagination.page + 1,
              size: pagination.rowsPerPage,
            })
          );
        } else {
          // Mặc định chuyển về chế độ hiển thị tất cả và refresh
          setShowAll(true);
          setFilterAttributeValue("");
          await dispatch(
            fetchAllBackgrounds({ page: 1, size: pagination.rowsPerPage })
          );
          setPagination((prev) => ({ ...prev, page: 0 }));
        }
      } else {
        setFormError(res.payload || "Cập nhật thất bại");
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
  const filteredBackgrounds = backgrounds; // now backgrounds always holds current page data

  // Helper tạo danh sách số trang với dấu '...'
  const getPageNumbers = (current, total, maxLength = 7) => {
    if (total <= maxLength) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const leftWidth = 2;
    const rightWidth = 2;
    if (current <= maxLength - rightWidth - 1) {
      return [
        ...Array.from({ length: maxLength - 2 }, (_, i) => i + 1),
        "...",
        total,
      ];
    }
    if (current >= total - (maxLength - leftWidth - 2)) {
      return [
        1,
        "...",
        ...Array.from(
          { length: maxLength - 2 },
          (_, i) => total - (maxLength - 2) + i
        ),
      ];
    }
    return [
      1,
      "...",
      ...Array.from(
        { length: leftWidth + rightWidth + 1 },
        (_, i) => current - leftWidth + i
      ),
      "...",
      total,
    ];
  };

  const totalPages = showAll
    ? allBackgroundsPagination.totalPages || 1
    : backgroundPagination.totalPages || 1;
  const pageNumbers = getPageNumbers(pagination.page + 1, totalPages);

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
                maxWidth: { xs: "100%", sm: "auto" },
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
                disabled={
                  productTypes.length === 0 || productTypeStatus === "loading"
                }
              >
                <MenuItem value="">
                  <em>
                    {productTypeStatus === "loading"
                      ? "Đang tải..."
                      : "Chọn loại sản phẩm"}
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
                disabled={
                  !filterProductType ||
                  filterAttributes.length === 0 ||
                  isLoadingFilterAttributes
                }
              >
                <MenuItem value="">
                  <em>
                    {!filterProductType
                      ? "Chọn loại sản phẩm trước"
                      : isLoadingFilterAttributes
                      ? "Đang tải..."
                      : filterAttributes.length === 0
                      ? "Không có thuộc tính"
                      : "Chọn thuộc tính"}
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
                disabled={
                  !filterAttribute ||
                  filterAttributeValues.length === 0 ||
                  isLoadingFilterAttributeValues
                }
              >
                <MenuItem value="">
                  <em>
                    {!filterAttribute
                      ? "Chọn thuộc tính trước"
                      : isLoadingFilterAttributeValues
                      ? "Đang tải..."
                      : filterAttributeValues.length === 0
                      ? "Không có giá trị"
                      : "Chọn giá trị thuộc tính"}
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
                    bgcolor: "grey.100",
                    "&:hover": { bgcolor: "grey.200" },
                    alignSelf: { xs: "center", sm: "auto" },
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
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Đang lọc:
                {filterProductType && (
                  <Chip
                    label={
                      productTypes.find((pt) => pt.id === filterProductType)
                        ?.name || ""
                    }
                    size="small"
                    sx={{ ml: 1, mr: 0.5 }}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filterAttribute && (
                  <>
                    <span style={{ margin: "0 4px" }}>→</span>
                    <Chip
                      label={
                        filterAttributes.find(
                          (attr) => attr.id === filterAttribute
                        )?.name || ""
                      }
                      size="small"
                      sx={{ mr: 0.5 }}
                      color="secondary"
                      variant="outlined"
                    />
                  </>
                )}
                {filterAttributeValue && (
                  <>
                    <span style={{ margin: "0 4px" }}>→</span>
                    <Chip
                      label={
                        filterAttributeValues.find(
                          (av) => av.id === filterAttributeValue
                        )?.name || ""
                      }
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </>
                )}
              </Typography>
            </Box>
          )}

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" color="text.secondary">
              {showAll
                ? `Trang ${allBackgroundsPagination.currentPage}/${allBackgroundsPagination.totalPages} - Tổng ${allBackgroundsPagination.totalElements} nền`
                : filterAttributeValue
                ? `Trang ${backgroundPagination.currentPage}/${backgroundPagination.totalPages} - Tổng ${backgroundPagination.totalElements} nền`
                : `Tổng ${backgrounds.length} nền`}
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
          {filteredBackgrounds.map((bg) => (
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
                  <Stack direction="row" spacing={1} alignItems="center" mt={1}>
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
                    <IconButton color="info" onClick={() => handleOpenEdit(bg)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={bg.isAvailable ? "Tạm ẩn" : "Hiển thị"}>
                    <IconButton
                      color={bg.isAvailable ? "error" : "success"}
                      onClick={() => handleToggleStatus(bg)}
                    >
                      {bg.isAvailable ? <ToggleOnIcon /> : <ToggleOffIcon />}
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Box mt={4} display="flex" justifyContent="center">
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            disabled={pagination.page === 0}
            onClick={() => {
              if (pagination.page > 0) {
                const newPage = pagination.page - 1;
                setPagination((prev) => ({ ...prev, page: newPage }));
                if (!showAll && filterAttributeValue) {
                  dispatch(
                    fetchBackgroundsByAttributeValueId({
                      attributeValueId: filterAttributeValue,
                      page: newPage + 1,
                      size: pagination.rowsPerPage,
                    })
                  );
                }
              }
            }}
          >
            Trước
          </Button>
          {pageNumbers.map((p, idx) =>
            p === "..." ? (
              <Button
                key={idx}
                variant="text"
                size="small"
                disabled
                sx={{ minWidth: 36 }}
              >
                …
              </Button>
            ) : (
              <Button
                key={idx}
                variant={p === pagination.page + 1 ? "contained" : "outlined"}
                color={p === pagination.page + 1 ? "primary" : "inherit"}
                size="small"
                sx={{ minWidth: 40 }}
                onClick={() => {
                  const newPage = p - 1;
                  if (newPage !== pagination.page) {
                    setPagination((prev) => ({ ...prev, page: newPage }));
                    if (!showAll && filterAttributeValue) {
                      dispatch(
                        fetchBackgroundsByAttributeValueId({
                          attributeValueId: filterAttributeValue,
                          page: newPage + 1,
                          size: pagination.rowsPerPage,
                        })
                      );
                    }
                  }
                }}
              >
                {p}
              </Button>
            )
          )}
          <Button
            variant="outlined"
            size="small"
            disabled={pagination.page >= totalPages - 1}
            onClick={() => {
              if (pagination.page < totalPages - 1) {
                const newPage = pagination.page + 1;
                setPagination((prev) => ({ ...prev, page: newPage }));
                if (!showAll && filterAttributeValue) {
                  dispatch(
                    fetchBackgroundsByAttributeValueId({
                      attributeValueId: filterAttributeValue,
                      page: newPage + 1,
                      size: pagination.rowsPerPage,
                    })
                  );
                }
              }
            }}
          >
            Sau
          </Button>
        </Stack>
      </Box>
      {/* Modal chi tiết với Tailwind CSS */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-2xl shadow-2xl",
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <VisibilityIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold">Chi tiết Nền Mẫu</h2>
              <p className="text-indigo-100 text-sm">
                Xem thông tin chi tiết nền mẫu
              </p>
            </div>
          </div>
        </DialogTitle>

        <DialogContent className="p-6 bg-gray-50">
          {selectedBackground ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  {/* Image */}
                  <div className="flex-shrink-0 mb-4 lg:mb-0">
                    <div className="w-full lg:w-48">
                      <BackgroundImage
                        background={selectedBackground}
                        size="small"
                      />
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <Typography
                        variant="h5"
                        className="font-bold text-gray-800 mb-2"
                      >
                        {selectedBackground.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="text-gray-600 leading-relaxed"
                      >
                        {selectedBackground.description || "Không có mô tả"}
                      </Typography>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Chip
                        label={
                          selectedBackground.isAvailable
                            ? "Đang hiển thị"
                            : "Đã ẩn"
                        }
                        color={
                          selectedBackground.isAvailable ? "success" : "default"
                        }
                        className="font-medium"
                        icon={
                          selectedBackground.isAvailable ? (
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          ) : (
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Information */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Thông tin phân loại
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      Loại sản phẩm
                    </p>
                    <p className="text-blue-800 font-semibold">
                      {selectedBackground.attributeValues?.productType?.name ||
                        "Không xác định"}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-green-600 mb-1">
                      Thuộc tính
                    </p>
                    <p className="text-green-800 font-semibold">
                      {selectedBackground.attributeValues?.attributes?.name ||
                        "Không xác định"}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-sm font-medium text-purple-600 mb-1">
                      Giá trị thuộc tính
                    </p>
                    <p className="text-purple-800 font-semibold">
                      {selectedBackground.attributeValues?.name ||
                        "Không xác định"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Thông tin bổ sung
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      ID Nền mẫu
                    </p>
                    <p className="text-gray-800 font-mono bg-gray-100 px-3 py-1 rounded">
                      {selectedBackground.id}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      Trạng thái
                    </p>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          selectedBackground.isAvailable
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                      <span className="text-gray-800 font-medium">
                        {selectedBackground.isAvailable
                          ? "Hiển thị công khai"
                          : "Đã bị ẩn"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <CircularProgress className="text-blue-500" />
            </div>
          )}
        </DialogContent>

        <DialogActions className="bg-white p-6 border-t border-gray-200">
          <Button
            onClick={handleCloseDetail}
            variant="contained"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-lg px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal tạo/sửa với Tailwind CSS */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-2xl shadow-2xl",
        }}
      >
        {/* Header với gradient */}
        <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {formMode === "create" ? <AddIcon /> : <EditIcon />}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {formMode === "create"
                  ? "Tạo Nền Mẫu Mới"
                  : "Chỉnh Sửa Nền Mẫu"}
              </h2>
              <p className="text-blue-100 text-sm">
                {formMode === "create"
                  ? "Tạo nền mẫu cho quảng cáo của bạn"
                  : "Cập nhật thông tin nền mẫu"}
              </p>
            </div>
          </div>
        </DialogTitle>

        <form onSubmit={handleSubmitForm}>
          <DialogContent className="p-6 bg-gray-50">
            <div className="space-y-6">
              {/* Error Alert */}
              {formError && (
                <Alert severity="error" className="rounded-lg shadow-sm">
                  {formError}
                </Alert>
              )}

              {/* Basic Information Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Thông tin cơ bản
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <TextField
                      label="Tên nền mẫu"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      fullWidth
                      required
                      variant="outlined"
                      className="bg-white"
                      InputProps={{
                        className: "rounded-lg",
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <TextField
                      label="Mô tả"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      className="bg-white"
                      InputProps={{
                        className: "rounded-lg",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Create Mode - Category Selection */}
              {formMode === "create" && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Phân loại sản phẩm
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Product Type */}
                    <div className="space-y-2">
                      <FormControl
                        fullWidth
                        variant="outlined"
                        disabled={
                          productTypes.length === 0 ||
                          productTypeStatus === "loading"
                        }
                      >
                        <InputLabel className="text-gray-600">
                          Loại sản phẩm
                        </InputLabel>
                        <Select
                          value={formData.productTypeId}
                          label="Loại sản phẩm"
                          onChange={(e) =>
                            handleProductTypeChange(e.target.value)
                          }
                          required
                          className="bg-white rounded-lg"
                        >
                          <MenuItem value="">
                            <em className="text-gray-500">
                              {productTypeStatus === "loading"
                                ? "Đang tải..."
                                : "Chọn loại sản phẩm"}
                            </em>
                          </MenuItem>
                          {productTypes.map((pt) => (
                            <MenuItem key={pt.id} value={pt.id}>
                              <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                                <span>{pt.name}</span>
                              </div>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>

                    {/* Attribute */}
                    <div className="space-y-2">
                      <FormControl
                        fullWidth
                        variant="outlined"
                        disabled={
                          !formData.productTypeId || attributes.length === 0
                        }
                      >
                        <InputLabel className="text-gray-600">
                          Thuộc tính
                        </InputLabel>
                        <Select
                          value={formData.attributeId}
                          label="Thuộc tính"
                          onChange={(e) =>
                            handleAttributeChange(e.target.value)
                          }
                          required
                          className="bg-white rounded-lg"
                        >
                          <MenuItem value="">
                            <em className="text-gray-500">
                              {!formData.productTypeId
                                ? "Chọn loại sản phẩm trước"
                                : attributeStatus === "loading"
                                ? "Đang tải..."
                                : attributes.length === 0
                                ? "Không có thuộc tính"
                                : "Chọn thuộc tính"}
                            </em>
                          </MenuItem>
                          {attributes.map((attr) => (
                            <MenuItem key={attr.id} value={attr.id}>
                              <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                                <span>{attr.name}</span>
                              </div>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>

                    {/* Attribute Value */}
                    <div className="space-y-2">
                      <FormControl
                        fullWidth
                        variant="outlined"
                        disabled={
                          !formData.attributeId || attributeValues.length === 0
                        }
                      >
                        <InputLabel className="text-gray-600">
                          Giá trị thuộc tính
                        </InputLabel>
                        <Select
                          value={formData.attributeValueId}
                          label="Giá trị thuộc tính"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              attributeValueId: e.target.value,
                            })
                          }
                          required
                          className="bg-white rounded-lg"
                        >
                          <MenuItem value="">
                            <em className="text-gray-500">
                              {!formData.attributeId
                                ? "Chọn thuộc tính trước"
                                : attributeValueStatus
                                ? "Đang tải..."
                                : attributeValues.length === 0
                                ? "Không có giá trị thuộc tính"
                                : "Chọn giá trị thuộc tính"}
                            </em>
                          </MenuItem>
                          {attributeValues.map((attrValue) => (
                            <MenuItem key={attrValue.id} value={attrValue.id}>
                              <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
                                <span>{attrValue.name}</span>
                              </div>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Availability Toggle - Only in Edit Mode */}
                  {formMode === "edit" && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-800">
                          Trạng thái hiển thị
                        </p>
                        <p className="text-sm text-gray-600">
                          {formData.isAvailable
                            ? "Nền mẫu đang được hiển thị"
                            : "Nền mẫu đang bị ẩn"}
                        </p>
                      </div>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isAvailable}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isAvailable: e.target.checked,
                              })
                            }
                            color="primary"
                            size="medium"
                          />
                        }
                        label=""
                        className="ml-4"
                      />
                    </div>
                  )}

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <p className="font-medium text-gray-800">
                      {formMode === "create"
                        ? "Upload hình ảnh nền"
                        : "Thay đổi hình ảnh"}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<ImageIcon />}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {formMode === "create" ? "Chọn ảnh" : "Thay đổi ảnh"}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </Button>

                      {imageFile && (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                          <ImageIcon
                            className="text-green-600"
                            fontSize="small"
                          />
                          <Typography className="text-green-700 font-medium text-sm">
                            {imageFile.name}
                          </Typography>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Hỗ trợ: JPG, PNG, GIF. Kích thước tối đa: 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>

          {/* Footer Actions */}
          <DialogActions className="bg-white p-6 border-t border-gray-200">
            <div className="gap-3.5 flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-3 sm:justify-end">
              <Button
                onClick={handleCloseForm}
                variant="outlined"
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-6 py-2"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg px-8 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                startIcon={formMode === "create" ? <AddIcon /> : <EditIcon />}
              >
                {formMode === "create" ? "Tạo nền mẫu" : "Lưu thay đổi"}
              </Button>
            </div>
          </DialogActions>
        </form>
      </Dialog>
      {/* Modal xác nhận toggle trạng thái với Tailwind CSS */}
      <Dialog
        open={toggleDialog.open}
        onClose={() => setToggleDialog({ open: false, background: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          className: "rounded-2xl shadow-2xl",
        }}
      >
        <DialogTitle
          className={`text-white ${
            toggleDialog.background?.isAvailable
              ? "bg-gradient-to-r from-red-500 to-pink-500"
              : "bg-gradient-to-r from-green-500 to-emerald-500"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {toggleDialog.background?.isAvailable ? (
                <ToggleOffIcon />
              ) : (
                <ToggleOnIcon />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {toggleDialog.background?.isAvailable
                  ? "Ẩn nền mẫu"
                  : "Hiển thị nền mẫu"}
              </h2>
              <p
                className={`text-sm ${
                  toggleDialog.background?.isAvailable
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
          {toggleDialog.background && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  toggleDialog.background.isAvailable
                    ? "bg-red-100"
                    : "bg-green-100"
                }`}
              >
                {toggleDialog.background.isAvailable ? (
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
                  {toggleDialog.background.isAvailable ? "ẩn" : "hiển thị"}
                  nền mẫu "<strong>{toggleDialog.background.name}</strong>"?
                </Typography>
                <Typography
                  className={`text-sm p-3 rounded-lg ${
                    toggleDialog.background.isAvailable
                      ? "text-yellow-800 bg-yellow-50 border border-yellow-200"
                      : "text-blue-800 bg-blue-50 border border-blue-200"
                  }`}
                >
                  {toggleDialog.background.isAvailable
                    ? "⚠️ Nền mẫu sẽ được ẩn khỏi danh sách hiển thị cho người dùng."
                    : "ℹ️ Nền mẫu sẽ được hiển thị trở lại cho người dùng."}
                </Typography>
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={() => setToggleDialog({ open: false, background: null })}
              variant="outlined"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg py-2"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmToggleStatus}
              variant="contained"
              className={`flex-1 text-white rounded-lg py-2 shadow-md hover:shadow-lg transition-all duration-300 ${
                toggleDialog.background?.isAvailable
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              }`}
              startIcon={
                toggleDialog.background?.isAvailable ? (
                  <ToggleOffIcon />
                ) : (
                  <ToggleOnIcon />
                )
              }
            >
              {toggleDialog.background?.isAvailable
                ? "Ẩn nền mẫu"
                : "Hiển thị nền mẫu"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackgroundManager;
