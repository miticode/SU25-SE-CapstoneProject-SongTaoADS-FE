import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerChoiceSizesByCustomerChoiceId,
  selectCustomerChoiceSizes,
  fetchCustomerChoiceDetailsByCustomerChoiceId,
  selectCustomerChoiceDetailsList,
  fetchCustomerDetailByUserId,
  fetchCustomerChoice,
} from "../store/features/customer/customerSlice";
import { getProductTypesApi } from "../api/productTypeService";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { 
  FaRulerCombined, 
  FaListAlt, 
  FaRegStickyNote,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaImage,
  FaCheckCircle,
  FaInfoCircle,
  FaPalette,
  FaHammer
} from "react-icons/fa";

import { createCustomDesignRequest } from "../store/features/customeDesign/customerDesignSlice";
import { createOrderFromDesignRequest } from "../store/features/order/orderSlice";
import { fetchProfile, selectAuthUser } from "../store/features/auth/authSlice";

const CustomDesign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [productTypes, setProductTypes] = useState([]);
  const customerChoiceSizes = useSelector(selectCustomerChoiceSizes);
  const customerChoiceDetailsList = useSelector(
    selectCustomerChoiceDetailsList
  );
  const [note, setNote] = useState("");
  const customDesignOrderError = useSelector(
    (state) => state.customers?.customDesignOrderError
  );
  const customerDetail = useSelector(
    (state) => state.customers?.customerDetail
  );
  const currentOrder = useSelector((state) => state.customers?.currentOrder);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [hasOrder, setHasOrder] = useState(false);

  // Lấy user từ Redux auth
  const user = useSelector(selectAuthUser);
  const accessToken = useSelector((state) => state.auth.accessToken);

  // Khi vào trang, nếu có customerChoiceId thì fetch kích thước và thuộc tính
  useEffect(() => {
    const id = location.state?.customerChoiceId;
    if (id) {
      dispatch(fetchCustomerChoiceSizesByCustomerChoiceId(id));
      dispatch(fetchCustomerChoiceDetailsByCustomerChoiceId(id));
      dispatch(fetchCustomerChoice(id));
    }
    if (location.state?.selectedType) {
      if (typeof location.state.selectedType === "object") {
        setSelectedType(location.state.selectedType);
        setSelectedTypeId(location.state.selectedType.id);
      } else {
        setSelectedTypeId(location.state.selectedType);
      }
    }
  }, [location.state, dispatch]);

  // Fetch loại biển hiệu nếu chưa có
  useEffect(() => {
    if (productTypes.length === 0) {
      getProductTypesApi().then((res) => {
        if (res.success) setProductTypes(res.data);
      });
    }
  }, [productTypes.length]);

  // Khi có productTypes và chỉ có ID, tìm object đúng
  useEffect(() => {
    if (!selectedType && selectedTypeId && productTypes.length > 0) {
      const found = productTypes.find((pt) => pt.id === selectedTypeId);
      if (found) setSelectedType(found);
    }
  }, [selectedType, selectedTypeId, productTypes]);

  useEffect(() => {
    // Nếu chưa có user trong Redux nhưng có accessToken, fetch profile trước
    if (!user && accessToken) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user, accessToken]);

  useEffect(() => {
    // Lấy userId từ Redux user (UUID)
    if (user?.id) {
      dispatch(fetchCustomerDetailByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  const handleConfirm = async () => {
    // Lấy customerChoiceId từ location.state hoặc currentOrder
    let customerChoiceId = location.state?.customerChoiceId || currentOrder?.id;
    
    // Nếu vẫn không có customerChoiceId, thử lấy từ localStorage
    if (!customerChoiceId) {
      const savedCustomDesignInfo = localStorage.getItem('orderCustomDesignInfo');
      if (savedCustomDesignInfo) {
        try {
          const parsedInfo = JSON.parse(savedCustomDesignInfo);
          customerChoiceId = parsedInfo.customerChoiceId;
        } catch (error) {
          console.error('Error parsing saved custom design info:', error);
        }
      }
    }
    
    // Nếu vẫn không có, thử lấy từ URL params hoặc localStorage khác
    if (!customerChoiceId) {
      const urlParams = new URLSearchParams(window.location.search);
      customerChoiceId = urlParams.get('customerChoiceId');
    }
    
    // Nếu vẫn không có, thử lấy từ localStorage khác
    if (!customerChoiceId) {
      const savedOrderInfo = localStorage.getItem('orderAIDesignInfo');
      if (savedOrderInfo) {
        try {
          const parsedInfo = JSON.parse(savedOrderInfo);
          customerChoiceId = parsedInfo.customerChoiceId;
        } catch (error) {
          console.error('Error parsing saved order info:', error);
        }
      }
    }
    
    // Nếu vẫn không có, thử lấy từ localStorage khác
    if (!customerChoiceId) {
      const savedOrderInfo = localStorage.getItem('orderFormData');
      if (savedOrderInfo) {
        try {
          const parsedInfo = JSON.parse(savedOrderInfo);
          customerChoiceId = parsedInfo.customerChoiceId;
        } catch (error) {
          console.error('Error parsing saved order form data:', error);
        }
      }
    }
    
    // Nếu vẫn không có, thử lấy từ localStorage khác
    if (!customerChoiceId) {
      const savedOrderInfo = localStorage.getItem('orderCurrentStep');
      if (savedOrderInfo) {
        try {
          const parsedInfo = JSON.parse(savedOrderInfo);
          customerChoiceId = parsedInfo.customerChoiceId;
        } catch (error) {
          console.error('Error parsing saved order current step:', error);
        }
      }
    }
    
    // Nếu vẫn không có, thử lấy từ localStorage khác
    if (!customerChoiceId) {
      const savedOrderInfo = localStorage.getItem('orderIdForNewOrder');
      if (savedOrderInfo) {
        customerChoiceId = savedOrderInfo;
      }
    }
    
    // Nếu vẫn không có, thử lấy từ localStorage khác
    if (!customerChoiceId) {
      const savedOrderInfo = localStorage.getItem('orderTypeForNewOrder');
      if (savedOrderInfo) {
        customerChoiceId = savedOrderInfo;
      }
    }
    
    console.log("CustomDesign - Debug handleConfirm:", {
      locationState: location.state,
      currentOrder: currentOrder,
      customerChoiceId: customerChoiceId,
      customerDetail: customerDetail
    });
    
    if (!customerDetail?.id || !customerChoiceId) {
      setSnackbar({
        open: true,
        message: `Thiếu thông tin: ${!customerDetail?.id ? 'Khách hàng' : ''} ${!customerChoiceId ? 'Customer Choice' : ''}`,
        severity: "error",
      });
      return;
    }
    try {
      const result = await dispatch(
        createCustomDesignRequest({
          customerDetailId: customerDetail.id,
          customerChoiceId: customerChoiceId,
          data: {
            requirements: note || "",
            hasOrder: hasOrder,
          },
        })
      ).unwrap();
      
      if (result?.id) {
        // Kiểm tra localStorage để xem có orderId từ trang Order không
        const orderIdFromStorage = localStorage.getItem("orderIdForNewOrder");
        const orderTypeFromStorage = localStorage.getItem("orderTypeForNewOrder");

        console.log("CustomDesign - Debug after create custom design request:", {
          resultId: result.id,
          orderIdFromStorage,
          orderTypeFromStorage,
          hasOrder
        });

        // Luôn sử dụng existing order nếu có orderIdFromStorage
        if (orderIdFromStorage && (orderTypeFromStorage === "CUSTOM_DESIGN_WITH_CONSTRUCTION" || orderTypeFromStorage === "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION")) {
          console.log("CustomDesign - Có orderIdFromStorage, chuyển đến step 2 của Order:", orderIdFromStorage);

          // Lưu thông tin Custom Design để sử dụng trong Order page
          const customDesignInfo = {
            isFromCustomDesign: true,
            customDesignRequestId: result.id,
            customerChoiceId: customerChoiceId,
            hasConstruction: hasOrder,
            requirements: note,
            selectedType: selectedType,
            customerDetail: customerDetail,
          };
          localStorage.setItem("orderCustomDesignInfo", JSON.stringify(customDesignInfo));

          // Cập nhật current step trong localStorage để Order component nhận biết
          localStorage.setItem("orderCurrentStep", "2");

          // Chuyển đến step 2 của trang Order với orderId có sẵn
          navigate("/order", {
            state: {
              fromCustomDesign: true,
              customerChoiceId: customerChoiceId,
              customDesignRequestId: result.id,
              hasConstruction: hasOrder,
              requirements: note,
              selectedType: selectedType,
              customerDetail: customerDetail,
              useExistingOrder: true,
              existingOrderId: orderIdFromStorage,
            },
          });
        } else {
          // Logic cũ: tạo order mới
          console.log("CustomDesign - Không có orderIdFromStorage, tạo order mới");

          // Reset current step về 1 cho order mới
          localStorage.setItem("orderCurrentStep", "1");

          navigate("/order", {
            state: {
              fromCustomDesign: true,
              customerChoiceId: customerChoiceId,
              customDesignRequestId: result.id,
              hasConstruction: hasOrder,
              requirements: note,
              selectedType: selectedType,
              customerDetail: customerDetail,
            },
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: "Tạo yêu cầu thiết kế thủ công thành công!",
          severity: "success",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    } catch (error) {
      console.error("Lỗi tạo custom design request:", error);
      setSnackbar({
        open: true,
        message:
          customDesignOrderError || "Tạo yêu cầu thiết kế thủ công thất bại",
        severity: "error",
      });
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: '#f8f9fa',
        py: 4,
        px: { xs: 2, md: 0 }
      }}
    >
      <Box maxWidth="1000px" mx="auto" px={2}>
        {/* Header Section */}
        <Box 
          sx={{
            textAlign: 'center',
            mb: 6
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              color: '#2c3e50',
              mb: 2
            }}
          >
            Thiết Kế Tùy Chỉnh
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#7f8c8d',
              fontWeight: 400
            }}
          >
            Xác nhận thông tin và yêu cầu thiết kế
          </Typography>
        </Box>

        {/* Thông báo khi đang tạo thêm order detail cho existing order */}
        {(() => {
          const existingOrderId = localStorage.getItem('orderIdForNewOrder');
          const existingOrderType = localStorage.getItem('orderTypeForNewOrder');
          const isFromCustomDesignOrder = existingOrderType === 'CUSTOM_DESIGN_WITH_CONSTRUCTION' || existingOrderType === 'CUSTOM_DESIGN_WITHOUT_CONSTRUCTION';
          
          if (existingOrderId && isFromCustomDesignOrder) {
            return (
              <Box sx={{ mb: 4 }}>
                <Card 
                  elevation={1}
                  sx={{
                    borderRadius: 2,
                    border: '2px solid #3498db',
                    background: 'linear-gradient(135deg, #ebf3fd 0%, #f8fbff 100%)'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#3498db', mr: 2, width: 32, height: 32 }}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </Avatar>
                      <Typography variant="h6" fontWeight={600} color="#2c3e50">
                        🎯 Đang tạo thêm thiết kế tùy chỉnh
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="#34495e" sx={{ mb: 2 }}>
                      Bạn đang tạo thêm một thiết kế tùy chỉnh cho đơn hàng hiện có.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label={`Order ID: ${existingOrderId.slice(0, 8)}...`}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderColor: '#3498db',
                          color: '#2980b9',
                          backgroundColor: '#ffffff'
                        }}
                      />
                      <Chip
                        label={existingOrderType === 'CUSTOM_DESIGN_WITH_CONSTRUCTION' ? 'Có thi công' : 'Không thi công'}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderColor: '#27ae60',
                          color: '#229954',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          }
          return null;
        })()}

        <Grid container spacing={3}>
          {/* Thông tin doanh nghiệp */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                border: '1px solid #e9ecef'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#3498db', mr: 2 }}>
                    <FaBuilding />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} color="#2c3e50">
                    Thông Tin Doanh Nghiệp
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="#7f8c8d" mb={0.5}>
                        Tên doanh nghiệp
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {customerDetail?.companyName || (
                          <Chip 
                            label="Chưa có thông tin" 
                            color="error" 
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="#7f8c8d" mb={0.5}>
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1">
                        {customerDetail?.address || (
                          <Chip 
                            label="Chưa có thông tin" 
                            color="error" 
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="#7f8c8d" mb={0.5}>
                        Liên hệ
                      </Typography>
                      <Typography variant="body1">
                        {customerDetail?.contactInfo || (
                          <Chip 
                            label="Chưa có thông tin" 
                            color="error" 
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Typography>
                    </Box>
                  </Grid>

                  {customerDetail?.logoUrl && (
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="subtitle2" color="#7f8c8d" mb={1}>
                          Logo
                        </Typography>
                        <img
                          src={customerDetail.logoUrl}
                          alt="Logo"
                          style={{ 
                            maxHeight: 50, 
                            borderRadius: 8,
                            border: '1px solid #e9ecef'
                          }}
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Loại biển hiệu */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                border: '1px solid #e9ecef'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#e74c3c', mr: 2 }}>
                    <FaPalette />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} color="#2c3e50">
                    Loại Biển Hiệu
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="#7f8c8d" mb={0.5}>
                        Tên loại biển hiệu
                      </Typography>
                      <Typography variant="body1" fontWeight={500} color="#2c3e50">
                        {selectedType?.name || "Chưa chọn"}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle2" color="#7f8c8d" mb={1}>
                        Kích thước đã nhập
                      </Typography>
                      {customerChoiceSizes?.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {customerChoiceSizes.map((sz) => (
                            <Chip
                              key={sz.id}
                              label={`${sz.sizes?.name || sz.sizeId}: ${sz.sizeValue}m`}
                              variant="outlined"
                              size="small"
                              sx={{ 
                                borderColor: '#3498db',
                                color: '#3498db'
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Chip 
                          label="Chưa nhập kích thước" 
                          color="warning" 
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Thuộc tính đã chọn */}
          <Grid item xs={12}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                border: '1px solid #e9ecef'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#27ae60', mr: 2 }}>
                    <FaListAlt />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} color="#2c3e50">
                    Thuộc Tính Đã Chọn
                  </Typography>
                </Box>
                
                {customerChoiceDetailsList && customerChoiceDetailsList.length > 0 ? (
                  <Grid container spacing={2}>
                    {customerChoiceDetailsList.map((attr) => (
                      <Grid item xs={12} sm={6} md={4} key={attr.id}>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #e9ecef',
                            background: '#ffffff'
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600} mb={1}>
                            {attr.attributeValues?.description ||
                              attr.attributeValues?.name ||
                              attr.attributeValuesId}
                          </Typography>
                          <Typography variant="body2" color="#7f8c8d" mb={1}>
                            {attr.attributeValues?.name || attr.attributeValuesId}
                          </Typography>
                          <Chip
                            label={`${attr.subTotal?.toLocaleString("vi-VN") || 0} VND`}
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="#7f8c8d">
                      Chưa chọn thuộc tính nào
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Yêu cầu thiết kế */}
          <Grid item xs={12}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                border: '1px solid #e9ecef'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#f39c12', mr: 2 }}>
                    <FaRegStickyNote />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} color="#2c3e50">
                    Yêu Cầu Thiết Kế
                  </Typography>
                </Box>
                
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Nhập yêu cầu thiết kế đặc biệt (nếu có)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: '#ffffff',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3498db',
                        },
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3498db',
                          borderWidth: 2,
                        },
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Lựa chọn thi công */}
          <Grid item xs={12}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                border: '1px solid #e9ecef'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#9b59b6', mr: 2 }}>
                    <FaHammer />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} color="#2c3e50">
                    Lựa Chọn Thi Công
                  </Typography>
                </Box>
                
                <Typography variant="body1" color="#7f8c8d" mb={3}>
                  Bạn có muốn chúng tôi thi công biển hiệu sau khi thiết kế không?
                </Typography>
                
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={hasOrder ? "yes" : "no"}
                    onChange={(e) => setHasOrder(e.target.value === "yes")}
                    name="hasOrderRadio"
                  >
                    <FormControlLabel
                      value="yes"
                      control={
                        <Radio 
                          sx={{
                            color: '#27ae60',
                            '&.Mui-checked': {
                              color: '#27ae60',
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label="Có thi công" 
                            color="success" 
                            variant={hasOrder ? "filled" : "outlined"}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="#7f8c8d">
                            (Bao gồm thiết kế + thi công)
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="no"
                      control={
                        <Radio 
                          sx={{
                            color: '#3498db',
                            '&.Mui-checked': {
                              color: '#3498db',
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label="Không thi công" 
                            color="info" 
                            variant={!hasOrder ? "filled" : "outlined"}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="#7f8c8d">
                            (Chỉ thiết kế)
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Nút xác nhận */}
        <Box 
          sx={{ 
            mt: 6, 
            mb: 2, 
            display: 'flex', 
            justifyContent: 'center'
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleConfirm}
            sx={{
              background: '#3498db',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '1.1rem',
              minWidth: 200,
              height: 50,
              textTransform: 'none',
              '&:hover': {
                background: '#2980b9',
                boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Xác Nhận Thiết Kế
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomDesign;
