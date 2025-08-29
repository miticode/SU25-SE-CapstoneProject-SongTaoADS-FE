import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Avatar,
  Rating,
  Button,
  IconButton,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Reply as ReplyIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  fetchAllImpressions, // Đổi từ fetchAllFeedbacks
  respondToImpression, // Đổi từ respondToFeedback
  selectAllImpressions, // Đổi từ selectAllFeedbacks
  selectImpressionPagination, // Đổi từ selectFeedbackPagination
  selectFetchingAllImpressions, // Đổi từ selectFetchingAllFeedbacks
  selectFetchAllImpressionsError, // Đổi từ selectFetchAllFeedbacksError
  selectRespondingToImpression, // Đổi từ selectRespondingToFeedback
  selectRespondToImpressionError, // Đổi từ selectRespondToFeedbackError
  clearError,
  IMPRESSION_STATUS_MAP,
} from '../../store/features/impression/impressionSlice';
import {
  fetchOrderById
} from '../../store/features/order/orderSlice';
import S3Avatar from '../../components/S3Avatar';
import { getImageFromS3 } from '../../api/s3Service';

// Component để hiển thị ảnh feedback từ S3
const FeedbackImage = ({ s3Key, alt = "Feedback Image", style = {}, onClick }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let currentImageUrl = null;

    const loadImage = async () => {
      if (!s3Key) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        console.log('Loading feedback image from S3:', s3Key);
        
        const result = await getImageFromS3(s3Key);
        
        if (result.success) {
          currentImageUrl = result.imageUrl;
          setImageUrl(result.imageUrl);
          console.log('Feedback image loaded successfully');
        } else {
          console.error('Failed to load feedback image:', result.message);
          setError(true);
        }
      } catch (error) {
        console.error('Error loading feedback image:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    // Cleanup function để giải phóng URL
    return () => {
      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
      }
    };
  }, [s3Key]);

  const handleImageClick = () => {
    if (imageUrl && onClick) {
      // Mở ảnh trong tab mới sử dụng blob URL
      window.open(imageUrl, '_blank');
    } else if (onClick) {
      onClick();
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '200px',
          height: '150px',
          border: '1px dashed #ccc',
          borderRadius: '8px',
          ...style 
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error || !imageUrl) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '200px',
          height: '150px',
          border: '1px dashed #ccc',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
          color: 'text.secondary',
          ...style 
        }}
      >
        <Typography variant="caption">Không thể tải ảnh</Typography>
      </Box>
    );
  }

  return (
    <img 
      src={imageUrl}
      alt={alt}
      style={{
        maxWidth: '200px',
        height: 'auto',
        borderRadius: '8px',
        cursor: 'pointer',
        ...style
      }}
      onClick={handleImageClick}
    />
  );
};

