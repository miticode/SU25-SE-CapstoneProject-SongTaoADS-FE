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
  TablePagination,
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
  useMediaQuery,
  useTheme,
  Divider,
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
import { ORDER_STATUS_MAP, ORDER_TYPE_MAP } from "../../store/features/order/orderSlice";

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

// Component hiển thị hình ảnh thiết kế
const DesignImage = memo(({ imagePath, alt = "Thiết kế", maxHeight = "400px" }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      if (imagePath) {
        setLoading(true);
        setError(false);
        try {
          const result = await getImageFromS3(imagePath);
          if (result.success) {
            setImageUrl(result.imageUrl);
          } else {
            setError(true);
          }
        } catch (error) {
          console.error("Error fetching design image:", error);
          setError(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchImage();
  }, [imagePath]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          bgcolor: "grey.50",
          borderRadius: 2,
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error || !imageUrl) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          p: 3,
          bgcolor: "grey.50",
          borderRadius: 2,
          minHeight: "200px",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Không thể tải hình ảnh thiết kế
        </Typography>
      </Box>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      style={{
        maxWidth: "100%",
        maxHeight: maxHeight,
        objectFit: "contain",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    />
  );
});

DesignImage.displayName = "DesignImage";

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

// Component OrderDetailDialog
const OrderDetailDialog = memo(({ open, onClose, order, orderDetails, generateOrderCode }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="h6">
            Chi tiết đơn hàng {order ? generateOrderCode(order, 0) : '#N/A'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          {/* Thông tin cơ bản đơn hàng */}
          {order && (
            <Box sx={{ mb: 4 }}>
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
                Thông tin đơn hàng
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      🏷️ Mã đơn hàng
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                      {order.orderCode || generateOrderCode(order, 0)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      📋 Loại đơn hàng
                    </Typography>
                    <Chip
                      label={order.orderType === 'AI_DESIGN' ? 'AI Design' : order.orderType}
                      color="info"
                      size="small"
                      sx={{ fontWeight: "medium", mt: 0.5 }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      📊 Trạng thái
                    </Typography>
                    <Chip
                      label={ORDER_STATUS_MAP[order.status]?.label || order.status}
                      color={ORDER_STATUS_MAP[order.status]?.color || "default"}
                      size="small"
                      sx={{ fontWeight: "medium", mt: 0.5 }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {order.note && (
                <Box sx={{ p: 2, bgcolor: "warning.50", borderRadius: 2, border: "1px solid", borderColor: "warning.200" }}>
                  <Typography variant="caption" color="warning.dark" display="block">
                    📝 Ghi chú
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {order.note}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Thông tin tổng quan đơn hàng */}
          {order && (
            <Box sx={{ mb: 4 }}>
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
                Thông tin tổng quan
              </Typography>
              
              <Grid container spacing={3}>
                {/* Tổng đơn hàng */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2, border: '2px solid', borderColor: 'primary.200', bgcolor: 'primary.50' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="primary.dark" gutterBottom>
                        💰 Tổng đơn hàng
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                        {order.totalOrderAmount?.toLocaleString("vi-VN") || 0} VNĐ
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" color="success.main">
                          🟢 Đã cọc: {order.totalOrderDepositAmount?.toLocaleString("vi-VN") || 0} VNĐ
                        </Typography>
                        <Typography variant="caption" color="warning.main">
                          🟡 Còn lại: {order.totalOrderRemainingAmount?.toLocaleString("vi-VN") || 0} VNĐ
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Chi phí thi công */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2, border: '2px solid', borderColor: 'info.200', bgcolor: 'info.50' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="info.dark" gutterBottom>
                        🔨 Chi phí thi công
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="info.main" gutterBottom>
                        {order.totalConstructionAmount?.toLocaleString("vi-VN") || 0} VNĐ
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" color="success.main">
                          🟢 Đã cọc: {order.depositConstructionAmount?.toLocaleString("vi-VN") || 0} VNĐ
                        </Typography>
                        <Typography variant="caption" color="warning.main">
                          🟡 Còn lại: {order.remainingConstructionAmount?.toLocaleString("vi-VN") || 0} VNĐ
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Chi phí thiết kế */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2, border: '2px solid', borderColor: 'warning.200', bgcolor: 'warning.50' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                        🎨 Chi phí thiết kế
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="warning.main" gutterBottom>
                        {order.totalDesignAmount?.toLocaleString("vi-VN") || 0} VNĐ
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" color="success.main">
                          🟢 Đã cọc: {order.depositDesignAmount?.toLocaleString("vi-VN") || 0} VNĐ
                        </Typography>
                        <Typography variant="caption" color="warning.main">
                          🟡 Còn lại: {order.remainingDesignAmount?.toLocaleString("vi-VN") || 0} VNĐ
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Thông tin khác */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      📍 Địa chỉ giao hàng
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {order.address || 'Chưa có thông tin'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      🚚 Ngày giao dự kiến
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {order.estimatedDeliveryDate ? 
                        new Date(order.estimatedDeliveryDate).toLocaleDateString('vi-VN') : 
                        'Chưa có thông tin'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {Array.isArray(orderDetails) && orderDetails.length > 0 ? (
            <>
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
                Chi tiết sản phẩm ({orderDetails.length} sản phẩm)
              </Typography>

              <Grid container spacing={2}>
                {orderDetails.map((detail, i) => (
                  <Grid item xs={12} key={i}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Header sản phẩm */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 3,
                            p: 2,
                            bgcolor: "primary.50",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "primary.200",
                          }}
                        >
                          <Typography
                            variant="h6"
                            color="primary.main"
                            fontWeight="bold"
                          >
                            {detail.productName || `Sản phẩm ${i + 1}`}
                          </Typography>
                          <Chip
                            label={`Sản phẩm ${i + 1}`}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: "medium" }}
                          />
                        </Box>

                        {/* Thông tin cơ bản sản phẩm */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                📦 Số lượng
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {detail.quantity || 0}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ p: 2, bgcolor: "info.50", borderRadius: 2, border: "1px solid", borderColor: "info.200" }}>
                              <Typography variant="caption" color="info.dark" display="block">
                                � Chi phí thi công
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="info.main">
                                {detail.detailConstructionAmount?.toLocaleString("vi-VN") || 0} VNĐ
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ p: 2, bgcolor: "warning.50", borderRadius: 2, border: "1px solid", borderColor: "warning.200" }}>
                              <Typography variant="caption" color="warning.dark" display="block">
                                🎨 Chi phí thiết kế
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="warning.main">
                                {detail.detailDesignAmount?.toLocaleString("vi-VN") || 0} VNĐ
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ p: 2, bgcolor: "success.50", borderRadius: 2, border: "1px solid", borderColor: "success.200" }}>
                              <Typography variant="caption" color="success.dark" display="block">
                                💸 Thành tiền
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                {detail.subTotal?.toLocaleString("vi-VN") || 0} VNĐ
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Chi tiết thiết kế nếu có */}
                        {(detail.detailDepositDesignAmount !== null && detail.detailDepositDesignAmount !== undefined) && (
                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="warning.main"
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
                              Chi tiết thiết kế
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ p: 2, bgcolor: "success.50", borderRadius: 2, border: "1px solid", borderColor: "success.200" }}>
                                  <Typography variant="caption" color="success.dark" display="block">
                                    💰 Đã cọc thiết kế
                                  </Typography>
                                  <Typography variant="h6" fontWeight="bold" color="success.main">
                                    {detail.detailDepositDesignAmount?.toLocaleString("vi-VN") || 0} VNĐ
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ p: 2, bgcolor: "warning.50", borderRadius: 2, border: "1px solid", borderColor: "warning.200" }}>
                                  <Typography variant="caption" color="warning.dark" display="block">
                                    🟡 Còn lại thiết kế
                                  </Typography>
                                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                                    {detail.detailRemainingDesignAmount?.toLocaleString("vi-VN") || 0} VNĐ
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        )}

                        {/* Hình ảnh thiết kế đã chỉnh sửa */}
                        {detail.editedDesigns && detail.editedDesigns.editedImage && (
                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="secondary.main"
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
                                  backgroundColor: "secondary.main",
                                  mr: 1,
                                }}
                              />
                              Hình ảnh thiết kế đã chỉnh sửa
                            </Typography>
                            <Card
                              sx={{
                                borderRadius: 3,
                                boxShadow: 2,
                                border: "2px solid",
                                borderColor: "secondary.200",
                                overflow: "hidden",
                                bgcolor: "secondary.50",
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    bgcolor: "white",
                                    borderRadius: 2,
                                    p: 2,
                                    border: "1px solid",
                                    borderColor: "grey.300",
                                  }}
                                >
                                  <DesignImage
                                    imagePath={detail.editedDesigns.editedImage}
                                    alt="Thiết kế đã chỉnh sửa"
                                    maxHeight="400px"
                                  />
                                </Box>
                                {detail.editedDesigns.customerNote && (
                                  <Box sx={{ mt: 2, p: 2, bgcolor: "info.50", borderRadius: 2, border: "1px solid", borderColor: "info.200" }}>
                                    <Typography variant="caption" color="info.dark" display="block" fontWeight="medium">
                                      📝 Ghi chú từ khách hàng:
                                    </Typography>
                                    <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                      {detail.editedDesigns.customerNote}
                                    </Typography>
                                  </Box>
                                )}
                                {detail.editedDesigns.designTemplates && (
                                  <Box sx={{ mt: 2, p: 2, bgcolor: "warning.50", borderRadius: 2, border: "1px solid", borderColor: "warning.200" }}>
                                    <Typography variant="caption" color="warning.dark" display="block" fontWeight="medium">
                                      🎨 Template thiết kế:
                                    </Typography>
                                    <Typography variant="body2" color="text.primary" fontWeight="bold" sx={{ mt: 0.5 }}>
                                      {detail.editedDesigns.designTemplates.name}
                                    </Typography>
                                    {detail.editedDesigns.designTemplates.description && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {detail.editedDesigns.designTemplates.description}
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Box>
                        )}

                        {/* Chi tiết lựa chọn khách hàng */}
                        {detail.customerChoiceHistories && (
                          <Box>
                            {/* Kích thước */}
                            {detail.customerChoiceHistories.sizeSelections &&
                              detail.customerChoiceHistories.sizeSelections.length > 0 && (
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
                                        backgroundColor: "info.main",
                                        mr: 1,
                                      }}
                                    />
                                    Kích thước ({detail.customerChoiceHistories.sizeSelections.length} thông số)
                                  </Typography>
                                  <Grid container spacing={1}>
                                    {detail.customerChoiceHistories.sizeSelections.map((size, idx) => (
                                      <Grid item xs={6} sm={4} md={3} key={idx}>
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
                                    ))}
                                  </Grid>
                                </Box>
                              )}

                            {/* Thuộc tính */}
                            {detail.customerChoiceHistories.attributeSelections &&
                              detail.customerChoiceHistories.attributeSelections.length > 0 && (
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
                                        backgroundColor: "primary.main",
                                        mr: 1,
                                      }}
                                    />
                                    Thuộc tính ({detail.customerChoiceHistories.attributeSelections.length} thuộc tính)
                                  </Typography>
                                  <Grid container spacing={2}>
                                    {detail.customerChoiceHistories.attributeSelections.map((attr, idx) => (
                                      <Grid item xs={12} sm={6} md={4} key={idx}>
                                        <Card
                                          sx={{
                                            borderRadius: 2,
                                            boxShadow: 1,
                                            border: "1px solid",
                                            borderColor: "primary.200",
                                            "&:hover": {
                                              boxShadow: 3,
                                              transform: "translateY(-2px)",
                                              transition: "all 0.3s ease",
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
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                              <strong>Giá trị:</strong> {attr.value} ({attr.unit})
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
                                                label={`Vật tư: ${attr.materialPrice?.toLocaleString("vi-VN")} VNĐ`}
                                                size="small"
                                                color="info"
                                                variant="outlined"
                                              />
                                              <Chip
                                                label={`Đơn giá: ${attr.unitPrice?.toLocaleString("vi-VN")} VNĐ`}
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
                                              Công thức: {attr.calculateFormula}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              color="success.main"
                                              fontWeight="bold"
                                              sx={{ mt: 1 }}
                                            >
                                              Tổng: {attr.subTotal?.toLocaleString("vi-VN")} VNĐ
                                            </Typography>
                                          </CardContent>
                                        </Card>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <DescriptionIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có chi tiết đơn hàng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thông tin chi tiết đơn hàng sẽ được hiển thị ở đây
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
});

OrderDetailDialog.displayName = "OrderDetailDialog";

// Memoized OrderCard component cho mobile view
const OrderCard = memo(
  ({
    order,
    index,
    formatDate,
    getCustomerName,
    getCustomerPhone,
    getCustomerEmail,
    getContractorName,
    getOrderType,
    getCreatedDate,
    generateOrderCode,
    onViewDetail,
    onUploadContract,
    onUploadRevisedContract,
    onViewContract,
    onConfirmSigned,
    contractViewLoading,
  }) => {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 2,
          border: "1px solid",
          borderColor: "divider",
          mb: 2,
          overflow: "hidden",
          "&:hover": {
            boxShadow: 4,
            transform: "translateY(-2px)",
            transition: "all 0.3s ease",
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header - Mã đơn và trạng thái */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                {generateOrderCode(order, index)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(getCreatedDate(order))}
              </Typography>
            </Box>
            <Chip
              label={ORDER_STATUS_MAP[order.status]?.label || order.status}
              color={ORDER_STATUS_MAP[order.status]?.color || "default"}
              size="small"
              sx={{ fontWeight: "medium", boxShadow: 1 }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Thông tin khách hàng */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
            <UserAvatar user={order.users} size={50} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                {getCustomerName(order)}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  📞 {getCustomerPhone(order)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 0.5,
                    wordBreak: "break-word",
                  }}
                >
                  ✉️ {getCustomerEmail(order)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Thông tin đơn hàng */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ p: 1.5, bgcolor: "info.50", borderRadius: 2, border: "1px solid", borderColor: "info.200" }}>
                <Typography variant="caption" color="info.dark" display="block" gutterBottom>
                  Loại đơn
                </Typography>
                <Typography variant="body2" fontWeight="medium" color="info.main">
                  {getOrderType(order)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Nhà thầu
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
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
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {getContractorName(order)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {/* Nút thao tác */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              variant="contained"
              color={order.status === "DEPOSITED" ? "info" : "primary"}
              size="small"
              onClick={() => onViewDetail(order.id || order.orderId)}
              startIcon={order.status === "DEPOSITED" ? <ShippingIcon /> : <DescriptionIcon />}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: "medium",
                py: 1,
              }}
            >
              {order.status === "DEPOSITED" ? "Báo ngày giao dự kiến" : "Xem chi tiết"}
            </Button>

            {/* Các nút khác theo trạng thái */}
            {order.status === "PENDING_CONTRACT" && (
              <Button
                variant="outlined"
                color="success"
                size="small"
                startIcon={<UploadIcon />}
                onClick={() => onUploadContract(order.id || order.orderId)}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "medium",
                  py: 1,
                }}
              >
                Gửi hợp đồng
              </Button>
            )}

            {order.status === "CONTRACT_DISCUSS" && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<UploadIcon />}
                onClick={() => onUploadRevisedContract(order.id || order.orderId)}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "medium",
                  py: 1,
                }}
              >
                Gửi lại hợp đồng
              </Button>
            )}

            {(order.status === "CONTRACT_SIGNED" || order.status === "CONTRACT_SENT") && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={contractViewLoading ? <CircularProgress size={16} /> : <DescriptionIcon />}
                  onClick={() => onViewContract(order.id || order.orderId)}
                  disabled={contractViewLoading}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "medium",
                    py: 1,
                  }}
                >
                  {contractViewLoading ? "Đang tải..." : "Xem hợp đồng"}
                </Button>
                
                {/* Chỉ hiển thị nút Xác nhận hoàn tất ở trạng thái CONTRACT_SIGNED */}
                {order.status === "CONTRACT_SIGNED" && (
                  <Button
                    variant="contained"
                    color="success"
                    size="medium"
                    startIcon={<DescriptionIcon />}
                    onClick={() => onConfirmSigned(order.id || order.orderId)}
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: "600",
                      py: 1.5,
                      fontSize: "0.875rem",
                      boxShadow: 2,
                      background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-1px)",
                        background: "linear-gradient(135deg, #43a047 0%, #5cb85c 100%)",
                      },
                    }}
                  >
                     Xác nhận hoàn tất ký kết
                  </Button>
                )}
              </Box>
            )}

            {/* Nút xem hợp đồng cho trạng thái PRODUCTION_COMPLETED và ORDER_COMPLETED */}
            {(order.status === "PRODUCTION_COMPLETED" || order.status === "ORDER_COMPLETED") && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={contractViewLoading ? <CircularProgress size={16} /> : <DescriptionIcon />}
                onClick={() => onViewContract(order.id || order.orderId)}
                disabled={contractViewLoading}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "medium",
                  py: 1,
                }}
              >
                {contractViewLoading ? "Đang tải..." : "Xem hợp đồng"}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }
);
OrderCard.displayName = "OrderCard";

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
    getCreatedDate,
    generateOrderCode,
    onViewDetail,
    onUploadContract,
    onUploadRevisedContract,
    onViewContract,
    onConfirmSigned,
    contractViewLoading,
  }) => {
    return (
      <TableRow
        key={order.id || index}
        hover
        sx={{
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.04)",
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
          <TableCell sx={{ minWidth: 250, maxWidth: 320 }}>
            <Box 
              sx={{ 
                display: "flex", 
                gap: 0.5, 
                alignItems: "flex-start",
                flexWrap: "wrap"
              }}
            >
              {/* Nút chi tiết/báo giao hàng - luôn hiển thị đầu tiên */}
              <Button
                variant="contained"
                color={order.status === "DEPOSITED" ? "info" : "primary"}
                size="small"
                onClick={() => onViewDetail(order.id || order.orderId)}
                startIcon={order.status === "DEPOSITED" ? <ShippingIcon /> : <DescriptionIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "medium",
                  fontSize: "0.75rem",
                  px: 1.5,
                  py: 0.5,
                  minWidth: order.status === "DEPOSITED" ? 100 : 70,
                  height: 30,
                  boxShadow: 2,
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {order.status === "DEPOSITED" ? "Báo giao hàng" : "Chi tiết"}
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
                    fontSize: "0.75rem",
                    px: 1.5,
                    py: 0.5,
                    height: 30,
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
                    fontSize: "0.75rem",
                    px: 1.5,
                    py: 0.5,
                    height: 30,
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

              {/* Nút xem hợp đồng cho trạng thái CONTRACT_SIGNED và CONTRACT_SENT */}
              {(order.status === "CONTRACT_SIGNED" || order.status === "CONTRACT_SENT") && (
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
                    fontSize: "0.75rem",
                    px: 1.5,
                    py: 0.5,
                    height: 30,
                    boxShadow: 1,
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {contractViewLoading ? "Đang tải..." : "Xem hợp đồng"}
                </Button>
              )}
              
              {/* Nút xác nhận hoàn tất cho trạng thái CONTRACT_SIGNED */}
              {order.status === "CONTRACT_SIGNED" && (
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
                    fontSize: "0.75rem",
                    px: 1.5,
                    py: 0.5,
                    height: 30,
                    minWidth: 140,
                    boxShadow: 2,
                    mt: 0.5,
                    background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-1px)",
                      background: "linear-gradient(135deg, #43a047 0%, #5cb85c 100%)",
                    },
                  }}
                >
                   Xác nhận hoàn tất
                </Button>
              )}

              {/* Nút xem hợp đồng cho trạng thái PRODUCTION_COMPLETED và ORDER_COMPLETED */}
              {(order.status === "PRODUCTION_COMPLETED" || order.status === "ORDER_COMPLETED") && (
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
                    fontSize: "0.75rem",
                    px: 1.5,
                    py: 0.5,
                    height: 30,
                    boxShadow: 1,
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {contractViewLoading ? "Đang tải..." : "Xem hợp đồng"}
                </Button>
              )}
            </Box>
          </TableCell>
        </TableRow>
    );
  }
);
OrderRow.displayName = "OrderRow";

