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
  Container,
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
  FaHammer,
  FaEdit,
  FaCog
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

  // Lấy orderType từ localStorage để điều khiển hiển thị nút thi công
  const orderTypeFromStorage = localStorage.getItem("orderTypeForNewOrder");

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

  // Tự động set hasOrder dựa trên orderType
  useEffect(() => {
    if (orderTypeFromStorage === "CUSTOM_DESIGN_WITH_CONSTRUCTION") {
      setHasOrder(true);
    } else if (orderTypeFromStorage === "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION") {
      setHasOrder(false);
    }
  }, [orderTypeFromStorage]);

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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4,
        px: { xs: 2, md: 0 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="1200px">
        {/* Header Section */}
        <Box 
          sx={{
            textAlign: 'center',
            mb: 6,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 4,
            p: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#2c3e50',
              mb: 2,
              background: 'linear-gradient(45deg, #2c3e50, #3498db)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Thiết Kế Tùy Chỉnh
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#7f8c8d',
              fontWeight: 400,
              fontStyle: 'italic'
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
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    border: '2px solid #3498db',
                    background: 'linear-gradient(135deg, #ebf3fd 0%, #f8fbff 100%)',
                    boxShadow: '0 8px 32px rgba(52, 152, 219, 0.2)'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: '#3498db', mr: 3, width: 40, height: 40 }}>
                        <FaInfoCircle />
                      </Avatar>
                      <Typography variant="h6" fontWeight={600} color="#2c3e50">
                        🎯 Đang tạo thêm thiết kế tùy chỉnh
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="#34495e" sx={{ mb: 3 }}>
                      Bạn đang tạo thêm một thiết kế tùy chỉnh cho đơn hàng hiện có.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Chip
                        label={`Order ID: ${existingOrderId.slice(0, 8)}...`}
                        variant="outlined"
                        size="medium"
                        sx={{ 
                          borderColor: '#3498db',
                          color: '#2980b9',
                          backgroundColor: '#ffffff',
                          fontWeight: 600
                        }}
                      />
                      <Chip
                        label={existingOrderType === 'CUSTOM_DESIGN_WITH_CONSTRUCTION' ? 'Có thi công' : 'Không thi công'}
                        variant="outlined"
                        size="medium"
                        sx={{ 
                          borderColor: '#27ae60',
                          color: '#229954',
                          backgroundColor: '#ffffff',
                          fontWeight: 600
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

        <Grid container spacing={4}>
          {/* Thông tin doanh nghiệp */}
          <Grid item xs={12} lg={6}>
            <Card 
              elevation={4}
              sx={{
                borderRadius: 3,
                border: '1px solid #e9ecef',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#3498db', mr: 3, width: 48, height: 48 }}>
                    <FaBuilding />
                  </Avatar>
                  <Typography variant="h5" fontWeight={700} color="#2c3e50">
                    Thông Tin Doanh Nghiệp
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        background: '#f8f9fa'
                      }}
                    >
                      <Typography variant="subtitle2" color="#7f8c8d" mb={1} fontWeight={600}>
                        🏢 Tên doanh nghiệp
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="#2c3e50">
                        {customerDetail?.companyName || (
                          <Chip 
                            label="Chưa có thông tin" 
                            color="error" 
                            size="small"
                            variant="outlined"
                            icon={<FaEdit />}
                          />
                        )}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        background: '#f8f9fa'
                      }}
                    >
                      <Typography variant="subtitle2" color="#7f8c8d" mb={1} fontWeight={600}>
                        📍 Địa chỉ
                      </Typography>
                      <Typography variant="body1" color="#2c3e50">
                        {customerDetail?.address || (
                          <Chip 
                            label="Chưa có thông tin" 
                            color="error" 
                            size="small"
                            variant="outlined"
                            icon={<FaEdit />}
                          />
                        )}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        background: '#f8f9fa'
                      }}
                    >
                      <Typography variant="subtitle2" color="#7f8c8d" mb={1} fontWeight={600}>
                        📞 Liên hệ
                      </Typography>
                      <Typography variant="body1" color="#2c3e50">
                        {customerDetail?.contactInfo || (
                          <Chip 
                            label="Chưa có thông tin" 
                            color="error" 
                            size="small"
                            variant="outlined"
                            icon={<FaEdit />}
                          />
                        )}
                      </Typography>
                    </Paper>
                  </Grid>

                  {customerDetail?.logoUrl && (
                    <Grid item xs={12}>
                      <Paper 
                        elevation={2}
                        sx={{ 
                          p: 3, 
                          borderRadius: 2,
                          border: '1px solid #e9ecef',
                          background: '#f8f9fa'
                        }}
                      >
                        <Typography variant="subtitle2" color="#7f8c8d" mb={2} fontWeight={600}>
                          🖼️ Logo
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center',
                          p: 2,
                          background: '#ffffff',
                          borderRadius: 2,
                          border: '2px dashed #e9ecef'
                        }}>
                          <img
                            src={customerDetail.logoUrl}
                            alt="Logo"
                            style={{ 
                              maxHeight: 80, 
                              borderRadius: 8,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Loại biển hiệu */}
          <Grid item xs={12} lg={6}>
            <Card 
              elevation={4}
              sx={{
                borderRadius: 3,
                border: '1px solid #e9ecef',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#e74c3c', mr: 3, width: 48, height: 48 }}>
                    <FaPalette />
                  </Avatar>
                  <Typography variant="h5" fontWeight={700} color="#2c3e50">
                    Loại Biển Hiệu
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        background: '#f8f9fa'
                      }}
                    >
                      <Typography variant="subtitle2" color="#7f8c8d" mb={1} fontWeight={600}>
                        🎨 Tên loại biển hiệu
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="#2c3e50">
                        {selectedType?.name || (
                          <Chip 
                            label="Chưa chọn" 
                            color="warning" 
                            size="small"
                            variant="outlined"
                            icon={<FaEdit />}
                          />
                        )}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        background: '#f8f9fa'
                      }}
                    >
                      <Typography variant="subtitle2" color="#7f8c8d" mb={2} fontWeight={600}>
                        📏 Kích thước đã nhập
                      </Typography>
                      {customerChoiceSizes?.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                          {customerChoiceSizes.map((sz) => (
                            <Chip
                              key={sz.id}
                              label={`${sz.sizes?.name || sz.sizeId}: ${sz.sizeValue}m`}
                              variant="filled"
                              size="medium"
                              sx={{ 
                                backgroundColor: '#3498db',
                                color: '#ffffff',
                                fontWeight: 600,
                                '&:hover': {
                                  backgroundColor: '#2980b9'
                                }
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Chip 
                          label="Chưa nhập kích thước" 
                          color="warning" 
                          variant="outlined"
                          size="medium"
                          icon={<FaEdit />}
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Thuộc tính đã chọn */}
          <Grid item xs={12}>
            <Card 
              elevation={4}
              sx={{
                borderRadius: 3,
                border: '1px solid #e9ecef',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#27ae60', mr: 3, width: 48, height: 48 }}>
                    <FaListAlt />
                  </Avatar>
                  <Typography variant="h5" fontWeight={700} color="#2c3e50">
                    Thuộc Tính Đã Chọn
                  </Typography>
                </Box>
                
                {customerChoiceDetailsList && customerChoiceDetailsList.length > 0 ? (
                  <Grid container spacing={3}>
                    {customerChoiceDetailsList.map((attr) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={attr.id}>
                        <Paper
                          elevation={3}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid #e9ecef',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                            }
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={700} mb={1} color="#2c3e50">
                            {attr.attributeValues?.description ||
                              attr.attributeValues?.name ||
                              attr.attributeValuesId}
                          </Typography>
                          <Typography variant="body2" color="#7f8c8d" mb={2}>
                            {attr.attributeValues?.name || attr.attributeValuesId}
                          </Typography>
                          <Chip
                            label={`${attr.subTotal?.toLocaleString("vi-VN") || 0} VND`}
                            color="success"
                            size="medium"
                            variant="filled"
                            sx={{ fontWeight: 600 }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderRadius: 3,
                    border: '2px dashed #dee2e6'
                  }}>
                    <FaListAlt size={48} color="#7f8c8d" style={{ marginBottom: '16px' }} />
                    <Typography variant="h6" color="#7f8c8d" fontWeight={600}>
                      Chưa chọn thuộc tính nào
                    </Typography>
                    <Typography variant="body2" color="#95a5a6" mt={1}>
                      Vui lòng chọn các thuộc tính cần thiết cho biển hiệu
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Yêu cầu thiết kế */}
          <Grid item xs={12}>
            <Card 
              elevation={4}
              sx={{
                borderRadius: 3,
                border: '1px solid #e9ecef',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#f39c12', mr: 3, width: 48, height: 48 }}>
                    <FaRegStickyNote />
                  </Avatar>
                  <Typography variant="h5" fontWeight={700} color="#2c3e50">
                    Yêu Cầu Thiết Kế
                  </Typography>
                </Box>
                
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    border: '1px solid #e9ecef',
                    background: '#f8f9fa'
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    minRows={6}
                    placeholder="Nhập yêu cầu thiết kế đặc biệt (nếu có)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: '#ffffff',
                        fontSize: '1.1rem',
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
                        fontSize: '1.1rem',
                        fontWeight: 500,
                      },
                    }}
                  />
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          {/* Lựa chọn thi công */}
          <Grid item xs={12}>
            <Card 
              elevation={4}
              sx={{
                borderRadius: 3,
                border: '1px solid #e9ecef',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#9b59b6', mr: 3, width: 48, height: 48 }}>
                    <FaHammer />
                  </Avatar>
                  <Typography variant="h5" fontWeight={700} color="#2c3e50">
                    Lựa Chọn Thi Công
                  </Typography>
                </Box>
                
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    border: '1px solid #e9ecef',
                    background: '#f8f9fa'
                  }}
                >
                  <Typography variant="h6" color="#2c3e50" mb={3} fontWeight={600}>
                    🔨 Bạn có muốn chúng tôi thi công biển hiệu sau khi thiết kế không?
                  </Typography>
                  
                  {/* Hiển thị thông báo khi chỉ có một lựa chọn */}
                  {(orderTypeFromStorage === "CUSTOM_DESIGN_WITH_CONSTRUCTION" || orderTypeFromStorage === "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION") && (
                    <Box sx={{ mb: 3 }}>
                      <Alert 
                        severity="info" 
                        variant="filled"
                        sx={{ 
                          borderRadius: 2,
                          '& .MuiAlert-icon': {
                            fontSize: '1.2rem'
                          }
                        }}
                      >
                        <Typography variant="body1" fontWeight={600}>
                          {orderTypeFromStorage === "CUSTOM_DESIGN_WITH_CONSTRUCTION" 
                            ? "🏗️ Đơn hàng của bạn đã bao gồm thi công" 
                            : "🎨 Đơn hàng của bạn chỉ bao gồm thiết kế"}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                          {orderTypeFromStorage === "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                            ? "Lựa chọn thi công đã được xác định trước cho đơn hàng này."
                            : "Đơn hàng này chỉ yêu cầu dịch vụ thiết kế, không bao gồm thi công."}
                        </Typography>
                      </Alert>
                    </Box>
                  )}
                  
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      row
                      value={hasOrder ? "yes" : "no"}
                      onChange={(e) => setHasOrder(e.target.value === "yes")}
                      name="hasOrderRadio"
                      sx={{ gap: 4 }}
                    >
                      {/* Hiển thị nút "Có thi công" nếu orderType không phải CUSTOM_DESIGN_WITHOUT_CONSTRUCTION */}
                      {orderTypeFromStorage !== "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION" && (
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
                            <Paper
                              elevation={hasOrder ? 4 : 1}
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                border: hasOrder ? '2px solid #27ae60' : '1px solid #e9ecef',
                                background: hasOrder ? 'linear-gradient(135deg, #d5f4e6 0%, #e8f8f5 100%)' : '#ffffff',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chip 
                                  label="Có thi công" 
                                  color="success" 
                                  variant={hasOrder ? "filled" : "outlined"}
                                  size="medium"
                                  sx={{ mr: 2, fontWeight: 600 }}
                                />
                                <Typography variant="body1" color="#2c3e50" fontWeight={500}>
                                  (Bao gồm thiết kế + thi công)
                                </Typography>
                              </Box>
                            </Paper>
                          }
                        />
                      )}
                      
                      {/* Hiển thị nút "Không thi công" nếu orderType không phải CUSTOM_DESIGN_WITH_CONSTRUCTION */}
                      {orderTypeFromStorage !== "CUSTOM_DESIGN_WITH_CONSTRUCTION" && (
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
                            <Paper
                              elevation={!hasOrder ? 4 : 1}
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                border: !hasOrder ? '2px solid #3498db' : '1px solid #e9ecef',
                                background: !hasOrder ? 'linear-gradient(135deg, #ebf3fd 0%, #f8fbff 100%)' : '#ffffff',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chip 
                                  label="Không thi công" 
                                  color="info" 
                                  variant={!hasOrder ? "filled" : "outlined"}
                                  size="medium"
                                  sx={{ mr: 2, fontWeight: 600 }}
                                />
                                <Typography variant="body1" color="#2c3e50" fontWeight={500}>
                                  (Chỉ thiết kế)
                                </Typography>
                              </Box>
                            </Paper>
                          }
                        />
                      )}
                    </RadioGroup>
                  </FormControl>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Nút xác nhận */}
        <Box 
          sx={{ 
            mt: 8, 
            mb: 4, 
            display: 'flex', 
            justifyContent: 'center'
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleConfirm}
            sx={{
              background: 'linear-gradient(45deg, #3498db, #2980b9)',
              color: '#fff',
              borderRadius: 3,
              fontWeight: 700,
              fontSize: '1.2rem',
              minWidth: 250,
              height: 60,
              textTransform: 'none',
              boxShadow: '0 8px 25px rgba(52, 152, 219, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2980b9, #1f5f8b)',
                boxShadow: '0 12px 35px rgba(52, 152, 219, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease',
            }}
          >
            <FaCog style={{ marginRight: '12px' }} />
            Xác Nhận Thiết Kế
          </Button>
        </Box>
      </Container>

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
