import React, { useState, useMemo, useCallback, useEffect, memo } from "react";
import { getOrderDetailsApi } from "../../api/orderService";
import { getImageFromS3 } from "../../api/s3Service";
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
} from "@mui/material";
import {
  ShoppingCart as OrderIcon,
  PendingActions as PendingIcon,
  LocalShipping as ShippingIcon,
  MonetizationOn as MoneyIcon,
  Search as SearchIcon,
  People as PeopleIcon,
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
          console.error('Error fetching avatar:', error);
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
        background: avatarUrl ? "transparent" : "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
        color: "white",
        fontWeight: "bold",
        fontSize: size * 0.4,
        border: "2px solid #fff",
        boxShadow: 2
      }}
    >
      {!avatarUrl && user?.fullName?.charAt(0)?.toUpperCase()}
    </Avatar>
  );
});

UserAvatar.displayName = "UserAvatar";

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
    orderDetails,
  }) => {
    console.log(`OrderRow for order ${order.id}: orderDetails =`, orderDetails);
    return (
      <>
        <TableRow key={order.id || index} hover sx={{ 
          "&:hover": { 
            backgroundColor: "rgba(25, 118, 210, 0.04)",
            transform: "scale(1.001)",
            transition: "all 0.2s ease"
          }
        }}>
        <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
          {generateOrderCode(order, index)}
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UserAvatar user={order.users} size={40} />
            <Box>
              <Typography variant="body2" fontWeight="bold" sx={{ color: "text.primary" }}>
                {getCustomerName(order)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                📞 {getCustomerPhone(order)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
              borderColor: "info.200"
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
                backgroundColor: getContractorName(order) === "Chưa phân công" ? "warning.main" : "success.main"
              }} 
            />
            <Typography 
              variant="body2" 
              fontWeight="medium"
              color={getContractorName(order) === "Chưa phân công" ? "warning.main" : "text.primary"}
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
          <Typography variant="body2" fontWeight="medium" color="warning.main">
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
              boxShadow: 1
            }}
          />
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => onViewDetail(order.id || order.orderId)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "medium",
              boxShadow: 2,
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-1px)"
              }
            }}
          >
            Xem chi tiết
          </Button>
        </TableCell>
      </TableRow>
      {Array.isArray(orderDetails) && orderDetails.length > 0 && (
        <TableRow key={`${order.id}-details`}>
          <TableCell colSpan={10} sx={{ background: "linear-gradient(135deg, #f8f9ff 0%, #f0f2f5 100%)", p: 0 }}>
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
                    mr: 1
                  }
                }}
              >
                Chi tiết đơn hàng ({orderDetails.length} sản phẩm)
              </Typography>
              
              <Grid container spacing={2}>
                {orderDetails.map((detail, i) => {
                  console.log(`Rendering detail ${i} for order ${order.id}:`, detail);
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
                            transform: "translateY(-2px)"
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          {/* Header thông tin chính */}
                          <Box 
                            sx={{ 
                              background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                              borderRadius: 2,
                              p: 2,
                              mb: 2
                            }}
                          >
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Số tiền thi công
                                </Typography>
                                <Typography variant="h6" color="success.main" fontWeight="bold">
                                  {detail.detailConstructionAmount?.toLocaleString("vi-VN")}₫
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Số lượng
                                </Typography>
                                <Typography variant="h6" color="info.main" fontWeight="bold">
                                  {detail.quantity}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  ID Chi tiết
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
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
                                  sx={{ mb: 2, display: "flex", alignItems: "center" }}
                                >
                                  <Box 
                                    sx={{ 
                                      width: 8, 
                                      height: 8, 
                                      borderRadius: "50%", 
                                      backgroundColor: "primary.main",
                                      mr: 1 
                                    }} 
                                  />
                                  Thông tin sản phẩm
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={4}>
                                    <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Loại sản phẩm
                                      </Typography>
                                      <Typography variant="body2" fontWeight="medium">
                                        {detail.customerChoiceHistories.productTypeName}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Công thức tính
                                      </Typography>
                                      <Typography variant="body2" fontWeight="medium">
                                        {detail.customerChoiceHistories.calculateFormula}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <Box sx={{ p: 2, bgcolor: "success.50", borderRadius: 2, border: "1px solid", borderColor: "success.200" }}>
                                      <Typography variant="caption" color="success.dark" display="block">
                                        Tổng tiền
                                      </Typography>
                                      <Typography variant="body1" fontWeight="bold" color="success.main">
                                        {detail.customerChoiceHistories.totalAmount?.toLocaleString("vi-VN")}₫
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Box>
                              
                              {/* Thuộc tính */}
                              {detail.customerChoiceHistories.attributeSelections && detail.customerChoiceHistories.attributeSelections.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    fontWeight="bold" 
                                    color="primary"
                                    sx={{ mb: 2, display: "flex", alignItems: "center" }}
                                  >
                                    <Box 
                                      sx={{ 
                                        width: 8, 
                                        height: 8, 
                                        borderRadius: "50%", 
                                        backgroundColor: "warning.main",
                                        mr: 1 
                                      }} 
                                    />
                                    Thuộc tính sản phẩm ({detail.customerChoiceHistories.attributeSelections.length} thuộc tính)
                                  </Typography>
                                  <Grid container spacing={2}>
                                    {detail.customerChoiceHistories.attributeSelections.map((attr, idx) => (
                                      <Grid item xs={12} md={6} key={idx}>
                                        <Card 
                                          variant="outlined"
                                          sx={{ 
                                            borderRadius: 2,
                                            transition: "all 0.2s ease",
                                            "&:hover": { borderColor: "primary.main" }
                                          }}
                                        >
                                          <CardContent sx={{ p: 2 }}>
                                            <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
                                              {attr.attribute}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                              <strong>Giá trị:</strong> {attr.value} ({attr.unit})
                                            </Typography>
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                                              <Chip 
                                                label={`Vật tư: ${attr.materialPrice?.toLocaleString("vi-VN")}₫`}
                                                size="small"
                                                color="info"
                                                variant="outlined"
                                              />
                                              <Chip 
                                                label={`Đơn giá: ${attr.unitPrice?.toLocaleString("vi-VN")}₫`}
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                              />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              Công thức: {attr.calculateFormula}
                                            </Typography>
                                            <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ mt: 1 }}>
                                              Tổng: {attr.subTotal?.toLocaleString("vi-VN")}₫
                                            </Typography>
                                          </CardContent>
                                        </Card>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              )}

                              {/* Kích thước */}
                              {detail.customerChoiceHistories.sizeSelections && detail.customerChoiceHistories.sizeSelections.length > 0 && (
                                <Box>
                                  <Typography 
                                    variant="subtitle1" 
                                    fontWeight="bold" 
                                    color="primary"
                                    sx={{ mb: 2, display: "flex", alignItems: "center" }}
                                  >
                                    <Box 
                                      sx={{ 
                                        width: 8, 
                                        height: 8, 
                                        borderRadius: "50%", 
                                        backgroundColor: "info.main",
                                        mr: 1 
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
                                            textAlign: "center"
                                          }}
                                        >
                                          <Typography variant="caption" color="info.dark" display="block" fontWeight="medium">
                                            {size.size}
                                          </Typography>
                                          <Typography variant="body2" fontWeight="bold" color="info.main">
                                            {size.value}
                                          </Typography>
                                        </Box>
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
                  );
                })}
              </Grid>
            </Box>
          </TableCell>
        </TableRow>
      )}
    </>
  );
});

