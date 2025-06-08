import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductTypes,
  fetchProductTypeSizesByProductTypeId,
  addSizeToProductType,
  deleteProductTypeSize,
  selectAllProductTypes,
  selectProductTypeSizes,
  selectProductTypeSizesStatus,
} from "../../store/features/productType/productTypeSlice";
import {
  fetchSizes,
  selectAllSizes,
} from "../../store/features/size/sizeSlice";
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
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  InputBase,
  Fade,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const Illustration = () => (
  <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
    <img
      src="https://quangcaotayninh.com.vn/wp-content/uploads/2020/08/logo-quang-cao-tay-ninh-3.png"
      alt="Chọn loại sản phẩm"
      style={{ width: 180, opacity: 0.7 }}
    />
    <Typography variant="h5" fontWeight="bold" mt={2}>
      Chọn loại sản phẩm để xem kích thước
    </Typography>
    <Typography color="text.secondary" mt={1}>
      Vui lòng chọn một loại sản phẩm ở bên trái để quản lý kích thước.
    </Typography>
  </Box>
);

const ProductSizeManager = () => {
  const dispatch = useDispatch();
  const productTypes = useSelector(selectAllProductTypes);
  const allSizes = useSelector(selectAllSizes);
  const productTypeSizes = useSelector(selectProductTypeSizes);
  const sizesStatus = useSelector(selectProductTypeSizesStatus);

  const [search, setSearch] = useState("");
  const [selectedProductTypeId, setSelectedProductTypeId] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    dispatch(fetchProductTypes());
    dispatch(fetchSizes());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProductTypeId) {
      dispatch(fetchProductTypeSizesByProductTypeId(selectedProductTypeId));
    }
  }, [dispatch, selectedProductTypeId]);

  // Lọc size chưa có trong product type
  const availableSizes = allSizes.filter(
    (s) => !productTypeSizes.some((ptSize) => ptSize.sizes.id === s.id)
  );

  // Lọc loại sản phẩm theo search
  const filteredProductTypes = productTypes.filter((pt) =>
    pt.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setSelectedSizeId(availableSizes[0]?.id || "");
    setAddDialogOpen(true);
  };

  const handleAddSize = async () => {
    if (!selectedProductTypeId || !selectedSizeId) return;
    try {
      await dispatch(
        addSizeToProductType({
          productTypeId: selectedProductTypeId,
          sizeId: selectedSizeId,
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Thêm kích thước thành công!",
        severity: "success",
      });
      await dispatch(
        fetchProductTypeSizesByProductTypeId(selectedProductTypeId)
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: err || "Thêm thất bại!",
        severity: "error",
      });
    }
    setAddDialogOpen(false);
  };

  const handleDelete = async (productTypeSizeId) => {
    try {
      await dispatch(
        deleteProductTypeSize({
          productTypeId: selectedProductTypeId,
          productTypeSizeId,
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Xóa thành công!",
        severity: "success",
      });
      await dispatch(
        fetchProductTypeSizesByProductTypeId(selectedProductTypeId)
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: err || "Xóa thất bại!",
        severity: "error",
      });
    }
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
          Loại sản phẩm
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
          {sizesStatus === "loading" && <CircularProgress size={20} />}
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
          {sizesStatus === "succeeded" && filteredProductTypes.length === 0 && (
            <Typography color="text.secondary" mt={2} fontSize={15}>
              Không tìm thấy loại sản phẩm nào.
            </Typography>
          )}
        </Box>
      </Paper>
      {/* Main Content: Size Table */}
      <Box flex={1}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight="bold">
            {selectedProductTypeId
              ? `Kích thước của: ${
                  productTypes.find((pt) => pt.id === selectedProductTypeId)
                    ?.name
                }`
              : "Chọn loại sản phẩm để xem kích thước"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            disabled={!selectedProductTypeId || availableSizes.length === 0}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 16,
              boxShadow: "0 2px 8px 0 rgba(56,142,60,0.08)",
            }}
          >
            Thêm kích thước
          </Button>
        </Box>
        {sizesStatus === "loading" && <CircularProgress />}
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
                  <TableCell sx={{ fontWeight: 700 }}>Tên</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productTypeSizes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Box py={4}>
                        <img
                          src="https://cdn.dribbble.com/users/1162077/screenshots/3848914/sleeping_kitty.png"
                          alt="No size"
                          style={{ width: 120, opacity: 0.6 }}
                        />
                        <Typography color="text.secondary" mt={2}>
                          Chưa có kích thước nào cho loại sản phẩm này.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  productTypeSizes.map((ptSize) => (
                    <TableRow
                      key={ptSize.id}
                      hover
                      sx={{
                        transition: "background 0.2s",
                        ":hover": { bgcolor: "#f1f8e9" },
                      }}
                    >
                      <TableCell>{ptSize.sizes.name}</TableCell>
                      <TableCell>{ptSize.sizes.description}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(ptSize.id)}
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
        )}
      </Box>
      {/* Add Size Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>
          Thêm kích thước vào loại sản phẩm
        </DialogTitle>
        <DialogContent>
          <Select
            value={selectedSizeId}
            onChange={(e) => setSelectedSizeId(e.target.value)}
            fullWidth
            displayEmpty
            sx={{ mt: 1, borderRadius: 2 }}
            MenuProps={{ PaperProps: { sx: { borderRadius: 2 } } }}
          >
            {availableSizes.length === 0 ? (
              <MenuItem disabled>Không còn kích thước nào để thêm</MenuItem>
            ) : (
              availableSizes.map((size) => (
                <MenuItem key={size.id} value={size.id}>
                  {size.name}
                </MenuItem>
              ))
            )}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleAddSize}
            variant="contained"
            disabled={!selectedSizeId}
            sx={{ borderRadius: 2 }}
          >
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
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

export default ProductSizeManager;