const DashboardContent = ({
  stats,
  orders = [],
  statusFilter,
  onStatusFilterChange,
  onRefreshOrders, // Thêm callback để refresh danh sách orders
  pagination = { currentPage: 1, totalPages: 1, pageSize: 10, totalElements: 0 }, // Thông tin phân trang
  onPageChange, // Callback khi chuyển trang
  onRowsPerPageChange, // Callback khi thay đổi số dòng/trang
  onSearchChange, // Callback khi search term thay đổi
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // Responsive breakpoint - tablet và mobile dùng card
  
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

  // State cho order detail dialog
  const [orderDetailDialog, setOrderDetailDialog] = useState({
    open: false,
    order: null,
    orderDetails: null,
  });

  // Debounce search input for better performance
  useEffect(() => {
    if (search !== debouncedSearch) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setIsSearching(false);
      
      // Gọi callback để thông báo search term đã thay đổi (nếu có)
      if (onSearchChange) {
        onSearchChange(search);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch, onSearchChange]);

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
    } else {
      // Cho các trạng thái khác, mở dialog chi tiết đơn hàng
      const orderDetails = orderDetailsMap[orderId];
      setOrderDetailDialog({
        open: true,
        order: order,
        orderDetails: orderDetails || [],
      });
    }
  }, [dispatch, orders, orderDetailsMap]);

  // Handler đóng contractor dialog
  const handleCloseContractorDialog = useCallback(() => {
    setContractorDialog({
      open: false,
      order: null,
    });
  }, []);

  // Handler đóng order detail dialog
  const handleCloseOrderDetailDialog = useCallback(() => {
    setOrderDetailDialog({
      open: false,
      order: null,
      orderDetails: null,
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
      title: 'Hiện tại không có đơn hàng AI Design nào',
      subtitle: 'Các đơn hàng AI Design sẽ xuất hiện ở đây khi có dữ liệu'
    };
  }, []);

  // Filtered orders with useMemo for performance optimization
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    console.log('🔍 Filtering orders:', {
      totalOrders: orders.length,
      statusFilter,
      searchTerm: debouncedSearch,
      hasSearchCallback: !!onSearchChange,
      ordersWithAIDesign: orders.filter(o => o.orderType === "AI_DESIGN").length,
      ordersWithPendingContract: orders.filter(o => o.status === "PENDING_CONTRACT").length,
      aiDesignPendingContract: orders.filter(o => o.orderType === "AI_DESIGN" && o.status === "PENDING_CONTRACT").length
    });

    return orders.filter((order) => {
      // Filter by orderType first: only show AI_DESIGN orders
      if (order.orderType !== "AI_DESIGN") {
        return false;
      }

      // Filter by status
      if (statusFilter && order.status !== statusFilter) {
        return false;
      }

      // Nếu có onSearchChange callback thì search sẽ được xử lý ở server-side
      // Chúng ta chỉ cần return true cho tất cả orders đã pass qua filter ở trên
      if (onSearchChange) {
        return true;
      }

      // Client-side search (chỉ khi không có server-side search)
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        
        // Search in order information
        const orderCode = String(order.orderCode || "").toLowerCase();
        
        // Search in user information
        const customerName = String(order?.users?.fullName || "").toLowerCase();
        const customerEmail = String(order?.users?.email || "").toLowerCase();
        const customerPhone = String(order?.users?.phone || "").toLowerCase();
        const customerAddress = String(order?.users?.address || "").toLowerCase();

        return (
          orderCode.includes(searchLower) ||
          customerName.includes(searchLower) ||
          customerEmail.includes(searchLower) ||
          customerPhone.includes(searchLower) ||
          customerAddress.includes(searchLower)
        );
      }

      return true;
    });
  }, [
    orders,
    debouncedSearch,
    statusFilter,
    onSearchChange,
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
        spacing={2}
        mb={4}
        sx={{ 
          flexWrap: "wrap",
          "& .MuiCard-root": {
            flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", md: "1 1 calc(25% - 12px)" }
          }
        }}
      >
        <Card
          sx={{
            flex: 1,
            minWidth: { xs: "100%", sm: 240 },
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <OrderIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  Tổng đơn AI Design
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
                  {formattedStats.totalOrders}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: { xs: "100%", sm: 240 },
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <PendingIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  AI Chờ xác nhận
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
                  {formattedStats.pendingOrders}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: { xs: "100%", sm: 240 },
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <ShippingIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  AI Đã xác nhận
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
                  {formattedStats.confirmedOrders}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: { xs: "100%", sm: 240 },
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <MoneyIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  Doanh thu AI
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                  {formattedStats.totalRevenue}₫
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Filter & Search */}
      <Card sx={{ mb: 3, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <FormControl sx={{ minWidth: { xs: "100%", sm: 180 } }}>
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
            placeholder="Tìm kiếm theo mã đơn hàng, tên, email, SĐT, địa chỉ khách"
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
           
            sx={{ flex: 1, minWidth: { xs: "100%", sm: 220 } }}
          />
        </Stack>
      </Card>

      {/* Orders Table - Desktop/Tablet view */}
      {!isMobile && (statusFilter && filteredOrders.length === 0 ? (
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
          <TableContainer
            sx={{
              overflow: 'hidden', // Ẩn thanh scroll
              '&:hover': {
                overflow: 'hidden', // Đảm bảo không hiện scroll khi hover
              }
            }}
          >
            <Table
              sx={{
                tableLayout: 'fixed', // Cố định layout table để tránh overflow
                width: '100%'
              }}
            >
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
                      getCreatedDate={getCreatedDate}
                      generateOrderCode={generateOrderCode}
                      onViewDetail={handleViewDetail}
                      onUploadContract={handleUploadContract}
                      onUploadRevisedContract={handleUploadRevisedContract}
                      onViewContract={handleViewContract}
                      onConfirmSigned={handleConfirmSigned}
                      contractViewLoading={contractViewLoading}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination cho table desktop */}
          {filteredOrders.length > 0 && onPageChange && (
            <TablePagination
              component="div"
              count={pagination.totalElements}
              page={pagination.currentPage - 1} // MUI TablePagination dùng zero-based indexing
              onPageChange={(event, newPage) => onPageChange(newPage + 1)} // Convert về one-based cho API
              rowsPerPage={pagination.pageSize}
              onRowsPerPageChange={(event) => onRowsPerPageChange?.(parseInt(event.target.value, 10))}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}–${to} trong tổng số ${count !== -1 ? count : `hơn ${to}`}`
              }
              showFirstButton
              showLastButton
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                px: 2,
                '& .MuiTablePagination-toolbar': {
                  minHeight: 64,
                  justifyContent: 'center', // Căn giữa toàn bộ toolbar
                  flexWrap: 'wrap',
                  gap: 2,
                },
                '& .MuiTablePagination-spacer': {
                  display: 'none', // Ẩn spacer để elements không bị đẩy sang bên
                },
                '& .MuiTablePagination-selectLabel': {
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  order: 1, // Đặt thứ tự hiển thị
                },
                '& .MuiTablePagination-select': {
                  order: 2,
                },
                '& .MuiTablePagination-displayedRows': {
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  order: 4, // Hiển thị cuối cùng
                },
                '& .MuiTablePagination-actions': {
                  order: 3, // Navigation buttons ở giữa
                  ml: 2,
                },
              }}
            />
          )}
        </Card>
      ))}

      {/* Pagination cho mobile cards */}
      {isMobile && filteredOrders.length > 0 && onPageChange && (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            border: "1px solid",
            borderColor: "divider",
            mt: 2,
          }}
        >
          <TablePagination
            component="div"
            count={pagination.totalElements}
            page={pagination.currentPage - 1}
            onPageChange={(event, newPage) => onPageChange(newPage + 1)}
            rowsPerPage={pagination.pageSize}
            onRowsPerPageChange={(event) => onRowsPerPageChange?.(parseInt(event.target.value, 10))}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Số item mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`
            }
            showFirstButton
            showLastButton
            sx={{
              px: 2,
              '& .MuiTablePagination-toolbar': {
                minHeight: 64,
                flexWrap: 'wrap',
                gap: 1,
                justifyContent: 'center', // Căn giữa cho mobile
                textAlign: 'center',
              },
              '& .MuiTablePagination-spacer': {
                display: 'none', // Ẩn spacer để căn giữa
              },
              '& .MuiTablePagination-selectLabel': {
                fontSize: '0.875rem',
                color: 'text.secondary',
                order: 1,
              },
              '& .MuiTablePagination-select': {
                order: 2,
              },
              '& .MuiTablePagination-actions': {
                order: 3,
                ml: { xs: 0, sm: 2 },
              },
              '& .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
                color: 'text.secondary',
                order: 4,
                width: { xs: '100%', sm: 'auto' }, // Full width trên mobile để căn giữa
                textAlign: 'center',
                mt: { xs: 1, sm: 0 },
              },
            }}
          />
        </Card>
      )}

      {/* Orders Cards - Mobile view */}
      {isMobile && (
        <Box>
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
          ) : filteredOrders.length === 0 ? (
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
                <OrderIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không có đơn hàng nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Không có đơn hàng nào phù hợp với bộ lọc hiện tại
                </Typography>
              </Box>
            </Card>
          ) : (
            <Box>
              {filteredOrders.map((order, idx) => (
                <OrderCard
                  key={order.id || idx}
                  order={order}
                  index={idx}
                  formatDate={formatDate}
                  getCustomerName={getCustomerName}
                  getCustomerPhone={getCustomerPhone}
                  getCustomerEmail={getCustomerEmail}
                  getContractorName={getContractorName}
                  getOrderType={getOrderType}
                  getCreatedDate={getCreatedDate}
                  generateOrderCode={generateOrderCode}
                  onViewDetail={handleViewDetail}
                  onUploadContract={handleUploadContract}
                  onUploadRevisedContract={handleUploadRevisedContract}
                  onViewContract={handleViewContract}
                  onConfirmSigned={handleConfirmSigned}
                  contractViewLoading={contractViewLoading}
                />
              ))}
            </Box>
          )}
        </Box>
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
        <DialogActions sx={{ p: 3, gap: 1 }}>
          {/* Hiển thị nút "Yêu cầu ký lại" cho hợp đồng đã ký (dựa trên orderId) */}
          {contractDialog.orderId && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<UploadIcon />}
              onClick={() => {
                handleRequestResign(contractDialog.orderId);
                handleCloseContractDialog(); // Đóng dialog sau khi thực hiện
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: "medium",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  boxShadow: 2,
                  transform: "translateY(-1px)",
                  background: "rgba(255, 152, 0, 0.04)",
                },
              }}
            >
               Yêu cầu ký lại
            </Button>
          )}
          
          <Button onClick={handleCloseContractDialog} sx={{ ml: "auto" }}>
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

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        open={orderDetailDialog.open}
        onClose={handleCloseOrderDetailDialog}
        order={orderDetailDialog.order}
        orderDetails={orderDetailDialog.orderDetails}
        generateOrderCode={generateOrderCode}
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
