import React, { useState, useMemo, useCallback, useEffect, memo } from "react";
import { getOrderDetailsApi } from "../../api/orderService";
import { getImageFromS3, openFileInNewTab } from "../../api/s3Service";
import { getOrderContractApi } from "../../api/contractService";
import { useDispatch, useSelector } from "react-redux";
import { uploadContract, uploadRevisedContract } from "../../store/features/contract/contractSlice";
import { contractResignOrder, contractSignedOrder, updateOrderEstimatedDeliveryDate } from "../../store/features/order/orderSlice";
import { fetchAllContractors } from "../../store/features/contractor/contractorSlice";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import {
  ShoppingCart as OrderIcon,
  PendingActions as PendingIcon,
  LocalShipping as ShippingIcon,
  MonetizationOn as MoneyIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { ORDER_STATUS_MAP } from "../../store/features/order/orderSlice";

// Component hiển thị avatar user
const UserAvatar = memo(({ user, size = 40 }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user?.avatar) {
        setLoading(true);
        try {
          const result = await getImageFromS3(user.avatar);
          if (result.success) {
            setAvatarUrl(result.imageUrl);
          }
        } catch (error) {
          console.error("Error fetching avatar:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAvatar();
  }, [user?.avatar]);

  if (loading) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <CircularProgress size={size * 0.6} sx={{ color: "white" }} />
      </Box>
    );
  }

  return (
    <Avatar
      src={avatarUrl}
      sx={{
        width: size,
        height: size,
        background: avatarUrl
          ? "transparent"
          : "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
        color: "white",
        fontWeight: "bold",
        fontSize: size * 0.4,
        border: "2px solid #fff",
        boxShadow: 2,
      }}
    >
      {!avatarUrl && user?.fullName?.charAt(0)?.toUpperCase()}
    </Avatar>
  );
});

UserAvatar.displayName = "UserAvatar";

