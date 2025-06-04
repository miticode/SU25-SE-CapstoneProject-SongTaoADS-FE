import React, { useEffect, useState } from "react";
import {
  getProductTypesApi,
  getProductTypeSizesByProductTypeIdApi,
  addSizeToProductTypeApi,
  deleteProductTypeSizeApi,
} from "../../api/productTypeService";
import { getAllSizesApi } from "../../api/sizeService";
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
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

const ProductSizeManager = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState(null);
  const [productTypeSizes, setProductTypeSizes] = useState([]);
  const [allSizes, setAllSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch all product types and all sizes on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const ptRes = await getProductTypesApi();
      const sizeRes = await getAllSizesApi();
      if (ptRes.success) setProductTypes(ptRes.data);
      if (sizeRes.success) setAllSizes(sizeRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Fetch sizes for selected product type
  useEffect(() => {
    if (!selectedProductTypeId) return;
    const fetchSizes = async () => {
      setLoading(true);
      const res = await getProductTypeSizesByProductTypeIdApi(
        selectedProductTypeId
      );
      if (res.success) setProductTypeSizes(res.data);
      setLoading(false);
    };
    fetchSizes();
  }, [selectedProductTypeId]);

  // Lọc size chưa có trong product type
  const availableSizes = allSizes.filter(
    (s) => !productTypeSizes.some((ptSize) => ptSize.sizes.id === s.id)
  );

  const handleOpenAdd = () => {
    setSelectedSizeId(availableSizes[0]?.id || "");
    setAddDialogOpen(true);
  };
  const handleAddSize = async () => {
    if (!selectedProductTypeId || !selectedSizeId) return;
    setLoading(true);
    const res = await addSizeToProductTypeApi(
      selectedProductTypeId,
      selectedSizeId
    );
    if (res.success) {
      setSnackbar({
        open: true,
        message: "Thêm kích thước thành công!",
        severity: "success",
      });
      // Reload sizes
      const reload = await getProductTypeSizesByProductTypeIdApi(
        selectedProductTypeId
      );
      if (reload.success) setProductTypeSizes(reload.data);
    } else {
      setSnackbar({
        open: true,
        message: res.error || "Thêm thất bại!",
        severity: "error",
      });
    }
    setAddDialogOpen(false);
    setLoading(false);
  };
  const handleDelete = async (productTypeSizeId) => {
    setLoading(true);
    const res = await deleteProductTypeSizeApi(productTypeSizeId);
    if (res.success) {
      setSnackbar({
        open: true,
        message: "Xóa thành công!",
        severity: "success",
      });
      // Reload sizes
      const reload = await getProductTypeSizesByProductTypeIdApi(
        selectedProductTypeId
      );
      if (reload.success) setProductTypeSizes(reload.data);
    } else {
      setSnackbar({
        open: true,
        message: res.error || "Xóa thất bại!",
        severity: "error",
      });
    }
    setLoading(false);
  };

  return (
    <Box display="flex" gap={2}>
      {/* Sidebar Product Type List */}
      <Box width={260} minWidth={200} borderRight="1px solid #eee" pr={2}>
        <Typography variant="h6" mb={2}>
          Loại sản phẩm
        </Typography>
        {loading && <CircularProgress size={20} />}
        {productTypes.map((pt) => (
          <Box
            key={pt.id}
            p={1.2}
            mb={1}
            borderRadius={2}
            bgcolor={
              selectedProductTypeId === pt.id ? "#e8f5e9" : "transparent"
            }
            sx={{
              cursor: "pointer",
              fontWeight: selectedProductTypeId === pt.id ? 600 : 400,
            }}
            onClick={() => setSelectedProductTypeId(pt.id)}
          >
            {pt.name}
          </Box>
        ))}
      </Box>
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
          >
            Thêm kích thước
          </Button>
        </Box>
        {loading && <CircularProgress />}
        {!loading && selectedProductTypeId && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productTypeSizes.map((ptSize) => (
                  <TableRow key={ptSize.id} hover>
                    <TableCell>{ptSize.sizes.name}</TableCell>
                    <TableCell>{ptSize.sizes.description}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(ptSize.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      {/* Add Size Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Thêm kích thước vào loại sản phẩm</DialogTitle>
        <DialogContent>
          <Select
            value={selectedSizeId}
            onChange={(e) => setSelectedSizeId(e.target.value)}
            fullWidth
          >
            {availableSizes.map((size) => (
              <MenuItem key={size.id} value={size.id}>
                {size.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleAddSize}
            variant="contained"
            disabled={!selectedSizeId}
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
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductSizeManager;
