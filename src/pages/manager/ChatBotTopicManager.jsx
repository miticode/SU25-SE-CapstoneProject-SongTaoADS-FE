import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Chat as ChatIcon,
  Topic as TopicIcon,
  SmartToy as BotIcon,
} from '@mui/icons-material';
import {
  fetchAllChatBotTopics,
  fetchChatBotTopicsByModelChat,
  fetchChatBotTopicsByTopic,
  addTopicToModelChatBot,
  addTopicFromExistingModel,
  deleteChatBotTopicById,
  selectAllChatBotTopics,
  selectChatBotTopicsByModel,
  selectChatBotTopicsByTopic,
  selectChatBotTopicLoading,
  selectChatBotTopicCreateLoading,
  selectChatBotTopicDeleteLoading,
  selectChatBotTopicError,
  selectChatBotTopicSuccess,
  clearError,
  clearSuccess,
} from '../../store/features/chatBotTopic/chatBotTopicSlice';
import {
  fetchAllTopics,
  selectAllTopics,
  selectTopicLoading,
} from '../../store/features/topic/topicSlice';

const ChatBotTopicManager = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const chatBotTopics = useSelector(selectAllChatBotTopics);
  const chatBotTopicsByModel = useSelector(selectChatBotTopicsByModel);
  const chatBotTopicsByTopic = useSelector(selectChatBotTopicsByTopic);
  const loading = useSelector(selectChatBotTopicLoading);
  const createLoading = useSelector(selectChatBotTopicCreateLoading);
  const deleteLoading = useSelector(selectChatBotTopicDeleteLoading);
  const error = useSelector(selectChatBotTopicError);
  const success = useSelector(selectChatBotTopicSuccess);
  
  const topics = useSelector(selectAllTopics);
  const topicLoading = useSelector(selectTopicLoading);

  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    modelChatBotId: '',
    topicId: '',
    description: '',
  });

  // Mock data cho model chat bot (có thể thay bằng API thực tế)
  const mockModelChatBots = [
    { id: 1, name: 'Song Tạo AI Pro', description: 'Chatbot chính của hệ thống' },
    { id: 2, name: 'Song Tạo Support', description: 'Chatbot hỗ trợ khách hàng' },
    { id: 3, name: 'Song Tạo Sales', description: 'Chatbot tư vấn bán hàng' },
  ];

  useEffect(() => {
    dispatch(fetchAllChatBotTopics());
    dispatch(fetchAllTopics());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  const handleOpenDialog = (mode, item = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && item) {
      setSelectedItem(item);
      setFormData({
        modelChatBotId: item.modelChatBotId || '',
        topicId: item.topicId || '',
        description: item.description || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({
        modelChatBotId: '',
        topicId: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({
      modelChatBotId: '',
      topicId: '',
      description: '',
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.modelChatBotId || !formData.topicId) {
      return;
    }

    try {
      if (dialogMode === 'create') {
        await dispatch(addTopicToModelChatBot({
          modelChatBotId: formData.modelChatBotId,
          topicId: formData.topicId
        })).unwrap();
      } else {
        // Cập nhật - có thể cần API riêng
        await dispatch(addTopicFromExistingModel({
          modelChatBotId: formData.modelChatBotId,
          topicData: {
            topicId: formData.topicId,
            description: formData.description
          }
        })).unwrap();
      }
      handleCloseDialog();
      dispatch(fetchAllChatBotTopics());
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chat bot topic này?')) {
      try {
        await dispatch(deleteChatBotTopicById(id)).unwrap();
        dispatch(fetchAllChatBotTopics());
      } catch (error) {
        console.error('Error deleting chat bot topic:', error);
      }
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setOpenViewDialog(true);
  };

  const handleRefresh = () => {
    dispatch(fetchAllChatBotTopics());
    dispatch(fetchAllTopics());
  };

  const getModelChatBotName = (id) => {
    const model = mockModelChatBots.find(m => m.id === id);
    return model ? model.name : `Model ${id}`;
  };

  const getTopicName = (id) => {
    const topic = topics.find(t => t.id === id);
    return topic ? topic.title : `Topic ${id}`;
  };

  const getTopicDescription = (id) => {
    const topic = topics.find(t => t.id === id);
    return topic ? topic.description : '';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredChatBotTopics = chatBotTopics.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ChatIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Quản lý Chat Bot Topic
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Quản lý mối quan hệ giữa Model Chat Bot và Topic
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
            disabled={createLoading}
          >
            Thêm mới
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BotIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {mockModelChatBots.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Model Chat Bot
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TopicIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {topics?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Topic
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ChatIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {chatBotTopics?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chat Bot Topic
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TopicIcon sx={{ fontSize: 40, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {topics?.filter(t => chatBotTopics?.some(cbt => cbt.topicId === t.id))?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Topic đã gán
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Model Chat Bot</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Mô tả Topic</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredChatBotTopics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredChatBotTopics.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <Chip
                        label={getModelChatBotName(item.modelChatBotId)}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTopicName(item.topicId)}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {getTopicDescription(item.topicId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(item)}
                            color="info"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('edit', item)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item.id)}
                            color="error"
                            disabled={deleteLoading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={chatBotTopics?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Thêm Chat Bot Topic mới' : 'Chỉnh sửa Chat Bot Topic'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Model Chat Bot</InputLabel>
              <Select
                value={formData.modelChatBotId}
                onChange={(e) => handleInputChange('modelChatBotId', e.target.value)}
                label="Model Chat Bot"
              >
                {mockModelChatBots.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Topic</InputLabel>
              <Select
                value={formData.topicId}
                onChange={(e) => handleInputChange('topicId', e.target.value)}
                label="Topic"
              >
                {topics?.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Mô tả (tùy chọn)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.modelChatBotId || !formData.topicId || createLoading}
          >
            {createLoading ? <CircularProgress size={20} /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết Chat Bot Topic</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">ID</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedItem.id}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Model Chat Bot</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {getModelChatBotName(selectedItem.modelChatBotId)}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Topic</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {getTopicName(selectedItem.topicId)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Mô tả Topic</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {getTopicDescription(selectedItem.topicId)}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Ngày tạo</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString('vi-VN') : 'N/A'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Ngày cập nhật</Typography>
                  <Typography variant="body1">
                    {selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => dispatch(clearError())}
      >
        <Alert onClose={() => dispatch(clearError())} severity="error">
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => dispatch(clearSuccess())}
      >
        <Alert onClose={() => dispatch(clearSuccess())} severity="success">
          {success}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog('create')}
        disabled={createLoading}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ChatBotTopicManager;