// Component Upload Contract Dialog
const UploadContractDialog = memo(
  ({ open, onClose, orderId, onUploadSuccess }) => {
    const dispatch = useDispatch();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [depositPercent, setDepositPercent] = useState(10); // Mặc định 10%
    const [contractNumber, setContractNumber] = useState(""); // Số hợp đồng

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Kiểm tra định dạng file (chỉ cho phép PDF)
        if (file.type !== "application/pdf") {
          setError("Vui lòng chọn file PDF");
          return;
        }

        // Kiểm tra kích thước file (tối đa 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError("Kích thước file không được vượt quá 10MB");
          return;
        }

        setSelectedFile(file);
        setError(null);
      }
    };

    const handleDepositPercentChange = (event) => {
      const value = parseFloat(event.target.value);
      if (isNaN(value) || value < 0 || value > 100) {
        setError("Phần trăm cọc phải từ 0% đến 100%");
        return;
      }
      setDepositPercent(value);
      setError(null);
    };

    const handleContractNumberChange = (event) => {
      setContractNumber(event.target.value);
      setError(null);
    };

    const handleUpload = async () => {
      if (!selectedFile) {
        setError("Vui lòng chọn file hợp đồng");
        return;
      }

      if (depositPercent < 0 || depositPercent > 100) {
        setError("Phần trăm cọc phải từ 0% đến 100%");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("contactFile", selectedFile); // Theo API spec: contactFile
        formData.append("depositPercentChanged", depositPercent.toString());
        formData.append("contractNumber", contractNumber.trim()); // Sử dụng giá trị Sale nhập

        await dispatch(uploadContract({ orderId, formData })).unwrap();

        // Thông báo thành công và refresh danh sách
        onUploadSuccess();
        handleClose();
      } catch (error) {
        setError(error || "Có lỗi xảy ra khi tải lên hợp đồng");
      } finally {
        setUploading(false);
      }
    };

    const handleClose = () => {
      setSelectedFile(null);
      setError(null);
      setUploading(false);
      setDepositPercent(10); // Reset về mặc định 10%
      setContractNumber(""); // Reset số hợp đồng
      onClose();
    };

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UploadIcon color="primary" />
            <Typography variant="h6">Tải lên hợp đồng</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Chọn file hợp đồng (định dạng PDF, tối đa 10MB)
            </Typography>

            {/* Trường nhập phần trăm cọc */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <TextField
                label="Phần trăm cọc (%)"
                type="number"
                value={depositPercent}
                onChange={handleDepositPercentChange}
                fullWidth
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.1,
                }}
                helperText="Nhập phần trăm tiền cọc (mặc định 10%)"
                sx={{ mb: 2 }}
              />

              <TextField
                label="Số hợp đồng"
                type="text"
                value={contractNumber}
                onChange={handleContractNumberChange}
                fullWidth
                placeholder="Nhập số hợp đồng (tùy chọn)"
                helperText="Số hợp đồng để quản lý và tra cứu"
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ mt: 2, mb: 2 }}>
              <input
                accept=".pdf"
                style={{ display: "none" }}
                id="contract-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="contract-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 1 }}
                  fullWidth
                >
                  Chọn file hợp đồng
                </Button>
              </label>

              {selectedFile && (
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    bgcolor: "success.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "success.200",
                  }}
                >
                  <Typography variant="body2" color="success.main">
                    ✓ Đã chọn file: {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                    MB
                  </Typography>
                </Box>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
            startIcon={
              uploading ? <CircularProgress size={20} /> : <UploadIcon />
            }
          >
            {uploading ? "Đang tải lên..." : "Tải lên"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

UploadContractDialog.displayName = "UploadContractDialog";

// Component Upload Revised Contract Dialog
const UploadRevisedContractDialog = memo(({ open, onClose, orderId, onUploadSuccess }) => {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [depositPercent, setDepositPercent] = useState(10); // Mặc định 10%

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Kiểm tra định dạng file (chỉ cho phép PDF)
      if (file.type !== 'application/pdf') {
        setError('Vui lòng chọn file PDF');
        return;
      }
      
      // Kiểm tra kích thước file (tối đa 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDepositPercentChange = (event) => {
    const value = parseFloat(event.target.value);
    if (isNaN(value) || value < 0 || value > 100) {
      setError('Phần trăm cọc phải từ 0% đến 100%');
      return;
    }
    setDepositPercent(value);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file hợp đồng đã chỉnh sửa');
      return;
    }

    if (depositPercent < 0 || depositPercent > 100) {
      setError('Phần trăm cọc phải từ 0% đến 100%');
      return;
    }

    setUploading(true);
    try {
      // Lấy thông tin hợp đồng từ orderId để có contractId
      const contractResponse = await getOrderContractApi(orderId);
      if (!contractResponse.success) {
        setError('Không thể lấy thông tin hợp đồng để gửi lại');
        setUploading(false);
        return;
      }

      const contractId = contractResponse.data.id;
      const formData = new FormData();
      formData.append('contactFile', selectedFile); // Theo API spec: contactFile
      formData.append('depositPercentChanged', depositPercent.toString());

      await dispatch(uploadRevisedContract({ contractId, formData })).unwrap();
      
      // Thông báo thành công và refresh danh sách
      onUploadSuccess();
      handleClose();
      
    } catch (error) {
      setError(error || 'Có lỗi xảy ra khi tải lên hợp đồng đã chỉnh sửa');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setUploading(false);
    setDepositPercent(10); // Reset về mặc định 10%
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon color="warning" />
          <Typography variant="h6">Gửi lại hợp đồng đã chỉnh sửa</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tải lên hợp đồng đã chỉnh sửa theo yêu cầu thảo luận của khách hàng
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Chọn file hợp đồng (định dạng PDF, tối đa 10MB)
          </Typography>

          {/* Trường nhập phần trăm cọc */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <TextField
              label="Phần trăm cọc (%)"
              type="number"
              value={depositPercent}
              onChange={handleDepositPercentChange}
              fullWidth
              inputProps={{
                min: 0,
                max: 100,
                step: 0.1,
              }}
              helperText="Nhập phần trăm tiền cọc (mặc định 10%)"
              sx={{ mb: 2 }}
            />
          </Box>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              accept=".pdf"
              style={{ display: 'none' }}
              id="revised-contract-file-input"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="revised-contract-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                sx={{ mb: 1 }}
                fullWidth
                color="warning"
              >
                Chọn file hợp đồng đã chỉnh sửa
              </Button>
            </label>
            
            {selectedFile && (
              <Box sx={{ 
                mt: 1, 
                p: 2, 
                bgcolor: 'warning.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'warning.200'
              }}>
                <Typography variant="body2" color="warning.main">
                  ✓ Đã chọn file: {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Hủy
        </Button>
        <Button 
          onClick={handleUpload} 
          variant="contained" 
          color="warning"
          disabled={!selectedFile || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
        >
          {uploading ? 'Đang gửi lại...' : 'Gửi lại hợp đồng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

UploadRevisedContractDialog.displayName = "UploadRevisedContractDialog";

// Component ContractorListDialog
const ContractorListDialog = memo(({ open, onClose, contractors, order, generateOrderCode, onReportDelivery }) => {
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedContractorId(null);
      setEstimatedDeliveryDate(null);
    }
  }, [open]);

  // Set Vietnamese locale for dayjs
  useEffect(() => {
    dayjs.locale('vi');
  }, []);

  const handleSubmit = async () => {
    if (!selectedContractorId || !estimatedDeliveryDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Format the date as LocalDateTime in ISO format
      // Set time to 09:00:00 for delivery date
      const deliveryDateTime = estimatedDeliveryDate.hour(9).minute(0).second(0);
      const formattedDateTime = deliveryDateTime.format('YYYY-MM-DDTHH:mm:ss');
      
      console.log('Formatted delivery date:', formattedDateTime);
      await onReportDelivery(order.id, formattedDateTime, selectedContractorId);
      onClose();
    } catch (error) {
      console.error('Error reporting delivery date:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedContractorId && estimatedDeliveryDate;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShippingIcon color="info" />
            <Typography variant="h6">
              Báo ngày giao dự kiến - Đơn hàng {order ? generateOrderCode(order, 0) : '#N/A'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {contractors && contractors.length > 0 ? (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Chọn nhà thầu và báo ngày giao dự kiến cho đơn hàng {order ? generateOrderCode(order, 0) : '#N/A'} ({contractors.length} nhà thầu có sẵn)
                </Typography>
                
                {/* Date Picker */}
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Ngày giao dự kiến
                  </Typography>
                  <DatePicker
                    label="Chọn ngày giao hàng"
                    value={estimatedDeliveryDate}
                    onChange={(newValue) => setEstimatedDeliveryDate(newValue)}
                    minDate={dayjs().add(1, 'day')}
                    format="DD/MM/YYYY"
                    sx={{ width: '100%' }}
                    slotProps={{
                      textField: {
                        helperText: 'Vui lòng chọn ngày giao hàng dự kiến (định dạng: Ngày/Tháng/Năm)'
                      }
                    }}
                  />
                </Box>

                <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ mt: 3 }}>
                  Chọn nhà thầu thực hiện
                </Typography>
                
                <RadioGroup
                  value={selectedContractorId}
                  onChange={(e) => setSelectedContractorId(e.target.value)}
                >
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {contractors.map((contractor) => (
                      <Grid item xs={12} md={6} key={contractor.id}>
                        <Card
                          elevation={selectedContractorId === contractor.id ? 4 : 2}
                          sx={{
                            borderRadius: 3,
                            border: "2px solid",
                            borderColor: selectedContractorId === contractor.id ? "info.main" : "divider",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "translateY(-2px)",
                              borderColor: selectedContractorId === contractor.id ? "info.main" : "warning.main",
                            },
                          }}
                          onClick={() => setSelectedContractorId(contractor.id)}
                        >
                          <CardContent sx={{ p: 3 }}>
                            {/* Radio button và header */}
                            <Box
                              sx={{
                                background: selectedContractorId === contractor.id 
                                  ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
                                  : "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                                position: 'relative'
                              }}
                            >
                              <FormControlLabel
                                value={contractor.id}
                                control={<Radio />}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        backgroundColor: contractor.isInternal ? "success.main" : "info.main",
                                      }}
                                    />
                                    <Typography variant="h6" color="text.primary" fontWeight="bold">
                                      {contractor.name}
                                    </Typography>
                                    <Chip
                                      label={contractor.isInternal ? "Nội bộ" : "Bên ngoài"}
                                      size="small"
                                      color={contractor.isInternal ? "success" : "info"}
                                      sx={{ ml: "auto", fontWeight: "medium" }}
                                    />
                                  </Box>
                                }
                                sx={{ width: '100%', m: 0 }}
                              />
                            </Box>

                            {/* Thông tin chi tiết */}
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, mb: 2 }}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Địa chỉ
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {contractor.address}
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Số điện thoại
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium" color="primary.main">
                                    {contractor.phone}
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Email
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium" color="primary.main">
                                    {contractor.email}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            {/* Trạng thái availability */}
                            <Box sx={{ mt: 2, textAlign: "center" }}>
                              <Chip
                                label={contractor.isAvailable ? "Có sẵn" : "Không có sẵn"}
                                color={contractor.isAvailable ? "success" : "error"}
                                variant="filled"
                                sx={{ fontWeight: "medium" }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <ShippingIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Chưa có nhà thầu nào để báo ngày giao
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hiện tại chưa có nhà thầu nào có sẵn để báo ngày giao dự kiến cho đơn hàng này
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!isFormValid || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <ShippingIcon />}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Báo ngày giao dự kiến'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
});

ContractorListDialog.displayName = "ContractorListDialog";

// Memoized OrderRow component for better performance
const OrderRow = memo(
  ({
    order,
    index,
    formatDate,
    getCustomerName,
    getCustomerPhone,
    getCustomerEmail,
    getContractorName,
    getOrderType,
    getTotalAmount,
    getDepositAmount,
    getRemainingAmount,
    getCreatedDate,
    generateOrderCode,
    onViewDetail,
    onUploadContract,
    onUploadRevisedContract,
    onViewContract,
    onRequestResign,
    onConfirmSigned,
    contractViewLoading,
    orderDetails,
  }) => {
    console.log(`OrderRow for order ${order.id}: orderDetails =`, orderDetails);
    return (
      <>
        <TableRow
          key={order.id || index}
          hover
          sx={{
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.04)",
              transform: "scale(1.001)",
              transition: "all 0.2s ease",
            },
          }}
        >
          <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
            {generateOrderCode(order, index)}
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <UserAvatar user={order.users} size={40} />
              <Box>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ color: "text.primary" }}
                >
                  {getCustomerName(order)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  📞 {getCustomerPhone(order)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  ✉️ {getCustomerEmail(order)}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell>
            <Chip
              label={getOrderType(order)}
              size="small"
              sx={{
                backgroundColor: "info.50",
                color: "info.main",
                fontWeight: "medium",
                border: "1px solid",
                borderColor: "info.200",
              }}
            />
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor:
                    getContractorName(order) === "Chưa phân công"
                      ? "warning.main"
                      : "success.main",
                }}
              />
              <Typography
                variant="body2"
                fontWeight="medium"
                color={
                  getContractorName(order) === "Chưa phân công"
                    ? "warning.main"
                    : "text.primary"
                }
              >
                {getContractorName(order)}
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Typography variant="body2" fontWeight="medium">
              {formatDate(getCreatedDate(order))}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2" fontWeight="bold" color="success.main">
              {getTotalAmount(order).toLocaleString("vi-VN")}₫
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2" fontWeight="medium" color="info.main">
              {getDepositAmount(order).toLocaleString("vi-VN")}₫
            </Typography>
          </TableCell>
          <TableCell>
            <Typography
              variant="body2"
              fontWeight="medium"
              color="warning.main"
            >
              {getRemainingAmount(order).toLocaleString("vi-VN")}₫
            </Typography>
          </TableCell>
          <TableCell>
            <Chip
              label={ORDER_STATUS_MAP[order.status]?.label || order.status}
              color={ORDER_STATUS_MAP[order.status]?.color || "default"}
              size="small"
              sx={{
                fontWeight: "medium",
                boxShadow: 1,
              }}
            />
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                color={order.status === "DEPOSITED" ? "info" : "primary"}
                size="small"
                onClick={() => onViewDetail(order.id || order.orderId)}
                startIcon={order.status === "DEPOSITED" ? <ShippingIcon /> : undefined}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "medium",
                  boxShadow: 2,
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {order.status === "DEPOSITED" ? "Báo ngày giao dự kiến" : "Xem chi tiết"}
              </Button>

              {/* Nút tải lên hợp đồng cho trạng thái PENDING_CONTRACT */}
              {order.status === "PENDING_CONTRACT" && (
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<UploadIcon />}
                  onClick={() => onUploadContract(order.id || order.orderId)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "medium",
                    boxShadow: 1,
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Gửi hợp đồng
                </Button>
              )}

              {/* Nút gửi lại hợp đồng cho trạng thái CONTRACT_DISCUSS */}
              {order.status === "CONTRACT_DISCUSS" && (
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<UploadIcon />}
                  onClick={() => onUploadRevisedContract(order.id || order.orderId)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "medium",
                    boxShadow: 1,
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Gửi lại hợp đồng
                </Button>
              )}

              {/* Nút xem hợp đồng cho trạng thái CONTRACT_SIGNED */}
              {order.status === "CONTRACT_SIGNED" && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={contractViewLoading ? <CircularProgress size={16} /> : <DescriptionIcon />}
                    onClick={() => onViewContract(order.id || order.orderId)}
                    disabled={contractViewLoading}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: "medium",
                      boxShadow: 1,
                      "&:hover": {
                        boxShadow: 2,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {contractViewLoading ? "Đang tải..." : "Xem hợp đồng"}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    startIcon={<UploadIcon />}
                    onClick={() => onRequestResign(order.id || order.orderId)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: "medium",
                      boxShadow: 1,
                      "&:hover": {
                        boxShadow: 2,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Yêu cầu ký lại
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<DescriptionIcon />}
                    onClick={() => onConfirmSigned(order.id || order.orderId)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: "medium",
                      boxShadow: 1,
                      "&:hover": {
                        boxShadow: 2,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Xác nhận đã ký
                  </Button>
                </>
              )}
            </Box>
          </TableCell>
        </TableRow>
        {Array.isArray(orderDetails) && orderDetails.length > 0 && (
          <TableRow key={`${order.id}-details`}>
            <TableCell
              colSpan={10}
              sx={{
                background: "linear-gradient(135deg, #f8f9ff 0%, #f0f2f5 100%)",
                p: 0,
              }}
            >
              <Box sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    "&:before": {
                      content: '""',
                      width: 4,
                      height: 20,
                      backgroundColor: "primary.main",
                      borderRadius: 2,
                      mr: 1,
                    },
                  }}
                >
                  Chi tiết đơn hàng ({orderDetails.length} sản phẩm)
                </Typography>

                <Grid container spacing={2}>
                  {orderDetails.map((detail, i) => {
                    console.log(
                      `Rendering detail ${i} for order ${order.id}:`,
                      detail
                    );
                    return (
                      <Grid item xs={12} key={detail.id || i}>
                        <Card
                          elevation={2}
                          sx={{
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            {/* Header thông tin chính */}
                            <Box
                              sx={{
                                background:
                                  "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                              }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    gutterBottom
                                  >
                                    Số tiền thi công
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    color="success.main"
                                    fontWeight="bold"
                                  >
                                    {detail.detailConstructionAmount?.toLocaleString(
                                      "vi-VN"
                                    )}
                                    ₫
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    gutterBottom
                                  >
                                    Số lượng
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    color="info.main"
                                    fontWeight="bold"
                                  >
                                    {detail.quantity}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    gutterBottom
                                  >
                                    ID Chi tiết
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    #{detail.id || `Item-${i + 1}`}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>

                            {detail.customerChoiceHistories && (
                              <Box>
                                {/* Thông tin sản phẩm */}
                                <Box sx={{ mb: 3 }}>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                    color="primary"
                                    sx={{
                                      mb: 2,
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        backgroundColor: "primary.main",
                                        mr: 1,
                                      }}
                                    />
                                    Thông tin sản phẩm
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                      <Box
                                        sx={{
                                          p: 2,
                                          bgcolor: "grey.50",
                                          borderRadius: 2,
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          display="block"
                                        >
                                          Loại sản phẩm
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          fontWeight="medium"
                                        >
                                          {
                                            detail.customerChoiceHistories
                                              .productTypeName
                                          }
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                      <Box
                                        sx={{
                                          p: 2,
                                          bgcolor: "grey.50",
                                          borderRadius: 2,
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          display="block"
                                        >
                                          Công thức tính
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          fontWeight="medium"
                                        >
                                          {
                                            detail.customerChoiceHistories
                                              .calculateFormula
                                          }
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                      <Box
                                        sx={{
                                          p: 2,
                                          bgcolor: "success.50",
                                          borderRadius: 2,
                                          border: "1px solid",
                                          borderColor: "success.200",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          color="success.dark"
                                          display="block"
                                        >
                                          Tổng tiền
                                        </Typography>
                                        <Typography
                                          variant="body1"
                                          fontWeight="bold"
                                          color="success.main"
                                        >
                                          {detail.customerChoiceHistories.totalAmount?.toLocaleString(
                                            "vi-VN"
                                          )}
                                          ₫
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  </Grid>
                                </Box>

                                {/* Thuộc tính */}
                                {detail.customerChoiceHistories
                                  .attributeSelections &&
                                  detail.customerChoiceHistories
                                    .attributeSelections.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        color="primary"
                                        sx={{
                                          mb: 2,
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            backgroundColor: "warning.main",
                                            mr: 1,
                                          }}
                                        />
                                        Thuộc tính sản phẩm (
                                        {
                                          detail.customerChoiceHistories
                                            .attributeSelections.length
                                        }{" "}
                                        thuộc tính)
                                      </Typography>
                                      <Grid container spacing={2}>
                                        {detail.customerChoiceHistories.attributeSelections.map(
                                          (attr, idx) => (
                                            <Grid item xs={12} md={6} key={idx}>
                                              <Card
                                                variant="outlined"
                                                sx={{
                                                  borderRadius: 2,
                                                  transition: "all 0.2s ease",
                                                  "&:hover": {
                                                    borderColor: "primary.main",
                                                  },
                                                }}
                                              >
                                                <CardContent sx={{ p: 2 }}>
                                                  <Typography
                                                    variant="subtitle2"
                                                    color="primary"
                                                    fontWeight="bold"
                                                    gutterBottom
                                                  >
                                                    {attr.attribute}
                                                  </Typography>
                                                  <Typography
                                                    variant="body2"
                                                    sx={{ mb: 1 }}
                                                  >
                                                    <strong>Giá trị:</strong>{" "}
                                                    {attr.value} ({attr.unit})
                                                  </Typography>
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      flexWrap: "wrap",
                                                      gap: 1,
                                                      mb: 1,
                                                    }}
                                                  >
                                                    <Chip
                                                      label={`Vật tư: ${attr.materialPrice?.toLocaleString(
                                                        "vi-VN"
                                                      )}₫`}
                                                      size="small"
                                                      color="info"
                                                      variant="outlined"
                                                    />
                                                    <Chip
                                                      label={`Đơn giá: ${attr.unitPrice?.toLocaleString(
                                                        "vi-VN"
                                                      )}₫`}
                                                      size="small"
                                                      color="secondary"
                                                      variant="outlined"
                                                    />
                                                  </Box>
                                                  <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    display="block"
                                                  >
                                                    Công thức:{" "}
                                                    {attr.calculateFormula}
                                                  </Typography>
                                                  <Typography
                                                    variant="body2"
                                                    color="success.main"
                                                    fontWeight="bold"
                                                    sx={{ mt: 1 }}
                                                  >
                                                    Tổng:{" "}
                                                    {attr.subTotal?.toLocaleString(
                                                      "vi-VN"
                                                    )}
                                                    ₫
                                                  </Typography>
                                                </CardContent>
                                              </Card>
                                            </Grid>
                                          )
                                        )}
                                      </Grid>
                                    </Box>
                                  )}

                                {/* Kích thước */}
                                {detail.customerChoiceHistories
                                  .sizeSelections &&
                                  detail.customerChoiceHistories.sizeSelections
                                    .length > 0 && (
                                    <Box>
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        color="primary"
                                        sx={{
                                          mb: 2,
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            backgroundColor: "info.main",
                                            mr: 1,
                                          }}
                                        />
                                        Kích thước (
                                        {
                                          detail.customerChoiceHistories
                                            .sizeSelections.length
                                        }{" "}
                                        thông số)
                                      </Typography>
                                      <Grid container spacing={1}>
                                        {detail.customerChoiceHistories.sizeSelections.map(
                                          (size, idx) => (
                                            <Grid
                                              item
                                              xs={6}
                                              sm={4}
                                              md={3}
                                              key={idx}
                                            >
                                              <Box
                                                sx={{
                                                  p: 1.5,
                                                  bgcolor: "info.50",
                                                  borderRadius: 2,
                                                  border: "1px solid",
                                                  borderColor: "info.200",
                                                  textAlign: "center",
                                                }}
                                              >
                                                <Typography
                                                  variant="caption"
                                                  color="info.dark"
                                                  display="block"
                                                  fontWeight="medium"
                                                >
                                                  {size.size}
                                                </Typography>
                                                <Typography
                                                  variant="body2"
                                                  fontWeight="bold"
                                                  color="info.main"
                                                >
                                                  {size.value}
                                                </Typography>
                                              </Box>
                                            </Grid>
                                          )
                                        )}
                                      </Grid>
                                    </Box>
                                  )}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </TableCell>
          </TableRow>
        )}
      </>
    );
  }
);

OrderRow.displayName = "OrderRow";

const DashboardContent = ({
  stats,
  orders = [],
  onViewDetail,
  statusFilter,
  onStatusFilterChange,
  onRefreshOrders, // Thêm callback để refresh danh sách orders
}) => {
  const dispatch = useDispatch();
  
  // Lấy danh sách contractors từ Redux store
  const { contractors } = useSelector((state) => state.contractor);
  
  // State lưu orderDetails cho từng đơn hàng
  const [orderDetailsMap, setOrderDetailsMap] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // State cho upload contract dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // State cho upload revised contract dialog
  const [uploadRevisedDialogOpen, setUploadRevisedDialogOpen] = useState(false);
  const [selectedRevisedOrderId, setSelectedRevisedOrderId] = useState(null);

  // State cho xem hợp đồng
  const [contractViewLoading, setContractViewLoading] = useState(false);
  const [contractDialog, setContractDialog] = useState({
    open: false,
    contract: null,
    orderId: null,
  });

  // State cho thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State cho contractor list dialog
  const [contractorDialog, setContractorDialog] = useState({
    open: false,
    order: null,
  });

  // Debounce search input for better performance
  useEffect(() => {
    if (search !== debouncedSearch) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  // Lấy orderDetails cho mỗi đơn hàng khi orders thay đổi
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const fetchDetails = async () => {
      const promises = orders.map(async (order) => {
        if (!orderDetailsMap[order.id]) {
          console.log(`Fetching details for order ${order.id}`);
          const res = await getOrderDetailsApi(order.id);
          console.log(`Order ${order.id} details response:`, res);
          // Sử dụng res.data thay vì res.result vì API trả về data
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            console.log(`Order ${order.id} has ${res.data.length} details`);
            return { orderId: order.id, details: res.data };
          } else {
            console.log(
              `Order ${order.id} - No details or invalid format:`,
              res
            );
          }
        }
        return null;
      });
      const results = await Promise.all(promises);
      const newDetails = {};
      results.forEach((item) => {
        if (item) newDetails[item.orderId] = item.details;
      });
      console.log("New order details map:", newDetails);
      if (Object.keys(newDetails).length > 0) {
        setOrderDetailsMap((prev) => ({ ...prev, ...newDetails }));
      }
    };
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  // Memoized utility functions for better performance
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      console.warn("Invalid date string:", dateString);
      return "";
    }
  }, []);

  const getCustomerName = useCallback((order) => {
    if (order?.users?.fullName) return order.users.fullName;
    return "Ẩn danh";
  }, []);

  const getCustomerPhone = useCallback((order) => {
    return order?.users?.phone || "Chưa có";
  }, []);

  const getCustomerEmail = useCallback((order) => {
    return order?.users?.email || "Chưa có";
  }, []);

  const getContractorName = useCallback((order) => {
    return order?.contractors?.name || "Chưa phân công";
  }, []);

  const getOrderType = useCallback((order) => {
    const typeMap = {
      AI_DESIGN: "Thiết kế AI",
      CUSTOM_DESIGN: "Thiết kế tùy chỉnh",
      CUSTOM_DESIGN_WITH_CONSTRUCTION: "Thiết kế + Thi công",
    };
    return typeMap[order.orderType] || order.orderType;
  }, []);

  const getTotalAmount = useCallback((order) => {
    // Sử dụng totalOrderAmount từ API response
    return order.totalOrderAmount || 0;
  }, []);

  const getDepositAmount = useCallback((order) => {
    // Sử dụng totalOrderDepositAmount từ API response
    return order.totalOrderDepositAmount || 0;
  }, []);

  const getRemainingAmount = useCallback((order) => {
    // Sử dụng totalOrderRemainingAmount từ API response
    return order.totalOrderRemainingAmount || 0;
  }, []);

  const getCreatedDate = useCallback((order) => {
    // Lấy ngày tạo từ đơn hàng, ưu tiên createdAt của order
    return (
      order?.createdAt ||
      order?.updatedAt ||
      order?.orderDate ||
      order?.deliveryDate ||
      new Date().toISOString()
    );
  }, []);

  const generateOrderCode = useCallback((order, index) => {
    // Sử dụng orderCode từ API response nếu có
    if (order?.orderCode) {
      return order.orderCode;
    }
    
    // Fallback logic nếu không có orderCode
    try {
      const date = new Date(
        order.deliveryDate || order.orderDate || order?.users?.createdAt
      );
      if (isNaN(date.getTime()))
        return `DH-${(index + 1).toString().padStart(4, "0")}`;

      const year = date.getFullYear().toString().slice(-2);
      const orderNumber = (index + 1).toString().padStart(4, "0");
      return `DH${year}${orderNumber}`;
    } catch {
      console.warn("Error generating order code for order:", order);
      return `DH-${(index + 1).toString().padStart(4, "0")}`;
    }
  }, []);

  // Handler để xem hợp đồng
  const handleViewContract = useCallback(async (orderId) => {
    setContractViewLoading(true);
    try {
      const response = await getOrderContractApi(orderId);
      if (response.success) {
        setContractDialog({
          open: true,
          contract: response.data,
          orderId: orderId,
        });
        
        setSnackbar({
          open: true,
          message: "Đã tải thông tin hợp đồng thành công!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Không thể lấy thông tin hợp đồng",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra khi lấy thông tin hợp đồng",
        severity: "error",
      });
    } finally {
      setContractViewLoading(false);
    }
  }, []);

  // Handler đóng dialog xem hợp đồng
  const handleCloseContractDialog = useCallback(() => {
    setContractDialog({
      open: false,
      contract: null,
      orderId: null,
    });
  }, []);

  // Handler xem hợp đồng từ S3
  const handleViewContractFile = useCallback(async (contractUrl, fileName) => {
    setContractViewLoading(true);
    try {
      const result = await openFileInNewTab(contractUrl, 30);
      if (result.success) {
        setSnackbar({
          open: true,
          message: `Đã mở ${fileName} thành công!`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || `Không thể mở ${fileName}`,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error opening contract file:", error);
      setSnackbar({
        open: true,
        message: `Có lỗi xảy ra khi mở ${fileName}`,
        severity: "error",
      });
    } finally {
      setContractViewLoading(false);
    }
  }, []);

  // Handler để mở dialog upload hợp đồng
  const handleUploadContract = useCallback((orderId) => {
    setSelectedOrderId(orderId);
    setUploadDialogOpen(true);
  }, []);

  // Handler để mở dialog upload revised contract
  const handleUploadRevisedContract = useCallback((orderId) => {
    setSelectedRevisedOrderId(orderId);
    setUploadRevisedDialogOpen(true);
  }, []);

  // Handler khi upload thành công
  const handleUploadSuccess = useCallback(() => {
    setSnackbar({
      open: true,
      message: "Đã gửi hợp đồng thành công!",
      severity: "success",
    });

    // Tự động làm mới danh sách orders
    if (onRefreshOrders) {
      onRefreshOrders();
    }
  }, [onRefreshOrders]);

  // Handler khi upload revised contract thành công
  const handleUploadRevisedSuccess = useCallback(() => {
    setSnackbar({
      open: true,
      message: "Đã gửi lại hợp đồng chỉnh sửa thành công!",
      severity: "success",
    });

    // Tự động làm mới danh sách orders
    if (onRefreshOrders) {
      onRefreshOrders();
    }
  }, [onRefreshOrders]);

  // Handler yêu cầu khách hàng ký lại hợp đồng
  const handleRequestResign = useCallback(async (orderId) => {
    try {
      setSnackbar({
        open: true,
        message: "Đang gửi yêu cầu ký lại hợp đồng...",
        severity: "info",
      });

      await dispatch(contractResignOrder(orderId)).unwrap();
      
      setSnackbar({
        open: true,
        message: "Đã gửi yêu cầu ký lại hợp đồng thành công!",
        severity: "success",
      });

      // Tự động làm mới danh sách orders
      if (onRefreshOrders) {
        onRefreshOrders();
      }
    } catch (error) {
      console.error("Error requesting contract resign:", error);
      setSnackbar({
        open: true,
        message: error || "Có lỗi xảy ra khi gửi yêu cầu ký lại hợp đồng",
        severity: "error",
      });
    }
  }, [dispatch, onRefreshOrders]);

  // Handler xác nhận hợp đồng đã ký
  const handleConfirmSigned = useCallback(async (orderId) => {
    try {
      setSnackbar({
        open: true,
        message: "Đang xác nhận hợp đồng đã ký...",
        severity: "info",
      });

      await dispatch(contractSignedOrder(orderId)).unwrap();
      
      setSnackbar({
        open: true,
        message: "Đã xác nhận hợp đồng đã ký thành công!",
        severity: "success",
      });

      // Tự động làm mới danh sách orders
      if (onRefreshOrders) {
        onRefreshOrders();
      }
    } catch (error) {
      console.error("Error confirming contract signed:", error);
      setSnackbar({
        open: true,
        message: error || "Có lỗi xảy ra khi xác nhận hợp đồng đã ký",
        severity: "error",
      });
    }
  }, [dispatch, onRefreshOrders]);

  // Handler đóng snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Handler wrapper cho xem chi tiết - lấy contractors nếu cần
  const handleViewDetail = useCallback(async (orderId) => {
    // Tìm order để kiểm tra trạng thái
    const order = orders.find(o => o.id === orderId);
    
    // Nếu đơn hàng ở trạng thái DEPOSITED, lấy danh sách contractors và mở dialog
    if (order && order.status === 'DEPOSITED') {
      try {
        await dispatch(fetchAllContractors()).unwrap();
        console.log('Đã lấy danh sách contractors cho đơn hàng DEPOSITED');
        
        // Mở dialog hiển thị danh sách nhà thầu
        setContractorDialog({
          open: true,
          order: order,
        });
        
        return; // Không gọi onViewDetail gốc cho trạng thái DEPOSITED
      } catch (error) {
        console.error('Lỗi khi lấy danh sách contractors:', error);
        setSnackbar({
          open: true,
          message: "Có lỗi khi tải danh sách nhà thầu",
          severity: "warning",
        });
      }
    }
    
    // Gọi hàm onViewDetail gốc cho các trạng thái khác
    if (onViewDetail) {
      onViewDetail(orderId);
    }
  }, [dispatch, orders, onViewDetail]);

  // Handler đóng contractor dialog
  const handleCloseContractorDialog = useCallback(() => {
    setContractorDialog({
      open: false,
      order: null,
    });
  }, []);

  // Handler báo ngày giao dự kiến
  const handleReportDelivery = useCallback(async (orderId, estimatedDeliveryDate, contractorId) => {
    try {
      console.log('Báo ngày giao dự kiến:', { orderId, estimatedDeliveryDate, contractorId });
      
      await dispatch(updateOrderEstimatedDeliveryDate({
        orderId,
        estimatedDeliveryDate,
        contractorId
      })).unwrap();

      setSnackbar({
        open: true,
        message: "Báo ngày giao dự kiến thành công!",
        severity: "success",
      });

      // Refresh danh sách orders để cập nhật thông tin mới
      if (onRefreshOrders) {
        onRefreshOrders();
      }

    } catch (error) {
      console.error('Lỗi khi báo ngày giao dự kiến:', error);
      setSnackbar({
        open: true,
        message: error || "Có lỗi khi báo ngày giao dự kiến",
        severity: "error",
      });
    }
  }, [dispatch, onRefreshOrders]);

  // Hàm tạo thông báo cho từng trạng thái
  const getEmptyStateMessage = useCallback((statusFilter) => {
    const statusMessages = {
      'PENDING_CONTRACT': {
        icon: <PendingIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />,
        title: 'Hiện tại không có đơn hàng nào đang chờ gửi hợp đồng',
        subtitle: 'Các đơn hàng AI Design sẽ xuất hiện ở đây khi cần gửi hợp đồng'
      },
      'CONTRACT_SENT': {
        icon: <DescriptionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />,
        title: 'Hiện tại không có đơn hàng nào đã gửi hợp đồng',
        subtitle: 'Các đơn hàng đã gửi hợp đồng đến khách hàng sẽ xuất hiện ở đây'
      },
      'CONTRACT_SIGNED': {
        icon: <DescriptionIcon sx={{ fontSize: 80, color: 'success.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào đã ký hợp đồng',
        subtitle: 'Các đơn hàng mà khách hàng đã ký hợp đồng sẽ xuất hiện ở đây'
      },
      'CONTRACT_DISCUSS': {
        icon: <PeopleIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào đang đàm phán hợp đồng',
        subtitle: 'Các đơn hàng đang trong quá trình thương lượng hợp đồng sẽ xuất hiện ở đây'
      },
      'CONTRACT_RESIGNED': {
        icon: <PendingIcon sx={{ fontSize: 80, color: 'error.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào bị từ chối hợp đồng',
        subtitle: 'Các đơn hàng bị khách hàng từ chối hợp đồng sẽ xuất hiện ở đây'
      },
      'CONTRACT_CONFIRMED': {
        icon: <DescriptionIcon sx={{ fontSize: 80, color: 'success.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào đã xác nhận hợp đồng',
        subtitle: 'Các đơn hàng đã được xác nhận hợp đồng sẽ xuất hiện ở đây'
      },
      'DEPOSITED': {
        icon: <MoneyIcon sx={{ fontSize: 80, color: 'info.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào đã đặt cọc',
        subtitle: 'Các đơn hàng mà khách hàng đã thanh toán tiền cọc sẽ xuất hiện ở đây'
      },
      'IN_PROGRESS': {
        icon: <PendingIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào đang thực hiện',
        subtitle: 'Các đơn hàng đang trong quá trình thực hiện sẽ xuất hiện ở đây'
      },
      'PRODUCING': {
        icon: <ShippingIcon sx={{ fontSize: 80, color: 'info.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào đang sản xuất',
        subtitle: 'Các đơn hàng đang trong quá trình sản xuất sẽ xuất hiện ở đây'
      },
      'PRODUCTION_COMPLETED': {
        icon: <ShippingIcon sx={{ fontSize: 80, color: 'success.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào hoàn thành sản xuất',
        subtitle: 'Các đơn hàng đã hoàn thành sản xuất sẽ xuất hiện ở đây'
      },
      'DELIVERING': {
        icon: <ShippingIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào đang giao hàng',
        subtitle: 'Các đơn hàng đang trong quá trình giao hàng sẽ xuất hiện ở đây'
      },
      'INSTALLED': {
        icon: <ShippingIcon sx={{ fontSize: 80, color: 'success.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào đã lắp đặt',
        subtitle: 'Các đơn hàng đã hoàn thành lắp đặt sẽ xuất hiện ở đây'
      },
      'ORDER_COMPLETED': {
        icon: <OrderIcon sx={{ fontSize: 80, color: 'success.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào hoàn tất',
        subtitle: 'Các đơn hàng đã hoàn tất hoàn toàn sẽ xuất hiện ở đây'
      },
      'CANCELLED': {
        icon: <OrderIcon sx={{ fontSize: 80, color: 'error.main', mb: 2, opacity: 0.7 }} />,
        title: 'Hiện tại không có đơn hàng nào bị hủy',
        subtitle: 'Các đơn hàng đã bị hủy sẽ xuất hiện ở đây'
      }
    };

    return statusMessages[statusFilter] || {
      icon: <OrderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />,
      title: 'Hiện tại không có đơn hàng nào',
      subtitle: 'Các đơn hàng sẽ xuất hiện ở đây khi có dữ liệu'
    };
  }, []);

  // Filtered orders with useMemo for performance optimization
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    return orders.filter((order) => {
      // Filter by status first (more efficient)
      if (statusFilter && order.status !== statusFilter) {
        return false;
      }

      // Special filter for PENDING_CONTRACT: only show AI_DESIGN orders
      if (
        statusFilter === "PENDING_CONTRACT" &&
        order.orderType !== "AI_DESIGN"
      ) {
        return false;
      }

      // Then filter by search term
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const customerName = getCustomerName(order).toLowerCase();
        const customerPhone = getCustomerPhone(order).toLowerCase();
        const customerEmail = getCustomerEmail(order).toLowerCase();
        const orderIdStr = String(order.id || order.orderId || "");

        return (
          customerName.includes(searchLower) ||
          customerPhone.includes(searchLower) ||
          customerEmail.includes(searchLower) ||
          orderIdStr.includes(debouncedSearch)
        );
      }

      return true;
    });
  }, [
    orders,
    debouncedSearch,
    statusFilter,
    getCustomerName,
    getCustomerPhone,
    getCustomerEmail,
  ]);

  // Memoized stats formatting for better performance
  const formattedStats = useMemo(
    () => ({
      totalOrders: stats?.totalOrders || 0,
      pendingOrders: stats?.pendingOrders || 0,
      confirmedOrders: stats?.confirmedOrders || 0,
      totalRevenue: (stats?.totalRevenue || 0).toLocaleString("vi-VN"),
    }),
    [stats]
  );

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        mb={4}
        sx={{ flexWrap: "wrap" }}
      >
        <Card
          sx={{
            flex: 1,
            minWidth: 240,
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <OrderIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Tổng đơn hàng
                </Typography>
                <Typography variant="h4">
                  {formattedStats.totalOrders}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 240,
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <PendingIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Chờ xác nhận
                </Typography>
                <Typography variant="h4">
                  {formattedStats.pendingOrders}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 240,
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <ShippingIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Đã xác nhận
                </Typography>
                <Typography variant="h4">
                  {formattedStats.confirmedOrders}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 240,
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <MoneyIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Tổng doanh thu
                </Typography>
                <Typography variant="h4">
                  {formattedStats.totalRevenue}₫
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Filter & Search */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Trạng thái"
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="PENDING_CONTRACT">Chờ hợp đồng</MenuItem>
              <MenuItem value="CONTRACT_SENT">Đã gửi hợp đồng</MenuItem>
              <MenuItem value="CONTRACT_SIGNED">Đã ký hợp đồng</MenuItem>
              <MenuItem value="CONTRACT_DISCUSS">Đàm phán hợp đồng</MenuItem>
              <MenuItem value="CONTRACT_RESIGNED">Từ chối hợp đồng</MenuItem>
              <MenuItem value="CONTRACT_CONFIRMED">Xác nhận hợp đồng</MenuItem>
              <MenuItem value="DEPOSITED">Đã đặt cọc</MenuItem>
              <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
              <MenuItem value="PRODUCING">Đang sản xuất</MenuItem>
              <MenuItem value="PRODUCTION_COMPLETED">
                Hoàn thành sản xuất
              </MenuItem>
              <MenuItem value="DELIVERING">Đang giao hàng</MenuItem>
              <MenuItem value="INSTALLED">Đã lắp đặt</MenuItem>
              <MenuItem value="ORDER_COMPLETED">Hoàn tất đơn hàng</MenuItem>
              <MenuItem value="CANCELLED">Đã hủy</MenuItem>
            </Select>
          </FormControl>
          <TextField
            placeholder="Tìm kiếm theo tên khách hoặc mã đơn"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isSearching ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SearchIcon />
                  )}
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 220 }}
          />
        </Stack>
      </Card>

      {/* Orders Table */}
      {statusFilter && filteredOrders.length === 0 ? (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            border: "1px solid",
            borderColor: "divider",
            p: 4,
            textAlign: "center",
          }}
        >
          <Box sx={{ py: 6 }}>
            {getEmptyStateMessage(statusFilter).icon}
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              {getEmptyStateMessage(statusFilter).title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {getEmptyStateMessage(statusFilter).subtitle}
            </Typography>
          </Box>
        </Card>
      ) : (
        <Card
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    "& .MuiTableCell-head": {
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      letterSpacing: "0.025em",
                    },
                  }}
                >
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Loại đơn</TableCell>
                  <TableCell>Nhà thầu</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Tiền cọc</TableCell>
                  <TableCell>Tiền còn lại</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  "& .MuiTableRow-root": {
                    "&:nth-of-type(even)": {
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    },
                    "&:last-child td, &:last-child th": {
                      border: 0,
                    },
                  },
                }}
              >
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: "center", py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        {statusFilter ? 
                          "Không có đơn hàng nào ở trạng thái này" : 
                          "Không có đơn hàng nào phù hợp với bộ lọc hiện tại"
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order, idx) => (
                    <OrderRow
                      key={order.id || idx}
                      order={order}
                      index={idx}
                      formatDate={formatDate}
                      getCustomerName={getCustomerName}
                      getCustomerPhone={getCustomerPhone}
                      getCustomerEmail={getCustomerEmail}
                      getContractorName={getContractorName}
                      getOrderType={getOrderType}
                      getTotalAmount={getTotalAmount}
                      getDepositAmount={getDepositAmount}
                      getRemainingAmount={getRemainingAmount}
                      getCreatedDate={getCreatedDate}
                      generateOrderCode={generateOrderCode}
                      onViewDetail={handleViewDetail}
                      onUploadContract={handleUploadContract}
                      onUploadRevisedContract={handleUploadRevisedContract}
                      onViewContract={handleViewContract}
                      onRequestResign={handleRequestResign}
                      onConfirmSigned={handleConfirmSigned}
                      contractViewLoading={contractViewLoading}
                      orderDetails={orderDetailsMap[order.id]}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Upload Contract Dialog */}
      <UploadContractDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        orderId={selectedOrderId}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Upload Revised Contract Dialog */}
      <UploadRevisedContractDialog
        open={uploadRevisedDialogOpen}
        onClose={() => setUploadRevisedDialogOpen(false)}
        orderId={selectedRevisedOrderId}
        onUploadSuccess={handleUploadRevisedSuccess}
      />

      {/* Contract View Dialog */}
      <Dialog 
        open={contractDialog.open} 
        onClose={handleCloseContractDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon color="primary" />
            <Typography variant="h6">Thông tin hợp đồng</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {contractDialog.contract && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Số hợp đồng
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {contractDialog.contract.contractNumber || 'Chưa có số hợp đồng'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Trạng thái
                    </Typography>
                    <Chip 
                      label={contractDialog.contract.status} 
                      color="primary" 
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Ngày gửi
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {contractDialog.contract.sentDate ? 
                        new Date(contractDialog.contract.sentDate).toLocaleDateString('vi-VN') : 
                        'Chưa gửi'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Ngày ký
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {contractDialog.contract.signedDate ? 
                        new Date(contractDialog.contract.signedDate).toLocaleDateString('vi-VN') : 
                        'Chưa ký'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
                    <Typography variant="subtitle2" color="success.dark" gutterBottom>
                      Phần trăm cọc
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      {contractDialog.contract.depositPercentChanged}%
                    </Typography>
                  </Box>
                </Grid>

                {contractDialog.contract.contractUrl && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
                      <Typography variant="subtitle2" color="primary.dark" gutterBottom>
                        Hợp đồng gốc
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={contractViewLoading ? <CircularProgress size={16} /> : <DescriptionIcon />}
                        onClick={() => handleViewContractFile(contractDialog.contract.contractUrl, 'hợp đồng gốc')}
                        disabled={contractViewLoading}
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        {contractViewLoading ? 'Đang mở...' : 'Xem hợp đồng gốc'}
                      </Button>
                    </Box>
                  </Grid>
                )}

                {contractDialog.contract.signedContractUrl && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
                      <Typography variant="subtitle2" color="success.dark" gutterBottom>
                        Hợp đồng đã ký
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={contractViewLoading ? <CircularProgress size={16} /> : <DescriptionIcon />}
                        onClick={() => handleViewContractFile(contractDialog.contract.signedContractUrl, 'hợp đồng đã ký')}
                        disabled={contractViewLoading}
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        {contractViewLoading ? 'Đang mở...' : 'Xem hợp đồng đã ký'}
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContractDialog}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contractor List Dialog */}
      <ContractorListDialog
        open={contractorDialog.open}
        onClose={handleCloseContractorDialog}
        contractors={contractors}
        order={contractorDialog.order}
        generateOrderCode={generateOrderCode}
        onReportDelivery={handleReportDelivery}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardContent;
