import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Pagination,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  Stack,
  Backdrop,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchDesignRequestsByDesigner } from "../../store/features/customeDesign/customerDesignSlice";
import {
  selectStatus,
  selectError,
  approveCustomDesignRequest,
  rejectCustomDesignRequest,
  CUSTOM_DESIGN_STATUS_MAP,
  sendFinalDesignImage,
  getFinalDesignSubImages,
  selectFinalDesignSubImages,
} from "../../store/features/customeDesign/customerDesignSlice";
import { fetchCustomerDetailById } from "../../store/features/customer/customerSlice";
import {
  createDemoDesign,
  getDemoDesigns,
  uploadDemoSubImages,
  getDemoSubImages,
  selectDemoSubImages,
} from "../../store/features/demo/demoSlice";
import { fetchImageFromS3 } from "../../store/features/s3/s3Slice";
import { useDropzone } from "react-dropzone";

// Lấy designerId từ state đăng nhập
import { useSelector as useAuthSelector } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";

const DesignRequests = () => {
  const dispatch = useDispatch();
  const { user } = useAuthSelector((state) => state.auth);
  const designerId = user?.id;

  // Helper function để format thông tin file
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Component để hiển thị thông tin file trong tooltip
  const FileInfoTooltip = ({ fileInfo }) => {
    if (!fileInfo) return <Typography variant="body2">Không có thông tin file</Typography>;
    
    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Thông tin file:
        </Typography>
        {fileInfo.name && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Tên file:</strong> {fileInfo.name}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Content Type:</strong> {fileInfo.contentType || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>File Type:</strong> {fileInfo.fileType || "N/A"}
        </Typography>
        <Typography variant="body2">
          <strong>File Size:</strong> {formatFileSize(fileInfo.fileSize)}
        </Typography>
      </Box>
    );
  };

  // Lưu danh sách đơn được giao
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  // Lưu thông tin doanh nghiệp: id -> { companyName }
  const [customerDetails, setCustomerDetails] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openDemoDialog, setOpenDemoDialog] = useState(false);
  const [demoForm, setDemoForm] = useState({
    designerDescription: "",
    customDesignImage: null,
    subImages: [], // Thêm state cho sub-images
  });
  const [demoFormError, setDemoFormError] = useState("");
  const [updateDemoMode, setUpdateDemoMode] = useState(false);
  const [latestDemo, setLatestDemo] = useState(null);
  const [openFinalDesignDialog, setOpenFinalDesignDialog] = useState(false);
  const [finalDesignForm, setFinalDesignForm] = useState({
    finalDesignImage: null,
    subFinalDesignImages: []
  });
  const [finalDesignError, setFinalDesignError] = useState("");


  // State để lưu S3 URLs cho sub-images
  const [s3ImageUrls, setS3ImageUrls] = useState({});

  // State để lưu S3 URL cho demo chính
  const [mainDemoS3Url, setMainDemoS3Url] = useState(null);

  // State để lưu S3 URLs cho final design sub-images
  const [finalDesignS3Urls, setFinalDesignS3Urls] = useState({});

  // State để lưu S3 URL cho final design image chính
  const [finalDesignMainS3Url, setFinalDesignMainS3Url] = useState(null);

  // State cho image viewer
  const [imageViewer, setImageViewer] = useState({
    open: false,
    imageUrl: '',
    title: ''
  });

  // Lấy sub-images cho demo hiện tại
  const demoSubImages = useSelector((state) =>
    latestDemo ? selectDemoSubImages(state, latestDemo.id) : []
  );

  // Lấy final design sub images
  const finalDesignSubImages = useSelector(selectFinalDesignSubImages);

  // Dropzone cho sub-images
  const subImagesDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    onDrop: (acceptedFiles) => {
      setDemoForm((prev) => ({
        ...prev,
        subImages: [...prev.subImages, ...acceptedFiles],
      }));
    },
  });

  // Dropzone cho main image
  const mainImageDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setDemoForm((prev) => ({
          ...prev,
          customDesignImage: acceptedFiles[0],
        }));
      }
    },
  });

  // Dropzone cho final design main image
  const finalDesignMainDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFinalDesignForm((prev) => ({
          ...prev,
          finalDesignImage: acceptedFiles[0],
        }));
      }
    },
  });

  // Dropzone cho final design sub-images
  const finalDesignSubDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    onDrop: (acceptedFiles) => {
      setFinalDesignForm((prev) => ({
        ...prev,
        subFinalDesignImages: [...prev.subFinalDesignImages, ...acceptedFiles],
      }));
    },
  });

  useEffect(() => {
    if (designerId) {
      dispatch(
        fetchDesignRequestsByDesigner({
          designerId,
          page: pagination.currentPage,
          size: pagination.pageSize,
        })
      )
        .unwrap()
        .then((res) => {
          setRequests(res.result || []);
          setPagination({
            currentPage: res.currentPage || 1,
            totalPages: res.totalPages || 1,
            pageSize: res.pageSize || 10,
            totalElements: res.totalElements || 0,
          });
          // Lấy tất cả customerDetailId duy nhất (luôn lấy .id nếu là object)
          const ids = Array.from(
            new Set(
              (res.result || [])
                .map((r) => {
                  if (
                    typeof r.customerDetail === "object" &&
                    r.customerDetail !== null
                  ) {
                    return r.customerDetail.id;
                  }
                  return r.customerDetail;
                })
                .filter(Boolean)
            )
          );
          ids.forEach((id) => {
            if (!customerDetails[id]) {
              dispatch(fetchCustomerDetailById(id))
                .unwrap()
                .then((detail) => {
                  setCustomerDetails((prev) => ({
                    ...prev,
                    [id]: detail.companyName || "Không rõ",
                  }));
                })
                .catch(() => {
                  setCustomerDetails((prev) => ({ ...prev, [id]: "Không rõ" }));
                });
            }
          });
        })
        .catch(() => {
          setRequests([]);
        });
    }
  }, [designerId, dispatch, pagination.currentPage, pagination.pageSize]);

  // Lấy demo mới nhất khi mở dialog chi tiết
  useEffect(() => {
    const fetchLatestDemo = async () => {
      if (openDialog && selectedRequest) {
        try {
          const res = await dispatch(
            getDemoDesigns(selectedRequest.id)
          ).unwrap();
          if (res && res.length > 0) {
            const latestDemo = res[res.length - 1];
            setLatestDemo(latestDemo);
            // Fetch sub-images cho demo mới nhất
            await dispatch(getDemoSubImages(latestDemo.id)).unwrap();
            // Clear S3 URLs để fetch lại
            setS3ImageUrls({});
            setMainDemoS3Url(null);
          } else {
            setLatestDemo(null);
            setS3ImageUrls({}); // clear S3 URLs
            setMainDemoS3Url(null);
          }

          // Fetch final design sub images
          try {
            await dispatch(getFinalDesignSubImages(selectedRequest.id)).unwrap();
            setFinalDesignS3Urls({}); // Clear để fetch lại
          } catch (error) {
            console.log("No final design sub images or error fetching:", error);
          }

          // Clear final design main S3 URL để fetch lại
          setFinalDesignMainS3Url(null);
        } catch (error) {
          console.error("Error fetching demo:", error);
          setLatestDemo(null);
          setS3ImageUrls({});
          setMainDemoS3Url(null);
        }
      }
    };
    fetchLatestDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDialog, selectedRequest]);

  // Fetch S3 URLs cho sub-images khi demoSubImages thay đổi
  useEffect(() => {
    const fetchS3Urls = async () => {
      if (demoSubImages && demoSubImages.length > 0) {
        const newS3Urls = {};
        for (const subImage of demoSubImages) {
          if (subImage.imageUrl && !s3ImageUrls[subImage.id]) {
            try {
              const result = await dispatch(
                fetchImageFromS3(subImage.imageUrl)
              ).unwrap();
              newS3Urls[subImage.id] = result.url;
            } catch (error) {
              console.error(
                "Error fetching S3 image:",
                subImage.imageUrl,
                error
              );
            }
          }
        }
        if (Object.keys(newS3Urls).length > 0) {
          setS3ImageUrls((prev) => ({ ...prev, ...newS3Urls }));
        }
      }
    };
    fetchS3Urls();
  }, [demoSubImages, dispatch, s3ImageUrls]);

  // Fetch S3 URL cho demo chính khi latestDemo thay đổi
  useEffect(() => {
    const fetchMainDemoS3Url = async () => {
      if (latestDemo && latestDemo.demoImage && !mainDemoS3Url) {
        try {
          const result = await dispatch(
            fetchImageFromS3(latestDemo.demoImage)
          ).unwrap();
          setMainDemoS3Url(result.url);
        } catch (error) {
          console.error(
            "Error fetching main demo S3 image:",
            latestDemo.demoImage,
            error
          );
        }
      }
    };
    fetchMainDemoS3Url();
  }, [latestDemo, dispatch, mainDemoS3Url]);

  // Fetch S3 URLs cho final design sub images
  useEffect(() => {
    const fetchFinalDesignS3Urls = async () => {
      if (finalDesignSubImages && finalDesignSubImages.length > 0) {
        const newFinalDesignS3Urls = {};
        for (const subImage of finalDesignSubImages) {
          if (subImage.imageUrl && !finalDesignS3Urls[subImage.id]) {
            try {
              const result = await dispatch(
                fetchImageFromS3(subImage.imageUrl)
              ).unwrap();
              newFinalDesignS3Urls[subImage.id] = result.url;
            } catch (error) {
              console.error(
                "Error fetching final design S3 image:",
                subImage.imageUrl,
                error
              );
            }
          }
        }
        if (Object.keys(newFinalDesignS3Urls).length > 0) {
          setFinalDesignS3Urls((prev) => ({ ...prev, ...newFinalDesignS3Urls }));
        }
      }
    };
    fetchFinalDesignS3Urls();
  }, [finalDesignSubImages, dispatch, finalDesignS3Urls]);

  // Fetch S3 URL cho final design main image
  useEffect(() => {
    const fetchFinalDesignMainS3Url = async () => {
      if (selectedRequest && selectedRequest.finalDesignImage && !finalDesignMainS3Url) {
        try {
          const result = await dispatch(
            fetchImageFromS3(selectedRequest.finalDesignImage)
          ).unwrap();
          setFinalDesignMainS3Url(result.url);
        } catch (error) {
          console.error(
            "Error fetching final design main S3 image:",
            selectedRequest.finalDesignImage,
            error
          );
        }
      }
    };
    fetchFinalDesignMainS3Url();
  }, [selectedRequest, dispatch, finalDesignMainS3Url]);

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, currentPage: value }));
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await dispatch(
        approveCustomDesignRequest({
          customDesignRequestId: selectedRequest.id,
        })
      ).unwrap();
      const newStatus = res.status || "PROCESSING";
      setNotification({
        open: true,
        message: `Chấp nhận task thành công! Trạng thái đơn: ${
          CUSTOM_DESIGN_STATUS_MAP[newStatus]?.label || newStatus
        }`,
        severity: "success",
      });
      setOpenDialog(false);
      // Reload danh sách
      dispatch(
        fetchDesignRequestsByDesigner({
          designerId,
          page: pagination.currentPage,
          size: pagination.pageSize,
        })
      )
        .unwrap()
        .then((res) => setRequests(res.result || []));
    } catch (err) {
      setNotification({
        open: true,
        message: err || "Chấp nhận task thất bại",
        severity: "error",
      });
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await dispatch(
        rejectCustomDesignRequest({ customDesignRequestId: selectedRequest.id })
      ).unwrap();
      const newStatus = res.status || "DESIGNER_REJECTED";
      setNotification({
        open: true,
        message: `Từ chối task thành công! Trạng thái đơn: ${
          CUSTOM_DESIGN_STATUS_MAP[newStatus]?.label || newStatus
        }`,
        severity: "success",
      });
      setOpenDialog(false);
      // Reload danh sách
      dispatch(
        fetchDesignRequestsByDesigner({
          designerId,
          page: pagination.currentPage,
          size: pagination.pageSize,
        })
      )
        .unwrap()
        .then((res) => setRequests(res.result || []));
    } catch (err) {
      setNotification({
        open: true,
        message: err || "Từ chối task thất bại",
        severity: "error",
      });
    }
    setActionLoading(false);
  };

  const handleOpenDemoDialog = async (isUpdate = false) => {
    setDemoForm({
      designerDescription: "",
      customDesignImage: null,
      subImages: [],
    });
    setDemoFormError("");
    setUpdateDemoMode(isUpdate);
    setOpenDemoDialog(true);
  };
  const handleCloseDemoDialog = () => {
    setOpenDemoDialog(false);
    setDemoFormError("");
  };
  const handleDemoFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "customDesignImage") {
      setDemoForm((f) => ({ ...f, customDesignImage: files[0] }));
    } else if (name === "subImages") {
      // Xử lý multiple files cho sub-images
      const selectedFiles = Array.from(files);
      setDemoForm((f) => ({ ...f, subImages: selectedFiles }));
    } else {
      setDemoForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Hàm xóa sub-image khỏi danh sách
  const handleRemoveSubImage = (index) => {
    setDemoForm((f) => ({
      ...f,
      subImages: f.subImages.filter((_, i) => i !== index),
    }));
  };

  const handleOpenFinalDesignDialog = () => {
    setFinalDesignForm({
      finalDesignImage: null,
      subFinalDesignImages: []
    });
    setFinalDesignError("");
    setOpenFinalDesignDialog(true);
  };
  const handleCloseFinalDesignDialog = () => {
    setOpenFinalDesignDialog(false);
    setFinalDesignError("");
  };

  // Hàm xóa sub-image khỏi danh sách final design
  const handleRemoveFinalDesignSubImage = (index) => {
    setFinalDesignForm((prev) => ({
      ...prev,
      subFinalDesignImages: prev.subFinalDesignImages.filter((_, i) => i !== index),
    }));
  };
  const handleSubmitFinalDesign = async () => {
    if (!finalDesignForm.finalDesignImage) {
      setFinalDesignError("Vui lòng chọn file thiết kế chính thức.");
      return;
    }
    setActionLoading(true);
    setFinalDesignError("");
    try {
      await dispatch(
        sendFinalDesignImage({
          customDesignRequestId: selectedRequest.id,
          finalDesignImage: finalDesignForm.finalDesignImage,
          subFinalDesignImages: finalDesignForm.subFinalDesignImages,
        })
      ).unwrap();
      setNotification({
        open: true,
        message: "Gửi bản thiết kế chính thức thành công!",
        severity: "success",
      });
      setOpenFinalDesignDialog(false);
      setOpenDialog(false);
      // Reload danh sách
      dispatch(
        fetchDesignRequestsByDesigner({
          designerId,
          page: pagination.currentPage,
          size: pagination.pageSize,
        })
      )
        .unwrap()
        .then((res) => setRequests(res.result || []));
    } catch (err) {
      setFinalDesignError(err || "Gửi bản thiết kế chính thức thất bại");
    }
    setActionLoading(false);
  };



  // Hàm mở image viewer
  const handleOpenImageViewer = (imageUrl, title) => {
    setImageViewer({
      open: true,
      imageUrl,
      title
    });
  };

  // Hàm đóng image viewer
  const handleCloseImageViewer = () => {
    setImageViewer({
      open: false,
      imageUrl: '',
      title: ''
    });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Yêu Cầu Thiết Kế Được Giao
      </Typography>
      {status === "loading" ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : requests.length === 0 ? (
        <Alert severity="info">Không có yêu cầu thiết kế nào được giao.</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell>STT</TableCell>
                  <TableCell>Yêu cầu</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request, idx) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      {(pagination.currentPage - 1) * pagination.pageSize +
                        idx +
                        1}
                    </TableCell>
                    <TableCell>{request.requirements}</TableCell>
                    <TableCell>
                      {new Date(request.createAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {customerDetails[
                        typeof request.customerDetail === "object" &&
                        request.customerDetail !== null
                          ? request.customerDetail.id
                          : request.customerDetail
                      ] || "Đang tải..."}
                    </TableCell>
                    <TableCell>
                      {request.totalPrice?.toLocaleString("vi-VN") || 0}₫
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => {
                          setSelectedRequest(request);
                          setOpenDialog(true);
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
      {/* Dialog hiển thị chi tiết yêu cầu */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: '#0F172A',
            color: 'white',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '1.25rem',
            py: 2.5,
            letterSpacing: '0.25px'
          }}
        >
          Chi tiết yêu cầu thiết kế
        </DialogTitle>
        <DialogContent sx={{ p: 0, maxHeight: '75vh', overflow: 'auto' }}>
          {selectedRequest && (
            <Box>
              {/* Demo Section */}
                {latestDemo && (
                <Card 
                  sx={{ 
                    m: 0, 
                    borderRadius: 0,
                    bgcolor: '#f8fafc',
                    border: 'none',
                    boxShadow: 'none',
                    borderBottom: '1px solid #e2e8f0'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box mb={3}>
                      <Typography 
                        variant="h5" 
                        fontWeight={600} 
                        color="#0F172A"
                        mb={1}
                        letterSpacing="-0.015em"
                      >
                        Demo Thiết Kế
                    </Typography>
                      <Typography variant="body2" color="#64748b" fontSize="0.95rem">
                        Bản thiết kế mẫu đã được gửi cho khách hàng
                    </Typography>
                    </Box>

                    <Box mb={3}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600} 
                        mb={1.5} 
                        color="#0F172A"
                        letterSpacing="-0.01em"
                      >
                        Mô tả thiết kế
                      </Typography>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          bgcolor: 'white',
                          borderRadius: 2,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <Typography variant="body2" lineHeight={1.6} color="#374151">
                          {latestDemo.designerDescription || "Chưa có mô tả chi tiết"}
                        </Typography>
                      </Paper>
                    </Box>

                    {/* Main Demo Image */}
                    {latestDemo.demoImage && (
                      <Box mb={4}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={600} 
                          mb={2} 
                          color="#0F172A"
                          letterSpacing="-0.01em"
                        >
                          Hình ảnh demo chính
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            display: 'inline-block',
                            borderRadius: 3,
                            bgcolor: 'white',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 20px -3px rgba(0, 0, 0, 0.15)',
                            }
                          }}
                          onClick={() => mainDemoS3Url && handleOpenImageViewer(mainDemoS3Url, 'Demo thiết kế chính')}
                        >
                        {mainDemoS3Url ? (
                          <img
                            src={mainDemoS3Url}
                              alt="Demo thiết kế"
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                maxHeight: 300,
                                borderRadius: 6,
                                objectFit: 'contain',
                                display: 'block'
                            }}
                            onError={(e) => {
                                console.error("Error loading main demo S3 image:", latestDemo.demoImage);
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                                width: 400,
                              height: 200,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                                bgcolor: "#f1f5f9",
                                borderRadius: 2,
                                border: "2px dashed #cbd5e1",
                              }}
                            >
                              <CircularProgress 
                                size={32} 
                                sx={{ color: '#0F172A' }}
                              />
                          </Box>
                        )}
                        </Paper>
                      </Box>
                    )}

                    {/* Sub Images */}
                    <Box>
                        <Typography
                        variant="subtitle1" 
                        fontWeight={600} 
                        mb={2} 
                        color="#0F172A"
                        letterSpacing="-0.01em"
                      >
                        Hình ảnh chi tiết
                        </Typography>
                      
                      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
                        {demoSubImages && Array.isArray(demoSubImages) && demoSubImages.length > 0 ? (
                        demoSubImages.map((img) => (
                            <Paper
                            key={img.id}
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'white',
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.2s ease-in-out',
                                cursor: 'pointer',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 20px -3px rgba(0, 0, 0, 0.15)',
                                }
                              }}
                              onClick={() => s3ImageUrls[img.id] && handleOpenImageViewer(s3ImageUrls[img.id], img.name || 'Hình ảnh chi tiết')}
                          >
                            {s3ImageUrls[img.id] ? (
                                <Tooltip 
                                  title={<FileInfoTooltip fileInfo={img} />}
                                  arrow
                                  placement="top"
                                >
                              <img
                                src={s3ImageUrls[img.id]}
                                    alt={img.name || "Chi tiết"}
                                style={{
                                      width: 100,
                                      height: 100,
                                  objectFit: "cover",
                                      borderRadius: 6,
                                }}
                                onError={(e) => {
                                      console.error("Error loading S3 image:", img.imageUrl);
                                  e.target.style.display = "none";
                                }}
                              />
                                </Tooltip>
                            ) : (
                              <Box
                                sx={{
                                    width: 100,
                                    height: 100,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                    bgcolor: "#f1f5f9",
                                    borderRadius: 1.5,
                                }}
                              >
                                  <CircularProgress 
                                    size={24} 
                                    sx={{ color: '#0F172A' }}
                                  />
                              </Box>
                            )}
                            </Paper>
                        ))
                      ) : (
                          <Typography variant="body2" color="#64748b" sx={{ fontStyle: 'italic' }}>
                          Chưa có hình ảnh chi tiết
                        </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Final Design Section */}
              {(selectedRequest?.finalDesignImage || (finalDesignSubImages && finalDesignSubImages.length > 0)) && (
                <Card 
                  sx={{ 
                    m: 0, 
                    borderRadius: 0,
                    bgcolor: '#fefce8',
                    border: 'none',
                    boxShadow: 'none',
                    borderBottom: '1px solid #e2e8f0'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box mb={3}>
                      <Typography 
                        variant="h5" 
                        fontWeight={600} 
                        color="#0F172A"
                        mb={1}
                        letterSpacing="-0.015em"
                      >
                        Thiết Kế Chính Thức
                      </Typography>
                      <Typography variant="body2" color="#64748b" fontSize="0.95rem">
                        Bản thiết kế chính thức đã hoàn thành
                      </Typography>
                    </Box>

                    {/* Final Design Main Image */}
                    {selectedRequest?.finalDesignImage && (
                      <Box mb={4}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={600} 
                          mb={2} 
                          color="#0F172A"
                          letterSpacing="-0.01em"
                        >
                          Hình ảnh thiết kế chính thức
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            display: 'inline-block',
                            borderRadius: 3,
                            bgcolor: 'white',
                            border: '1px solid #fbbf24',
                            boxShadow: '0 2px 4px -1px rgba(251, 191, 36, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 20px -3px rgba(251, 191, 36, 0.3)',
                              borderColor: '#f59e0b'
                            }
                          }}
                          onClick={() => finalDesignMainS3Url && handleOpenImageViewer(finalDesignMainS3Url, 'Thiết kế chính thức')}
                        >
                          {finalDesignMainS3Url ? (
                            <img
                              src={finalDesignMainS3Url}
                              alt="Thiết kế chính thức"
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                                maxHeight: 300,
                                borderRadius: 6,
                                objectFit: 'contain',
                                display: 'block'
                              }}
                              onError={(e) => {
                                console.error("Error loading final design main S3 image:", selectedRequest.finalDesignImage);
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 400,
                                height: 200,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "#fef3c7",
                                borderRadius: 2,
                                border: "2px dashed #fbbf24",
                              }}
                            >
                              <CircularProgress 
                                size={32} 
                                sx={{ color: '#f59e0b' }}
                              />
                            </Box>
                          )}
                        </Paper>
                            </Box>
                    )}

                    {/* Final Design Sub Images */}
                    {finalDesignSubImages && finalDesignSubImages.length > 0 && (
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={600} 
                          mb={2} 
                          color="#0F172A"
                          letterSpacing="-0.01em"
                        >
                          Hình ảnh chi tiết thiết kế
                        </Typography>
                        
                        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
                          {finalDesignSubImages.map((img) => (
                            <Paper
                              key={img.id}
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'white',
                                border: '1px solid #fbbf24',
                                transition: 'all 0.2s ease-in-out',
                                cursor: 'pointer',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 20px -3px rgba(251, 191, 36, 0.3)',
                                  borderColor: '#f59e0b'
                                }
                              }}
                              onClick={() => finalDesignS3Urls[img.id] && handleOpenImageViewer(finalDesignS3Urls[img.id], img.name || 'Thiết kế chi tiết')}
                            >
                              {finalDesignS3Urls[img.id] ? (
                                <Tooltip 
                                  title={<FileInfoTooltip fileInfo={img} />}
                                  arrow
                                  placement="top"
                                >
                                  <img
                                    src={finalDesignS3Urls[img.id]}
                                    alt={img.name || "Thiết kế chi tiết"}
                                    style={{
                                      width: 100,
                                      height: 100,
                                      objectFit: "cover",
                                      borderRadius: 6,
                                    }}
                                    onError={(e) => {
                                      console.error("Error loading final design S3 image:", img.imageUrl);
                                      e.target.style.display = "none";
                                    }}
                                  />
                                </Tooltip>
                              ) : (
                                <Box
                                  sx={{
                                    width: 100,
                                    height: 100,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "#fef3c7",
                                    borderRadius: 1.5,
                                  }}
                                >
                                  <CircularProgress 
                                    size={24} 
                                    sx={{ color: '#f59e0b' }}
                                  />
                        </Box>
                      )}
                            </Paper>
                          ))}
                    </Box>
                  </Box>
                )}
                  </CardContent>
                </Card>
              )}

              <Grid container spacing={0}>
                {/* Business Information Section */}
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      borderRadius: 0,
                      borderRight: { md: '1px solid #e2e8f0' },
                      bgcolor: 'white'
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box mb={3}>
                        <Typography 
                          variant="h6" 
                          fontWeight={600} 
                          color="#0F172A"
                          mb={1}
                          letterSpacing="-0.015em"
                        >
                          Thông Tin Khách Hàng
                </Typography>
                        <Typography variant="body2" color="#64748b" fontSize="0.9rem">
                          Chi tiết yêu cầu và thông tin doanh nghiệp
                        </Typography>
                      </Box>

                      <Stack spacing={3}>
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            fontWeight={600} 
                            color="#0F172A" 
                            mb={1.5}
                            letterSpacing="-0.01em"
                          >
                            Yêu cầu thiết kế
                          </Typography>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 3, 
                              bgcolor: '#f8fafc',
                              borderRadius: 2,
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <Typography variant="body2" lineHeight={1.6} color="#374151">
                              {selectedRequest.requirements}
                            </Typography>
                          </Paper>
                        </Box>

                        <Box>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600} 
                            color="#0F172A" 
                            mb={2}
                            letterSpacing="-0.015em"
                          >
                            Doanh nghiệp
                          </Typography>
                          <Typography variant="h5" color="#0F172A" fontWeight={700}>
                  {customerDetails[
                    typeof selectedRequest.customerDetail === "object" &&
                    selectedRequest.customerDetail !== null
                      ? selectedRequest.customerDetail.id
                      : selectedRequest.customerDetail
                  ] || "Đang tải..."}
                </Typography>
                        </Box>

                        <Box>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600} 
                            color="#0F172A" 
                            mb={2}
                            letterSpacing="-0.015em"
                          >
                            Ngày tạo
                </Typography>
                          <Typography variant="body1" color="#374151" fontSize="1.1rem">
                            {new Date(selectedRequest.createAt).toLocaleDateString("vi-VN")}
                </Typography>
                        </Box>

                        <Box>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600} 
                            color="#0F172A" 
                            mb={2}
                            letterSpacing="-0.015em"
                          >
                            Trạng thái
                </Typography>
                  <Chip
                    label={
                      CUSTOM_DESIGN_STATUS_MAP[selectedRequest.status]?.label ||
                      selectedRequest.status
                    }
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              px: 3,
                              py: 2,
                              height: 'auto',
                              borderRadius: 2,
                              bgcolor: '#059669',
                              color: 'white',
                              '&:hover': {
                                bgcolor: '#1e293b'
                              }
                            }}
                  />
                </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Pricing Information Section */}
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      borderRadius: 0,
                      bgcolor: 'white'
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box mb={3}>
                        <Typography 
                          variant="h6" 
                          fontWeight={600} 
                          color="#0F172A"
                          mb={1}
                          letterSpacing="-0.015em"
                        >
                          Thông Tin Báo Giá
                        </Typography>
                        <Typography variant="body2" color="#64748b" fontSize="0.9rem">
                          Chi tiết thanh toán và giá cả
                        </Typography>
                      </Box>

                      <Stack spacing={3}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 4, 
                            bgcolor: '#0F172A',
                            color: 'white',
                            borderRadius: 3
                          }}
                        >
                          <Typography variant="body2" sx={{ opacity: 0.8, mb: 1.5 }}>
                            Tổng giá trị đơn hàng
                          </Typography>
                          <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
                            {selectedRequest.totalPrice?.toLocaleString("vi-VN") || 0}₫
                          </Typography>
                        </Paper>

                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Paper 
                              elevation={0}
                              sx={{ 
                                p: 4, 
                                bgcolor: '#f0fdf4',
                                borderRadius: 3,
                                border: '1px solid #bbf7d0'
                              }}
                            >
                              <Typography 
                                variant="subtitle1" 
                                color="#166534" 
                                fontWeight={600} 
                                mb={2}
                                letterSpacing="-0.015em"
                              >
                                Đã đặt cọc
                              </Typography>
                              <Typography variant="h5" color="#15803d" fontWeight={700}>
                                {selectedRequest.depositAmount?.toLocaleString("vi-VN") || 0}₫
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6}>
                            <Paper 
                              elevation={0}
                              sx={{ 
                                p: 4, 
                                bgcolor: '#fefce8',
                                borderRadius: 3,
                                border: '1px solid #fde047'
                              }}
                            >
                              <Typography 
                                variant="subtitle1" 
                                color="#a16207" 
                                fontWeight={600} 
                                mb={2}
                                letterSpacing="-0.015em"
                              >
                                Còn lại
                              </Typography>
                              <Typography variant="h5" color="#ca8a04" fontWeight={700}>
                                {selectedRequest.remainingAmount?.toLocaleString("vi-VN") || 0}₫
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Product Details Section */}
                {selectedRequest.customerChoiceHistories && (
                <Card sx={{ borderRadius: 0, borderTop: '1px solid #e2e8f0', bgcolor: 'white' }}>
                  <CardContent sx={{ p: 6 }}>
                    <Box mb={4}>
                      <Typography 
                        variant="h4" 
                        fontWeight={700} 
                        color="#0F172A"
                        mb={1}
                        letterSpacing="-0.025em"
                      >
                        Chi Tiết Sản Phẩm
                      </Typography>
                      <Typography variant="body1" color="#64748b" fontSize="1.1rem">
                        Thông tin kỹ thuật và lựa chọn của khách hàng
                      </Typography>
                    </Box>

                    <Grid container spacing={6}>
                      <Grid item xs={12} md={4}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 6, 
                            borderRadius: 4,
                            border: '1px solid #e2e8f0',
                            bgcolor: '#f8fafc'
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            fontWeight={600} 
                            color="#0F172A" 
                            mb={3}
                            letterSpacing="-0.015em"
                          >
                            Thông Tin Sản Phẩm
                          </Typography>
                          <Stack spacing={3}>
                            <Box>
                              <Typography 
                                variant="body2" 
                                color="#64748b" 
                                fontWeight={600} 
                                mb={1}
                                textTransform="uppercase" 
                                letterSpacing="0.05em"
                              >
                                Loại sản phẩm
                              </Typography>
                              <Typography variant="h6" fontWeight={700} color="#0F172A">
                      {selectedRequest.customerChoiceHistories.productTypeName}
                    </Typography>
                            </Box>
                            <Box>
                              <Typography 
                                variant="body2" 
                                color="#64748b" 
                                fontWeight={600} 
                                mb={1}
                                textTransform="uppercase" 
                                letterSpacing="0.05em"
                              >
                                Công thức tính
                              </Typography>
                              <Typography variant="body1" color="#374151">
                      {selectedRequest.customerChoiceHistories.calculateFormula}
                    </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Stack spacing={4}>
                          {/* Attributes Table */}
                          <Box>
                            <Typography 
                              variant="h6" 
                              fontWeight={600} 
                              mb={3} 
                              color="#0F172A"
                              letterSpacing="-0.015em"
                            >
                              Thuộc Tính Đã Chọn
                    </Typography>
                    <TableContainer
                      component={Paper}
                              elevation={0}
                              sx={{ 
                                borderRadius: 4,
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              <Table>
                                <TableHead sx={{ bgcolor: '#0F172A' }}>
                          <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>
                                      Thuộc tính
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>
                                      Giá trị
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>
                                      Đơn vị
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>
                                      Đơn giá
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>
                                      Thành tiền
                                    </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedRequest.customerChoiceHistories.attributeSelections?.map(
                            (attr, idx) => (
                                      <TableRow 
                                        key={idx}
                                        sx={{ 
                                          '&:nth-of-type(odd)': { bgcolor: '#f8fafc' },
                                          '&:hover': { bgcolor: '#f1f5f9' },
                                          borderBottom: '1px solid #e2e8f0'
                                        }}
                                      >
                                        <TableCell sx={{ py: 3, fontSize: '0.95rem', color: '#374151' }}>
                                          {attr.attribute}
                                </TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 3, fontSize: '0.95rem', color: '#0F172A' }}>
                                          {attr.value}
                                        </TableCell>
                                        <TableCell sx={{ py: 3, fontSize: '0.95rem', color: '#64748b' }}>
                                          {attr.unit}
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 3, fontSize: '0.95rem', color: '#374151' }}>
                                          {attr.unitPrice?.toLocaleString("vi-VN") || 0}₫
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, py: 3, fontSize: '0.95rem', color: '#0F172A' }}>
                                  {attr.subTotal?.toLocaleString("vi-VN") || 0}₫
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                          </Box>

                          {/* Sizes Table */}
                          <Box>
                            <Typography 
                              variant="h6" 
                              fontWeight={600} 
                              mb={3} 
                              color="#0F172A"
                              letterSpacing="-0.015em"
                            >
                              Kích Thước Đã Chọn
                    </Typography>
                    <TableContainer
                      component={Paper}
                              elevation={0}
                              sx={{ 
                                borderRadius: 4,
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              <Table>
                                <TableHead sx={{ bgcolor: '#0F172A' }}>
                          <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>
                                      Kích thước
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>
                                      Giá trị
                                    </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedRequest.customerChoiceHistories.sizeSelections?.map(
                            (size, idx) => (
                                      <TableRow 
                                        key={idx}
                                        sx={{ 
                                          '&:nth-of-type(odd)': { bgcolor: '#f8fafc' },
                                          '&:hover': { bgcolor: '#f1f5f9' },
                                          borderBottom: '1px solid #e2e8f0'
                                        }}
                                      >
                                        <TableCell sx={{ py: 3, fontSize: '0.95rem', color: '#374151' }}>
                                          {size.size}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 3, fontSize: '0.95rem', color: '#0F172A' }}>
                                          {size.value}
                                        </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Action Button for Revision */}
              {selectedRequest && selectedRequest.status === "REVISION_REQUESTED" && (
                <Box sx={{ p: 6, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button
                      variant="contained"
                    size="large"
                      onClick={() => handleOpenDemoDialog(false)}
                    sx={{ 
                      px: 6,
                      py: 2,
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      bgcolor: '#0F172A',
                      color: 'white',
                      letterSpacing: '-0.015em',
                      '&:hover': {
                        bgcolor: '#1e293b',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Gửi lại demo
                    </Button>
                </Box>
                  )}
            </Box>
          )}
        </DialogContent>
        <DialogActions 
          sx={{ 
            p: 4, 
            bgcolor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            gap: 3,
            justifyContent: 'space-between'
          }}
        >
          <Button 
            onClick={() => setOpenDialog(false)} 
            disabled={actionLoading}
            variant="outlined"
            sx={{ 
              borderRadius: 4,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#0F172A',
                color: '#0F172A',
                bgcolor: 'white'
              }
            }}
          >
            Đóng
          </Button>

          <Stack direction="row" spacing={3}>
          {selectedRequest && selectedRequest.status === "PROCESSING" && (
            <Button
              variant="contained"
              onClick={() => handleOpenDemoDialog(false)}
              disabled={actionLoading}
                sx={{ 
                  borderRadius: 4,
                  px: 6,
                  py: 2,
                  fontWeight: 700,
                  fontSize: '1rem',
                  bgcolor: '#0F172A',
                  color: 'white',
                  letterSpacing: '-0.015em',
                  '&:hover': {
                    bgcolor: '#1e293b',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Gửi Demo
            </Button>
          )}
            
          {selectedRequest && selectedRequest.status === "DEMO_SUBMITTED" && (
            <Button
              variant="contained"
              onClick={() => handleOpenDemoDialog(true)}
              disabled={actionLoading}
                sx={{ 
                  borderRadius: 4,
                  px: 6,
                  py: 2,
                  fontWeight: 700,
                  fontSize: '1rem',
                  bgcolor: '#f59e0b',
                  color: 'white',
                  letterSpacing: '-0.015em',
                  '&:hover': {
                    bgcolor: '#d97706',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Cập nhật Demo
            </Button>
          )}
            
          {selectedRequest && selectedRequest.status === "FULLY_PAID" && (
            <Button
              variant="contained"
              onClick={handleOpenFinalDesignDialog}
              disabled={actionLoading}
                sx={{ 
                  borderRadius: 4,
                  px: 6,
                  py: 2,
                  fontWeight: 700,
                  fontSize: '1rem',
                  bgcolor: '#059669',
                  color: 'white',
                  letterSpacing: '-0.015em',
                  '&:hover': {
                    bgcolor: '#047857',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Gửi Bản Thiết Kế Chính Thức
            </Button>
          )}
            
          {selectedRequest &&
            ![
              "PROCESSING",
              "DEMO_SUBMITTED",
              "FULLY_PAID",
              "REVISION_REQUESTED",
            ].includes(selectedRequest.status) && (
              <>
                <Button
                  variant="contained"
                  onClick={handleApprove}
                  disabled={actionLoading}
                    sx={{ 
                      borderRadius: 4,
                      px: 6,
                      py: 2,
                      fontWeight: 700,
                      fontSize: '1rem',
                      bgcolor: '#059669',
                      color: 'white',
                      letterSpacing: '-0.015em',
                      '&:hover': {
                        bgcolor: '#047857',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                >
                  {actionLoading ? "Đang xử lý..." : "Chấp nhận"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReject}
                  disabled={actionLoading}
                    sx={{ 
                      borderRadius: 4,
                      px: 6,
                      py: 2,
                      fontWeight: 700,
                      fontSize: '1rem',
                      borderColor: '#dc2626',
                      color: '#dc2626',
                      letterSpacing: '-0.015em',
                      '&:hover': {
                        bgcolor: '#dc2626',
                        color: 'white',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                >
                  {actionLoading ? "Đang xử lý..." : "Từ chối"}
                </Button>
              </>
            )}
          </Stack>
        </DialogActions>
      </Dialog>
      {/* Dialog gửi/cập nhật/gửi lại demo */}
      <Dialog
        open={openDemoDialog}
        onClose={handleCloseDemoDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {updateDemoMode === "revision"
            ? "Gửi lại demo thiết kế"
            : updateDemoMode
            ? "Cập nhật demo thiết kế"
            : "Gửi demo thiết kế"}
        </DialogTitle>
        <DialogContent>
          {/* Gửi lại demo: luôn có cả mô tả và file */}
          <TextField
            label="Mô tả demo"
            name="designerDescription"
            value={demoForm.designerDescription}
            onChange={handleDemoFormChange}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            required
          />

          {/* Ảnh demo chính */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Ảnh demo chính *
          </Typography>

          {/* Dropzone cho ảnh chính */}
          <Box
            {...mainImageDropzone.getRootProps()}
            sx={{
              border: "2px dashed #1976d2",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: mainImageDropzone.isDragActive
                ? "#e3f2fd"
                : "transparent",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#e3f2fd" },
              mb: 2,
            }}
          >
            <input {...mainImageDropzone.getInputProps()} />
            {demoForm.customDesignImage ? (
              <Box>
                <img
                  src={URL.createObjectURL(demoForm.customDesignImage)}
                  alt="Main demo"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {demoForm.customDesignImage.name}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDemoForm((prev) => ({
                      ...prev,
                      customDesignImage: null,
                    }));
                  }}
                  sx={{ mt: 1 }}
                >
                  Xóa ảnh
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" color="primary">
                  {mainImageDropzone.isDragActive
                    ? "Thả ảnh vào đây..."
                    : "Kéo thả ảnh hoặc click để chọn"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, BMP, WEBP)
                </Typography>
              </Box>
            )}
          </Box>

          {/* Hình ảnh chi tiết Demo */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Hình ảnh chi tiết Demo
          </Typography>

          {/* Dropzone cho sub-images */}
          <Box
            {...subImagesDropzone.getRootProps()}
            sx={{
              border: "2px dashed #1976d2",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: subImagesDropzone.isDragActive
                ? "#e3f2fd"
                : "transparent",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#e3f2fd" },
              mb: 2,
            }}
          >
            <input {...subImagesDropzone.getInputProps()} />
            <Typography variant="body1" color="primary">
              {subImagesDropzone.isDragActive
                ? "Thả ảnh vào đây..."
                : "Kéo thả nhiều ảnh hoặc click để chọn"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Có thể chọn nhiều ảnh cùng lúc
            </Typography>
          </Box>

          {/* Hiển thị danh sách sub-images đã chọn */}
          {demoForm.subImages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Đã chọn {demoForm.subImages.length} ảnh chi tiết:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {demoForm.subImages.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      p: 0.5,
                      bgcolor: "white",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Sub image ${index + 1}`}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "error.main",
                        color: "white",
                        "&:hover": { bgcolor: "error.dark" },
                        width: 24,
                        height: 24,
                      }}
                      onClick={() => handleRemoveSubImage(index)}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {demoFormError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {demoFormError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDemoDialog} disabled={actionLoading}>
            Hủy
          </Button>
          <Button
            onClick={async () => {
              // Gửi demo (kể cả gửi lại): luôn gọi createDemoDesign
              if (
                !demoForm.designerDescription ||
                !demoForm.customDesignImage
              ) {
                setDemoFormError("Vui lòng nhập mô tả và chọn ảnh demo.");
                return;
              }
              setActionLoading(true);
              setDemoFormError("");
              try {
                const formData = new FormData();
                formData.append(
                  "designerDescription",
                  demoForm.designerDescription
                );
                formData.append(
                  "customDesignImage",
                  demoForm.customDesignImage
                );

                // Tạo demo trước
                const demoResult = await dispatch(
                  createDemoDesign({
                    customDesignRequestId: selectedRequest.id,
                    data: formData,
                  })
                ).unwrap();

                // Nếu có sub-images, upload chúng
                if (demoForm.subImages.length > 0 && demoResult.id) {
                  await dispatch(
                    uploadDemoSubImages({
                      customDesignId: demoResult.id,
                      files: demoForm.subImages,
                    })
                  ).unwrap();
                }

                setNotification({
                  open: true,
                  message:
                    updateDemoMode === "revision"
                      ? "Gửi lại demo thành công!"
                      : "Gửi demo thành công!",
                  severity: "success",
                });
                setOpenDemoDialog(false);
                setOpenDialog(false);

                // Reload danh sách và fetch lại demo mới nhất
                const reloadResult = await dispatch(
                  fetchDesignRequestsByDesigner({
                    designerId,
                    page: pagination.currentPage,
                    size: pagination.pageSize,
                  })
                ).unwrap();
                setRequests(reloadResult.result || []);

                // Fetch lại demo mới nhất và sub-images
                if (selectedRequest) {
                  const demoResult = await dispatch(
                    getDemoDesigns(selectedRequest.id)
                  ).unwrap();
                  if (demoResult && demoResult.length > 0) {
                    const latestDemo = demoResult[demoResult.length - 1];
                    setLatestDemo(latestDemo);
                    // Fetch sub-images cho demo mới nhất
                    await dispatch(getDemoSubImages(latestDemo.id)).unwrap();
                    // Clear S3 URLs để fetch lại
                    setS3ImageUrls({});
                    setMainDemoS3Url(null);
                  }
                }
              } catch (err) {
                setDemoFormError(
                  err?.message ||
                    (typeof err === "string" ? err : "Gửi demo thất bại")
                );
              }
              setActionLoading(false);
            }}
            variant="contained"
            color="primary"
            disabled={actionLoading}
          >
            {actionLoading
              ? updateDemoMode === "revision"
                ? "Đang gửi lại..."
                : updateDemoMode
                ? "Đang cập nhật..."
                : "Đang gửi..."
              : updateDemoMode === "revision"
              ? "GỬI LẠI DEMO"
              : updateDemoMode
              ? "CẬP NHẬT DEMO"
              : "GỬI DEMO"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog gửi bản thiết kế chính thức */}
      <Dialog
        open={openFinalDesignDialog}
        onClose={handleCloseFinalDesignDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Gửi bản thiết kế chính thức</DialogTitle>
        <DialogContent>
          {/* Ảnh thiết kế chính thức chính */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Ảnh thiết kế chính thức *
          </Typography>

          {/* Dropzone cho ảnh chính */}
          <Box
            {...finalDesignMainDropzone.getRootProps()}
            sx={{
              border: "2px dashed #059669",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: finalDesignMainDropzone.isDragActive
                ? "#ecfdf5"
                : "transparent",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#ecfdf5" },
              mb: 2,
            }}
          >
            <input {...finalDesignMainDropzone.getInputProps()} />
            {finalDesignForm.finalDesignImage ? (
              <Box>
                <img
                  src={URL.createObjectURL(finalDesignForm.finalDesignImage)}
                  alt="Final design"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                />
            <Typography variant="body2" sx={{ mt: 1 }}>
                  {finalDesignForm.finalDesignImage.name}
            </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFinalDesignForm((prev) => ({
                      ...prev,
                      finalDesignImage: null,
                    }));
                  }}
                  sx={{ mt: 1 }}
                >
                  Xóa ảnh
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" color="primary">
                  {finalDesignMainDropzone.isDragActive
                    ? "Thả ảnh vào đây..."
                    : "Kéo thả ảnh hoặc click để chọn"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, BMP, WEBP)
                </Typography>
              </Box>
            )}
          </Box>

          {/* Hình ảnh chi tiết thiết kế chính thức */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Hình ảnh chi tiết thiết kế (tùy chọn)
          </Typography>

          {/* Dropzone cho sub-images */}
          <Box
            {...finalDesignSubDropzone.getRootProps()}
            sx={{
              border: "2px dashed #059669",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: finalDesignSubDropzone.isDragActive
                ? "#ecfdf5"
                : "transparent",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#ecfdf5" },
              mb: 2,
            }}
          >
            <input {...finalDesignSubDropzone.getInputProps()} />
            <Typography variant="body1" color="primary">
              {finalDesignSubDropzone.isDragActive
                ? "Thả ảnh vào đây..."
                : "Kéo thả nhiều ảnh hoặc click để chọn"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Có thể chọn nhiều ảnh cùng lúc
            </Typography>
          </Box>

          {/* Hiển thị danh sách sub-images đã chọn */}
          {finalDesignForm.subFinalDesignImages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Đã chọn {finalDesignForm.subFinalDesignImages.length} ảnh chi tiết:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {finalDesignForm.subFinalDesignImages.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      p: 0.5,
                      bgcolor: "white",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Sub image ${index + 1}`}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "error.main",
                        color: "white",
                        "&:hover": { bgcolor: "error.dark" },
                        width: 24,
                        height: 24,
                      }}
                      onClick={() => handleRemoveFinalDesignSubImage(index)}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {finalDesignError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {finalDesignError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseFinalDesignDialog}
            disabled={actionLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitFinalDesign}
            variant="contained"
            color="primary"
            disabled={actionLoading}
          >
            {actionLoading ? "Đang gửi..." : "GỬI"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Image Viewer Dialog */}
      <Dialog
        open={imageViewer.open}
        onClose={handleCloseImageViewer}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
            maxWidth: '95vw',
            maxHeight: '95vh'
          }
        }}
      >
        <Backdrop
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            zIndex: -1
          }}
          open={imageViewer.open}
          onClick={handleCloseImageViewer}
        />
        <DialogContent 
          sx={{ 
            p: 0, 
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh'
          }}
        >
          {imageViewer.title && (
            <Typography 
              variant="h6" 
              color="white" 
              mb={2} 
              textAlign="center"
              sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              {imageViewer.title}
            </Typography>
          )}
          {imageViewer.imageUrl && (
            <Box
              component="img"
              src={imageViewer.imageUrl}
              alt={imageViewer.title}
              sx={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                cursor: 'zoom-in',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Có thể thêm zoom functionality ở đây
              }}
            />
          )}
          <Typography 
            variant="body2" 
            color="rgba(255,255,255,0.7)" 
            mt={2}
            textAlign="center"
            sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            Click bên ngoài để đóng
          </Typography>
        </DialogContent>
      </Dialog>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((n) => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification((n) => ({ ...n, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DesignRequests;
