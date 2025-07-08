import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  ListItemText,
  ListItemButton,
  List,
  ListItem,
  Avatar,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Collapse,
  Menu,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import {
  fetchCostTypes,
  createCostType,
  fetchCostTypesByProductTypeId, // Thêm import này
  selectCostTypes,
  selectCostTypesLoading,
  selectCostTypesError,
  selectCostTypesPagination,
  selectProductTypeCostTypes, // Thêm import này
  selectProductTypeCostTypesStatus, // Thêm import này
  selectProductTypeCostTypesError, // Thêm import này
  clearError,
  clearProductTypeCostTypes, // Thêm import này
} from "../../store/features/costype/costypeSlice";
import {
  fetchProductTypes,
  selectAllProductTypes,
  selectProductTypeStatus,
} from "../../store/features/productType/productTypeSlice";
import {
  fetchAttributesByProductTypeId,
  selectAllAttributes,
  selectAttributeStatus,
} from "../../store/features/attribute/attributeSlice";
import {
  fetchProductTypeSizesByProductTypeId,
  selectProductTypeSizes,
  selectProductTypeSizesStatus,
} from "../../store/features/productType/productTypeSlice";

const CostTypeManager = () => {
  const dispatch = useDispatch();

  // Redux state
  const costTypes = useSelector(selectCostTypes);
  const loading = useSelector(selectCostTypesLoading);
  const error = useSelector(selectCostTypesError);
  const pagination = useSelector(selectCostTypesPagination);

  // Product Types state
  const productTypes = useSelector(selectAllProductTypes);
  const productTypesStatus = useSelector(selectProductTypeStatus);

  // Attributes state (for isCore = true)
  const attributes = useSelector(selectAllAttributes);
  const attributeStatus = useSelector(selectAttributeStatus);

  // Product Type Sizes state (for isCore = true)
  const productTypeSizes = useSelector(selectProductTypeSizes);
  const sizesStatus = useSelector(selectProductTypeSizesStatus);

  // Product Type Cost Types state (for isCore = false)
  const productTypeCostTypes = useSelector(selectProductTypeCostTypes);
  const productTypeCostTypesStatus = useSelector(
    selectProductTypeCostTypesStatus
  );
  const productTypeCostTypesError = useSelector(
    selectProductTypeCostTypesError
  );

  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogStep, setDialogStep] = useState(0);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [productTypeSearchTerm, setProductTypeSearchTerm] = useState("");
  const [newCostType, setNewCostType] = useState({
    name: "",
    description: "",
    formula: "",
    priority: 1,
    isCore: false,
    isAvailable: true,
  });

  // Formula builder state
  const [showAttributes, setShowAttributes] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const formulaRef = useRef(null);

  const steps = ["Chọn loại sản phẩm", "Nhập thông tin chi phí"];

  // Fetch data on component mount and when page/size changes
  useEffect(() => {
    dispatch(
      fetchCostTypes({
        page: page + 1,
        size: rowsPerPage,
      })
    );
  }, [dispatch, page, rowsPerPage]);

  // Fetch product types when dialog opens
  useEffect(() => {
    if (openDialog && productTypes.length === 0) {
      dispatch(fetchProductTypes({ page: 1, size: 100 }));
    }
  }, [dispatch, openDialog, productTypes.length]);

  // Fetch attributes/sizes/costTypes when product type is selected and isCore changes
  useEffect(() => {
    if (selectedProductType && dialogStep === 1) {
      if (newCostType.isCore) {
        // Fetch sizes and attributes for formula building (isCore = true)
        dispatch(fetchProductTypeSizesByProductTypeId(selectedProductType.id));
        dispatch(fetchAttributesByProductTypeId(selectedProductType.id));
      } else {
        // Fetch cost types của product type đã chọn (isCore = false)
        dispatch(fetchCostTypesByProductTypeId(selectedProductType.id));
      }
    }
  }, [dispatch, selectedProductType, newCostType.isCore, dialogStep]);

  // Clear product type cost types when dialog closes
  useEffect(() => {
    if (!openDialog) {
      dispatch(clearProductTypeCostTypes());
    }
  }, [dispatch, openDialog]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter cost types based on search term
  const filteredCostTypes = costTypes.filter(
    (costType) =>
      costType.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      costType.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      costType.formula?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter product types based on search term
  const filteredProductTypes = productTypes.filter(
    (productType) =>
      productType.name
        ?.toLowerCase()
        .includes(productTypeSearchTerm.toLowerCase()) ||
      productType.description
        ?.toLowerCase()
        .includes(productTypeSearchTerm.toLowerCase())
  );

  // Handle refresh
  const handleRefresh = () => {
    dispatch(clearError());
    dispatch(
      fetchCostTypes({
        page: page + 1,
        size: rowsPerPage,
      })
    );
  };

  // Handle dialog open
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setDialogStep(0);
    setSelectedProductType(null);
    setProductTypeSearchTerm("");
    setNewCostType({
      name: "",
      description: "",
      formula: "",
      priority: 1,
      isCore: false,
      isAvailable: true,
    });
    setShowAttributes(false);
    setShowSizes(false);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogStep(0);
    setSelectedProductType(null);
    setShowAttributes(false);
    setShowSizes(false);
  };

  // Handle form input change
  const handleInputChange = (field, value) => {
    setNewCostType((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset formula when switching between core/non-core
    if (field === "isCore") {
      setNewCostType((prev) => ({
        ...prev,
        [field]: value,
        formula: "", // Reset formula
      }));
      setShowAttributes(false);
      setShowSizes(false);
    }
  };

  // Handle product type selection
  const handleProductTypeSelect = (productType) => {
    setSelectedProductType(productType);
  };

  // Handle next step
  const handleNextStep = () => {
    if (selectedProductType) {
      setDialogStep(1);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setDialogStep(0);
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      await dispatch(
        createCostType({
          productTypeId: selectedProductType.id,
          costTypeData: {
            name: newCostType.name,
            description: newCostType.description,
            formula: newCostType.formula,
            priority: newCostType.priority,
            isCore: newCostType.isCore,
            isAvailable: newCostType.isAvailable,
          },
        })
      ).unwrap();

      console.log("Tạo loại chi phí thành công!");
      handleCloseDialog();

      dispatch(
        fetchCostTypes({
          page: page + 1,
          size: rowsPerPage,
        })
      );
    } catch (error) {
      console.error("Lỗi khi tạo loại chi phí:", error);
    }
  };

  // Formula builder functions
  const insertAttributeToFormula = (attribute) => {
    const attributeName = `#${attribute.name
      .toUpperCase()
      .replace(/\s+/g, "")}`;
    const cursorPosition =
      formulaRef.current?.selectionStart || newCostType.formula.length;
    const formulaText = newCostType.formula;

    const newFormula =
      formulaText.substring(0, cursorPosition) +
      attributeName +
      formulaText.substring(cursorPosition);

    setNewCostType((prev) => ({
      ...prev,
      formula: newFormula,
    }));

    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          cursorPosition + attributeName.length,
          cursorPosition + attributeName.length
        );
      }
    }, 100);
  };

  const insertSizeToFormula = (sizeItem) => {
    const sizeName = `#${sizeItem.sizes.name
      .toUpperCase()
      .replace(/\s+/g, "")}`;
    const cursorPosition =
      formulaRef.current?.selectionStart || newCostType.formula.length;
    const formulaText = newCostType.formula;

    const newFormula =
      formulaText.substring(0, cursorPosition) +
      sizeName +
      formulaText.substring(cursorPosition);

    setNewCostType((prev) => ({
      ...prev,
      formula: newFormula,
    }));

    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          cursorPosition + sizeName.length,
          cursorPosition + sizeName.length
        );
      }
    }, 100);
  };

  const insertCostTypeToFormula = (costType) => {
    const costTypeName = `#${costType.name.toUpperCase().replace(/\s+/g, "")}`;
    const cursorPosition =
      formulaRef.current?.selectionStart || newCostType.formula.length;
    const formulaText = newCostType.formula;

    const newFormula =
      formulaText.substring(0, cursorPosition) +
      costTypeName +
      formulaText.substring(cursorPosition);

    setNewCostType((prev) => ({
      ...prev,
      formula: newFormula,
    }));

    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          cursorPosition + costTypeName.length,
          cursorPosition + costTypeName.length
        );
      }
    }, 100);
  };

  const insertOperator = (operator) => {
    const cursorPosition =
      formulaRef.current?.selectionStart || newCostType.formula.length;
    const formulaText = newCostType.formula;

    const newFormula =
      formulaText.substring(0, cursorPosition) +
      ` ${operator} ` +
      formulaText.substring(cursorPosition);

    setNewCostType((prev) => ({
      ...prev,
      formula: newFormula,
    }));

    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          cursorPosition + operator.length + 2,
          cursorPosition + operator.length + 2
        );
      }
    }, 100);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render product type selection step
  const renderProductTypeSelection = () => (
    <>
      <Typography
        variant="h6"
        sx={{ mb: 3, color: "#2e7d32", textAlign: "center" }}
      >
        Chọn loại sản phẩm để tạo chi phí
      </Typography>

      <TextField
        fullWidth
        placeholder="Tìm kiếm loại sản phẩm..."
        value={productTypeSearchTerm}
        onChange={(e) => setProductTypeSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Paper
        sx={{ maxHeight: 400, overflow: "auto", border: "1px solid #e0e0e0" }}
      >
        {productTypesStatus === "loading" ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Đang tải danh sách loại sản phẩm...
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredProductTypes.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="Không tìm thấy loại sản phẩm nào"
                  sx={{ textAlign: "center", color: "text.secondary" }}
                />
              </ListItem>
            ) : (
              filteredProductTypes.map((productType) => (
                <ListItem key={productType.id} disablePadding>
                  <ListItemButton
                    selected={selectedProductType?.id === productType.id}
                    onClick={() => handleProductTypeSelect(productType)}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "rgba(46, 125, 50, 0.12)",
                        "&:hover": {
                          backgroundColor: "rgba(46, 125, 50, 0.2)",
                        },
                      },
                      "&:hover": {
                        backgroundColor: "rgba(46, 125, 50, 0.08)",
                      },
                    }}
                  >
                    <Checkbox
                      checked={selectedProductType?.id === productType.id}
                      sx={{ mr: 2 }}
                    />
                    <Avatar
                      sx={{ mr: 2, bgcolor: "#2e7d32", width: 50, height: 50 }}
                    >
                      {productType.name.charAt(0)}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {productType.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {productType.description || "Không có mô tả"}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        )}
      </Paper>

      {selectedProductType && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            ✓ Đã chọn: <strong>{selectedProductType.name}</strong>
          </Typography>
        </Alert>
      )}
    </>
  );

  // Render cost type form step
  const renderCostTypeForm = () => (
    <>
      {selectedProductType && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Tạo chi phí cho loại sản phẩm:{" "}
            <strong>{selectedProductType.name}</strong>
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Tên loại chi phí */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Tên loại chi phí"
            value={newCostType.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />
        </Grid>

        {/* Độ ưu tiên */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Độ ưu tiên"
            type="number"
            value={newCostType.priority}
            onChange={(e) =>
              handleInputChange("priority", parseInt(e.target.value))
            }
            inputProps={{ min: 1 }}
          />
        </Grid>

        {/* Mô tả */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Mô tả"
            multiline
            rows={3}
            value={newCostType.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
        </Grid>

        {/* Chi phí cốt lõi - Đặt trước công thức */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={newCostType.isCore}
                onChange={(e) => handleInputChange("isCore", e.target.checked)}
                color="warning"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Chi phí cốt lõi
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {newCostType.isCore
                    ? "Sử dụng thuộc tính & kích thước"
                    : "Sử dụng các loại chi phí hiện có"}
                </Typography>
              </Box>
            }
          />
        </Grid>

        {/* Đang hoạt động */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={newCostType.isAvailable}
                onChange={(e) =>
                  handleInputChange("isAvailable", e.target.checked)
                }
              />
            }
            label="Đang hoạt động"
          />
        </Grid>

        {/* Công thức tính */}
        <Grid item xs={12}>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight="500"
              sx={{ mb: 1, color: "text.primary" }}
            >
              Công thức tính toán
            </Typography>
            <TextField
              name="formula"
              value={newCostType.formula}
              onChange={(e) => handleInputChange("formula", e.target.value)}
              inputRef={formulaRef}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Nhập công thức tính toán"
              InputProps={{
                sx: {
                  borderRadius: 1.5,
                  fontFamily: "monospace",
                  fontSize: "1rem",
                },
              }}
              helperText={
                newCostType.isCore
                  ? "Chi phí cốt lõi: Sử dụng thuộc tính và kích thước để tạo công thức"
                  : "Chi phí thường: Sử dụng các loại chi phí hiện có của loại sản phẩm này"
              }
              FormHelperTextProps={{
                sx: {
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  mt: 0.5,
                },
              }}
            />
          </Box>
        </Grid>

        {/* Công cụ hỗ trợ */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              flexWrap: "wrap",
              p: 2,
              borderRadius: 2,
              bgcolor: newCostType.isCore ? "#fff3e0" : "#f3e5f5",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "center",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="500"
              >
                Công cụ hỗ trợ:
              </Typography>

              {/* Nút chọn thuộc tính (cho isCore = true) */}
              {newCostType.isCore && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowAttributes(!showAttributes)}
                  startIcon={
                    showAttributes ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                  }
                  sx={{
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 500,
                    boxShadow: showAttributes
                      ? "0 2px 5px rgba(0,0,0,0.08)"
                      : "none",
                    bgcolor: showAttributes
                      ? "rgba(25, 118, 210, 0.04)"
                      : "transparent",
                  }}
                >
                  {showAttributes ? "Ẩn thuộc tính" : "Chọn thuộc tính"}
                </Button>
              )}

              {/* Nút chọn kích thước (cho isCore = true) */}
              {newCostType.isCore && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setShowSizes(!showSizes)}
                  startIcon={
                    showSizes ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                  }
                  sx={{
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 500,
                    boxShadow: showSizes
                      ? "0 2px 5px rgba(0,0,0,0.08)"
                      : "none",
                    bgcolor: showSizes
                      ? "rgba(156, 39, 176, 0.04)"
                      : "transparent",
                  }}
                >
                  {showSizes ? "Ẩn kích thước" : "Xem kích thước"}
                </Button>
              )}

              {/* Nút chọn loại chi phí (cho isCore = false) */}
              {!newCostType.isCore && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => setShowAttributes(!showAttributes)}
                  startIcon={
                    showAttributes ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                  }
                  sx={{
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 500,
                    boxShadow: showAttributes
                      ? "0 2px 5px rgba(0,0,0,0.08)"
                      : "none",
                    bgcolor: showAttributes
                      ? "rgba(255, 152, 0, 0.04)"
                      : "transparent",
                  }}
                >
                  {showAttributes ? "Ẩn loại chi phí" : "Chọn loại chi phí"}
                </Button>
              )}

              {/* Dropdown phép tính */}
              <Box sx={{ position: "relative" }}>
                <Button
                  variant="outlined"
                  size="medium"
                  color="info"
                  endIcon={<ArrowDropDownIcon />}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Phép tính
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{
                    sx: {
                      boxShadow: "0px 5px 15px rgba(0,0,0,0.08)",
                      borderRadius: 2,
                      width: 180,
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      insertOperator("+");
                      setAnchorEl(null);
                    }}
                    sx={{ py: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: "bold" }}
                    >
                      + (Cộng)
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      insertOperator("-");
                      setAnchorEl(null);
                    }}
                    sx={{ py: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: "bold" }}
                    >
                      - (Trừ)
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      insertOperator("*");
                      setAnchorEl(null);
                    }}
                    sx={{ py: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: "bold" }}
                    >
                      * (Nhân)
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      insertOperator("/");
                      setAnchorEl(null);
                    }}
                    sx={{ py: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: "bold" }}
                    >
                      / (Chia)
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      insertOperator("(");
                      setAnchorEl(null);
                    }}
                    sx={{ py: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: "bold" }}
                    >
                      (
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      insertOperator(")");
                      setAnchorEl(null);
                    }}
                    sx={{ py: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: "bold" }}
                    >
                      )
                    </Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Danh sách thuộc tính (cho isCore = true) */}
        {newCostType.isCore && (
          <Grid item xs={12}>
            <Collapse in={showAttributes} sx={{ width: "100%" }}>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 250,
                  overflow: "auto",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: 2,
                }}
              >
                {attributeStatus === "loading" && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={3}
                  >
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Đang tải thuộc tính...
                    </Typography>
                  </Box>
                )}

                {attributeStatus === "failed" && (
                  <Box p={3}>
                    <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                      Không thể tải thuộc tính
                    </Alert>
                  </Box>
                )}

                {attributeStatus === "succeeded" && attributes.length === 0 && (
                  <Box p={3} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Không có thuộc tính cho loại biển hiệu này
                    </Typography>
                  </Box>
                )}

                {attributeStatus === "succeeded" && attributes.length > 0 && (
                  <List>
                    {attributes.map((attribute) => (
                      <ListItem
                        key={attribute.id}
                        component="div"
                        divider
                        onClick={() => insertAttributeToFormula(attribute)}
                        sx={{
                          "&:hover": {
                            bgcolor: "rgba(25, 118, 210, 0.04)",
                            cursor: "pointer",
                          },
                          py: 1.5,
                        }}
                      >
                        <ListItemText
                          primary={attribute.name}
                          primaryTypographyProps={{
                            fontWeight: "500",
                            variant: "body1",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Collapse>
          </Grid>
        )}

        {/* Danh sách kích thước (cho isCore = true) */}
        {newCostType.isCore && (
          <Grid item xs={12}>
            <Collapse in={showSizes} sx={{ width: "100%" }}>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 250,
                  overflow: "auto",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: 2,
                }}
              >
                {sizesStatus === "loading" && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={3}
                  >
                    <CircularProgress
                      size={24}
                      sx={{ mr: 1 }}
                      color="secondary"
                    />
                    <Typography variant="body2">
                      Đang tải kích thước...
                    </Typography>
                  </Box>
                )}

                {sizesStatus === "failed" && (
                  <Box p={3}>
                    <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                      Không thể tải kích thước
                    </Alert>
                  </Box>
                )}

                {sizesStatus === "succeeded" &&
                  productTypeSizes.length === 0 && (
                    <Box p={3} textAlign="center">
                      <Typography variant="body2" color="text.secondary">
                        Không có kích thước nào cho loại biển hiệu này
                      </Typography>
                    </Box>
                  )}

                {sizesStatus === "succeeded" && productTypeSizes.length > 0 && (
                  <List>
                    {productTypeSizes.map((sizeItem) => {
                      const sizeData = sizeItem.sizes || {};
                      return (
                        <ListItem
                          key={sizeItem.id}
                          component="div"
                          divider
                          onClick={() => insertSizeToFormula(sizeItem)}
                          sx={{
                            py: 1.5,
                            "&:hover": {
                              bgcolor: "rgba(156, 39, 176, 0.04)",
                              cursor: "pointer",
                            },
                          }}
                        >
                          <ListItemText
                            primary={sizeData.name || "Không xác định"}
                            primaryTypographyProps={{
                              fontWeight: "500",
                              variant: "body1",
                            }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Paper>
            </Collapse>
          </Grid>
        )}

        {/* Danh sách loại chi phí của product type (cho isCore = false) */}
        {!newCostType.isCore && (
          <Grid item xs={12}>
            <Collapse in={showAttributes} sx={{ width: "100%" }}>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 250,
                  overflow: "auto",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: 2,
                }}
              >
                {productTypeCostTypesStatus === "loading" && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={3}
                  >
                    <CircularProgress
                      size={24}
                      sx={{ mr: 1 }}
                      color="warning"
                    />
                    <Typography variant="body2">
                      Đang tải loại chi phí của {selectedProductType?.name}...
                    </Typography>
                  </Box>
                )}

                {productTypeCostTypesStatus === "failed" && (
                  <Box p={3}>
                    <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                      Không thể tải loại chi phí: {productTypeCostTypesError}
                    </Alert>
                  </Box>
                )}

                {productTypeCostTypesStatus === "succeeded" &&
                  productTypeCostTypes.length === 0 && (
                    <Box p={3} textAlign="center">
                      <Typography variant="body2" color="text.secondary">
                        Chưa có loại chi phí nào cho loại sản phẩm{" "}
                        <strong>{selectedProductType?.name}</strong>
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Hãy tạo chi phí cốt lõi trước khi tạo chi phí thường
                      </Typography>
                    </Box>
                  )}

                {productTypeCostTypesStatus === "succeeded" &&
                  productTypeCostTypes.length > 0 && (
                    <List>
                      {productTypeCostTypes.map((costType) => (
                        <ListItem
                          key={costType.id}
                          component="div"
                          divider
                          onClick={() => insertCostTypeToFormula(costType)}
                          sx={{
                            "&:hover": {
                              bgcolor: "rgba(255, 152, 0, 0.04)",
                              cursor: "pointer",
                            },
                            py: 1.5,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography variant="body1" fontWeight="500">
                                  {costType.name}
                                </Typography>
                                {costType.isCore && (
                                  <Chip
                                    label="Cốt lõi"
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                )}
                                <Chip
                                  label={`Độ ưu tiên: ${costType.priority}`}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block" }}
                                >
                                  {costType.description || "Không có mô tả"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontFamily: "monospace",
                                    mt: 0.5,
                                    display: "block",
                                  }}
                                >
                                  Công thức:{" "}
                                  {costType.formula || "Chưa có công thức"}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
              </Paper>
            </Collapse>
          </Grid>
        )}

        {/* Thông tin và ví dụ */}
        <Grid item xs={12}>
          <Box sx={{ mt: 1, bgcolor: "#f9fbe7", p: 2, borderRadius: 2 }}>
            <Typography
              component="div"
              variant="subtitle2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 18, mr: 1 }} />
              Ví dụ công thức
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                "& > span": {
                  bgcolor: "rgba(0,0,0,0.04)",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                },
              }}
            >
              {newCostType.isCore ? (
                <>
                  <Typography component="span" variant="caption">
                    #CAO * #RONG * #SOLUONG
                  </Typography>
                  <Typography component="span" variant="caption">
                    (#CAO + #RONG) * 2 * #DONGIA
                  </Typography>
                </>
              ) : (
                <>
                  <Typography component="span" variant="caption">
                    #VẬTTƯ + #NHÂNCÔNG
                  </Typography>
                  <Typography component="span" variant="caption">
                    #VẬTTƯ * 1.2 + #NHÂNCÔNG
                  </Typography>
                  <Typography component="span" variant="caption">
                    (#VẬTTƯ + #NHÂNCÔNG + #VẬNHÀNH) * 0.25
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "#2e7d32", mb: 1 }}
        >
          Quản lý loại chi phí
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý các loại chi phí trong hệ thống
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {pagination.totalElements || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng loại chi phí
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {costTypes.filter((ct) => ct.isAvailable).length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đang hoạt động
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {costTypes.filter((ct) => ct.isCore).length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chi phí cốt lõi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {pagination.totalPages || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số trang
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          placeholder="Tìm kiếm loại chi phí..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ backgroundColor: "#2e7d32" }}
            onClick={handleOpenDialog}
          >
            Thêm loại chi phí
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Tên loại chi phí
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Mô tả
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Công thức
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Độ ưu tiên
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Loại sản phẩm
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Ngày tạo
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Đang tải dữ liệu...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredCostTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm
                        ? "Không tìm thấy kết quả phù hợp"
                        : "Không có dữ liệu"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCostTypes.map((costType) => (
                  <TableRow key={costType.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {costType.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {costType.description || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", maxWidth: 150 }}
                      >
                        {costType.formula || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={costType.priority}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Chip
                          label={
                            costType.isAvailable
                              ? "Hoạt động"
                              : "Không hoạt động"
                          }
                          color={costType.isAvailable ? "success" : "error"}
                          size="small"
                        />
                        {costType.isCore && (
                          <Chip
                            label="Cốt lõi"
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {costType.productTypes?.name || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(costType.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          color="primary"
                        >
                          Sửa
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          color="error"
                        >
                          Xóa
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.totalElements || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>

      {/* Multi-step Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#2e7d32",
            color: "white",
          }}
        >
          <Typography variant="h6">
            {dialogStep === 0 ? "Chọn loại sản phẩm" : "Tạo loại chi phí mới"}
          </Typography>
          <Button
            onClick={handleCloseDialog}
            sx={{ color: "white", minWidth: "auto", p: 1 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {/* Stepper */}
          <Stepper activeStep={dialogStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Conditional rendering based on step */}
          {dialogStep === 0
            ? renderProductTypeSelection()
            : renderCostTypeForm()}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>

          {dialogStep === 1 && (
            <Button
              onClick={handlePreviousStep}
              startIcon={<ArrowBackIcon />}
              color="inherit"
            >
              Quay lại
            </Button>
          )}

          {dialogStep === 0 ? (
            <Button
              onClick={handleNextStep}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{ backgroundColor: "#2e7d32" }}
              disabled={!selectedProductType}
            >
              Tiếp theo
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ backgroundColor: "#2e7d32" }}
              disabled={!newCostType.name || loading}
            >
              {loading ? <CircularProgress size={20} /> : "Tạo loại chi phí"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CostTypeManager;
