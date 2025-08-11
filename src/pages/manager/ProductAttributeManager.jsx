import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAttributesByProductTypeId,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  selectAllAttributes,
  selectAttributeStatus,
  resetAttributeStatus,
} from "../../store/features/attribute/attributeSlice";
import { getProductTypesApi } from "../../api/productTypeService";
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
  Collapse, // <-- Add this import
  List, // <-- Also add this import
  ListItem, // <-- Also add this import
  ListItemText, // <-- Also add this import
  Menu,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Close as CloseIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import {
  fetchProductTypeSizesByProductTypeId,
  selectProductTypeSizes,
  selectProductTypeSizesError,
  selectProductTypeSizesStatus,
  resetProductTypeSizesStatus,
} from "../../store/features/productType/productTypeSlice";

const Illustration = () => (
  <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
    <img
      src="https://quangcaotayninh.com.vn/wp-content/uploads/2020/08/logo-quang-cao-tay-ninh-3.png"
      alt="Chọn loại biển hiệu"
      style={{ width: 180, opacity: 0.7 }}
    />
    <Typography variant="h5" fontWeight="bold" mt={2}>
      Chọn loại biển hiệu để xem thuộc tính
    </Typography>
    <Typography color="text.secondary" mt={1}>
      Vui lòng chọn một loại biển hiệu ở bên trái để quản lý thuộc tính.
    </Typography>
  </Box>
);