// Component để hiển thị orderCode từ orderId
const OrderCodeDisplay = ({ orderId }) => {
  const dispatch = useDispatch();
  const [orderCode, setOrderCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      dispatch(fetchOrderById(orderId))
        .unwrap()
        .then((order) => {
          setOrderCode(order.orderCode || orderId);
        })
        .catch((error) => {
          console.error('Error fetching order:', error);
          setOrderCode(orderId); // Fallback to orderId
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [orderId, dispatch]);

  if (isLoading) {
    return (
      <Typography variant="caption" color="text.secondary">
        Đang tải mã đơn...
      </Typography>
    );
  }

  return (
    <Typography variant="caption" color="text.secondary">
      Mã đơn: {orderCode}
    </Typography>
  );
};

// Component FeedbackList
const FeedbackList = ({ feedbacks, onView, onRefresh }) => {
  return (
    <Box sx={{ p: 2 }}>
      {/* Header với nút refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Danh sách Feedback ({feedbacks.length})
        </Typography>
        <IconButton onClick={onRefresh} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Stack spacing={2}>
        {feedbacks.map((feedback) => (
          <Card key={feedback.id} sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Stack spacing={2}>
                {/* Header với thông tin khách hàng */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <S3Avatar 
                      s3Key={feedback.sendBy?.avatar}
                      alt={feedback.sendBy?.fullName}
                      sx={{ width: 40, height: 40 }}
                    >
                      {feedback.sendBy?.fullName?.charAt(0)}
                    </S3Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {feedback.sendBy?.fullName || 'Khách hàng'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feedback.sendBy?.email}
                      </Typography>
                      <OrderCodeDisplay orderId={feedback.orderId} />
                    </Box>
                  </Box>
                  
                  <Chip 
                   label={IMPRESSION_STATUS_MAP[feedback.status]?.label || feedback.status}
                    color={IMPRESSION_STATUS_MAP[feedback.status]?.color || 'default'}
                    size="small"
                  />
                </Box>

                {/* Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating 
                    value={feedback.rating} 
                    readOnly 
                    size="small"
                    icon={<StarIcon fontSize="inherit" />}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({feedback.rating}/5)
                  </Typography>
                </Box>

                {/* Comment */}
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  "{feedback.comment}"
                </Typography>

                {/* Feedback Image */}
                {feedback.feedbackImageUrl && (
                  <Box>
                    <FeedbackImage 
                      s3Key={feedback.feedbackImageUrl}
                      alt="Feedback"
                    />
                  </Box>
                )}

                {/* Timestamps */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary">
                    Gửi lúc: {new Date(feedback.sendAt).toLocaleString('vi-VN')}
                  </Typography>
                </Box>

                {/* Admin Response */}
                {feedback.response && (
                  <Box 
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'success.50', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'success.200'
                    }}
                  >
                    <Typography variant="subtitle2" color="success.dark" fontWeight={600} sx={{ mb: 1 }}>
                      💬 Phản hồi từ chúng tôi:
                    </Typography>
                    <Typography variant="body2" color="success.dark">
                      {feedback.response}
                    </Typography>
                    {feedback.responseAt && (
                      <Typography variant="caption" color="success.dark" sx={{ display: 'block', mt: 1 }}>
                        Phản hồi lúc: {new Date(feedback.responseAt).toLocaleString('vi-VN')}
                      </Typography>
                    )}
                  </Box>
                )}

                <Divider />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => onView(feedback)}
                  >
                    Xem chi tiết
                  </Button>
                  
                  {!feedback.response && (
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      startIcon={<ReplyIcon />}
                      onClick={() => onView(feedback)}
                    >
                      Phản hồi
                    </Button>
                  )}
                  
                  
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

// Component FeedbackDetailDialog với tích hợp API respond
const FeedbackDetailDialog = ({ open, feedback, onClose, onRespond }) => {
  const dispatch = useDispatch();
  const respondingToFeedback = useSelector(selectRespondingToImpression); // Đổi selector
  const respondError = useSelector(selectRespondToImpressionError); // Đổi selector
  
  const [response, setResponse] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setResponse('');
      setShowSuccess(false);
    }
  }, [open]);

  if (!open || !feedback) return null;

  const handleSubmitResponse = async () => {
  if (!response.trim()) return;

  try {
    await dispatch(respondToImpression({
      impressionId: feedback.id,
      responseText: response.trim()
    })).unwrap();
    
    // Hiển thị thông báo thành công
    setShowSuccess(true);
    
    // Đóng dialog và refresh data
    setTimeout(() => {
      onClose(); // Đóng dialog
      onRespond(); // Refresh data
    }, 1500); // Đợi 1.5s để user thấy thông báo thành công
    
  } catch (error) {
    console.error('Error responding to feedback:', error);
    // Lỗi sẽ được hiển thị qua respondError từ Redux
  }
};

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1300,
        }}
        onClick={onClose}
      >
        <Paper
          sx={{
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            p: 3,
            borderRadius: 2,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Chi tiết Feedback
          </Typography>
          
          <Stack spacing={2}>
            {/* Customer Info */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Khách hàng:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
               <S3Avatar 
                  s3Key={feedback.sendBy?.avatar}
                  alt={feedback.sendBy?.fullName}
                  sx={{ width: 48, height: 48 }}
                >
                  {feedback.sendBy?.fullName?.charAt(0)}
                </S3Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {feedback.sendBy?.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feedback.sendBy?.email}
                  </Typography>
                  <OrderCodeDisplay orderId={feedback.orderId} />
                </Box>
              </Box>
            </Box>

            {/* Rating */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Đánh giá:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Rating value={feedback.rating} readOnly />
                <Typography variant="body2" color="text.secondary">
                  ({feedback.rating}/5)
                </Typography>
              </Box>
            </Box>

            {/* Comment */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Bình luận:</Typography>
              <Typography variant="body1" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{feedback.comment}"
              </Typography>
            </Box>

            {/* Feedback Image */}
            {feedback.feedbackImageUrl && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Hình ảnh:</Typography>
                <Box sx={{ mt: 1 }}>
                  <FeedbackImage 
                    s3Key={feedback.feedbackImageUrl}
                    alt="Feedback"
                    style={{ maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            )}

            {/* Existing Response */}
            {feedback.response && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'success.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'success.200'
                }}
              >
                <Typography variant="subtitle2" color="success.dark" fontWeight={600}>
                  💬 Phản hồi hiện tại:
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {feedback.response}
                </Typography>
                {feedback.responseAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Phản hồi lúc: {new Date(feedback.responseAt).toLocaleString('vi-VN')}
                  </Typography>
                )}
              </Box>
            )}

            {/* Response Input */}
            {!feedback.response && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Phản hồi của bạn: *
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Nhập phản hồi của bạn cho khách hàng..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  error={!!respondError}
                  helperText={respondError}
                />
              </Box>
            )}

            {/* Timestamps */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Gửi lúc: {new Date(feedback.sendAt).toLocaleString('vi-VN')}
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 2 }}>
              <Button onClick={onClose} disabled={respondingToFeedback}>
                Đóng
              </Button>
              {!feedback.response && (
                <Button
                  variant="contained"
                  startIcon={respondingToFeedback ? <CircularProgress size={16} /> : <SendIcon />}
                  onClick={handleSubmitResponse}
                  disabled={!response.trim() || respondingToFeedback}
                >
                  {respondingToFeedback ? 'Đang gửi...' : 'Gửi phản hồi'}
                </Button>
              )}
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Phản hồi đã được gửi thành công!
        </Alert>
      </Snackbar>
    </>
  );
};