OrderRow.displayName = "OrderRow";

const DashboardContent = ({
  stats,
  orders = [],
  onViewDetail,
  statusFilter,
  onStatusFilterChange,
}) => {
  // State lưu orderDetails cho từng đơn hàng
  const [orderDetailsMap, setOrderDetailsMap] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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
            console.log(`Order ${order.id} - No details or invalid format:`, res);
          }
        }
        return null;
      });
      const results = await Promise.all(promises);
      const newDetails = {};
      results.forEach((item) => {
        if (item) newDetails[item.orderId] = item.details;
      });
      console.log('New order details map:', newDetails);
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
    const designAmount = order.totalDesignAmount || 0;
    const constructionAmount = order.totalConstructionAmount || 0;
    return designAmount + constructionAmount;
  }, []);

  const getDepositAmount = useCallback((order) => {
    const designDeposit = order.depositDesignAmount || 0;
    const constructionDeposit = order.depositConstructionAmount || 0;
    return designDeposit + constructionDeposit;
  }, []);

  const getRemainingAmount = useCallback((order) => {
    const designRemaining = order.remainingDesignAmount || 0;
    const constructionRemaining = order.remainingConstructionAmount || 0;
    return designRemaining + constructionRemaining;
  }, []);

  const getCreatedDate = useCallback((order) => {
    // Dựa trên API response, ưu tiên users.createdAt
    return (
      order?.users?.createdAt ||
      order?.users?.updatedAt ||
      order?.createdAt ||
      order?.orderDate ||
      order?.deliveryDate ||
      new Date().toISOString()
    );
  }, []);

  const generateOrderCode = useCallback((order, index) => {
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
              <MenuItem value="CONTRACT_CONFIRMED">Xác nhận hợp đồng</MenuItem>
              <MenuItem value="DEPOSITED">Đã đặt cọc</MenuItem>
              <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
              <MenuItem value="PRODUCING">Đang sản xuất</MenuItem>
              <MenuItem value="PRODUCTION_COMPLETED">
                Hoàn thành sản xuất
              </MenuItem>
              <MenuItem value="DELIVERING">Đang giao hàng</MenuItem>
              <MenuItem value="INSTALLED">Đã lắp đặt</MenuItem>
              <MenuItem value="COMPLETED">Hoàn tất</MenuItem>
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
      <Card sx={{ 
        borderRadius: 3, 
        overflow: "hidden",
        boxShadow: 3,
        border: "1px solid",
        borderColor: "divider"
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                "& .MuiTableCell-head": {
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  letterSpacing: "0.025em"
                }
              }}>
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
            <TableBody sx={{
              "& .MuiTableRow-root": {
                "&:nth-of-type(even)": {
                  backgroundColor: "rgba(0, 0, 0, 0.02)"
                },
                "&:last-child td, &:last-child th": {
                  border: 0
                }
              }
            }}>
              {filteredOrders.map((order, idx) => (
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
                  onViewDetail={onViewDetail}
                  orderDetails={orderDetailsMap[order.id]}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default DashboardContent;