const ProductAttributeManager = () => {
  const dispatch = useDispatch();
  const attributes = useSelector(selectAllAttributes);
  const status = useSelector(selectAttributeStatus);
  // const error = useSelector(selectAttributeError);
  const [anchorEl, setAnchorEl] = useState(null);
  const [productTypes, setProductTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProductTypeId, setSelectedProductTypeId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", calculateFormula: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const productTypeSizes = useSelector(selectProductTypeSizes);
  const sizesStatus = useSelector(selectProductTypeSizesStatus);
  const sizesError = useSelector(selectProductTypeSizesError);
  const [formulaErrors, setFormulaErrors] = useState([]);
  const [showSizesList, setShowSizesList] = useState(false);
  const formulaRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  useEffect(() => {
    if (openDialog && selectedProductTypeId) {
      dispatch(fetchProductTypeSizesByProductTypeId(selectedProductTypeId));
    }

    // Clean up when dialog closes
    return () => {
      if (!openDialog) {
        dispatch(resetProductTypeSizesStatus());
      }
    };
  }, [openDialog, selectedProductTypeId, dispatch]);
  const insertSizeToFormula = (sizeItem) => {
    // Get cursor position or end of text
    const cursorPosition =
      formulaRef.current?.selectionStart || form.calculateFormula.length;
    const formulaText = form.calculateFormula;

    // Get the size name and process it - add hash prefix, remove spaces and make uppercase
    const originalName = sizeItem.sizes?.name || "SIZE";
    const sizeName = "#" + originalName.toUpperCase().replace(/\s+/g, "");

    // Make sure we don't insert into the #ĐƠN_GIÁ part
    const minPosition = "#ĐƠN_GIÁ".length;
    const safePosition = Math.max(cursorPosition, minPosition);

    const newFormula =
      formulaText.substring(0, safePosition) +
      sizeName +
      formulaText.substring(safePosition);

    setForm({ ...form, calculateFormula: newFormula });

    // Close dropdown
    setShowSizesList(false);

    // Focus back on formula input and position cursor after inserted text
    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          safePosition + sizeName.length,
          safePosition + sizeName.length
        );
      }
    }, 100);
  };

  const insertOperator = (operator) => {
    // Get cursor position or end of text
    const cursorPosition =
      formulaRef.current?.selectionStart || form.calculateFormula.length;
    const formulaText = form.calculateFormula;

    // Make sure we don't insert into the #ĐƠN_GIÁ part
    const minPosition = "#ĐƠN_GIÁ".length;
    const safePosition = Math.max(cursorPosition, minPosition);

    // Insert the operator at the cursor position
    const newFormula =
      formulaText.substring(0, safePosition) +
      ` ${operator} ` +
      formulaText.substring(safePosition);

    setForm({ ...form, calculateFormula: newFormula });

    // Focus back on formula input and position cursor after inserted operator
    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          safePosition + operator.length + 2, // +2 for the spaces before and after
          safePosition + operator.length + 2
        );
      }
    }, 100);
  };
  const validateFormula = (formula) => {
    // Initialize validation state
    let errors = [];

    // Check for adjacent size variables without operators between them
    const sizeVarPattern = /#[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸĐ0-9]+/g;
    const sizeVars = formula.match(sizeVarPattern) || [];

    // Find positions of all size variables in the string
    const sizePositions = [];
    let match;
    const regex = new RegExp(sizeVarPattern);
    while ((match = regex.exec(formula)) !== null) {
      sizePositions.push({
        start: match.index,
        end: match.index + match[0].length,
        var: match[0],
      });
    }

    // Check if any size variables are adjacent (without operators between them)
    for (let i = 0; i < sizePositions.length - 1; i++) {
      const current = sizePositions[i];
      const next = sizePositions[i + 1];

      const textBetween = formula.substring(current.end, next.start).trim();
      if (!textBetween || !/[+\-*\/()]/.test(textBetween)) {
        errors.push(`Cần phép tính giữa ${current.var} và ${next.var}`);
      }
    }

    // Check for balanced parentheses
    let parenCount = 0;
    for (let i = 0; i < formula.length; i++) {
      if (formula[i] === "(") parenCount++;
      if (formula[i] === ")") parenCount--;

      // If at any point we have more closing than opening parentheses
      if (parenCount < 0) {
        errors.push("Dấu ngoặc đóng không có dấu ngoặc mở tương ứng");
        break;
      }
    }

    // If we end with unmatched parentheses
    if (parenCount > 0) {
      errors.push("Dấu ngoặc mở không có dấu ngoặc đóng tương ứng");
    }

    // Check for single operators (++, --, etc.)
    const operatorPattern = /[+\-*\/]{2,}/g;
    if (operatorPattern.test(formula)) {
      errors.push("Không được có hai phép tính liền nhau");
    }

    // Check for empty parentheses ()
    if (formula.includes("()")) {
      errors.push("Không được có dấu ngoặc rỗng ()");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

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
      dispatch(fetchAttributesByProductTypeId(selectedProductTypeId));
    }
  }, [dispatch, selectedProductTypeId]);

  // Lọc loại biển hiệu theo search
  const filteredProductTypes = productTypes.filter((pt) =>
    pt.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({ name: "", calculateFormula: "#ĐƠN_GIÁ * " });
    setOpenDialog(true);
  };
  const handleOpenEdit = (attr) => {
    setEditMode(true);
    // If the formula doesn't already have #ĐƠN_GIÁ, prepend it
    let formula = attr.calculateFormula || "";
    if (!formula.includes("#ĐƠN_GIÁ")) {
      formula = "#ĐƠN_GIÁ * " + formula;
    }
    setForm({ name: attr.name, calculateFormula: formula });
    setSelectedId(attr.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm({ name: "", calculateFormula: "" });
    setSelectedId(null);
    dispatch(resetAttributeStatus());
  };

  const handleChange = (e) => {
    if (e.target.name === "name") {
      // Convert all text to uppercase
      const uppercaseValue = e.target.value.toUpperCase();
      setForm({ ...form, [e.target.name]: uppercaseValue });
    } else {
      // For other fields, keep the normal behavior
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };
  const handleFormulaChange = (e) => {
    const newValue = e.target.value;

    // Check if #ĐƠN_GIÁ is still in the formula
    if (!newValue.includes("#ĐƠN_GIÁ")) {
      // If not, add it back
      setForm({ ...form, calculateFormula: "#ĐƠN_GIÁ * " });
      return;
    }

    // Update the form with the new value
    setForm({ ...form, calculateFormula: newValue });

    // Validate the formula and set any errors
    const validation = validateFormula(newValue);
    setFormulaErrors(validation.errors);
  };
  const handleSubmit = () => {
    if (!selectedProductTypeId) return;

    // Convert name to uppercase to ensure consistency
    const uppercaseName = form.name.toUpperCase();
    let formula = form.calculateFormula;
    if (!formula.includes("#ĐƠN_GIÁ")) {
      formula = "#ĐƠN_GIÁ * " + formula;
    }
    const validation = validateFormula(formula);
    if (!validation.isValid) {
      setFormulaErrors(validation.errors);
      return; // Don't submit if there are validation errors
    }
    const data = {
      name: uppercaseName,
      calculateFormula: formula,
      isAvailable: true,
      isCore: true,
    };

    if (editMode) {
      dispatch(updateAttribute({ attributeId: selectedId, data }))
        .unwrap()
        .then(() =>
          setSnackbar({
            open: true,
            message: "Cập nhật thành công!",
            severity: "success",
          })
        )
        .catch((err) =>
          setSnackbar({ open: true, message: err, severity: "error" })
        );
    } else {
      dispatch(createAttribute({ productTypeId: selectedProductTypeId, data }))
        .unwrap()
        .then(() =>
          setSnackbar({
            open: true,
            message: "Thêm thành công!",
            severity: "success",
          })
        )
        .catch((err) =>
          setSnackbar({ open: true, message: err, severity: "error" })
        );
    }
    setFormulaErrors([]);
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteAttribute(deleteId))
      .unwrap()
      .then(() =>
        setSnackbar({
          open: true,
          message: "Xóa thành công!",
          severity: "success",
        })
      )
      .catch((err) =>
        setSnackbar({ open: true, message: err, severity: "error" })
      );
    setConfirmDelete(false);
    setDeleteId(null);
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
      {/* Main Content: Attribute Table */}
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
            onClick={handleOpenAdd}
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
                  <TableCell sx={{ fontWeight: 700 }}>Công thức tính</TableCell>
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
                          alt="No attribute"
                          style={{ width: 120, opacity: 0.6 }}
                        />
                        <Typography color="text.secondary" mt={2}>
                          Chưa có thuộc tính nào cho loại biển hiệu này.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  attributes.map((attr) => (
                    <TableRow
                      key={attr.id}
                      hover
                      sx={{
                        transition: "background 0.2s",
                        ":hover": { bgcolor: "#f1f8e9" },
                      }}
                    >
                      <TableCell>{attr.name}</TableCell>
                      <TableCell>{attr.calculateFormula}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Sửa">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEdit(attr)}
                            sx={{ borderRadius: 2 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(attr.id)}
                            sx={{ borderRadius: 2 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
              {editMode ? "Sửa thuộc tính" : "Thêm thuộc tính"}
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
              {/* Phần tên thuộc tính */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="500"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Tên thuộc tính
                </Typography>
                <TextField
                  autoFocus
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  placeholder="Nhập tên thuộc tính"
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      fontSize: "1rem",
                    },
                  }}
                  helperText="Tên thuộc tính sẽ tự động chuyển thành CHỮ HOA"
                  FormHelperTextProps={{
                    sx: {
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      mt: 0.5,
                    },
                  }}
                />
              </Box>

              {/* Phần công thức tính */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="500"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Công thức tính
                </Typography>
                <TextField
                  name="calculateFormula"
                  value={form.calculateFormula}
                  onChange={handleFormulaChange}
                  fullWidth
                  multiline
                  rows={3}
                  inputRef={formulaRef}
                  variant="outlined"
                  placeholder="Nhập công thức tính"
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      fontFamily: "monospace",
                      fontSize: "1rem",
                    },
                  }}
                  error={formulaErrors.length > 0}
                  helperText={
                    formulaErrors.length > 0 ? (
                      <Typography
                        color="error"
                        variant="caption"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {formulaErrors.join(". ")}
                      </Typography>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        Công thức luôn phải chứa #ĐƠN_GIÁ
                      </Typography>
                    )
                  }
                  FormHelperTextProps={{
                    sx: { fontSize: "0.75rem" },
                  }}
                />
              </Box>

              {/* Phần các nút chức năng */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  flexWrap: "wrap",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#f5f9ff",
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

                  {/* Nút chọn kích thước */}
                  <Button
                    variant="outlined"
                    size="medium"
                    color="primary"
                    onClick={() => setShowSizesList(!showSizesList)}
                    startIcon={
                      showSizesList ? (
                        <ArrowDropUpIcon />
                      ) : (
                        <ArrowDropDownIcon />
                      )
                    }
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontWeight: 500,
                      boxShadow: showSizesList
                        ? "0 2px 5px rgba(0,0,0,0.08)"
                        : "none",
                      bgcolor: showSizesList
                        ? "rgba(25, 118, 210, 0.04)"
                        : "transparent",
                    }}
                  >
                    Chọn kích thước
                  </Button>

                  {/* Dropdown phép tính */}
                  <Box sx={{ position: "relative" }}>
                    <Button
                      variant="outlined"
                      size="medium"
                      color="secondary"
                      endIcon={<ArrowDropDownIcon />}
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                      }}
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

              {/* Dropdown kích thước */}
              <Collapse in={showSizesList} sx={{ width: "100%" }}>
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
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Đang tải kích thước...
                      </Typography>
                    </Box>
                  )}

                  {sizesStatus === "failed" && (
                    <Box p={3}>
                      <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                        {sizesError || "Không thể tải kích thước"}
                      </Alert>
                    </Box>
                  )}

                  {sizesStatus === "succeeded" &&
                    productTypeSizes.length === 0 && (
                      <Box p={3} textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                          Không có kích thước cho loại biển hiệu này
                        </Typography>
                      </Box>
                    )}

                  {sizesStatus === "succeeded" &&
                    productTypeSizes.length > 0 && (
                      <List>
                        {productTypeSizes.map((sizeItem) => (
                          <ListItem
                            key={sizeItem.id}
                            button
                            divider
                            onClick={() => insertSizeToFormula(sizeItem)}
                            sx={{
                              "&:hover": {
                                bgcolor: "rgba(25, 118, 210, 0.04)",
                              },
                              py: 1.5,
                            }}
                          >
                            <ListItemText
                              primary={sizeItem.sizes?.name || "Không có tên"}
                              secondary={
                                sizeItem.sizes
                                  ? `${sizeItem.sizes.width || "N/A"} × ${
                                      sizeItem.sizes.height || "N/A"
                                    } ${sizeItem.sizes.unit || "cm"}`
                                  : "Không có thông tin kích thước"
                              }
                              primaryTypographyProps={{
                                fontWeight: "500",
                                variant: "body1",
                              }}
                              secondaryTypographyProps={{
                                variant: "caption",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                </Paper>
              </Collapse>

              {/* Ví dụ công thức */}
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
                  <Typography component="span" variant="caption">
                    #ĐƠN_GIÁ * #CAO * #RONG
                  </Typography>
                  <Typography component="span" variant="caption">
                    #ĐƠN_GIÁ * (#CAO + #RONG) * 2
                  </Typography>
                  <Typography component="span" variant="caption">
                    #ĐƠN_GIÁ * #CAO * #RONG * 2.5
                  </Typography>
                </Box>
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
              sx={{
                borderRadius: 1.5,
                px: 3,
                boxShadow: "0 3px 5px 0 rgba(76,175,80,0.3)",
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              {editMode ? "Lưu thay đổi" : "Thêm thuộc tính"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn xóa thuộc tính này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
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

export default ProductAttributeManager;