const FeedBack = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const allFeedbacks = useSelector(selectAllImpressions); // Đổi selector
  const pagination = useSelector(selectImpressionPagination); // Selector for pagination info
  const loading = useSelector(selectFetchingAllImpressions); // Đổi selector
  const error = useSelector(selectFetchAllImpressionsError);
  
  // Local state
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load feedbacks khi component mount hoặc khi page thay đổi
  useEffect(() => {
    // Nếu có search hoặc filter, fetch tất cả data để có thể filter client-side
    if (searchTerm || statusFilter) {
      dispatch(fetchAllImpressions()); // Fetch all data for filtering
    } else {
      dispatch(fetchAllImpressions({ page: currentPage, size: 10 })); // Fetch với pagination
    }
  }, [dispatch, currentPage, searchTerm, statusFilter]);


  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Refresh data
  const handleRefresh = () => {
    dispatch(clearError());
    setCurrentPage(1);
    // Refresh theo điều kiện hiện tại
    if (searchTerm || statusFilter) {
      dispatch(fetchAllImpressions()); // Fetch all data for filtering
    } else {
      dispatch(fetchAllImpressions({ page: 1, size: 10 })); // Fetch với pagination
    }
  };
  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setFeedbackDialogOpen(true);
  };



  const handleCloseFeedbackDialog = () => {
    setFeedbackDialogOpen(false);
    setSelectedFeedback(null);
  };

  const handleAfterRespond = () => {
    // Refresh data sau khi phản hồi thành công
    handleRefresh();
  };

  // For server-side pagination, use all feedbacks directly without client filtering
  const displayFeedbacks = allFeedbacks;

  // Client-side pagination logic - use server pagination info
  const itemsPerPage = pagination?.pageSize || 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Logic phân biệt server-side và client-side pagination:
  // - Khi KHÔNG có search/filter: Sử dụng server-side pagination (hiệu quả hơn)
  // - Khi CÓ search/filter: Sử dụng client-side pagination (vì API chưa hỗ trợ search/filter)
  const shouldUseClientFiltering = searchTerm || statusFilter;
  
  const filteredFeedbacks = shouldUseClientFiltering ? displayFeedbacks.filter(feedback => {
    const matchesSearch = !searchTerm || 
      feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.sendBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.sendBy?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.orderCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || feedback.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : displayFeedbacks;

  // Use server pagination when no client filtering, otherwise use client pagination
  const finalFeedbacks = shouldUseClientFiltering ? 
    filteredFeedbacks.slice(startIndex, endIndex) : // Client-side pagination
    displayFeedbacks; // Server-side pagination (data đã được paginated từ server)

  // Use server pagination when no client filtering, otherwise use client pagination
  const displayTotalPages = shouldUseClientFiltering ? 
    Math.ceil(filteredFeedbacks.length / itemsPerPage) : 
    (pagination?.totalPages || 1);
  const displayCurrentPage = shouldUseClientFiltering ? currentPage : (pagination?.currentPage || currentPage);
  const displayTotalElements = shouldUseClientFiltering ? 
    filteredFeedbacks.length : 
    (pagination?.totalElements || displayFeedbacks.length);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight={600}
              color="primary.main"
              sx={{ mb: 1 }}
            >
              🗨️ Quản lý Feedback
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
            >
              Xem và quản lý tất cả feedback từ khách hàng
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ textTransform: 'none' }}
            >
              Làm mới
            </Button>
            <Chip 
              label={`Tổng: ${displayTotalElements}`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label={`Trang ${displayCurrentPage}/${displayTotalPages}`} 
              color="info" 
              variant="outlined"
            />
            <Chip 
              label={`Hiển thị ${startIndex + 1}-${Math.min(endIndex, displayTotalElements)} của ${displayTotalElements}`} 
              color="secondary" 
              variant="outlined"
              size="small"
            />
          </Box>
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          {/* Search */}
          <TextField
            placeholder="Tìm kiếm theo bình luận, tên khách hàng, email, mã đơn hàng..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {/* Status Filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(IMPRESSION_STATUS_MAP).map(([status, config]) => (
                <MenuItem key={status} value={status}>
                  <Chip 
                    label={config.label} 
                    color={config.color} 
                    size="small"
                    sx={{ minWidth: 80 }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          minHeight: '70vh'
        }}
      >
        {loading ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px'
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : finalFeedbacks.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px',
              color: 'text.secondary'
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {searchTerm || statusFilter ? 'Không tìm thấy feedback nào' : 'Chưa có feedback nào'}
            </Typography>
            <Typography variant="body2">
              {searchTerm || statusFilter ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Feedback từ khách hàng sẽ hiển thị ở đây'}
            </Typography>
          </Box>
        ) : (
          <FeedbackList
            feedbacks={finalFeedbacks}
            onView={handleViewFeedback}
            onRefresh={handleRefresh}
          />
        )}
      </Paper>

      {/* Pagination */}
      {displayTotalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, displayTotalElements)} của {displayTotalElements} feedback
          </Typography>
          
          <Pagination
            count={displayTotalPages}
            page={displayCurrentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}

      {/* Feedback Detail Dialog */}
      <FeedbackDetailDialog
        open={feedbackDialogOpen}
        feedback={selectedFeedback}
        onClose={handleCloseFeedbackDialog}
        onRespond={handleAfterRespond}
      />
    </Container>
  );
};

export default FeedBack;
