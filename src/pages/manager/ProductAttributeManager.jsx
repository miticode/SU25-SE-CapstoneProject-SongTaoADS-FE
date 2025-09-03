import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAttributesByProductTypeId,
  createAttribute,
  updateAttribute,
  toggleAttributeStatus,
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
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Close as CloseIcon,
  InfoOutlined as InfoOutlinedIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
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
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    attribute: null,
  });
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

    // Get the size name and process it - add hash prefix, replace spaces with underscores and make uppercase
    const originalName = sizeItem.sizes?.name || "SIZE";
    const sizeName = "#" + originalName.toUpperCase().replace(/\s+/g, "_");

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
      if (!textBetween || !/[+\-*/()]/.test(textBetween)) {
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
    const operatorPattern = /[+\-*/]{2,}/g;
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

  const handleToggleStatus = (attribute) => {
    setToggleDialog({ open: true, attribute });
  };

  const handleConfirmToggleStatus = () => {
    const attribute = toggleDialog.attribute;
    setToggleDialog({ open: false, attribute: null });

    dispatch(
      toggleAttributeStatus({
        attributeId: attribute.id,
        attributeData: {
          name: attribute.name,
          calculateFormula: attribute.calculateFormula,
          isAvailable: attribute.isAvailable,
          isCore: attribute.isCore,
        },
      })
    )
      .unwrap()
      .then(() =>
        setSnackbar({
          open: true,
          message: `${
            attribute.isAvailable ? "Ẩn" : "Hiển thị"
          } thuộc tính thành công!`,
          severity: "success",
        })
      )
      .catch((err) =>
        setSnackbar({ open: true, message: err, severity: "error" })
      );
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
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
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
                      <TableCell>
                        <Chip
                          label={attr.isAvailable ? "Hiển thị" : "Ẩn"}
                          color={attr.isAvailable ? "warning" : "error"}
                          size="small"
                        />
                      </TableCell>
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
                        <Tooltip
                          title={attr.isAvailable ? "Tạm ẩn" : "Hiển thị"}
                        >
                          <IconButton
                            onClick={() => handleToggleStatus(attr)}
                            sx={{
                              borderRadius: 2,
                              color: attr.isAvailable ? "#EAB308" : "#EF4444",
                              "&:hover": {
                                color: attr.isAvailable ? "#CA8A04" : "#DC2626",
                                backgroundColor: attr.isAvailable
                                  ? "rgba(234,179,8,0.12)"
                                  : "rgba(239,68,68,0.12)",
                              },
                            }}
                          >
                            {attr.isAvailable ? (
                              <ToggleOffIcon fontSize="small" />
                            ) : (
                              <ToggleOnIcon fontSize="small" />
                            )}
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
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-4 py-6 sm:px-6">
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
                  {editMode ? "Sửa thuộc tính" : "Thêm thuộc tính"}
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
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            <div className="space-y-6">
              {/* Tên thuộc tính */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                  Tên thuộc tính <span className="text-red-500">*</span>
                </label>
                <TextField
                  autoFocus
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  placeholder="Nhập tên thuộc tính"
                  className="rounded-xl"
                  InputProps={{
                    className: "rounded-xl shadow-sm",
                    sx: {
                      "& fieldset": {
                        borderColor: "#d1d5db",
                      },
                      "&:hover fieldset": {
                        borderColor: "#10b981",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#10b981",
                      },
                    },
                  }}
                  helperText={
                    <span className="text-xs text-gray-500 mt-1">
                      Tên thuộc tính sẽ tự động chuyển thành CHỮ HOA
                    </span>
                  }
                />
              </div>

              {/* Công thức tính */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                  Công thức tính <span className="text-red-500">*</span>
                </label>
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
                  className="rounded-xl"
                  InputProps={{
                    className: "rounded-xl shadow-sm font-mono",
                    sx: {
                      "& fieldset": {
                        borderColor:
                          formulaErrors.length > 0 ? "#ef4444" : "#d1d5db",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          formulaErrors.length > 0 ? "#dc2626" : "#10b981",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor:
                          formulaErrors.length > 0 ? "#dc2626" : "#10b981",
                      },
                    },
                  }}
                  error={formulaErrors.length > 0}
                />
                {/* Error and helper text */}
                <div className="mt-2 space-y-1">
                  {formulaErrors.length > 0 ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 text-red-500 mt-0.5">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-red-800">
                            Lỗi công thức
                          </h4>
                          <ul className="text-sm text-red-700 mt-1 list-disc list-inside space-y-0.5">
                            {formulaErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Công thức luôn phải chứa #ĐƠN_GIÁ
                    </p>
                  )}
                </div>
              </div>

              {/* Công cụ hỗ trợ */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 lg:p-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  Công cụ hỗ trợ
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Nút chọn kích thước */}
                  <button
                    type="button"
                    onClick={() => setShowSizesList(!showSizesList)}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                      showSizesList
                        ? "bg-blue-100 border-blue-300 text-blue-700 shadow-md"
                        : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                  >
                    {showSizesList ? (
                      <ArrowDropUpIcon className="w-5 h-5" />
                    ) : (
                      <ArrowDropDownIcon className="w-5 h-5" />
                    )}
                    <span>Chọn kích thước</span>
                  </button>

                  {/* Dropdown phép tính */}
                  <div className="relative flex-1 sm:flex-none">
                    <button
                      type="button"
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-xl transition-all duration-200 font-medium"
                    >
                      <span>Phép tính</span>
                      <ArrowDropDownIcon className="w-5 h-5" />
                    </button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => setAnchorEl(null)}
                      PaperProps={{
                        className:
                          "!shadow-2xl !border !border-gray-100 !rounded-2xl !mt-2",
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          insertOperator("+");
                          setAnchorEl(null);
                        }}
                        className="!py-3 hover:!bg-green-50"
                      >
                        <Typography className="!font-mono !font-bold">
                          + (Cộng)
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          insertOperator("-");
                          setAnchorEl(null);
                        }}
                        className="!py-3 hover:!bg-red-50"
                      >
                        <Typography className="!font-mono !font-bold">
                          - (Trừ)
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          insertOperator("*");
                          setAnchorEl(null);
                        }}
                        className="!py-3 hover:!bg-blue-50"
                      >
                        <Typography className="!font-mono !font-bold">
                          * (Nhân)
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          insertOperator("/");
                          setAnchorEl(null);
                        }}
                        className="!py-3 hover:!bg-orange-50"
                      >
                        <Typography className="!font-mono !font-bold">
                          / (Chia)
                        </Typography>
                      </MenuItem>
                      <Divider />
                      <MenuItem
                        onClick={() => {
                          insertOperator("(");
                          setAnchorEl(null);
                        }}
                        className="!py-3 hover:!bg-gray-50"
                      >
                        <Typography className="!font-mono !font-bold">
                          (
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          insertOperator(")");
                          setAnchorEl(null);
                        }}
                        className="!py-3 hover:!bg-gray-50"
                      >
                        <Typography className="!font-mono !font-bold">
                          )
                        </Typography>
                      </MenuItem>
                    </Menu>
                  </div>
                </div>
              </div>

              {/* Dropdown kích thước */}
              <Collapse in={showSizesList} className="w-full">
                <div className="border-2 border-blue-100 rounded-2xl bg-blue-50 overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {sizesStatus === "loading" && (
                      <div className="flex items-center justify-center p-8">
                        <CircularProgress
                          size={24}
                          className="text-blue-600 mr-3"
                        />
                        <Typography className="!text-blue-700">
                          Đang tải kích thước...
                        </Typography>
                      </div>
                    )}

                    {sizesStatus === "failed" && (
                      <div className="p-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                          <Typography className="!text-red-600">
                            {sizesError || "Không thể tải kích thước"}
                          </Typography>
                        </div>
                      </div>
                    )}

                    {sizesStatus === "succeeded" &&
                      productTypeSizes.length === 0 && (
                        <div className="p-8 text-center">
                          <Typography className="!text-blue-600">
                            Không có kích thước cho loại biển hiệu này
                          </Typography>
                        </div>
                      )}

                    {sizesStatus === "succeeded" &&
                      productTypeSizes.length > 0 && (
                        <div className="divide-y divide-blue-100">
                          {productTypeSizes.map((sizeItem) => (
                            <div
                              key={sizeItem.id}
                              onClick={() => insertSizeToFormula(sizeItem)}
                              className="p-4 cursor-pointer hover:bg-blue-100 transition-colors duration-200 flex items-center justify-between"
                            >
                              <div>
                                <Typography className="!font-medium !text-blue-800">
                                  {sizeItem.sizes?.name || "Không có tên"}
                                </Typography>
                                <Typography className="!text-sm !text-blue-600 !mt-1">
                                  {sizeItem.sizes
                                    ? `${sizeItem.sizes.width || "N/A"} × ${
                                        sizeItem.sizes.height || "N/A"
                                      } ${sizeItem.sizes.unit || "cm"}`
                                    : "Không có thông tin kích thước"}
                                </Typography>
                              </div>
                              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </Collapse>

              {/* Ví dụ công thức */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 lg:p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <InfoOutlinedIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-3">
                      💡 Ví dụ công thức
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-2 bg-green-100 rounded-lg font-mono text-sm text-green-700 border border-green-200">
                        #ĐƠN_GIÁ * #CHIỀU_CAO * #CHIỀU_RỘNG
                      </span>
                      <span className="px-3 py-2 bg-green-100 rounded-lg font-mono text-sm text-green-700 border border-green-200">
                        #ĐƠN_GIÁ * (#CHIỀU_CAO + #CHIỀU_RỘNG) * 2
                      </span>
                      <span className="px-3 py-2 bg-green-100 rounded-lg font-mono text-sm text-green-700 border border-green-200">
                        #ĐƠN_GIÁ * #CHIỀU_CAO * #CHIỀU_RỘNG * 2.5
                      </span>
                    </div>
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
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={formulaErrors.length > 0 || !form.name.trim()}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  formulaErrors.length > 0 || !form.name.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : editMode
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {editMode ? "Lưu thay đổi" : "Thêm thuộc tính"}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
      {/* Modal xác nhận toggle trạng thái với Tailwind CSS */}
      <Dialog
        open={toggleDialog.open}
        onClose={() => setToggleDialog({ open: false, attribute: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          className: "rounded-2xl shadow-2xl",
        }}
      >
        <DialogTitle
          className={`text-white ${
            toggleDialog.attribute?.isAvailable
              ? "bg-gradient-to-r from-red-500 to-pink-500"
              : "bg-yellow-500"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {toggleDialog.attribute?.isAvailable ? (
                <ToggleOffIcon />
              ) : (
                <ToggleOnIcon />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {toggleDialog.attribute?.isAvailable
                  ? "Ẩn thuộc tính"
                  : "Hiển thị thuộc tính"}
              </h2>
              <p
                className={`text-sm ${
                  toggleDialog.attribute?.isAvailable
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
          {toggleDialog.attribute && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  toggleDialog.attribute.isAvailable
                    ? "bg-red-100"
                    : "bg-yellow-100"
                }`}
              >
                {toggleDialog.attribute.isAvailable ? (
                  <ToggleOffIcon
                    className="text-red-500"
                    sx={{ fontSize: 32 }}
                  />
                ) : (
                  <ToggleOnIcon
                    className="text-yellow-500"
                    sx={{ fontSize: 32 }}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Typography className="text-lg font-semibold text-gray-800">
                  Bạn có chắc chắn muốn{" "}
                  {toggleDialog.attribute.isAvailable ? "ẩn" : "hiển thị"}
                  thuộc tính "<strong>{toggleDialog.attribute.name}</strong>"?
                </Typography>
                <Typography
                  className={`text-sm p-3 rounded-lg ${
                    toggleDialog.attribute.isAvailable
                      ? "text-yellow-800 bg-yellow-50 border border-yellow-200"
                      : "text-yellow-800 bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  {toggleDialog.attribute.isAvailable
                    ? "⚠️ Thuộc tính sẽ được ẩn khỏi danh sách hiển thị cho người dùng."
                    : "ℹ️ Thuộc tính sẽ được hiển thị trở lại cho người dùng."}
                </Typography>
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={() => setToggleDialog({ open: false, attribute: null })}
              variant="outlined"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg py-2"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmToggleStatus}
              variant="contained"
              className={`flex-1 text-white rounded-lg py-2 shadow-md hover:shadow-lg transition-all duration-300 ${
                toggleDialog.attribute?.isAvailable
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
              startIcon={
                toggleDialog.attribute?.isAvailable ? (
                  <ToggleOffIcon />
                ) : (
                  <ToggleOnIcon />
                )
              }
            >
              {toggleDialog.attribute?.isAvailable
                ? "Ẩn thuộc tính"
                : "Hiển thị thuộc tính"}
            </Button>
          </div>
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
