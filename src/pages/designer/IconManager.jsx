import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchIcons, 
  createIcon, 
  updateIconInfo, 
  updateIconImage, 
  deleteIcon,
  selectAllIcons, 
  selectIconStatus, 
  selectIconError,
  selectIconPagination,
  selectHasNextPage,
  selectHasPreviousPage,
  selectTotalIcons
} from '../../store/features/icon/iconSlice';

const IconManager = () => {
  const dispatch = useDispatch();
  const icons = useSelector(selectAllIcons);
  const status = useSelector(selectIconStatus);
  const error = useSelector(selectIconError);
  const pagination = useSelector(selectIconPagination);
  const hasNextPage = useSelector(selectHasNextPage);
  const hasPreviousPage = useSelector(selectHasPreviousPage);
  const totalIcons = useSelector(selectTotalIcons);

  // State cho dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);

  // State cho form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconImage: null
  });

  // State cho thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Auto-hide snackbar sau 3 giây
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // State cho filter
  const [filterContentType, setFilterContentType] = useState('all');

  useEffect(() => {
    dispatch(fetchIcons({ page: 1, size: 10 }));
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    dispatch(fetchIcons({ page: newPage, size: 10 }));
  };

  const handleCreateIcon = async () => {
    if (!formData.name || !formData.iconImage) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập tên và chọn hình ảnh cho icon',
        severity: 'error'
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('iconImage', formData.iconImage);

    try {
      await dispatch(createIcon(formDataToSend)).unwrap();
      setSnackbar({
        open: true,
        message: 'Tạo icon thành công!',
        severity: 'success'
      });
      setOpenCreateDialog(false);
      resetForm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Có lỗi xảy ra khi tạo icon',
        severity: 'error'
      });
    }
  };

  const handleUpdateIconInfo = async () => {
    if (!formData.name) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập tên cho icon',
        severity: 'error'
      });
      return;
    }

    try {
      await dispatch(updateIconInfo({
        iconId: selectedIcon.id,
        updateData: {
          name: formData.name,
          description: formData.description
        }
      })).unwrap();
      setSnackbar({
        open: true,
        message: 'Cập nhật thông tin icon thành công!',
        severity: 'success'
      });
      setOpenEditDialog(false);
      resetForm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Có lỗi xảy ra khi cập nhật icon',
        severity: 'error'
      });
    }
  };

  const handleUpdateIconImage = async () => {
    if (!formData.iconImage) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn hình ảnh mới cho icon',
        severity: 'error'
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('iconImage', formData.iconImage);

    try {
      await dispatch(updateIconImage({
        iconId: selectedIcon.id,
        formData: formDataToSend
      })).unwrap();
      setSnackbar({
        open: true,
        message: 'Cập nhật hình ảnh icon thành công!',
        severity: 'success'
      });
      setOpenImageDialog(false);
      resetForm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Có lỗi xảy ra khi cập nhật hình ảnh',
        severity: 'error'
      });
    }
  };

  const handleDeleteIcon = async () => {
    try {
      // Sử dụng fileDataId từ selectedIcon để xóa
      const fileDataId = selectedIcon.id; // Giả sử id chính là fileDataId
      
      await dispatch(deleteIcon(fileDataId)).unwrap();
      setSnackbar({
        open: true,
        message: 'Xóa icon thành công!',
        severity: 'success'
      });
      setOpenDeleteDialog(false);
      setSelectedIcon(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error || 'Có lỗi xảy ra khi xóa icon',
        severity: 'error'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      iconImage: null
    });
  };

  const openEditDialogHandler = (icon) => {
    setSelectedIcon(icon);
    setFormData({
      name: icon.name,
      description: icon.description || '',
      iconImage: null
    });
    setOpenEditDialog(true);
  };

  const openImageDialogHandler = (icon) => {
    setSelectedIcon(icon);
    setFormData({
      name: icon.name,
      description: icon.description || '',
      iconImage: null
    });
    setOpenImageDialog(true);
  };

  const openDeleteDialogHandler = (icon) => {
    setSelectedIcon(icon);
    setOpenDeleteDialog(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, iconImage: file }));
    }
  };

  const filteredIcons = filterContentType === 'all' 
    ? icons 
    : icons.filter(icon => icon.contentType === filterContentType);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (status === 'loading' && icons.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-600">
                Quản lý Icon
              </h1>
              <p className="text-gray-600 mt-2">Quản lý và tổ chức các icon trong hệ thống</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={() => setOpenCreateDialog(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm Icon
              </button>
              <button
                className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 hover:bg-gray-50 shadow-md"
                onClick={() => dispatch(fetchIcons({ page: 1, size: 10 }))}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-gray-700 font-medium">Lọc theo loại:</label>
            <select
              value={filterContentType}
              onChange={(e) => setFilterContentType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="all">Tất cả</option>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/svg+xml">SVG</option>
              <option value="image/gif">GIF</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Icons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredIcons.map((icon) => (
            <div key={icon.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center">
                  <img
                    src={icon.presignedUrl || icon.fullImageUrl}
                    alt={icon.name}
                    className="w-full h-24 object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                  {icon.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                  {icon.description || 'Không có mô tả'}
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Loại: {icon.fileType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Kích thước: {formatFileSize(icon.fileSize)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>Ngày tạo: {new Date(icon.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-2">
                <button
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  onClick={() => openEditDialogHandler(icon)}
                  title="Sửa thông tin"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Sửa</span>
                </button>
                <button
                  className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  onClick={() => openImageDialogHandler(icon)}
                  title="Thay đổi hình ảnh"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Ảnh</span>
                </button>
                <button
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  onClick={() => openDeleteDialogHandler(icon)}
                  title="Xóa icon"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalIcons > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-center">
              <div className="flex gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Icon Dialog */}
      {openCreateDialog && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
            <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
              <h2 className="text-lg font-semibold">Thêm Icon Mới</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên icon</label>
                <input
                  type="text"
                  placeholder="Nhập tên icon..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  placeholder="Nhập mô tả..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="create-icon-image"
                  />
                  <label htmlFor="create-icon-image" className="cursor-pointer">
                    <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-xs text-gray-600">Chọn hình ảnh</p>
                  </label>
                </div>
                {formData.iconImage && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Đã chọn: {formData.iconImage.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-4 pt-0">
              <button
                onClick={() => setOpenCreateDialog(false)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateIcon}
                disabled={status === 'loading'}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium text-sm transform hover:scale-105"
              >
                {status === 'loading' ? 'Đang tạo...' : 'Tạo Icon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Icon Dialog */}
      {openEditDialog && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
            <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
              <h2 className="text-lg font-semibold">Sửa Thông Tin Icon</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên icon</label>
                <input
                  type="text"
                  placeholder="Nhập tên icon..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  placeholder="Nhập mô tả..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-4 pt-0">
              <button
                onClick={() => setOpenEditDialog(false)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateIconInfo}
                disabled={status === 'loading'}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium text-sm transform hover:scale-105"
              >
                {status === 'loading' ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Image Dialog */}
      {openImageDialog && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
            <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
              <h2 className="text-lg font-semibold">Thay Đổi Hình Ảnh Icon</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">Icon hiện tại:</span> {selectedIcon?.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh mới</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="update-icon-image"
                  />
                  <label htmlFor="update-icon-image" className="cursor-pointer">
                    <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-xs text-gray-600">Chọn hình ảnh mới</p>
                  </label>
                </div>
                {formData.iconImage && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Đã chọn: {formData.iconImage.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-4 pt-0">
              <button
                onClick={() => setOpenImageDialog(false)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateIconImage}
                disabled={status === 'loading'}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium text-sm transform hover:scale-105"
              >
                {status === 'loading' ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {openDeleteDialog && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
            <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
              <h2 className="text-lg font-semibold">Xác nhận xóa</h2>
            </div>
            <div className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-red-700 font-medium text-sm">Cảnh báo</p>
                    <p className="text-red-600 text-xs">
                      Bạn có chắc chắn muốn xóa icon "{selectedIcon?.name}"? Hành động này không thể hoàn tác.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 pt-0">
              <button
                onClick={() => setOpenDeleteDialog(false)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteIcon}
                disabled={status === 'loading'}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium text-sm transform hover:scale-105"
              >
                {status === 'loading' ? 'Đang xóa...' : 'Xóa Icon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 transform transition-all duration-300 ${
          snackbar.severity === 'success' 
            ? 'bg-blue-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {snackbar.severity === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{snackbar.message}</span>
            <button
              onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
              className="ml-2 hover:opacity-80 transition-opacity duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconManager;
