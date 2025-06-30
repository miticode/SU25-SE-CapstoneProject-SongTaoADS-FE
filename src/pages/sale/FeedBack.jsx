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
  fetchAllFeedbacks,
  respondToFeedback,
  selectAllFeedbacks,
  selectFeedbackPagination,
  selectFetchingAllFeedbacks,
  selectFetchAllFeedbacksError,
  selectRespondingToFeedback,
  selectRespondToFeedbackError,
  clearError,
  resetPagination,
  FEEDBACK_STATUS_MAP,
} from '../../store/features/feedback/feedbackSlice';
import S3Avatar from '../../components/S3Avatar';

// Component FeedbackList
const FeedbackList = ({ feedbacks, onView, onDelete, onRefresh }) => {
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
                      <Typography variant="caption" color="text.secondary">
                        Mã đơn: {feedback.orderId}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Chip 
                    label={FEEDBACK_STATUS_MAP[feedback.status]?.label || feedback.status}
                    color={FEEDBACK_STATUS_MAP[feedback.status]?.color || 'default'}
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
                    <img 
                      src={feedback.feedbackImageUrl}
                      alt="Feedback"
                      style={{
                        maxWidth: '200px',
                        height: 'auto',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(feedback.feedbackImageUrl, '_blank')}
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
  const respondingToFeedback = useSelector(selectRespondingToFeedback);
  const respondError = useSelector(selectRespondToFeedbackError);
  
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
      await dispatch(respondToFeedback({
        feedbackId: feedback.id,
        responseText: response.trim()
      })).unwrap();
      
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        onRespond(); // Callback để refresh data
      }, 1500);
    } catch (error) {
      console.error('Error responding to feedback:', error);
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
                  <Typography variant="caption" color="text.secondary">
                    Mã đơn: {feedback.orderId}
                  </Typography>
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
                  <img 
                    src={feedback.feedbackImageUrl}
                    alt="Feedback"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(feedback.feedbackImageUrl, '_blank')}
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
  const allFeedbacks = useSelector(selectAllFeedbacks);
  const pagination = useSelector(selectFeedbackPagination);
  const loading = useSelector(selectFetchingAllFeedbacks);
  const error = useSelector(selectFetchAllFeedbacksError);
  
  // Local state
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load feedbacks khi component mount hoặc khi filter thay đổi
  useEffect(() => {
    dispatch(fetchAllFeedbacks({ page: currentPage, size: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1); // Reset về trang đầu
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
    dispatch(resetPagination());
    setCurrentPage(1);
    dispatch(fetchAllFeedbacks({ page: 1, size: pageSize }));
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

  // Filter feedbacks based on search term and status
  const filteredFeedbacks = allFeedbacks.filter(feedback => {
    const matchesSearch = !searchTerm || 
      feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.sendBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.sendBy?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || feedback.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip 
              label={`Tổng: ${pagination.totalElements || 0}`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label={`Trang ${pagination.currentPage || 1}/${pagination.totalPages || 1}`} 
              color="info" 
              variant="outlined"
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
              {Object.entries(FEEDBACK_STATUS_MAP).map(([status, config]) => (
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
          
          {/* Page Size */}
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Số lượng</InputLabel>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              label="Số lượng"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
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
        ) : filteredFeedbacks.length === 0 ? (
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
            feedbacks={filteredFeedbacks}
            onView={handleViewFeedback}
           
            onRefresh={handleRefresh}
          />
        )}
      </Paper>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
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
