import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductTypes,
  selectAllProductTypes,
  selectProductTypeStatus,
  selectProductTypeError,
  fetchProductTypeSizesByProductTypeId, // Add this import
  selectProductTypeSizes, // Add this import
  selectProductTypeSizesStatus, // Add this import
} from "../../store/features/productType/productTypeSlice";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
   Menu,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  InfoOutlined as InfoOutlinedIcon,
   ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
} from "@mui/icons-material";
import {
  addProductTypeApi,
  deleteProductTypeApi,
  updateProductTypeApi,
} from "../../api/productTypeService";
import {
  fetchAttributesByProductTypeId,
  selectAllAttributes,
  selectAttributeStatus,
} from "../../store/features/attribute/attributeSlice";
import dayjs from "dayjs";

const Illustration = () => (
  <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
    <img
      src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/sleeping_kitty.png"
      alt="No product type"
      style={{ width: 180, opacity: 0.7 }}
    />
    <Typography variant="h5" fontWeight="bold" mt={2}>
      Chưa có loại biển hiệu nào
    </Typography>
    <Typography color="text.secondary" mt={1}>
      Hãy thêm loại biển hiệu mới để bắt đầu quản lý.
    </Typography>
  </Box>
);

const ProductTypeManager = () => {
  const dispatch = useDispatch();
  const productTypes = useSelector(selectAllProductTypes);
  const status = useSelector(selectProductTypeStatus);
  const error = useSelector(selectProductTypeError);
  const attributes = useSelector(selectAllAttributes);
  const attributeStatus = useSelector(selectAttributeStatus);
  const [showSizes, setShowSizes] = useState(false);
  const productTypeSizes = useSelector(selectProductTypeSizes);
  const sizesStatus = useSelector(selectProductTypeSizesStatus);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' | 'edit'
  const [form, setForm] = useState({ name: "", calculateFormula: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showAttributes, setShowAttributes] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [anchorEl, setAnchorEl] = useState(null); // Thêm state cho menu
  const formulaRef = useRef(null); 
  useEffect(() => {
    dispatch(fetchProductTypes());
  }, [dispatch]);
  useEffect(() => {
    if (dialogMode === "edit" && editId && openDialog && showSizes) {
      dispatch(fetchProductTypeSizesByProductTypeId(editId));
    }
  }, [dialogMode, editId, openDialog, showSizes, dispatch]);
  // Fetch attributes when editing a product type
  useEffect(() => {
    if (dialogMode === "edit" && editId && openDialog) {
      dispatch(fetchAttributesByProductTypeId(editId));
    }
  }, [dialogMode, editId, openDialog, dispatch]);

  const handleOpenAdd = () => {
    setDialogMode("add");
    setForm({ name: "", calculateFormula: "" });
    setEditId(null);
    setShowAttributes(false);
    setOpenDialog(true);
  };

  const handleOpenEdit = (row) => {
    setDialogMode("edit");
    setForm({
      name: row.name || "",
      calculateFormula: row.calculateFormula || "",
    });
    setEditId(row.id);
    setShowAttributes(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setShowAttributes(false);
  };

  const handleSubmit = async () => {
    if (dialogMode === "add") {
      const res = await addProductTypeApi({
        name: form.name,
        calculateFormula: form.calculateFormula,
        isAvailable: true,
      });
      if (res.success) {
        dispatch(fetchProductTypes());
        setSnackbar({
          open: true,
          message: "Thêm thành công!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.error || "Add failed",
          severity: "error",
        });
      }
    } else if (dialogMode === "edit" && editId) {
      const res = await updateProductTypeApi(editId, {
        name: form.name,
        calculateFormula: form.calculateFormula,
        isAvailable: true,
      });
      if (res.success) {
        dispatch(fetchProductTypes());
        setSnackbar({
          open: true,
          message: "Cập nhật thành công!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.error || "Update failed",
          severity: "error",
        });
      }
    }
    setOpenDialog(false);
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      const res = await deleteProductTypeApi(deleteTarget.id);
      if (res.success) {
        dispatch(fetchProductTypes());
        setSnackbar({
          open: true,
          message: "Xóa thành công!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: res.error || "Delete failed",
          severity: "error",
        });
      }
    }
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  // Insert attribute name into formula
const insertAttributeToFormula = (attribute) => {
  if (!attribute || !attribute.name) {
    console.error("Invalid attribute:", attribute);
    return;
  }

  // Format the attribute name by removing spaces and converting to uppercase
  const attributeName = `#${attribute.name.toUpperCase().replace(/\s+/g, "")}`;

  // Get cursor position or end of text
  const cursorPosition = formulaRef.current?.selectionStart || form.calculateFormula.length;
  const formulaText = form.calculateFormula;

  // Insert attribute at cursor position without adding * automatically
  const newFormula = 
    formulaText.substring(0, cursorPosition) +
    attributeName +
    formulaText.substring(cursorPosition);

  setForm({
    ...form,
    calculateFormula: newFormula,
  });
  
  // Focus back on formula input and position cursor after inserted attribute
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
  if (!sizeItem || !sizeItem.sizes || !sizeItem.sizes.name) {
    console.error("Invalid size:", sizeItem);
    return;
  }

  // Format tên kích thước
  const sizeName = `#${sizeItem.sizes.name.toUpperCase().replace(/\s+/g, "")}`;

  // Get cursor position or end of text
  const cursorPosition = formulaRef.current?.selectionStart || form.calculateFormula.length;
  const formulaText = form.calculateFormula;

  // Insert size at cursor position without adding * automatically
  const newFormula = 
    formulaText.substring(0, cursorPosition) +
    sizeName +
    formulaText.substring(cursorPosition);

  setForm({
    ...form,
    calculateFormula: newFormula,
  });
  
  // Focus back on formula input and position cursor after inserted size
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
   const insertOperator = (operator) => {
    // Get cursor position or end of text
    const cursorPosition = formulaRef.current?.selectionStart || form.calculateFormula.length;
    const formulaText = form.calculateFormula;

    // Insert the operator at the cursor position
    const newFormula =
      formulaText.substring(0, cursorPosition) +
      ` ${operator} ` +
      formulaText.substring(cursorPosition);

    setForm({ ...form, calculateFormula: newFormula });

    // Focus back on formula input and position cursor after inserted operator
    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          cursorPosition + operator.length + 2, // +2 for the spaces before and after
          cursorPosition + operator.length + 2
        );
      }
    }, 100);
  };
  return (
    <Box>
      <Box
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight="bold">
          Quản lý loại biển hiệu
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 16,
            boxShadow: "0 2px 8px 0 rgba(56,142,60,0.08)",
          }}
        >
          Thêm loại biển hiệu
        </Button>
      </Box>
      {status === "loading" && <CircularProgress />}
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(56,142,60,0.08)" }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
              <TableCell sx={{ fontWeight: 700 }}>Tên</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                Công thức tính toán
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày tạo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày cập nhật</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Thao Tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Illustration />
                </TableCell>
              </TableRow>
            ) : (
              productTypes.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    transition: "background 0.2s",
                    ":hover": { bgcolor: "#f1f8e9" },
                  }}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={row.calculateFormula || "Không có công thức"}
                    >
                      {row.calculateFormula || "Không có công thức"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.createAt
                      ? dayjs(row.createAt).format("DD/MM/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row.updateAt
                      ? dayjs(row.updateAt).format("DD/MM/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEdit(row)}
                      sx={{ borderRadius: 2 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(row)}
                      sx={{ borderRadius: 2 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Dialog with improved styling */}
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
              {dialogMode === "edit" ? (
                <EditIcon color="primary" />
              ) : (
                <AddIcon color="primary" />
              )}
              {dialogMode === "edit"
                ? "Sửa Loại Biển Hiệu"
                : "Thêm Loại Biển Hiệu"}
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
              {/* Tên loại biển hiệu */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="500"
                  sx={{ mb: 1, color: "text.primary" }}
                >
                  Tên loại biển hiệu
                </Typography>
                <TextField
                  autoFocus
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  placeholder="Nhập tên loại biển hiệu"
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      fontSize: "1rem",
                    },
                  }}
                />
              </Box>

              {/* Công thức tính toán */}
               <Box>
          <Typography
            variant="subtitle1"
            fontWeight="500"
            sx={{ mb: 1, color: "text.primary" }}
          >
            Công thức tính toán
          </Typography>
          <TextField
            name="calculateFormula"
            value={form.calculateFormula}
            onChange={(e) =>
              setForm({ ...form, calculateFormula: e.target.value })
            }
            inputRef={formulaRef} // Thêm ref cho input
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
            helperText="Sử dụng các thuộc tính để tạo công thức tính toán"
            FormHelperTextProps={{
              sx: {
                fontSize: "0.75rem",
                color: "text.secondary",
                mt: 0.5,
              },
            }}
          />
        </Box>

             <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2, 
            flexWrap: 'wrap',
            p: 2, 
            borderRadius: 2,
            bgcolor: '#f5f9ff'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              Công cụ hỗ trợ:
            </Typography>
            
            {/* Nút chọn thuộc tính */}
            {dialogMode === "edit" && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowAttributes(!showAttributes)}
                startIcon={showAttributes ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
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
            
            {/* Nút chọn kích thước */}
            {dialogMode === "edit" && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setShowSizes(!showSizes)}
                startIcon={showSizes ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
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

            {/* Dropdown phép tính */}
            <Box sx={{ position: "relative" }}>
              <Button
                variant="outlined"
                size="medium"
                color="info"
                endIcon={<ArrowDropDownIcon />}
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                }}
                sx={{ 
                  borderRadius: 1.5, 
                  textTransform: 'none',
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
                    boxShadow: '0px 5px 15px rgba(0,0,0,0.08)', 
                    borderRadius: 2,
                    width: 180,
                  }
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

              {/* Danh sách thuộc tính */}
              {dialogMode === "edit" && (
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

                    {attributeStatus === "succeeded" &&
                      attributes.length === 0 && (
                        <Box p={3} textAlign="center">
                          <Typography variant="body2" color="text.secondary">
                            Không có thuộc tính cho loại biển hiệu này
                          </Typography>
                        </Box>
                      )}

                    {attributeStatus === "succeeded" &&
                      attributes.length > 0 && (
                        <List>
                          {attributes.map((attribute) => (
                            <ListItem
                              key={attribute.id}
                              component="div" // Changed from button to component="div"
                              divider
                              onClick={() =>
                                insertAttributeToFormula(attribute)
                              }
                              sx={{
                                "&:hover": {
                                  bgcolor: "rgba(25, 118, 210, 0.04)",
                                  cursor: "pointer", // Add cursor pointer for better UX
                                },
                                py: 1.5,
                              }}
                            >
                              <ListItemText
                                primary={attribute.name}
                                // secondary={attribute.isCore ? "Thuộc tính cốt lõi" : "Thuộc tính thường"}
                                primaryTypographyProps={{
                                  fontWeight: "500",
                                  variant: "body1",
                                }}
                                secondaryTypographyProps={{
                                  variant: "caption",
                                  color: attribute.isCore
                                    ? "success.main"
                                    : "text.secondary",
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                  </Paper>
                </Collapse>
              )}
             
              {/* Danh sách kích thước */}
              {dialogMode === "edit" && (
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

                    {sizesStatus === "succeeded" &&
                      productTypeSizes.length > 0 && (
                        <List>
                          {sizesStatus === "succeeded" &&
                            productTypeSizes.length > 0 && (
                              <List>
                                {productTypeSizes.map((sizeItem) => {
                                  // Access the size data from the 'sizes' property
                                  const sizeData = sizeItem.sizes || {};
                                  return (
                                    <ListItem
                                      key={sizeItem.id}
                                      component="div"
                                      divider
                                      onClick={() =>
                                        insertSizeToFormula(sizeItem)
                                      }
                                      sx={{
                                        py: 1.5,
                                        "&:hover": {
                                          bgcolor: "rgba(156, 39, 176, 0.04)",
                                          cursor: "pointer",
                                        },
                                      }}
                                    >
                                      <ListItemText
                                        primary={
                                          sizeData.name || "Không xác định"
                                        }
                                        primaryTypographyProps={{
                                          fontWeight: "500",
                                          variant: "body1",
                                        }}
                                        secondaryTypographyProps={{
                                          variant: "caption",
                                          fontFamily: "monospace",
                                          color: "text.secondary",
                                        }}
                                      />
                                    </ListItem>
                                  );
                                })}
                              </List>
                            )}
                        </List>
                      )}
                  </Paper>
                </Collapse>
              )}
              {/* Thông tin và ví dụ */}
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
                    #CAO * #RONG * #SOLUONG
                  </Typography>
                  <Typography component="span" variant="caption">
                    (#CAO + #RONG) * 2 * #DONGIA
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
              disabled={!form.name}
              sx={{
                borderRadius: 1.5,
                px: 3,
                boxShadow: "0 3px 5px 0 rgba(76,175,80,0.3)",
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              {dialogMode === "edit" ? "Lưu thay đổi" : "Thêm loại biển hiệu"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelDelete}
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
          <Typography>
            Bạn có chắc chắn muốn xóa loại sản phẩm này không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCancelDelete}
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

export default ProductTypeManager;
